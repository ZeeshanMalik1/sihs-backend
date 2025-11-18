const mongoose = require("mongoose");

const newsEventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    imageUrl: { type: String, trim: true },
    category: { type: String, enum: ["News", "Event", "Announcement"], default: "News" },
    location: { type: String, trim: true },
    startTime: { type: String, trim: true },
    endTime: { type: String, trim: true },
    eventType: {
      type: String,
      enum: ["Other", "Seminar", "Workshop", "Conference", "Celebration", "Meeting"],
      default: "Other",
    },
    facebookEmbedUrl: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Optional: Index for search optimization
newsEventSchema.index({ title: "text", description: "text", location: "text" });

module.exports = mongoose.model("NewsEvent", newsEventSchema);
