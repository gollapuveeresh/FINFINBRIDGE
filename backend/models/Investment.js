import mongoose from 'mongoose';

const investmentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: [true, 'Client User ID is required']
  },
  investmentType: {
    type: String,
    enum: [
      'Mutual Fund',
      'Stock',
      'Gold',
      'Fixed Deposit',
      'Real Estate',
      'ETF',
      'Bond',
      'Crypto',
      'PPF',
      'EPF',
      'NPS',
      'SIP',
      'ULIP',
      'Others'
    ],
    required: [true, 'Investment type is required']
  },
  amountInvested: {
    type: Number,
    required: [true, 'Amount invested is required'],
    min: [0, 'Amount invested must be positive']
  },
  currentValue: {
    type: Number,
    required: [true, 'Current value is required'],
    min: [0, 'Current value must be positive']
  },
  purchaseDate: {
    type: Date,
    required: [true, 'Purchase date is required']
  },
  riskLevel: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    required: [true, 'Risk level is required']
  },
  notes: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for performance querying active records per user
investmentSchema.index({ userId: 1, isActive: 1 });

const Investment = mongoose.model('Investment', investmentSchema);
export default Investment;
