#!/usr/bin/env node

/**
 * Admin User Creation Script
 * Run this script to create the initial admin user
 * 
 * Usage: node scripts/createAdmin.js
 */

require('dotenv').config({ path: '.env' });
const mongoose = require('mongoose');
const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');

const createAdmin = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ username: 'admin' });
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists');
      console.log('Username: admin');
      console.log('Email: admin@raasmedia.com');
      process.exit(0);
    }

    // Create new admin
    const admin = await Admin.create({
      username: 'admin',
      password: 'admin123',
      email: 'admin@raasmedia.com',
      role: 'admin',
    });

    console.log('✅ Admin user created successfully!');
    console.log('📋 Login Credentials:');
    console.log('─────────────────────');
    console.log('Username: admin');
    console.log('Password: admin123');
    console.log('Email: admin@raasmedia.com');
    console.log('─────────────────────');
    console.log('⚠️  Change password after first login!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
    process.exit(1);
  }
};

createAdmin();
