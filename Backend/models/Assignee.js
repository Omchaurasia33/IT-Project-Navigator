const mongoose = require('mongoose');

const assigneeSchema = new mongoose.Schema(
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
    email: {
      type: String,
      required: true,
      trim: true,
      // Enforced unique per tenant
    },
    role: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

assigneeSchema.index({ email: 1, tenant: 1 }, { unique: true });

const Assignee = mongoose.model('Assignee', assigneeSchema);

module.exports = Assignee;
