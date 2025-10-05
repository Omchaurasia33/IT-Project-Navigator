// components/DashboardPage/DashboardPage.js
import React, { useEffect, useState } from "react";
import {
  PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer
} from "recharts";
import "./DashboardPage.css";

const DashboardPage = () => {
  // State from backend
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [totals, setTotals] = useState({ projects: 0, tasks: 0, assignees: 0, completedProjects: 0 });
  const [taskStats, setTaskStats] = useState([]);
  const [projectStats, setProjectStats] = useState([]);
  const [assigneeWorkload, setAssigneeWorkload] = useState([]);

  useEffect(() => {
    fetch('/dashboard/summary')
      .then(res => {
        if (!res.ok) throw new Error('Failed to load dashboard');
        return res.json();
      })
      .then(data => {
        setTotals(data.totals || { projects: 0, tasks: 0, assignees: 0, completedProjects: 0 });
        setTaskStats(Array.isArray(data.taskStatus) ? data.taskStatus : []);
        setProjectStats(Array.isArray(data.tasksPerProject) ? data.tasksPerProject : []);
        setAssigneeWorkload(Array.isArray(data.assigneeWorkload) ? data.assigneeWorkload : []);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || 'Failed to load dashboard');
        setLoading(false);
      });
  }, []);

  // Colors
  const TASK_COLORS = ["#f87171", "#fbbf24", "#34d399"]; // red, amber, emerald
  const BAR_COLOR = "#3b82f6"; // blue-500
  const WORKLOAD_COLOR = "#10b981"; // emerald-500

  if (loading) {
    return <div className="dashboard-container"><h2>Dashboard Overview</h2><p>Loading...</p></div>;
  }
  if (error) {
    return <div className="dashboard-container"><h2>Dashboard Overview</h2><p style={{color: 'red'}}>{error}</p></div>;
  }

  return (
    <div className="dashboard-container">
      <h2>Dashboard Overview</h2>

      {/* KPI Summary Cards */}
      <div className="kpi-cards">
        <div className="kpi-card">
          <h3>Total Projects</h3>
          <p className="kpi-value">{totals.projects}</p>
        </div>
        <div className="kpi-card">
          <h3>Total Tasks</h3>
          <p className="kpi-value">{totals.tasks}</p>
        </div>
        <div className="kpi-card">
          <h3>Team Members</h3>
          <p className="kpi-value">{totals.assignees}</p>
        </div>
        <div className="kpi-card">
          <h3>Completed</h3>
          <p className="kpi-value">{totals.completedProjects}</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-row">
        {/* Task Status Pie Chart */}
        <div className="chart-card">
          <h3>Task Status Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={taskStats}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {taskStats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={TASK_COLORS[index % TASK_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [value, "Tasks"]} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Project Task Load */}
        <div className="chart-card">
          <h3>Tasks per Project</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={projectStats}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" angle={-20} textAnchor="end" height={60} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="tasks" fill={BAR_COLOR} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Assignee Workload */}
      <div className="chart-card full-width">
        <h3>Assignee Workload</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={assigneeWorkload}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="tasks" fill={WORKLOAD_COLOR} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DashboardPage;