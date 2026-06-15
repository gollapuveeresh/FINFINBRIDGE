// Shared helpers that unify the recommendation → proposal → approval → invoice →
// payment-gated workflow across ALL departments (loans, tax, investment, insurance, wealth).
import LoanCase from '../models/LoanCase.js';
import { TaxCase, InvestmentCase, InsuranceCase, WealthCase } from '../models/DeptCases.js';
import Invoice from '../models/Invoice.js';
import Notification from '../models/Notification.js';

// Department key → Mongoose model
export const DEPT_MODEL = {
  loans:      LoanCase,
  tax:        TaxCase,
  investment: InvestmentCase,
  insurance:  InsuranceCase,
  wealth:     WealthCase,
};

// Department key → Mongoose model name (stored on Proposal.caseModel)
export const MODEL_NAME = {
  loans:      'LoanCase',
  tax:        'TaxCase',
  investment: 'InvestmentCase',
  insurance:  'InsuranceCase',
  wealth:     'WealthCase',
};

// Service fee charged once the client approves a recommendation.
export const SERVICE_PRICING = {
  loans:      { title: 'Loan Processing & Advisory Fee',         amount: 7999 },
  tax:        { title: 'Tax Filing & Advisory Service',          amount: 4999 },
  investment: { title: 'Investment Portfolio Advisory Service',  amount: 9999 },
  insurance:  { title: 'Insurance Advisory & Policy Service',    amount: 2999 },
  wealth:     { title: 'Wealth Management Advisory Service',      amount: 14999 },
};

// Stages that may only be entered AFTER the client has paid the invoice.
export const POST_APPROVAL_STAGES = {
  loans:      ['bank_processing', 'loan_disbursement', 'emi_tracking'],
  tax:        ['return_filing', 'completion'],
  investment: ['investment_execution', 'portfolio_monitoring', 'periodic_reviews'],
  insurance:  ['policy_purchase', 'renewal_tracking'],
  wealth:     ['portfolio_creation', 'continuous_monitoring', 'quarterly_reviews'],
};

// Map a client-facing proposal status back to the case clientDecision status.
export const PROPOSAL_TO_DECISION = {
  approved:          'Approved',
  changes_requested: 'Changes Requested',
  rejected:          'Rejected',
};

// The stage a case moves into once the client has PAID (the first post-approval stage).
export const NEXT_STAGE_AFTER_PAYMENT = {
  loans:      'bank_processing',
  tax:        'return_filing',
  investment: 'investment_execution',
  insurance:  'policy_purchase',
  wealth:     'portfolio_creation',
};

const idOf = (v) => (v && v._id ? v._id : v);

