// scripts/createAdmin.js
const mongoose = require('mongoose');
const Admin = require('../Models/Admin.js');
const crypto = require('crypto');

const createInitialAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sihs_db');
    
    const existingAdmin = await Admin.findOne({ email: 'admin@sihs.edu' });
    
    if (!existingAdmin) {
      // Hash the password manually
      const hashedPassword = crypto
        .createHash('sha256')
        .update('admin123')
        .digest('hex');

      await Admin.create({
        name: 'Super Admin',
        email: 'admin@sihs.edu',
        password: hashedPassword,
        role: 'super_admin',
        permissions: [
          'manage_departments', 
          'manage_faculty', 
          'manage_news', 
          'manage_downloads', 
          'manage_notifications', 
          'manage_research', 
          'manage_settings', 
          'manage_admins'
        ]
      });
      console.log('✅ Initial super admin created: admin@sihs.edu / admin123');
    } else {
      console.log('ℹ️  Super admin already exists');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating initial admin:', error);
    process.exit(1);
  }
};

createInitialAdmin();