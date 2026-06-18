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
const {
  validateLogin,
  validateRegister,
  validateUpdateProfile,
  validateChangePassword,
} = require("../security/validator");

router.post("/login",           validateLogin,         login);
router.post("/register",        validateRegister,      register);
router.post("/logout",          logout);

router.get("/profile",          verifyToken,           (req, res) => res.json(req.user));
router.put("/profile",          verifyToken, validateUpdateProfile, updateProfile);
router.post("/change-password", verifyToken, validateChangePassword, changePassword);

module.exports = router;