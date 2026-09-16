const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  unit: { type: String, default: '1 pc' },
  image: { type: String, default: '' },
}, { _id: false });

const billSchema = new mongoose.Schema({
  itemTotal: { type: Number, required: true },
  deliveryFee: { type: Number, default: 0 },
  handlingFee: { type: Number, default: 4 },
  tip: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  grandTotal: { type: Number, required: true },
  savingsTotal: { type: Number, default: 0 },
}, { _id: false });

const deliveryAddressSchema = new mongoose.Schema({
  tag: { type: String, default: 'Home' },
  line1: { type: String, required: true },
  line2: { type: String, default: '' },
  city: { type: String, default: 'New Delhi' },
  pincode: { type: String, default: '110001' },
}, { _id: false });

const deliveryPartnerSchema = new mongoose.Schema({
  name: { type: String, default: 'Amit Kumar' },
  phone: { type: String, default: '+91 98112 34567' },
  vehicle: { type: String, default: 'Hero Splendor (DL 3S CD 8912)' },
  rating: { type: Number, default: 4.9 },
  deliveriesCount: { type: Number, default: 1140 },
}, { _id: false });

const orderSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  userId: {
    type: String,
    default: 'user_default',
    index: true,
  },
  items: [orderItemSchema],
  bill: billSchema,
  status: {
    type: String,
    enum: ['PLACED', 'PACKED', 'PICKED_UP', 'ON_THE_WAY', 'DELIVERED', 'CANCELLED'],
    default: 'PLACED',
    index: true,
  },
  deliveryEtaMinutes: {
    type: Number,
    default: 10,
  },
  paymentMethod: {
    type: String,
    default: 'UPI',
  },
  paymentStatus: {
    type: String,
    enum: ['PAID', 'PENDING', 'FAILED', 'REFUNDED'],
    default: 'PAID',
  },
  deliveryAddress: deliveryAddressSchema,
  deliveryPartner: {
    type: deliveryPartnerSchema,
    default: () => ({}),
  },
  deliveryInstructions: [{
    type: String,
  }],
  tip: {
    type: Number,
    default: 0,
  },
  deliveredAt: {
    type: Date,
  },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);

