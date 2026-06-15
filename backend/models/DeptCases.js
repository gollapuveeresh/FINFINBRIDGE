import mongoose from 'mongoose';

// Reusable note subdoc
const noteSchema = { text: String, addedBy: String, addedAt: { type: Date, default: Date.now } };

// ── TAX CASE ──────────────────────────────────────────────────────────────────
const taxCaseSchema = new mongoose.Schema({
  caseId:       { type: String, unique: true },
  clientId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Client',     required: true },
  consultantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Consultant', required: true },
  leadId:       { type: mongoose.Schema.Types.ObjectId, ref: 'Lead',       default: null },
  stage: {
    type: String,
    enum: ['document_collection','tax_analysis','tax_saving_recommendations','client_approval','return_filing','completion'],
    default: 'document_collection',
  },
  financialYear: { type: String, default: '' },         // e.g. "FY 2024-25"
  filingType:    { type: String, default: 'ITR-1' },    // ITR-1, ITR-2, etc.
  totalIncome:   { type: Number, default: null },
  taxLiability:  { type: Number, default: null },
  taxSaved:      { type: Number, default: null },
  refundAmount:  { type: Number, default: null },

  documents: [{
    name:     { type: String, required: true },
    category: { type: String, enum: ['Income','Investment','Property','Other'], default: 'Other' },
    status:   { type: String, enum: ['Pending','Uploaded','Verified','Rejected'], default: 'Pending' },
    uploadedAt:    { type: Date, default: null },
    rejectionNote: { type: String, default: '' },
  }],

  analysis: {
    grossIncome:    { type: Number, default: null },
    deductions80C:  { type: Number, default: null },
    deductions80D:  { type: Number, default: null },
    otherDeductions:{ type: Number, default: null },
    taxableIncome:  { type: Number, default: null },
    taxPayable:     { type: Number, default: null },
    analystNote:    { type: String, default: '' },
  },

  recommendations: [{
    section:     String,   // 80C, 80D, 80G etc.
    description: String,
    maxLimit:    Number,
    potentialSaving: Number,
  }],

  clientDecision: {
    status:    { type: String, enum: ['Pending','Approved','Rejected','Changes Requested'], default: 'Pending' },
    feedback:  { type: String, default: '' },
    decidedAt: { type: Date, default: null },
  },

  filing: {
    ackNumber:   { type: String, default: '' },
    filedDate:   { type: Date,   default: null },
    filedBy:     { type: String, default: '' },
    portalRef:   { type: String, default: '' },
    status:      { type: String, enum: ['Not Filed','Filed','Processing','Processed','Defective'], default: 'Not Filed' },
    refundStatus:{ type: String, enum: ['NA','Pending','Initiated','Credited'], default: 'NA' },
  },

  proposalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Proposal', default: null },
  invoiceId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice',  default: null },
  notes:    [noteSchema],
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

taxCaseSchema.pre('save', async function (next) {
  if (!this.caseId) {
    const count = await mongoose.model('TaxCase').countDocuments();
    this.caseId = `TC-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

// ── INVESTMENT CASE ───────────────────────────────────────────────────────────
const investmentCaseSchema = new mongoose.Schema({
  caseId:       { type: String, unique: true },
  clientId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Client',     required: true },
  consultantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Consultant', required: true },
  leadId:       { type: mongoose.Schema.Types.ObjectId, ref: 'Lead',       default: null },
  stage: {
    type: String,
    enum: ['risk_assessment','portfolio_design','client_approval','investment_execution','portfolio_monitoring','periodic_reviews'],
    default: 'risk_assessment',
  },
  investmentGoal:   { type: String, default: '' },
  investmentAmount: { type: Number, default: 0 },
  horizon:          { type: String, default: '' },   // "5 years", "10 years"

  riskAssessment: {
    riskScore:     { type: Number, default: null },   // 1-10
    riskProfile:   { type: String, enum: ['Conservative','Moderate','Aggressive',''], default: '' },
    monthlyIncome: { type: Number, default: null },
    existingAssets:{ type: Number, default: null },
    liabilities:   { type: Number, default: null },
    note:          { type: String, default: '' },
  },

  portfolio: [{
    assetClass:  String,   // Equity, Debt, Gold, Real Estate
    instrument:  String,   // HDFC Top 100, SGB, etc.
    allocation:  Number,   // % allocation
    amount:      Number,
    expectedReturn: Number,
  }],

  clientDecision: {
    status:    { type: String, enum: ['Pending','Approved','Rejected','Changes Requested'], default: 'Pending' },
    feedback:  { type: String, default: '' },
    decidedAt: { type: Date, default: null },
  },

  execution: {
    startedDate:  { type: Date,   default: null },
    platformUsed: { type: String, default: '' },
    status:       { type: String, enum: ['Not Started','In Progress','Completed'], default: 'Not Started' },
    transactions: [{
      date:       Date,
      instrument: String,
      amount:     Number,
      units:      Number,
      nav:        Number,
      type:       { type: String, enum: ['Buy','Sell','SIP'] },
    }],
  },

  monitoring: {
    currentValue:  { type: Number, default: null },
    absoluteReturn:{ type: Number, default: null },
    xirr:          { type: Number, default: null },
    lastUpdated:   { type: Date,   default: null },
  },

  reviews: [{
    date:         Date,
    portfolioValue: Number,
    returns:      Number,
    rebalanced:   Boolean,
    notes:        String,
  }],

  proposalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Proposal', default: null },
  invoiceId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice',  default: null },
  notes:    [noteSchema],
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

investmentCaseSchema.pre('save', async function (next) {
  if (!this.caseId) {
    const count = await mongoose.model('InvestmentCase').countDocuments();
    this.caseId = `IC-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

// ── INSURANCE CASE ────────────────────────────────────────────────────────────
const insuranceCaseSchema = new mongoose.Schema({
  caseId:       { type: String, unique: true },
  clientId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Client',     required: true },
  consultantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Consultant', required: true },
  leadId:       { type: mongoose.Schema.Types.ObjectId, ref: 'Lead',       default: null },
  stage: {
    type: String,
    enum: ['policy_comparison','recommendation','client_approval','policy_purchase','renewal_tracking'],
    default: 'policy_comparison',
  },
  insuranceType:  { type: String, default: '' },    // Life, Health, Term, Motor
  coverageNeeded: { type: Number, default: 0 },

  requirement: {
    age:          { type: Number, default: null },
    sumAssured:   { type: Number, default: null },
    annualIncome: { type: Number, default: null },
    dependents:   { type: Number, default: null },
    medicalHistory: { type: String, default: '' },
    note:         { type: String, default: '' },
  },

  comparisons: [{
    insurer:      String,
    planName:     String,
    premium:      Number,          // annual
    coverAmount:  Number,
    tenure:       Number,          // years
    keyFeatures:  String,
    rating:       Number,          // 1-5
  }],

  recommendation: {
    selectedPlan:    { type: String, default: '' },
    insurer:         { type: String, default: '' },
    premium:         { type: Number, default: null },
    coverAmount:     { type: Number, default: null },
    tenure:          { type: Number, default: null },
    rationale:       { type: String, default: '' },
    sentToClient:    { type: Boolean, default: false },
  },

  clientDecision: {
    status:    { type: String, enum: ['Pending','Approved','Rejected','Changes Requested'], default: 'Pending' },
    feedback:  { type: String, default: '' },
    decidedAt: { type: Date, default: null },
  },

  policy: {
    policyNumber:  { type: String, default: '' },
    insurer:       { type: String, default: '' },
    startDate:     { type: Date,   default: null },
    endDate:       { type: Date,   default: null },
    premiumAmount: { type: Number, default: null },
    paymentMode:   { type: String, enum: ['Monthly','Quarterly','Half-Yearly','Annual',''], default: '' },
    status:        { type: String, enum: ['Active','Lapsed','Cancelled','Expired',''], default: '' },
  },

  renewals: [{
    renewalDate:   Date,
    premiumDue:    Number,
    premiumPaid:   Number,
    paidDate:      Date,
    status:        { type: String, enum: ['Pending','Paid','Overdue','Lapsed'] },
    reminderSent:  { type: Boolean, default: false },
  }],

  proposalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Proposal', default: null },
  invoiceId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice',  default: null },
  notes:    [noteSchema],
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

insuranceCaseSchema.pre('save', async function (next) {
  if (!this.caseId) {
    const count = await mongoose.model('InsuranceCase').countDocuments();
    this.caseId = `INS-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

// ── WEALTH CASE ───────────────────────────────────────────────────────────────
const wealthCaseSchema = new mongoose.Schema({
  caseId:       { type: String, unique: true },
  clientId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Client',     required: true },
  consultantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Consultant', required: true },
  leadId:       { type: mongoose.Schema.Types.ObjectId, ref: 'Lead',       default: null },
  stage: {
    type: String,
    enum: ['financial_assessment','goal_planning','asset_allocation','client_approval','portfolio_creation','continuous_monitoring','quarterly_reviews'],
    default: 'financial_assessment',
  },
  aum:          { type: Number, default: 0 },

  assessment: {
    netWorth:        { type: Number, default: null },
    annualIncome:    { type: Number, default: null },
    liquidAssets:    { type: Number, default: null },
    realEstate:      { type: Number, default: null },
    liabilities:     { type: Number, default: null },
    riskProfile:     { type: String, enum: ['Conservative','Moderate','Aggressive',''], default: '' },
    note:            { type: String, default: '' },
  },

  goals: [{
    goalName:    String,
    targetAmount:Number,
    targetYear:  Number,
    priority:    { type: String, enum: ['High','Medium','Low'] },
    status:      { type: String, enum: ['On Track','At Risk','Achieved'], default: 'On Track' },
  }],

  assetAllocation: [{
    assetClass:  String,
    allocation:  Number,  // %
    currentValue:Number,
    targetValue: Number,
  }],

  clientDecision: {
    status:    { type: String, enum: ['Pending','Approved','Rejected','Changes Requested'], default: 'Pending' },
    feedback:  { type: String, default: '' },
    decidedAt: { type: Date, default: null },
  },

  portfolio: {
    createdDate:   { type: Date,   default: null },
    totalValue:    { type: Number, default: null },
    absoluteReturn:{ type: Number, default: null },
    xirr:          { type: Number, default: null },
    lastRebalanced:{ type: Date,   default: null },
  },

  quarterlyReviews: [{
    quarter:        String,
    date:           Date,
    portfolioValue: Number,
    returns:        Number,
    goalsProgress:  String,
    rebalanced:     Boolean,
    notes:          String,
  }],

  proposalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Proposal', default: null },
  invoiceId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice',  default: null },
  notes:    [noteSchema],
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

wealthCaseSchema.pre('save', async function (next) {
  if (!this.caseId) {
    const count = await mongoose.model('WealthCase').countDocuments();
    this.caseId = `WC-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

export const TaxCase        = mongoose.model('TaxCase',        taxCaseSchema);
export const InvestmentCase = mongoose.model('InvestmentCase', investmentCaseSchema);
export const InsuranceCase  = mongoose.model('InsuranceCase',  insuranceCaseSchema);
export const WealthCase     = mongoose.model('WealthCase',     wealthCaseSchema);
