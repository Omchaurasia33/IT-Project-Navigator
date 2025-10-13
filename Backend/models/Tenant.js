const mongoose = require('mongoose');

const tenantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },
    plan: {
      type: String,
      default: 'free',
    },
    subscriptionStatus: {
      type: String,
      default: 'trialing',
    },
    trialEndsAt: {
      type: Date,
    },
    subscriptionEndsAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Tenant', tenantSchema);
