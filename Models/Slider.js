// models/Slider.js
const mongoose = require("mongoose");

const sliderSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    imageUrl: {
      type: String,
      required: true,
      trim: true
    },
    buttonText: {
      type: String,
      default: "Learn More",
      trim: true
    },
    buttonLink: {
      type: String,
      default: "/",
      trim: true
    },
    order: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    },
    autoPlay: {
      type: Boolean,
      default: true
    },
    autoPlayInterval: {
      type: Number,
      default: 5000
    }
  },
  { timestamps: true }
);

// Index for better query performance
sliderSchema.index({ order: 1, isActive: 1 });

// Static method to get active sliders
sliderSchema.statics.getActiveSliders = function () {
  return this.find({ isActive: true }).sort({ order: 1 });
};

// Static method to get all sliders for admin
sliderSchema.statics.getAllSliders = function () {
  return this.find().sort({ order: 1, createdAt: -1 });
};

module.exports = mongoose.model("Slider", sliderSchema);