const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authenticateToken = require('../middleware/auth');

// Admin login
router.post('/login', adminController.login);

// Get admin profile (protected)
router.get('/profile', authenticateToken, adminController.getProfile);

module.exports = router;
