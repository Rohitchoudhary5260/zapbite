const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Coupon = require('../models/Coupon');

const DEFAULT_COUPONS = [
  { code: 'WELCOME250', title: 'Flat ₹250 Off on First Order', type: 'flat', discountAmount: 250, minOrderValue: 299, maxDiscount: 250, isActive: true },
  { code: 'ZAPTITE50', title: '50% Off up to ₹100', type: 'percent', discountPercent: 50, minOrderValue: 149, maxDiscount: 100, isActive: true },
  { code: 'FREESHIP', title: 'Free 10-Minute Delivery', type: 'free_delivery', minOrderValue: 99, isActive: true },
  { code: 'FLAT50', title: 'Flat ₹50 Instant Discount', type: 'flat', discountAmount: 50, minOrderValue: 199, maxDiscount: 50, isActive: true },
];

const isDbConnected = () => mongoose.connection.readyState === 1;

// Get all active coupons
router.get('/', async (req, res) => {
  try {
    if (isDbConnected()) {
      const coupons = await Coupon.find({ isActive: true });
      if (coupons && coupons.length > 0) {
        return res.json({
          success: true,
          count: coupons.length,
          coupons,
        });
      }
    }
  } catch (err) {
    console.warn('Coupons DB query fallback:', err.message);
  }

  res.json({
    success: true,
    count: DEFAULT_COUPONS.length,
    coupons: DEFAULT_COUPONS,
  });
});

// Apply coupon code
router.post('/apply', async (req, res) => {
  try {
    const { code, orderAmount = 0 } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, message: 'Coupon code is required' });
    }

    let coupon = null;
    if (isDbConnected()) {
      try {
        coupon = await Coupon.findOne({ code: code.trim().toUpperCase(), isActive: true });
      } catch (e) {}
    }

    if (!coupon) {
      coupon = DEFAULT_COUPONS.find(c => c.code === code.trim().toUpperCase() && c.isActive);
    }

    if (!coupon) {
      return res.status(404).json({
        success: false,
        discount: 0,
        message: 'Invalid coupon code. Try WELCOME250, ZAPTITE50, FREESHIP or FLAT50',
      });
    }

    if (orderAmount < coupon.minOrderValue) {
      return res.status(400).json({
        success: false,
        discount: 0,
        message: `Min order value for ${coupon.code} is ₹${coupon.minOrderValue}. Add items worth ₹${coupon.minOrderValue - orderAmount} more.`,
      });
    }

    let discount = 0;
    if (coupon.type === 'flat') {
      discount = coupon.discountAmount || 50;
    } else if (coupon.type === 'percent') {
      discount = Math.min((orderAmount * (coupon.discountPercent || 50)) / 100, coupon.maxDiscount || 100);
    } else if (coupon.type === 'free_delivery') {
      discount = 25;
    }

    res.json({
      success: true,
      discount: Math.round(discount),
      message: `🎉 Coupon ${coupon.code} applied! Saved ₹${Math.round(discount)}`,
      coupon: {
        code: coupon.code,
        title: coupon.title,
        type: coupon.type,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error applying coupon' });
  }
});

module.exports = router;
