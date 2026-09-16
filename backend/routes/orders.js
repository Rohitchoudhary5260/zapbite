const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Order = require('../models/Order');

const memoryOrders = [];

const isDbConnected = () => mongoose.connection.readyState === 1;

// Order status progression simulation intervals
const STATUS_STEPS = ['PLACED', 'PACKED', 'PICKED_UP', 'ON_THE_WAY', 'DELIVERED'];

function startOrderSimulation(orderId) {
  let stepIndex = 0;
  const interval = setInterval(async () => {
    stepIndex++;
    if (stepIndex >= STATUS_STEPS.length) {
      clearInterval(interval);
      return;
    }

    try {
      const nextStatus = STATUS_STEPS[stepIndex];
      const updateData = { status: nextStatus };
      if (nextStatus === 'DELIVERED') {
        updateData.deliveredAt = new Date();
        updateData.deliveryEtaMinutes = 0;
      } else {
        updateData.deliveryEtaMinutes = Math.max(1, 10 - stepIndex * 2);
      }

      if (isDbConnected()) {
        await Order.findOneAndUpdate({ id: orderId, status: { $ne: 'CANCELLED' } }, updateData);
      }
      const memOrder = memoryOrders.find(o => o.id === orderId);
      if (memOrder && memOrder.status !== 'CANCELLED') {
        Object.assign(memOrder, updateData);
      }
      console.log(`🛵 Order ${orderId} -> ${nextStatus}`);
    } catch (err) {
      console.error(`Simulation error for order ${orderId}:`, err);
      clearInterval(interval);
    }
  }, 7000);
}

// Create Order
router.post('/', async (req, res) => {
  try {
    const { items, bill, paymentMethod, deliveryAddress, deliveryInstructions, tip, userId } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart items cannot be empty' });
    }

    const orderId = `ZT-${Math.floor(1000 + Math.random() * 9000)}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`;

    const orderObj = {
      id: orderId,
      userId: userId || '9876543210',
      items,
      bill: bill || {
        itemTotal: items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        deliveryFee: 0,
        handlingFee: 4,
        tip: tip || 0,
        discount: 0,
        grandTotal: items.reduce((sum, item) => sum + (item.price * item.quantity), 0) + 4 + (tip || 0),
        savingsTotal: 40,
      },
      status: 'PLACED',
      deliveryEtaMinutes: 10,
      paymentMethod: paymentMethod || 'UPI',
      paymentStatus: paymentMethod === 'Cash on Delivery' ? 'PENDING' : 'PAID',
      deliveryAddress: deliveryAddress || {
        tag: 'Home',
        line1: 'Flat 402, Royal Palms Heights',
        line2: 'Sector 62',
        city: 'Noida',
        pincode: '201301',
      },
      deliveryPartner: {
        name: 'Amit Kumar',
        phone: '+91 98112 34567',
        vehicle: 'Electric Superbike (DL 3S CD 8912)',
        rating: 4.9,
        deliveriesCount: 1140,
      },
      deliveryInstructions: deliveryInstructions || [],
      tip: tip || 0,
      createdAt: new Date(),
    };

    if (isDbConnected()) {
      try {
        const newOrder = await Order.create(orderObj);
        startOrderSimulation(orderId);
        return res.status(201).json({
          success: true,
          message: '⚡ Order placed successfully! Delivering in 10 minutes.',
          order: newOrder,
        });
      } catch (e) {
        console.warn('Order DB insert fallback to memory:', e.message);
      }
    }

    memoryOrders.unshift(orderObj);
    startOrderSimulation(orderId);

    res.status(201).json({
      success: true,
      message: '⚡ Order placed successfully! Delivering in 10 minutes.',
      order: orderObj,
    });
  } catch (err) {
    console.error('Error placing order:', err);
    res.status(500).json({ success: false, message: 'Failed to place order', error: err.message });
  }
});

// Get all orders
router.get('/', async (req, res) => {
  const { userId } = req.query;
  try {
    if (isDbConnected()) {
      const filter = userId ? { userId } : {};
      const orders = await Order.find(filter).sort({ createdAt: -1 }).limit(50);
      if (orders && orders.length > 0) {
        return res.json({
          success: true,
          count: orders.length,
          orders,
        });
      }
    }
  } catch (err) {}

  const filtered = userId ? memoryOrders.filter(o => o.userId === userId) : memoryOrders;
  res.json({
    success: true,
    count: filtered.length,
    orders: filtered,
  });
});

// Get single order with live status
router.get('/:id', async (req, res) => {
  try {
    if (isDbConnected()) {
      const order = await Order.findOne({ id: req.params.id });
      if (order) {
        return res.json({ success: true, order });
      }
    }
  } catch (err) {}

  const order = memoryOrders.find(o => o.id === req.params.id);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }
  res.json({ success: true, order });
});

// Cancel order
router.post('/:id/cancel', async (req, res) => {
  try {
    let order = null;
    if (isDbConnected()) {
      order = await Order.findOne({ id: req.params.id });
    }
    if (!order) {
      order = memoryOrders.find(o => o.id === req.params.id);
    }
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    if (order.status !== 'PLACED' && order.status !== 'PACKED') {
      return res.status(400).json({ success: false, message: 'Order cannot be cancelled now as rider is on the way.' });
    }

    order.status = 'CANCELLED';
    if (order.save) await order.save();

    res.json({
      success: true,
      message: 'Order cancelled successfully. Refund will be credited to your wallet.',
      order,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to cancel order' });
  }
});

module.exports = router;
