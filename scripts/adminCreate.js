require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('../Models/Admin.js');

const admins = [
  {
    name: 'Super Administrator',
    email: 'superadmin@example.com',
    password: 'SuperAdmin@123', // Change this!
    role: 'super_admin',
    phone: '+1234567890',
    department: 'Administration',
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
  },
  {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'Admin@123', // Change this!
    role: 'admin',
    phone: '+1234567891',
    department: 'Content Management',
    permissions: [
      'manage_departments',
      'manage_faculty',
      'manage_news',
      'manage_downloads',
      'manage_notifications',
      'manage_research'
    ]
  },
  {
    name: 'Moderator User',
    email: 'moderator@example.com',
    password: 'Moderator@123', // Change this!
    role: 'moderator',
    phone: '+1234567892',
    department: 'Moderation',
    permissions: [
      'manage_news',
      'manage_notifications',
      'manage_downloads'
    ]
  }
];

const initializeAdmins = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI ||"mongodb+srv://mzeeshanmalik130_db_user:zRS6p9raq2jkfRTD@cluster0.hjjvwmc.mongodb.net/?appName=Cluster0", {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('🔗 Connected to MongoDB');

    // Clear existing admins (optional - comment out for safety)
    // await Admin.deleteMany({});
    // console.log('🗑️  Cleared existing admins');

    // Create admins
    for (const adminData of admins) {
      const existingAdmin = await Admin.findOne({ email: adminData.email });

      if (existingAdmin) {
        console.log(`⚠️  Admin with email ${adminData.email} already exists`);
      } else {
        const admin = await Admin.create({
          ...adminData,
          isActive: true,
          lastLogin: null,
          loginAttempts: 0
        });

        console.log(`✅ Created admin: ${admin.name} (${admin.email}) - Role: ${admin.role}`);
      }
    }

    console.log('\n✨ Initialization complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Initialization error:', error);
    process.exit(1);
  }
};

initializeAdmins();