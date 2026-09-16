const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const path = require('path');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Banner = require('../models/Banner');

// In-memory fallback data for instant response
let memoryCategories = [];
let memoryProducts = [];
let memoryBanners = [];

try {
  memoryCategories = require('../data/categories.json');
} catch (e) {
  memoryCategories = [];
}
try {
  memoryProducts = require('../data/products.json');
} catch (e) {
  memoryProducts = [];
}
try {
  memoryBanners = require('../data/banners.json');
} catch (e) {
  memoryBanners = [];
}

const isDbConnected = () => mongoose.connection.readyState === 1;

// Get all categories
router.get('/categories', async (req, res) => {
  try {
    if (isDbConnected()) {
      const categories = await Category.find({ isActive: true }).sort({ displayOrder: 1 });
      if (categories && categories.length > 0) {
        return res.json({
          success: true,
          count: categories.length,
          categories,
        });
      }
    }
  } catch (err) {
    console.warn('Categories DB query fallback to memory:', err.message);
  }

  // Memory fallback
  res.json({
    success: true,
    count: memoryCategories.length,
    categories: memoryCategories,
  });
});

// Get promotional banners
router.get('/banners', async (req, res) => {
  try {
    if (isDbConnected()) {
      const banners = await Banner.find({ isActive: true });
      if (banners && banners.length > 0) {
        return res.json({
          success: true,
          count: banners.length,
          banners,
        });
      }
    }
  } catch (err) {
    console.warn('Banners DB query fallback to memory:', err.message);
  }

  res.json({
    success: true,
    count: memoryBanners.length,
    banners: memoryBanners,
  });
});

// Get products with filters, search, and pagination
router.get('/products', async (req, res) => {
  const { category, search, vegOnly, sort, limit = 100, page = 1 } = req.query;
  const parsedLimit = Math.min(parseInt(limit, 10) || 100, 300);
  const parsedPage = parseInt(page, 10) || 1;
  const skip = (parsedPage - 1) * parsedLimit;

  try {
    if (isDbConnected()) {
      const filter = { isVeg: true };
      if (category && category !== 'all') {
        filter.category = category;
      }
      if (search && search.trim()) {
        const q = search.trim();
        filter.$or = [
          { name: { $regex: q, $options: 'i' } },
          { brand: { $regex: q, $options: 'i' } },
          { categoryName: { $regex: q, $options: 'i' } },
          { description: { $regex: q, $options: 'i' } },
          { tags: { $regex: q, $options: 'i' } },
        ];
      }

      let query = Product.find(filter);
      if (sort === 'price_asc') query = query.sort({ price: 1 });
      else if (sort === 'price_desc') query = query.sort({ price: -1 });
      else if (sort === 'discount') query = query.sort({ discount: -1 });
      else query = query.sort({ isBestSeller: -1, isLightningDeal: -1, rating: -1 });

      const [products, totalCount] = await Promise.all([
        query.skip(skip).limit(parsedLimit).lean(),
        Product.countDocuments(filter),
      ]);

      if (products && products.length > 0) {
        return res.json({
          success: true,
          count: products.length,
          totalCount,
          page: parsedPage,
          totalPages: Math.ceil(totalCount / parsedLimit),
          products,
        });
      }
    }
  } catch (err) {
    console.warn('Products DB query fallback to memory:', err.message);
  }

  // Fast in-memory filtering fallback
  let filtered = memoryProducts.filter(p => p.isVeg !== false);

  if (category && category !== 'all') {
    filtered = filtered.filter(p => p.category === category || p.categoryName?.toLowerCase().includes(category.toLowerCase()));
  }

  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    filtered = filtered.filter(p =>
      p.name?.toLowerCase().includes(q) ||
      p.brand?.toLowerCase().includes(q) ||
      p.categoryName?.toLowerCase().includes(q) ||
      p.tags?.some(t => t.toLowerCase().includes(q))
    );
  }

  if (sort === 'price_asc') {
    filtered.sort((a, b) => a.price - b.price);
  } else if (sort === 'price_desc') {
    filtered.sort((a, b) => b.price - a.price);
  } else if (sort === 'discount') {
    filtered.sort((a, b) => (b.discount || 0) - (a.discount || 0));
  }

  const paginated = filtered.slice(skip, skip + parsedLimit);

  res.json({
    success: true,
    count: paginated.length,
    totalCount: filtered.length,
    page: parsedPage,
    totalPages: Math.ceil(filtered.length / parsedLimit) || 1,
    products: paginated,
  });
});

// Get single product
router.get('/products/:id', async (req, res) => {
  try {
    if (isDbConnected()) {
      const product = await Product.findOne({ id: req.params.id });
      if (product) {
        return res.json({ success: true, product });
      }
    }
  } catch (err) {}

  const product = memoryProducts.find(p => p.id === req.params.id || p._id === req.params.id);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }
  res.json({ success: true, product });
});

module.exports = router;
