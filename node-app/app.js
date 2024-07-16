

const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const crypto= require("crypto");
const {Buffer} = require("buffer");
require('dotenv').config()

const app = express();
app.use(bodyParser.json());
app.use(cookieParser());

// const HYDRA_PUBLIC_URL = 'https://localhost:5444';
// const CLIENT_ID = 'node-app';
// const CLIENT_SECRET = 'some-secret';
// const REDIRECT_URI = 'http://127.0.0.1:9010/callback';

function generateRandomString(length) {
    return crypto.randomBytes(length).toString('hex').substring(0, length);
  }
app.get('/', (req, res) => {
  res.send('<a href="/login">Login with Hydra</a>');
});

app.get('/login', async (req, res) => {
  try {
    const HYDRA_PUBLIC_URL = process.env.HYDRA_PUBLIC_URL;
    const CLIENT_ID = process.env.CLIENT_ID;
    const REDIRECT_URI = process.env.REDIRECT_URI;

    const state = generateRandomString(16); 
    // Start the OAuth2 flow
    const authorizationUrl = `${HYDRA_PUBLIC_URL}/oauth2/auth?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=offline users.write users.read users.edit users.delete&state=${state}`;
    console.log(authorizationUrl);
    res.redirect(authorizationUrl);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).send('An error occurred while redirecting to login.');
  }
});
async function generatePKCES256() {
  const array = new Uint8Array(64)
  crypto.getRandomValues(array)
  const codeVerifier = Buffer.from(array).toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_")
  const CLIENT_ID = process.env.CLIENT_ID;

  const codeChallenge = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(CLIENT_ID)).then((buffer) => {
    return Buffer.from(buffer).toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_")
  })

  return { codeChallenge, codeVerifier }
}
app.get('/callback2', async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).send('No code in the callback URL');
  }

  try {
    // Exchange the authorization code for tokens
    
    const basicAuth = btoa(encodeURI(CLIENT_ID)+":"+encodeURI(CLIENT_SECRET))
    const basicAuth2 = btoa(encodeURI(CLIENT_ID+":"+CLIENT_SECRET));
    const encodedClientId = encodeURIComponent(CLIENT_ID);
    const encodedClientSecret = encodeURIComponent(CLIENT_SECRET);
    
    // Combine and Base64 encode
  const combinedString = `${encodedClientId}:${encodedClientSecret}`;
    
  const base64EncodedString = Buffer.from(encodeURIComponent(combinedString)).toString('base64');

    const tokenResponse = await axios.post(`${HYDRA_PUBLIC_URL}/oauth2/token?grant_type=authorization_code&code=${code}&redirect_uri=${REDIRECT_URI}`, new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: REDIRECT_URI,
      // refresh_token:'',
      // client_id:CLIENT_ID,
      // code_verifier:"123",
      // client_secret:CLIENT_SECRET
      
    }), {
      "Content-Type":"application/x-www-form-urlencoded",
      'authorization': "Basic "+basicAuth ,
      

    });

    const { access_token, id_token } = tokenResponse.data;

    // Use the tokens as needed in your application
    res.cookie('access_token', access_token, { httpOnly: true });
    res.cookie('id_token', id_token, { httpOnly: true });

    res.send('Login successful! You can now access protected resources.');
  } catch (error) {
    console.error('Callback error:', error);
    res.status(500).send('An error occurred during the callback processing.');
  }
});

