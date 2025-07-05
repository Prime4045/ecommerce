const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String },
  imageUrl: { type: String },
  stock: { type: Number, required: true },
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', productSchema);