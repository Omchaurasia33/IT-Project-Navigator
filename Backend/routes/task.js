// routes/task.js
const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');

// GET /tasks — get all tasks with optional filters
router.get('/', taskController.getTasks);

// GET /tasks/progress — get progress stats
router.get('/progress', taskController.getProgress);

// POST /tasks — create new task (root or subtask)
router.post('/', taskController.createTask);

// PUT /tasks/:id — update task
router.put('/:id', taskController.updateTask);

// DELETE /tasks/:id — delete task
router.delete('/:id', taskController.deleteTask);

module.exports = router;
