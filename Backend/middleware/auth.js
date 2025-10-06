const jwt = require('jsonwebtoken');

// Middleware to verify JWT and set req.user and req.tenantId
module.exports = function requireAuth(req, res, next) {
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) return res.status(401).json({ message: 'Missing Authorization token' });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
    req.user = { id: payload.sub, tenant: payload.tenant, role: payload.role };
    req.tenantId = payload.tenant;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}
