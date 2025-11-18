// models/SiteSettings.js
const mongoose = require('mongoose');

const siteSettingsSchema = new mongoose.Schema({
  theme: {
    type: String,
    default: 'default',
    enum: ['default', 'dark', 'light']
  },
  schoolName: {
    type: String,
    required: true,
    default: 'SIHS'
  },
  address: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  whatsapp: {
    type: String
  },
  email: {
    type: String,
    required: true
  },
  website: {
    type: String
  },
  logo: {
    type: String,
    default: '/images/logo.png'
  },
  favicon: {
    type: String
  },
  mapEmbedUrl: {
    type: String
  },
  mapLocation: {
    latitude: {
      type: Number,
      default: 32.08237311905389
    },
    longitude: {
      type: Number,
      default: 72.67886211039271
    },
    zoom: {
      type: Number,
      default: 15
    }
  },
  socialLinks: {
    facebook: String,
    instagram: String,
    linkedin: String,
    twitter: String,
    youtube: String
  },
  openingHours: {
    mondayFriday: {
      type: String,
      default: '09:00 AM - 05:00 PM'
    },
    saturday: {
      type: String,
      default: '10:00 AM - 03:00 PM'
    },
    sunday: {
      type: String,
      default: 'Closed'
    }
  }
}, {
  timestamps: true
});

// Ensure only one settings document exists
siteSettingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({
      schoolName: 'SIHS',
      address: '117-C Zafar Ullah Rd, Satellite Town, Sargodha, 40100',
      phone: '0483252717',
      whatsapp: '0335 7550755',
      email: 'sihs.edu.pk@gmail.com',
      socialLinks: {
        facebook: 'https://www.facebook.com/sihs.edu.pk/',
        instagram: 'https://www.instagram.com/sihs.edu.pk/'
      }
    });
  }
  return settings;
};

module.exports = mongoose.model('SiteSettings', siteSettingsSchema);