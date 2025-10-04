const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');

// @desc    Create a new project
// @route   POST /api/projects
// @access  Public
exports.createProject = async (req, res) => {
  try {
    const project = new Project({
      name: req.body.name,
      description: req.body.description,
      managerId: req.body.managerId,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      priority: req.body.priority,
      assigneeIds: req.body.assigneeIds
    });
    const newProject = await project.save();
    res.status(201).json(newProject);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Get all projects
// @route   GET /api/projects
// @access  Public
exports.getProjects = async (req, res) => {
  try {
    const projects = await Project.find().populate('tasks').populate('managerId').populate('assigneeIds');
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get a single project
// @route   GET /api/projects/:id
// @access  Public
exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate('tasks').populate('managerId').populate('assigneeIds');
    if (project == null) {
      return res.status(404).json({ message: 'Cannot find project' });
    }
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Update a project
// @route   PUT /api/projects/:id
// @access  Public
exports.updateProject = async (req, res) => {
  try {
    // Build $set payload only with provided fields
    const updates = {};
    const fields = ['name', 'description', 'managerId', 'startDate', 'endDate', 'priority', 'assigneeIds'];
    fields.forEach((key) => {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    });

    // Normalize assigneeIds to an array (even if client sends a single value)
    if (updates.assigneeIds !== undefined) {
      if (!Array.isArray(updates.assigneeIds)) {
        updates.assigneeIds = [updates.assigneeIds].filter(Boolean);
      }
    }

    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!updatedProject) {
      return res.status(404).json({ message: 'Cannot find project' });
    }

    // Return a populated version for consistency with GETs
    const populated = await Project.findById(updatedProject._id)
      .populate('tasks')
      .populate('managerId')
      .populate('assigneeIds');

    res.json(populated || updatedProject);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Delete a project
// @route   DELETE /api/projects/:id
// @access  Public
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (project == null) {
      return res.status(404).json({ message: 'Cannot find project' });
    }

    await Project.deleteOne({ _id: req.params.id });
    res.json({ message: 'Deleted Project' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
