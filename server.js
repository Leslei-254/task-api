require("dotenv").config();

const express = require("express");
const { Pool } = require("pg");
const { createClient } = require("@supabase/supabase-js");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./openapi.json");
const authenticate = require("./middleware/auth");

const app = express();
const PORT = process.env.PORT || 3000;

// Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Middleware
app.use(express.json());

// Swagger
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Initialize database
async function initializeDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      done BOOLEAN DEFAULT FALSE
    );
  `);

  const result = await pool.query("SELECT COUNT(*) FROM tasks");

  if (parseInt(result.rows[0].count) === 0) {
    await pool.query(`
      INSERT INTO tasks (title, done)
      VALUES
      ('Learn Express', false),
      ('Build CRUD API', false),
      ('Push to GitHub', true);
    `);

    console.log("Database seeded.");
  }

  console.log("Database ready.");
}

// Root
app.get("/", (req, res) => {
  res.json({
    name: "Task API",
    version: "1.0",
    endpoints: [
      "/health",
      "/test",
      "/auth/signup",
      "/tasks",
    ],
  });
});

// Health
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
  });
});

// Test Route
app.get("/test", (req, res) => {
  res.json({
    message: "Test route works!",
  });
});

// ======================
// AUTH ROUTES
// ======================

// Signup
app.post("/auth/signup", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required",
      });
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      return res.status(400).json({
        error: error.message,
      });
    }

    return res.status(201).json({
      message: "User created successfully",
      user: data.user,
    });

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
});

// POST /auth/login
app.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required",
      });
    }

    // Authenticate with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(401).json({
        error: error.message,
      });
    }

    return res.status(200).json({
      message: "Login successful",
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      user: data.user,
    });

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
});

// GET /auth/me
app.get("/auth/me", authenticate, async (req, res) => {
  try {
    return res.status(200).json({
      user: req.user,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
});

app.get("/public/info", (req, res) => {
  res.status(200).json({
    message: "Welcome stranger! This info is public."
  });
});

app.get("/protected/profile", authenticate, async (req, res) => {
  res.status(200).json({
    id: req.user.id,
    email: req.user.email,
    created_at: req.user.created_at
  });
});

// POST /auth/logout
app.post("/auth/logout", async (req, res) => {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return res.status(400).json({
        error: error.message,
      });
    }

    return res.status(200).json({
      message: "Logged out successfully",
    });

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
});
// ======================
// TASK ROUTES
// ======================

// Get all tasks
app.get("/tasks", authenticate, async (req, res) => {
  console.log(req.user);
  try {
    const result = await pool.query(
      "SELECT * FROM tasks ORDER BY id ASC"
    );

    res.status(200).json(result.rows);

  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Internal server error",
    });
  }
});

// Get one task
app.get("/tasks/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const result = await pool.query(
      "SELECT * FROM tasks WHERE id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Task not found",
      });
    }

    res.status(200).json(result.rows[0]);

  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Internal server error",
    });
  }
});

// Create task
app.post("/tasks", async (req, res) => {
  try {
    const { title } = req.body;

    if (!title || title.trim() === "") {
      return res.status(400).json({
        error: "Title is required",
      });
    }

    const result = await pool.query(
      `INSERT INTO tasks(title, done)
       VALUES($1, false)
       RETURNING *`,
      [title.trim()]
    );

    res.status(201).json(result.rows[0]);

  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Internal server error",
    });
  }
});

// Update task
app.put("/tasks/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { title, done } = req.body;

    const existing = await pool.query(
      "SELECT * FROM tasks WHERE id=$1",
      [id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({
        error: "Task not found",
      });
    }

    const current = existing.rows[0];

    const result = await pool.query(
      `UPDATE tasks
       SET title=$1,
           done=$2
       WHERE id=$3
       RETURNING *`,
      [
        title ?? current.title,
        done ?? current.done,
        id,
      ]
    );

    res.status(200).json(result.rows[0]);

  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Internal server error",
    });
  }
});

// Delete task
app.delete("/tasks/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const result = await pool.query(
      "DELETE FROM tasks WHERE id=$1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Task not found",
      });
    }

    res.sendStatus(204);

  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Internal server error",
    });
  }
});

app.get("/public/info", (req, res) => {
  res.status(200).json({
    message: "Welcome stranger! This info is public."
  });
});

// Start server
initializeDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Database initialization failed:", err);
  });