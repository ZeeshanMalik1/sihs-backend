// scripts/debugAdmin.js
const mongoose = require('mongoose');
const Admin = require('../Models/Admin.js');
const crypto = require('crypto');

const debugAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sihs');
    console.log('✅ Connected to MongoDB');

    // Check if admin exists
    const admin = await Admin.findOne({ email: 'admin@sihs.edu' });
    
    if (admin) {
      console.log('📋 Admin found:', {
        name: admin.name,
        email: admin.email,
        password: admin.password, // This shows the hashed password
        role: admin.role
      });

      // Test password comparison
      const testPassword = 'admin123';
      const isMatch = await admin.comparePassword(testPassword);
      console.log(`🔐 Password test: "${testPassword}" -> ${isMatch ? '✅ MATCH' : '❌ NO MATCH'}`);

      // Show what the hash should be
      const expectedHash = crypto.createHash('sha256').update('admin123').digest('hex');
      console.log('🔍 Expected hash:', expectedHash);
      console.log('💾 Stored hash: ', admin.password);

    } else {
      console.log('❌ No admin found with email: admin@sihs.edu');
      
      // Create admin if doesn't exist
      const hashedPassword = crypto
        .createHash('sha256')
        .update('admin123')
        .digest('hex');

      const newAdmin = await Admin.create({
        name: 'Super Admin',
        email: 'admin@sihs.edu',
        password: 'admin123', // This will be hashed by the pre-save hook
        role: 'super_admin',
        permissions: ['manage_departments', 'manage_faculty', 'manage_news', 'manage_downloads', 'manage_notifications', 'manage_research', 'manage_settings', 'manage_admins'],
        isActive: true
      });

      console.log('✅ Admin created successfully!');
      console.log('📧 Email: admin@sihs.edu');
      console.log('🔑 Password: admin123');
      console.log('🔐 Hashed password:', newAdmin.password);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

debugAdmin();