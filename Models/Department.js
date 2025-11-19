const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  code: { type: String, required: true },
  name: { type: String, required: true },
  credits: { type: String, required: true },
  type: { type: String, enum: ["Theory", "Practical", "Both"], default: "Theory" }
});

const semesterSchema = new mongoose.Schema({
  semesterNumber: { type: Number, required: true },
  title: { type: String, required: true },
  courses: [courseSchema]
});

const programSchema = new mongoose.Schema({
  name: { type: String, required: true },
  duration: { type: String, required: true },
  degreeType: { type: String, required: true },
  description: { type: String, required: true },
  semesters: [semesterSchema]
});

const departmentSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true, 
      trim: true,
      unique: true 
    },
    description: { 
      type: String, 
      required: true 
    },
    code: { 
      type: String, 
      required: true,
      uppercase: true,
      unique: true,
      trim: true
    },
    headOfDept: { 
      type: String, 
      required: true,
      trim: true 
    },
    foundedYear: { 
      type: Number, 
      required: true,
      min: 1900,
      max: new Date().getFullYear()
    },
    totalFaculty: { 
      type: Number, 
      required: true,
      min: 0
    },
    imageUrl: { 
      type: String, 
      default: "" 
    },
    path: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    programs: [programSchema],
    facilities: [{ type: String }],
    researchAreas: [{ type: String }],
    contactEmail: { type: String, trim: true },
    contactPhone: { type: String, trim: true },
    isActive: { 
      type: Boolean, 
      default: true 
    },
  },
  { timestamps: true }
);

// Create URL path from name before saving
departmentSchema.pre('save', function(next) {
  if (this.isModified('name') && !this.path) {
    this.path = `/department-of-${this.name.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and')}`;
  }
  next();
});

// Index for search optimization
departmentSchema.index({ name: "text", description: "text" });

module.exports = mongoose.model("Department", departmentSchema);