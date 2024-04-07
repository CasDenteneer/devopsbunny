const mongoose = require('mongoose');

const targetSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
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
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  targetImage : { type: String, required: true }
});

// Index for geospatial queries based on location
targetSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Target', targetSchema);