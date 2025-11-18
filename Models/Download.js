// Models/Download.js
const mongoose = require("mongoose");

const downloadSchema = new mongoose.Schema(
  {
    title: { 
      type: String, 
      required: true, 
      trim: true 
    },
    description: { 
      type: String, 
      required: true 
    },
    fileUrl: { 
      type: String, 
      required: true, 
      trim: true 
    },
    fileName: { 
      type: String, 
      trim: true 
    },
    fileSize: { 
      type: String, 
      trim: true 
    },
    category: {
      type: String,
      enum: ["General", "Syllabus", "Notes", "Assignment", "Question Paper", "Form", "Guideline"],
      default: "General",
    },
    department: { 
      type: String, 
      required: true 
    },
    fileType: {
      type: String,
      enum: ["PDF", "DOC", "DOCX", "XLS", "XLSX", "PPT", "PPTX", "ZIP", "Other"],
      default: "PDF",
    },
    downloadCount: { 
      type: Number, 
      default: 0 
    },
    isActive: { 
      type: Boolean, 
      default: true 
    },
    uploadedBy: { 
      type: String, 
      trim: true 
    },
    lastDownloaded: { 
      type: Date 
    }
  },
  { timestamps: true }
);

// Index for better query performance
downloadSchema.index({ department: 1, category: 1, isActive: 1 });
downloadSchema.index({ downloadCount: -1 });

// Static method to get active downloads
downloadSchema.statics.getActiveDownloads = function () {
  return this.find({ isActive: true }).sort({ createdAt: -1 });
};

// Static method to get downloads by department
downloadSchema.statics.getByDepartment = function (department) {
  return this.find({ 
    isActive: true,
    $or: [
      { department: "GEN" },
      { department: department }
    ]
  }).sort({ category: 1, title: 1 });
};

// Static method to get downloads by category
downloadSchema.statics.getByCategory = function (category) {
  return this.find({ 
    isActive: true,
    category: category 
  }).sort({ title: 1 });
};

// Method to increment download count
downloadSchema.methods.incrementDownloadCount = function () {
  this.downloadCount += 1;
  this.lastDownloaded = new Date();
  return this.save();
};

module.exports = mongoose.model("Download", downloadSchema);