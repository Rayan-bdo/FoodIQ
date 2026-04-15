const express = require("express");
const router = express.Router();

router.get("/product/:barcode", async (req, res) => {
  const barcode = req.params.barcode;

  try {
    console.log("BARCODE REÇU :", barcode);

    const response = await fetch(
      `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`
    );

    const data = await response.json();

    console.log("RÉPONSE OPENFOODFACTS :", data);

    if (!data.product) {
      return res.status(404).json({ error: "Produit non trouvé" });
    }

    // Accéder aux nutriments correctement
    const nutrients = data.product.nutriments || {};
    
    return res.json({
      name: data.product.product_name || "Nom non disponible",
      brand: data.product.brands || "Marque inconnue",
      image: data.product.image_url || null,
      nutriScore: data.product.nutri_score_grade || null,
      calories: nutrients.energy_kcal_100g ?? nutrients["energy-kcal_100g"] ?? null,
      proteins: nutrients.proteins_100g ?? nutrients["proteins_100g"] ?? null,
      carbs: nutrients.carbohydrates_100g ?? nutrients["carbohydrates_100g"] ?? null,
      fat: nutrients.fat_100g ?? nutrients["fat_100g"] ?? null,
      saturatedFat: nutrients["saturated-fat_100g"] ?? nutrients.saturated_fat_100g ?? null,
      sugar: nutrients.sugars_100g ?? nutrients["sugars_100g"] ?? null,
      salt: nutrients.salt_100g ?? nutrients["salt_100g"] ?? null,
      sodium: nutrients.sodium_100g ?? nutrients["sodium_100g"] ?? null,
      fiber: nutrients.fiber_100g ?? nutrients["fiber_100g"] ?? null,
    });
  } catch (err) {
    console.error("ERREUR BACKEND :", err);
    return res.status(500).json({ error: "Erreur serveur" });
  }
});

module.exports = router;