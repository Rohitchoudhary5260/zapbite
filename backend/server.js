const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const couponRoutes = require('./routes/coupons');
const riderRoutes = require('./routes/riders');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB Atlas
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/riders', riderRoutes);
app.use('/api/admin', adminRoutes);

// Serve static assets from public folder
app.use(express.static(path.join(__dirname, 'public')));

// Web Portal Routes
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.get('/rider', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'rider.html'));
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    app: 'Zaptite Quick-Commerce REST API (100% Pure Veg)',
    database: 'MongoDB Atlas',
    timestamp: new Date().toISOString(),
    version: '2.0.0'
  });
});

// Root welcome or Web Store
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ success: false, message: 'Internal server error', error: err.message });
});

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 Zaptite Server active on http://localhost:${PORT}`);
  console.log(`⚡ 100% Pure Veg Blinkit-Style API with MongoDB Atlas`);
  console.log(`====================================================`);
});
