const GalleryImage = require('../models/GalleryImage');
const cloudinary = require('../utils/cloudinary');

exports.getAllGalleryImages = async (req, res) => {
  try {
    const images = await GalleryImage.find().sort({ createdAt: -1 });
    res.json(images);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.createGalleryImage = async (req, res) => {
  try {
    const { alt } = req.body;
    const raw = req.body.image;

    if (typeof raw !== 'string' || !raw.trim()) {
      return res.status(400).json({ message: 'Image is required' });
    }

    const image = raw.trim();
    let imageUrl = image;

    if (image.startsWith('data:')) {
      const uploadRes = await cloudinary.uploader.upload(image, {
        folder: 'raas-media-gallery',
        resource_type: 'image',
      });
      imageUrl = uploadRes.secure_url;
    }

    const doc = new GalleryImage({
      image: imageUrl,
      alt: alt || '',
    });

    await doc.save();
    res.status(201).json(doc);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteGalleryImage = async (req, res) => {
  try {
    const removed = await GalleryImage.findByIdAndDelete(req.params.id);

    if (!removed) {
      return res.status(404).json({ message: 'Image not found' });
    }

    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
