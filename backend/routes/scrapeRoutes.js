const express = require("express");
const router = express.Router();
const { spawn } = require("child_process");
const path = require("path");
const https = require("https");

const SCRAPER_PATH = path.join(__dirname, "../scraper/scraper.py");
const IS_PRODUCTION = process.env.NODE_ENV === "production";

const SCORE_RANK = { A: 1, B: 2, C: 3, D: 4, E: 5 };

const CATEGORY_MAP = [
  { detect: ["m&m", "m&ms", "smarties", "skittles", "haribo", "dragée", "bonbon", "candy", "confiserie", "caramel", "réglisse", "reglisse", "chewing gum", "chewingum", "bubble gum", "mentos", "tic tac", "marshmallow", "guimauve", "nougat", "berlingot", "carambars", "pik", "sour patch", "jellybeans", "lollipop", "sucette", "pastille", "drops", "werther"], query: "chocolat" },
  { detect: ["bounty", "twix", "kitkat", "kit kat", "snickers", "mars bar", "lion bar", "kinder", "ferrero", "raffaello", "rocher", "after eight", "rolo", "maltesers", "milky way", "crunch bar", "aero", "flake", "toblerone", "lindt ball", "lindor", "daim", "dime"], query: "chocolat" },
  { detect: ["biscuit", "cookie", "crackers", "gaufrette", "wafer", "gaufre", "prince", "oreo", "lu ", "petit beurre", "tonik", "tonico", "merendina", "barquette", "madeleine", "brownie", "choco pie", "pepito", "pim's", "bn ", "tuc ", "ritz", "digestive", "hobnob", "leibniz", "bahlsen", "mcvitie", "mc vitie", "granola bar", "cereal bar", "barre céréale", "barre cereale", "nature valley", "speculoos", "spéculoos", "stroopwafel", "langue de chat", "palmier", "sablé", "sable biscuit", "galette", "petit four", "financier", "mini cake"], query: "biscuit" },
  { detect: ["tablette chocolat", "chocolat noir", "chocolat au lait", "chocolat blanc", "nutella", "pâte à tartiner", "praline", "pralinoise", "milka", "lindt", "côte d'or", "cote d or", "chocolat fondant", "chocolat pâtissier", "cacao en poudre", "nesquik poudre", "ovomaltine", "milo poudre"], query: "chocolat" },
  { detect: ["chips", "crisps", "pringles", "doritos", "nachos", "tortilla", "pop corn", "popcorn", "cracotte", "snack salé", "biscuit apéritif", "biscuit aperitif", "pretzel", "bretzel", "bugles", "fritos", "cheetos", "lay's", "lays", "walkers"], query: "chips" },
  { detect: ["céréale", "cereale", "muesli", "granola", "corn flakes", "frosties", "special k", "fitness cereal", "chocapic", "nesquik cereal", "lion cereal", "all bran", "weetabix", "rice krispies", "cheerios", "coco pops"], query: "cereales" },
  { detect: ["glace", "ice cream", "sorbet", "gelato", "frozen yogurt", "magnum", "cornetto", "häagen", "haagen", "ben & jerry", "ben and jerry", "solero"], query: "chocolat" },
  { detect: ["yaourt", "yogurt", "yoghurt", "yoplait", "activia", "danette", "fjord", "fromage blanc", "faisselle", "petit filous", "actimel", "yakult", "skyr"], query: "yaourt" },
  { detect: ["fromage", "cheese", "kiri", "vache qui rit", "laughing cow", "camembert", "brie", "emmental", "gouda", "edam", "gruyère", "gruyere", "feta", "mozzarella", "parmesan", "philadelphia", "cream cheese", "babybel"], query: "fromage" },
  { detect: ["lait uht", "lait entier", "lait demi", "lait écrémé", "lait de vache", "lait concentré", "lait en poudre"], query: "lait" },
  { detect: ["lait d'amande", "lait de soja", "lait d'avoine", "lait de riz", "lait de coco", "boisson végétale", "boisson vegetale", "alpro", "bjorg soja", "sojasun", "oatly"], query: "boisson" },
  { detect: ["red bull", "redbull", "energy drink", "energisante", "energetique", "monster energy", "burn energy", "sting energy", "power drink", "blue energy", "hell energy", "rockstar energy"], query: "boisson" },
  { detect: ["jus d'orange", "jus de pomme", "jus de raisin", "jus tropical", "jus de fruits", "jus multifruits", "jus d'ananas", "jus de mangue", "juice", "nectar", "smoothie", "tropicana", "innocent", "oasis"], query: "jus" },
  { detect: ["coca cola", "coca-cola", "pepsi", "sprite", "fanta", "7up", "seven up", "mirinda", "schweppes", "canada dry", "dr pepper", "mountain dew", "limonade", "orangeade", "ice tea"], query: "boisson" },
  { detect: ["boisson", "drink", "beverage", "jus "], query: "boisson" },
  { detect: ["eau minérale", "eau de source", "eau plate", "eau gazeuse", "sidi ali", "ain atlas", "oulmès", "oulmes", "evian", "volvic", "mineral water", "perrier", "badoit"], query: "eau" },
  { detect: ["pain ", "bread", "brioche", "baguette", "toast", "pain de mie", "pain complet", "pain aux céréales", "croissant", "pain au chocolat", "bagel", "naan", "pita"], query: "pain" },
  { detect: ["confiture", "jam", "marmelade", "gelée de fruits"], query: "confiture" },
  { detect: ["huile", "oil", "margarine", "beurre végétal"], query: "huile" },
  { detect: ["riz ", "rice", "pâtes", "pasta", "spaghetti", "macaroni", "couscous", "semoule", "quinoa"], query: "riz" },
  { detect: ["café", "cafe", "nescafe", "nespresso", "expresso", "cappuccino"], query: "cafe" },
  { detect: ["thé ", "the ", "tisane", "infusion", "herbal tea"], query: "the" },
  { detect: ["miel", "honey"], query: "miel" },
  { detect: ["soupe", "soup", "bouillon", "velouté", "potage"], query: "soupe" },
];

