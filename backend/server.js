// backend/server.js

const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");

dotenv.config();

const app = express();
app.set("trust proxy", 1);

app.use(express.json());
app.use(cookieParser());

app.use((req, res, next) => {
  console.log(`📥 [${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

app.get("/api/test", (req, res) => {
  console.log("✅ Test endpoint hit!");
  res.json({ message: "Backend is working!" });
});

console.log("📝 Test route registered");

const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);
console.log("📝 Auth routes registered");

const scanRoutes = require("./routes/scanRoutes");
app.use("/api/scans", scanRoutes);

// ✅ SCRAPE ROUTES
const scrapeRoutes = require("./routes/scrapeRoutes");
app.use("/api/scrape", scrapeRoutes);
console.log("📝 Scrape routes registered");

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.log("❌ DB error:", err));

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});