const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Check if user already exists
router.post('/check-user', async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone || !/^\d{10}$/.test(phone)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid 10-digit mobile number' });
    }

    const user = await User.findOne({ phone });
    if (user) {
      return res.json({
        success: true,
        exists: true,
        message: `Welcome back, ${user.name}!`,
        user: {
          id: user._id,
          phone: user.phone,
          name: user.name,
          email: user.email,
        }
      });
    }

    return res.json({
      success: true,
      exists: false,
      message: 'New user detected. Please complete sign up.',
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error checking user', error: err.message });
  }
});

// Signup (Register new user with welcome bonus)
router.post('/signup', async (req, res) => {
  try {
    const { phone, name, email, referralCode, city, addressLine } = req.body;

    if (!phone || !/^\d{10}$/.test(phone)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid 10-digit mobile number' });
    }
    if (!name || name.trim().length < 2) {
      return res.status(400).json({ success: false, message: 'Please enter your full name' });
    }

    let existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        alreadyExists: true,
        message: 'Account with this mobile number already exists. Please login.',
      });
    }

    const newUser = await User.create({
      phone,
      name: name.trim(),
      email: email ? email.trim().toLowerCase() : '',
      walletBalance: 250, // ₹250 Welcome Bonus
      isVerified: true,
      addresses: [
        {
          tag: 'Home',
          line1: addressLine || 'Flat 101, Green Park Residency',
          line2: 'Near Central Market',
          city: city || 'New Delhi',
          pincode: '110001',
          isDefault: true,
        }
      ],
    });

    res.status(201).json({
      success: true,
      demoOtp: '123456',
      message: `🎉 Account created! Welcome ₹250 added to wallet. OTP sent to +91 ${phone}`,
      user: {
        id: newUser._id,
        phone: newUser.phone,
        name: newUser.name,
        email: newUser.email,
        walletBalance: newUser.walletBalance,
        addresses: newUser.addresses,
      }
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ success: false, message: 'Error creating account', error: err.message });
  }
});

// Request OTP / Login for existing user
router.post('/login', async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone || !/^\d{10}$/.test(phone)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid 10-digit mobile number' });
    }

    let user = await User.findOne({ phone });
    const isNew = !user;
    if (!user) {
      user = await User.create({
        phone,
        name: 'Zaptite Customer',
        walletBalance: 250,
        addresses: [
          {
            tag: 'Home',
            line1: 'Flat 101, Green Heights',
            line2: 'Main Road',
            city: 'New Delhi',
            pincode: '110001',
            isDefault: true,
          }
        ]
      });
    }

    res.json({
      success: true,
      isNewUser: isNew,
      message: `OTP sent successfully to +91 ${phone}`,
      user: {
        id: user._id,
        phone: user.phone,
        name: user.name,
        addresses: user.addresses,
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error during login', error: err.message });
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) {
      return res.status(400).json({ success: false, message: 'Phone and OTP are required' });
    }

    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid 6-digit OTP code.' });
    }

    let user = await User.findOne({ phone });
    if (!user) {
      user = await User.create({ phone, name: 'Zaptite Customer', walletBalance: 250 });
    }

    user.lastLoginAt = new Date();
    await user.save();

    res.json({
      success: true,
      message: 'Login successful!',
      token: 'jwt_demo_token_' + user._id,
      user: {
        id: user._id,
        phone: user.phone,
        name: user.name,
        email: user.email,
        walletBalance: user.walletBalance,
        addresses: user.addresses,
      }
    });
  } catch (err) {
    console.error('OTP verification error:', err);
    res.status(500).json({ success: false, message: 'Verification failed', error: err.message });
  }
});

// Get User Profile
router.get('/profile', async (req, res) => {
  try {
    const phone = req.query.phone || '9876543210';
    let user = await User.findOne({ phone });
    if (!user) {
      user = await User.findOne({});
    }
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        phone: user.phone,
        name: user.name,
        email: user.email,
        walletBalance: user.walletBalance,
        addresses: user.addresses,
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching profile', error: err.message });
  }
});

// Update Profile
router.put('/profile', async (req, res) => {
  try {
    const { phone, name, email } = req.body;
    let user = await User.findOne({ phone: phone || '9876543210' });
    if (!user) {
      user = await User.findOne({});
    }
    if (name) user.name = name;
    if (email) user.email = email;
    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        phone: user.phone,
        name: user.name,
        email: user.email,
        walletBalance: user.walletBalance,
        addresses: user.addresses,
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error updating profile', error: err.message });
  }
});

// Add Address
router.post('/address', async (req, res) => {
  try {
    const { phone, address } = req.body;
    let user = await User.findOne({ phone: phone || '9876543210' });
    if (!user) user = await User.findOne({});
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.addresses.push(address);
    await user.save();

    res.json({
      success: true,
      message: 'Address added successfully',
      addresses: user.addresses,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error adding address', error: err.message });
  }
});

// Delete Address
router.delete('/address/:addressId', async (req, res) => {
  try {
    const { phone } = req.query;
    const { addressId } = req.params;
    let user = await User.findOne({ phone: phone || '9876543210' });
    if (!user) user = await User.findOne({});
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.addresses = user.addresses.filter(a => a._id.toString() !== addressId);
    await user.save();

    res.json({
      success: true,
      message: 'Address removed',
      addresses: user.addresses,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error deleting address', error: err.message });
  }
});

// Logout
router.post('/logout', (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

module.exports = router;
