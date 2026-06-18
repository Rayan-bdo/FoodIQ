const express = require("express");
const router = express.Router();
const { spawn } = require("child_process");
const path = require("path");

const SCRAPER_PATH = path.join(__dirname, "../scraper/scraper.py");

function runScraper(query) {
  return new Promise((resolve, reject) => {
    const child = spawn("python", [SCRAPER_PATH, query], {
      env: { ...process.env, PYTHONIOENCODING: "utf-8" }
    });

    let output = "";
    let errorOutput = "";

    child.stdout.setEncoding("utf-8");
    child.stderr.setEncoding("utf-8");

    child.stdout.on("data", (data) => {
      output += data.toString();
    });

    child.stderr.on("data", (data) => {
      errorOutput += data.toString();
    });

    child.on("close", (code) => {
      if (code !== 0 && !output) {
        return reject(new Error(errorOutput || "Scraper failed"));
      }
      try {
        const result = JSON.parse(output);
        resolve(result);
      } catch (e) {
        reject(new Error("Failed to parse scraper output: " + output));
      }
    });
  });
}

// GET /api/scrape?q=sidi+ali
router.get("/", async (req, res) => {
  const query = req.query.q;

  if (!query || query.trim() === "") {
    return res.status(400).json({ error: "Query parameter 'q' is required" });
  }

  try {
    console.log(`[Scraper] Searching for: ${query}`);
    const produits = await runScraper(query.trim());

    if (produits.error) {
      return res.status(500).json({ error: produits.error });
    }

    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.json({ success: true, query, results: produits });
  } catch (err) {
    console.error("[Scraper] Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/scrape/barcode/:code
router.get("/barcode/:code", async (req, res) => {
  const code = req.params.code;

  if (!code) {
    return res.status(400).json({ error: "Barcode is required" });
  }

  try {
    console.log(`[Scraper] Searching by barcode: ${code}`);
    const produits = await runScraper(code);

    if (produits.error) {
      return res.status(500).json({ error: produits.error });
    }

    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.json({ success: true, barcode: code, results: produits });
  } catch (err) {
    console.error("[Scraper] Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
