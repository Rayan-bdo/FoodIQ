const mongoose = require("mongoose");

const scanHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  barcode: {
    type: String,
    required: true
  },
  productName: {
    type: String,
    required: true
  },
  brand: {
    type: String,
    default: ""
  },
  image: {
    type: String,
    default: null
  },
  nutriScore: {
    type: String,
    default: null
  },
  calories: {
    type: Number,
    default: null
  },
  proteins: {
    type: Number,
    default: null
  },
  carbs: {
    type: Number,
    default: null
  },
  fat: {
    type: Number,
    default: null
  },
  saturatedFat: {
    type: Number,
    default: null
  },
  sugar: {
    type: Number,
    default: null
  },
  salt: {
    type: Number,
    default: null
  },
  sodium: {
    type: Number,
    default: null
  },
  fiber: {
    type: Number,
    default: null
  },
  scannedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("ScanHistory", scanHistorySchema);