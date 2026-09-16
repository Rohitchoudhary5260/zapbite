const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
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
  },
  hindiName: {
    type: String,
    default: '',
  },
  icon: {
    type: String,
    default: '🛒',
  },
  image: {
    type: String,
    default: '',
  },
  color: {
    type: String,
    default: '#F0FFF4',
  },
  accentColor: {
    type: String,
    default: '#0C8346',
  },
  displayOrder: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);

