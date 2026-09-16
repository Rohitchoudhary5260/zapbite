const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Rider = require('../models/Rider');
const Order = require('../models/Order');

// In-memory memory store for riders & active orders
let memoryRiders = [
  {
    riderId: 'RID-101',
    name: 'Vikram Singh',
    phone: '9812345671',
    vehicleNumber: 'DL 04 AB 8812',
    vehicleType: 'Bike',
    city: 'Delhi NCR',
    isOnline: true,
    status: 'available',
    rating: 4.9,
    totalDeliveries: 34,
    totalEarnings: 2040,
    todayEarnings: 360,
    payoutBalance: 1200,
    joinedAt: new Date(Date.now() - 30 * 86400000),
  },
  {
    riderId: 'RID-102',
    name: 'Rohit Sharma',
    phone: '9812345672',
    vehicleNumber: 'DL 08 CD 4321',
    vehicleType: 'EV',
    city: 'Delhi NCR',
    isOnline: true,
    status: 'on_delivery',
    rating: 4.85,
    totalDeliveries: 28,
    totalEarnings: 1680,
    todayEarnings: 240,
    payoutBalance: 840,
    joinedAt: new Date(Date.now() - 20 * 86400000),
  },
  {
    riderId: 'RID-103',
    name: 'Amit Verma',
    phone: '9812345673',
    vehicleNumber: 'DL 03 EF 9920',
    vehicleType: 'Scooter',
    city: 'Delhi NCR',
    isOnline: false,
    status: 'offline',
    rating: 4.95,
    totalDeliveries: 45,
    totalEarnings: 2700,
    todayEarnings: 420,
    payoutBalance: 1560,
    joinedAt: new Date(Date.now() - 40 * 86400000),
  },
];

let memoryOrders = [
  {
    id: 'ZB-5901-DEL',
    userId: '9876543210',
    status: 'PACKED',
    bill: { grandTotal: 310, itemTotal: 306, deliveryFee: 0, handlingFee: 4 },
    items: [
      { id: 'amul_milk_toned', name: 'Amul Taaza Milk 500ml', price: 27, quantity: 2, unit: '500 ml' },
      { id: 'fresh_potato', name: 'Fresh Pahadi Potato 1kg', price: 34, quantity: 2, unit: '1 kg' },
      { id: 'fortune_oil', name: 'Fortune Sunlite 1L', price: 145, quantity: 1, unit: '1 L' },
    ],
    deliveryAddress: { line1: 'Flat 402, Royal Palms Heights, Sector 62', city: 'Noida' },
    deliveryPartner: { name: 'Vikram Singh', phone: '+91 9812345671', vehicle: 'Bike (DL 04 AB 8812)' },
    createdAt: new Date(),
  },
  {
    id: 'ZB-7812-BLN',
    userId: '9899112233',
    status: 'PLACED',
    bill: { grandTotal: 180, itemTotal: 176, deliveryFee: 0, handlingFee: 4 },
    items: [
      { id: 'amul_butter', name: 'Amul Butter 100g', price: 58, quantity: 2, unit: '100 g' },
      { id: 'harvest_bread', name: 'Harvest Gold White Bread', price: 45, quantity: 1, unit: '400 g' },
    ],
    deliveryAddress: { line1: 'Tower B, Flat 1002, Sector 128', city: 'Noida' },
    createdAt: new Date(Date.now() - 10 * 60000),
  }
];

// 1. Register new Rider (Create ID)
router.post('/register', async (req, res) => {
  try {
    const { name, phone, vehicleNumber, vehicleType, city } = req.body;

    if (!name || !phone || !vehicleNumber) {
      return res.status(400).json({ success: false, message: 'Name, mobile number, and vehicle number are required' });
    }

    const randomNum = Math.floor(100 + Math.random() * 900);
    const riderId = `RID-${randomNum}`;

    let riderObj = {
      riderId,
      name: name.trim(),
      phone: phone.trim(),
      vehicleNumber: vehicleNumber.trim().toUpperCase(),
      vehicleType: vehicleType || 'Bike',
      city: city || 'Delhi NCR',
      isOnline: true,
      status: 'available',
      rating: 5.0,
      totalDeliveries: 0,
      totalEarnings: 100, // ₹100 Welcome Joining Bonus
      todayEarnings: 100,
      payoutBalance: 100,
      joinedAt: new Date(),
    };

    if (mongoose.connection.readyState === 1) {
      try {
        const existing = await Rider.findOne({ phone });
        if (existing) {
          return res.status(400).json({
            success: false,
            alreadyExists: true,
            message: `A rider already exists with mobile number ${phone}. Rider ID: ${existing.riderId}`,
            rider: existing,
          });
        }
        const created = await Rider.create(riderObj);
        riderObj = created;
      } catch (e) {}
    }

    memoryRiders.unshift(riderObj);

    res.json({
      success: true,
      message: `🎉 Rider ID ${riderId} created successfully with ₹100 Joining Bonus!`,
      rider: riderObj,
    });
  } catch (err) {
    console.error('Rider register error:', err);
    res.status(500).json({ success: false, message: 'Server error registering rider', error: err.message });
  }
});

