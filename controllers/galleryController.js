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
    const alt = typeof req.body.alt === 'string' ? req.body.alt : '';
    let imageUrl = '';

    if (req.file?.buffer?.length) {
      const dataUri = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
      const uploadRes = await cloudinary.uploader.upload(dataUri, {
        folder: 'raas-media-gallery',
        resource_type: 'image',
      });
      imageUrl = uploadRes.secure_url;
    } else {
      const raw = typeof req.body.image === 'string' ? req.body.image.trim() : '';
      if (raw.startsWith('data:')) {
        const uploadRes = await cloudinary.uploader.upload(raw, {
          folder: 'raas-media-gallery',
          resource_type: 'image',
        });
        imageUrl = uploadRes.secure_url;
      } else if (/^https?:\/\//i.test(raw)) {
        imageUrl = raw;
      }
    }

    const doc = new GalleryImage({
      image: imageUrl,
      alt: alt.trim() || '',
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
