const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');
const Assignee = require('../models/Assignee');

// @desc    Create a new project (tenant-aware)
// @route   POST /projects
// @access  Protected
exports.createProject = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const { name, description, managerId, startDate, endDate, priority, assigneeIds } = req.body || {};

    // Basic validations for cross-tenant references
    if (managerId) {
      const mgr = await Assignee.findOne({ _id: managerId, tenant: tenantId });
      if (!mgr) return res.status(400).json({ message: 'Invalid managerId for this tenant' });
    }
    if (Array.isArray(assigneeIds) && assigneeIds.length) {
      const count = await Assignee.countDocuments({ _id: { $in: assigneeIds }, tenant: tenantId });
      if (count !== assigneeIds.length) {
        return res.status(400).json({ message: 'One or more assignees are invalid for this tenant' });
      }
    }

    const project = new Project({
      tenant: tenantId,
      name,
      description,
      managerId,
      startDate,
      endDate,
      priority,
      assigneeIds,
    });
    const newProject = await project.save();
    res.status(201).json(newProject);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Get all projects (tenant-aware)
// @route   GET /projects
// @access  Protected
exports.getProjects = async (req, res) => {
  try {
    const projects = await Project.find({ tenant: req.tenantId })
      .populate('tasks')
      .populate('managerId')
      .populate('assigneeIds');
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get a single project (tenant-aware)
// @route   GET /projects/:id
// @access  Protected
exports.getProjectById = async (req, res) => {
  try {
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid project ID' });
    }
    const project = await Project.findOne({ _id: req.params.id, tenant: req.tenantId })
      .populate('tasks')
      .populate('managerId')
      .populate('assigneeIds');
    if (project == null) {
      return res.status(404).json({ message: 'Cannot find project' });
    }
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Update a project (tenant-aware)
// @route   PUT /projects/:id
// @access  Protected
exports.updateProject = async (req, res) => {
  try {
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid project ID' });
    }
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

    // Validate cross-tenant references on update
    const tenantId = req.tenantId;
    if (updates.managerId) {
      const mgr = await Assignee.findOne({ _id: updates.managerId, tenant: tenantId });
      if (!mgr) return res.status(400).json({ message: 'Invalid managerId for this tenant' });
    }
    if (updates.assigneeIds) {
      const count = await Assignee.countDocuments({ _id: { $in: updates.assigneeIds }, tenant: tenantId });
      if (count !== updates.assigneeIds.length) {
        return res.status(400).json({ message: 'One or more assignees are invalid for this tenant' });
      }
    }

    const updatedProject = await Project.findOneAndUpdate(
      { _id: req.params.id, tenant: tenantId },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!updatedProject) {
      return res.status(404).json({ message: 'Cannot find project' });
    }

    // Return a populated version for consistency with GETs
    const populated = await Project.findOne({ _id: updatedProject._id, tenant: tenantId })
      .populate('tasks')
      .populate('managerId')
      .populate('assigneeIds');

    res.json(populated || updatedProject);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Delete a project (tenant-aware)
// @route   DELETE /projects/:id
// @access  Protected
exports.deleteProject = async (req, res) => {
  try {
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid project ID' });
    }
    const project = await Project.findOne({ _id: req.params.id, tenant: req.tenantId });
    if (project == null) {
      return res.status(404).json({ message: 'Cannot find project' });
    }

    await Project.deleteOne({ _id: req.params.id, tenant: req.tenantId });
    res.json({ message: 'Deleted Project' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
