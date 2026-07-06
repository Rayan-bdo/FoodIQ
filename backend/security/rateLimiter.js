const rateLimit = require("express-rate-limit");

// ── Limiter global (toutes les routes) ──────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,   // 1 minute
  max: 100,                   // 100 requêtes par minute (navigation normale)
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Trop de requêtes. Réessaie dans 1 minute." }
});

// ── Limiter strict pour login/register ──────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,   // ✅ 1 minute au lieu de 15 pour les tests
  max: 20,                    // ✅ 20 tentatives au lieu de 5 pour les tests
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: { error: "Trop de tentatives de connexion. Réessaie dans 1 minute." }
});

// ── Limiter pour le chat IA ──────────────────────────────────────────────────
const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Trop de messages envoyés. Attends une minute avant de continuer." }
});

module.exports = { globalLimiter, authLimiter, aiLimiter };