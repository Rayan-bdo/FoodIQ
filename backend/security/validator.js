
const { body, param, validationResult } = require("express-validator");

const validateBarcode = [
  param("barcode").isNumeric().withMessage("Barcode must be numeric"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

module.exports = { validateBarcode };