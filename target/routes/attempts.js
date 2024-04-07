// attempts.js
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

// Route for uploading an attempt
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const { targetId, participantId } = req.body;

    // Check if the target exists
    const target = await Target.findById(targetId);
    if (!target) {
      return res.status(404).json({ message: 'Target not found' });
    }

    // Check if there's a file uploaded
    if (!req.file) {
      return res.status(400).send('No file uploaded.');
    }

    // Create a new attempt document
    const attempt = new Attempt({
      target: targetId,
      participantId,
      image: req.file.filename // Save the filename of the uploaded image
    });

    // Save the attempt to the database
    await attempt.save();

    const json = {
      targetId: targetId,
      participantId: participantId,
      image: req.file.filename,
      id: attempt._id
    };

    messagebroker.publish('attempt.uploaded', json);

    res.status(201).json({ message: 'Attempt uploaded successfully.', attempt });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Route for retrieving all attempts
router.get('/all', async (req, res) => {
  try {
    const attempts = await Attempt.find();
    res.json(attempts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Route for getting all attempts for a specific target
router.get('/target/:targetId', async (req, res) => {
  try {
    const targetId = req.params.targetId;

    // Check if the target exists
    const target = await Target.findById(targetId);
    if (!target) {
      return res.status(404).json({ message: 'Target not found' });
    }
    
    const attempts = await Attempt.find({ target: targetId });
    res.json(attempts);
    } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
    }
}
);

module.exports = router;
