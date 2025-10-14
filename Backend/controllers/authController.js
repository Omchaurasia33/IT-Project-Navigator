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
// Body: { name, email, password, tenantName }
exports.signup = async (req, res) => {
  try {
    const { name, email, password, tenantName } = req.body || {};

    if (!name || !email || !password || !tenantName) {
      return res.status(400).json({ message: 'name, email, password and tenantName are required' });
    }

    const slug = toSlug(tenantName);
    const existingTenant = await Tenant.findOne({ slug });
    if (existingTenant) {
      return res.status(400).json({ message: 'Tenant name already exists' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser && existingUser.isVerified) {
      return res.status(409).json({ message: 'Email already registered and verified' });
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
      // Update existing unverified user
      user = await User.findByIdAndUpdate(existingUser._id, {
        name,
        passwordHash,
        tenant: tenant._id,
        otp,
        otpExpires,
        isVerified: false,
        role: 'admin' // First user in tenant is admin
      }, { new: true });
    } else {
      // Create new user
      user = await User.create({ 
        name, 
        email: email.toLowerCase().trim(), 
        passwordHash, 
        tenant: tenant._id,
        role: 'admin', // First user in tenant is admin
        otp, 
        otpExpires,
        isVerified: false
      });
    }

    await sendEmail({
      to: user.email,
      subject: 'Verify your email address',
      text: `Your OTP for verification is: ${otp}\n\nThis OTP will expire in 10 minutes.`,
      html: `
        <h2>Email Verification</h2>
        <p>Your OTP for verification is:</p>
        <h1 style="color: #4CAF50; font-size: 32px; letter-spacing: 5px;">${otp}</h1>
        <p>This OTP will expire in 10 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `
    });

    return res.status(201).json({
      message: 'Account created successfully. OTP sent to your email. Please verify.',
      email: user.email,
      requiresVerification: true
    });
  } catch (err) {
    console.error('Signup error:', err);
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
      otp: otp.toString(), 
      otpExpires: { $gt: Date.now() } 
    }).populate('tenant');

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Mark user as verified and clear OTP
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    const token = signToken(user);
    const tenant = user.tenant;

    return res.status(200).json({
      message: 'Email verified successfully',
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
    console.error('OTP verification error:', err);
    return res.status(500).json({ message: err.message || 'OTP verification failed' });
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

    // Check if we should rate limit (optional)
    if (user.otpExpires && user.otpExpires > Date.now()) {
      const remainingTime = Math.ceil((user.otpExpires - Date.now()) / 1000 / 60);
      return res.status(429).json({ 
        message: `Please wait ${remainingTime} minutes before requesting a new OTP` 
      });
    }

    // Generate new OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    await sendEmail({
      to: user.email,
      subject: 'Resend: Verify your email address',
      text: `Your new OTP for verification is: ${otp}\n\nThis OTP will expire in 10 minutes.`,
      html: `
        <h2>Email Verification - New OTP</h2>
        <p>Your new OTP for verification is:</p>
        <h1 style="color: #4CAF50; font-size: 32px; letter-spacing: 5px;">${otp}</h1>
        <p>This OTP will expire in 10 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `
    });

    return res.status(200).json({ 
      message: 'New OTP sent to your email.',
      email: user.email 
    });

  } catch (err) {
    console.error('Resend OTP error:', err);
    return res.status(500).json({ message: err.message || 'Failed to resend OTP' });
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
    if (!tenant) {
      return res.status(400).json({ message: 'Tenant not found' });
    }

    const user = await User.findOne({ 
      email: email.toLowerCase().trim(), 
      tenant: tenant._id 
    });
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!user.isVerified) {
      // Generate and send new OTP if the old one expired
      if (!user.otp || !user.otpExpires || user.otpExpires < Date.now()) {
        const otp = crypto.randomInt(100000, 999999).toString();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000);
        
        user.otp = otp;
        user.otpExpires = otpExpires;
        await user.save();

        await sendEmail({
          to: user.email,
          subject: 'Verify your email address',
          text: `Your OTP for verification is: ${otp}\n\nThis OTP will expire in 10 minutes.`,
          html: `
            <h2>Email Verification Required</h2>
            <p>Your OTP for verification is:</p>
            <h1 style="color: #4CAF50; font-size: 32px; letter-spacing: 5px;">${otp}</h1>
            <p>This OTP will expire in 10 minutes.</p>
          `
        });
      }
      
      return res.status(401).json({ 
        message: 'Email not verified. Please check your email for the OTP.',
        requiresVerification: true,
        email: user.email
      });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = signToken(user);
    
    return res.json({
      message: 'Login successful',
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
  } catch (err) { // FIXED: Removed the typo 'a' here
    console.error('Login error:', err);
    return res.status(500).json({ message: err.message || 'Login failed' });
  }
};

// POST /auth/logout
exports.logout = async (req, res) => {
  // In a stateful application, you would invalidate the token here.
  // For this stateless JWT setup, the client is responsible for destroying the token.
  res.status(200).json({ message: 'Successfully logged out' });
};

// POST /auth/forgot-password
// Body: { email, tenantSlug }
exports.forgotPassword = async (req, res) => {
  try {
    const { email, tenantSlug } = req.body;
    
    if (!email || !tenantSlug) {
      return res.status(400).json({ message: 'Email and tenantSlug are required' });
    }

    const tenant = await Tenant.findOne({ slug: tenantSlug.toLowerCase() });
    if (!tenant) {
      return res.status(400).json({ message: 'Tenant not found' });
    }

    const user = await User.findOne({ 
      email: email.toLowerCase().trim(), 
      tenant: tenant._id 
    });
    
    if (!user) {
      // Don't reveal if user exists or not for security
      return res.status(200).json({ 
        message: 'If an account exists with this email, you will receive a password reset OTP.' 
      });
    }

    // Generate password reset OTP
    const resetOtp = crypto.randomInt(100000, 999999).toString();
    const resetOtpExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    user.passwordResetOtp = resetOtp;
    user.passwordResetOtpExpires = resetOtpExpires;
    await user.save();

    await sendEmail({
      to: user.email,
      subject: 'Password Reset Request',
      text: `Your password reset OTP is: ${resetOtp}\n\nThis OTP will expire in 15 minutes.`,
      html: `
        <h2>Password Reset Request</h2>
        <p>Your password reset OTP is:</p>
        <h1 style="color: #FF5722; font-size: 32px; letter-spacing: 5px;">${resetOtp}</h1>
        <p>This OTP will expire in 15 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `
    });

    return res.status(200).json({ 
      message: 'If an account exists with this email, you will receive a password reset OTP.',
      email: user.email // Only include in dev, remove in production
    });

  } catch (err) {
    console.error('Forgot password error:', err);
    return res.status(500).json({ message: 'Failed to process password reset request' });
  }
};

// POST /auth/reset-password
// Body: { email, otp, newPassword, tenantSlug }
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword, tenantSlug } = req.body;
    
    if (!email || !otp || !newPassword || !tenantSlug) {
      return res.status(400).json({ 
        message: 'Email, OTP, new password, and tenantSlug are required' 
      });
    }

    const tenant = await Tenant.findOne({ slug: tenantSlug.toLowerCase() });
    if (!tenant) {
      return res.status(400).json({ message: 'Tenant not found' });
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
      tenant: tenant._id,
      passwordResetOtp: otp.toString(),
      passwordResetOtpExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Update password
    const passwordHash = await bcrypt.hash(newPassword, 10);
    user.passwordHash = passwordHash;
    user.passwordResetOtp = undefined;
    user.passwordResetOtpExpires = undefined;
    await user.save();

    return res.status(200).json({ 
      message: 'Password reset successfully. You can now login with your new password.' 
    });

  } catch (err) {
    console.error('Reset password error:', err);
    return res.status(500).json({ message: 'Failed to reset password' });
  }
};

module.exports = exports;