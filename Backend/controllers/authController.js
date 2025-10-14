const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const Tenant = require('../models/Tenant');
const sendEmail = require('../utils/sendEmail');

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

    const slug = toSlug(tenantName);
    const existingTenant = await Tenant.findOne({ slug });
    if (existingTenant) return res.status(400).json({ message: 'Tenant name already exists' });

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser && existingUser.isVerified) {
        return res.status(409).json({ message: 'Email already registered' });
    }

    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 3);

    const tenant = await Tenant.create({ 
      name: tenantName, 
      slug, 
      trialEndsAt,
      subscriptionStatus: 'trialing' 
    });

    const passwordHash = await bcrypt.hash(password, 10);
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    let user;
    if (existingUser) {
        user = await User.findByIdAndUpdate(existingUser._id, {
            name,
            passwordHash,
            tenant: tenant._id,
            otp,
            otpExpires,
            isVerified: false
        }, { new: true });
    } else {
        user = await User.create({ 
            name, 
            email: email.toLowerCase().trim(), 
            passwordHash, 
            tenant: tenant._id, 
            otp, 
            otpExpires 
        });
    }

    await sendEmail({
      to: user.email,
      subject: 'Verify your email address',
      text: `Your OTP for verification is: ${otp}`,
    });

    return res.status(201).json({
      message: 'OTP sent to your email. Please verify.',
      email: user.email
    });
  } catch (err) {
    if (err && err.code === 11000) {
      return res.status(409).json({ message: 'Email already registered for this tenant' });
    }
    return res.status(500).json({ message: err.message || 'Signup failed' });
  }
};

// POST /auth/verify-otp
// Body: { email, otp }
exports.verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            return res.status(400).json({ message: 'Email and OTP are required' });
        }

        const user = await User.findOne({ 
            email: email.toLowerCase().trim(), 
            otp, 
            otpExpires: { $gt: Date.now() } 
        }).populate('tenant');

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        user.isVerified = true;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        const token = signToken(user);
        const tenant = user.tenant;

        return res.status(200).json({
            token,
            user: { 
                id: user._id, 
                name: user.name, 
                email: user.email, 
                role: user.role,
                tenant: { 
                  slug: tenant.slug, 
                  name: tenant.name,
                  plan: tenant.plan,
                  subscriptionStatus: tenant.subscriptionStatus,
                  trialEndsAt: tenant.trialEndsAt
                }
            },
        });

    } catch (err) {
        res.status(500).json({ message: err.message || 'OTP verification failed' });
    }
};

// POST /auth/resend-otp
// Body: { email }
exports.resendOtp = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        const user = await User.findOne({ email: email.toLowerCase().trim() });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.isVerified) {
            return res.status(400).json({ message: 'Email is already verified' });
        }

        const otp = crypto.randomInt(100000, 999999).toString();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        user.otp = otp;
        user.otpExpires = otpExpires;
        await user.save();

        await sendEmail({
            to: user.email,
            subject: 'Resend: Verify your email address',
            text: `Your new OTP for verification is: ${otp}`,
        });

        return res.status(200).json({ message: 'New OTP sent to your email.' });

    } catch (err) {
        res.status(500).json({ message: err.message || 'Failed to resend OTP' });
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

    if (!user.isVerified) {
        return res.status(401).json({ message: 'Email not verified. Please verify your email first.' });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

    const token = signToken(user);
    return res.json({
      token,
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role,
        tenant: { 
          slug: tenant.slug, 
          name: tenant.name,
          plan: tenant.plan,
          subscriptionStatus: tenant.subscriptionStatus,
          trialEndsAt: tenant.trialEndsAt
        }
      },
    });
  } catch (err) a{
    return res.status(500).json({ message: err.message || 'Login failed' });
  }
};

// POST /auth/logout
exports.logout = async (req, res) => {
  // In a stateful application, you would invalidate the token here.
  // For this stateless JWT setup, the client is responsible for destroying the token.
  res.status(200).json({ message: 'Successfully logged out' });
};