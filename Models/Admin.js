const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const adminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: 2,
      maxlength: 100
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Invalid email format"]
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false // Don't include password by default
    },
    role: {
      type: String,
      enum: {
        values: ["super_admin", "admin", "moderator"],
        message: "Role must be one of: super_admin, admin, moderator"
      },
      default: "admin"
    },
    phone: {
      type: String,
      trim: true,
      default: ""
    },
    department: {
      type: String,
      trim: true,
      default: ""
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    },
    lastLogin: {
      type: Date,
      default: null
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
    }],
    loginAttempts: {
      type: Number,
      default: 0
    },
    lockUntil: {
      type: Date,
      default: null
    }
  },
  { 
    timestamps: true,
    toJSON: { transform: function(doc) {
      delete doc.password;
      delete doc.loginAttempts;
      delete doc.lockUntil;
      return doc;
    }}
  }
);

// Index for faster queries
adminSchema.index({ email: 1, isActive: 1 });

// Hash password before saving
adminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
adminSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    console.error('Password comparison error:', error);
    return false;
  }
};

// Check if account is locked
adminSchema.methods.isLocked = function () {
  return this.lockUntil && this.lockUntil > Date.now();
};

// Increment login attempts
adminSchema.methods.incLoginAttempts = async function () {
  // Reset attempts if lock has expired
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return await this.updateOne({
      $set: { loginAttempts: 1, lockUntil: null }
    });
  }

  // Increment attempts
  const updates = { $inc: { loginAttempts: 1 } };

  // Lock account after 5 failed attempts (15 minutes)
  const maxAttempts = 5;
  const lockTime = 15 * 60 * 1000;

  if (this.loginAttempts + 1 >= maxAttempts && !this.isLocked()) {
    updates.lockUntil = new Date(Date.now() + lockTime);
  }

  return await this.updateOne(updates);
};

// Reset login attempts
adminSchema.methods.resetLoginAttempts = async function () {
  return await this.updateOne({
    $set: { loginAttempts: 0, lockUntil: null }
  });
};

// Get active admins
adminSchema.statics.getActiveAdmins = function () {
  return this.find({ isActive: true }).select("-password -loginAttempts -lockUntil");
};

// Custom JSON serialization
adminSchema.methods.toJSON = function () {
  const admin = this.toObject();
  delete admin.password;
  delete admin.loginAttempts;
  delete admin.lockUntil;
  return admin;
};

module.exports = mongoose.model("Admin", adminSchema);
