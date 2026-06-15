import mongoose from 'mongoose';

const loanProductSchema = new mongoose.Schema({
  bankName: {
    type: String,
    required: [true, 'Bank name is required'],
    trim: true
  },
  loanType: {
    type: String,
    enum: {
      values: ['Personal Loan', 'Home Loan', 'Car Loan', 'Education Loan', 'Business Loan', 'Gold Loan'],
      message: 'Loan type must be Personal Loan, Home Loan, Car Loan, Education Loan, Business Loan, or Gold Loan'
    },
    required: [true, 'Loan type is required']
  },
  minCreditScore: {
    type: Number,
    required: [true, 'Minimum credit score is required'],
    min: [300, 'Minimum credit score is 300'],
    max: [850, 'Maximum credit score is 850']
  },
  maxCreditScore: {
    type: Number,
    required: [true, 'Maximum credit score is required'],
    min: [300, 'Minimum credit score is 300'],
    max: [850, 'Maximum credit score is 850']
  },
  minMonthlyIncome: {
    type: Number,
    required: [true, 'Minimum monthly income is required'],
    min: [0, 'Minimum monthly income must be positive']
  },
  maxLoanAmount: {
    type: Number,
    required: [true, 'Maximum loan amount is required'],
    min: [0, 'Maximum loan amount must be positive']
  },
  interestRate: {
    type: Number,
    required: [true, 'Interest rate is required'],
    min: [0, 'Interest rate must be positive']
  },
  processingFee: {
    type: Number,
    required: [true, 'Processing fee is required'],
    min: [0, 'Processing fee must be positive']
  },
  tenureMonths: {
    type: Number,
    required: [true, 'Tenure in months is required'],
    min: [1, 'Tenure must be at least 1 month']
  },
  description: {
    type: String,
    default: ''
  },
  features: {
    type: [String],
    default: []
  },
  eligibilityCriteria: {
    type: String,
    default: ''
  },
  bankLogo: {
    type: String,
    default: ''
  },
  officialWebsite: {
    type: String,
    default: ''
  },
  preApproved: {
    type: Boolean,
    default: false
  },
  featured: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for fast querying matching products
loanProductSchema.index({ loanType: 1, isActive: 1 });
loanProductSchema.index({ minCreditScore: 1, minMonthlyIncome: 1, isActive: 1 });

const LoanProduct = mongoose.model('LoanProduct', loanProductSchema);
export default LoanProduct;
