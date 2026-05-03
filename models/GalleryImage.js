const mongoose = require('mongoose');

const galleryImageSchema = new mongoose.Schema(
  {
    image: {
      type: String,
      default: '',
    },
    alt: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('GalleryImage', galleryImageSchema);
