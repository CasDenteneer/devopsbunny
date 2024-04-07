const mongoose = require('mongoose');

const attemptSchema = new mongoose.Schema({
target: { type: mongoose.Schema.Types.ObjectId, ref: 'Target', required: true },
  participantId: { type: String, required: true }, 
  image: { type: String, required: true },
  score: { type: Number },
  submittedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Attempt', attemptSchema);