

const express = require('express');

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const crypto= require("crypto");

require('dotenv').config()

const app = express();
app.use(bodyParser.json());
app.use(cookieParser());


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
    /**
     * The state parameter is used to protect against XSRF. 
     * Your application generates a random string and sends it to the authorization server using the state parameter. 
     * The authorization server sends back the state parameter. If both state are the same => OK. If state parameters are different, someone else has initiated the request.
    */
    const state = generateRandomString(16); 
    // Start the OAuth2 flow
    const authorizationUrl = `${HYDRA_PUBLIC_URL}/oauth2/auth?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=offline users.write users.read users.edit users.delete&state=${state}`;
    
    res.redirect(authorizationUrl);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).send('An error occurred while redirecting to login.');
  }
});

app.get("/callback",async (req,res,next)=>{

// const { codeChallenge, codeVerifier } = await generatePKCES256()
const REDIRECT_URI = process.env.REDIRECT_URI
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const basicAuth = btoa(encodeURI(CLIENT_ID)+":"+encodeURI(CLIENT_SECRET))
const HYDRA_PUBLIC_URL = process.env.HYDRA_PUBLIC_URL;

// Exchange the authorization code for a token using the code verifier
 const { code } = req.query;
 if(!code){
  console.log("not code");
  return;
 }

const tokenUrl = `${process.env.HYDRA_AUTH_API_URL}/oauth2/token`;

console.log("toen URL", tokenUrl);
const tokenRequestBody = new URLSearchParams({
  grant_type: "authorization_code",
  client_id: CLIENT_ID,
  redirect_uri: REDIRECT_URI,
  code: code,
})
fetch(tokenUrl, {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded", "Authorization":`Basic ${basicAuth}` },
  body: tokenRequestBody.toString(),
})
  .then((response) => response.json())
  .then((tokenResponse) => {
    
    const { access_token, id_token, refresh_token } = tokenResponse;
    console.log(tokenResponse);
    // Use the tokens as needed in your application
    res.cookie('access_token', access_token, { httpOnly: true });
    res.cookie('refresh_token', refresh_token, { httpOnly: true });
    res.cookie('id_token', id_token, { httpOnly: true });

    res.send('Login successful! You can now access protected resources. <br/> <br/>'+ JSON.stringify(tokenResponse));
  })
  .catch((error) => console.error(error))


});


// route for get new token by using refresh token
app.get("/token",async (req,res,next)=>{

const CLIENT_ID = process.env.CLIENT_ID;
const  CLIENT_SECRET = process.env.CLIENT_SECRET;
const HYDRA_AUTH_API_URL = process.env.HYDRA_AUTH_API_URL;

const basicAuth = btoa(encodeURI(CLIENT_ID)+":"+encodeURI(CLIENT_SECRET))
const {refreshToken} = req.query;
const tokenUrl = `${HYDRA_AUTH_API_URL}/oauth2/token`;
const tokenRequestBody = new URLSearchParams({
  grant_type: "refresh_token",
  client_id: CLIENT_ID,
  scope:"offline_access",
  refresh_token:refreshToken,
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


app.listen(9010, () => {
  console.log('Server started on http://localhost:9010');
});
