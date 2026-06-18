const express = require("express");
const ScanHistory = require("../models/ScanHistory");
const authMiddleware = require("../security/authMiddleware");

const router = express.Router();

/* =========================
   SAVE SCAN
========================= */
router.post("/save", authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Utilisateur non authentifié" });
    }

    const {
      barcode, productName, brand, image, nutriScore,
      calories, proteins, carbs, fat, saturatedFat,
      sugar, salt, sodium, fiber
    } = req.body;

    if (!barcode || !productName) {
      return res.status(400).json({ error: "Données produit incomplètes" });
    }

    const newScan = new ScanHistory({
      userId, barcode, productName,
      brand: brand || "",
      image: image || null,
      nutriScore: nutriScore || null,
      calories, proteins, carbs, fat, saturatedFat,
      sugar, salt, sodium, fiber
    });

    await newScan.save();

    return res.status(201).json({ message: "Scan sauvegardé", scan: newScan });

  } catch (err) {
    console.error("Erreur sauvegarde scan:", err);
    return res.status(500).json({ error: "Erreur serveur" });
  }
});

/* =========================
   HISTORY
========================= */
router.get("/history", authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Utilisateur non authentifié" });
    }

    const history = await ScanHistory
      .find({ userId })
      .sort({ scannedAt: -1 });

    return res.json(history);

  } catch (err) {
    console.error("Erreur récupération historique:", err);
    return res.status(500).json({ error: "Erreur serveur" });
  }
});

/* =========================
   DELETE SCAN
========================= */
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;
    const scanId = req.params.id;

    if (!userId) {
      return res.status(401).json({ error: "Utilisateur non authentifié" });
    }

    // Vérifie que le scan appartient bien à cet utilisateur
    const scan = await ScanHistory.findOne({ _id: scanId, userId });

    if (!scan) {
      return res.status(404).json({ error: "Scan introuvable" });
    }

    await ScanHistory.deleteOne({ _id: scanId });

    return res.json({ message: "Scan supprimé" });

  } catch (err) {
    console.error("Erreur suppression scan:", err);
    return res.status(500).json({ error: "Erreur serveur" });
  }
});

module.exports = router;