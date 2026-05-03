const express = require('express');
const router = express.Router();
const galleryController = require('../controllers/galleryController');
const authenticateToken = require('../middleware/auth');

router.get('/', galleryController.getAllGalleryImages);

router.post('/', authenticateToken, galleryController.createGalleryImage);
router.delete('/:id', authenticateToken, galleryController.deleteGalleryImage);

module.exports = router;
