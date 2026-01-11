const express = require('express');
const router = express.Router();
const { register, login, updateProfile, getProfile } = require('../controllers/authController');

// @route   POST api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', register);

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', login);

// @route   PUT api/auth/profile
// @desc    Update user profile
// @access  Private (should be)
router.put('/profile', updateProfile);

// @route   GET api/auth/profile/:id
// @desc    Get user profile
// @access  Private (should be)
router.get('/profile/:id', getProfile);

module.exports = router;
