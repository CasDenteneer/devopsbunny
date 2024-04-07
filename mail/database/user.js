const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    email: { type: String },
  });

module.exports = mongoose.model('User', userSchema);
