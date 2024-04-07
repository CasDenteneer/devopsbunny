var express = require('express');
var router = express.Router();
const User = require('../database/user');
const bcrypt = require('bcrypt');
const MessageHandler = require('../messagebroker');

require('dotenv').config();
const key = process.env.API_KEY;

messageHandler = new MessageHandler();

function validateApiKey(req, res, next) {
  const apiKey = req.headers['x-api-key'];
  const expectedApiKey = key;
  if (!apiKey || apiKey !== expectedApiKey) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }
  next();
}

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/register', validateApiKey,  async (req, res) => {
  try {
    // check the header for the api key, make sure it matches
    // if (req.headers['api-key'] !== key) {
    //   return res.status(401).json({ success: false, error: 'Unauthorized access to endpoint' });
    // }

    console.log('Registering user:', req.body);
    const { username, email, password, role } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'Username or email already exists' });
    }


    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role
    });

    await newUser.save();

    messageHandler.publish('user_registered', { username, email, role: newUser.role, hashedpass: hashedPassword });
    messageHandler.publish('send_welcome_user_mail', { username, email, role: newUser.role, id: newUser.id});
    res.status(201).json({ success: true, message: 'User registered successfully', userId: newUser.id});
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

// get all users
router.get('/all', validateApiKey, async (req, res) => {
  try {
    // if (req.headers['api-key'] !== key) {
    //   return res.status(401).json({ success: false, error: 'Unauthorized access to endpoint' });
    // }
    const users = await User.find();
    res.json(users);
  } catch (error) {
    console.error('Error getting all users:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

// get a specific user
router.get('/:userId', validateApiKey, async (req, res) => {
  try {
    // if (req.headers['api-key'] !== key) {
    //   return res.status(401).json({ success: false, error: 'Unauthorized access to endpoint' });
    // }
    const userId = req.params.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

module.exports = router;
