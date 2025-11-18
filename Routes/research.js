const express = require('express');
const router = express.Router();
const Research = require('../Models/Research');

// GET all research
router.get('/', async (req, res) => {
  try {
    const research = await Research.find().sort({ publishedDate: -1 });
    res.json({ success: true, data: research });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching research', error: err.message });
  }
});

// GET published research only
router.get('/published', async (req, res) => {
  try {
    const research = await Research.getPublished();
    res.json({ success: true, data: research });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching published research', error: err.message });
  }
});

// POST create new research
router.post('/', async (req, res) => {
  try {
    const { title, description, authors, status, fileUrl, publishedDate } = req.body;

    if (!title || !description) return res.status(400).json({ success: false, message: 'Title and description are required' });

    const research = await Research.create({
      title,
      description,
      authors: Array.isArray(authors) ? authors : [],
      status: status || 'Draft',
      fileUrl: fileUrl || '',
      publishedDate: publishedDate || Date.now()
    });

    res.status(201).json({ success: true, data: research });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error creating research', error: err.message });
  }
});

// PUT update research
router.put('/:id', async (req, res) => {
  try {
    const research = await Research.findById(req.params.id);
    if (!research) return res.status(404).json({ success: false, message: 'Research not found' });

    Object.assign(research, req.body);
    await research.save();

    res.json({ success: true, data: research });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error updating research', error: err.message });
  }
});

// DELETE research
router.delete('/:id', async (req, res) => {
  try {
    const research = await Research.findById(req.params.id);
    if (!research) return res.status(404).json({ success: false, message: 'Research not found' });

    await research.deleteOne();
    res.json({ success: true, message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error deleting research', error: err.message });
  }
});

module.exports = router;
