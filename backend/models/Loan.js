import mongoose from 'mongoose';

const loanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: [true, 'Client User ID is required']
  },
  loanNumber: {
    type: String,
    required: [true, 'Loan number is required'],
    unique: true
  },
  loanType: {
    type: String,
    required: [true, 'Loan type is required']
  },
  lenderName: {
    type: String,
    required: [true, 'Lender name is required']
  },
  principalAmount: {
    type: Number,
    required: [true, 'Principal amount is required'],
    min: [0, 'Principal amount must be positive']
  },
  outstandingBalance: {
    type: Number,
    required: [true, 'Outstanding balance is required'],
    min: [0, 'Outstanding balance must be positive']
  },
  interestRate: {
    type: Number,
    required: [true, 'Interest rate is required'],
    min: [0, 'Interest rate must be positive']
  },
  tenureMonths: {
    type: Number,
    required: [true, 'Tenure in months is required'],
    min: [1, 'Tenure must be at least 1 month']
  },
  monthlyEMI: {
    type: Number,
    required: [true, 'Monthly EMI is required'],
    min: [0, 'Monthly EMI must be positive']
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  status: {
    type: String,
    enum: ['Active', 'Closed', 'Closing Soon'],
    default: 'Active'
  },
  notes: {
    type: String,
    default: ''
  },
  // Soft delete flag — deleted records are hidden but preserved in DB
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index to speed up per-user active loan queries
loanSchema.index({ userId: 1, isActive: 1 });

const Loan = mongoose.model('Loan', loanSchema);
export default Loan;
