// ===================================
// server.js - Backend Authentication
// ===================================

const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 5000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "public"))); // serve frontend files

// Users file (JSON)
const USERS_FILE = path.join(__dirname, "users.json");

// Helper: Get users
function getUsers() {
  if (!fs.existsSync(USERS_FILE)) return [];
  const data = fs.readFileSync(USERS_FILE);
  return JSON.parse(data);
}

// Helper: Save users
function saveUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

// ========== ROUTES ==========

// Signup Route
app.post("/signup", (req, res) => {
  const { name, email, password } = req.body;
  let users = getUsers();

  if (users.find((u) => u.email === email)) {
    return res.json({ success: false, message: "Email already exists" });
  }

  users.push({ name, email, password });
  saveUsers(users);

  res.json({ success: true, message: "Signup successful! Please login." });
});

// Login Route
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  let users = getUsers();

  const user = users.find((u) => u.email === email && u.password === password);

  if (!user) {
    return res.json({ success: false, message: "Invalid email or password" });
  }

  res.json({ success: true, message: `Welcome back, ${user.name}` });
});

// Default Route → Serve login page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
// Products file
const PRODUCTS_FILE = path.join(__dirname, "products.json");

// Helper: Get products
function getProducts() {
  if (!fs.existsSync(PRODUCTS_FILE)) return [];
  const data = fs.readFileSync(PRODUCTS_FILE);
  return JSON.parse(data);
}

// Helper: Save products
function saveProducts(products) {
  fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));
}

// ===== PRODUCT CRUD ROUTES =====

// Get all products
app.get("/api/products", (req, res) => {
  res.json(getProducts());
});

// Add new product (CREATE)
app.post("/api/products", (req, res) => {
  const products = getProducts();
  const { name, category, price, stock } = req.body;

  const newProduct = {
    id: Date.now(),
    name,
    category,
    price,
    stock,
  };

  products.push(newProduct);
  saveProducts(products);
  res.json({ success: true, message: "Product added", product: newProduct });
});

// Update product (UPDATE)
app.put("/api/products/:id", (req, res) => {
  const products = getProducts();
  const id = parseInt(req.params.id);
  const { name, category, price, stock } = req.body;

  const index = products.findIndex((p) => p.id === id);
  if (index === -1) {
    return res.json({ success: false, message: "Product not found" });
  }

  products[index] = { ...products[index], name, category, price, stock };
  saveProducts(products);

  res.json({ success: true, message: "Product updated", product: products[index] });
});

// Delete product (DELETE)
app.delete("/api/products/:id", (req, res) => {
  let products = getProducts();
  const id = parseInt(req.params.id);

  products = products.filter((p) => p.id !== id);
  saveProducts(products);

  res.json({ success: true, message: "Product deleted" });
});
