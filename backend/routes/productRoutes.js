const express = require("express");
const router = express.Router();
const multer = require("multer");
const csv = require("csv-parser");
const fs = require("fs");
const Product = require("../models/Product");

// Configure multer for file uploads
const upload = multer({ dest: "uploads/" });

// Barcode lookup endpoint (kept from original)
router.get("/product/:barcode", async (req, res) => {
  const barcode = req.params.barcode;
  const lang = req.query.lang || "fr";

  try {
    console.log("BARCODE REÇU :", barcode, "| LANGUE :", lang);

    const response = await fetch(
      `https://world.openfoodfacts.org/api/v0/product/${barcode}.json?lc=${lang}&fields=product_name,product_name_${lang},brands,image_url,nutri_score_grade,nutrition_grade_fr,nutriments`
    );

    const data = await response.json();

    console.log("RÉPONSE OPENFOODFACTS :", data);

    if (!data.product) {
      return res.status(404).json({ error: "Produit non trouvé" });
    }

    const nutrients = data.product.nutriments || {};

    const name =
      data.product[`product_name_${lang}`] ||
      data.product.product_name ||
      "Nom non disponible";

    const nutriScore =
      data.product.nutri_score_grade ||
      data.product.nutrition_grade_fr ||
      null;

    console.log("NUTRI-SCORE :", nutriScore);

    return res.json({
      name,
      brand: data.product.brands || "Marque inconnue",
      image: data.product.image_url || null,
      nutriScore,
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

// Import CSV products from scraper
router.post("/products/import", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const retailer = req.body.retailer || "marjane";
    const products = [];

    // Parse CSV file
    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on("data", (row) => {
        products.push({
          idProduits: parseInt(row.idProduits) || 0,
          titres: row.titres,
          prix: row.prix,
          url: row.url,
          retailer: retailer,
          category: "beverages",
          searchKeyword: "lait",
        });
      })
      .on("end", async () => {
        try {
          // Clear existing products for this retailer
          await Product.deleteMany({ retailer });

          // Insert new products
          const result = await Product.insertMany(products);

          // Clean up uploaded file
          fs.unlinkSync(req.file.path);

          return res.json({
            success: true,
            message: `✓ Imported ${result.length} products from ${retailer}`,
            productsCount: result.length,
          });
        } catch (err) {
          console.error("Import error:", err);
          fs.unlinkSync(req.file.path);
          return res.status(500).json({ error: "Error saving products to database" });
        }
      })
      .on("error", (err) => {
        fs.unlinkSync(req.file.path);
        return res.status(400).json({ error: "Error parsing CSV file" });
      });
  } catch (err) {
    console.error("Upload error:", err);
    return res.status(500).json({ error: "Upload error" });
  }
});

// Search products from database
router.get("/products/search", async (req, res) => {
  const { q, retailer } = req.query;

  try {
    let filter = {};

    // Search by title
    if (q) {
      filter.titres = { $regex: q, $options: "i" };
    }

    // Filter by retailer
    if (retailer && retailer !== "all") {
      filter.retailer = retailer;
    }

    // Query database
    const products = await Product.find(filter).limit(50);

    return res.json(products);
  } catch (err) {
    console.error("Search error:", err);
    return res.status(500).json({ error: "Search error" });
  }
});

// Get all products (paginated)
router.get("/products", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const products = await Product.find()
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Product.countDocuments();

    return res.json({
      products,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        total,
        limit,
      },
    });
  } catch (err) {
    console.error("Error fetching products:", err);
    return res.status(500).json({ error: "Error fetching products" });
  }
});

module.exports = router;