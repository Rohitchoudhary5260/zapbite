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

// Root welcome
app.get('/', (req, res) => {
  res.send(`
    <div style="font-family: Arial, sans-serif; padding: 40px; background: #0C8346; color: white; border-radius: 12px; margin: 40px auto; max-width: 650px;">
      <h1>⚡ Zaptite 100% Pure Veg API Server</h1>
      <p>10-Minute Superfast Grocery & Food Delivery with MongoDB Atlas</p>
      <ul>
        <li><a style="color: #FFE58F;" href="/api/health">GET /api/health</a></li>
        <li><a style="color: #FFE58F;" href="/api/categories">GET /api/categories</a></li>
        <li><a style="color: #FFE58F;" href="/api/products">GET /api/products (1000+ Items)</a></li>
        <li><a style="color: #FFE58F;" href="/api/banners">GET /api/banners</a></li>
        <li><a style="color: #FFE58F;" href="/api/coupons">GET /api/coupons</a></li>
        <li><a style="color: #FFE58F;" href="/api/orders">GET /api/orders</a></li>
      </ul>
    </div>
  `);
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
