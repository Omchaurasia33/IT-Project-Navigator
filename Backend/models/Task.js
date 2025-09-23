// models/Task.js
const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['To Do', 'In Progress', 'Done', 'Canceled'],
      default: 'To Do',
    },
    assignee: {
      type: String,
      required: true,
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium',
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    avatar: {
      type: String,
      default: '',
    },
    comments: {
      type: Number,
      default: 0,
    },
    subtasks: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Task', taskSchema);
