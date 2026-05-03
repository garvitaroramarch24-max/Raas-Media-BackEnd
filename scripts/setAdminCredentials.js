/**
 * Set or update admin login credentials (MongoDB).
 *
 * In backend/.env set:
 *   MONGO_URI=...           (required)
 *   ADMIN_SEED_USERNAME=... (optional, default: admin)
 *   ADMIN_SEED_PASSWORD=... (required — plain text; stored hashed)
 *   ADMIN_SEED_EMAIL=...    (optional, only used when creating the first admin)
 *
 * Run from backend folder:
 *   npm run admin:set-credentials
 *
 * Behavior:
 * - If an admin with ADMIN_SEED_USERNAME exists → updates password only.
 * - If no admins exist → creates one with username / password / email.
 * - If admins exist but none match that username → exits with instructions.
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Admin = require('../models/Admin');

const username = process.env.ADMIN_SEED_USERNAME || 'admin';
const password = process.env.ADMIN_SEED_PASSWORD;
const email = process.env.ADMIN_SEED_EMAIL || 'admin@raasmedia.local';

async function run() {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!uri) {
    console.error('Set MONGO_URI (or MONGODB_URI) in backend/.env');
    process.exit(1);
  }
  if (!password || String(password).trim() === '') {
    console.error('Set ADMIN_SEED_PASSWORD in backend/.env (your new password).');
    process.exit(1);
  }

  await mongoose.connect(uri);

  const existing = await Admin.findOne({ username });
  if (existing) {
    existing.password = password;
    await existing.save();
    console.log(`Updated password for admin "${username}".`);
    await mongoose.disconnect();
    return;
  }

  const count = await Admin.countDocuments();
  if (count > 0) {
    console.error(
      `No admin with username "${username}". There ${count === 1 ? 'is' : 'are'} ${count} other admin account(s) in the database.`
    );
    console.error(
      `Either set ADMIN_SEED_USERNAME to that account's username and run again, or delete admin users in MongoDB (collection "admins") and run this script once to create "${username}".`
    );
    await mongoose.disconnect();
    process.exit(1);
  }

  await Admin.create({ username, password, email });
  console.log(`Created admin "${username}" with the password from ADMIN_SEED_PASSWORD.`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
