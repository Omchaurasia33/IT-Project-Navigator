const express = require('express');
const router = express.Router();
const billingController = require('../controllers/billingController');

/**
 * @swagger
 * tags:
 *   name: Billing
 *   description: Billing and subscription management
 */

/**
 * @swagger
 * /billing/key:
 *   get:
 *     summary: Get Razorpay Key ID
 *     tags: [Billing]
 *     responses:
 *       200:
 *         description: The Razorpay Key ID
 */
router.get('/key', billingController.getRazorpayKey);

/**
 * @swagger
 * /billing/create-order:
 *   post:
 *     summary: Create a Razorpay order
 *     tags: [Billing]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               duration: { type: number, example: 30 }
 *     responses:
 *       200:
 *         description: The created Razorpay order
 */
router.post('/create-order', billingController.createOrder);

/**
 * @swagger
 * /billing/verify-payment:
 *   post:
 *     summary: Verify a Razorpay payment and update subscription
 *     tags: [Billing]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               razorpay_order_id: { type: string }
 *               razorpay_payment_id: { type: string }
 *               razorpay_signature: { type: string }
 *               duration: { type: number }
 *     responses:
 *       200:
 *         description: Payment verification status
 */
router.post('/verify-payment', billingController.verifyPayment);

module.exports = router;