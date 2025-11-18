// routes/siteSettings.js
const express = require('express');
const router = express.Router();
const SiteSettings = require('../Models/SiteSettings.js');

// @route   GET /api/site-settings
// @desc    Get site settings
// @access  Public
router.get('/', async (req, res) => {
  try {
    const settings = await SiteSettings.getSettings();
    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Error fetching site settings:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching site settings',
      error: error.message
    });
  }
});

// @route   POST /api/site-settings
// @desc    Create or update site settings
// @access  Private (Add authentication middleware)
router.post('/', async (req, res) => {
  try {
    const {
      theme,
      schoolName,
      address,
      phone,
      whatsapp,
      email,
      website,
      logo,
      favicon,
      mapEmbedUrl,
      mapLocation,
      socialLinks,
      openingHours
    } = req.body;

    // Validation
    if (!schoolName || !address || !email) {
      return res.status(400).json({
        success: false,
        message: 'School name, address, and email are required'
      });
    }

    // Find existing settings or create new
    let settings = await SiteSettings.findOne();
    
    if (settings) {
      // Update existing settings
      settings.theme = theme || settings.theme;
      settings.schoolName = schoolName;
      settings.address = address;
      settings.phone = phone;
      settings.whatsapp = whatsapp;
      settings.email = email;
      settings.website = website;
      settings.logo = logo || settings.logo;
      settings.favicon = favicon;
      settings.mapEmbedUrl = mapEmbedUrl;
      
      if (mapLocation) {
        settings.mapLocation = {
          latitude: mapLocation.latitude || settings.mapLocation.latitude,
          longitude: mapLocation.longitude || settings.mapLocation.longitude,
          zoom: mapLocation.zoom || settings.mapLocation.zoom
        };
      }
      
      if (socialLinks) {
        settings.socialLinks = {
          facebook: socialLinks.facebook || settings.socialLinks.facebook,
          instagram: socialLinks.instagram || settings.socialLinks.instagram,
          linkedin: socialLinks.linkedin || settings.socialLinks.linkedin,
          twitter: socialLinks.twitter || settings.socialLinks.twitter,
          youtube: socialLinks.youtube || settings.socialLinks.youtube
        };
      }
      
      if (openingHours) {
        settings.openingHours = {
          mondayFriday: openingHours.mondayFriday || settings.openingHours.mondayFriday,
          saturday: openingHours.saturday || settings.openingHours.saturday,
          sunday: openingHours.sunday || settings.openingHours.sunday
        };
      }
      
      await settings.save();
    } else {
      // Create new settings
      settings = await SiteSettings.create(req.body);
    }

    res.json({
      success: true,
      message: 'Site settings updated successfully',
      data: settings
    });
  } catch (error) {
    console.error('Error updating site settings:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating site settings',
      error: error.message
    });
  }
});

// @route   PUT /api/site-settings/:id
// @desc    Update specific fields in site settings
// @access  Private (Add authentication middleware)
router.put('/:id', async (req, res) => {
  try {
    const settings = await SiteSettings.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!settings) {
      return res.status(404).json({
        success: false,
        message: 'Settings not found'
      });
    }

    res.json({
      success: true,
      message: 'Settings updated successfully',
      data: settings
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating settings',
      error: error.message
    });
  }
});

// @route   DELETE /api/site-settings/reset
// @desc    Reset to default settings
// @access  Private (Add authentication middleware)
router.delete('/reset', async (req, res) => {
  try {
    await SiteSettings.deleteMany({});
    const settings = await SiteSettings.getSettings();
    
    res.json({
      success: true,
      message: 'Settings reset to defaults',
      data: settings
    });
  } catch (error) {
    console.error('Error resetting settings:', error);
    res.status(500).json({
      success: false,
      message: 'Error resetting settings',
      error: error.message
    });
  }
});

module.exports = router;