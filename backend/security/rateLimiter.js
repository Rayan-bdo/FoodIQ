const rateLimit = require("express-rate-limit");

// ── Limiter global (toutes les routes) ──────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,   // 1 minute
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Trop de tentatives de connexion. Réessaie dans 5 minutes." }
});

// ── Limiter strict pour login/register ──────────────────────────────────────
// 5 tentatives par 15 minutes par IP → brute-force impossible
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // ne compte pas les connexions réussies
  message: {
    error: "Trop de tentatives de connexion. Réessaie dans 15 minutes."
  }
});

// ── Limiter pour le chat IA ──────────────────────────────────────────────────
// 20 messages par minute par IP → évite le spam et l'abus de quota Groq
const aiLimiter = rateLimit({
  windowMs: 60 * 1000,   // 1 minute
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Trop de messages envoyés. Attends une minute avant de continuer."
  }
});

module.exports = { globalLimiter, authLimiter, aiLimiter };