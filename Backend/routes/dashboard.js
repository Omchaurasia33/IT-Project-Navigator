const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Dashboard metrics
 */

/**
 * @swagger
 * /dashboard/summary:
 *   get:
 *     summary: Get dashboard summary metrics and chart data
 *     tags: [Dashboard]
 *     responses:
 *       200:
 *         description: Summary with totals and chart datasets
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totals:
 *                   type: object
 *                   properties:
 *                     projects: { type: number }
 *                     tasks: { type: number }
 *                     assignees: { type: number }
 *                     completedProjects: { type: number }
 *                 taskStatus:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name: { type: string }
 *                       value: { type: number }
 *                 tasksPerProject:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name: { type: string }
 *                       tasks: { type: number }
 *                 assigneeWorkload:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name: { type: string }
 *                       tasks: { type: number }
 */
router.get('/summary', dashboardController.getSummary);

module.exports = router;
