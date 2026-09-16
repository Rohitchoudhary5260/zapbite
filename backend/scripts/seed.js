const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const Banner = require('../models/Banner');
const User = require('../models/User');

const CATEGORIES_DATA = [
  { id: 'dairy_bread', name: 'Dairy, Bread & Butter', hindiName: 'दूध, दही और मक्खन', icon: '🥛', color: '#EBF8FF', accentColor: '#0284C7', displayOrder: 1 },
  { id: 'vegetables', name: 'Fresh Vegetables', hindiName: 'ताज़ा सब्ज़ियाँ', icon: '🥦', color: '#F0FDF4', accentColor: '#0C8346', displayOrder: 2 },
  { id: 'fruits', name: 'Fresh Fruits', hindiName: 'ताज़े फल', icon: '🍎', color: '#FEF2F2', accentColor: '#DC2626', displayOrder: 3 },
  { id: 'atta_rice_dal', name: 'Atta, Rice & Dal', hindiName: 'आटा, चावल और दाल', icon: '🌾', color: '#FFFBEB', accentColor: '#D97706', displayOrder: 4 },
  { id: 'oils_masalas', name: 'Oils, Ghee & Masalas', hindiName: 'तेल, घी और मसाले', icon: '🫙', color: '#FFF7ED', accentColor: '#EA580C', displayOrder: 5 },
  { id: 'munchies', name: 'Snacks & Munchies', hindiName: 'नमकीन और चिप्स', icon: '🍟', color: '#FEF3C7', accentColor: '#B45309', displayOrder: 6 },
  { id: 'bakery_biscuits', name: 'Bakery & Biscuits', hindiName: 'बिस्कुट और कुकीज़', icon: '🍪', color: '#FDF2F8', accentColor: '#DB2777', displayOrder: 7 },
  { id: 'instant_food', name: 'Instant & Packaged Food', hindiName: 'मैगी और इंस्टेंट फ़ूड', icon: '🍜', color: '#F5F3FF', accentColor: '#7C3AED', displayOrder: 8 },
  { id: 'tea_coffee', name: 'Tea, Coffee & Drinks', hindiName: 'चाय, कॉफ़ी और जूस', icon: '☕', color: '#ECFDF5', accentColor: '#059669', displayOrder: 9 },
  { id: 'sweets_chocolates', name: 'Sweets & Chocolates', hindiName: 'मिठाई और चॉकलेट', icon: '🍫', color: '#FAF5FF', accentColor: '#9333EA', displayOrder: 10 },
  { id: 'cleaning_household', name: 'Cleaning & Household', hindiName: 'सफाई और घरेलू सामान', icon: '🧼', color: '#F0FDF4', accentColor: '#16A34A', displayOrder: 11 },
  { id: 'personal_care', name: 'Personal Care & Hygiene', hindiName: 'साबुन, पेस्ट और शैम्पू', icon: '🧴', color: '#F8FAFC', accentColor: '#475569', displayOrder: 12 },
  { id: 'pooja_needs', name: 'Pooja & Agarbatti', hindiName: 'पूजा सामग्री और अगरबत्ती', icon: '🪔', color: '#FFFBEB', accentColor: '#CA8A04', displayOrder: 13 },
  { id: 'baby_wellness', name: 'Baby Care & Wellness', hindiName: 'बेबी केयर और हेल्थ', icon: '🍼', color: '#EFF6FF', accentColor: '#2563EB', displayOrder: 14 },
  { id: 'dry_fruits_nuts', name: 'Dry Fruits & Seeds', hindiName: 'काजू, बादाम और अखरोट', icon: '🥜', color: '#FEFCE8', accentColor: '#A16207', displayOrder: 15 },
];

const COUPONS_DATA = [
  { code: 'ZAP100', title: '₹100 Instant Discount', description: 'Flat ₹100 off on orders above ₹299', type: 'flat', discountAmount: 100, minOrderValue: 299, maxDiscount: 100 },
  { code: 'FREESHIP', title: 'Free 10-Min Delivery', description: 'Zero delivery fee on any order', type: 'free_delivery', discountAmount: 25, minOrderValue: 99, maxDiscount: 25 },
  { code: 'WELCOME50', title: 'Welcome ₹50 Off', description: 'Special ₹50 discount for you', type: 'flat', discountAmount: 50, minOrderValue: 149, maxDiscount: 50 },
  { code: 'CRAVING20', title: '20% Super Savings', description: '20% off up to ₹80 on groceries', type: 'percent', discountPercent: 20, minOrderValue: 199, maxDiscount: 80 },
  { code: 'VEGEXTRA', title: 'Pure Veg Special ₹75', description: 'Extra ₹75 off on fresh produce & dairy', type: 'flat', discountAmount: 75, minOrderValue: 249, maxDiscount: 75 },
];

const BANNERS_DATA = [
  {
    id: 'b1',
    title: '10-Minute Superfast Delivery ⚡',
    subtitle: '100% Pure Veg Essentials at Mandi Prices',
    tag: 'LIGHTNING FAST',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800',
    categoryId: 'vegetables',
    discount: 'UP TO 40% OFF',
    bgGradient: ['#0C8346', '#00D26A'],
  },
  {
    id: 'b2',
    title: 'Fresh Dairy & Morning Bakery 🥛',
    subtitle: 'Amul, Mother Dairy & Fresh Bread at 7 AM',
    tag: 'FRESH MORNING',
    image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=800',
    categoryId: 'dairy_bread',
    discount: 'FLAT 15% OFF',
    bgGradient: ['#0284C7', '#38BDF8'],
  },
  {
    id: 'b3',
    title: 'Munchies & Late Night Cravings 🍟',
    subtitle: 'Chips, Kurkure & Cold Drinks in 8 Mins',
    tag: 'PARTY PACK',
    image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=800',
    categoryId: 'munchies',
    discount: 'BUY 1 GET 1 FREE',
    bgGradient: ['#D97706', '#FBBF24'],
  },
  {
    id: 'b4',
    title: 'Monthly Ration & Kitchen Stock 🌾',
    subtitle: 'Aashirvaad Atta, Tata Dal & Fortune Oils',
    tag: 'BEST VALUE',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800',
    categoryId: 'atta_rice_dal',
    discount: 'EXTRA ₹100 OFF',
    bgGradient: ['#7C3AED', '#A78BFA'],
  },
];

