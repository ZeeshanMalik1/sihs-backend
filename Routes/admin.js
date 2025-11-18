// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const Admin = require('../Models/Admin.js');
const authMiddleware = require('../middleware/authMiddleware');

// @desc    Get all admins (only for super_admin)
// @route   GET /api/admin/admins
// @access  Private (Super Admin only)
router.get('/', authMiddleware, async (req, res) => {
  try {
    // Check if current admin is super admin
    if (req.admin.role !== 'super_admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Super admin only.' 
      });
    }

    const admins = await Admin.getActiveAdmins();
    
    res.json({
      success: true,
      data: admins
    });
  } catch (err) {
    console.error('Get admins error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// @desc    Create new admin (only for super_admin)
// @route   POST /api/admin/admins
// @access  Private (Super Admin only)
router.post('/', authMiddleware, async (req, res) => {
  try {
    if (req.admin.role !== 'super_admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Super admin only.' 
      });
    }

    const { name, email, password, role, permissions } = req.body;

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

    // Create admin
    const admin = await Admin.create({
      name,
      email,
      password,
      role: role || 'admin',
      permissions: permissions || []
    });

    res.status(201).json({
      success: true,
      message: 'Admin created successfully',
      data: admin.toJSON()
    });
  } catch (err) {
    console.error('Create admin error:', err);
    
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

// @desc    Update admin
// @route   PUT /api/admin/admins/:id
// @access  Private (Super Admin only)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    if (req.admin.role !== 'super_admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Super admin only.' 
      });
    }

    const { name, email, role, permissions, isActive } = req.body;

    const admin = await Admin.findByIdAndUpdate(
      req.params.id,
      { name, email, role, permissions, isActive },
      { new: true, runValidators: true }
    ).select('-password');

    if (!admin) {
      return res.status(404).json({ 
        success: false, 
        message: 'Admin not found' 
      });
    }

    res.json({
      success: true,
      message: 'Admin updated successfully',
      data: admin
    });
  } catch (err) {
    console.error('Update admin error:', err);
    
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

// @desc    Delete admin (soft delete)
// @route   DELETE /api/admin/admins/:id
// @access  Private (Super Admin only)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    if (req.admin.role !== 'super_admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Super admin only.' 
      });
    }

    // Prevent self-deletion
    if (req.params.id === req.adminId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot delete your own account' 
      });
    }

    const admin = await Admin.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!admin) {
      return res.status(404).json({ 
        success: false, 
        message: 'Admin not found' 
      });
    }

    res.json({
      success: true,
      message: 'Admin deleted successfully'
    });
  } catch (err) {
    console.error('Delete admin error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

module.exports = router;