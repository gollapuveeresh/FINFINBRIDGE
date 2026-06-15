import mongoose from 'mongoose';

const emiPaymentSchema = new mongoose.Schema({
  month:       { type: String, required: true },      // e.g. "Aug 2025"
  dueDate:     { type: Date,   required: true },
  amount:      { type: Number, required: true },
  paidDate:    { type: Date,   default: null },
  status:      { type: String, enum: ['Pending','Paid','Overdue'], default: 'Pending' },
  penalty:     { type: Number, default: 0 },
});

const loanCaseSchema = new mongoose.Schema({
  caseId:      { type: String, unique: true },
  clientId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Client',     required: true },
  consultantId:{ type: mongoose.Schema.Types.ObjectId, ref: 'Consultant', required: true },
  leadId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Lead',       default: null },

  // Pipeline stage
  stage: {
    type: String,
    enum: [
      'document_collection',
      'eligibility_analysis',
      'loan_recommendation',
      'client_approval',
      'bank_processing',
      'loan_disbursement',
      'emi_tracking',
    ],
    default: 'document_collection',
  },

  // Loan details
  loanType:        { type: String, default: '' },          // Home, Personal, Business...
  requestedAmount: { type: Number, default: 0 },
  approvedAmount:  { type: Number, default: null },
  interestRate:    { type: Number, default: null },        // % p.a.
  tenureMonths:    { type: Number, default: null },
  monthlyEMI:      { type: Number, default: null },
  bankName:        { type: String, default: '' },
  disbursedDate:   { type: Date,   default: null },
  disbursedAmount: { type: Number, default: null },

  // Document checklist
  documents: [{
    name:       { type: String, required: true },
    category:   { type: String, enum: ['KYC','Income','Property','Bank','Other'], default: 'Other' },
    status:     { type: String, enum: ['Pending','Uploaded','Verified','Rejected'], default: 'Pending' },
    uploadedAt: { type: Date, default: null },
    rejectionNote: { type: String, default: '' },
  }],

  // Eligibility analysis
  eligibility: {
    creditScore:    { type: Number, default: null },
    dti:            { type: Number, default: null },   // Debt-to-income %
    ltv:            { type: Number, default: null },   // Loan-to-value %
    eligible:       { type: Boolean, default: null },
    analystNote:    { type: String,  default: '' },
  },

  // Recommendation
  recommendation: {
    recommendedBank:   { type: String, default: '' },
    recommendedRate:   { type: Number, default: null },
    recommendedTenure: { type: Number, default: null },
    recommendedEMI:    { type: Number, default: null },
    note:              { type: String, default: '' },
    sentToClient:      { type: Boolean, default: false },
  },

  // Client approval
  clientDecision: {
    status:    { type: String, enum: ['Pending','Approved','Rejected','Changes Requested'], default: 'Pending' },
    feedback:  { type: String, default: '' },
    decidedAt: { type: Date,   default: null },
  },

  // Bank processing
  bankProcessing: {
    applicationRef: { type: String, default: '' },
    submittedDate:  { type: Date,   default: null },
    status:         { type: String, enum: ['Not Submitted','Submitted','Under Review','Sanctioned','Rejected'], default: 'Not Submitted' },
    sanctionedAt:   { type: Date,   default: null },
    remarks:        { type: String, default: '' },
  },

  // EMI schedule
  emiSchedule: [emiPaymentSchema],

  // Links to the client-facing proposal + payment invoice (drives the payment gate)
  proposalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Proposal', default: null },
  invoiceId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice',  default: null },

  notes: [{ text: String, addedBy: String, addedAt: { type: Date, default: Date.now } }],
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

loanCaseSchema.pre('save', async function (next) {
  if (!this.caseId) {
    const count = await mongoose.model('LoanCase').countDocuments();
    this.caseId = `LC-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

const LoanCase = mongoose.model('LoanCase', loanCaseSchema);
export default LoanCase;
