// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const rateLimit = require('express-rate-limit');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiter for login endpoint
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per windowMs
  message: 'Too many login attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});
// MongoDB Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sihs_db', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB Connected Successfully');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error);
    process.exit(1);
  }
};

connectDB();
app.use('/api/admin/auth/login', loginLimiter);
// Routes
const siteSettingsRoutes = require('./Routes/siteSettings.js');
const researchRoutes = require('./Routes/research.js');
const newsEventRoutes = require("./Routes/newsEvent.js");
const notificationRoutes = require('./Routes/notification.js');
const downloadRoutes = require('./Routes/download.js');
const authRoutes = require('./Routes/authRoutes.js');
const adminRoutes = require('./Routes/admin.js');
// const sliderRoutes= require('./Routes/slider.js');
// Admin authentication routes
app.use('/api/site-settings', siteSettingsRoutes);
app.use('/api/research', researchRoutes);
app.use("/api/news-events", newsEventRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/downloads', downloadRoutes);
app.use('/api/admin/auth', authRoutes);
app.use('/api/admin/admins', adminRoutes);
// app.use('/api/slider', require('./routes/sliderRoutes'));
// app.use('/api/slider', sliderRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'SIHS API Server',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      siteSettings: '/api/site-settings',
      research: '/api/research',
      researchPublished: '/api/research/published',
      researchStats: '/api/research/stats/summary'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 API URL: http://localhost:${PORT}/api`);
 
});

module.exports = app;