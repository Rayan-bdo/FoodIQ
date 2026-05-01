/**
 * Score nutritionnel 0-100 par nutriment pondéré
 * Chaque nutriment a son propre score 0-100, puis on fait une moyenne pondérée
 * Un seul nutriment mauvais peut tirer le score vers le bas
 */

// Score d'un nutriment négatif : 100 = parfait, 0 = très mauvais
function scoreSugar(g) {
  if (g == null) return null;
  if (g <= 1)   return 100;
  if (g <= 3)   return 80;
  if (g <= 5)   return 60;
  if (g <= 8)   return 40;
  if (g <= 12)  return 20;
  return 0; // > 12g → mauvais
}

function scoreSaturatedFat(g) {
  if (g == null) return null;
  if (g <= 0.5) return 100;
  if (g <= 1.5) return 80;
  if (g <= 3)   return 60;
  if (g <= 5)   return 40;
  if (g <= 8)   return 20;
  return 0;
}

function scoreSalt(g) {
  if (g == null) return null;
  if (g <= 0.1) return 100;
  if (g <= 0.3) return 80;
  if (g <= 0.6) return 60;
  if (g <= 1)   return 40;
  if (g <= 1.5) return 20;
  return 0;
}

function scoreCalories(kcal) {
  if (kcal == null) return null;
  if (kcal <= 20)  return 100;
  if (kcal <= 80)  return 80;
  if (kcal <= 150) return 60;
  if (kcal <= 300) return 40;
  if (kcal <= 450) return 20;
  return 0;
}

function scoreFat(g) {
  if (g == null) return null;
  if (g <= 1)   return 100;
  if (g <= 5)   return 80;
  if (g <= 10)  return 60;
  if (g <= 17)  return 40;
  if (g <= 25)  return 20;
  return 0;
}

// Score d'un nutriment positif : 100 = beaucoup, 0 = pas du tout
function scoreFiber(g) {
  if (g == null) return null;
  if (g >= 6)   return 100;
  if (g >= 3)   return 70;
  if (g >= 1.5) return 40;
  if (g >= 0.5) return 20;
  return 0;
}

function scoreProteins(g) {
  if (g == null) return null;
  if (g >= 20)  return 100;
  if (g >= 10)  return 70;
  if (g >= 5)   return 40;
  if (g >= 2)   return 20;
  return 0;
}

export function calculateScore(product) {
  const scores = [];

  // Nutriments négatifs — poids élevé
  const sugar = scoreSugar(product.sugar);
  if (sugar !== null) scores.push({ score: sugar, weight: 30 });

  const satFat = scoreSaturatedFat(product.saturatedFat);
  if (satFat !== null) scores.push({ score: satFat, weight: 20 });

  const salt = scoreSalt(product.salt);
  if (salt !== null) scores.push({ score: salt, weight: 20 });

  const cal = scoreCalories(product.calories);
  if (cal !== null) scores.push({ score: cal, weight: 15 });

  const fat = scoreFat(product.fat);
  if (fat !== null) scores.push({ score: fat, weight: 10 });

  // Nutriments positifs — poids modéré
  const fiber = scoreFiber(product.fiber);
  if (fiber !== null) scores.push({ score: fiber, weight: 15 });

  const proteins = scoreProteins(product.proteins);
  if (proteins !== null) scores.push({ score: proteins, weight: 10 });

  if (scores.length === 0) {
    // Pas de données → on se base sur le Nutri-Score uniquement
    const fallback = { a: 85, b: 65, c: 45, d: 25, e: 10 };
    const ns = (product.nutriScore || "").toLowerCase();
    return fallback[ns] ?? 50;
  }

  // Moyenne pondérée
  const totalWeight = scores.reduce((sum, s) => sum + s.weight, 0);
  const weightedSum = scores.reduce((sum, s) => sum + s.score * s.weight, 0);
  let score = Math.round(weightedSum / totalWeight);

  // Ajustement Nutri-Score léger (±8 pts max)
  const nutriAdjust = { a: 8, b: 4, c: 0, d: -5, e: -8 };
  const ns = (product.nutriScore || "").toLowerCase();
  if (nutriAdjust[ns] !== undefined) score += nutriAdjust[ns];

  return Math.min(100, Math.max(0, score));
}

export function getScoreColor(score) {
  if (score >= 75) return "#1e8f4e";
  if (score >= 50) return "#85bb2f";
  if (score >= 25) return "#ee8100";
  return "#e63312";
}

export function getScoreLabel(score, lang = "fr") {
  const labels = {
    fr: { excellent: "Excellent", bon: "Bon", mediocre: "Médiocre", mauvais: "Mauvais" },
    en: { excellent: "Excellent", bon: "Good", mediocre: "Poor", mauvais: "Bad" },
    ar: { excellent: "ممتاز", bon: "جيد", mediocre: "ضعيف", mauvais: "سيئ" },
  };
  const l = labels[lang] || labels.fr;
  if (score >= 75) return l.excellent;
  if (score >= 50) return l.bon;
  if (score >= 25) return l.mediocre;
  return l.mauvais;
}