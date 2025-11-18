// models/Admin.js
const mongoose = require("mongoose");
const crypto = require("crypto");

const adminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    role: {
      type: String,
      enum: ["super_admin", "admin", "moderator"],
      default: "admin"
    },
    isActive: {
      type: Boolean,
      default: true
    },
    lastLogin: {
      type: Date
    },
    permissions: [{
      type: String,
      enum: [
        "manage_departments", 
        "manage_faculty", 
        "manage_news", 
        "manage_downloads", 
        "manage_notifications", 
        "manage_research", 
        "manage_settings", 
        "manage_admins"
      ]
    }]
  },
  { timestamps: true }
);

// Hash password before saving
adminSchema.pre("save", function (next) {
  if (!this.isModified("password")) return next();
  
  try {
    // Simple hash using SHA-256
    this.password = crypto
      .createHash('sha256')
      .update(this.password)
      .digest('hex');
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method - FIXED
adminSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    const hashedCandidate = crypto
      .createHash('sha256')
      .update(candidatePassword)
      .digest('hex');
    
    console.log('Stored password:', this.password);
    console.log('Hashed candidate:', hashedCandidate);
    
    return this.password === hashedCandidate;
  } catch (error) {
    console.error('Password comparison error:', error);
    return false;
  }
};

// Method to remove password from JSON output
adminSchema.methods.toJSON = function () {
  const admin = this.toObject();
  delete admin.password;
  return admin;
};

// Static method to get active admins
adminSchema.statics.getActiveAdmins = function () {
  return this.find({ isActive: true }).select("-password");
};

module.exports = mongoose.model("Admin", adminSchema);