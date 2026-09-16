const mongoose = require('mongoose');

const riderSchema = new mongoose.Schema({
  riderId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  vehicleNumber: {
    type: String,
    required: true,
    trim: true,
  },
  vehicleType: {
    type: String,
    enum: ['Bike', 'Scooter', 'EV', 'Bicycle'],
    default: 'Bike',
  },
  city: {
    type: String,
    default: 'Delhi NCR',
  },
  isOnline: {
    type: Boolean,
    default: true,
  },
  status: {
    type: String,
    enum: ['available', 'on_delivery', 'offline'],
    default: 'available',
  },
  rating: {
    type: Number,
    default: 4.9,
  },
  totalDeliveries: {
    type: Number,
    default: 0,
  },
  totalEarnings: {
    type: Number,
    default: 0,
  },
  todayEarnings: {
    type: Number,
    default: 0,
  },
  payoutBalance: {
    type: Number,
    default: 0,
  },
  joinedAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

module.exports = mongoose.model('Rider', riderSchema);
