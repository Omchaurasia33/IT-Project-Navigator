const Tenant = require('../models/Tenant');

// @desc    Get current tenant's billing information
// @route   GET /billing
// @access  Protected
exports.getBillingInfo = async (req, res) => {
  try {
    const tenant = await Tenant.findById(req.tenantId);
    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found' });
    }
    res.json({
      plan: tenant.plan,
      subscriptionStatus: tenant.subscriptionStatus,
      trialEndsAt: tenant.trialEndsAt,
      subscriptionEndsAt: tenant.subscriptionEndsAt,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    "Upgrade" to a paid plan (dummy endpoint)
// @route   POST /billing/upgrade
// @access  Protected
exports.upgradePlan = async (req, res) => {
  try {
    const { duration } = req.body; // duration in days (e.g., 30 or 60)
    if (![30, 60].includes(duration)) {
      return res.status(400).json({ message: 'Invalid plan duration.' });
    }

    const tenant = await Tenant.findById(req.tenantId);
    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found' });
    }

    const subscriptionEndsAt = new Date();
    subscriptionEndsAt.setDate(subscriptionEndsAt.getDate() + duration);

    tenant.plan = duration === 30 ? 'monthly' : 'pro';
    tenant.subscriptionStatus = 'active';
    tenant.subscriptionEndsAt = subscriptionEndsAt;
    
    await tenant.save();

    res.json({ message: 'Plan upgraded successfully', tenant });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
