const mongoose = require('mongoose');

const assigneeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  role: {
    type: String,
    required: true,
    trim: true
  }
}, {
  timestamps: true
});

const Assignee = mongoose.model('Assignee', assigneeSchema);

module.exports = Assignee;
