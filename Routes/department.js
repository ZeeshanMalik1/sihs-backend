const express = require('express');
const router = express.Router();
const Department = require('../Models/Department.js');

// GET all departments
router.get('/', async (req, res) => {
  try {
    const departments = await Department.find().sort({ name: 1 });
    res.json({ success: true, data: departments });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching departments', error: err.message });
  }
});

// GET a single department by ID
router.get('/:id', async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) return res.status(404).json({ success: false, message: 'Department not found' });
    res.json({ success: true, data: department });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching department', error: err.message });
  }
});

// GET only active departments (for public display)
router.get('/active/list', async (req, res) => {
  try {
    const departments = await Department.find({ isActive: true }).sort({ name: 1 });
    res.json({ success: true, data: departments });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching active departments', error: err.message });
  }
});

// GET department by path
router.get('/path/:path', async (req, res) => {
  try {
    const department = await Department.findOne({ 
      path: req.params.path,
      isActive: true 
    });
    if (!department) return res.status(404).json({ success: false, message: 'Department not found' });
    res.json({ success: true, data: department });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching department', error: err.message });
  }
});

// POST create new department
router.post('/', async (req, res) => {
  try {
    const { 
      name, description, code, headOfDept, foundedYear, totalFaculty, 
      imageUrl, programs, facilities, researchAreas, contactEmail, contactPhone, isActive 
    } = req.body;

    if (!name || !description || !code || !headOfDept || !foundedYear || !totalFaculty) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name, description, code, head of department, founded year, and total faculty are required' 
      });
    }

    // Generate path from name
    const path = `/department-of-${name.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and')}`;

    const department = await Department.create({
      name,
      description,
      code,
      headOfDept,
      foundedYear,
      totalFaculty,
      imageUrl: imageUrl || '',
      path,
      programs: programs || [],
      facilities: facilities || [],
      researchAreas: researchAreas || [],
      contactEmail: contactEmail || '',
      contactPhone: contactPhone || '',
      isActive: typeof isActive === 'boolean' ? isActive : true,
    });

    res.status(201).json({ success: true, data: department });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ 
        success: false, 
        message: 'Department with this name or code already exists' 
      });
    }
    res.status(500).json({ success: false, message: 'Error creating department', error: err.message });
  }
});

// PUT update department
router.put('/:id', async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) return res.status(404).json({ success: false, message: 'Department not found' });

    Object.assign(department, req.body);
    await department.save();

    res.json({ success: true, data: department });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ 
        success: false, 
        message: 'Department with this name or code already exists' 
      });
    }
    res.status(500).json({ success: false, message: 'Error updating department', error: err.message });
  }
});

// DELETE department
router.delete('/:id', async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) return res.status(404).json({ success: false, message: 'Department not found' });

    await department.deleteOne();
    res.json({ success: true, message: 'Department deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error deleting department', error: err.message });
  }
});

module.exports = router;