// routes/sliderRoutes.js
const express = require('express');
const router = express.Router();
const Slider = require('../Models/Slider.js');
const authMiddleware = require('../middleware/authMiddleware');

// @desc    Get all active sliders (for frontend)
// @route   GET /api/slider
// @access  Public
router.get('/', async (req, res) => {
  try {
    const sliders = await Slider.getActiveSliders();
    
    res.json({
      success: true,
      data: sliders
    });
  } catch (err) {
    console.error('Error fetching sliders:', err);
    res.status(500).json({
      success: false,
      message: 'Error fetching sliders',
      error: err.message
    });
  }
});

// @desc    Get all sliders (for admin)
// @route   GET /api/slider/admin
// @access  Private
router.get('/admin', authMiddleware, async (req, res) => {
  try {
    const sliders = await Slider.getAllSliders();
    
    res.json({
      success: true,
      data: sliders
    });
  } catch (err) {
    console.error('Error fetching admin sliders:', err);
    res.status(500).json({
      success: false,
      message: 'Error fetching sliders',
      error: err.message
    });
  }
});

// @desc    Get single slider by ID
// @route   GET /api/slider/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const slider = await Slider.findById(req.params.id);
    
    if (!slider) {
      return res.status(404).json({
        success: false,
        message: 'Slider not found'
      });
    }
    
    res.json({
      success: true,
      data: slider
    });
  } catch (err) {
    console.error('Error fetching slider:', err);
    res.status(500).json({
      success: false,
      message: 'Error fetching slider',
      error: err.message
    });
  }
});

// @desc    Create new slider
// @route   POST /api/slider
// @access  Private
router.post('/', authMiddleware, async (req, res) => {
  try {
    const {
      title,
      description,
      imageUrl,
      buttonText,
      buttonLink,
      order,
      isActive,
      autoPlay,
      autoPlayInterval
    } = req.body;

    // Validation
    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        message: 'Image URL is required'
      });
    }

    const slider = await Slider.create({
      title: title || '',
      description: description || '',
      imageUrl,
      buttonText: buttonText || 'Learn More',
      buttonLink: buttonLink || '/',
      order: order || 0,
      isActive: isActive !== undefined ? isActive : true,
      autoPlay: autoPlay !== undefined ? autoPlay : true,
      autoPlayInterval: autoPlayInterval || 5000
    });

    res.status(201).json({
      success: true,
      message: 'Slider created successfully',
      data: slider
    });
  } catch (err) {
    console.error('Error creating slider:', err);
    
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        error: err.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error creating slider',
      error: err.message
    });
  }
});

// @desc    Update slider
// @route   PUT /api/slider/:id
// @access  Private
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const slider = await Slider.findById(req.params.id);
    
    if (!slider) {
      return res.status(404).json({
        success: false,
        message: 'Slider not found'
      });
    }

    Object.assign(slider, req.body);
    await slider.save();

    res.json({
      success: true,
      message: 'Slider updated successfully',
      data: slider
    });
  } catch (err) {
    console.error('Error updating slider:', err);
    
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        error: err.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error updating slider',
      error: err.message
    });
  }
});

// @desc    Delete slider
// @route   DELETE /api/slider/:id
// @access  Private
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const slider = await Slider.findById(req.params.id);
    
    if (!slider) {
      return res.status(404).json({
        success: false,
        message: 'Slider not found'
      });
    }

    await slider.deleteOne();

    res.json({
      success: true,
      message: 'Slider deleted successfully'
    });
  } catch (err) {
    console.error('Error deleting slider:', err);
    res.status(500).json({
      success: false,
      message: 'Error deleting slider',
      error: err.message
    });
  }
});

// @desc    Toggle slider status
// @route   PATCH /api/slider/:id/toggle
// @access  Private
router.patch('/:id/toggle', authMiddleware, async (req, res) => {
  try {
    const slider = await Slider.findById(req.params.id);
    
    if (!slider) {
      return res.status(404).json({
        success: false,
        message: 'Slider not found'
      });
    }

    slider.isActive = !slider.isActive;
    await slider.save();

    res.json({
      success: true,
      message: `Slider ${slider.isActive ? 'activated' : 'deactivated'} successfully`,
      data: slider
    });
  } catch (err) {
    console.error('Error toggling slider:', err);
    res.status(500).json({
      success: false,
      message: 'Error toggling slider status',
      error: err.message
    });
  }
});

module.exports = router;