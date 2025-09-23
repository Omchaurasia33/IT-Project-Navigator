// controllers/taskController.js
const Task = require('../models/Task');

// Get all tasks (with optional filters)
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
    const tasks = await Task.find(filter);
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new task (root or subtask)
exports.createTask = async (req, res) => {
  try {
    const { parentId, ...taskData } = req.body;
    if (parentId) {
      const parent = await Task.findOne({ id: parentId });
      if (!parent) {
        return res.status(404).json({ message: 'Parent task not found' });
      }
      parent.subtasks.unshift(taskData);
      await parent.save();
      return res.status(201).json(parent);
    } else {
      const newTask = new Task(taskData);
      const savedTask = await newTask.save();
      res.status(201).json(savedTask);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a task
exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Debug logging
    console.log('UPDATE API called for id:', id, 'updates:', updates);
    // Try to update root task (id can be string or number)
    let updatedTask = await Task.findOneAndUpdate({ id: id }, updates, {
      new: true,
      runValidators: true,
    });
    if (!updatedTask && !isNaN(Number(id))) {
      updatedTask = await Task.findOneAndUpdate({ id: Number(id) }, updates, {
        new: true,
        runValidators: true,
      });
    }
    if (updatedTask) {
      console.log('Root task updated:', updatedTask);
      return res.json(updatedTask);
    } else {
      console.log('No root task found for id:', id, 'or', Number(id));
    }

    // If not found as root, try to update as subtask in-place in parent
    const parentTasks = await Task.find({ 'subtasks.id': { $exists: true } });
    let found = false;
    let updatedParent = null;
    for (let parent of parentTasks) {
      const updateSubtask = (subtasks) => {
        for (let i = 0; i < subtasks.length; i++) {
          if (String(subtasks[i].id) === String(id) || subtasks[i].id === id || subtasks[i].id === Number(id)) {
            subtasks[i] = { ...subtasks[i], ...updates };
            found = true;
          } else if (subtasks[i].subtasks && subtasks[i].subtasks.length > 0) {
            updateSubtask(subtasks[i].subtasks);
          }
        }
      };
      updateSubtask(parent.subtasks);
      if (found) {
        updatedParent = await parent.save();
        break;
      }
    }
    if (found && updatedParent) {
      return res.json({ message: 'Subtask updated', parent: updatedParent });
    }
    return res.status(404).json({ message: 'Task not found' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a task (and its subtasks)
exports.deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    let result = await Task.deleteOne({ id: id });
    if (result.deletedCount === 0 && !isNaN(Number(id))) {
      result = await Task.deleteOne({ id: Number(id) });
    }
    if (result.deletedCount === 0) {
      // Try to delete as subtask
      const parentTasks = await Task.find({ 'subtasks.id': { $exists: true } });
      let found = false;
      for (let parent of parentTasks) {
        const deleteSubtask = (subtasks) => {
          for (let i = 0; i < subtasks.length; i++) {
            if (String(subtasks[i].id) === String(id) || subtasks[i].id === id || subtasks[i].id === Number(id)) {
              subtasks.splice(i, 1);
              found = true;
              return;
            } else if (subtasks[i].subtasks && subtasks[i].subtasks.length > 0) {
              deleteSubtask(subtasks[i].subtasks);
            }
          }
        };
        deleteSubtask(parent.subtasks);
        if (found) {
          await parent.save();
          break;
        }
      }
      if (found) {
        return res.json({ message: 'Subtask deleted successfully' });
      }
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get progress stats
exports.getProgress = async (req, res) => {
  try {
    const tasks = await Task.find();
    let total = 0;
    let completed = 0;
    const countTasks = (taskList) => {
      taskList.forEach((task) => {
        total++;
        if (task.status === 'Done') completed++;
        if (task.subtasks && task.subtasks.length > 0) {
          countTasks(task.subtasks);
        }
      });
    };
    countTasks(tasks);
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
