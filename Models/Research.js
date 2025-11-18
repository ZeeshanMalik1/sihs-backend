const mongoose = require('mongoose');

const researchSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Abstract/Description is required']
  },
  authors: [{
    type: String,
    trim: true
  }],
  status: {
    type: String,
    enum: ['Draft', 'Published', 'Under Review'],
    default: 'Draft'
  },
  fileUrl: {
    type: String,
    trim: true
  },
  publishedDate: {
    type: Date,
    default: Date.now
  },
  views: { type: Number, default: 0 },
  downloads: { type: Number, default: 0 }
}, { timestamps: true });

// Index for search optimization
researchSchema.index({ title: 'text', description: 'text' });

// Virtual for formatted date
researchSchema.virtual('formattedDate').get(function() {
  return this.publishedDate.toLocaleDateString();
});

// Increment views
researchSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Increment downloads
researchSchema.methods.incrementDownloads = function() {
  this.downloads += 1;
  return this.save();
};

// Get published research
researchSchema.statics.getPublished = function() {
  return this.find({ status: 'Published' }).sort({ publishedDate: -1 });
};

// Get by status
researchSchema.statics.getByStatus = function(status) {
  return this.find({ status }).sort({ publishedDate: -1 });
};

module.exports = mongoose.model('Research', researchSchema);
