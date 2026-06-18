const { body, param, validationResult } = require("express-validator");

// ── Helper : renvoie les erreurs si présentes ────────────────────────────────
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }
  next();
};

// ── Login ────────────────────────────────────────────────────────────────────
const validateLogin = [
  body("email")
    .isEmail().withMessage("Email invalide.")
    .normalizeEmail(),
  body("password")
    .notEmpty().withMessage("Mot de passe requis.")
    .isLength({ max: 128 }).withMessage("Mot de passe trop long."),
  handleValidation,
];

// ── Register ─────────────────────────────────────────────────────────────────
const validateRegister = [
  body("name")
    .trim()
    .notEmpty().withMessage("Le nom est requis.")
    .isLength({ min: 2, max: 50 }).withMessage("Le nom doit faire entre 2 et 50 caractères.")
    .matches(/^[a-zA-ZÀ-ÿ\s\-']+$/).withMessage("Le nom contient des caractères invalides."),
  body("email")
    .isEmail().withMessage("Email invalide.")
    .normalizeEmail(),
  body("password")
    .isLength({ min: 8, max: 128 }).withMessage("Le mot de passe doit faire entre 8 et 128 caractères.")
    .matches(/[A-Z]/).withMessage("Le mot de passe doit contenir au moins une majuscule.")
    .matches(/[0-9]/).withMessage("Le mot de passe doit contenir au moins un chiffre."),
  handleValidation,
];

// ── Update profil ─────────────────────────────────────────────────────────────
const validateUpdateProfile = [
  body("name")
    .trim()
    .notEmpty().withMessage("Le nom est requis.")
    .isLength({ min: 2, max: 50 }).withMessage("Le nom doit faire entre 2 et 50 caractères.")
    .matches(/^[a-zA-ZÀ-ÿ\s\-']+$/).withMessage("Le nom contient des caractères invalides."),
  body("email")
    .isEmail().withMessage("Email invalide.")
    .normalizeEmail(),
  body("avatar")
    .optional()
    .isURL().withMessage("L'avatar doit être une URL valide.")
    .isLength({ max: 500 }).withMessage("URL avatar trop longue."),
  handleValidation,
];

// ── Changement de mot de passe ────────────────────────────────────────────────
const validateChangePassword = [
  body("oldPassword")
    .notEmpty().withMessage("Ancien mot de passe requis.")
    .isLength({ max: 128 }).withMessage("Mot de passe trop long."),
  body("newPassword")
    .isLength({ min: 8, max: 128 }).withMessage("Le nouveau mot de passe doit faire entre 8 et 128 caractères.")
    .matches(/[A-Z]/).withMessage("Le nouveau mot de passe doit contenir au moins une majuscule.")
    .matches(/[0-9]/).withMessage("Le nouveau mot de passe doit contenir au moins un chiffre."),
  handleValidation,
];

// ── Barcode (existant) ────────────────────────────────────────────────────────
const validateBarcode = [
  param("barcode")
    .isNumeric().withMessage("Le code-barres doit être numérique.")
    .isLength({ min: 8, max: 14 }).withMessage("Code-barres invalide (8-14 chiffres)."),
  handleValidation,
];

module.exports = {
  validateLogin,
  validateRegister,
  validateUpdateProfile,
  validateChangePassword,
  validateBarcode,
};