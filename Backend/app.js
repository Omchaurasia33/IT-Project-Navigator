// app.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const taskRoutes = require('./routes/task'); // ✅ Add task routes
const setupSwagger = require('./swagger'); // ✅ Add swagger setup

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

// Routes
app.use('/tasks', taskRoutes); // ✅ Mount task routes

// Root route
app.get('/', (req, res) => {
  res.send('🚀 Project Navigator Backend Running!');
});

setupSwagger(app);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.listen(port, () => {
  console.log(`⚙️  Server is running on http://localhost:${port}`);
});
