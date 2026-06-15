import mongoose from 'mongoose';

const existingLoanSchema = new mongoose.Schema({
  loanType: {
    type: String,
    trim: true,
    required: [true, 'Loan type is required']
  },
  amount: {
    type: Number,
    min: [0, 'Loan amount must be a positive number'],
    default: 0
  },
  monthlyPayment: {
    type: Number,
    min: [0, 'Monthly payment must be a positive number'],
    default: 0
  }
});

const financialProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: [true, 'User (Client) ID is required'],
    unique: true
  },
  assignedConsultant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Consultant',
    default: null
  },
  // Personal Finance
  annualIncome: {
    type: Number,
    min: [0, 'Annual income must be a positive number'],
    default: 0
  },
  monthlyIncome: {
    type: Number,
    min: [0, 'Monthly income must be a positive number'],
    default: 0
  },
  monthlyExpenses: {
    type: Number,
    min: [0, 'Monthly expenses must be a positive number'],
    default: 0
  },
  savings: {
    type: Number,
    min: [0, 'Savings must be a positive number'],
    default: 0
  },
  emergencyFund: {
    type: Number,
    min: [0, 'Emergency fund must be a positive number'],
    default: 0
  },
  // Credit
  creditScore: {
    type: Number,
    min: [300, 'Credit score must be at least 300'],
    max: [850, 'Credit score cannot exceed 850'],
    default: 600
  },
  existingLoans: [existingLoanSchema],
  totalLoanAmount: {
    type: Number,
    min: [0, 'Total loan amount must be a positive number'],
    default: 0
  },
  monthlyEMI: {
    type: Number,
    min: [0, 'Monthly EMI must be a positive number'],
    default: 0
  },
  // Business
  businessName: {
    type: String,
    trim: true,
    default: ''
  },
  businessType: {
    type: String,
    trim: true,
    default: ''
  },
  annualRevenue: {
    type: Number,
    min: [0, 'Annual revenue must be a positive number'],
    default: 0
  },
  annualExpenses: {
    type: Number,
    min: [0, 'Annual expenses must be a positive number'],
    default: 0
  },
  yearsInBusiness: {
    type: Number,
    min: [0, 'Years in business must be a positive number'],
    default: 0
  },
  // Investment
  currentInvestments: {
    type: Number,
    min: [0, 'Current investments must be a positive number'],
    default: 0
  },
  riskTolerance: {
    type: String,
    enum: {
      values: ['Low', 'Medium', 'High'],
      message: 'Risk tolerance must be Low, Medium, or High'
    },
    default: 'Medium'
  },
  investmentGoals: {
    type: [String],
    default: []
  }
}, {
  timestamps: true
});

const FinancialProfile = mongoose.model('FinancialProfile', financialProfileSchema);
export default FinancialProfile;
