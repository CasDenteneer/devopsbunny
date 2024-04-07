// gateway/routes/users.js
require('dotenv').config();


var express = require('express');
var router = express.Router();
const MessageHandler = require('../messagebroker'); 
const axios = require('axios');


const roles = require('../services/authorisation');
const passport = require('passport');


// const passport = require('../services/passport');

const messageHandler = new MessageHandler();
messageHandler.initialize();

const targetServiceURL = process.env.REGISTER_SERVICE_URL;
console.log('Target service URL:', targetServiceURL);
const API_KEY = process.env.REGISTER_API_KEY;

// Gateway between user and the user register service
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/register', async (req, res) => {
  try {
    console.log('Registering user:', req.body);
    const response = await axios.post(`${targetServiceURL}/users/register`, req.body, { headers: { 'x-api-key': API_KEY } });
    res.json(response.data);
  } catch (error) {
    console.error('Error registering user:', error);
    if (error.response && error.response.data) {
      return res.status(error.response.status).json(error.response.data);
    }
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});


router.get('/all',  passport.authenticate('jwt', { session: false }), roles.can('admin') ,async (req, res) => {
  try {
    const response = await axios.get(`${targetServiceURL}/users/all`, { headers: { 'x-api-key': API_KEY } });
    res.json(response.data);
  } catch (error) {
    console.error('Error getting all users:', error);
    if (error.response && error.response.data) {
      return res.status(error.response.status).json(error.response.data);
    }
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

router.get('/:userId', passport.authenticate('jwt', { session: false }), roles.can('user'), async (req, res) => {
  try {
    const userId = req.params.userId;
    const response = await axios.get(`${targetServiceURL}/users/${userId}`, { headers: { 'x-api-key': API_KEY } });
    res.json(response.data);
  } catch (error) {
    console.error('Error getting user:', error);
    if (error.response && error.response.data) {
      return res.status(error.response.status).json(error.response.data);
    }
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

module.exports = router;
