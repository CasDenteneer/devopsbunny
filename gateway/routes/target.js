// gateway-routes.js
require('dotenv').config();
const express = require('express');
const router = express.Router();
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');

const targetServiceURL = process.env.TARGET_SERVICE_URL;
const API_KEY = process.env.TARGET_API_KEY;


const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Route for uploading a target
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send('No file uploaded.');
    }

    console.log('File received:', req.file);
    console.log('Body:', req.body);
    console.log('Uploading file to target service');

    const { name, description, xcoord, ycoord, ownerId } = req.body;

    const formData = new FormData();
    formData.append('file', req.file.buffer, Date.now() + '-' + req.file.originalname);
    formData.append('name', name);
    formData.append('description', description);
    formData.append('xcoord', xcoord);
    formData.append('ycoord', ycoord);
    formData.append('ownerId', ownerId);
    formData.append('deadline', req.body.deadline);

    const response = await axios.post(`${targetServiceURL}/target/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        ...formData.getHeaders(),
        'x-api-key': API_KEY
      }
    });

    console.log('Response:', response.data);
    res.send(response.data);
  } catch (error) {
    console.error('Error:', error);
    if (error.response && error.response.data) {
      return res.status(error.response.status).send(error.response.data);
    }
    res.status(500).send('Internal Server Error');
  }
});

// Route for retrieving all targets from the target service
router.get('/all', async (req, res) => {
  try {
    const response = await axios.get(`${targetServiceURL}/target/all`, { headers: { 'x-api-key': API_KEY } });
    console.log('Response:', response.data);
    // in each item, add a new field called 'imageURL' that contains the full URL of the image
    response.data.forEach(target => {
      target.imageURL = `${targetServiceURL}/uploads/${target.targetImage}`;
    });
    res.send(response.data);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal Server Error');
  }
});

// route for getting a specific target
router.get('/:targetId', async (req, res) => {
  try {
    const response = await axios.get(`${targetServiceURL}/target/${req.params.targetId}`, { headers: { 'x-api-key': API_KEY } });
    console.log('Response:', response.data);
    // add a new field called 'imageURL' that contains the full URL of the image
    response.data.imageURL = `${targetServiceURL}/${response.data.targetImage}`;
    res.send(response.data);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal Server Error');
  }
});


module.exports = router;
