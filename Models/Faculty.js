const mongoose = require('mongoose');

const facultySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Faculty name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: [true, 'Department is required']
  },
  designation: {
    type: String,
    required: [true, 'Designation is required'],
    enum: [
      'Professor',
      'Associate Professor',
      'Assistant Professor',
      'Lecturer',
      'Instructor',
      'Visiting Faculty',
      'Head of Department',
      'Dean',
      'Vice Chancellor',
      'Research Scholar'
    ]
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    trim: true,
    match: [/^\+?[\d\s\-\(\)]{10,}$/, 'Please enter a valid phone number']
  },
  image: {
    type: String,
    default: ''
  },
  education: {
    type: String,
    trim: true,
    maxlength: [200, 'Education info cannot exceed 200 characters']
  },
  specialization: {
    type: String,
    trim: true,
    maxlength: [150, 'Specialization cannot exceed 150 characters']
  },
  bio: {
    type: String,
    trim: true,
    maxlength: [1000, 'Bio cannot exceed 1000 characters']
  },
  researchInterest: {
    type: String,
    trim: true,
    maxlength: [300, 'Research interests cannot exceed 300 characters']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  joiningDate: {
    type: Date,
    default: Date.now
  },
  experience: {
    type: String,
    trim: true
  },
  publications: [{
    title: String,
    journal: String,
    year: Number,
    link: String
  }],
  socialLinks: {
    linkedin: String,
    googleScholar: String,
    researchGate: String,
    website: String
  },
  officeLocation: {
    type: String,
    trim: true
  },
  officeHours: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Index for better query performance
facultySchema.index({ department: 1, isActive: 1 });
facultySchema.index({ email: 1 });
facultySchema.index({ designation: 1 });

// Virtual for formatted phone number
facultySchema.virtual('formattedPhone').get(function() {
  return this.phone ? this.phone.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3') : '';
});

// Instance method to check if faculty is senior
facultySchema.methods.isSeniorFaculty = function() {
  const seniorDesignations = ['Professor', 'Associate Professor', 'Head of Department', 'Dean'];
  return seniorDesignations.includes(this.designation);
};

// Static method to get faculty by department
facultySchema.statics.getByDepartment = function(departmentId) {
  return this.find({ department: departmentId, isActive: true })
    .populate('department', 'name code')
    .sort({ designation: 1, name: 1 });
};

// Static method to get faculty count by department
facultySchema.statics.getDepartmentStats = function() {
  return this.aggregate([
    {
      $match: { isActive: true }
    },
    {
      $group: {
        _id: '$department',
        count: { $sum: 1 },
        professors: {
          $sum: {
            $cond: [{ $in: ['$designation', ['Professor', 'Associate Professor']] }, 1, 0]
          }
        }
      }
    },
    {
      $lookup: {
        from: 'departments',
        localField: '_id',
        foreignField: '_id',
        as: 'departmentInfo'
      }
    },
    {
      $unwind: '$departmentInfo'
    },
    {
      $project: {
        departmentName: '$departmentInfo.name',
        totalFaculty: '$count',
        seniorFaculty: '$professors'
      }
    }
  ]);
};

module.exports = mongoose.model('Faculty', facultySchema);