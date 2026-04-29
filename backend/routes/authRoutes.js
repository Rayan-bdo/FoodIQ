const express = require("express");
const router = express.Router();
const verifyToken = require("../security/authMiddleware");
const {
  login,
  register,
  logout,
  updateProfile,
  changePassword,
} = require("../controllers/authController");

router.post("/login", login);
router.post("/register", register);
router.post("/logout", logout);

router.get("/profile", verifyToken, (req, res) => {
  res.json(req.user);
});

router.put("/profile", verifyToken, updateProfile);

router.post("/change-password", verifyToken, changePassword);

module.exports = router;