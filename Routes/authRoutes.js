// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const Admin = require('../Models/Admin.js');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/authMiddleware.js');

// JWT Secret (should be in environment variables)
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const generateToken = (adminId) => {
  return jwt.sign({ adminId }, JWT_SECRET, { expiresIn: '7d' });
};

// @desc    Admin Registration (Only for super admins)
// @route   POST /api/admin/auth/register
// @access  Private (Super Admin only) - Modified to public for initial setup
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role = 'admin' } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide name, email and password' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password must be at least 6 characters long' 
      });
    }

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ 
        success: false, 
        message: 'Admin with this email already exists' 
      });
    }

    // For security, only allow 'admin' or 'moderator' role in public registration
    const allowedRole = (role === 'super_admin') ? 'admin' : role;

    const admin = await Admin.create({
      name,
        // Create admin (initially inactive - requires super admin approval)
      email,
      password,
      role: allowedRole,
      isActive: true, // Set to true for demo, set to false in production
      permissions: getDefaultPermissions(allowedRole)
    });

    // Generate token for immediate login (optional)
    const token = generateToken(admin._id);

    res.status(201).json({
      success: true,
      message: 'Admin account created successfully',
      data: {
        admin: admin.toJSON(),
        token
      }
    });

  } catch (err) {
    console.error('Registration error:', err);
    
    if (err.code === 11000) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email already exists' 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Server error during registration' 
    });
  }
});

// Helper function to set default permissions based on role
function getDefaultPermissions(role) {
  const basePermissions = ['manage_news', 'manage_downloads', 'manage_notifications'];
  
  switch (role) {
    case 'super_admin':
      return [
        'manage_departments', 
        'manage_faculty', 
        'manage_news', 
        'manage_downloads', 
        'manage_notifications', 
        'manage_research', 
        'manage_settings', 
        'manage_admins'
      ];
    case 'admin':
      return [
        'manage_departments', 
        'manage_faculty', 
        'manage_news', 
        'manage_downloads', 
        'manage_notifications', 
        'manage_research'
      ];
    case 'moderator':
      return ['manage_news', 'manage_notifications', 'manage_downloads'];
    default:
      return basePermissions;
  }
}


// @desc    Admin Login
// @route   POST /api/admin/auth/login
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide email and password' 
        // Check if admin exists
      });
    }

    const admin = await Admin.findOne({ email, isActive: true });
    if (!admin) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Check password
    const isPasswordValid = await admin.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    // Generate token
    const token = generateToken(admin._id);

    // Send response
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        admin: admin.toJSON(),
        token
      }
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during login' 
    });
  }
});

// @desc    Get current admin profile
// @route   GET /api/admin/auth/me
// @access  Private 
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const admin = await Admin.findById(req.adminId).select('-password');
    
    if (!admin) {
      return res.status(404).json({ 
        success: false, 
        message: 'Admin not found' 
      });
    }

    res.json({
      success: true,
      data: admin
    });
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// @desc    Update admin profile
// @route   PUT /api/admin/auth/profile
// @access  Private
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { name, email } = req.body;
    
    const admin = await Admin.findByIdAndUpdate(
      req.adminId,
      { name, email },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: admin
    });
  } catch (err) {
    console.error('Update profile error:', err);
    
    if (err.code === 11000) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email already exists' 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// @desc    Change password
// @route   PUT /api/admin/auth/change-password
// @access  Private
router.put('/change-password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide current and new password' 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'New password must be at least 6 characters long' 
      });
    }

    const admin = await Admin.findById(req.adminId);
    
    // Verify current password
    const isCurrentPasswordValid = await admin.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        message: 'Current password is incorrect' 
      });
    }

    // Update password
    admin.password = newPassword;
    await admin.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// @desc    Logout (client-side token removal)
// @route   POST /api/admin/auth/logout
// @access  Private
router.post('/logout', authMiddleware, async (req, res) => {
  try {
    // In a real application, you might want to maintain a blacklist of tokens
    // For now, we'll just return success and let the client remove the token
    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (err) {
    console.error('Logout error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

module.exports = router;