// Returns the case's existing invoice, or creates one (idempotent). Links the
// invoice to the case, and notifies the client that payment is required.
export const ensureInvoiceForCase = async (dept, caseDoc) => {
  if (caseDoc.invoiceId) {
    const existing = await Invoice.findById(caseDoc.invoiceId);
    if (existing) return existing;
  }

  const svc      = SERVICE_PRICING[dept] || { title: 'Advisory Service', amount: 4999 };
  const subtotal = svc.amount;
  const tax      = Math.round(subtotal * 0.18);
  const clientId = idOf(caseDoc.clientId);

  const invoice = await Invoice.create({
    clientId,
    consultantId: idOf(caseDoc.consultantId),
    proposalId:   caseDoc.proposalId || null,
    department:   dept,
    serviceTitle: svc.title,
    lineItems:    [{ description: svc.title, amount: subtotal }],
    subtotal,
    tax,
    taxPercent:   18,
    totalAmount:  subtotal + tax,
    status:       'sent',
    dueDate:      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  const Model = DEPT_MODEL[dept];
  if (Model) await Model.findByIdAndUpdate(caseDoc._id, { invoiceId: invoice._id });

  await Notification.create({
    userId:    clientId,
    userModel: 'Client',
    type:      'invoice_created',
    title:     'Invoice Ready — Payment Required',
    message:   `Your proposal has been approved! Please pay ₹${invoice.totalAmount.toLocaleString('en-IN')} to activate the service.`,
    metadata:  { invoiceId: invoice._id },
  });

  return invoice;
};

// True when the case's linked invoice is fully paid.
export const isCasePaid = async (caseDoc) => {
  if (!caseDoc.invoiceId) return false;
  const inv = await Invoice.findById(caseDoc.invoiceId);
  return !!inv && inv.status === 'paid';
};

// After a successful payment, advance the linked case past the payment gate into
// the first post-approval stage. Idempotent — only advances a case still sitting
// at client_approval. Resolves the case via case.invoiceId, and falls back to the
// Proposal (which stores invoiceId + caseId) when the case link wasn't persisted.
// Returns the updated case (or null).
export const advanceCaseAfterPayment = async (invoice) => {
  if (!invoice || !invoice.department) return null;
  const dept  = invoice.department;
  const Model = DEPT_MODEL[dept];
  const next  = NEXT_STAGE_AFTER_PAYMENT[dept];
  if (!Model || !next) return null;

  let caseDoc = await Model.findOne({ invoiceId: invoice._id });

  // Fallback: locate the case through its proposal (proposal stores invoiceId + caseId).
  if (!caseDoc) {
    const Proposal = (await import('../models/Proposal.js')).default;
    const prop = await Proposal.findOne({ invoiceId: invoice._id });
    if (prop?.caseId) {
      caseDoc = await Model.findById(prop.caseId);
      if (caseDoc && !caseDoc.invoiceId) {
        caseDoc.invoiceId  = invoice._id;
        caseDoc.proposalId = prop._id;
      }
    }
  }

  if (!caseDoc || caseDoc.stage !== 'client_approval') {
    if (caseDoc && caseDoc.isModified && caseDoc.isModified()) await caseDoc.save();
    return null;
  }

  caseDoc.stage = next;
  await caseDoc.save();

  await Notification.create({
    userId:    idOf(caseDoc.consultantId),
    userModel: 'Consultant',
    type:      'payment_success',
    title:     'Payment Received — Workflow Advanced',
    message:   `Client payment confirmed for ${caseDoc.caseId || 'the case'}. The workflow has moved to the next stage.`,
    metadata:  { caseId: caseDoc._id },
  });

  return caseDoc;
};

// Self-heal: for a case still at client_approval, backfill its invoice/proposal
// links and advance it if the invoice is already paid. Mutates the passed Mongoose
// doc in-memory (so callers can return the fresh stage) and persists changes.
// Safe to call on every fetched case — it no-ops unless the case is paid & pending.
export const reconcilePaidCase = async (dept, caseDoc) => {
  if (!caseDoc || caseDoc.stage !== 'client_approval') return;
  const Model = DEPT_MODEL[dept];
  if (!Model) return;

  let invoice = caseDoc.invoiceId ? await Invoice.findById(caseDoc.invoiceId) : null;
  const update = {};

  if (!invoice) {
    const Proposal = (await import('../models/Proposal.js')).default;
    const prop = await Proposal.findOne({ caseId: caseDoc._id, invoiceId: { $ne: null } }).sort({ createdAt: -1 });
    if (prop?.invoiceId) {
      invoice = await Invoice.findById(prop.invoiceId);
      if (invoice) {
        update.invoiceId = invoice._id;  caseDoc.invoiceId  = invoice._id;
        update.proposalId = prop._id;    caseDoc.proposalId = prop._id;
      }
    }
  }

  if (invoice && invoice.status === 'paid') {
    update.stage = NEXT_STAGE_AFTER_PAYMENT[dept];
    caseDoc.stage = update.stage;
  }

  if (Object.keys(update).length) await Model.findByIdAndUpdate(caseDoc._id, update);
};