// 2. Login Rider
router.post('/login', async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ success: false, message: 'Mobile number is required' });
    }

    let rider = null;
    if (mongoose.connection.readyState === 1) {
      try {
        rider = await Rider.findOne({ phone });
      } catch (e) {}
    }

    if (!rider) {
      rider = memoryRiders.find(r => r.phone === phone);
    }

    if (!rider) {
      const randomNum = Math.floor(100 + Math.random() * 900);
      const riderId = `RID-${randomNum}`;
      rider = {
        riderId,
        name: 'Zaptite Partner',
        phone,
        vehicleNumber: 'DL 05 ZT ' + randomNum,
        vehicleType: 'Bike',
        city: 'Delhi NCR',
        isOnline: true,
        status: 'available',
        rating: 5.0,
        totalDeliveries: 0,
        totalEarnings: 100,
        todayEarnings: 100,
        payoutBalance: 100,
        joinedAt: new Date(),
      };
      memoryRiders.push(rider);
    }

    res.json({
      success: true,
      message: `Welcome back, ${rider.name}!`,
      rider,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error logging in', error: err.message });
  }
});

// 3. Get Rider Profile
router.get('/profile/:idOrPhone', async (req, res) => {
  try {
    const { idOrPhone } = req.params;
    let rider = null;

    if (mongoose.connection.readyState === 1) {
      try {
        rider = await Rider.findOne({ $or: [{ riderId: idOrPhone }, { phone: idOrPhone }] });
      } catch (e) {}
    }

    if (!rider) {
      rider = memoryRiders.find(r => r.riderId === idOrPhone || r.phone === idOrPhone);
    }

    if (!rider) {
      return res.status(404).json({ success: false, message: 'Rider not found' });
    }

    res.json({ success: true, rider });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// 4. Toggle Duty Status (Online / Offline)
router.put('/:riderId/duty', async (req, res) => {
  try {
    const { riderId } = req.params;
    const { isOnline } = req.body;

    let rider = memoryRiders.find(r => r.riderId === riderId);
    if (rider) {
      rider.isOnline = isOnline !== undefined ? isOnline : !rider.isOnline;
      rider.status = rider.isOnline ? 'available' : 'offline';
    }

    if (mongoose.connection.readyState === 1) {
      try {
        const dbRider = await Rider.findOne({ riderId });
        if (dbRider) {
          dbRider.isOnline = isOnline !== undefined ? isOnline : !dbRider.isOnline;
          dbRider.status = dbRider.isOnline ? 'available' : 'offline';
          await dbRider.save();
          rider = dbRider;
        }
      } catch (e) {}
    }

    res.json({
      success: true,
      message: `Duty status updated: ${rider?.isOnline ? 'Online 🟢' : 'Offline 🔴'}`,
      rider,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error updating duty' });
  }
});

// 5. Get Rider Orders
router.get('/:riderId/orders', async (req, res) => {
  try {
    const { riderId } = req.params;
    let activeOrders = [];
    let availableOrders = [];
    let completedOrders = [];

    if (mongoose.connection.readyState === 1) {
      try {
        const rider = await Rider.findOne({ riderId });
        activeOrders = await Order.find({
          'deliveryPartner.name': rider?.name,
          status: { $in: ['PACKED', 'PICKED_UP', 'ON_THE_WAY'] },
        }).sort({ createdAt: -1 });

        availableOrders = await Order.find({
          status: { $in: ['PLACED', 'PACKED'] },
        }).sort({ createdAt: -1 }).limit(10);

        completedOrders = await Order.find({
          status: 'DELIVERED',
          'deliveryPartner.name': rider?.name,
        }).sort({ updatedAt: -1 }).limit(15);
      } catch (e) {}
    }

    if (activeOrders.length === 0 && availableOrders.length === 0) {
      activeOrders = memoryOrders.filter(o => o.status === 'ON_THE_WAY' || o.status === 'PICKED_UP');
      availableOrders = memoryOrders.filter(o => o.status === 'PLACED' || o.status === 'PACKED');
      completedOrders = [
        {
          id: 'ZB-9102-COMP',
          status: 'DELIVERED',
          bill: { grandTotal: 280 },
          items: [{ name: 'Amul Milk & Brown Bread', quantity: 2, price: 140 }],
          deliveryAddress: { line1: 'Tower 4, Green Park', city: 'Noida' },
          deliveredAt: new Date(Date.now() - 35 * 60000),
        }
      ];
    }

    res.json({
      success: true,
      activeOrders,
      availableOrders,
      completedOrders,
      deliveryPayoutPerOrder: 60,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching orders' });
  }
});

// 6. Accept Order
router.post('/:riderId/accept/:orderId', async (req, res) => {
  try {
    const { riderId, orderId } = req.params;

    let targetOrder = memoryOrders.find(o => o.id === orderId);
    let rider = memoryRiders.find(r => r.riderId === riderId);

    if (targetOrder && rider) {
      targetOrder.status = 'PICKED_UP';
      targetOrder.deliveryPartner = {
        name: rider.name,
        phone: rider.phone,
        vehicle: `${rider.vehicleType} (${rider.vehicleNumber})`,
      };
      rider.status = 'on_delivery';
    }

    res.json({
      success: true,
      message: `Order #${orderId} accepted! Heading to pick up.`,
      order: targetOrder,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error accepting order' });
  }
});

// 7. Update Delivery Status (PICKED_UP -> ON_THE_WAY -> DELIVERED)
router.put('/:riderId/order-status/:orderId', async (req, res) => {
  try {
    const { riderId, orderId } = req.params;
    const { nextStatus } = req.body;

    let rider = memoryRiders.find(r => r.riderId === riderId);
    let order = memoryOrders.find(o => o.id === orderId);

    if (order) {
      order.status = nextStatus;
      if (nextStatus === 'DELIVERED') {
        order.deliveredAt = new Date();
      }
    }

    if (nextStatus === 'DELIVERED' && rider) {
      rider.totalDeliveries = (rider.totalDeliveries || 0) + 1;
      rider.totalEarnings = (rider.totalEarnings || 0) + 60;
      rider.todayEarnings = (rider.todayEarnings || 0) + 60;
      rider.payoutBalance = (rider.payoutBalance || 0) + 60;
      rider.status = 'available';
    }

    res.json({
      success: true,
      message: nextStatus === 'DELIVERED'
        ? `🎉 Delivered! ₹60 credited to your Rider Wallet!`
        : `Order #${orderId} is Out for Delivery! 🛵`,
      order,
      rider,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error updating delivery status' });
  }
});

// 8. Rider Earnings
router.get('/:riderId/earnings', async (req, res) => {
  try {
    const { riderId } = req.params;
    let rider = memoryRiders.find(r => r.riderId === riderId) || memoryRiders[0];

    res.json({
      success: true,
      earnings: {
        totalEarnings: rider.totalEarnings,
        todayEarnings: rider.todayEarnings,
        payoutBalance: rider.payoutBalance,
        totalDeliveries: rider.totalDeliveries,
        ratePerOrder: 60,
        rating: rider.rating || 4.9,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching earnings' });
  }
});

// 9. Request Payout
router.post('/:riderId/payout', async (req, res) => {
  try {
    const { riderId } = req.params;
    const { upiId } = req.body;

    let rider = memoryRiders.find(r => r.riderId === riderId) || memoryRiders[0];
    const amount = rider.payoutBalance;
    rider.payoutBalance = 0;

    const txnId = `PAY-ZB-${Math.floor(100000 + Math.random() * 900000)}`;

    res.json({
      success: true,
      message: `✅ ₹${amount} Payout transferred to ${upiId || 'Linked UPI ID'}!`,
      txnId,
      amount,
      rider,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error processing payout' });
  }
});

module.exports = router;
