// backend/routes/authRoutes.js

const express = require("express");
const router = express.Router();
const verifyToken = require("../security/authMiddleware");
const { login, register, logout } = require("../controllers/authController");

router.post("/login", login);
router.post("/register", register);
router.post("/logout", logout);

router.get("/profile", verifyToken, (req, res) => {
  res.json(req.user);
});

module.exports = router;