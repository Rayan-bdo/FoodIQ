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

app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://panic-crystal-accompany.ngrok-free.dev"
  ],
  credentials: true
}));

// Middlewares globaux
app.use(express.json()); // lire JSON
app.use(cookieParser()); // lire cookies

// 🔒 (optionnel mais recommandé)
const limiter = require("./security/rateLimiter");
app.use(limiter);

// Routes
const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);


const productRoutes = require("./routes/productRoutes");
app.use("/api", productRoutes);

const scanRoutes = require("./routes/scanRoutes");
app.use("/api/scans", scanRoutes);

// Servir les fichiers statiques du frontend build
app.use(express.static(path.join(__dirname, '../frontend/build')));

// Middleware pour SPA - servir index.html pour les routes non-API
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return next();
  }
  res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
});

// Connexion MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.log("❌ DB error:", err));

//  Lance serveur
const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});