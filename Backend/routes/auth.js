const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

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
 *             required: [name, email, password]
 *             properties:
 *               name: { type: string }
 *               email: { type: string }
 *               password: { type: string }
 *               tenantSlug: { type: string, description: "Join an existing tenant" }
 *               tenantName: { type: string, description: "Create a new tenant if tenantSlug is not provided" }
 *     responses:
 *       201:
 *         description: User created and JWT returned
 */
router.post('/signup', authController.signup);

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

module.exports = router;
