const express = require("express");

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());

// In-memory task list
const tasks = [
  {
    id: 1,
    title: "Learn Express",
    done: false,
  },
  {
    id: 2,
    title: "Build CRUD API",
    done: false,
  },
  {
    id: 3,
    title: "Push to GitHub",
    done: true,
  },
];

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    name: "Task API",
    version: "1.0",
    endpoints: ["/tasks"],
  });
});

// Health endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
  });
});

// GET all tasks
app.get("/tasks", (req, res) => {
  res.json(tasks);
});

// GET single task by ID
app.get("/tasks/:id", (req, res) => {
  const id = parseInt(req.params.id);

  const task = tasks.find((task) => task.id === id);

  if (!task) {
    return res.status(404).json({
      error: `Task ${id} not found`,
    });
  }

  res.json(task);
});

// POST create a new task
app.post("/tasks", (req, res) => {
  const { title } = req.body;

  // Validate input
  if (!title || title.trim() === "") {
    return res.status(400).json({
      error: "Title is required",
    });
  }

  // Create new task
  const newTask = {
    id: tasks.length > 0 ? tasks[tasks.length - 1].id + 1 : 1,
    title: title.trim(),
    done: false,
  };

  // Add task to array
  tasks.push(newTask);

  // Return created task
  res.status(201).json(newTask);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});