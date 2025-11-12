import express from "express";

const app = express();
const PORT = 3000;

app.use(express.json());

const items = [
  { id: 1, name: "Item 1", description: "First item" },
  { id: 2, name: "Item 2", description: "Second item" },
];

// Get all items
app.get("/api/items", (req, res) => {
  res.json(items);
});

// Get single item
app.get("/api/items/:id", (req, res) => {
  const item = items.find((i) => i.id === parseInt(req.params.id));
  if (!item) {
    return res.status(404).json({ error: "Item not found" });
  }
  res.json(item);
});

// Create item
app.post("/api/items", (req, res) => {
  const newItem = {
    id: items.length + 1,
    name: req.body.name,
    description: req.body.description,
  };
  items.push(newItem);
  console.log("Created item:", newItem);
  return res.status(201).json(newItem);
});

// Delete item
app.delete("/api/items/:id", (req, res) => {
  const index = items.findIndex((i) => i.id === parseInt(req.params.id));
  if (index === -1) {
    return res.status(404).json({ error: "Item not found" });
  }
  items.splice(index, 1);
  console.log("Deleted item:", req.params.id);
  return res.status(204).send();
});

app.get("*", (req, res) => {
  res.json({
    success: true,
    message: "items-api",
    timestamp: new Date().toISOString(),
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
