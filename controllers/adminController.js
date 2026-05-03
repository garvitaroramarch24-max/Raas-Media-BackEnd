require('dotenv').config();
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const ENV_ADMIN_ID = 'env-admin';

function useEnvCredentials() {
  const user = (process.env.ADMIN_USERNAME || '').trim();
  const pass = process.env.ADMIN_PASSWORD;
  return user.length > 0 && typeof pass === 'string' && pass.length > 0;
}

// Admin Login — if ADMIN_USERNAME + ADMIN_PASSWORD are set in .env, login uses those only (no Mongo admin needed).
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (useEnvCredentials()) {
      const envUser = (process.env.ADMIN_USERNAME || '').trim();
      const envPass = process.env.ADMIN_PASSWORD;

      if (username !== envUser || password !== envPass) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { id: ENV_ADMIN_ID, username: envUser, authSource: 'env' },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.json({
        token,
        admin: {
          id: ENV_ADMIN_ID,
          username: envUser,
          email: process.env.ADMIN_EMAIL || '',
        },
      });
    }

    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = await admin.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: admin._id, username: admin.username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token, admin: { id: admin._id, username: admin.username, email: admin.email } });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    if (req.admin.authSource === 'env' || req.admin.id === ENV_ADMIN_ID) {
      return res.json({
        _id: ENV_ADMIN_ID,
        username: req.admin.username,
        email: process.env.ADMIN_EMAIL || '',
        role: 'admin',
      });
    }

    const admin = await Admin.findById(req.admin.id).select('-password');
    res.json(admin);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