// Product master generation definitions (100% Pure Veg Blinkit catalog)
const RAW_CATALOG = [
  // 1. DAIRY & BREAD (40 items)
  {
    cat: 'dairy_bread', catName: 'Dairy, Bread & Butter',
    items: [
      { n: 'Amul Taaza Homogenised Toned Milk', b: 'Amul', u: '500 ml', p: 27, m: 28, img: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500', t: ['milk', 'dairy', 'amul', 'toned milk', 'fresh'] },
      { n: 'Amul Gold Full Cream Fresh Milk', b: 'Amul', u: '500 ml', p: 33, m: 34, img: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=500', t: ['milk', 'gold', 'full cream', 'amul'] },
      { n: 'Mother Dairy Toned Milk Pouch', b: 'Mother Dairy', u: '500 ml', p: 27, m: 28, img: 'https://images.unsplash.com/photo-1528750997573-59b89d56f4f7?w=500', t: ['mother dairy', 'milk', 'toned'] },
      { n: 'Mother Dairy Full Cream Milk', b: 'Mother Dairy', u: '1 L', p: 66, m: 68, img: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500', t: ['milk', 'mother dairy', '1 litre'] },
      { n: 'Amul Salted Butter Block', b: 'Amul', u: '100 g', p: 56, m: 60, img: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=500', t: ['butter', 'amul butter', 'breakfast', 'maska'] },
      { n: 'Amul Salted Butter Tub', b: 'Amul', u: '500 g', p: 275, m: 285, img: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=500', t: ['butter', 'amul tub', '500g'] },
      { n: 'Amul Fresh Malai Paneer', b: 'Amul', u: '200 g', p: 90, m: 95, img: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500', t: ['paneer', 'cottage cheese', 'protein', 'amul paneer'] },
      { n: 'Mother Dairy Classic Paneer', b: 'Mother Dairy', u: '200 g', p: 88, m: 92, img: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500', t: ['paneer', 'mother dairy'] },
      { n: 'Amul Masti Dahi Pouch', b: 'Amul', u: '400 g', p: 35, m: 35, img: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=500', t: ['dahi', 'curd', 'amul dahi', 'yogurt'] },
      { n: 'Mother Dairy Ultimate Dahi Tub', b: 'Mother Dairy', u: '400 g', p: 45, m: 50, img: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=500', t: ['dahi', 'curd', 'tub'] },
      { n: 'Amul Processed Cheese Slices', b: 'Amul', u: '200 g (10 Slices)', p: 140, m: 150, img: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=500', t: ['cheese', 'cheese slice', 'amul cheese'] },
      { n: 'Amul Cheese Cubes Box', b: 'Amul', u: '200 g (8 Cubes)', p: 130, m: 140, img: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=500', t: ['cheese cubes', 'amul', 'snacks'] },
      { n: 'Amul Mozzarella Pizza Cheese Shredded', b: 'Amul', u: '200 g', p: 125, m: 135, img: 'https://images.unsplash.com/photo-1552767059-ce182ead6c1b?w=500', t: ['cheese', 'pizza cheese', 'mozzarella'] },
      { n: 'Harvest Gold White Bread Loaf', b: 'Harvest Gold', u: '400 g', p: 30, m: 30, img: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500', t: ['bread', 'white bread', 'harvest gold'] },
      { n: 'Harvest Gold 100% Whole Wheat Brown Bread', b: 'Harvest Gold', u: '400 g', p: 50, m: 55, img: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=500', t: ['brown bread', 'wheat bread', 'healthy'] },
      { n: 'English Oven Multigrain Bread', b: 'English Oven', u: '400 g', p: 60, m: 65, img: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500', t: ['multigrain', 'bread', 'fitness'] },
      { n: 'Harvest Gold Mumbai Pav Pack', b: 'Harvest Gold', u: '6 pcs (250 g)', p: 25, m: 25, img: 'https://images.unsplash.com/photo-1608198093002-ad4e005484ec?w=500', t: ['pav', 'pav bhaji', 'bread'] },
      { n: 'Amul Fresh Whipping / Cooking Cream', b: 'Amul', u: '250 ml', p: 65, m: 70, img: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500', t: ['cream', 'malai', 'cooking'] },
      { n: 'Amul Cow Pure Ghee Pouch', b: 'Amul', u: '1 L', p: 620, m: 660, img: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=500', t: ['cow ghee', 'ghee', 'amul ghee', 'puja'] },
      { n: 'Amul Spiced Buttermilk (Chhaas)', b: 'Amul', u: '500 ml', p: 15, m: 15, img: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500', t: ['chaas', 'buttermilk', 'summer'] },
      { n: 'Epigamia Greek Yogurt Natural', b: 'Epigamia', u: '90 g', p: 50, m: 55, img: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=500', t: ['greek yogurt', 'protein', 'epigamia'] },
      { n: 'Epigamia Greek Yogurt Strawberry', b: 'Epigamia', u: '90 g', p: 55, m: 60, img: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=500', t: ['strawberry', 'yogurt'] },
      { n: 'Amul Garlic Butter', b: 'Amul', u: '100 g', p: 62, m: 65, img: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=500', t: ['garlic butter', 'toast'] },
      { n: 'Britannia Cheese Block', b: 'Britannia', u: '200 g', p: 135, m: 145, img: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=500', t: ['cheese block', 'britannia'] },
      { n: 'Amul Kool Kesar Flavour Milk Bottle', b: 'Amul', u: '200 ml', p: 25, m: 25, img: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500', t: ['kesar milk', 'amul kool', 'drinks'] },
      { n: 'Amul Kool Cafe Cold Coffee Can', b: 'Amul', u: '200 ml', p: 30, m: 35, img: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=500', t: ['cold coffee', 'amul kool'] },
      { n: 'Nutrela Soya Chunks High Protein', b: 'Nutrela', u: '200 g', p: 45, m: 50, img: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500', t: ['soya', 'protein', 'nutrela', 'veg'] },
      { n: 'Mother Dairy Paneer Tikka Cubes', b: 'Mother Dairy', u: '200 g', p: 95, m: 100, img: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500', t: ['paneer', 'tikka'] },
      { n: 'English Oven Garlic Bread Loaf', b: 'English Oven', u: '250 g', p: 55, m: 60, img: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500', t: ['garlic bread', 'bakery'] },
      { n: 'Bonn Premium Sandwich White Bread', b: 'Bonn', u: '350 g', p: 28, m: 30, img: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500', t: ['bread', 'sandwich'] },
      { n: 'Amul Lite Milk Fat Spread', b: 'Amul', u: '100 g', p: 42, m: 45, img: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=500', t: ['amul lite', 'butter'] },
      { n: 'Mother Dairy Dietz Low Fat Dahi', b: 'Mother Dairy', u: '400 g', p: 40, m: 45, img: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=500', t: ['diet dahi', 'low fat'] },
      { n: 'Harvest Gold Sweet Buns', b: 'Harvest Gold', u: '2 pcs (150 g)', p: 20, m: 20, img: 'https://images.unsplash.com/photo-1608198093002-ad4e005484ec?w=500', t: ['buns', 'sweet buns'] },
      { n: 'English Oven Whole Wheat Burger Buns', b: 'English Oven', u: '4 pcs (200 g)', p: 40, m: 45, img: 'https://images.unsplash.com/photo-1608198093002-ad4e005484ec?w=500', t: ['burger buns', 'wheat'] },
      { n: 'Amul Sugar Free Ice Cream Vanilla Cup', b: 'Amul', u: '125 ml', p: 40, m: 45, img: 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=500', t: ['ice cream', 'sugar free'] },
      { n: 'Mother Dairy Cow Milk Pouch', b: 'Mother Dairy', u: '500 ml', p: 28, m: 29, img: 'https://images.unsplash.com/photo-1528750997573-59b89d56f4f7?w=500', t: ['cow milk', 'fresh'] },
      { n: 'Amul Mithai Mate Sweetened Condensed Milk', b: 'Amul', u: '200 g', p: 68, m: 72, img: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500', t: ['condensed milk', 'mithai', 'amul'] },
      { n: 'Epigamia Coconut Milk Vegan Curd', b: 'Epigamia', u: '200 g', p: 85, m: 90, img: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=500', t: ['vegan', 'coconut curd'] },
      { n: 'Amul Pizza Topping Cheese Blend', b: 'Amul', u: '500 g', p: 240, m: 260, img: 'https://images.unsplash.com/photo-1552767059-ce182ead6c1b?w=500', t: ['pizza topping', 'cheese'] },
      { n: 'Harvest Gold Atta Kulcha Bread', b: 'Harvest Gold', u: '5 pcs (300 g)', p: 35, m: 38, img: 'https://images.unsplash.com/photo-1608198093002-ad4e005484ec?w=500', t: ['kulcha', 'atta', 'chhole'] },
    ]
  },

  // 2. FRESH VEGETABLES (45 items)
  {
    cat: 'vegetables', catName: 'Fresh Vegetables',
    items: [
      { n: 'Fresh Desi Hybrid Tomatoes (Tamatar)', b: 'Farm Fresh', u: '1 kg', p: 34, m: 45, img: 'https://images.unsplash.com/photo-1546470427-e26264be0b11?w=500', t: ['tomato', 'tamatar', 'fresh vegetable', 'salad'] },
      { n: 'Fresh Golden Farm Potatoes (Aloo)', b: 'Farm Fresh', u: '1 kg', p: 28, m: 35, img: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=500', t: ['potato', 'aloo', 'vegetables', 'daily essentials'] },
      { n: 'Fresh Red Onions (Pyaaz)', b: 'Farm Fresh', u: '1 kg', p: 38, m: 50, img: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=500', t: ['onion', 'pyaaz', 'fresh vegetable'] },
      { n: 'Fresh Cleaned Coriander Leaves (Dhaniya)', b: 'Farm Fresh', u: '100 g', p: 12, m: 18, img: 'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=500', t: ['dhaniya', 'coriander', 'herb'] },
      { n: 'Fresh Green Spiced Chillies (Hari Mirch)', b: 'Farm Fresh', u: '100 g', p: 15, m: 20, img: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500', t: ['chilli', 'mirch', 'spicy'] },
      { n: 'Fresh Old Ginger Root (Adrak)', b: 'Farm Fresh', u: '250 g', p: 35, m: 45, img: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=500', t: ['adrak', 'ginger', 'chai'] },
      { n: 'Fresh White Garlic Bulbs (Lehsun)', b: 'Farm Fresh', u: '250 g', p: 65, m: 80, img: 'https://images.unsplash.com/photo-1587049352851-8d4e89133924?w=500', t: ['garlic', 'lehsun'] },
      { n: 'Fresh Crisp Green Capsicum (Shimla Mirch)', b: 'Farm Fresh', u: '500 g', p: 42, m: 55, img: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=500', t: ['capsicum', 'shimla mirch', 'green pepper'] },
      { n: 'Fresh Tender Ladyfinger (Bhindi)', b: 'Farm Fresh', u: '500 g', p: 38, m: 50, img: 'https://images.unsplash.com/photo-1425543103986-22abb7d7e8d2?w=500', t: ['bhindi', 'okra', 'ladyfinger'] },
      { n: 'Fresh Snow White Cauliflower (Gobhi)', b: 'Farm Fresh', u: '1 pc (500-700g)', p: 35, m: 45, img: 'https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?w=500', t: ['cauliflower', 'gobhi'] },
      { n: 'Fresh Green Cabbage (Patta Gobhi)', b: 'Farm Fresh', u: '1 pc (500g)', p: 25, m: 35, img: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=500', t: ['cabbage', 'patta gobhi'] },
      { n: 'Fresh Hydroponic Spinach Leaves (Palak)', b: 'Farm Fresh', u: '250 g', p: 22, m: 30, img: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=500', t: ['palak', 'spinach', 'iron'] },
      { n: 'Fresh Green Fenugreek Leaves (Methi)', b: 'Farm Fresh', u: '250 g', p: 24, m: 32, img: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=500', t: ['methi', 'fenugreek', 'paratha'] },
      { n: 'Fresh English Cucumber (Kheera)', b: 'Farm Fresh', u: '500 g', p: 30, m: 40, img: 'https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=500', t: ['cucumber', 'kheera', 'salad'] },
      { n: 'Fresh Sweet Orange Carrots (Gajar)', b: 'Farm Fresh', u: '500 g', p: 28, m: 38, img: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=500', t: ['carrot', 'gajar', 'salad'] },
      { n: 'Fresh Tender Bottle Gourd (Lauki)', b: 'Farm Fresh', u: '1 pc (1 kg)', p: 35, m: 45, img: 'https://images.unsplash.com/photo-1597362925123-77861d3fbac7?w=500', t: ['lauki', 'bottle gourd', 'healthy'] },
      { n: 'Fresh Round Bitter Gourd (Karela)', b: 'Farm Fresh', u: '500 g', p: 32, m: 42, img: 'https://images.unsplash.com/photo-1597362925123-77861d3fbac7?w=500', t: ['karela', 'bitter gourd'] },
      { n: 'Fresh Dark Purple Brinjal (Baingan Bharta)', b: 'Farm Fresh', u: '500 g', p: 28, m: 35, img: 'https://images.unsplash.com/photo-1528825871115-3581a5387919?w=500', t: ['baingan', 'brinjal', 'eggplant'] },
      { n: 'Fresh Small Round Brinjals (Baingan)', b: 'Farm Fresh', u: '500 g', p: 26, m: 32, img: 'https://images.unsplash.com/photo-1528825871115-3581a5387919?w=500', t: ['baingan', 'chota baingan'] },
      { n: 'Fresh White Button Mushrooms Box', b: 'Farm Fresh', u: '200 g', p: 48, m: 60, img: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500', t: ['mushroom', 'button mushroom', 'veg'] },
      { n: 'Fresh Green Peas (Matar Shelled)', b: 'Farm Fresh', u: '250 g', p: 45, m: 60, img: 'https://images.unsplash.com/photo-1587735243615-c03f25aaff15?w=500', t: ['matar', 'green peas'] },
      { n: 'Fresh Sweet Corn Cobs (Bhutta)', b: 'Farm Fresh', u: '2 pcs', p: 35, m: 45, img: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=500', t: ['sweet corn', 'bhutta', 'corn'] },
      { n: 'Fresh Crisp Radish (Mooli with leaves)', b: 'Farm Fresh', u: '500 g', p: 25, m: 35, img: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=500', t: ['mooli', 'radish', 'salad'] },
      { n: 'Fresh Beetroot (Chukandar)', b: 'Farm Fresh', u: '500 g', p: 30, m: 40, img: 'https://images.unsplash.com/photo-1528825871115-3581a5387919?w=500', t: ['beetroot', 'chukandar', 'juice'] },
      { n: 'Fresh Raw Banana for Cooking (Kacha Kela)', b: 'Farm Fresh', u: '500 g', p: 28, m: 35, img: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=500', t: ['raw banana', 'kela'] },
      { n: 'Fresh Ridge Gourd (Turai / Tori)', b: 'Farm Fresh', u: '500 g', p: 32, m: 42, img: 'https://images.unsplash.com/photo-1597362925123-77861d3fbac7?w=500', t: ['turai', 'ridge gourd'] },
      { n: 'Fresh French Beans (Beans)', b: 'Farm Fresh', u: '250 g', p: 28, m: 38, img: 'https://images.unsplash.com/photo-1587735243615-c03f25aaff15?w=500', t: ['beans', 'french beans'] },
      { n: 'Fresh Lemon Yellow Juicy (Nimbu)', b: 'Farm Fresh', u: '4 pcs (150 g)', p: 20, m: 30, img: 'https://images.unsplash.com/photo-1533082723868-ef06cec49682?w=500', t: ['lemon', 'nimbu', 'shikanji'] },
      { n: 'Fresh Fresh Mint Leaves (Pudina)', b: 'Farm Fresh', u: '100 g', p: 15, m: 20, img: 'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=500', t: ['pudina', 'mint', 'chutney'] },
      { n: 'Fresh Green Raw Papaya (Kacha Papita)', b: 'Farm Fresh', u: '1 pc (800g)', p: 38, m: 48, img: 'https://images.unsplash.com/photo-1517282009859-f000ec3b26fe?w=500', t: ['raw papaya', 'papita'] },
      { n: 'Fresh Curry Leaves (Kadi Patta)', b: 'Farm Fresh', u: '50 g', p: 10, m: 15, img: 'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=500', t: ['curry leaves', 'kadi patta', 'tadka'] },
      { n: 'Fresh Drumsticks (Moringa / Sahjan)', b: 'Farm Fresh', u: '250 g', p: 35, m: 45, img: 'https://images.unsplash.com/photo-1597362925123-77861d3fbac7?w=500', t: ['drumstick', 'sambar', 'moringa'] },
      { n: 'Fresh Raw Mango (Keri / Kacha Aam)', b: 'Farm Fresh', u: '500 g', p: 45, m: 60, img: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=500', t: ['raw mango', 'keri', 'chutney'] },
      { n: 'Fresh Crisp Red Bell Pepper', b: 'Farm Fresh', u: '1 pc (200g)', p: 48, m: 60, img: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=500', t: ['red capsicum', 'bell pepper'] },
      { n: 'Fresh Yellow Bell Pepper', b: 'Farm Fresh', u: '1 pc (200g)', p: 48, m: 60, img: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=500', t: ['yellow bell pepper'] },
      { n: 'Fresh Broccoli Floret Head', b: 'Farm Fresh', u: '1 pc (350g)', p: 65, m: 85, img: 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=500', t: ['broccoli', 'healthy salad', 'fitness'] },
      { n: 'Fresh Zucchini Green', b: 'Farm Fresh', u: '2 pcs (400g)', p: 55, m: 70, img: 'https://images.unsplash.com/photo-1597362925123-77861d3fbac7?w=500', t: ['zucchini', 'exotic'] },
      { n: 'Fresh Spring Onions with Greens (Hari Pyaaz)', b: 'Farm Fresh', u: '250 g', p: 25, m: 35, img: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=500', t: ['spring onion', 'hari pyaaz'] },
      { n: 'Fresh Pointed Gourd (Parwal)', b: 'Farm Fresh', u: '500 g', p: 38, m: 50, img: 'https://images.unsplash.com/photo-1597362925123-77861d3fbac7?w=500', t: ['parwal', 'pointed gourd'] },
      { n: 'Fresh Colocasia / Arbi Roots', b: 'Farm Fresh', u: '500 g', p: 35, m: 45, img: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=500', t: ['arbi', 'colocasia'] },
      { n: 'Fresh Elephant Yam (Jimikand / Suran)', b: 'Farm Fresh', u: '500 g', p: 42, m: 55, img: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=500', t: ['jimikand', 'suran'] },
      { n: 'Fresh Red Sambar Small Onions', b: 'Farm Fresh', u: '500 g', p: 45, m: 60, img: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=500', t: ['sambar onion', 'shallots'] },
      { n: 'Fresh Ash Gourd (Petha)', b: 'Farm Fresh', u: '1 kg Cut', p: 35, m: 45, img: 'https://images.unsplash.com/photo-1597362925123-77861d3fbac7?w=500', t: ['ash gourd', 'petha', 'juice'] },
      { n: 'Fresh Cleaned Baby Spinach Box', b: 'Farm Fresh', u: '200 g', p: 35, m: 45, img: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=500', t: ['baby spinach', 'salad'] },
      { n: 'Fresh Peeled Garlic Pods Pack', b: 'Farm Fresh', u: '150 g', p: 55, m: 70, img: 'https://images.unsplash.com/photo-1587049352851-8d4e89133924?w=500', t: ['peeled garlic', 'ready to cook'] },
    ]
  },

  // 3. FRESH FRUITS (35 items)
  {
    cat: 'fruits', catName: 'Fresh Fruits',
    items: [
      { n: 'Fresh Shimla Royal Delicious Apples (Seb)', b: 'Fresh Orchards', u: '4 pcs (approx 600g)', p: 130, m: 160, img: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500', t: ['apple', 'seb', 'shimla apple', 'fruits'] },
      { n: 'Fresh Robusta Ripe Sweet Bananas (Kela)', b: 'Fresh Orchards', u: '6 pcs (1/2 Dozen)', p: 38, m: 50, img: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=500', t: ['banana', 'kela', 'energy', 'fruits'] },
      { n: 'Fresh Ruby Red Pomegranate (Anaar)', b: 'Fresh Orchards', u: '2 pcs (approx 500g)', p: 110, m: 140, img: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=500', t: ['pomegranate', 'anaar', 'healthy juice'] },
      { n: 'Fresh Nagpur Sweet Juicy Oranges (Santra)', b: 'Fresh Orchards', u: '1 kg', p: 85, m: 110, img: 'https://images.unsplash.com/photo-1547514701-42782101795e?w=500', t: ['orange', 'santra', 'vitamin c'] },
      { n: 'Fresh Sweet Tropical Papaya (Papita)', b: 'Fresh Orchards', u: '1 pc (1 kg - 1.2 kg)', p: 55, m: 75, img: 'https://images.unsplash.com/photo-1517282009859-f000ec3b26fe?w=500', t: ['papaya', 'papita', 'digestion'] },
      { n: 'Fresh Sweet Sugar King Watermelon (Tarbooz)', b: 'Fresh Orchards', u: '1 pc (approx 2.5 kg)', p: 69, m: 90, img: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=500', t: ['watermelon', 'tarbooz', 'summer'] },
      { n: 'Fresh Seedless Green Grapes (Angoor)', b: 'Fresh Orchards', u: '500 g', p: 75, m: 95, img: 'https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=500', t: ['grapes', 'angoor', 'green grapes'] },
      { n: 'Fresh Seedless Black Grapes (Kala Angoor)', b: 'Fresh Orchards', u: '500 g', p: 90, m: 120, img: 'https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=500', t: ['black grapes', 'angoor'] },
      { n: 'Fresh Zespri Green Kiwis Pack', b: 'Zespri', u: '3 pcs Pack', p: 99, m: 130, img: 'https://images.unsplash.com/photo-1585059895524-72359e06133a?w=500', t: ['kiwi', 'zespri', 'immunity'] },
      { n: 'Fresh Pink Flesh Dragon Fruit', b: 'Fresh Orchards', u: '1 pc (approx 350g)', p: 85, m: 110, img: 'https://images.unsplash.com/photo-1527325678964-54921661f888?w=500', t: ['dragon fruit', 'exotic'] },
      { n: 'Fresh Sweet Mosambi / Sweet Lime', b: 'Fresh Orchards', u: '1 kg', p: 70, m: 90, img: 'https://images.unsplash.com/photo-1533082723868-ef06cec49682?w=500', t: ['mosambi', 'sweet lime', 'juice'] },
      { n: 'Fresh Guava Allahabad Safeda (Amrood)', b: 'Fresh Orchards', u: '500 g', p: 45, m: 60, img: 'https://images.unsplash.com/photo-1536511135898-752b18c965b2?w=500', t: ['guava', 'amrood'] },
      { n: 'Fresh Sweet Muskmelon (Kharbooja)', b: 'Fresh Orchards', u: '1 pc (approx 800g)', p: 45, m: 60, img: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=500', t: ['muskmelon', 'kharbooja'] },
      { n: 'Fresh Alphonso Mango Ratnagiri (Aam)', b: 'Fresh Orchards', u: '6 pcs (1 Dozen Box)', p: 450, m: 550, img: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=500', t: ['alphonso', 'mango', 'aam'] },
      { n: 'Fresh Safeda / Banganapalli Sweet Mango', b: 'Fresh Orchards', u: '1 kg', p: 120, m: 150, img: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=500', t: ['safeda mango', 'aam'] },
      { n: 'Fresh Tender Green Coconut with Straw (Nariyal Pani)', b: 'Fresh Orchards', u: '1 pc', p: 55, m: 65, img: 'https://images.unsplash.com/photo-1525385133512-2f3bdd039054?w=500', t: ['nariyal pani', 'coconut water', 'energy'] },
      { n: 'Fresh Fresh Pineapple Sweet (Ananas)', b: 'Fresh Orchards', u: '1 pc Cleaned (800g)', p: 80, m: 100, img: 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=500', t: ['pineapple', 'ananas'] },
      { n: 'Fresh Imported Blueberries Box', b: 'Driscolls', u: '125 g', p: 180, m: 220, img: 'https://images.unsplash.com/photo-1498557850523-fd3d118b962e?w=500', t: ['blueberry', 'berries', 'antioxidants'] },
      { n: 'Fresh Mahabaleshwar Sweet Strawberries Box', b: 'Fresh Orchards', u: '200 g', p: 90, m: 120, img: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=500', t: ['strawberry', 'fresh fruit'] },
      { n: 'Fresh Sweet Pear Green (Nashpati)', b: 'Fresh Orchards', u: '500 g', p: 75, m: 95, img: 'https://images.unsplash.com/photo-1514756331096-242fdeb70d4a?w=500', t: ['pear', 'nashpati'] },
      { n: 'Fresh Imported Red Plums Box (Aloo Bukhara)', b: 'Fresh Orchards', u: '250 g', p: 85, m: 110, img: 'https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?w=500', t: ['plum', 'aloo bukhara'] },
      { n: 'Fresh Premium Washington Red Apples', b: 'Fresh Orchards', u: '4 pcs', p: 160, m: 190, img: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500', t: ['washington apple', 'apple'] },
      { n: 'Fresh Kashmiri Green Crisp Apples', b: 'Fresh Orchards', u: '500 g', p: 95, m: 120, img: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500', t: ['green apple', 'kashmir'] },
      { n: 'Fresh Sweet Kinnow / Mandarin Oranges', b: 'Fresh Orchards', u: '1 kg', p: 60, m: 80, img: 'https://images.unsplash.com/photo-1547514701-42782101795e?w=500', t: ['kinnow', 'mandarin'] },
      { n: 'Fresh Sweet Chiku / Sapota Box', b: 'Fresh Orchards', u: '500 g', p: 48, m: 60, img: 'https://images.unsplash.com/photo-1528825871115-3581a5387919?w=500', t: ['chiku', 'sapota', 'sweet fruit'] },
      { n: 'Fresh Premium Ripe Avocados (Butter Fruit)', b: 'Fresh Orchards', u: '2 pcs (approx 350g)', p: 140, m: 180, img: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=500', t: ['avocado', 'guacamole', 'keto'] },
      { n: 'Fresh Sweet Custard Apple (Sharifa / Sitaphal)', b: 'Fresh Orchards', u: '500 g', p: 85, m: 110, img: 'https://images.unsplash.com/photo-1536511135898-752b18c965b2?w=500', t: ['sitaphal', 'custard apple'] },
      { n: 'Fresh Sweet Dates (Khajoor Fresh)', b: 'Fresh Orchards', u: '250 g', p: 95, m: 120, img: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500', t: ['khajoor', 'dates'] },
      { n: 'Fresh Cut Fruit Salad Mix Bowl', b: 'ZapBite Fresh', u: '250 g Bowl', p: 65, m: 80, img: 'https://images.unsplash.com/photo-1546470427-e26264be0b11?w=500', t: ['fruit bowl', 'salad', 'ready to eat'] },
      { n: 'Fresh Pomegranate Arils (Anaar Dana Peeled Cup)', b: 'ZapBite Fresh', u: '150 g Cup', p: 70, m: 85, img: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=500', t: ['peeled anaar', 'cup'] },
      { n: 'Fresh Sugarcane Juice Bottle Cold Pressed (Ganne ka Ras)', b: 'ZapBite Fresh', u: '300 ml', p: 45, m: 50, img: 'https://images.unsplash.com/photo-1533082723868-ef06cec49682?w=500', t: ['ganne ka ras', 'sugarcane'] },
      { n: 'Fresh Imported Sweet Cherries Box', b: 'Fresh Orchards', u: '250 g', p: 250, m: 300, img: 'https://images.unsplash.com/photo-1528825871115-3581a5387919?w=500', t: ['cherry', 'cherries'] },
      { n: 'Fresh Sweet Thai Guava Crisp', b: 'Fresh Orchards', u: '1 pc (350g)', p: 50, m: 65, img: 'https://images.unsplash.com/photo-1536511135898-752b18c965b2?w=500', t: ['thai guava', 'guava'] },
      { n: 'Fresh Baby Sweet Oranges (Nagpur Small)', b: 'Fresh Orchards', u: '1 kg', p: 65, m: 85, img: 'https://images.unsplash.com/photo-1547514701-42782101795e?w=500', t: ['orange', 'santra'] },
      { n: 'Fresh Elaichi Bananas Small Sweet (Yellaki)', b: 'Fresh Orchards', u: '500 g', p: 55, m: 70, img: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=500', t: ['elaichi kela', 'yellaki'] },
    ]
  },

  // 4. ATTA, RICE & DAL (45 items)
  {
    cat: 'atta_rice_dal', catName: 'Atta, Rice & Dal',
    items: [
      { n: 'Aashirvaad Shudh Chakki 100% Whole Wheat Atta', b: 'Aashirvaad', u: '5 kg', p: 245, m: 275, img: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500', t: ['atta', 'aashirvaad', 'wheat flour', 'roti'] },
      { n: 'Aashirvaad Shudh Chakki Atta Bag', b: 'Aashirvaad', u: '10 kg', p: 475, m: 530, img: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500', t: ['atta 10kg', 'aashirvaad'] },
      { n: 'Aashirvaad Select Sharbati 100% MP Atta', b: 'Aashirvaad', u: '5 kg', p: 295, m: 330, img: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500', t: ['sharbati atta', 'aashirvaad select'] },
      { n: 'Fortune Chakki Fresh 100% Atta', b: 'Fortune', u: '5 kg', p: 220, m: 250, img: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500', t: ['fortune atta', 'wheat'] },
      { n: 'India Gate Basmati Rice Feast Rozzana', b: 'India Gate', u: '1 kg', p: 98, m: 125, img: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500', t: ['rice', 'basmati', 'india gate', 'chawal'] },
      { n: 'India Gate Basmati Rice Classic Premium', b: 'India Gate', u: '1 kg', p: 195, m: 240, img: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500', t: ['basmati classic', 'biryani rice'] },
      { n: 'Daawat Rozana Gold Basmati Rice', b: 'Daawat', u: '1 kg', p: 92, m: 120, img: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500', t: ['daawat rice', 'chawal'] },
      { n: 'Tata Sampann Unpolished Toor Dal (Arhar)', b: 'Tata Sampann', u: '1 kg', p: 175, m: 210, img: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500', t: ['toor dal', 'arhar dal', 'tata sampann', 'protein'] },
      { n: 'Tata Sampann Unpolished Moong Dal Dhuli (Yellow)', b: 'Tata Sampann', u: '1 kg', p: 145, m: 175, img: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500', t: ['moong dal', 'yellow dal', 'tata'] },
      { n: 'Tata Sampann Moong Dal Chilka (Green)', b: 'Tata Sampann', u: '1 kg', p: 140, m: 165, img: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500', t: ['moong chilka', 'green dal'] },
      { n: 'Tata Sampann Chana Dal Unpolished', b: 'Tata Sampann', u: '1 kg', p: 110, m: 135, img: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500', t: ['chana dal', 'tata'] },
      { n: 'Tata Sampann Urad Dal Dhuli (White Split)', b: 'Tata Sampann', u: '1 kg', p: 160, m: 190, img: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500', t: ['urad dal', 'dosa dal', 'idli'] },
      { n: 'Tata Sampann Urad Dal Kali (Whole Black Dal)', b: 'Tata Sampann', u: '1 kg', p: 155, m: 180, img: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500', t: ['urad sabut', 'dal makhani'] },
      { n: 'Tata Sampann Premium Kashmiri Rajma (Red Kidney Beans)', b: 'Tata Sampann', u: '1 kg', p: 165, m: 195, img: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500', t: ['rajma', 'red rajma', 'rajma chawal'] },
      { n: 'Tata Sampann Kabuli Chana Premium (Chole)', b: 'Tata Sampann', u: '1 kg', p: 150, m: 180, img: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500', t: ['kabuli chana', 'chole', 'bhature'] },
      { n: 'Tata Sampann Kala Chana (Brown Desi Chickpeas)', b: 'Tata Sampann', u: '1 kg', p: 98, m: 120, img: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500', t: ['kala chana', 'sprouts'] },
      { n: 'Tata Sampann Masoor Dal Malki (Orange Red Split)', b: 'Tata Sampann', u: '1 kg', p: 115, m: 140, img: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500', t: ['masoor dal', 'red lentils'] },
      { n: 'Fortune Besan Super Fine Gram Flour', b: 'Fortune', u: '500 g', p: 58, m: 68, img: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500', t: ['besan', 'pakoda', 'kadhi'] },
      { n: 'Tata Sampann 100% Pure Besan', b: 'Tata Sampann', u: '500 g', p: 62, m: 72, img: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500', t: ['besan', 'gram flour'] },
      { n: 'Fortune Thick Poha / Flattened Rice', b: 'Fortune', u: '500 g', p: 38, m: 45, img: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500', t: ['poha', 'breakfast', 'flattened rice'] },
      { n: 'Tata Sampann High Fibre Poha', b: 'Tata Sampann', u: '500 g', p: 42, m: 50, img: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500', t: ['poha', 'tata'] },
      { n: 'Fortune Sooji / Semolina Rava', b: 'Fortune', u: '500 g', p: 36, m: 42, img: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500', t: ['sooji', 'suji', 'rava', 'halwa', 'upma'] },
      { n: 'Fortune Maida Refined Wheat Flour', b: 'Fortune', u: '500 g', p: 35, m: 40, img: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500', t: ['maida', 'baking', 'bhatura'] },
      { n: 'Aashirvaad Sugar Release Control Multigrain Atta', b: 'Aashirvaad', u: '5 kg', p: 320, m: 360, img: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500', t: ['multigrain atta', 'sugar control'] },
      { n: 'MTR 3 Minute Poha Breakfast Cup', b: 'MTR', u: '80 g', p: 30, m: 35, img: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500', t: ['mtr poha', 'instant'] },
      { n: 'Patanjali Traditional Chakki Atta', b: 'Patanjali', u: '5 kg', p: 215, m: 245, img: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500', t: ['patanjali atta', 'wheat'] },
      { n: 'Daawat Super Basmati Rice Aged', b: 'Daawat', u: '1 kg', p: 155, m: 190, img: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500', t: ['daawat super', 'biryani'] },
      { n: 'Fortune Everyday Basmati Rice', b: 'Fortune', u: '1 kg', p: 85, m: 110, img: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500', t: ['fortune rice', 'chawal'] },
      { n: 'India Gate Sona Masoori Rice Raw', b: 'India Gate', u: '5 kg Bag', p: 340, m: 400, img: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500', t: ['sona masoori', 'south indian rice'] },
      { n: 'Tata Sampann Masoor Whole Black (Sabut Masoor)', b: 'Tata Sampann', u: '1 kg', p: 125, m: 150, img: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500', t: ['sabut masoor', 'dal'] },
      { n: 'Tata Sampann Chana Whole (Desi Brown)', b: 'Tata Sampann', u: '500 g', p: 52, m: 65, img: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500', t: ['chana', 'sprouts'] },
      { n: 'Aashirvaad Rava Roasted Semolina', b: 'Aashirvaad', u: '500 g', p: 44, m: 50, img: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500', t: ['roasted rava', 'upma'] },
      { n: 'Tata Sampann Organic Brown Rice', b: 'Tata Sampann', u: '1 kg', p: 135, m: 165, img: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500', t: ['brown rice', 'diet'] },
      { n: 'Fortune Daliya / Broken Wheat', b: 'Fortune', u: '500 g', p: 35, m: 42, img: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500', t: ['daliya', 'broken wheat', 'healthy breakfast'] },
      { n: 'Tata Sampann Daliya High Fibre', b: 'Tata Sampann', u: '500 g', p: 40, m: 48, img: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500', t: ['daliya', 'tata'] },
      { n: 'MTR Ready Idli Rava', b: 'MTR', u: '500 g', p: 48, m: 55, img: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500', t: ['idli rava', 'south indian'] },
      { n: 'Fortune Soya Vadi / Badi', b: 'Fortune', u: '200 g', p: 42, m: 48, img: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500', t: ['soya vadi', 'protein'] },
      { n: 'Aashirvaad Gluten Free Flour', b: 'Aashirvaad', u: '1 kg', p: 195, m: 220, img: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500', t: ['gluten free', 'diet atta'] },
      { n: 'Tata Sampann Jowar Atta (Sorghum Flour)', b: 'Tata Sampann', u: '1 kg', p: 85, m: 100, img: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500', t: ['jowar atta', 'millet'] },
      { n: 'Tata Sampann Bajra Atta (Pearl Millet Flour)', b: 'Tata Sampann', u: '1 kg', p: 80, m: 95, img: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500', t: ['bajra atta', 'roti'] },
      { n: 'Tata Sampann Ragi Atta (Finger Millet)', b: 'Tata Sampann', u: '1 kg', p: 90, m: 105, img: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500', t: ['ragi', 'millet flour'] },
      { n: 'Organic Tattva Makka Atta (Maize Flour)', b: 'Organic Tattva', u: '1 kg', p: 75, m: 90, img: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500', t: ['makka atta', 'makki ki roti'] },
      { n: 'Tata Sampann White Matar / Safed Vatana', b: 'Tata Sampann', u: '500 g', p: 55, m: 68, img: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500', t: ['safed matar', 'ragda'] },
      { n: 'Tata Sampann Soya Chunks 100% Veg', b: 'Tata Sampann', u: '200 g', p: 48, m: 55, img: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500', t: ['soya', 'protein'] },
      { n: 'Catch Sabudana / Sago Big Pearls', b: 'Catch', u: '500 g', p: 58, m: 70, img: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500', t: ['sabudana', 'vrat', 'khichdi'] },
    ]
  },

  // 5. OILS, GHEE & MASALAS (45 items)
  {
    cat: 'oils_masalas', catName: 'Oils, Ghee & Masalas',
    items: [
      { n: 'Fortune Sunlite Refined Sunflower Oil Pouch', b: 'Fortune', u: '1 L', p: 135, m: 160, img: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500', t: ['sunflower oil', 'fortune', 'cooking oil'] },
      { n: 'Fortune Kachi Ghani Mustard Oil (Sarson Tel)', b: 'Fortune', u: '1 L Bottle', p: 155, m: 180, img: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500', t: ['mustard oil', 'sarson tel', 'fortune'] },
      { n: 'Dhara Kachi Ghani Pure Mustard Oil', b: 'Dhara', u: '1 L', p: 150, m: 175, img: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500', t: ['dhara', 'mustard oil'] },
      { n: 'Fortune Soya Health Refined Soyabean Oil', b: 'Fortune', u: '1 L', p: 125, m: 145, img: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500', t: ['soya oil', 'cooking oil'] },
      { n: 'Amul Pure Desi Cow Ghee Tin', b: 'Amul', u: '1 L', p: 630, m: 680, img: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=500', t: ['amul cow ghee', 'ghee', 'desi ghee'] },
      { n: 'Mother Dairy Pure Buffalo Desi Ghee', b: 'Mother Dairy', u: '1 L', p: 590, m: 640, img: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=500', t: ['mother dairy ghee', 'buffalo ghee'] },
      { n: 'Patanjali Cow Desi Ghee Pouch', b: 'Patanjali', u: '1 L', p: 610, m: 650, img: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=500', t: ['patanjali ghee', 'cow ghee'] },
      { n: 'MDH Deggi Mirch Red Chilli Powder', b: 'MDH', u: '100 g', p: 78, m: 85, img: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500', t: ['deggi mirch', 'mdh', 'lal mirch', 'colour'] },
      { n: 'MDH Garam Masala Powder Box', b: 'MDH', u: '100 g', p: 92, m: 100, img: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500', t: ['garam masala', 'mdh', 'spices'] },
      { n: 'MDH Haldi Powder / Turmeric Pure', b: 'MDH', u: '100 g', p: 38, m: 42, img: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=500', t: ['haldi', 'turmeric', 'mdh'] },
      { n: 'MDH Dhaniya Powder (Coriander Pure)', b: 'MDH', u: '100 g', p: 36, m: 40, img: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500', t: ['dhaniya powder', 'mdh'] },
      { n: 'Everest Tikhalal Hot Chilli Powder', b: 'Everest', u: '100 g', p: 52, m: 58, img: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500', t: ['tikhalal', 'everest mirch'] },
      { n: 'Everest Pav Bhaji Masala Box', b: 'Everest', u: '100 g', p: 72, m: 78, img: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500', t: ['pav bhaji masala', 'everest'] },
      { n: 'MDH Chana Masala / Chole Masala', b: 'MDH', u: '100 g', p: 82, m: 90, img: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500', t: ['chole masala', 'chana masala', 'mdh'] },
      { n: 'MDH Shahi Paneer Masala Spice Mix', b: 'MDH', u: '100 g', p: 85, m: 92, img: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500', t: ['shahi paneer masala', 'mdh'] },
      { n: 'Tata Salt Vacuum Evaporated Iodised Salt', b: 'Tata Salt', u: '1 kg', p: 28, m: 30, img: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=500', t: ['tata salt', 'namak', 'iodised salt'] },
      { n: 'Tata Salt Lite Low Sodium Salt', b: 'Tata Salt', u: '1 kg', p: 48, m: 55, img: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=500', t: ['low sodium salt', 'tata lite'] },
      { n: 'Catch Rock Salt Powder (Sendha Namak for Vrat)', b: 'Catch', u: '1 kg', p: 45, m: 55, img: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=500', t: ['sendha namak', 'rock salt', 'vrat'] },
      { n: 'Catch Black Salt Powder (Kala Namak)', b: 'Catch', u: '200 g Sprinkler', p: 35, m: 42, img: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=500', t: ['kala namak', 'black salt', 'sprinkler'] },
      { n: 'Catch Hing Powder / Asafoetida Pure', b: 'Catch', u: '50 g Box', p: 68, m: 78, img: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500', t: ['hing', 'asafoetida', 'tadka'] },
      { n: 'MDH Chunky Chat Masala Sprinkler', b: 'MDH', u: '100 g', p: 75, m: 82, img: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500', t: ['chat masala', 'mdh'] },
      { n: 'Everest Sabji Masala Spice Mix', b: 'Everest', u: '100 g', p: 58, m: 65, img: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500', t: ['sabji masala', 'everest'] },
      { n: 'Catch Whole Cumin Seeds (Jeera Pure)', b: 'Catch', u: '100 g', p: 62, m: 75, img: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500', t: ['jeera', 'cumin seeds', 'tadka'] },
      { n: 'Catch Whole Mustard Seeds (Rai / Sarson)', b: 'Catch', u: '100 g', p: 25, m: 30, img: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500', t: ['rai', 'mustard seeds'] },
      { n: 'Catch Fenugreek Seeds (Methi Dana)', b: 'Catch', u: '100 g', p: 28, m: 35, img: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500', t: ['methi dana', 'fenugreek'] },
      { n: 'Catch Carom Seeds (Ajwain Pure)', b: 'Catch', u: '100 g', p: 38, m: 45, img: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500', t: ['ajwain', 'paratha', 'digestion'] },
      { n: 'Catch Black Pepper Whole (Kali Mirch Sabut)', b: 'Catch', u: '50 g', p: 55, m: 65, img: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500', t: ['kali mirch', 'black pepper'] },
      { n: 'Catch Green Cardamom Whole (Choti Elaichi)', b: 'Catch', u: '25 g', p: 95, m: 120, img: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500', t: ['elaichi', 'green cardamom', 'chai'] },
      { n: 'Catch Cloves Whole (Laung Sabut)', b: 'Catch', u: '25 g', p: 48, m: 60, img: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500', t: ['laung', 'cloves'] },
      { n: 'Catch Cinnamon Sticks (Dalchini Sabut)', b: 'Catch', u: '50 g', p: 45, m: 55, img: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500', t: ['dalchini', 'cinnamon'] },
      { n: 'Catch Kasuri Methi Dry Fenugreek Leaves', b: 'Catch', u: '50 g Box', p: 38, m: 45, img: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500', t: ['kasuri methi', 'paneer masala'] },
      { n: 'Saffola Gold Pro Healthy Cooking Oil', b: 'Saffola', u: '1 L Pouch', p: 165, m: 195, img: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500', t: ['saffola gold', 'heart oil'] },
      { n: 'Saffola Total Heart Health Cooking Oil', b: 'Saffola', u: '1 L', p: 185, m: 220, img: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500', t: ['saffola total', 'cholesterol'] },
      { n: 'Borges Extra Virgin Olive Oil for Salad', b: 'Borges', u: '500 ml Glass', p: 580, m: 699, img: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500', t: ['olive oil', 'extra virgin', 'salad'] },
      { n: 'Borges Pure Olive Oil for Cooking', b: 'Borges', u: '1 L', p: 890, m: 1050, img: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500', t: ['olive oil for cooking'] },
      { n: 'Amul Pure Ghee 500 ml Pouch', b: 'Amul', u: '500 ml', p: 315, m: 340, img: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=500', t: ['amul ghee 500ml'] },
      { n: 'Patanjali Sarson Tel Kachi Ghani', b: 'Patanjali', u: '1 L Bottle', p: 148, m: 170, img: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500', t: ['patanjali mustard oil'] },
      { n: 'MDH Sambhar Masala South Indian Mix', b: 'MDH', u: '100 g', p: 76, m: 82, img: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500', t: ['sambhar masala', 'mdh'] },
      { n: 'Everest Kitchen King All Purpose Masala', b: 'Everest', u: '100 g', p: 78, m: 85, img: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500', t: ['kitchen king', 'everest'] },
      { n: 'Everest Royal Garam Masala Premium', b: 'Everest', u: '100 g', p: 95, m: 105, img: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500', t: ['royal garam masala', 'everest'] },
      { n: 'Catch Amchur / Dry Mango Powder', b: 'Catch', u: '100 g', p: 58, m: 68, img: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500', t: ['amchur', 'dry mango'] },
      { n: 'Catch Red Chilli Flakes Sprinkler', b: 'Catch', u: '50 g', p: 48, m: 55, img: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500', t: ['chilli flakes', 'pizza'] },
      { n: 'Catch Oregano Herb Seasoning Sprinkler', b: 'Catch', u: '40 g', p: 55, m: 65, img: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500', t: ['oregano', 'seasoning'] },
      { n: 'Moti / Sugar Sulphur Free Pure Cheeni', b: 'Moti Sugar', u: '1 kg', p: 48, m: 55, img: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500', t: ['sugar', 'cheeni', 'sweet'] },
      { n: 'Dhampure Organic Pure Jaggery Powder (Gud)', b: 'Dhampure', u: '500 g', p: 65, m: 80, img: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500', t: ['jaggery powder', 'gud', 'healthy sugar'] },
    ]
  },

  // 6. SNACKS & MUNCHIES (40 items)
  {
    cat: 'munchies', catName: 'Snacks & Munchies',
    items: [
      { n: "Lay's India's Magic Masala Potato Chips", b: "Lay's", u: '50 g', p: 20, m: 20, img: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=500', t: ['lays', 'magic masala', 'chips', 'potato chips', 'snack'] },
      { n: "Lay's Classic Salted Crispy Potato Chips", b: "Lay's", u: '50 g', p: 20, m: 20, img: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=500', t: ['lays classic salted', 'chips'] },
      { n: "Lay's American Style Cream & Onion Chips", b: "Lay's", u: '50 g', p: 20, m: 20, img: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=500', t: ['cream onion', 'lays'] },
      { n: "Lay's Spanish Tomato Tango Chips", b: "Lay's", u: '50 g', p: 20, m: 20, img: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=500', t: ['tomato tango', 'lays'] },
      { n: 'Kurkure Masala Munch Crispy Corn Puffs', b: 'Kurkure', u: '75 g', p: 20, m: 20, img: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=500', t: ['kurkure', 'masala munch', 'tedha hai par mera hai'] },
      { n: 'Kurkure Green Chutney Style Corn Curls', b: 'Kurkure', u: '75 g', p: 20, m: 20, img: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=500', t: ['green chutney kurkure'] },
      { n: "Kurkure Chilli Chatka Spiced Puffs", b: 'Kurkure', u: '75 g', p: 20, m: 20, img: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=500', t: ['chilli chatka kurkure'] },
      { n: "Haldiram's Nagpur Aloo Bhujia Namkeen", b: "Haldiram's", u: '200 g', p: 58, m: 65, img: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=500', t: ['aloo bhujia', 'haldirams', 'namkeen', 'chai snack'] },
      { n: "Haldiram's Bikaneri Bhujia Original", b: "Haldiram's", u: '200 g', p: 60, m: 68, img: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=500', t: ['bikaneri bhujia', 'haldirams'] },
      { n: "Haldiram's Navratan Mixture Rich Dry Fruit Namkeen", b: "Haldiram's", u: '200 g', p: 58, m: 65, img: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=500', t: ['navratan mixture', 'haldirams'] },
      { n: "Haldiram's Moong Dal Crispy Salted", b: "Haldiram's", u: '200 g', p: 58, m: 65, img: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=500', t: ['moong dal namkeen', 'haldirams'] },
      { n: "Haldiram's Khatta Meetha Savoury Mixture", b: "Haldiram's", u: '200 g', p: 55, m: 62, img: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=500', t: ['khatta meetha', 'haldirams'] },
      { n: "Haldiram's Boondi Plain for Raita & Chaat", b: "Haldiram's", u: '200 g', p: 45, m: 50, img: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=500', t: ['boondi', 'raita boondi', 'haldirams'] },
      { n: "Haldiram's Masala Boondi Spicy", b: "Haldiram's", u: '200 g', p: 48, m: 55, img: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=500', t: ['masala boondi'] },
      { n: 'Bikaji Bhujia Sev Special Bikaneri', b: 'Bikaji', u: '200 g', p: 55, m: 62, img: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=500', t: ['bikaji bhujia', 'namkeen'] },
      { n: 'Bikaji Tana-Tan Spiced Corn Flakes Mixture', b: 'Bikaji', u: '200 g', p: 52, m: 60, img: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=500', t: ['bikaji tanatan'] },
      { n: 'Uncle Chipps Spicy Treat Potato Chips', b: 'Uncle Chipps', u: '50 g', p: 20, m: 20, img: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=500', t: ['uncle chipps', 'bole mere lips'] },
      { n: 'Bingo! Mad Angles Achaari Masti Corn Chips', b: 'Bingo', u: '66 g', p: 20, m: 20, img: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=500', t: ['bingo mad angles', 'achaari'] },
      { n: 'Bingo! Tedhe Medhe Masala Tadka Snack', b: 'Bingo', u: '75 g', p: 20, m: 20, img: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=500', t: ['tedhe medhe', 'bingo'] },
      { n: 'Pringles Original Salted Potato Crisps Can', b: 'Pringles', u: '107 g Can', p: 110, m: 130, img: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=500', t: ['pringles original', 'chips can'] },
      { n: 'Pringles Sour Cream & Onion Crisps Can', b: 'Pringles', u: '107 g Can', p: 110, m: 130, img: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=500', t: ['pringles sour cream', 'chips'] },
      { n: 'Doritos Cheese Supreme Nacho Chips', b: 'Doritos', u: '75 g', p: 35, m: 40, img: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=500', t: ['doritos', 'nachos', 'cheese nachos'] },
      { n: 'Doritos Sweet Chilli Flavour Nachos', b: 'Doritos', u: '75 g', p: 35, m: 40, img: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=500', t: ['doritos sweet chilli'] },
      { n: 'Cornitos Nacho Crisps Barbeque', b: 'Cornitos', u: '60 g', p: 45, m: 50, img: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=500', t: ['cornitos', 'nachos'] },
      { n: 'Cornitos Nacho Crisps Salsa Dip Combo', b: 'Cornitos', u: '70 g Pack', p: 65, m: 75, img: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=500', t: ['cornitos salsa combo'] },
      { n: 'Act II Golden Sizzle Butter Instant Popcorn', b: 'Act II', u: '70 g', p: 30, m: 35, img: 'https://images.unsplash.com/photo-1578849278619-e73505e9610f?w=500', t: ['popcorn', 'act ii', 'butter popcorn'] },
      { n: 'Act II Classic Salted Microwave Popcorn', b: 'Act II', u: '85 g', p: 35, m: 40, img: 'https://images.unsplash.com/photo-1578849278619-e73505e9610f?w=500', t: ['microwave popcorn', 'act ii'] },
      { n: "Haldiram's Lite Chiwda Diet Snack", b: "Haldiram's", u: '150 g', p: 45, m: 50, img: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=500', t: ['lite chiwda', 'diet snack'] },
      { n: "Haldiram's Roasted Diet Makhana Salted", b: "Haldiram's", u: '30 g', p: 48, m: 55, img: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=500', t: ['makhana', 'foxnuts', 'diet'] },
      { n: '4700BC Gourmet Popcorn Himalayan Salt Caramel', b: '4700BC', u: '65 g Tin', p: 85, m: 99, img: 'https://images.unsplash.com/photo-1578849278619-e73505e9610f?w=500', t: ['4700bc', 'caramel popcorn'] },
      { n: "Haldiram's Mathri Crispy Traditional", b: "Haldiram's", u: '200 g', p: 65, m: 75, img: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=500', t: ['mathri', 'chai snack'] },
      { n: "Haldiram's Mini Samosa Cocktail Snack", b: "Haldiram's", u: '200 g', p: 65, m: 75, img: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=500', t: ['mini samosa', 'namkeen'] },
      { n: "Haldiram's Kaju Mixture Dry Fruit Namkeen", b: "Haldiram's", u: '200 g', p: 120, m: 140, img: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=500', t: ['kaju mixture', 'rich namkeen'] },
      { n: 'Too Yumm! Karare Munchy Masala Baked Snack', b: 'Too Yumm!', u: '75 g', p: 20, m: 20, img: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=500', t: ['too yumm', 'baked not fried'] },
      { n: 'Too Yumm! Multigrain Chips Tangy Tomato', b: 'Too Yumm!', u: '54 g', p: 20, m: 20, img: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=500', t: ['multigrain chips', 'too yumm'] },
      { n: 'Bikano Rasgulla Sweet Tin 100% Pure Veg', b: 'Bikano', u: '500 g Tin', p: 125, m: 145, img: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=500', t: ['rasgulla', 'bikano', 'mithai'] },
      { n: 'Bikaji Bhujia Sev Family Value Pack', b: 'Bikaji', u: '1 kg Big Bag', p: 250, m: 290, img: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=500', t: ['bhujia 1kg', 'bikaji'] },
      { n: "Haldiram's Soan Papdi Pure Desi Ghee", b: "Haldiram's", u: '250 g Box', p: 95, m: 110, img: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=500', t: ['soan papdi', 'mithai', 'ghee'] },
      { n: "Lay's Wafer Style Salted Thin Potato Chips", b: "Lay's", u: '50 g', p: 20, m: 20, img: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=500', t: ['wafer style', 'lays'] },
      { n: "Kurkure Puffcorn Yummy Cheese Puffs", b: 'Kurkure', u: '55 g', p: 20, m: 20, img: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=500', t: ['puffcorn', 'cheese puffs', 'kurkure'] },
    ]
  },

  // 7. BAKERY & BISCUITS (35 items)
  {
    cat: 'bakery_biscuits', catName: 'Bakery & Biscuits',
    items: [
      { n: 'Parle-G Gold Original Gluco Biscuits', b: 'Parle', u: '1 kg Family Pack', p: 95, m: 110, img: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=500', t: ['parle-g', 'gluco biscuit', 'chai biscuit', 'daily routine'] },
      { n: 'Britannia Good Day Cashew Almond Cookies', b: 'Britannia', u: '200 g', p: 40, m: 45, img: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=500', t: ['good day', 'cookies', 'cashew', 'britannia'] },
      { n: 'Britannia Good Day Butter Cookies Pack', b: 'Britannia', u: '200 g', p: 38, m: 45, img: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=500', t: ['good day butter', 'cookies'] },
      { n: 'Britannia Marie Gold Crisp Tea Biscuits', b: 'Britannia', u: '250 g', p: 35, m: 40, img: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=500', t: ['marie gold', 'tea biscuit', 'light'] },
      { n: 'Oreo Original Vanilla Creme Sandwich Biscuits', b: 'Cadbury Oreo', u: '120 g', p: 35, m: 40, img: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=500', t: ['oreo', 'vanilla creme', 'sandwich biscuit'] },
      { n: 'Oreo Chocolate Creme Sandwich Biscuits', b: 'Cadbury Oreo', u: '120 g', p: 35, m: 40, img: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=500', t: ['oreo chocolate', 'biscuit'] },
      { n: 'Sunfeast Dark Fantasy Choco Fills Crunchy Cookies', b: 'Sunfeast', u: '300 g Mega Pack', p: 120, m: 150, img: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=500', t: ['dark fantasy', 'choco fills', 'cookies', 'chocolate'] },
      { n: 'Britannia Bourbon Chocolate Sandwich Biscuits', b: 'Britannia', u: '150 g', p: 30, m: 35, img: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=500', t: ['bourbon', 'chocolate biscuit'] },
      { n: 'Britannia NutriChoice Digestive High Fibre Biscuits', b: 'Britannia', u: '250 g', p: 55, m: 65, img: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=500', t: ['nutrichoice', 'digestive', 'healthy biscuit'] },
      { n: 'Britannia NutriChoice 5 Grain Oats & Honey Cookies', b: 'Britannia', u: '150 g', p: 50, m: 60, img: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=500', t: ['nutrichoice 5 grain', 'oats cookies'] },
      { n: 'Britannia Premium Bake Rusk Real Elaichi', b: 'Britannia', u: '300 g', p: 48, m: 55, img: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=500', t: ['rusk', 'toast', 'chai rusk', 'elaichi'] },
      { n: 'Britannia Toastea Milk & Butter Rusk', b: 'Britannia', u: '300 g', p: 50, m: 58, img: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=500', t: ['toastea', 'milk rusk'] },
      { n: 'Parle Monaco Salted Crunchy Crackers', b: 'Parle', u: '200 g', p: 30, m: 35, img: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=500', t: ['monaco', 'salted crackers'] },
      { n: 'Parle Krackjack Sweet & Salty Biscuits', b: 'Parle', u: '200 g', p: 30, m: 35, img: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=500', t: ['krackjack', 'sweet salty'] },
      { n: 'Parle Hide & Seek Chocolate Chip Cookies', b: 'Parle', u: '120 g', p: 30, m: 35, img: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=500', t: ['hide and seek', 'choco chip cookies'] },
      { n: 'Parle 20-20 Cashew Cookies Value Pack', b: 'Parle', u: '200 g', p: 30, m: 35, img: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=500', t: ['20-20 cookies', 'cashew'] },
      { n: 'Britannia Little Hearts Sugar Glazed Classic Biscuits', b: 'Britannia', u: '75 g', p: 20, m: 20, img: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=500', t: ['little hearts', 'sugar glazed'] },
      { n: 'Britannia Treat Jim Jam Cream Biscuits', b: 'Britannia', u: '138 g', p: 35, m: 40, img: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=500', t: ['jim jam', 'jam biscuit'] },
      { n: 'Britannia 50-50 Maska Chaska Herb Biscuits', b: 'Britannia', u: '150 g', p: 30, m: 35, img: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=500', t: ['maska chaska', '50-50'] },
      { n: 'Britannia 50-50 Sweet & Salty Classic', b: 'Britannia', u: '150 g', p: 28, m: 32, img: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=500', t: ['50-50 sweet salty'] },
      { n: 'Britannia Milk Bikis Cream Biscuits', b: 'Britannia', u: '120 g', p: 25, m: 30, img: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=500', t: ['milk bikis', 'kids'] },
      { n: 'Sunfeast Mom’s Magic Cashew & Almond Cookies', b: 'Sunfeast', u: '200 g', p: 40, m: 45, img: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=500', t: ['moms magic', 'cookies'] },
      { n: 'Sunfeast Bounce Choco Creme Biscuits', b: 'Sunfeast', u: '100 g', p: 15, m: 15, img: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=500', t: ['bounce', 'creme biscuit'] },
      { n: 'Unibic Choco Chip Cookies Box', b: 'Unibic', u: '150 g', p: 60, m: 75, img: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=500', t: ['unibic', 'choco chip'] },
      { n: 'Unibic Fruit & Nut Cookies Box', b: 'Unibic', u: '150 g', p: 60, m: 75, img: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=500', t: ['unibic fruit nut'] },
      { n: 'Britannia Cake Fruity Fun Sponge Slice Cake', b: 'Britannia', u: '120 g (6 Slices)', p: 35, m: 40, img: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500', t: ['fruit cake', 'britannia cake', '100% veg'] },
      { n: 'Britannia Choco Chill Bar Cake 100% Veg', b: 'Britannia', u: '120 g', p: 40, m: 45, img: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500', t: ['bar cake', 'choco cake', 'veg cake'] },
      { n: 'Winkies Swiss Roll Chocolate Cream Cake', b: 'Winkies', u: '160 g (4 pcs)', p: 50, m: 60, img: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500', t: ['swiss roll', 'cake'] },
      { n: 'Lotte Choco Pie Double Chocolate (100% Pure Veg)', b: 'Lotte', u: '6 pcs Box (168g)', p: 90, m: 110, img: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500', t: ['choco pie', 'lotte', 'marshmallow free', 'pure veg'] },
      { n: 'Bonn Eggless Fruit Cake Loaf', b: 'Bonn', u: '250 g Loaf', p: 65, m: 75, img: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500', t: ['eggless cake', 'fruit loaf'] },
      { n: 'Britannia NutriChoice Sugar Free Crackers', b: 'Britannia', u: '150 g', p: 45, m: 50, img: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=500', t: ['sugar free biscuits', 'crackers'] },
      { n: 'Parle Milano Centre Filled Choco Hazelnut Cookies', b: 'Parle', u: '75 g', p: 35, m: 40, img: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=500', t: ['milano', 'hazelnut cookies'] },
      { n: 'Dukes Waffy Chocolate Wafer Rolls', b: 'Dukes', u: '150 g', p: 45, m: 55, img: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=500', t: ['waffy', 'wafer rolls'] },
      { n: 'Dukes Waffy Strawberry Flavoured Wafers', b: 'Dukes', u: '75 g', p: 25, m: 30, img: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=500', t: ['strawberry wafer'] },
      { n: 'Patanjali Doodh Biscuits Pure Cow Milk Biscuits', b: 'Patanjali', u: '300 g', p: 40, m: 45, img: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=500', t: ['patanjali doodh biscuit'] },
    ]
  },

  // 8. INSTANT & PACKAGED FOOD (35 items)
  {
    cat: 'instant_food', catName: 'Instant & Packaged Food',
    items: [
      { n: 'Nestle Maggi 2-Minute Masala Instant Noodles', b: 'Maggi', u: '4 Pack (280 g)', p: 56, m: 60, img: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500', t: ['maggi', 'masala noodles', 'instant food', 'midnight craving'] },
      { n: 'Nestle Maggi 2-Minute Masala Family Mega Pack', b: 'Maggi', u: '12 Pack (840 g)', p: 165, m: 180, img: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500', t: ['maggi 12 pack', 'family noodles'] },
      { n: 'Nestle Maggi Special Masala Spicy Noodles', b: 'Maggi', u: '4 Pack (288 g)', p: 68, m: 76, img: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500', t: ['maggi special masala'] },
      { n: 'Nestle Maggi Nutri-licious Atta Masala Noodles', b: 'Maggi', u: '4 Pack (290 g)', p: 95, m: 110, img: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500', t: ['atta maggi', 'healthy noodles'] },
      { n: 'Sunfeast YiPPee! Magic Masala Instant Noodles', b: 'YiPPee!', u: '4 Pack (240 g)', p: 52, m: 58, img: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500', t: ['yippee noodles', 'magic masala'] },
      { n: 'Ching’s Secret Schezwan Instant Noodles', b: 'Ching’s', u: '4 Pack (240 g)', p: 55, m: 60, img: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500', t: ['chings schezwan', 'chinese noodles'] },
      { n: 'Ching’s Secret Hakka Noodles Family Pack', b: 'Ching’s', u: '600 g', p: 85, m: 95, img: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500', t: ['hakka noodles', 'chowmein'] },
      { n: 'Ching’s Secret Schezwan Chutney Dip & Spread', b: 'Ching’s', u: '250 g Bottle', p: 80, m: 90, img: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500', t: ['schezwan chutney', 'chings dip'] },
      { n: 'Kissan Fresh Tomato Ketchup Squeezy Bottle', b: 'Kissan', u: '950 g Squeezy', p: 125, m: 155, img: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500', t: ['kissan ketchup', 'tomato sauce'] },
      { n: 'Maggi Hot & Sweet Chilli Tomato Sauce', b: 'Maggi', u: '500 g Bottle', p: 110, m: 130, img: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500', t: ['hot and sweet sauce', 'maggi ketchup'] },
      { n: 'Veeba Veg Eggless Mayonnaise Classic', b: 'Veeba', u: '250 g Bottle', p: 75, m: 89, img: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500', t: ['mayo', 'eggless mayonnaise', 'veeba', 'sandwich'] },
      { n: 'Veeba Burger Eggless Creamy Sauce', b: 'Veeba', u: '275 g Bottle', p: 85, m: 99, img: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500', t: ['burger sauce', 'veeba'] },
      { n: 'Veeba Pizza & Pasta Sauce Italian Style', b: 'Veeba', u: '280 g Bottle', p: 85, m: 99, img: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500', t: ['pizza sauce', 'pasta sauce'] },
      { n: 'Knorr Classic Thick Tomato Soup Mix', b: 'Knorr', u: '53 g (4 Servings)', p: 45, m: 50, img: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=500', t: ['tomato soup', 'knorr'] },
      { n: 'Knorr Sweet Corn Veg Soup Mix', b: 'Knorr', u: '43 g', p: 45, m: 50, img: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=500', t: ['sweet corn soup', 'knorr'] },
      { n: 'Knorr Hot & Sour Veg Soup Mix', b: 'Knorr', u: '43 g', p: 45, m: 50, img: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=500', t: ['hot sour soup', 'chinese'] },
      { n: 'MTR Ready-To-Eat Shahi Paneer Curry', b: 'MTR', u: '300 g', p: 110, m: 130, img: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500', t: ['ready to eat', 'shahi paneer', 'mtr meal'] },
      { n: 'MTR Ready-To-Eat Dal Makhani Feast', b: 'MTR', u: '300 g', p: 99, m: 120, img: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500', t: ['dal makhani', 'mtr'] },
      { n: 'MTR Ready-To-Eat Chana Masala Meal', b: 'MTR', u: '300 g', p: 95, m: 115, img: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500', t: ['ready chana masala', 'mtr'] },
      { n: 'Quaker 100% Natural Rolled Wholegrain Oats', b: 'Quaker', u: '1 kg Bag', p: 175, m: 215, img: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500', t: ['quaker oats', 'healthy breakfast', 'fibre'] },
      { n: 'Saffola Masala Oats Classic Masala Flavour', b: 'Saffola', u: '500 g', p: 165, m: 195, img: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500', t: ['masala oats', 'saffola'] },
      { n: 'Saffola Masala Oats Peppy Tomato Spicy', b: 'Saffola', u: '500 g', p: 165, m: 195, img: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500', t: ['peppy tomato oats'] },
      { n: "Kellogg's Original Corn Flakes with Iron & Vitamin C", b: "Kellogg's", u: '875 g Family Box', p: 295, m: 360, img: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500', t: ['corn flakes', 'kelloggs', 'breakfast cereal'] },
      { n: "Kellogg's Chocos Crunchy Chocolate Bites", b: "Kellogg's", u: '375 g Box', p: 165, m: 190, img: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500', t: ['chocos', 'kids cereal', 'chocolate bites'] },
      { n: "Kellogg's Muesli with Fruit & Nut Crunch", b: "Kellogg's", u: '500 g', p: 285, m: 345, img: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500', t: ['muesli', 'fruit nut muesli'] },
      { n: 'Pintola All Natural 100% Peanut Butter Creamy', b: 'Pintola', u: '1 kg Jar', p: 380, m: 450, img: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500', t: ['peanut butter', 'pintola', 'gym protein'] },
      { n: 'Pintola Crunchy High Protein Peanut Butter', b: 'Pintola', u: '1 kg Jar', p: 380, m: 450, img: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500', t: ['crunchy peanut butter'] },
      { n: 'Nutella Hazelnut Cocoa Spread Jar', b: 'Nutella', u: '350 g Jar', p: 345, m: 395, img: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500', t: ['nutella', 'hazelnut spread', 'toast'] },
      { n: 'Kissan Mixed Fruit Jam Sweet Spread', b: 'Kissan', u: '500 g Glass Jar', p: 145, m: 175, img: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500', t: ['kissan jam', 'mixed fruit jam', 'bread'] },
      { n: 'Bambino Macaroni Pasta 100% Durum Wheat', b: 'Bambino', u: '500 g', p: 48, m: 58, img: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500', t: ['macaroni', 'pasta', 'bambino'] },
      { n: 'Bambino Penne Pasta 100% Suji Durum Wheat', b: 'Bambino', u: '500 g', p: 52, m: 62, img: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500', t: ['penne pasta', 'italian'] },
      { n: 'Bambino Roasted Vermicelli (Sewai)', b: 'Bambino', u: '400 g', p: 42, m: 50, img: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500', t: ['vermicelli', 'sewai', 'kheer'] },
      { n: 'Mothers Recipe Mixed Pickle (Achar)', b: 'Mothers Recipe', u: '400 g Jar', p: 85, m: 99, img: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500', t: ['mixed pickle', 'achar'] },
      { n: 'Mothers Recipe Mango Pickle (Aam ka Achar)', b: 'Mothers Recipe', u: '400 g Jar', p: 85, m: 99, img: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500', t: ['mango pickle', 'aam achar'] },
      { n: 'Samyang Hot Buldak Veg 2x Spicy Korean Noodles', b: 'Samyang', u: '140 g Pack', p: 135, m: 155, img: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500', t: ['korean noodles', 'spicy ramen', 'buldak veg'] },
    ]
  },

  // 9. TEA, COFFEE & BEVERAGES (35 items)
  {
    cat: 'tea_coffee', catName: 'Tea, Coffee & Drinks',
    items: [
      { n: 'Tata Tea Gold Leaf Premium Black Tea', b: 'Tata Tea', u: '500 g', p: 275, m: 310, img: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=500', t: ['tata tea gold', 'chai patti', 'morning tea'] },
      { n: 'Tata Tea Premium Desh ki Chai', b: 'Tata Tea', u: '1 kg Bag', p: 440, m: 490, img: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=500', t: ['tata tea premium', '1kg tea'] },
      { n: 'Brooke Bond Red Label Strong Tea', b: 'Red Label', u: '500 g', p: 260, m: 295, img: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=500', t: ['red label', 'chai'] },
      { n: 'Brooke Bond Red Label Natural Care Spiced Tea', b: 'Red Label', u: '500 g', p: 310, m: 360, img: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=500', t: ['natural care tea', 'herbal chai'] },
      { n: 'Brooke Bond Taj Mahal Premium Tea Leaves', b: 'Taj Mahal', u: '500 g', p: 340, m: 390, img: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=500', t: ['taj mahal tea', 'wah taj'] },
      { n: 'Wagh Bakri Premium CTC Tea', b: 'Wagh Bakri', u: '500 g', p: 250, m: 285, img: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=500', t: ['wagh bakri', 'ctc tea'] },
      { n: 'Nescafe Classic 100% Pure Instant Coffee Glass Jar', b: 'Nescafe', u: '100 g Glass Jar', p: 310, m: 350, img: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=500', t: ['nescafe classic', 'coffee', 'hot coffee'] },
      { n: 'Nescafe Sunrise Rich Chicory Coffee Blend', b: 'Nescafe', u: '200 g Pouch', p: 340, m: 385, img: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=500', t: ['sunrise coffee', 'chicory'] },
      { n: 'Bru Instant Coffee Blend with Roasted Beans', b: 'Bru', u: '100 g Jar', p: 220, m: 255, img: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=500', t: ['bru coffee', 'instant coffee'] },
      { n: 'Nescafe Gold Rich & Smooth Premium Coffee', b: 'Nescafe', u: '100 g Jar', p: 575, m: 650, img: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=500', t: ['nescafe gold', 'premium coffee'] },
      { n: 'Hamdard Rooh Afza Sharbat Herbal Rose Drink', b: 'Rooh Afza', u: '750 ml Bottle', p: 165, m: 180, img: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500', t: ['rooh afza', 'rose sharbat', 'summer drink'] },
      { n: 'Real Fruit Power Mixed Fruit Juice Tetra Pak', b: 'Real', u: '1 L', p: 115, m: 130, img: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500', t: ['real juice', 'mixed fruit juice'] },
      { n: 'Real Fruit Power Sweet Mango Nectar', b: 'Real', u: '1 L', p: 110, m: 125, img: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500', t: ['mango juice', 'real'] },
      { n: 'Real Fruit Power Cranberry Juice', b: 'Real', u: '1 L', p: 135, m: 155, img: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500', t: ['cranberry juice', 'real'] },
      { n: 'Frooti Fresh Real Mango Juice Drink', b: 'Frooti', u: '1.2 L Bottle', p: 65, m: 75, img: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500', t: ['frooti', 'mango drink'] },
      { n: 'Maaza Mango Drink Real Pulp', b: 'Maaza', u: '1.2 L Bottle', p: 68, m: 78, img: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500', t: ['maaza', 'mango pulp'] },
      { n: 'Thums Up Charged Fizzy Strong Cola', b: 'Thums Up', u: '750 ml Bottle', p: 40, m: 40, img: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500', t: ['thums up', 'taste the thunder', 'cold drink'] },
      { n: 'Coca-Cola Original Fizzy Soft Drink', b: 'Coca-Cola', u: '750 ml Bottle', p: 40, m: 40, img: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500', t: ['coca cola', 'coke'] },
      { n: 'Sprite Clear Lemon Lime Carbonated Drink', b: 'Sprite', u: '750 ml Bottle', p: 40, m: 40, img: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500', t: ['sprite', 'clear hai'] },
      { n: 'Limca Fresh Fizzy Lemon Drink', b: 'Limca', u: '750 ml Bottle', p: 40, m: 40, img: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500', t: ['limca', 'lemon drink'] },
      { n: 'Fanta Orange Sparkle Fizzy Soda', b: 'Fanta', u: '750 ml Bottle', p: 40, m: 40, img: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500', t: ['fanta orange'] },
      { n: 'Diet Coke Sugar-Free Zero Calorie Can', b: 'Coca-Cola', u: '300 ml Can', p: 40, m: 45, img: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500', t: ['diet coke', 'sugar free'] },
      { n: 'Red Bull Energy Drink Carbonated Can', b: 'Red Bull', u: '250 ml Can', p: 125, m: 130, img: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=500', t: ['red bull', 'energy drink'] },
      { n: 'Bisleri Purified Mineral Water with Minerals', b: 'Bisleri', u: '1 L Bottle', p: 20, m: 20, img: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500', t: ['bisleri water', 'mineral water', 'paani'] },
      { n: 'Bisleri Packaged Drinking Water Pack', b: 'Bisleri', u: '5 L Can', p: 65, m: 70, img: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500', t: ['bisleri 5 litre'] },
      { n: 'Kinley Club Soda Extra Punch Fizzy Bottle', b: 'Kinley', u: '750 ml', p: 20, m: 20, img: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500', t: ['club soda', 'kinley'] },
      { n: 'Glucon-D Instant Energy Tangy Orange Drink', b: 'Glucon-D', u: '1 kg Box', p: 280, m: 320, img: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500', t: ['glucon-d', 'glucose', 'summer'] },
      { n: 'Bournvita Health & Nutrition Malt Drink', b: 'Cadbury', u: '1 kg Jar', p: 380, m: 430, img: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=500', t: ['bournvita', 'health drink', 'chocolate milk'] },
      { n: 'Horlicks Classic Malt Nutrition Drink', b: 'Horlicks', u: '1 kg Jar', p: 395, m: 445, img: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=500', t: ['horlicks', 'malt drink'] },
      { n: 'Complan NutriGro Nutrition Chocolate Flavour', b: 'Complan', u: '500 g', p: 280, m: 320, img: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=500', t: ['complan', 'kids drink'] },
      { n: 'Tetley Pure Green Tea Bags with Antioxidants', b: 'Tetley', u: '100 Tea Bags Box', p: 450, m: 520, img: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=500', t: ['green tea', 'tetley', 'weight loss'] },
      { n: 'Lipton Pure & Light Green Tea Bags', b: 'Lipton', u: '25 Tea Bags', p: 155, m: 180, img: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=500', t: ['lipton green tea'] },
      { n: 'Paper Boat Aamras Real Mango Drink', b: 'Paper Boat', u: '200 ml Pouch', p: 35, m: 40, img: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500', t: ['paper boat', 'aamras'] },
      { n: 'Paper Boat Jaljeera Tangy Cumin Drink', b: 'Paper Boat', u: '200 ml Pouch', p: 35, m: 40, img: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500', t: ['jaljeera', 'paper boat'] },
      { n: 'Raw Pressery 100% Coconut Water Bottle', b: 'Raw Pressery', u: '200 ml Bottle', p: 60, m: 70, img: 'https://images.unsplash.com/photo-1525385133512-2f3bdd039054?w=500', t: ['coconut water', 'cold pressed'] },
    ]
  },

  // 10. SWEETS & CHOCOLATES (30 items)
  {
    cat: 'sweets_chocolates', catName: 'Sweets & Chocolates',
    items: [
      { n: 'Cadbury Dairy Milk Silk Chocolate Bar', b: 'Cadbury', u: '150 g', p: 165, m: 185, img: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=500', t: ['dairy milk silk', 'cadbury', 'chocolate', 'sweet'] },
      { n: 'Cadbury Dairy Milk Silk Roast Almond Bar', b: 'Cadbury', u: '143 g', p: 175, m: 195, img: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=500', t: ['silk roast almond', 'chocolate'] },
      { n: 'Cadbury Dairy Milk Silk Fruit & Nut Bar', b: 'Cadbury', u: '137 g', p: 175, m: 195, img: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=500', t: ['silk fruit nut'] },
      { n: 'Cadbury Dairy Milk Family Pack Bar', b: 'Cadbury', u: '130 g', p: 100, m: 110, img: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=500', t: ['dairy milk', 'chocolate'] },
      { n: 'Nestle KitKat 4 Finger Crispy Wafer Bar', b: 'Nestle', u: '37.3 g (Pack of 2)', p: 40, m: 45, img: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=500', t: ['kitkat', 'have a break', 'wafer chocolate'] },
      { n: 'Nestle KitKat Dessert Delight Truffle', b: 'Nestle', u: '50 g', p: 60, m: 70, img: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=500', t: ['kitkat truffle'] },
      { n: 'Cadbury 5 Star Crunchy Caramel Chocolate Bar', b: 'Cadbury', u: '40 g (Pack of 3)', p: 60, m: 60, img: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=500', t: ['5 star', 'caramel chocolate'] },
      { n: 'Cadbury Celebrations Rich Dry Fruit Gift Box', b: 'Cadbury', u: '177 g Gift Box', p: 250, m: 300, img: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=500', t: ['cadbury celebrations', 'gift box'] },
      { n: 'Ferrero Rocher Premium Hazelnut Pralines Box', b: 'Ferrero Rocher', u: '16 pcs Box (200g)', p: 495, m: 595, img: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=500', t: ['ferrero rocher', 'luxury chocolate'] },
      { n: 'Amul Dark Chocolate 55% Cocoa Rich Bar', b: 'Amul', u: '150 g', p: 105, m: 120, img: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=500', t: ['dark chocolate', 'amul'] },
      { n: 'Amul Sugar Free Dark Chocolate Bar', b: 'Amul', u: '150 g', p: 130, m: 150, img: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=500', t: ['sugar free chocolate'] },
      { n: 'Nestle Munch Crunchy Wafer Bar Pack', b: 'Nestle', u: '4 pcs Pack', p: 40, m: 40, img: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=500', t: ['munch', 'crunchy wafer'] },
      { n: 'Kinder Joy with Surprise Toy (Blue Edition)', b: 'Kinder', u: '20 g', p: 45, m: 50, img: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=500', t: ['kinder joy', 'toy'] },
      { n: 'Kinder Joy with Surprise Toy (Pink Edition)', b: 'Kinder', u: '20 g', p: 45, m: 50, img: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=500', t: ['kinder joy pink'] },
      { n: "Haldiram's Kaju Katli Pure Silver Vark Sweet", b: "Haldiram's", u: '200 g Box', p: 240, m: 280, img: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=500', t: ['kaju katli', 'mithai', 'haldirams'] },
      { n: "Haldiram's Gulab Jamun Pure Desi Ghee Tin", b: "Haldiram's", u: '1 kg Tin', p: 225, m: 260, img: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=500', t: ['gulab jamun', 'haldirams', 'desi ghee'] },
      { n: "Haldiram's Rasgulla Spongy Sweet Tin", b: "Haldiram's", u: '1 kg Tin', p: 210, m: 250, img: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=500', t: ['rasgulla', 'spongy sweet'] },
      { n: "Haldiram's Cham Cham Traditional Bengali Sweet", b: "Haldiram's", u: '500 g Box', p: 160, m: 190, img: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=500', t: ['cham cham', 'mithai'] },
      { n: 'Bikaji Soan Papdi Pure Cow Ghee Special', b: 'Bikaji', u: '500 g Box', p: 180, m: 210, img: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=500', t: ['soan papdi', 'bikaji'] },
      { n: 'Snickers Peanut Caramel Chocolate Bar (Veg Edition)', b: 'Snickers', u: '45 g (Pack of 2)', p: 80, m: 90, img: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=500', t: ['snickers', 'peanut chocolate', 'pure veg'] },
      { n: 'Cadbury Perk Crisp Wafer Bar (Pack of 4)', b: 'Cadbury', u: '4 pcs', p: 20, m: 20, img: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=500', t: ['perk', 'wafer'] },
      { n: 'Cadbury Gems Colorful Button Candies Box', b: 'Cadbury', u: '100 g', p: 40, m: 45, img: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=500', t: ['gems', 'candies'] },
      { n: 'Center Fresh Spearmint Chewing Gum Tub', b: 'Center Fresh', u: '200 g (100 pcs)', p: 99, m: 120, img: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=500', t: ['center fresh', 'gum'] },
      { n: 'Mentos Pure Fresh Mint Rolls Box', b: 'Mentos', u: '5 Rolls Pack', p: 50, m: 60, img: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=500', t: ['mentos', 'fresh breath'] },
      { n: 'Chupa Chups Sour Bites Chewy Candy', b: 'Chupa Chups', u: '90 g', p: 35, m: 40, img: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=500', t: ['sour bites', 'candy'] },
      { n: 'Pulse Kachha Aam Tangy Candy Bag', b: 'Pass Pass Pulse', u: '200 g Bag', p: 60, m: 70, img: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=500', t: ['pulse candy', 'kachha aam'] },
      { n: 'Hershey’s Kisses Milk Chocolate Pack', b: 'Hershey’s', u: '100 g Pouch', p: 140, m: 165, img: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=500', t: ['hersheys kisses', 'chocolate'] },
      { n: 'Hershey’s Chocolate Syrup Bottle', b: 'Hershey’s', u: '623 g Squeezy', p: 215, m: 250, img: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=500', t: ['hersheys syrup', 'chocolate milkshake'] },
      { n: 'Amul Choco Cracker Milk Chocolate Bar', b: 'Amul', u: '150 g', p: 95, m: 110, img: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=500', t: ['amul chocolate'] },
      { n: 'Bikaji Motichoor Ladoo Pure Desi Ghee', b: 'Bikaji', u: '400 g Box', p: 175, m: 200, img: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=500', t: ['motichoor ladoo', 'desi ghee mithai'] },
    ]
  },

  // 11. CLEANING & HOUSEHOLD (30 items)
  {
    cat: 'cleaning_household', catName: 'Cleaning & Household',
    items: [
      { n: 'Surf Excel Easy Wash Detergent Powder Bag', b: 'Surf Excel', u: '1 kg', p: 135, m: 155, img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500', t: ['surf excel', 'detergent powder', 'washing'] },
      { n: 'Surf Excel Matic Top Load Liquid Detergent', b: 'Surf Excel', u: '1 L Bottle', p: 215, m: 250, img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500', t: ['liquid detergent', 'surf matic'] },
      { n: 'Tide Plus Extra Power Detergent Powder (Jasmine & Rose)', b: 'Tide', u: '1 kg', p: 110, m: 130, img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500', t: ['tide', 'detergent'] },
      { n: 'Ariel Matic Front Load Detergent Powder', b: 'Ariel', u: '1 kg', p: 245, m: 285, img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500', t: ['ariel matic', 'front load'] },
      { n: 'Vim Dishwash Gel Lemon Anti-Bacterial Pouch', b: 'Vim', u: '750 ml Pouch', p: 130, m: 155, img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500', t: ['vim gel', 'dishwash gel', 'bartan'] },
      { n: 'Vim Dishwash Bar with Lemon Fragrance', b: 'Vim', u: '300 g (Pack of 3)', p: 45, m: 50, img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500', t: ['vim bar', 'dishwash soap'] },
      { n: 'Harpic Power Plus Original Disinfectant Toilet Cleaner', b: 'Harpic', u: '1 L Bottle', p: 195, m: 230, img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500', t: ['harpic', 'toilet cleaner', 'hygiene'] },
      { n: 'Lizol Floral Disinfectant Surface Floor Cleaner', b: 'Lizol', u: '1 L Bottle', p: 198, m: 235, img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500', t: ['lizol', 'floor cleaner', 'germ killer'] },
      { n: 'Colin Glass & Household Surface Cleaner Spray', b: 'Colin', u: '500 ml Spray', p: 95, m: 110, img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500', t: ['colin', 'glass cleaner'] },
      { n: 'Good Knight Gold Flash Liquid Mosquito Vaporizer Refill', b: 'Good Knight', u: 'Pack of 2 (45ml each)', p: 145, m: 165, img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500', t: ['good knight', 'mosquito refill', 'all out'] },
      { n: 'All Out Ultra Power+ Liquid Refill', b: 'All Out', u: 'Pack of 2 Refills', p: 140, m: 160, img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500', t: ['all out', 'mosquito'] },
      { n: 'Hit Flying Insect Killer Spray (Lime Fragrance)', b: 'Hit', u: '400 ml Spray Can', p: 185, m: 215, img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500', t: ['black hit', 'mosquito spray'] },
      { n: 'Red Hit Cockroach Killer Spray with Deep Reach Nozzle', b: 'Hit', u: '400 ml Can', p: 195, m: 225, img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500', t: ['red hit', 'cockroach killer'] },
      { n: 'Scotch-Brite Heavy Duty Green Scrub Pad Pack', b: 'Scotch-Brite', u: 'Pack of 3 Pads', p: 40, m: 45, img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500', t: ['scotch brite', 'scrubber'] },
      { n: 'Scotch-Brite Sponge Wipe Cellulose Reusable', b: 'Scotch-Brite', u: 'Pack of 3 Wipes', p: 120, m: 140, img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500', t: ['sponge wipe', 'kitchen cloth'] },
      { n: 'Comfort After Wash Fabric Conditioner (Morning Fresh)', b: 'Comfort', u: '860 ml Bottle', p: 215, m: 250, img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500', t: ['comfort', 'fabric conditioner'] },
      { n: 'Gala Dust Pan with Ergonomic Long Handle', b: 'Gala', u: '1 pc', p: 95, m: 120, img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500', t: ['dust pan', 'gala'] },
      { n: 'Gala NoDust Broom (Jhadu Plastic Fiber)', b: 'Gala', u: '1 pc', p: 155, m: 185, img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500', t: ['gala jhadu', 'broom'] },
      { n: 'Origami Soft 2-Ply Kitchen Tissue Paper Roll', b: 'Origami', u: '2 Rolls Pack (120 Pulls)', p: 110, m: 130, img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500', t: ['kitchen tissue', 'paper roll'] },
      { n: 'Origami Super Soft 3-Ply Toilet Paper Rolls', b: 'Origami', u: '4 Rolls Pack', p: 145, m: 175, img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500', t: ['toilet paper', 'tissue rolls'] },
      { n: 'Freshwrap Aluminum Foil Food Grade', b: 'Freshwrap', u: '18 m Roll', p: 115, m: 135, img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500', t: ['aluminium foil', 'roti wrap'] },
      { n: 'Odonil Room Air Freshener Blocks (Assorted 4 Flavours)', b: 'Odonil', u: 'Pack of 4 Blocks (200g)', p: 175, m: 210, img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500', t: ['odonil', 'bathroom freshener'] },
      { n: 'Godrej aer Pocket Bathroom Fragrance Gel (Fresh Lush Green)', b: 'Godrej aer', u: 'Pack of 3 Pockets', p: 150, m: 180, img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500', t: ['godrej aer pocket', 'air freshener'] },
      { n: 'Dettol Disinfectant Laundry Sanitizer Liquid', b: 'Dettol', u: '1 L Bottle', p: 310, m: 360, img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500', t: ['laundry sanitizer', 'dettol'] },
      { n: 'Shalimar Garbage Bags Medium Size (Biodegradable)', b: 'Shalimar', u: '30 Bags Roll', p: 75, m: 95, img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500', t: ['garbage bags', 'dustbin bags'] },
      { n: 'Pril Lime Dishwash Liquid Grease Cutter', b: 'Pril', u: '750 ml', p: 145, m: 170, img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500', t: ['pril dishwash', 'grease cutter'] },
      { n: 'Wheel 2in1 Detergent Powder Green Clean', b: 'Wheel', u: '1 kg', p: 75, m: 85, img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500', t: ['wheel powder', 'washing'] },
      { n: 'Rin Detergent Bar with Brightness Booster', b: 'Rin', u: '250 g (Pack of 4)', p: 65, m: 72, img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500', t: ['rin bar', 'rin soap'] },
      { n: 'Vanish Oxi Action Stain Remover Liquid', b: 'Vanish', u: '400 ml Bottle', p: 125, m: 145, img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500', t: ['vanish', 'stain remover'] },
      { n: 'Aer Matic Automatic Room Spray Refill (Petal Crush)', b: 'Godrej aer', u: '225 ml Can', p: 250, m: 295, img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500', t: ['room spray', 'aer matic'] },
    ]
  },

  // 12. PERSONAL CARE & HYGIENE (30 items)
  {
    cat: 'personal_care', catName: 'Personal Care & Hygiene',
    items: [
      { n: 'Dettol Original Liquid Handwash Refill Pouch', b: 'Dettol', u: '675 ml Pouch', p: 99, m: 125, img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500', t: ['dettol handwash', 'soap refill', 'germ protection'] },
      { n: 'Dettol Original Anti-Bacterial Bathing Soap', b: 'Dettol', u: '125 g (Pack of 4)', p: 185, m: 220, img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500', t: ['dettol soap', 'bathing bar'] },
      { n: 'Lifebuoy Total 10 Germ Protection Soap', b: 'Lifebuoy', u: '125 g (Pack of 4)', p: 140, m: 165, img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500', t: ['lifebuoy soap', 'bath soap'] },
      { n: 'Dove Deeply Nourishing Cream Bathing Bar Soap', b: 'Dove', u: '100 g (Pack of 3)', p: 195, m: 240, img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500', t: ['dove soap', 'moisturizing'] },
      { n: 'Pears Pure & Gentle Glycerin Bath Soap', b: 'Pears', u: '125 g (Pack of 3)', p: 215, m: 260, img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500', t: ['pears soap', 'glycerin'] },
      { n: 'Colgate Strong Teeth Dental Cavity Protection Toothpaste', b: 'Colgate', u: '500 g Value Saver Pack', p: 235, m: 280, img: 'https://images.unsplash.com/photo-1559591937-e160538a7985?w=500', t: ['colgate toothpaste', 'brush', 'teeth'] },
      { n: 'Colgate MaxFresh Spicy Red Gel Toothpaste with Cooling Crystals', b: 'Colgate', u: '300 g (Pack of 2)', p: 185, m: 220, img: 'https://images.unsplash.com/photo-1559591937-e160538a7985?w=500', t: ['colgate maxfresh', 'fresh breath'] },
      { n: 'Sensodyne Repair & Protect Toothpaste for Sensitive Teeth', b: 'Sensodyne', u: '100 g Tube', p: 225, m: 260, img: 'https://images.unsplash.com/photo-1559591937-e160538a7985?w=500', t: ['sensodyne', 'sensitive teeth'] },
      { n: 'Dabur Red Ayurvedic Paste with Clove & Pudina', b: 'Dabur Red', u: '300 g Value Pack', p: 145, m: 170, img: 'https://images.unsplash.com/photo-1559591937-e160538a7985?w=500', t: ['dabur red', 'ayurvedic toothpaste'] },
      { n: 'Oral-B Cavity Defense Soft Toothbrush Pack', b: 'Oral-B', u: 'Pack of 4 Brushes', p: 85, m: 110, img: 'https://images.unsplash.com/photo-1559591937-e160538a7985?w=500', t: ['toothbrush', 'oral-b'] },
      { n: 'Head & Shoulders Anti-Dandruff Smooth & Silky Shampoo', b: 'Head & Shoulders', u: '650 ml Pump Bottle', p: 485, m: 580, img: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=500', t: ['shampoo', 'head and shoulders', 'anti dandruff'] },
      { n: 'Dove Daily Shine Hair Nourishment Shampoo', b: 'Dove', u: '650 ml Pump', p: 475, m: 560, img: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=500', t: ['dove shampoo', 'hair care'] },
      { n: 'Pantene Pro-V Hair Fall Control Silky Shampoo', b: 'Pantene', u: '650 ml Bottle', p: 460, m: 550, img: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=500', t: ['pantene', 'hair fall shampoo'] },
      { n: 'Parachute 100% Pure Coconut Hair Oil', b: 'Parachute', u: '500 ml Bottle', p: 185, m: 215, img: 'https://images.unsplash.com/photo-1608248597359-5975d9e50436?w=500', t: ['parachute oil', 'nariyal tel', 'coconut oil'] },
      { n: 'Bajaj Almond Drops Non-Sticky Hair Oil with Vitamin E', b: 'Bajaj', u: '300 ml Glass Bottle', p: 175, m: 210, img: 'https://images.unsplash.com/photo-1608248597359-5975d9e50436?w=500', t: ['bajaj almond oil', 'hair oil'] },
      { n: 'Dabur Amla Ayurvedic Hair Oil with Natural Goodness', b: 'Dabur', u: '450 ml Bottle', p: 160, m: 195, img: 'https://images.unsplash.com/photo-1608248597359-5975d9e50436?w=500', t: ['dabur amla', 'amla hair oil'] },
      { n: 'Nivea Soft Light Moisturising Cream Jar', b: 'Nivea', u: '200 ml Jar', p: 260, m: 310, img: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500', t: ['nivea soft', 'moisturizer', 'cold cream'] },
      { n: 'Vaseline Healthy Bright Daily Sunscreen & Body Lotion', b: 'Vaseline', u: '400 ml Pump', p: 315, m: 380, img: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500', t: ['vaseline lotion', 'body lotion'] },
      { n: 'Gillette Mach3 Razor for Men with 3 Blades', b: 'Gillette', u: '1 Razor + 1 Cartridge', p: 220, m: 260, img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500', t: ['gillette mach3', 'shaving razor'] },
      { n: 'Gillette Classic Lemon Lime Shaving Foam', b: 'Gillette', u: '196 g Can', p: 135, m: 160, img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500', t: ['shaving foam', 'gillette'] },
      { n: 'Nivea Men Fresh Active 48H Deodorant Spray', b: 'Nivea Men', u: '150 ml Can', p: 165, m: 225, img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500', t: ['nivea deo', 'men deodorant'] },
      { n: 'Fogg Marco Fragrance Body Spray for Men', b: 'Fogg', u: '150 ml Can', p: 180, m: 250, img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500', t: ['fogg spray', 'no gas perfume'] },
      { n: 'Engage W2 Perfume Spray for Women', b: 'Engage', u: '120 ml Can', p: 160, m: 220, img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500', t: ['engage perfume', 'women perfume'] },
      { n: 'Whisper Ultra Clean Wings Sanitary Pads (XL+)', b: 'Whisper', u: '30 Pads Pack', p: 285, m: 340, img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500', t: ['whisper ultra', 'sanitary pads', 'hygiene'] },
      { n: 'Stayfree Secure Cottony Soft Wings Sanitary Pads (XL)', b: 'Stayfree', u: '28 Pads Pack', p: 210, m: 250, img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500', t: ['stayfree pads'] },
      { n: 'Himalaya Purifying Neem Face Wash for Acne', b: 'Himalaya', u: '150 ml Tube', p: 145, m: 175, img: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500', t: ['neem facewash', 'himalaya'] },
      { n: 'Garnier Men Acno Fight Anti-Pimple Face Wash', b: 'Garnier Men', u: '100 g Tube', p: 165, m: 199, img: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500', t: ['garnier facewash', 'men facewash'] },
      { n: 'Pond’s Pure Bright Pollution Detox Face Wash', b: 'Pond’s', u: '100 g Tube', p: 140, m: 170, img: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500', t: ['ponds facewash'] },
      { n: 'Dettol Original Antiseptic First Aid Liquid', b: 'Dettol', u: '550 ml Bottle', p: 195, m: 225, img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500', t: ['dettol liquid', 'antiseptic'] },
      { n: 'Savlon Antiseptic Disinfectant Liquid Bottle', b: 'Savlon', u: '500 ml', p: 155, m: 180, img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500', t: ['savlon', 'antiseptic'] },
    ]
  },

  // 13. POOJA NEEDS & AGARBATTI (20 items)
  {
    cat: 'pooja_needs', catName: 'Pooja & Agarbatti',
    items: [
      { n: 'Mangaldeep Sandal Flora Agarbatti / Incense Sticks', b: 'Mangaldeep', u: 'Pack of 120 Sticks', p: 65, m: 80, img: 'https://images.unsplash.com/photo-1608248597359-5975d9e50436?w=500', t: ['agarbatti', 'mangaldeep', 'chandan', 'pooja'] },
      { n: 'Mangaldeep Mogra Scented Divine Agarbatti', b: 'Mangaldeep', u: '100 Sticks Box', p: 60, m: 75, img: 'https://images.unsplash.com/photo-1608248597359-5975d9e50436?w=500', t: ['mogra agarbatti', 'pooja'] },
      { n: 'Cycle Pure 3 in 1 Heritage Agarbatti Pack', b: 'Cycle Pure', u: 'Pack of 144 Sticks', p: 75, m: 90, img: 'https://images.unsplash.com/photo-1608248597359-5975d9e50436?w=500', t: ['cycle pure', '3 in 1 agarbatti'] },
      { n: 'Cycle Pure Lia Jasmine Scented Agarbatti', b: 'Cycle Pure', u: '100 Sticks Box', p: 65, m: 80, img: 'https://images.unsplash.com/photo-1608248597359-5975d9e50436?w=500', t: ['lia jasmine agarbatti'] },
      { n: 'Mangaldeep Pure Bhimseni Camphor Tablets (Kapur)', b: 'Mangaldeep', u: '100 g Jar', p: 95, m: 120, img: 'https://images.unsplash.com/photo-1608248597359-5975d9e50436?w=500', t: ['bhimseni kapoor', 'camphor', 'aarti'] },
      { n: 'CamPure 100% Pure Organic Camphor Cones (Rose Fragrance)', b: 'CamPure', u: '60 g Cone', p: 135, m: 160, img: 'https://images.unsplash.com/photo-1608248597359-5975d9e50436?w=500', t: ['campure', 'camphor cone', 'room fragrance'] },
      { n: 'Pure Round Cotton Wicks for Diya Aarti (Gol Batti)', b: 'Pooja Shree', u: 'Pack of 200 Wicks', p: 35, m: 45, img: 'https://images.unsplash.com/photo-1608248597359-5975d9e50436?w=500', t: ['cotton wicks', 'batti', 'diya'] },
      { n: 'Long Cotton Wicks for Deepam (Lambi Batti)', b: 'Pooja Shree', u: 'Pack of 200 Wicks', p: 35, m: 45, img: 'https://images.unsplash.com/photo-1608248597359-5975d9e50436?w=500', t: ['lambi batti', 'deepam'] },
      { n: 'Pure Cow Desi Ghee Diya (Ready-Made Ghee Wicks)', b: 'Pooja Shree', u: 'Box of 30 Diyas', p: 110, m: 140, img: 'https://images.unsplash.com/photo-1608248597359-5975d9e50436?w=500', t: ['ready ghee diya', 'cow ghee bati'] },
      { n: 'Patanjali Pure Mustard Oil for Deepam / Pooja', b: 'Patanjali', u: '500 ml', p: 85, m: 95, img: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500', t: ['pooja tel', 'deepam oil'] },
      { n: 'Om Pooja Pure Sesame Gingelly Til Oil for Aarti', b: 'Om Pooja', u: '500 ml Bottle', p: 130, m: 155, img: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500', t: ['til oil', 'sesame oil for diya'] },
      { n: 'Pooja Special Brass Akhand Diya with Glass Cover', b: 'Pooja Shree', u: '1 pc (Small)', p: 180, m: 250, img: 'https://images.unsplash.com/photo-1608248597359-5975d9e50436?w=500', t: ['akhand diya', 'brass diya'] },
      { n: 'Hawan Samagri 100% Herbal Mix with Ayurvedic Herbs', b: 'Patanjali', u: '500 g Bag', p: 85, m: 105, img: 'https://images.unsplash.com/photo-1608248597359-5975d9e50436?w=500', t: ['hawan samagri', 'pooja'] },
      { n: 'Pure Chandan Tika Paste / Sandalwood Teeka', b: 'Cycle Pure', u: '50 g Tub', p: 45, m: 55, img: 'https://images.unsplash.com/photo-1608248597359-5975d9e50436?w=500', t: ['chandan tika', 'sandalwood'] },
      { n: 'Pure Roli & Kumkum Powder for Mandir Pooja', b: 'Pooja Shree', u: '100 g Box', p: 30, m: 40, img: 'https://images.unsplash.com/photo-1608248597359-5975d9e50436?w=500', t: ['roli', 'kumkum', 'sindoor'] },
      { n: 'Pooja Kalawa / Red Moli Sacred Wrist Thread', b: 'Pooja Shree', u: '2 Rolls Pack', p: 25, m: 35, img: 'https://images.unsplash.com/photo-1608248597359-5975d9e50436?w=500', t: ['moli', 'kalawa', 'raksha sutra'] },
      { n: 'Ship Safety Matchbox Family Pack', b: 'Ship', u: 'Pack of 10 Matchboxes', p: 20, m: 20, img: 'https://images.unsplash.com/photo-1608248597359-5975d9e50436?w=500', t: ['matchbox', 'maachis'] },
      { n: 'Mangaldeep Dhoop Sticks (Gulab Fragrance)', b: 'Mangaldeep', u: 'Pack of 20 Sticks', p: 35, m: 40, img: 'https://images.unsplash.com/photo-1608248597359-5975d9e50436?w=500', t: ['dhoop sticks', 'gulab dhoop'] },
      { n: 'Cycle Pure Sambrani Dhoop Cups with Charcoal', b: 'Cycle Pure', u: '12 Cups Box', p: 85, m: 110, img: 'https://images.unsplash.com/photo-1608248597359-5975d9e50436?w=500', t: ['sambrani cups', 'dhoop'] },
      { n: 'Pure Gangajal Holy Water Bottle from Haridwar', b: 'Pooja Shree', u: '500 ml Bottle', p: 40, m: 50, img: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500', t: ['gangajal', 'holy water'] },
    ]
  },

  // 14. BABY CARE & WELLNESS (20 items)
  {
    cat: 'baby_wellness', catName: 'Baby Care & Wellness',
    items: [
      { n: 'Pampers All Round Protection Baby Diaper Pants (M)', b: 'Pampers', u: '34 Diaper Pants (7-12 kg)', p: 449, m: 599, img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500', t: ['pampers', 'diapers', 'baby care'] },
      { n: 'Pampers All Round Protection Diapers (L)', b: 'Pampers', u: '30 Diaper Pants (9-14 kg)', p: 449, m: 599, img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500', t: ['pampers large', 'diapers'] },
      { n: 'Huggies Complete Comfort Wonder Pants Diaper (M)', b: 'Huggies', u: '32 Pants', p: 420, m: 550, img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500', t: ['huggies', 'baby diapers'] },
      { n: 'Johnson’s Baby No More Tears Gentle Shampoo', b: 'Johnson’s', u: '200 ml Bottle', p: 185, m: 220, img: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=500', t: ['baby shampoo', 'johnsons baby'] },
      { n: 'Johnson’s Baby Soft Moisturizing Soap Bar', b: 'Johnson’s', u: '100 g (Pack of 3)', p: 165, m: 195, img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500', t: ['baby soap', 'johnsons'] },
      { n: 'Johnson’s Baby Pure Vitamin E Nourishing Hair & Body Oil', b: 'Johnson’s', u: '200 ml', p: 195, m: 235, img: 'https://images.unsplash.com/photo-1608248597359-5975d9e50436?w=500', t: ['baby oil', 'johnsons'] },
      { n: 'Johnson’s Baby Pure Cornstarch Soft Powder', b: 'Johnson’s', u: '200 g Container', p: 145, m: 175, img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500', t: ['baby powder', 'johnsons'] },
      { n: 'Himalaya Gentle Baby Wet Wipes with Aloe Vera', b: 'Himalaya', u: '72 Wipes Pack with Lid', p: 135, m: 175, img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500', t: ['baby wipes', 'wet wipes', 'himalaya'] },
      { n: 'Pampers Fresh Clean Baby Wipes with Pure Water', b: 'Pampers', u: '72 Wipes Pack', p: 145, m: 190, img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500', t: ['pampers wipes'] },
      { n: 'Nestle Cerelac Wheat Apple Baby Cereal (6 Months+)', b: 'Nestle Cerelac', u: '300 g Refill', p: 265, m: 295, img: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500', t: ['cerelac', 'baby food', 'nestle'] },
      { n: 'Nestle Cerelac Rice Cereal (6 Months+)', b: 'Nestle Cerelac', u: '300 g', p: 245, m: 275, img: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500', t: ['cerelac rice', 'baby cereal'] },
      { n: 'Dabur Chyawanprash with 2X Immunity Boost', b: 'Dabur', u: '1 kg Jar', p: 385, m: 450, img: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500', t: ['chyawanprash', 'immunity', 'dabur'] },
      { n: 'Dabur 100% Pure Raw Honey Squeezy', b: 'Dabur', u: '500 g Squeezy', p: 210, m: 250, img: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500', t: ['honey', 'dabur honey', 'shahad'] },
      { n: 'Patanjali Pure Natural Honey Bottle', b: 'Patanjali', u: '500 g', p: 175, m: 210, img: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500', t: ['patanjali honey', 'shahad'] },
      { n: 'Vicks VapoRub Ayurvedic Cold Relief Balm', b: 'Vicks', u: '50 ml Jar', p: 145, m: 165, img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500', t: ['vicks vaporub', 'cold relief', 'balm'] },
      { n: 'Vicks Inhaler for Fast Blocked Nose Relief', b: 'Vicks', u: '0.5 ml Keychain Inhaler', p: 65, m: 72, img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500', t: ['vicks inhaler', 'nose relief'] },
      { n: 'Moov Fast Pain Relief Ayurvedic Ointment', b: 'Moov', u: '50 g Tube', p: 165, m: 195, img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500', t: ['moov pain relief', 'back pain'] },
      { n: 'Volini Joint & Muscle Pain Relief Gel', b: 'Volini', u: '50 g Tube', p: 175, m: 205, img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500', t: ['volini gel', 'muscle pain'] },
      { n: 'ENO Lemon Fast Relief Effervescent Fruit Salt', b: 'ENO', u: '100 g Bottle', p: 145, m: 165, img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500', t: ['eno lemon', 'acidity', '6 seconds relief'] },
      { n: 'Pudinhara Pearls Fast Gas & Digestion Relief', b: 'Dabur', u: 'Strip of 10 Pearls', p: 35, m: 40, img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500', t: ['pudinhara', 'digestion'] },
    ]
  },

  // 15. DRY FRUITS & NUTS (25 items)
  {
    cat: 'dry_fruits_nuts', catName: 'Dry Fruits & Seeds',
    items: [
      { n: 'Tata Sampann 100% Pure California Almonds (Badam)', b: 'Tata Sampann', u: '500 g Pouch', p: 460, m: 550, img: 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=500', t: ['badam', 'almonds', 'tata sampann', 'brain power'] },
      { n: 'Tata Sampann Whole White Cashew Nuts (Kaju W240)', b: 'Tata Sampann', u: '500 g Pouch', p: 490, m: 590, img: 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=500', t: ['kaju', 'cashew', 'rich dry fruit'] },
      { n: 'Tata Sampann Green Long Seedless Raisins (Kishmish)', b: 'Tata Sampann', u: '500 g Pouch', p: 195, m: 245, img: 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=500', t: ['kishmish', 'raisins', 'sweet'] },
      { n: 'Tata Sampann Premium Kashmiri Walnut Kernels (Akhrot Giri)', b: 'Tata Sampann', u: '250 g Vacuum Box', p: 380, m: 460, img: 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=500', t: ['akhrot', 'walnut kernels', 'omega 3'] },
      { n: 'Tata Sampann Roasted Salted Pistachios (Pista)', b: 'Tata Sampann', u: '200 g Pouch', p: 260, m: 320, img: 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=500', t: ['pista', 'pistachios', 'salted pista'] },
      { n: 'Happilo Premium Arabian Super Soft Dates (Khajoor)', b: 'Happilo', u: '500 g Pack', p: 220, m: 280, img: 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=500', t: ['dates', 'khajoor', 'happilo'] },
      { n: 'Happilo Premium 100% Natural Dried Figs (Anjeer)', b: 'Happilo', u: '200 g Box', p: 260, m: 325, img: 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=500', t: ['anjeer', 'figs', 'iron'] },
      { n: 'Happilo 7-in-1 Super Seeds Mix (Chia, Flax, Pumpkin)', b: 'Happilo', u: '200 g Jar', p: 195, m: 250, img: 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=500', t: ['super seeds', 'chia seeds', 'pumpkin seeds'] },
      { n: 'Happilo Raw Organic Chia Seeds for Weight Loss', b: 'Happilo', u: '200 g Pouch', p: 140, m: 180, img: 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=500', t: ['chia seeds', 'weight loss'] },
      { n: 'Happilo Raw Pumpkin Seeds (Kaddu ke Beej)', b: 'Happilo', u: '200 g', p: 175, m: 220, img: 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=500', t: ['pumpkin seeds', 'zinc'] },
      { n: 'Happilo Roasted Salted Makhana (Fox Nuts)', b: 'Happilo', u: '100 g Jar', p: 145, m: 180, img: 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=500', t: ['makhana jar', 'healthy snack'] },
      { n: 'True Elements Roasted Sunflower Seeds', b: 'True Elements', u: '150 g', p: 130, m: 165, img: 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=500', t: ['sunflower seeds', 'vitamin e'] },
      { n: 'True Elements Flax Seeds Raw', b: 'True Elements', u: '250 g', p: 95, m: 125, img: 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=500', t: ['flax seeds', 'alsi ke beej'] },
      { n: 'Happilo Premium Dried Cranberries Whole', b: 'Happilo', u: '200 g Box', p: 190, m: 245, img: 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=500', t: ['cranberries', 'dried berries'] },
      { n: 'Happilo Premium Dried Blueberries Whole', b: 'Happilo', u: '150 g Box', p: 260, m: 330, img: 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=500', t: ['blueberries', 'antioxidants'] },
      { n: 'Tata Sampann Premium Raw Makhana (Foxnuts Grade A)', b: 'Tata Sampann', u: '200 g Bag', p: 210, m: 260, img: 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=500', t: ['makhana', 'foxnuts', 'vrat'] },
      { n: 'Happilo Party Mix Roasted Salted Dry Fruits', b: 'Happilo', u: '200 g Jar', p: 275, m: 350, img: 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=500', t: ['party mix', 'dry fruits'] },
      { n: 'Tata Sampann Premium Charmagaz / Melon Seeds', b: 'Tata Sampann', u: '100 g', p: 75, m: 95, img: 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=500', t: ['charmagaz', 'melon seeds', 'mithai'] },
      { n: 'Organic Tattva Organic White Sesame Seeds (Til)', b: 'Organic Tattva', u: '200 g', p: 85, m: 105, img: 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=500', t: ['sesame seeds', 'til'] },
      { n: 'Organic Tattva Organic Black Sesame Seeds (Kala Til)', b: 'Organic Tattva', u: '200 g', p: 90, m: 110, img: 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=500', t: ['black til', 'pooja'] },
      { n: 'Happilo 100% Natural Dried Prunes (Aloo Bukhara Dry)', b: 'Happilo', u: '200 g', p: 215, m: 275, img: 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=500', t: ['prunes', 'digestion'] },
      { n: 'Tata Sampann Kashmiri Mamra Badam Super Grade', b: 'Tata Sampann', u: '250 g', p: 680, m: 850, img: 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=500', t: ['mamra badam', 'pure badam'] },
      { n: 'Happilo Roasted Sweet Honey Glazed Almonds', b: 'Happilo', u: '150 g Jar', p: 240, m: 300, img: 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=500', t: ['honey almonds'] },
      { n: 'True Elements Dark Chocolate Rolled Oats Crunch', b: 'True Elements', u: '400 g', p: 245, m: 310, img: 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=500', t: ['chocolate granola', 'healthy oats'] },
      { n: 'Tata Sampann Dried Black Raisins (Kala Kishmish)', b: 'Tata Sampann', u: '250 g', p: 145, m: 180, img: 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=500', t: ['black raisins', 'kala kishmish'] },
    ]
  },
];

// Helper to expand into 500+ distinct variations (different sizes, combo packs, brand variants, value packs)
function generate500PlusProducts() {
  const products = [];
  let counter = 1;

  RAW_CATALOG.forEach(catGroup => {
    catGroup.items.forEach(baseItem => {
      // 1. Primary standard product
      const discountPct = Math.round(((baseItem.m - baseItem.p) / baseItem.m) * 100);
      products.push({
        id: `prod_${String(counter++).padStart(4, '0')}`,
        name: baseItem.n,
        brand: baseItem.b,
        category: catGroup.cat,
        categoryName: catGroup.catName,
        subCategory: baseItem.t[0] || 'General',
        price: baseItem.p,
        mrp: baseItem.m,
        discount: discountPct > 0 ? discountPct : 5,
        unit: baseItem.u,
        image: baseItem.img,
        isVeg: true,
        inStock: true,
        stockQuantity: Math.floor(50 + Math.random() * 200),
        eta: '8-10 MINS',
        rating: +(4.5 + Math.random() * 0.4).toFixed(1),
        reviewsCount: Math.floor(40 + Math.random() * 450),
        description: `100% Pure Veg and Authentic ${baseItem.n}. Handpicked fresh and delivered in 10 minutes by ZapBite.`,
        tags: [...baseItem.t, '100% veg', 'quick delivery', 'blinkit style'],
        isBestSeller: counter % 5 === 0,
        isLightningDeal: counter % 8 === 0,
      });

      // 2. Generate systematic realistic Twin/Super Saver Value Packs or Alternate sizes to reach 500+ total items
      if (counter % 2 === 0) {
        const doublePrice = Math.round(baseItem.p * 1.88); // Discounted combo
        const doubleMrp = baseItem.m * 2;
        const comboDiscount = Math.round(((doubleMrp - doublePrice) / doubleMrp) * 100);

        products.push({
          id: `prod_${String(counter++).padStart(4, '0')}`,
          name: `${baseItem.n} (Super Saver Pack of 2)`,
          brand: baseItem.b,
          category: catGroup.cat,
          categoryName: catGroup.catName,
          subCategory: baseItem.t[0] || 'General',
          price: doublePrice,
          mrp: doubleMrp,
          discount: comboDiscount,
          unit: `2 × (${baseItem.u})`,
          image: baseItem.img,
          isVeg: true,
          inStock: true,
          stockQuantity: Math.floor(30 + Math.random() * 100),
          eta: '8-10 MINS',
          rating: +(4.6 + Math.random() * 0.3).toFixed(1),
          reviewsCount: Math.floor(30 + Math.random() * 200),
          description: `Super Saver Twin Pack of ${baseItem.n}. Extra savings guaranteed for your monthly grocery stock.`,
          tags: [...baseItem.t, 'saver pack', 'combo', '100% veg'],
          isBestSeller: true,
          isLightningDeal: false,
        });
      }
    });
  });

  return products;
}

async function seedDatabase() {
  try {
    console.log('🍃 Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas successfully!');

    // 1. Clear old data
    console.log('🧹 Clearing existing collections...');
    await Promise.all([
      Category.deleteMany({}),
      Product.deleteMany({}),
      Coupon.deleteMany({}),
      Banner.deleteMany({}),
      User.deleteMany({}),
    ]);

    // 2. Seed Categories
    console.log(`📁 Seeding ${CATEGORIES_DATA.length} Pure Veg Categories...`);
    await Category.insertMany(CATEGORIES_DATA);

    // 3. Seed Coupons
    console.log(`🎟 Seeding ${COUPONS_DATA.length} Promo Coupons...`);
    await Coupon.insertMany(COUPONS_DATA);

    // 4. Seed Banners
    console.log(`🖼 Seeding ${BANNERS_DATA.length} Promotional Banners...`);
    await Banner.insertMany(BANNERS_DATA);

    // 5. Seed 500+ Pure Veg Products
    const allProducts = generate500PlusProducts();
    console.log(`🛒 Generating and Seeding ${allProducts.length} 100% Pure Veg Products...`);
    await Product.insertMany(allProducts);

    // 6. Seed Default User (Rohit Choudhary)
    console.log('👤 Seeding default user (9876543210)...');
    await User.create({
      phone: '9876543210',
      name: 'Rohit Choudhary',
      email: 'rohit.choudhary@zapbite.in',
      walletBalance: 250,
      isVerified: true,
      role: 'customer',
      addresses: [
        {
          tag: 'Home',
          line1: 'Flat 402, Royal Palms Heights',
          line2: 'Sector 62',
          city: 'Noida',
          pincode: '201301',
          isDefault: true,
        },
        {
          tag: 'Work',
          line1: 'Tower B, 7th Floor, Cyber Hub',
          line2: 'DLF Phase 2',
          city: 'Gurugram',
          pincode: '122002',
          isDefault: false,
        },
      ],
    });

    console.log('====================================================');
    console.log('🎉 DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log(`   - Categories: ${CATEGORIES_DATA.length}`);
    console.log(`   - 100% Pure Veg Products: ${allProducts.length}`);
    console.log(`   - Coupons: ${COUPONS_DATA.length}`);
    console.log(`   - Banners: ${BANNERS_DATA.length}`);
    console.log(`   - Default User: 9876543210 (Rohit Choudhary)`);
    console.log('====================================================');

    process.exit(0);
  } catch (error) {
    console.error('❌ Database Seeding Failed:', error);
    process.exit(1);
  }
}

seedDatabase();

