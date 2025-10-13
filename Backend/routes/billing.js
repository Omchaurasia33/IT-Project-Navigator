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
 * /billing:
 *   get:
 *     summary: Get billing information for the current tenant
 *     tags: [Billing]
 *     responses:
 *       200:
 *         description: Billing information
 */
router.get('/', billingController.getBillingInfo);

/**
 * @swagger
 * /billing/upgrade:
 *   post:
 *     summary: Upgrade to a paid plan (dummy endpoint)
 *     tags: [Billing]
 *     responses:
 *       200:
 *         description: Plan upgraded successfully
 */
router.post('/upgrade', billingController.upgradePlan);

module.exports = router;
