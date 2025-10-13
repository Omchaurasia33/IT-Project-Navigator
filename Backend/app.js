// app.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const taskRoutes = require('./routes/task');
const projectRoutes = require('./routes/project');
const assigneeRoutes = require('./routes/assignee');
const setupSwagger = require('./swagger');
const dashboardRoutes = require('./routes/dashboard');
const authRoutes = require('./routes/auth');
const tenantRoutes = require('./routes/tenant'); // Import tenant routes
const requireAuth = require('./middleware/auth');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('✅ Successfully connected to MongoDB.'))
  .catch((err) => console.error('❌ Connection error', err));

// Public routes
app.use('/auth', authRoutes);
app.use('/tenants', tenantRoutes); // Use tenant routes
setupSwagger(app);

// Protected routes (require authentication)
app.use(requireAuth);
app.use('/tasks', taskRoutes);
app.use('/projects', projectRoutes);
app.use('/assignees', assigneeRoutes);
app.use('/dashboard', dashboardRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.listen(port, () => {
  console.log(`⚙️  Server is running on http://localhost:${port}`);
});