app.get("/callback",async (req,res,next)=>{

const { codeChallenge, codeVerifier } = await generatePKCES256()
const REDIRECT_URI = process.env.REDIRECT_URI
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const basicAuth = btoa(encodeURI(CLIENT_ID)+":"+encodeURI(CLIENT_SECRET))
const HYDRA_PUBLIC_URL = process.env.HYDRA_PUBLIC_URL;

// Send the code challenge along with the authorization request
const authorizationUrl = `${HYDRA_PUBLIC_URL}/oauth2/auth?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&code_challenge=${codeChallenge}&code_challenge_method=S256`


// Exchange the authorization code for a token using the code verifier
 const { code } = req.query;
 if(!code){
  console.log("not code");
  return;
 }

const tokenUrl = `${HYDRA_PUBLIC_URL}/oauth2/token`;
const tokenRequestBody = new URLSearchParams({
  grant_type: "authorization_code",
  client_id: CLIENT_ID,
  // client_secret: CLIENT_SECRET,
  redirect_uri: REDIRECT_URI,
  // code_verifier: codeVerifier,
  code: code,
})
fetch(tokenUrl, {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded", "Authorization":`Basic ${basicAuth}` },
  body: tokenRequestBody.toString(),
})
  .then((response) => response.json())
  .then((tokenResponse) => {
    console.log(tokenResponse)
    const { access_token, id_token } = tokenResponse;

    // Use the tokens as needed in your application
    res.cookie('access_token', access_token, { httpOnly: true });
    res.cookie('id_token', id_token, { httpOnly: true });

    res.send('Login successful! You can now access protected resources.');
  })
  .catch((error) => console.error(error))


});



app.get("/token",async (req,res,next)=>{

const CLIENT_ID = process.env.CLIENT_ID;
const  CLIENT_SECRET = process.env.CLIENT_SECRET;
const HYDRA_PUBLIC_URL = process.env.HYDRA_PUBLIC_URL;

const basicAuth = btoa(encodeURI(CLIENT_ID)+":"+encodeURI(CLIENT_SECRET))

const tokenUrl = `${HYDRA_PUBLIC_URL}/oauth2/token`;
const tokenRequestBody = new URLSearchParams({
  grant_type: "refresh_token",
  client_id: CLIENT_ID,
  scope:"offline_access",
  refresh_token:'QOvm6ZsthhaRGfXXh8vLLQmwtrVYhmRpsAy6UXCD2Ws.qdolr86-LYYxrNPrRdAUdLHjA_b1QagTrKSGkXfock4',
  // client_secret: CLIENT_SECRET,
  // redirect_uri: redirectUri,
  // code_verifier: codeVerifier,
  // code: code,
})
fetch(tokenUrl, {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded", "Authorization":`Basic ${basicAuth}` },
  body: tokenRequestBody.toString(),
})
  .then((response) => response.json())
  .then((tokenResponse) => {
    res.send(tokenResponse);
  })
  .catch((error) => console.error(error))


});


app.get("/check",async (req,res,next)=>{



  const redirectUri = process.env.REDIRECT_URI
  const CLIENT_ID = process.env.CLIENT_ID;
  const CLIENT_SECRET = process.env.CLIENT_SECRET;
  const HYDRA_PUBLIC_URL = process.env.HYDRA_PUBLIC_URL;

  const basicAuth = btoa(encodeURI(CLIENT_ID)+":"+encodeURI(CLIENT_SECRET))
  
  const tokenUrl = `http://localhost:5445/oauth2/introspect`;
  console.log(tokenUrl);
  const tokenRequestBody = {
    // grant_type: "client_credentials",
    // client_id: CLIENT_ID,
    scope:"offline users.write users.read users.edit users.delete",
    token:'6_5EPLzeeddxzQfr2YVRPjh5uAP1G9S8UIcNOHn45mM.wDDcuUDTWWA5XHJpkTVGH_sLm7MGQMPqudzs6NoPqUk',
    // client_secret: CLIENT_SECRET,
    // redirect_uri: redirectUri,
    // code_verifier: codeVerifier,
    // code: code,
  }
  fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", 
    "Authorization":`Basic ${basicAuth}`, 
    // scope:"offline users.write users.read users.edit users.delete",
    // token:'6_5EPLzeeddxzQfr2YVRPjh5uAP1G9S8UIcNOHn45mM.wDDcuUDTWWA5XHJpkTVGH_sLm7MGQMPqudzs6NoPqUk',
    // client_id: CLIENT_ID,
    },
    body: tokenRequestBody.toString(),
  })
    .then((response) => response.json())
    .then((tokenResponse) => {
      res.send(tokenResponse);
    })
    .catch((error) => console.error(error))
  
  
  });

app.listen(9010, () => {
  console.log('Server started on http://localhost:9010');
});
