const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    required: true,
  },
  tag: {
    type: String,
    default: 'DEAL',
  },
  image: {
    type: String,
    required: true,
  },
  categoryId: {
    type: String,
    default: '',
  },
  discount: {
    type: String,
    default: 'UP TO 50% OFF',
  },
  bgGradient: [{
    type: String,
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Banner', bannerSchema);

