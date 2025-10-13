const express = require('express');
const router = express.Router();
const tenantController = require('../controllers/tenantController');

/**
 * @swagger
 * tags:
 *   name: Tenants
 *   description: Tenant management
 */

/**
 * @swagger
 * /tenants:
 *   get:
 *     summary: Get all tenants
 *     tags: [Tenants]
 *     responses:
 *       200:
 *         description: A list of tenants
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   name: { type: string }
 *                   slug: { type: string }
 */
router.get('/', tenantController.getAllTenants);

module.exports = router;
