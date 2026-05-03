const express = require('express');
const router = express.Router();
const galleryController = require('../controllers/galleryController');
const authenticateToken = require('../middleware/auth');
const memoryImageUpload = require('../middleware/memoryImageUpload');

router.get('/', galleryController.getAllGalleryImages);

router.post(
  '/',
  authenticateToken,
  memoryImageUpload.single('image'),
  galleryController.createGalleryImage
);
router.delete('/:id', authenticateToken, galleryController.deleteGalleryImage);

module.exports = router;
