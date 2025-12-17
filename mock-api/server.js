const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());

/**
 * ------------------------------------------------------
 * In-memory data store
 * ------------------------------------------------------
 */

// List view (lightweight summaries)
let templates = [
  {
    id: "t1",
    title: "Employment Contract",
    updatedAt: new Date().toISOString(),
    status: "DRAFT",
  },
];

// Full template data
let templateById = {
  t1: {
    id: "t1",
    title: "Employment Contract",
    templateHtml: "<p>Hello</p>",

    // Dynamic field definitions
    schema: [
      {
        key: "employeeName",
        label: "Employee Name",
        type: "text",
        required: true,
        validations: { minLength: 2 },
      },
      {
        key: "startDate",
        label: "Start Date",
        type: "date",
        required: true,
        validations: { minDate: "2024-01-01" },
      },
      {
        key: "role",
        label: "Role",
        type: "select",
        required: true,
        optionsEndpoint: "/options/roles",
        options: ["Engineer", "Manager", "Designer"],
      },
    ],

    // Dynamic field values
    values: {
      employeeName: "Alice",
      startDate: "2025-01-01",
      role: "ENGINEER",
    },

    published: false,
    updatedAt: new Date().toISOString(),
  },
};

/**
 * ------------------------------------------------------
 * Routes
 * ------------------------------------------------------
 */

// List templates
app.get("/templates", (req, res) => {
  res.json(templates);
});

// Create template
app.post("/templates", (req, res) => {
  const id = `t${Math.random().toString(16).slice(2)}`;
  const title = req.body.title || "Untitled";

  const summary = {
    id,
    title,
    updatedAt: new Date().toISOString(),
    status: "DRAFT",
  };

  templates.unshift(summary);

  templateById[id] = {
    id,
    title,
    templateHtml: "",
    schema: [],
    values: {},
    published: false,
    updatedAt: summary.updatedAt,
  };

  res.json(summary);
});

// Get template by id
app.get("/templates/:id", (req, res) => {
  const template = templateById[req.params.id];
  if (!template) {
    return res.status(404).json({ message: "Template not found" });
  }
  res.json(template);
});

// Update template (partial updates)
app.patch("/templates/:id", (req, res) => {
  const id = req.params.id;
  const existing = templateById[id];

  if (!existing) {
    return res.status(404).json({ message: "Template not found" });
  }

  const updated = {
    ...existing,
    ...req.body,
    values: {
      ...existing.values,
      ...(req.body.values || {}),
    },
    updatedAt: new Date().toISOString(),
  };

  templateById[id] = updated;

  // Update summary list
  templates = templates.map((t) =>
    t.id === id
      ? {
          ...t,
          title: updated.title,
          updatedAt: updated.updatedAt,
          status: updated.published ? "PUBLISHED" : "DRAFT",
        }
      : t,
  );

  res.json(updated);
});

// Delete template
app.delete("/templates/:id", (req, res) => {
  const id = req.params.id;

  if (!templateById[id]) {
    return res.status(404).json({ message: "Template not found" });
  }

  delete templateById[id];
  templates = templates.filter((t) => t.id !== id);

  res.status(204).end();
});

/**
 * ------------------------------------------------------
 * Mock file upload
 * ------------------------------------------------------
 */

app.post("/upload", (req, res) => {
  setTimeout(() => {
    res.json({
      url: `https://gcs.fake/${Date.now()}.pdf`,
    });
  }, 1200);
});

/**
 * ------------------------------------------------------
 * Start server
 * ------------------------------------------------------
 */

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Mock API running at http://localhost:${PORT}`);
});
