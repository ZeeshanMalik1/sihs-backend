// Routes/notificationRoutes.js
const express = require('express');
const router = express.Router();
const Notification = require('../Models/Notification.js');

// GET all notifications (for admin)
router.get('/', async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ date: -1 });
    res.json({ success: true, data: notifications });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching notifications', error: err.message });
  }
});

// GET active notifications only (for public display)
router.get('/active', async (req, res) => {
  try {
    const notifications = await Notification.find({ isActive: true }).sort({ date: -1 });
    res.json({ success: true, data: notifications });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching active notifications', error: err.message });
  }
});

// GET notifications by audience
router.get('/audience/:audience', async (req, res) => {
  try {
    const { audience } = req.params;
    const validAudiences = ["All", "Students", "Faculty", "Staff"];
    
    if (!validAudiences.includes(audience)) {
      return res.status(400).json({ success: false, message: 'Invalid audience type' });
    }

    const notifications = await Notification.getByAudience(audience);
    res.json({ success: true, data: notifications });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching notifications', error: err.message });
  }
});

// GET a single notification by ID
router.get('/:id', async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) return res.status(404).json({ success: false, message: 'Notification not found' });
    res.json({ success: true, data: notification });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching notification', error: err.message });
  }
});

// POST create new notification
router.post('/', async (req, res) => {
  try {
    const { 
      title, 
      message, 
      date, 
      category, 
      priority, 
      department, 
      targetAudience, 
      imageUrl, 
      isActive,
      expiresAt 
    } = req.body;

    if (!title || !message) {
      return res.status(400).json({ success: false, message: 'Title and message are required' });
    }

    const notification = await Notification.create({
      title,
      message,
      date: date || Date.now(),
      category: category || 'General',
      priority: priority || 'Normal',
      department: department || '',
      targetAudience: targetAudience || 'All',
      imageUrl: imageUrl || '',
      isActive: typeof isActive === 'boolean' ? isActive : true,
      expiresAt: expiresAt || null
    });

    res.status(201).json({ success: true, data: notification });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error creating notification', error: err.message });
  }
});

// PUT update notification
router.put('/:id', async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) return res.status(404).json({ success: false, message: 'Notification not found' });

    Object.assign(notification, req.body);
    await notification.save();

    res.json({ success: true, data: notification });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error updating notification', error: err.message });
  }
});

// DELETE notification
router.delete('/:id', async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) return res.status(404).json({ success: false, message: 'Notification not found' });

    await notification.deleteOne();
    res.json({ success: true, message: 'Notification deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error deleting notification', error: err.message });
  }
});

// PATCH toggle notification status
router.patch('/:id/toggle', async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) return res.status(404).json({ success: false, message: 'Notification not found' });

    notification.isActive = !notification.isActive;
    await notification.save();

    res.json({ 
      success: true, 
      data: notification,
      message: `Notification ${notification.isActive ? 'activated' : 'deactivated'} successfully` 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error toggling notification status', error: err.message });
  }
});

module.exports = router;