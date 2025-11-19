const express = require('express');
const router = express.Router();
const Faculty = require('../Models/Faculty.js');
const Department = require('../models/Department');

// Validation middleware
const validateFaculty = (req, res, next) => {
  const { name, email, department, designation } = req.body;
  
  if (!name || !email || !department || !designation) {
    return res.status(400).json({
      success: false,
      message: 'Name, email, department, and designation are required'
    });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid email address'
    });
  }

  next();
};

const isValidEmail = (email) => {
  const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  return emailRegex.test(email);
};

// @desc    Get all faculty members
// @route   GET /api/faculty
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      department,
      designation,
      isActive,
      page = 1,
      limit = 10,
      search
    } = req.query;

    let query = {};

    // Filter by department
    if (department) {
      query.department = department;
    }

    // Filter by designation
    if (designation) {
      query.designation = designation;
    }

    // Filter by active status
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    // Search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { specialization: { $regex: search, $options: 'i' } },
        { researchInterest: { $regex: search, $options: 'i' } }
      ];
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { designation: 1, name: 1 },
      populate: {
        path: 'department',
        select: 'name code'
      }
    };

    const faculty = await Faculty.find(query)
      .populate('department', 'name code')
      .sort(options.sort)
      .limit(options.limit * 1)
      .skip((options.page - 1) * options.limit);

    const total = await Faculty.countDocuments(query);

    res.json({
      success: true,
      data: faculty,
      pagination: {
        current: options.page,
        pages: Math.ceil(total / options.limit),
        total
      }
    });
  } catch (error) {
    console.error('Error fetching faculty:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching faculty data'
    });
  }
});

// @desc    Get single faculty member
// @route   GET /api/faculty/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const faculty = await Faculty.findById(req.params.id)
      .populate('department', 'name code description');

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: 'Faculty member not found'
      });
    }

    res.json({
      success: true,
      data: faculty
    });
  } catch (error) {
    console.error('Error fetching faculty member:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Faculty member not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while fetching faculty member'
    });
  }
});

// @desc    Create new faculty member
// @route   POST /api/faculty
// @access  Private/Admin
router.post('/', validateFaculty, async (req, res) => {
  try {
    const {
      name,
      department,
      designation,
      email,
      phone,
      image,
      education,
      specialization,
      bio,
      researchInterest,
      isActive = true
    } = req.body;

    // Check if department exists
    const departmentExists = await Department.findById(department);
    if (!departmentExists) {
      return res.status(400).json({
        success: false,
        message: 'Department not found'
      });
    }

    // Check if email already exists
    const existingFaculty = await Faculty.findOne({ email });
    if (existingFaculty) {
      return res.status(400).json({
        success: false,
        message: 'Faculty member with this email already exists'
      });
    }

    const faculty = new Faculty({
      name,
      department,
      designation,
      email,
      phone,
      image,
      education,
      specialization,
      bio,
      researchInterest,
      isActive
    });

    const savedFaculty = await faculty.save();
    await savedFaculty.populate('department', 'name code');

    res.status(201).json({
      success: true,
      message: 'Faculty member created successfully',
      data: savedFaculty
    });
  } catch (error) {
    console.error('Error creating faculty:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Faculty member with this email already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while creating faculty member'
    });
  }
});

// @desc    Update faculty member
// @route   PUT /api/faculty/:id
// @access  Private/Admin
router.put('/:id', validateFaculty, async (req, res) => {
  try {
    const {
      name,
      department,
      designation,
      email,
      phone,
      image,
      education,
      specialization,
      bio,
      researchInterest,
      isActive
    } = req.body;

    // Check if department exists
    if (department) {
      const departmentExists = await Department.findById(department);
      if (!departmentExists) {
        return res.status(400).json({
          success: false,
          message: 'Department not found'
        });
      }
    }

    // Check if email is taken by another faculty member
    if (email) {
      const existingFaculty = await Faculty.findOne({ 
        email, 
        _id: { $ne: req.params.id } 
      });
      if (existingFaculty) {
        return res.status(400).json({
          success: false,
          message: 'Faculty member with this email already exists'
        });
      }
    }

    const faculty = await Faculty.findByIdAndUpdate(
      req.params.id,
      {
        name,
        department,
        designation,
        email,
        phone,
        image,
        education,
        specialization,
        bio,
        researchInterest,
        isActive
      },
      { 
        new: true, 
        runValidators: true 
      }
    ).populate('department', 'name code');

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: 'Faculty member not found'
      });
    }

    res.json({
      success: true,
      message: 'Faculty member updated successfully',
      data: faculty
    });
  } catch (error) {
    console.error('Error updating faculty:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Faculty member not found'
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Faculty member with this email already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while updating faculty member'
    });
  }
});

// @desc    Delete faculty member
// @route   DELETE /api/faculty/:id
// @access  Private/Admin
router.delete('/:id', async (req, res) => {
  try {
    const faculty = await Faculty.findByIdAndDelete(req.params.id);

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: 'Faculty member not found'
      });
    }

    res.json({
      success: true,
      message: 'Faculty member deleted successfully',
      data: faculty
    });
  } catch (error) {
    console.error('Error deleting faculty:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Faculty member not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while deleting faculty member'
    });
  }
});

// @desc    Get faculty statistics
// @route   GET /api/faculty/stats/summary
// @access  Public
router.get('/stats/summary', async (req, res) => {
  try {
    const totalFaculty = await Faculty.countDocuments();
    const activeFaculty = await Faculty.countDocuments({ isActive: true });
    
    const designationStats = await Faculty.aggregate([
      {
        $group: {
          _id: '$designation',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    const departmentStats = await Faculty.aggregate([
      {
        $match: { isActive: true }
      },
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'departments',
          localField: '_id',
          foreignField: '_id',
          as: 'departmentInfo'
        }
      },
      {
        $unwind: '$departmentInfo'
      },
      {
        $project: {
          departmentName: '$departmentInfo.name',
          facultyCount: '$count'
        }
      },
      {
        $sort: { facultyCount: -1 }
      }
    ]);

    res.json({
      success: true,
      data: {
        totalFaculty,
        activeFaculty,
        inactiveFaculty: totalFaculty - activeFaculty,
        designationStats,
        departmentStats
      }
    });
  } catch (error) {
    console.error('Error fetching faculty stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching faculty statistics'
    });
  }
});

// @desc    Get faculty by department
// @route   GET /api/faculty/department/:departmentId
// @access  Public
router.get('/department/:departmentId', async (req, res) => {
  try {
    const faculty = await Faculty.find({ 
      department: req.params.departmentId,
      isActive: true 
    })
    .populate('department', 'name code')
    .sort({ designation: 1, name: 1 });

    res.json({
      success: true,
      data: faculty
    });
  } catch (error) {
    console.error('Error fetching faculty by department:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching faculty by department'
    });
  }
});

module.exports = router;