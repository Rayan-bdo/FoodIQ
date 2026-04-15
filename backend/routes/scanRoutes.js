const express = require("express");
const ScanHistory = require("../models/ScanHistory");
const authMiddleware = require("../security/authMiddleware");

const router = express.Router();

// Sauvegarder un scan
router.post("/save", authMiddleware, async (req, res) => {
  try {
    const { barcode, productName, brand, image, nutriScore, calories, proteins, carbs, fat, saturatedFat, sugar, salt, sodium, fiber } = req.body;
    const userId = req.user.id; // De authMiddleware

    const newScan = new ScanHistory({
      userId,
      barcode,
      productName,
      brand,
      image,
      nutriScore,
      calories,
      proteins,
      carbs,
      fat,
      saturatedFat,
      sugar,
      salt,
      sodium,
      fiber
    });

    await newScan.save();
    res.status(201).json({ message: "Scan sauvegardé" });
  } catch (err) {
    console.error("Erreur sauvegarde scan:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Récupérer l'historique des scans de l'utilisateur
router.get("/history", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const history = await ScanHistory.find({ userId }).sort({ scannedAt: -1 });
    res.json(history);
  } catch (err) {
    console.error("Erreur récupération historique:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

module.exports = router;