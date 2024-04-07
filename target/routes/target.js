// routes.js
require('dotenv').config();
const express = require('express');
const router = express.Router();
const Target = require('../database/target');
const Attempt = require('../database/attempt');
const MessageHandler = require('../messagebroker');

const messagebroker = new MessageHandler();

const multer  = require('multer');
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage });

function validateApiKey(req, res, next) {
  const apiKey = req.headers['x-api-key'];
  const expectedApiKey = process.env.API_KEY;
  if(!apiKey) {
    return res.status(401).json({ success: false, error: 'Unauthorized access to endpoint. You did not include an api key.' });
  }
  if (apiKey !== expectedApiKey) {
    return res.status(401).json({ success: false, error: 'Unauthorized access to endpoint. The api key you provided was wrong.'});
  }
  next();
}

// Route for uploading a target
router.post('/upload', validateApiKey, upload.single('file'), async (req, res) => {
  try {
    console.log('Received target:', req.body);
    const { name, description, xcoord, ycoord, ownerId } = req.body;

    const location = {
      type: 'Point',
      coordinates: [xcoord, ycoord]
    };

    const targetImage = req.file.path;

    console.log('Received target:', name, description, location, ownerId, targetImage);

    // Create a new target document
    const target = new Target({
      name,
      description,
      location,
      ownerId,
      targetImage
    });

    // Save the target to the database
    await target.save();

    // Send a message to the message broker
    // make a json combining the target and the orginal body
    const json = {
      ...target.toJSON(),
      ...req.body
    };

    // convert to string
    const ajson = JSON.stringify(json);

    messagebroker.publish('target.uploaded', ajson);
    messagebroker.publish('target.startclock', ajson);

    res.status(201).json({ message: 'Target uploaded successfully.', target});
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

// Route for uploading an attempt
router.post('/attempts/upload', validateApiKey, async (req, res) => {
  try {
    const { targetId, participantId, image } = req.body;

    // Create a new attempt document
    const attempt = new Attempt({
      target: targetId,
      participantId,
      image
    });

    // Save the attempt to the database
    await attempt.save();

    res.status(201).json({ message: 'Attempt uploaded successfully.', attempt });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Route for retrieving all targets
router.get('/all', validateApiKey, async (req, res) => {
  try {
    const targets = await Target.find();
    res.json(targets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Route for retrieving all attempts
router.get('/attempts/all', validateApiKey, async (req, res) => {
  try {
    const attempts = await Attempt.find();
    res.json(attempts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Route for getting a specific target
router.get('/:targetId', validateApiKey, async (req, res) => {
  try {
    const target = await Target.findById(req.params.targetId);
    if (!target) {
      return res.status(404).json({ message: 'Target not found' });
    }
    res.json(target);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
