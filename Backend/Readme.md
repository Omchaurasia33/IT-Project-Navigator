To support the **Project Navigator** React frontend, we need a backend that can:

- Store and manage **Projects/Tasks** (with nested subtasks)
- Support CRUD operations: Create, Read, Update, Delete tasks and subtasks
- Support filtering by status and assignee
- Support expanding/collapsing task nodes (state can be client-side, but if persisted, we’d need to store `expanded` state per user — optional for now)
- Calculate progress stats

---

## ✅ Backend Requirements

We’ll create:

1. **Mongoose Task Schema** (recursive for subtasks)
2. **Task Routes** (`GET`, `POST`, `PUT`, `DELETE`)
3. **Task Controller** with logic
4. Update `app.js` to use task routes
5. Seed initial data (optional)

---

## 🗂️ File Structure

```
backend/
├── models/
│   └── Task.js
├── routes/
│   └── task.js
├── controllers/
│   └── taskController.js
├── app.js
└── .env
```

---

## 1️⃣ Mongoose Task Schema — `models/Task.js`

```js
// models/Task.js
const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['To Do', 'In Progress', 'Done', 'Canceled'],
      default: 'To Do',
    },
    assignee: {
      type: String,
      required: true,
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium',
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    avatar: {
      type: String,
      default: '',
    },
    comments: {
      type: Number,
      default: 0,
    },
    subtasks: {
      type: [mongoose.Schema.Types.Mixed], // Recursive subtasks (can be embedded or ref — we use embedded for simplicity)
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Task', taskSchema);
```

> ✅ We use `mongoose.Schema.Types.Mixed` for subtasks to allow recursive nesting without complex refs. For large scale, consider separate collection with parent refs.

---

## 2️⃣ Task Controller — `controllers/taskController.js`

```js
// controllers/taskController.js
const Task = require('../models/Task');

// Get all tasks (with optional filters)
exports.getTasks = async (req, res) => {
  try {
    const { status, assignee } = req.query;

    let filter = {};

    if (status && status !== 'all') {
      filter.status = status;
    }

    if (assignee && assignee !== 'all') {
      // Map frontend filter values to actual names
      const assigneeMap = {
        'user-1': 'Alice',
        'user-2': 'Bob',
        'user-3': 'Charlie',
      };
      filter.assignee = assigneeMap[assignee] || assignee;
    }

    const tasks = await Task.find(filter);
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new task (root or subtask)
exports.createTask = async (req, res) => {
  try {
    const { parentId, ...taskData } = req.body;

    if (parentId) {
      // Add as subtask to parent
      const parent = await Task.findOne({ id: parentId });
      if (!parent) {
        return res.status(404).json({ message: 'Parent task not found' });
      }

      // Add new subtask at the top
      parent.subtasks.unshift(taskData);
      await parent.save();
      return res.status(201).json(parent);
    } else {
      // Create root task
      const newTask = new Task(taskData);
      const savedTask = await newTask.save();
      res.status(201).json(savedTask);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a task
exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updatedTask = await Task.findOneAndUpdate({ id: parseInt(id) }, updates, {
      new: true,
      runValidators: true,
    });

    if (!updatedTask) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a task (and its subtasks)
exports.deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await Task.deleteOne({ id: parseInt(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get progress stats
exports.getProgress = async (req, res) => {
  try {
    const tasks = await Task.find();
    let total = 0;
    let completed = 0;

    const countTasks = (taskList) => {
      taskList.forEach((task) => {
        total++;
        if (task.status === 'Done') completed++;
        if (task.subtasks && task.subtasks.length > 0) {
          countTasks(task.subtasks);
        }
      });
    };

    countTasks(tasks);

    const progressPercentage = total > 0 ? (completed / total) * 100 : 0;

    res.json({
      total,
      completed,
      progressPercentage,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
```

---

## 3️⃣ Task Routes — `routes/task.js`

```js
// routes/task.js
const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');

// GET /tasks — get all tasks with optional filters
router.get('/', taskController.getTasks);

// POST /tasks — create new task (root or subtask)
router.post('/', taskController.createTask);

// PUT /tasks/:id — update task
router.put('/:id', taskController.updateTask);

// DELETE /tasks/:id — delete task
router.delete('/:id', taskController.deleteTask);

// GET /tasks/progress — get progress stats
router.get('/progress', taskController.getProgress);

module.exports = router;
```

---

## 4️⃣ Update Main App — `app.js`

