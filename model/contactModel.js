const mongoose = require('mongoose');
const validator = require('validator');

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'To contact user must have name'],
  },
  email: {
    type: String,
    required: [true, 'To contact user must enter email'],
    validate: [validator.isEmail, 'Must be a email'],
  },
  message: {
    type: String,
    required: [true, 'Must enter a message'],
    trim: true,
    lowercase: true,
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Id must belong to user'],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

const Contact = mongoose.model('Contact', contactSchema);

module.exports = Contact;
