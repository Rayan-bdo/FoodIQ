/**
 * Score nutritionnel 0-100
 * Base : Nutri-Score officiel Open Food Facts
 * Affinage : ±10 pts selon les nutriments
 * Plafond : cohérence avec le Nutri-Score
 */

const NUTRI_SCORE_BASE = {
  a: 87, b: 67, c: 47, d: 27, e: 10,
};

// Plafond max par Nutri-Score — un E ne peut jamais dépasser 20
const NUTRI_SCORE_CAPS = {
  a: 100, b: 82, c: 62, d: 37, e: 20,
};

// Plancher min par Nutri-Score — un A ne peut jamais être en dessous de 70
const NUTRI_SCORE_FLOORS = {
  a: 70, b: 50, c: 30, d: 15, e: 0,
};

function getNutrientAdjustment(product) {
  let adjust = 0;

  if (product.sugar != null) {
    if (product.sugar > 20)      adjust -= 5;
    else if (product.sugar > 12) adjust -= 3;
    else if (product.sugar < 1)  adjust += 3;
  }

  if (product.saturatedFat != null) {
    if (product.saturatedFat > 10) adjust -= 4;
    else if (product.saturatedFat > 5) adjust -= 2;
    else if (product.saturatedFat < 0.5) adjust += 2;
  }

  if (product.salt != null) {
    if (product.salt > 2)    adjust -= 4;
    else if (product.salt > 1) adjust -= 2;
    else if (product.salt < 0.1) adjust += 2;
  }

  if (product.fiber != null) {
    if (product.fiber >= 6)   adjust += 5;
    else if (product.fiber >= 3) adjust += 3;
    else if (product.fiber >= 1.5) adjust += 1;
  }

  if (product.proteins != null) {
    if (product.proteins >= 20) adjust += 3;
    else if (product.proteins >= 10) adjust += 2;
  }

  if (product.calories != null && product.calories < 5) adjust += 3;

  return Math.max(-10, Math.min(10, adjust));
}

function scoreFromNutrients(product) {
  let score = 100;

  if (product.sugar != null) {
    if (product.sugar > 20)       score -= 35;
    else if (product.sugar > 12)  score -= 25;
    else if (product.sugar > 5)   score -= 12;
    else if (product.sugar > 2)   score -= 5;
  }

  if (product.saturatedFat != null) {
    if (product.saturatedFat > 10) score -= 25;
    else if (product.saturatedFat > 5)  score -= 15;
    else if (product.saturatedFat > 2)  score -= 7;
  }

  if (product.salt != null) {
    if (product.salt > 2)    score -= 20;
    else if (product.salt > 1)    score -= 12;
    else if (product.salt > 0.5)  score -= 6;
  }

  if (product.calories != null) {
    if (product.calories > 500)      score -= 15;
    else if (product.calories > 350) score -= 8;
    else if (product.calories > 200) score -= 4;
  }

  if (product.fiber != null) {
    if (product.fiber >= 6)   score += 10;
    else if (product.fiber >= 3)  score += 6;
    else if (product.fiber >= 1.5) score += 3;
  }

  if (product.proteins != null) {
    if (product.proteins >= 20)   score += 8;
    else if (product.proteins >= 10)  score += 4;
  }

  if (product.calories != null && product.calories < 5) score += 10;

  return Math.min(100, Math.max(0, Math.round(score)));
}

export function calculateScore(product) {
  const ns = (product.nutriScore || "").toLowerCase();

  let score;

  if (NUTRI_SCORE_BASE[ns] !== undefined) {
    const base = NUTRI_SCORE_BASE[ns];
    const adjust = getNutrientAdjustment(product);
    score = Math.round(base + adjust);
  } else {
    score = scoreFromNutrients(product);
  }

  // Applique le plafond et le plancher selon le Nutri-Score
  if (NUTRI_SCORE_CAPS[ns] !== undefined) {
    score = Math.min(score, NUTRI_SCORE_CAPS[ns]);
    score = Math.max(score, NUTRI_SCORE_FLOORS[ns]);
  }

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