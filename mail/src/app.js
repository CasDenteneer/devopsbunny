require('dotenv').config()
const express = require('express')

const connectDB = require('../database/db');

connectDB();

var MailerService = require('./mailer');

var mailer = new MailerService();


const app = express()
const PORT = process.env.PORT


app.listen(PORT, () => {
  console.info(`App listening on port ${PORT}`)
})