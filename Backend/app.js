// app.js
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
require('./config/passport'); // Passport configuration
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

// Enable CORS for the frontend
app.use(require('cors')({
  origin: 'http://localhost:3001', // Allow the frontend origin
  credentials: true
}));

app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET || 'your_secret_key',
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

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
app.use('/tasks', requireAuth, taskRoutes);
app.use('/projects', requireAuth, projectRoutes);
app.use('/assignees', requireAuth, assigneeRoutes);
app.use('/dashboard', requireAuth, dashboardRoutes);
app.use('/billing', requireAuth, require('./routes/billing'));

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.listen(port, () => {
  console.log(`⚙️  Server is running on http://localhost:${port}`);
});
