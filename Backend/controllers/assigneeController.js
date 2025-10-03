const Assignee = require('../models/Assignee');

// @desc    Create a new assignee
// @route   POST /api/assignees
// @access  Public
exports.createAssignee = async (req, res) => {
  try {
    const assignee = new Assignee({
      name: req.body.name,
      email: req.body.email,
      role: req.body.role
    });
    const newAssignee = await assignee.save();
    res.status(201).json(newAssignee);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Get all assignees
// @route   GET /api/assignees
// @access  Public
exports.getAssignees = async (req, res) => {
  try {
    const assignees = await Assignee.find();
    res.json(assignees);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get a single assignee
// @route   GET /api/assignees/:id
// @access  Public
exports.getAssigneeById = async (req, res) => {
  try {
    const assignee = await Assignee.findById(req.params.id);
    if (assignee == null) {
      return res.status(404).json({ message: 'Cannot find assignee' });
    }
    res.json(assignee);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Update an assignee
// @route   PUT /api/assignees/:id
// @access  Public
exports.updateAssignee = async (req, res) => {
  try {
    const assignee = await Assignee.findById(req.params.id);
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

// @desc    Delete an assignee
// @route   DELETE /api/assignees/:id
// @access  Public
exports.deleteAssignee = async (req, res) => {
  try {
    const assignee = await Assignee.findById(req.params.id);
    if (assignee == null) {
      return res.status(404).json({ message: 'Cannot find assignee' });
    }

    await Assignee.deleteOne({ _id: req.params.id });
    res.json({ message: 'Deleted Assignee' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
