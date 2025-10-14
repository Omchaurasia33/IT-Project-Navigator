const Assignee = require('../models/Assignee');

// @desc    Create a new assignee (tenant-aware)
// @route   POST /assignees
// @access  Protected
exports.createAssignee = async (req, res) => {
  try {
    const assignee = new Assignee({
      tenant: req.tenantId,
      name: req.body.name,
      email: req.body.email,
      role: req.body.role,
    });
    const newAssignee = await assignee.save();
    res.status(201).json(newAssignee);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all assignees (tenant-aware)
// @route   GET /assignees
// @access  Protected
exports.getAssignees = async (req, res) => {
  try {
    const assignees = await Assignee.find({ tenant: req.tenantId });
    res.json(assignees);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get a single assignee (tenant-aware)
// @route   GET /assignees/:id
// @access  Protected
exports.getAssigneeById = async (req, res) => {
  try {
    const assignee = await Assignee.findOne({ _id: req.params.id, tenant: req.tenantId });
    if (assignee == null) {
      return res.status(404).json({ message: 'Cannot find assignee' });
    }
    res.json(assignee);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Update an assignee (tenant-aware)
// @route   PUT /assignees/:id
// @access  Protected
exports.updateAssignee = async (req, res) => {
  try {
    const assignee = await Assignee.findOne({ _id: req.params.id, tenant: req.tenantId });
    if (assignee == null) {
      return res.status(404).json({ message: 'Cannot find assignee' });
    }

    if (req.body.name != null) {
      assignee.name = req.body.name;
    }
    if (req.body.email != null) {
      assignee.email = req.body.email;
    }
    if (req.body.role != null) {
      assignee.role = req.body.role;
    }

    const updatedAssignee = await assignee.save();
    res.json(updatedAssignee);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Delete an assignee (tenant-aware)
// @route   DELETE /assignees/:id
// @access  Protected
exports.deleteAssignee = async (req, res) => {
  try {
    const assignee = await Assignee.findOne({ _id: req.params.id, tenant: req.tenantId });
    if (assignee == null) {
      return res.status(404).json({ message: 'Cannot find assignee' });
    }

    await Assignee.deleteOne({ _id: req.params.id, tenant: req.tenantId });
    res.json({ message: 'Deleted Assignee' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
