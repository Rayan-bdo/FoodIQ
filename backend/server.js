const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const helmet = require("helmet");
dotenv.config({
  path: path.resolve(__dirname, ".env"),
  override: true,
});

console.log("ENV status:", {
  MONGO_URI: !!process.env.MONGO_URI,
  JWT_SECRET: !!process.env.JWT_SECRET,
  HUGGINGFACE_API_KEY: !!process.env.HUGGINGFACE_API_KEY,
  GROQ_API_KEY: !!process.env.GROQ_API_KEY,
});

const app = express();
app.set("trust proxy", 1);

// ── Helmet (headers de sécurité HTTP) ───────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.groq.com"],
    },
  },
}));

app.use(cors({
  origin: [
    "http://localhost:3000",
    "http://localhost:5173",
    "https://panic-crystal-accompany.ngrok-free.dev",
  ],
  credentials: true,
}));

app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());

app.use((req, res, next) => {
  console.log("➡️ REQUEST:", req.method, req.originalUrl);
  next();
});

// ── Rate limiters ────────────────────────────────────────────────────────────
const { globalLimiter, authLimiter } = require("./security/rateLimiter");
app.use(globalLimiter); // global sur toutes les routes

// ── Routes ───────────────────────────────────────────────────────────────────
const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authLimiter, authRoutes); // 5 tentatives/15min sur login

const productRoutes = require("./routes/productRoutes");
app.use("/api", productRoutes);

const scanRoutes = require("./routes/scanRoutes");
app.use("/api/scans", scanRoutes);

const aiRoutes = require("./routes/aiRoutes");
app.use("/api/ai", aiRoutes); // aiLimiter appliqué dans aiRoutes.js

// ── Frontend static ──────────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, "../frontend/build")));
app.use((req, res, next) => {
  if (req.path.startsWith("/api/")) return next();
  res.sendFile(path.join(__dirname, "../frontend/build/index.html"));
});

// ── MongoDB ──────────────────────────────────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.log("❌ DB error:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});