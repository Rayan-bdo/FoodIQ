const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ====================== LOGIN ======================
exports.login = async (req, res) => {
  console.log("Login request received:", req.body);

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: "Wrong password" });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
      path: "/"
    });

    return res.status(200).json({
      message: "Login successful",
      user: { id: user._id, name: user.name, email: user.email }
    });

  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

// ====================== REGISTER ======================
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields required" });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({ name, email, password: hashedPassword });
    await user.save();

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
      path: "/"
    });

    return res.status(201).json({
      message: "User created",
      user: { name: user.name, email: user.email }
    });

  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

// ====================== LOGOUT ======================
exports.logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Lax",
    path: "/"
  });

  return res.json({ message: "Logged out successfully" });
};

// ====================== UPDATE PROFILE ======================
exports.updateProfile = async (req, res) => {
  try {
    const { name, email, avatar } = req.body;
    const userId = req.user._id;

    if (!name || name.trim().length < 2) {
      return res.status(400).json({ error: "Le nom doit contenir au moins 2 caractères" });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: "Email invalide" });
    }

    // Vérifie si l'email est déjà pris par un autre utilisateur
    const existing = await User.findOne({ email, _id: { $ne: userId } });
    if (existing) {
      return res.status(400).json({ error: "Cet email est déjà utilisé" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { name: name.trim(), email: email.trim(), ...(avatar && { avatar }) },
      { new: true }
    );

    return res.json({
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      avatar: updatedUser.avatar || null,
    });

  } catch (error) {
    console.error("Update profile error:", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
};

// ====================== CHANGE PASSWORD ======================
exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user._id;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: "Champs manquants" });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: "Le mot de passe doit faire au moins 8 caractères" });
    }

    const user = await User.findById(userId);

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Ancien mot de passe incorrect" });
    }

    if (oldPassword === newPassword) {
      return res.status(400).json({ error: "Le nouveau mot de passe doit être différent" });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(userId, { password: hashed });

    return res.json({ message: "Mot de passe modifié avec succès" });

  } catch (error) {
    console.error("Change password error:", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
};