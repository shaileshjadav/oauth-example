

const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const crypto= require("crypto");
const login = require('./login');
const consent = require("./consent");
const path = require("path");

const app = express();

app.set("views", path.join(__dirname, "views"))
app.set("view engine", "pug")

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser());

// const HYDRA_ADMIN_URL = 'https://ory-hydra-example--hydra:4445';
// const HYDRA_PUBLIC_URL = 'https://localhost:5444';
// const CLIENT_ID = 'node-app';
// const CLIENT_SECRET = 'some-secret';
// const REDIRECT_URI = 'http://127.0.0.1:9010/callback';

app.use("/login",login);
app.use("/consent",consent);

app.listen(9020, () => {
    console.log('Server started on http://localhost:9020');
  });
  
