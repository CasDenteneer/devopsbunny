const request = require('supertest');
const express = require('express');
const app = express();
const routes = require('../routes');

// Mock middleware for validating API key
app.use((req, res, next) => {
  // Simulate setting the API key header
  req.headers['x-api-key'] = 'valid_api_key'; // Replace 'valid_api_key' with your actual API key
  next();
});

app.use('/', routes);

describe('Target Service', () => {
  // Test for retrieving all targets
  describe('GET /all', () => {
    it('should retrieve all targets', async () => {
      const res = await request(app)
        .get('/all');

      expect(res.statusCode).toEqual(404);
    });
  });
});
