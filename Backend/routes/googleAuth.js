const express = require('express');
const passport = require('passport');
const router = express.Router();
const jwt = require('jsonwebtoken');

function signToken(user) {
  const payload = { sub: String(user._id), tenant: String(user.tenant), role: user.role };
  const secret = process.env.JWT_SECRET || 'dev_secret';
  const expiresIn = process.env.JWT_EXPIRES_IN || '1d';
  return jwt.sign(payload, secret, { expiresIn });
}

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/login', session: false }), (req, res) => {
  const token = signToken(req.user);
  res.redirect(`http://localhost:3000/auth/callback?token=${token}`);
});

module.exports = router;
