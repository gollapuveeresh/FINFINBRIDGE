import mongoose from 'mongoose';

const investmentHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: [true, 'Client User ID is required']
  },
  portfolioValue: {
    type: Number,
    required: [true, 'Portfolio value is required'],
    min: [0, 'Portfolio value must be positive']
  },
  recordedDate: {
    type: String,
    required: [true, 'Recorded date string (YYYY-MM-DD) is required']
  },
  recordedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Enforce unique snapshots per user per day to avoid duplication and race conditions
investmentHistorySchema.index({ userId: 1, recordedDate: 1 }, { unique: true });

const InvestmentHistory = mongoose.model('InvestmentHistory', investmentHistorySchema);
export default InvestmentHistory;
