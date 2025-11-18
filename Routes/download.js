// Routes/downloadRoutes.js
const express = require('express');
const router = express.Router();
const Download = require('../Models/Download.js');

// GET all downloads (for admin)
router.get('/', async (req, res) => {
  try {
    const downloads = await Download.find().sort({ createdAt: -1 });
    res.json({ success: true, data: downloads });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching downloads', error: err.message });
  }
});

// GET active downloads only (for public display)
router.get('/active', async (req, res) => {
  try {
    const downloads = await Download.getActiveDownloads();
    res.json({ success: true, data: downloads });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching active downloads', error: err.message });
  }
});

// GET downloads by department
router.get('/department/:department', async (req, res) => {
  try {
    const { department } = req.params;
    const downloads = await Download.getByDepartment(department);
    res.json({ success: true, data: downloads });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching department downloads', error: err.message });
  }
});

// GET downloads by category
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const downloads = await Download.getByCategory(category);
    res.json({ success: true, data: downloads });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching category downloads', error: err.message });
  }
});

// GET popular downloads
router.get('/popular', async (req, res) => {
  try {
    const downloads = await Download.find({ isActive: true })
      .sort({ downloadCount: -1 })
      .limit(10);
    res.json({ success: true, data: downloads });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching popular downloads', error: err.message });
  }
});

// GET a single download by ID
router.get('/:id', async (req, res) => {
  try {
    const download = await Download.findById(req.params.id);
    if (!download) return res.status(404).json({ success: false, message: 'Download not found' });
    res.json({ success: true, data: download });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching download', error: err.message });
  }
});

// POST create new download
router.post('/', async (req, res) => {
  try {
    const { 
      title, 
      description, 
      fileUrl, 
      fileName, 
      fileSize, 
      category, 
      department, 
      fileType, 
      isActive,
      uploadedBy 
    } = req.body;

    if (!title || !description || !fileUrl || !department) {
      return res.status(400).json({ 
        success: false, 
        message: 'Title, description, file URL, and department are required' 
      });
    }

    const download = await Download.create({
      title,
      description,
      fileUrl,
      fileName: fileName || '',
      fileSize: fileSize || '',
      category: category || 'General',
      department,
      fileType: fileType || 'PDF',
      isActive: typeof isActive === 'boolean' ? isActive : true,
      uploadedBy: uploadedBy || ''
    });

    res.status(201).json({ success: true, data: download });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error creating download', error: err.message });
  }
});

// PUT update download
router.put('/:id', async (req, res) => {
  try {
    const download = await Download.findById(req.params.id);
    if (!download) return res.status(404).json({ success: false, message: 'Download not found' });

    Object.assign(download, req.body);
    await download.save();

    res.json({ success: true, data: download });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error updating download', error: err.message });
  }
});

// PATCH increment download count
router.patch('/:id/download', async (req, res) => {
  try {
    const download = await Download.findById(req.params.id);
    if (!download) return res.status(404).json({ success: false, message: 'Download not found' });

    await download.incrementDownloadCount();
    
    res.json({ 
      success: true, 
      data: download,
      message: 'Download count updated successfully' 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error updating download count', error: err.message });
  }
});

// DELETE download
router.delete('/:id', async (req, res) => {
  try {
    const download = await Download.findById(req.params.id);
    if (!download) return res.status(404).json({ success: false, message: 'Download not found' });

    await download.deleteOne();
    res.json({ success: true, message: 'Download deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error deleting download', error: err.message });
  }
});

// PATCH toggle download status
router.patch('/:id/toggle', async (req, res) => {
  try {
    const download = await Download.findById(req.params.id);
    if (!download) return res.status(404).json({ success: false, message: 'Download not found' });

    download.isActive = !download.isActive;
    await download.save();

    res.json({ 
      success: true, 
      data: download,
      message: `Download ${download.isActive ? 'activated' : 'deactivated'} successfully` 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error toggling download status', error: err.message });
  }
});

module.exports = router;