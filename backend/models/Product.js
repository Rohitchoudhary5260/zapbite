const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  hindiName: {
    type: String,
    default: '',
  },
  brand: {
    type: String,
    default: '',
    trim: true,
    index: true,
  },
  category: {
    type: String,
    required: true,
    index: true,
  },
  categoryName: {
    type: String,
    required: true,
  },
  subCategory: {
    type: String,
    default: 'General',
    index: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  mrp: {
    type: Number,
    required: true,
    min: 0,
  },
  discount: {
    type: Number,
    default: 0,
  },
  unit: {
    type: String,
    required: true,
    default: '1 pc',
  },
  image: {
    type: String,
    required: true,
  },
  isVeg: {
    type: Boolean,
    default: true,
    required: true,
  },
  inStock: {
    type: Boolean,
    default: true,
  },
  stockQuantity: {
    type: Number,
    default: 100,
  },
  eta: {
    type: String,
    default: '8-10 MINS',
  },
  rating: {
    type: Number,
    default: 4.8,
  },
  reviewsCount: {
    type: Number,
    default: 120,
  },
  description: {
    type: String,
    default: '',
  },
  tags: [{
    type: String,
  }],
  isBestSeller: {
    type: Boolean,
    default: false,
  },
  isLightningDeal: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

// Text index for superfast fuzzy search across name, brand, description, tags
productSchema.index({ name: 'text', brand: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Product', productSchema);

