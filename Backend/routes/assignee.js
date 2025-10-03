const express = require('express');
const router = express.Router();
const assigneeController = require('../controllers/assigneeController');

/**
 * @swagger
 * tags:
 *   name: Assignees
 *   description: Assignee management
 */

/**
 * @swagger
 * /assignees:
 *   post:
 *     summary: Create a new assignee
 *     tags: [Assignees]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Assignee'
 *     responses:
 *       201:
 *         description: The created assignee
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Assignee'
 *       400:
 *         description: Bad request
 */
router.post('/', assigneeController.createAssignee);

/**
 * @swagger
 * /assignees:
 *   get:
 *     summary: Get all assignees
 *     tags: [Assignees]
 *     responses:
 *       200:
 *         description: A list of assignees
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Assignee'
 */
router.get('/', assigneeController.getAssignees);

/**
 * @swagger
 * /assignees/{id}:
 *   get:
 *     summary: Get an assignee by ID
 *     tags: [Assignees]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The assignee ID
 *     responses:
 *       200:
 *         description: The assignee
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Assignee'
 *       404:
 *         description: Assignee not found
 */
router.get('/:id', assigneeController.getAssigneeById);

/**
 * @swagger
 * /assignees/{id}:
 *   put:
 *     summary: Update an assignee
 *     tags: [Assignees]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The assignee ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Assignee'
 *     responses:
 *       200:
 *         description: The updated assignee
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Assignee'
 *       404:
 *         description: Assignee not found
 *       400:
 *         description: Bad request
 */
router.put('/:id', assigneeController.updateAssignee);

/**
 * @swagger
 * /assignees/{id}:
 *   delete:
 *     summary: Delete an assignee
 *     tags: [Assignees]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The assignee ID
 *     responses:
 *       200:
 *         description: Assignee deleted
 *       404:
 *         description: Assignee not found
 */
router.delete('/:id', assigneeController.deleteAssignee);

module.exports = router;
