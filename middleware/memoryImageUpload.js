const multer = require('multer');

const storage = multer.memoryStorage();

function fileFilter(req, file, cb) {
  if (!file.mimetype || !file.mimetype.startsWith('image/')) {
    return cb(new Error('Only image uploads are allowed'));
  }
  cb(null, true);
}

module.exports = multer({
  storage,
  limits: { fileSize: 12 * 1024 * 1024 },
  fileFilter,
});
