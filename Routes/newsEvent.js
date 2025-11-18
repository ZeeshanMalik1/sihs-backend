const express = require('express');
const router = express.Router();
const NewsEvent = require('../Models/NewsEvent.js');

// GET all news/events
router.get('/', async (req, res) => {
  try {
    const newsEvents = await NewsEvent.find().sort({ date: -1 });
    res.json({ success: true, data: newsEvents });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching news/events', error: err.message });
  }
});

// GET a single news/event by ID
router.get('/:id', async (req, res) => {
  try {
    const newsEvent = await NewsEvent.findById(req.params.id);
    if (!newsEvent) return res.status(404).json({ success: false, message: 'News/Event not found' });
    res.json({ success: true, data: newsEvent });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching news/event', error: err.message });
  }
});

// GET only active news/events (for public display)
router.get('/active/list', async (req, res) => {
  try {
    const newsEvents = await NewsEvent.find({ isActive: true }).sort({ date: -1 });
    res.json({ success: true, data: newsEvents });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching active news/events', error: err.message });
  }
});

// POST create new news/event
router.post('/', async (req, res) => {
  try {
    const { title, date, description, category, location, startTime, endTime, eventType, imageUrl, facebookEmbedUrl, isActive } = req.body;

    if (!title || !date || !description) {
      return res.status(400).json({ success: false, message: 'Title, date, and description are required' });
    }

    const newsEvent = await NewsEvent.create({
      title,
      date,
      description,
      category: category || 'News',
      location: location || '',
      startTime: startTime || '',
      endTime: endTime || '',
      eventType: eventType || 'Other',
      imageUrl: imageUrl || '',
      facebookEmbedUrl: facebookEmbedUrl || '',
      isActive: typeof isActive === 'boolean' ? isActive : true,
    });

    res.status(201).json({ success: true, data: newsEvent });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error creating news/event', error: err.message });
  }
});

// PUT update news/event
router.put('/:id', async (req, res) => {
  try {
    const newsEvent = await NewsEvent.findById(req.params.id);
    if (!newsEvent) return res.status(404).json({ success: false, message: 'News/Event not found' });

    Object.assign(newsEvent, req.body);
    await newsEvent.save();

    res.json({ success: true, data: newsEvent });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error updating news/event', error: err.message });
  }
});

// DELETE news/event
router.delete('/:id', async (req, res) => {
  try {
    const newsEvent = await NewsEvent.findById(req.params.id);
    if (!newsEvent) return res.status(404).json({ success: false, message: 'News/Event not found' });

    await newsEvent.deleteOne();
    res.json({ success: true, message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error deleting news/event', error: err.message });
  }
});

module.exports = router;