function detectCategoryQuery(productName) {
  const lower = productName.toLowerCase();
  for (const cat of CATEGORY_MAP) {
    if (cat.detect.some(keyword => lower.includes(keyword))) return cat.query;
  }
  return "biscuit";
}

function runScraper(query, forAlternatives = false) {
  return new Promise((resolve) => {
    const args = [SCRAPER_PATH, query];
    if (forAlternatives) args.push("--alternatives");

    const child = spawn("python", args, {
      env: { ...process.env, PYTHONIOENCODING: "utf-8" }
    });

    // Timeout 60 secondes — tue le process si trop long
    const timer = setTimeout(() => {
      child.kill();
      resolve([]);
    }, 60000);

    let output = "", errorOutput = "";
    child.stdout.setEncoding("utf-8");
    child.stderr.setEncoding("utf-8");
    child.stdout.on("data", (data) => { output += data; });
    child.stderr.on("data", (data) => { errorOutput += data; });
    child.on("close", () => {
      clearTimeout(timer);
      try { resolve(JSON.parse(output)); }
      catch { resolve([]); }
    });
  });
}

function fetchNutriScore(title) {
  return new Promise((resolve) => {
    let searchTerm;
    if (title.includes(" - ")) {
      const parts = title.split(" - ");
      const brand = parts[parts.length - 1].trim();
      const name = parts.slice(0, -1).join(" - ").trim();
      const nameWords = name.split(" ").slice(0, 4).join(" ");
      searchTerm = nameWords + " " + brand;
    } else {
      searchTerm = title.split(" ").slice(0, 5).join(" ");
    }
    const url = "https://world.openfoodfacts.org/cgi/search.pl?search_terms=" + encodeURIComponent(searchTerm) + "&action=process&json=1&page_size=10&fields=product_name,nutrition_grades";
    https.get(url, { headers: { "User-Agent": "FoodIQ/1.0" } }, (res) => {
      let data = "";
      res.on("data", (chunk) => { data += chunk; });
      res.on("end", () => {
        try {
          const json = JSON.parse(data);
          const products = json.products || [];
          const found = products.find(p => p.nutrition_grades && p.nutrition_grades.match(/^[a-e]$/i));
          resolve(found ? found.nutrition_grades.toUpperCase() : null);
        } catch { resolve(null); }
      });
    }).on("error", () => resolve(null));
  });
}

router.get("/", async (req, res) => {
  const query = req.query.q;
  if (!query?.trim()) return res.status(400).json({ error: "Query parameter 'q' is required" });
  try {
    console.log(`[Scraper] Searching for: ${query}`);
    const produits = await runScraper(query.trim());
    if (produits.error) return res.status(500).json({ error: produits.error });
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.json({ success: true, query, results: produits });
  } catch (err) {
    console.error("[Scraper] Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

router.get("/barcode/:code", async (req, res) => {
  const code = req.params.code;
  if (!code) return res.status(400).json({ error: "Barcode is required" });
  try {
    const produits = await runScraper(code);
    if (produits.error) return res.status(500).json({ error: produits.error });
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.json({ success: true, barcode: code, results: produits });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/alternatives", async (req, res) => {
  const { q, currentScore } = req.query;
  if (!q?.trim() || !currentScore) return res.status(400).json({ error: "Paramètres 'q' et 'currentScore' requis" });

  const currentRank = SCORE_RANK[currentScore.toUpperCase()];
  if (!currentRank) return res.status(400).json({ error: "currentScore invalide" });

  // En production, le scraper Selenium n'est pas disponible
  if (IS_PRODUCTION) {
    console.log(`[Alternatives] Production mode — scraper désactivé`);
    return res.json({ alternatives: [] });
  }

  try {
    const categoryQuery = detectCategoryQuery(q);
    console.log(`[Alternatives] Query: "${q}" → catégorie: "${categoryQuery}"`);

    const rawResults = await runScraper(categoryQuery, true);
    console.log(`[Alternatives] Résultats: ${rawResults.length}`);
    if (rawResults.length === 0) return res.json({ alternatives: [] });

    let candidates = rawResults;
    const filtered = rawResults.filter(p => p.titre.toLowerCase().includes(categoryQuery.toLowerCase()));
    if (filtered.length >= 3) candidates = filtered;

    const enriched = await Promise.all(
      candidates.slice(0, 30).map(async (p) => {
        const score = await fetchNutriScore(p.titre);
        return { ...p, nutriScore: score };
      })
    );

    const meilleures = enriched
      .filter(p => p.nutriScore && SCORE_RANK[p.nutriScore] < currentRank)
      .sort((a, b) => SCORE_RANK[a.nutriScore] - SCORE_RANK[b.nutriScore])
      .slice(0, 6);

    res.json({ alternatives: meilleures });
  } catch (err) {
    console.error("[Alternatives] Erreur:", err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;