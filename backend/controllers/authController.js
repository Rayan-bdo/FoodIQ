// backend/controllers/authController.js
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 🔹 vérifier champs
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    //  chercher user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    //  TEMPORAIRE (plus tard bcrypt)
    if (password !== user.password) {
      return res.status(401).json({ error: "Wrong password" });
    }

    //  créer token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    //  COOKIE (IMPORTANT)
    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // ⚠️ true en production (https)
      sameSite: "Strict"
    });

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        email: user.email
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

//temporaire pour créer un user (à supprimer après tests)

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // vérifier champs
    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields required" });
    }

    // vérifier si user existe déjà
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    // créer user
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
        name,
        email,
       password: hashedPassword
});

await user.save();

    res.status(201).json({ message: "User created" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};