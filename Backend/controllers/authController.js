const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Tenant = require('../models/Tenant');

function toSlug(name) {
  return String(name || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

function signToken(user) {
  const payload = { sub: String(user._id), tenant: String(user.tenant), role: user.role };
  const secret = process.env.JWT_SECRET || 'dev_secret';
  const expiresIn = process.env.JWT_EXPIRES_IN || '1d';
  return jwt.sign(payload, secret, { expiresIn });
}

// POST /auth/signup
// Body: { name, email, password, tenantSlug? , tenantName? }
exports.signup = async (req, res) => {
  try {
    const { name, email, password, tenantName } = req.body || {};

    if (!name || !email || !password || !tenantName) {
      return res.status(400).json({ message: 'name, email, password and tenantName are required' });
    }

    let tenant = null;
    const slug = toSlug(tenantName);
    const existing = await Tenant.findOne({ slug });
    if (existing) return res.status(400).json({ message: 'Tenant name already exists' });
    tenant = await Tenant.create({ name: tenantName, slug });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email: email.toLowerCase().trim(), passwordHash, tenant: tenant._id });

    const token = signToken(user);
    return res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, tenant: tenant.slug, role: user.role },
    });
  } catch (err) {
    if (err && err.code === 11000) {
      return res.status(409).json({ message: 'Email already registered for this tenant' });
    }
    return res.status(500).json({ message: err.message || 'Signup failed' });
  }
};

// POST /auth/login
// Body: { email, password, tenantSlug }
exports.login = async (req, res) => {
  try {
    const { email, password, tenantSlug } = req.body || {};
    if (!email || !password || !tenantSlug) {
      return res.status(400).json({ message: 'email, password, and tenantSlug are required' });
    }

    const tenant = await Tenant.findOne({ slug: tenantSlug.toLowerCase() });
    if (!tenant) return res.status(400).json({ message: 'Tenant not found' });

    const user = await User.findOne({ email: email.toLowerCase().trim(), tenant: tenant._id });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

    const token = signToken(user);
    return res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, tenant: tenant.slug, role: user.role },
    });
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Login failed' });
  }
};

// POST /auth/logout
exports.logout = async (req, res) => {
  // In a stateful application, you would invalidate the token here.
  // For this stateless JWT setup, the client is responsible for destroying the token.
  res.status(200).json({ message: 'Successfully logged out' });
};
