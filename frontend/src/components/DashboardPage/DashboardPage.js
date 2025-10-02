// components/DashboardPage/DashboardPage.js
import React from "react";
import {
  PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from "recharts";
import "./DashboardPage.css";

const DashboardPage = () => {
  // Dummy data – replace with real project/task data later
  const taskStats = [
    { name: "To Do", value: 10 },
    { name: "In Progress", value: 5 },
    { name: "Completed", value: 2 },
  ];

  const projectStats = [
    { name: "Project Management Module", tasks: 5 },
    { name: "Website Revamp", tasks: 7 },
    { name: "Mobile App", tasks: 3 },
  ];

  const assigneeWorkload = [
    { name: "John Doe", tasks: 6 },
    { name: "Jane Smith", tasks: 4 },
    { name: "Alex Johnson", tasks: 3 },
  ];

  const COLORS = ["#f87171", "#fbbf24", "#34d399"];

  return (
    <div className="dashboard-container">
      <h2>Dashboard Overview</h2>

      {/* Task Stats (Pie Chart) */}
      <div className="dashboard-section">
        <h3>Task Status</h3>
        <PieChart width={300} height={250}>
          <Pie
            data={taskStats}
            cx="50%"
            cy="50%"
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            label
          >
            {taskStats.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </div>

      {/* Project Stats (Bar Chart) */}
      <div className="dashboard-section">
        <h3>Projects Overview</h3>
        <BarChart width={500} height={300} data={projectStats}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="tasks" fill="#2563eb" />
        </BarChart>
      </div>

      {/* Assignee Workload (Bar Chart) */}
      <div className="dashboard-section">
        <h3>Assignee Workload</h3>
        <BarChart width={500} height={300} data={assigneeWorkload}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="tasks" fill="#10b981" />
        </BarChart>
      </div>
    </div>
  );
};

export default DashboardPage;
