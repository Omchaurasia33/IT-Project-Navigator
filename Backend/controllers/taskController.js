// controllers/taskController.js
const Task = require('../models/Task');

// Helper: Recursively build task tree
async function buildTaskTree(parentId = null, filter = {}) {
  const tasks = await Task.find({ parentTask: parentId, ...filter }).lean();
  for (let task of tasks) {
    task.subtasks = await buildTaskTree(task._id, filter);
  }
  return tasks;
}

// Get all tasks as a tree (with optional filters)
exports.getTasks = async (req, res) => {
  try {
    const { status, assignee } = req.query;
    let filter = {};
    if (status && status !== 'all') {
      filter.status = status;
    }
    if (assignee && assignee !== 'all') {
      const assigneeMap = {
        'user-1': 'Alice',
        'user-2': 'Bob',
        'user-3': 'Charlie',
      };
      filter.assignee = assigneeMap[assignee] || assignee;
    }
    const tree = await buildTaskTree(null, filter);
    res.json(tree);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new task (root or subtask)
exports.createTask = async (req, res) => {
  try {
    const { parentTask, ...taskData } = req.body;
    const newTask = new Task({ ...taskData, parentTask: parentTask || null });
    const savedTask = await newTask.save();
    res.status(201).json(savedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a task
exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const updatedTask = await Task.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });
    if (updatedTask) {
      return res.json(updatedTask);
    }
    return res.status(404).json({ message: 'Task not found' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a task and all its subtasks recursively
async function deleteTaskAndSubtasks(taskId) {
  const subtasks = await Task.find({ parentTask: taskId });
  for (let sub of subtasks) {
    await deleteTaskAndSubtasks(sub._id);
  }
  await Task.findByIdAndDelete(taskId);
}

exports.deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    await deleteTaskAndSubtasks(task._id);
    res.json({ message: 'Task and its subtasks deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get progress stats (recursive)
exports.getProgress = async (req, res) => {
  try {
    const tree = await buildTaskTree();
    let total = 0;
    let completed = 0;
    function countTasks(tasks) {
      for (const task of tasks) {
        total++;
        if (task.status === 'Done') completed++;
        if (task.subtasks && task.subtasks.length > 0) {
          countTasks(task.subtasks);
        }
      }
    }
    countTasks(tree);
    const progressPercentage = total > 0 ? (completed / total) * 100 : 0;
    res.json({
      total,
      completed,
      progressPercentage,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
