// backend/controllers/authController.js

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");


// LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 🔹 vérifier champs
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    // 🔹 chercher user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    // 🔹 comparer mot de passe
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: "Wrong password" });
    }

    // 🔹 créer token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // 🔹 envoyer cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: false, //  mettre true en production (HTTPS)
      sameSite: "Lax" //  IMPORTANT pour CORS
    });

    // 🔹 réponse frontend
    return res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Server error" });
  }
};



//  REGISTER
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 🔹 vérifier champs
    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields required" });
    }

    // 🔹 vérifier si user existe déjà
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    // 🔹 hasher mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // 🔹 créer user
    const user = new User({
      name,
      email,
      password: hashedPassword
    });

    await user.save();

    //  1. créer token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    //  2. envoyer cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "Lax"
    });

    //  3. réponse frontend
    return res.status(201).json({
      message: "User created",
      user: {
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

//  LOGOUT ( AJOUT IMPORTANT)
exports.logout = (req, res) => {
  res.clearCookie("token");
  return res.json({ message: "Logged out successfully" });
};