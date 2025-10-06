// controllers/taskController.js
const Task = require('../models/Task');
const Project = require('../models/Project');
const mongoose = require('mongoose');

// Helper: Recursively build task tree (tenant-aware)
async function buildTaskTree(parentId = null, filter = {}) {
  const tasks = await Task.find({ parentTask: parentId, ...filter }).lean();
  for (let task of tasks) {
    task.subtasks = await buildTaskTree(task._id, filter);
  }
  return tasks;
}

// Get all tasks as a tree (tenant-aware, with optional filters)
exports.getTasks = async (req, res) => {
  try {
    const { status, projectId } = req.query;
    let filter = { tenant: req.tenantId };
    if (status && status !== 'all') {
      filter.status = status;
    }
    if (projectId) {
      filter.project = projectId;
    }
    const tree = await buildTaskTree(null, filter);
    res.json(tree);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single task by ID with shaped response (tenant-aware)
exports.getTaskById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid task ID' });
    }
    const task = await Task.findOne({ _id: id, tenant: req.tenantId }).lean();
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Shape response to the requested structure
    const payload = {
      _id: task._id,
      title: task.title,
      status: task.status,
      assignee: task.assigneeId || null,
      priority: task.priority,
      startDate: task.startDate,
      endDate: task.endDate,
      avatar: task.avatar || null,
      comments: task.comments,
      parentTask: task.parentTask,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    };

    return res.json(payload);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Create a new task (root or subtask) (tenant-aware)
exports.createTask = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const { parentTask, project, ...taskData } = req.body;

    if (!project) {
      return res.status(400).json({ message: 'Project ID is required to create a task' });
    }

    // Ensure project is in the same tenant
    const projectDoc = await Project.findOne({ _id: project, tenant: tenantId });
    if (!projectDoc) return res.status(404).json({ message: 'Project not found' });

    // Normalize and validate fields
    const payload = { ...taskData };
    if (Object.prototype.hasOwnProperty.call(payload, 'assigneeId')) {
      if (!payload.assigneeId) {
        payload.assigneeId = null;
      } else if (!mongoose.Types.ObjectId.isValid(payload.assigneeId)) {
        return res.status(400).json({ message: 'Invalid assigneeId' });
      }
    }

    const newTask = new Task({ ...payload, tenant: tenantId, parentTask: parentTask || null, project });
    const savedTask = await newTask.save();

    // Add task to project
    projectDoc.tasks.push(savedTask._id);
    await projectDoc.save();

    res.status(201).json(savedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a task (tenant-aware)
exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid task ID' });
    }

    // Whitelist allowed fields and normalize types
    const allowed = [
      'title', 'status', 'priority', 'startDate', 'endDate', 'comments', 'parentTask', 'project', 'assigneeId', 'avatar'
    ];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }
    // Normalize assigneeId: empty string -> null; validate ObjectId
    if (updates.hasOwnProperty('assigneeId')) {
      if (!updates.assigneeId) {
        updates.assigneeId = null;
      } else if (!mongoose.Types.ObjectId.isValid(updates.assigneeId)) {
        return res.status(400).json({ message: 'Invalid assigneeId' });
      }
    }

    const updatedTask = await Task.findOneAndUpdate({ _id: id, tenant: req.tenantId }, { $set: updates }, {
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

// Delete a task and all its subtasks recursively (tenant-aware)
async function deleteTaskAndSubtasks(taskId, tenantId) {
  if (!taskId) {
    return; // Safeguard against deleting all tasks
  }
  const subtasks = await Task.find({ parentTask: taskId, tenant: tenantId });
  for (let sub of subtasks) {
    await deleteTaskAndSubtasks(sub._id, tenantId);
  }
  await Task.deleteOne({ _id: taskId, tenant: tenantId });
}

exports.deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid task ID' });
    }
    const task = await Task.findOne({ _id: id, tenant: req.tenantId });
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    await deleteTaskAndSubtasks(task._id, req.tenantId);
    res.json({ message: 'Task and its subtasks deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get progress stats (recursive, tenant-aware)
exports.getProgress = async (req, res) => {
  try {
    const tree = await buildTaskTree(null, { tenant: req.tenantId });
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
