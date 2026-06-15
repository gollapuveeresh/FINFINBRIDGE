import mongoose from 'mongoose';

const proposalSchema = new mongoose.Schema({
  leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead' },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
  consultantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Consultant', required: true },
  department: {
    type: String,
    enum: ['loans', 'tax', 'investment', 'insurance', 'wealth'],
    required: true
  },
  title: { type: String, required: true, trim: true },
  summary: { type: String, trim: true },
  details: { type: mongoose.Schema.Types.Mixed, default: {} },
  documents: [{ name: String, url: String }],
  status: {
    type: String,
    enum: ['draft', 'sent', 'approved', 'changes_requested', 'rejected'],
    default: 'draft'
  },
  clientFeedback: { type: String, trim: true },
  invoiceId:       { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice', default: null },
  // Link back to the originating workflow case so a client decision can advance it
  caseId:          { type: mongoose.Schema.Types.ObjectId, default: null },
  caseModel:       { type: String, enum: ['LoanCase','TaxCase','InvestmentCase','InsuranceCase','WealthCase', null], default: null },
  validUntil: { type: Date },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const Proposal = mongoose.model('Proposal', proposalSchema);
export default Proposal;