```js
// app.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const taskRoutes = require('./routes/task'); // ✅ Add task routes

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

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.listen(port, () => {
  console.log(`⚙️  Server is running on http://localhost:${port}`);
});
```

---

## 5️⃣ (Optional) Seed Initial Data — `seed.js`

Create a one-time script to populate initial tasks.

```js
// seed.js
require('dotenv').config();
const mongoose = require('mongoose');
const Task = require('./models/Task');

const initialProjectData = [
  {
    id: 1,
    title: 'Project Kick-off and Planning',
    status: 'Done',
    assignee: 'Alice',
    priority: 'High',
    startDate: '2025-08-01',
    endDate: '2025-08-15',
    avatar: 'https://picsum.photos/seed/1/40/40',
    comments: 3,
    subtasks: [
      {
        id: 101,
        title: 'Define Project Scope and Objectives',
        status: 'Done',
        assignee: 'Alice',
        priority: 'High',
        startDate: '2025-08-01',
        endDate: '2025-08-03',
        avatar: 'https://picsum.photos/seed/1/40/40',
        comments: 1,
        subtasks: [],
      },
      {
        id: 102,
        title: 'Assemble Project Team',
        status: 'Done',
        assignee: 'Bob',
        priority: 'Medium',
        startDate: '2025-08-04',
        endDate: '2025-08-05',
        avatar: 'https://picsum.photos/seed/2/40/40',
        comments: 2,
        subtasks: [],
      },
    ],
  },
  {
    id: 2,
    title: 'Design Phase',
    status: 'In Progress',
    assignee: 'Charlie',
    priority: 'High',
    startDate: '2025-08-15',
    endDate: '2025-09-15',
    avatar: 'https://picsum.photos/seed/3/40/40',
    comments: 5,
    subtasks: [
      {
        id: 201,
        title: 'Create Wireframes',
        status: 'Done',
        assignee: 'Alice',
        priority: 'High',
        startDate: '2025-08-15',
        endDate: '2025-08-25',
        avatar: 'https://picsum.photos/seed/1/40/40',
        comments: 2,
        subtasks: [],
      },
      {
        id: 202,
        title: 'Develop High-Fidelity Mockups',
        status: 'In Progress',
        assignee: 'Charlie',
        priority: 'Medium',
        startDate: '2025-08-26',
        endDate: '2025-09-05',
        avatar: 'https://picsum.photos/seed/3/40/40',
        comments: 1,
        subtasks: [],
      },
      {
        id: 203,
        title: 'Design Review and Feedback',
        status: 'To Do',
        assignee: 'Alice',
        priority: 'Medium',
        startDate: '2025-09-06',
        endDate: '2025-09-15',
        avatar: 'https://picsum.photos/seed/1/40/40',
        comments: 0,
        subtasks: [],
      },
    ],
  },
  {
    id: 3,
    title: 'Deployment',
    status: 'Canceled',
    assignee: 'Unassigned',
    priority: 'Medium',
    startDate: '2025-09-20',
    endDate: '2025-09-25',
    avatar: '',
    comments: 0,
    subtasks: [],
  },
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    // Clear existing
    await Task.deleteMany({});

    // Insert new
    await Task.insertMany(initialProjectData);

    console.log('✅ Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
```

Run it once:

```bash
node seed.js
```

---

## 🧪 API Endpoints Summary

| Method | Endpoint             | Description                        |
|--------|----------------------|------------------------------------|
| `GET`  | `/tasks`             | Get all tasks (filter by `status`, `assignee`) |
| `POST` | `/tasks`             | Create new task (pass `parentId` for subtask) |
| `PUT`  | `/tasks/:id`         | Update task by `id`                |
| `DELETE`| `/tasks/:id`        | Delete task by `id`                |
| `GET`  | `/tasks/progress`    | Get `{ total, completed, progressPercentage }` |

---

## 🔄 Frontend Integration Notes

Update your React frontend to use these APIs:

- Replace `initialProjectData` with `fetch('/tasks')`
- On add/edit/delete, call corresponding API endpoints
- Fetch progress stats from `/tasks/progress`

Example:

```js
// In ProjectNavigator.js
useEffect(() => {
  fetch('/tasks')
    .then(res => res.json())
    .then(data => setTasks(data));
}, []);
```

> ✅ You can also add loading states, error handling, and real-time updates with WebSockets later.

---

## ✅ Done!

You now have a **fully functional backend** for your Project Navigator app with:

- Nested task support
- Filtering
- Progress calculation
- CRUD operations

Just start your backend:

```bash
npm install express mongoose dotenv
node app.js
```

And connect your React app to `http://localhost:3000/tasks`.

Let me know if you want authentication, user-specific projects, or WebSocket real-time sync next! 🚀