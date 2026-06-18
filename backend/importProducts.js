#!/usr/bin/env node

/**
 * Import CSV Products to MongoDB
 * Usage: node importProducts.js <csv_file> [retailer]
 * Example: node importProducts.js produits_marjane.csv marjane
 */

const fs = require("fs");
const csv = require("csv-parser");
const mongoose = require("mongoose");
require("dotenv").config();

const Product = require("./models/Product");

const csvFile = process.argv[2];
const retailer = process.argv[3] || "marjane";

if (!csvFile) {
  console.error("❌ Error: Please provide CSV file path");
  console.error("Usage: node importProducts.js <csv_file> [retailer]");
  process.exit(1);
}

if (!fs.existsSync(csvFile)) {
  console.error(`❌ Error: File not found: ${csvFile}`);
  process.exit(1);
}

console.log("📂 Connecting to MongoDB...");
console.log(`📂 CSV File: ${csvFile}`);
console.log(`🏪 Retailer: ${retailer}`);

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("✅ Connected to MongoDB");

    const products = [];

    // Parse CSV
    fs.createReadStream(csvFile)
      .pipe(csv())
      .on("data", (row) => {
        // Filter out empty/header rows
        if (row.titres && row.titres !== "titres") {
          products.push({
            idProduits: parseInt(row.idProduits) || 0,
            titres: row.titres.trim(),
            prix: row.prix.trim(),
            url: row.url.trim(),
            retailer: retailer,
            category: "beverages",
            searchKeyword: "lait",
          });
        }
      })
      .on("end", async () => {
        try {
          console.log(`\n📊 Parsed ${products.length} products from CSV`);

          // Clear existing products for this retailer
          console.log(`🗑️  Clearing existing ${retailer} products...`);
          await Product.deleteMany({ retailer });

          // Insert new products
          console.log(`💾 Saving products to database...`);
          const result = await Product.insertMany(products);

          console.log(`\n✅ SUCCESS!`);
          console.log(`📦 Imported ${result.length} products`);
          console.log(`🏪 Retailer: ${retailer}`);
          console.log(`📅 Timestamp: ${new Date().toLocaleString()}`);

          process.exit(0);
        } catch (err) {
          console.error(`❌ Error saving to database:`, err.message);
          process.exit(1);
        }
      })
      .on("error", (err) => {
        console.error(`❌ Error reading CSV:`, err.message);
        process.exit(1);
      });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });
