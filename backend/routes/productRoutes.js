const express = require("express");
const router = express.Router();

// route GET /api/product/:barcode
router.get("/product/:barcode", async (req, res) => {
  const barcode = req.params.barcode;

  try {
    const response = await fetch(
      `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`
    );

    const data = await response.json();

    if (!data.product) {
      return res.status(404).json({ error: "Produit non trouvé" });
    }

    res.json({
      name: data.product.product_name,
      proteins: data.product.nutriments.proteins_100g,
      sugar: data.product.nutriments.sugars_100g,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

module.exports = router;