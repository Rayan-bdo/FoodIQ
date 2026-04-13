// backend/server.js

const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

const app = express();

app.use(cors({
  origin: "http://localhost:3000",
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

//  Route test
app.get("/", (req, res) => {
  res.send("FoodIQ API is running 🚀");
});

// Connexion MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.log("❌ DB error:", err));

//  Lance serveur
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
});