const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  idProduits: {
    type: Number,
    required: true
  },

  titres: {
    type: String,
    required: true,
    trim: true
  },

  prix: {
    type: String,
    required: true
  },

  url: {
    type: String,
    required: true
  },

  retailer: {
    type: String,
    enum: ["marjane", "bim", "carrefour"],
    default: "marjane"
  },

  category: {
    type: String,
    default: "beverages"
  },

  searchKeyword: {
    type: String,
    default: "lait"
  },

  createdAt: {
    type: Date,
    default: Date.now
  },

  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster searching
productSchema.index({ titres: "text", retailer: 1, searchKeyword: 1 });

module.exports = mongoose.model("Product", productSchema);
