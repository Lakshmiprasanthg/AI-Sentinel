const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  username: {
    type: String,
    required: true,
    trim: true,
  },
  password: {
    type: String,
    // Not required because Google OAuth users won't have a password
  },
  googleId: {
    type: String,
    sparse: true, // Allows null values while maintaining uniqueness
  },
  avatar: {
    type: String,
  },
  dailyAnalysisCount: {
    type: Number,
    default: 0,
  },
  lastAnalysisReset: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Reset daily analysis count if it's a new day
UserSchema.methods.checkDailyLimit = function() {
  const now = new Date();
  const lastReset = new Date(this.lastAnalysisReset);
  
  // Reset if it's a new day
  if (now.getDate() !== lastReset.getDate() || 
      now.getMonth() !== lastReset.getMonth() || 
      now.getFullYear() !== lastReset.getFullYear()) {
    this.dailyAnalysisCount = 0;
    this.lastAnalysisReset = now;
  }
  
  return this.dailyAnalysisCount < parseInt(process.env.DAILY_ANALYSIS_LIMIT || 50);
};

UserSchema.methods.incrementAnalysisCount = async function() {
  this.dailyAnalysisCount += 1;
  await this.save();
};

module.exports = mongoose.model('User', UserSchema);
