const mongoose = require('mongoose');

const ClauseSchema = new mongoose.Schema({
  clauseText: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ['Privacy', 'Financial', 'Rights', 'Termination', 'Jurisdiction', 'Liability', 'Other'],
    required: true,
  },
  riskLevel: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    required: true,
  },
  explanation: {
    type: String,
    required: true,
  },
  suggestedFix: {
    type: String,
  },
  location: {
    type: String, // Section or line reference
  },
});

const AnalysisSchema = new mongoose.Schema({
  overallScore: {
    type: Number,
    min: 0,
    max: 100,
    required: true,
  },
  summary: {
    type: String,
    required: true,
  },
  risks: [ClauseSchema],
  redFlags: {
    dataSovereignty: { type: Boolean, default: false },
    hiddenBilling: { type: Boolean, default: false },
    jurisdiction: { type: Boolean, default: false },
    liabilityShift: { type: Boolean, default: false },
    unilateralChanges: { type: Boolean, default: false },
  },
  analyzedAt: {
    type: Date,
    default: Date.now,
  },
});

const DocumentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  sourceType: {
    type: String,
    enum: ['text', 'pdf', 'url'],
    required: true,
  },
  originalText: {
    type: String,
    required: true,
  },
  analysis: AnalysisSchema,
  metadata: {
    fileSize: Number,
    pageCount: Number,
    url: String,
    mimeType: String,
  },
  tags: [String],
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

// Text index for search functionality
DocumentSchema.index({ originalText: 'text', title: 'text' });

// Compound index for user's documents sorted by date
DocumentSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Document', DocumentSchema);
