const mongoose = require('mongoose');

const targetSchema = new mongoose.Schema({
  location: {
    type: {
      type: String,
      enum: ['Point'], 
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  ownerId: { type: String, required: true }, 
  targetImage : { type: String, required: true }
});

// Index for geospatial queries based on location
targetSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Target', targetSchema);