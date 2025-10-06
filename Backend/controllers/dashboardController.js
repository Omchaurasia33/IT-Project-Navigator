const Task = require('../models/Task');
const Project = require('../models/Project');
const Assignee = require('../models/Assignee');
const mongoose = require('mongoose');

// GET /dashboard/summary (tenant-aware)
// Returns overall metrics and chart-ready datasets scoped to req.tenantId
exports.getSummary = async (req, res) => {
  try {
    const tenantId = new mongoose.Types.ObjectId(req.tenantId);

    const [projectsCount, tasksCount, assigneesCount] = await Promise.all([
      Project.countDocuments({ tenant: tenantId }),
      Task.countDocuments({ tenant: tenantId }),
      Assignee.countDocuments({ tenant: tenantId }),
    ]);

    // Task status distribution
    const taskStatusAgg = await Task.aggregate([
      { $match: { tenant: tenantId } },
      { $group: { _id: '$status', value: { $sum: 1 } } },
      { $project: { _id: 0, name: '$_id', value: 1 } },
      { $sort: { name: 1 } },
    ]);

    // Tasks per project with project name
    const tasksPerProjectAgg = await Task.aggregate([
      { $match: { tenant: tenantId } },
      { $group: { _id: '$project', tasks: { $sum: 1 } } },
      {
        $lookup: {
          from: 'projects',
          localField: '_id',
          foreignField: '_id',
          as: 'project',
        },
      },
      { $unwind: { path: '$project', preserveNullAndEmptyArrays: true } },
      { $project: { name: { $ifNull: ['$project.name', 'Unknown Project'] }, tasks: 1 } },
      { $sort: { name: 1 } },
    ]);

    // Assignee workload (skip null)
    const assigneeWorkloadAgg = await Task.aggregate([
      { $match: { tenant: tenantId, assigneeId: { $ne: null } } },
      { $group: { _id: '$assigneeId', tasks: { $sum: 1 } } },
      {
        $lookup: {
          from: 'assignees',
          localField: '_id',
          foreignField: '_id',
          as: 'assignee',
        },
      },
      { $unwind: { path: '$assignee', preserveNullAndEmptyArrays: true } },
      { $project: { name: { $ifNull: ['$assignee.name', 'Unassigned'] }, tasks: 1 } },
      { $sort: { name: 1 } },
    ]);

    // Completed projects: projects for which all their tasks are Done and there is at least 1 task
    const completionAgg = await Task.aggregate([
      { $match: { tenant: tenantId } },
      {
        $group: {
          _id: '$project',
          total: { $sum: 1 },
          done: { $sum: { $cond: [{ $eq: ['$status', 'Done'] }, 1, 0] } },
        },
      },
      { $project: { completed: { $and: [{ $gt: ['$total', 0] }, { $eq: ['$total', '$done'] }] } } },
      { $match: { completed: true } },
      { $count: 'completedCount' },
    ]);
    const completedProjects = completionAgg?.[0]?.completedCount || 0;

    return res.json({
      totals: {
        projects: projectsCount,
        tasks: tasksCount,
        assignees: assigneesCount,
        completedProjects,
      },
      taskStatus: taskStatusAgg,
      tasksPerProject: tasksPerProjectAgg,
      assigneeWorkload: assigneeWorkloadAgg,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
