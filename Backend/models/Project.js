const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: false,  // ✅ Changed to optional
      trim: true,
      default: '',      // ✅ Added default
    },
    managerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assignee',
      required: false,  // ✅ Changed to optional (for unassigned projects)
    },
    startDate: {
      type: Date,
      required: false,  // ✅ Changed to optional
    },
    endDate: {
      type: Date,
      required: false,  // ✅ Changed to optional
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium',
    },
    assigneeIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Assignee',
      },
    ],
    tasks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task',
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;