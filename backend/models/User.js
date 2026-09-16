const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  tag: {
    type: String,
    enum: ['Home', 'Work', 'Other'],
    default: 'Home',
  },
  line1: {
    type: String,
    required: true,
  },
  line2: {
    type: String,
    default: '',
  },
  city: {
    type: String,
    default: 'New Delhi',
  },
  pincode: {
    type: String,
    default: '110001',
  },
  isDefault: {
    type: Boolean,
    default: false,
  },
}, { _id: true });

const userSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  name: {
    type: String,
    default: 'Zaptite Customer',
    trim: true,
  },
  email: {
    type: String,
    default: '',
    trim: true,
    lowercase: true,
  },
  walletBalance: {
    type: Number,
    default: 250,
  },
  addresses: [addressSchema],
  isVerified: {
    type: Boolean,
    default: true,
  },
  role: {
    type: String,
    enum: ['customer', 'admin', 'rider'],
    default: 'customer',
  },
  lastLoginAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);

