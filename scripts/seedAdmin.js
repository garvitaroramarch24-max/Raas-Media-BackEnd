require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Admin = require('../models/Admin');

const DEFAULT_USER = process.env.ADMIN_SEED_USERNAME || 'admin';
const DEFAULT_PASS = process.env.ADMIN_SEED_PASSWORD || 'admin123';
const DEFAULT_EMAIL = process.env.ADMIN_SEED_EMAIL || 'admin@raasmedia.local';

async function run() {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!uri) {
    console.error('Set MONGO_URI (or MONGODB_URI) in backend/.env');
    process.exit(1);
  }
  await mongoose.connect(uri);
  const existing = await Admin.findOne({ username: DEFAULT_USER });
  if (existing) {
    console.log(`Admin "${DEFAULT_USER}" already exists.`);
    await mongoose.disconnect();
    return;
  }
  await Admin.create({
    username: DEFAULT_USER,
    password: DEFAULT_PASS,
    email: DEFAULT_EMAIL,
  });
  console.log(`Created admin user "${DEFAULT_USER}" (password: ${DEFAULT_PASS}).`);
  console.log('Change the password after first login.');
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
