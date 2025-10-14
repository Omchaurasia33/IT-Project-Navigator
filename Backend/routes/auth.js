const express = require('express');
const router = express.Router();
const passport = require('passport');
const authController = require('../controllers/authController');
const requireAuth = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication
 */

/**
 * @swagger
 * /auth/signup:
 *   post:
 *     summary: Sign up a new user and create or join a tenant
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password, tenantName]
 *             properties:
 *               name: { type: string }
 *               email: { type: string }
 *               password: { type: string }
 *               tenantName: { type: string, description: "Create a new tenant" }
 *     responses:
 *       201:
 *         description: User created and JWT returned
 */
router.post('/signup', authController.signup);

/**
 * @swagger
 * /auth/verify-otp:
 *   post:
 *     summary: Verify OTP sent to email
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, otp]
 *             properties:
 *               email: { type: string }
 *               otp: { type: string }
 *     responses:
 *       200:
 *         description: OTP verified and JWT returned
 */
router.post('/verify-otp', authController.verifyOtp);

/**
 * @swagger
 * /auth/resend-otp:
 *   post:
 *     summary: Resend OTP to email
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email: { type: string }
 *     responses:
 *       200:
 *         description: New OTP sent
 */
router.post('/resend-otp', authController.resendOtp);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login and receive a JWT
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, tenantSlug]
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *               tenantSlug: { type: string }
 *     responses:
 *       200:
 *         description: JWT and user info returned
 */
router.post('/login', authController.login);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Log out the current user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully logged out
 */
router.post('/logout', authController.logout);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get the current authenticated user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user data returned
 *       401:
 *         description: Not authorized
 */
router.get('/me', requireAuth, authController.getMe);

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/login', session: false }), (req, res) => {
  console.log('Google callback successful. User from passport:', req.user);
  const token = authController.signToken(req.user);
  console.log('Generated JWT:', token);
  res.redirect(`http://localhost:3001/auth/callback?token=${token}`);
});

module.exports = router;
