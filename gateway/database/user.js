const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin', 'competitionmaker'], default: 'user' }, 
    email: { type: String },
  });

module.exports = mongoose.model('User', userSchema);
