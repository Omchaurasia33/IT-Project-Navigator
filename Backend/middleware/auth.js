const jwt = require('jsonwebtoken');
const Tenant = require('../models/Tenant');

// Middleware to verify JWT and set req.user and req.tenantId
module.exports = async function requireAuth(req, res, next) {
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) return res.status(401).json({ message: 'Missing Authorization token' });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
    req.user = { id: payload.sub, tenant: payload.tenant, role: payload.role };
    req.tenantId = payload.tenant;

    // Subscription check
    const tenant = await Tenant.findById(payload.tenant);
    if (!tenant) {
      return res.status(403).json({ message: 'Tenant not found.' });
    }

    const now = new Date();
    const isTrialing = tenant.subscriptionStatus === 'trialing' && tenant.trialEndsAt > now;
    const isActive = tenant.subscriptionStatus === 'active' && tenant.subscriptionEndsAt > now;

    // Allow access to billing pages even if subscription is inactive
    if (req.originalUrl.startsWith('/billing')) {
      return next();
    }

    if (!isTrialing && !isActive) {
      return res.status(403).json({ 
        message: 'Your subscription is inactive. Please upgrade your plan.', 
        subscriptionStatus: 'inactive' 
      });
    }

    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}
