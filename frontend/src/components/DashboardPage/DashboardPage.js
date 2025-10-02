// components/DashboardPage/DashboardPage.js
import React from "react";
import {
  PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer
} from "recharts";
import "./DashboardPage.css";

const DashboardPage = () => {
  // Dummy data – simulate real project system
  const projects = [
    { id: 1, name: "Project Management Module", status: "In Progress", tasks: 8 },
    { id: 2, name: "Website Revamp", status: "To Do", tasks: 5 },
    { id: 3, name: "Mobile App", status: "In Progress", tasks: 6 },
    { id: 4, name: "API Integration", status: "Completed", tasks: 4 },
  ];

  const assignees = [
    { id: 1, name: "John Doe", tasks: 6 },
    { id: 2, name: "Jane Smith", tasks: 5 },
    { id: 3, name: "Alex Johnson", tasks: 4 },
  ];

  // Derive stats
  const totalProjects = projects.length;
  const totalTasks = projects.reduce((sum, p) => sum + p.tasks, 0);
  const totalAssignees = assignees.length;
  const completedProjects = projects.filter(p => p.status === "Completed").length;

  // Task status breakdown
  const taskStats = [
    { name: "To Do", value: 7 },
    { name: "In Progress", value: 6 },
    { name: "Completed", value: 4 },
  ];

  // Project task counts
  const projectStats = projects.map(p => ({ name: p.name, tasks: p.tasks }));

  // Assignee workload
  const assigneeWorkload = assignees;

  // Colors
  const TASK_COLORS = ["#f87171", "#fbbf24", "#34d399"]; // red, amber, emerald
  const BAR_COLOR = "#3b82f6"; // blue-500
  const WORKLOAD_COLOR = "#10b981"; // emerald-500

  return (
    <div className="dashboard-container">
      <h2>Dashboard Overview</h2>

      {/* KPI Summary Cards */}
      <div className="kpi-cards">
        <div className="kpi-card">
          <h3>Total Projects</h3>
          <p className="kpi-value">{totalProjects}</p>
        </div>
        <div className="kpi-card">
          <h3>Total Tasks</h3>
          <p className="kpi-value">{totalTasks}</p>
        </div>
        <div className="kpi-card">
          <h3>Team Members</h3>
          <p className="kpi-value">{totalAssignees}</p>
        </div>
        <div className="kpi-card">
          <h3>Completed</h3>
          <p className="kpi-value">{completedProjects}</p>
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