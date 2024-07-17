

const express = require('express');

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
require('dotenv').config()

const login = require('./login');
const consent = require("./consent");
const path = require("path");


const app = express();

app.set("views", path.join(__dirname, "views"))
app.set("view engine", "pug")

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser());


app.use("/login",login);
app.use("/consent",consent);

app.listen(9020, () => {
    console.log('Server started on http://localhost:9020');
  });
  
