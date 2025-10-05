// controllers/taskController.js
const Task = require('../models/Task');
const Project = require('../models/Project');
const mongoose = require('mongoose');

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
    const { status, projectId } = req.query;
    let filter = {};
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

// Get a single task by ID with shaped response
exports.getTaskById = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findById(id).lean();
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

// Create a new task (root or subtask)
exports.createTask = async (req, res) => {
  try {
    const { parentTask, project, ...taskData } = req.body;

    if (!project) {
      return res.status(400).json({ message: 'Project ID is required to create a task' });
    }

    const newTask = new Task({ ...taskData, parentTask: parentTask || null, project });
    const savedTask = await newTask.save();

    // Add task to project
    const projectToUpdate = await Project.findById(project);
    if (!projectToUpdate) {
      // If the project doesn't exist, we should probably roll back the task creation
      // or handle it in some other way. For now, we'll return an error.
      await Task.findByIdAndDelete(savedTask._id);
      return res.status(404).json({ message: 'Project not found' });
    }
    projectToUpdate.tasks.push(savedTask._id);
    await projectToUpdate.save();

    res.status(201).json(savedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a task
exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params;

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

    const updatedTask = await Task.findByIdAndUpdate(id, { $set: updates }, {
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
  if (!taskId) {
    return; // Safeguard against deleting all tasks
  }
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
