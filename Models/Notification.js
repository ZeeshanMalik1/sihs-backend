// Models/Notification.js
const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true },
    date: { type: Date, default: Date.now },
    category: {
      type: String,
      enum: ["General", "Urgent", "Academic", "Event", "Maintenance"],
      default: "General",
    },
    priority: {
      type: String,
      enum: ["Low", "Normal", "High", "Critical"],
      default: "Normal",
    },
    department: { type: String, trim: true }, // Can be department ID or name
    targetAudience: {
      type: String,
      enum: ["All", "Students", "Faculty", "Staff"],
      default: "All",
    },
    imageUrl: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
    expiresAt: { type: Date }, // Optional expiration date
  },
  { timestamps: true }
);

// Index for better query performance
notificationSchema.index({ isActive: 1, date: -1 });
notificationSchema.index({ targetAudience: 1, isActive: 1 });

// Static method to get active notifications
notificationSchema.statics.getActiveNotifications = function () {
  return this.find({ 
    isActive: true,
    $or: [
      { expiresAt: { $exists: false } },
      { expiresAt: { $gt: new Date() } }
    ]
  }).sort({ date: -1 });
};

// Static method to get notifications by audience
notificationSchema.statics.getByAudience = function (audience) {
  return this.find({ 
    isActive: true,
    $or: [
      { targetAudience: "All" },
      { targetAudience: audience }
    ],
    $or: [
      { expiresAt: { $exists: false } },
      { expiresAt: { $gt: new Date() } }
    ]
  }).sort({ priority: -1, date: -1 });
};

module.exports = mongoose.model("Notification", notificationSchema);