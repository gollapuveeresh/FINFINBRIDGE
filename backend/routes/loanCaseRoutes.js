import express from 'express';
import LoanCase from '../models/LoanCase.js';
import Proposal from '../models/Proposal.js';
import Notification from '../models/Notification.js';
import { protect } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/roleMiddleware.js';
import { resolveCaseClient } from '../utils/resolveCaseClient.js';
import { POST_APPROVAL_STAGES, ensureInvoiceForCase, reconcilePaidCase } from '../utils/caseWorkflow.js';

const router = express.Router();
router.use(protect);

// ── Helpers ────────────────────────────────────────────────────────────────────
const genEMISchedule = (startDate, tenureMonths, monthlyEMI) => {
  const schedule = [];
  const start = new Date(startDate);
  for (let i = 0; i < tenureMonths; i++) {
    const due = new Date(start);
    due.setMonth(due.getMonth() + i + 1);
    schedule.push({
      month: due.toLocaleString('en-IN', { month: 'short', year: 'numeric' }),
      dueDate: due,
      amount: monthlyEMI,
      status: 'Pending',
    });
  }
  return schedule;
};

// ── GET /api/loan-cases — consultant gets their cases; dept-admin gets all dept cases ──
router.get('/', authorize('consultant', 'department-admin'), async (req, res) => {
  try {
    const filter = { isActive: true };
    if (req.user.role === 'consultant') filter.consultantId = req.user._id;
    const cases = await LoanCase.find(filter)
      .populate('clientId', 'name email phone')
      .populate('consultantId', 'name email')
      .sort({ createdAt: -1 });
    // Self-heal any case that's been paid but didn't advance (e.g. created before
    // the invoice link existed) so it moves forward on refresh.
    for (const c of cases) { try { await reconcilePaidCase('loans', c); } catch { /* non-fatal */ } }
    res.json({ status: 'success', cases });
  } catch (err) { res.status(500).json({ status: 'error', message: err.message }); }
});

// ── POST /api/loan-cases — create case (consultant only) ────────────────────────
router.post('/', authorize('consultant'), async (req, res) => {
  try {
    const { clientId: rawClientId, leadId, loanType, requestedAmount } = req.body;
    const clientId = await resolveCaseClient({ clientId: rawClientId, leadId });
    if (!clientId || !loanType || !requestedAmount)
      return res.status(400).json({ status: 'error', message: 'clientId/leadId, loanType, requestedAmount required' });

    const lc = await LoanCase.create({
      clientId, leadId: leadId || null,
      consultantId: req.user._id,
      loanType, requestedAmount,
      documents: [
        { name: 'PAN Card',              category: 'KYC' },
        { name: 'Aadhaar Card',          category: 'KYC' },
        { name: 'Last 3 Months Salary Slips', category: 'Income' },
        { name: 'Last 6 Months Bank Statement', category: 'Bank' },
        { name: 'ITR (2 Years)',         category: 'Income' },
        { name: 'Property Documents',   category: 'Property' },
      ],
    });
    const populated = await lc.populate('clientId', 'name email phone');
    res.status(201).json({ status: 'success', loanCase: populated });
  } catch (err) { res.status(500).json({ status: 'error', message: err.message }); }
});

// ── GET /api/loan-cases/:id ──────────────────────────────────────────────────────
router.get('/:id', authorize('consultant', 'department-admin'), async (req, res) => {
  try {
    const lc = await LoanCase.findById(req.params.id)
      .populate('clientId', 'name email phone')
      .populate('consultantId', 'name email');
    if (!lc) return res.status(404).json({ status: 'error', message: 'Case not found' });
    res.json({ status: 'success', loanCase: lc });
  } catch (err) { res.status(500).json({ status: 'error', message: err.message }); }
});

// ── PATCH /api/loan-cases/:id — generic field update ───────────────────────────
router.patch('/:id', authorize('consultant', 'department-admin'), async (req, res) => {
  try {
    const current = await LoanCase.findById(req.params.id);
    if (!current) return res.status(404).json({ status: 'error', message: 'Case not found' });

    const newStage = req.body.stage;

    // PAYMENT GATE: post-approval stages require a paid invoice first.
    if (newStage && POST_APPROVAL_STAGES.loans.includes(newStage)) {
      const Invoice = (await import('../models/Invoice.js')).default;
      const inv = current.invoiceId ? await Invoice.findById(current.invoiceId) : null;
      if (!inv || inv.status !== 'paid') {
        return res.status(402).json({ status: 'error', message: 'Payment required before proceeding. The client must pay the invoice first.' });
      }
    }

    const allowed = ['stage','loanType','requestedAmount','approvedAmount','interestRate',
      'tenureMonths','monthlyEMI','bankName','disbursedDate','disbursedAmount',
      'eligibility','recommendation','clientDecision','bankProcessing'];
    const updates = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });
    const lc = await LoanCase.findByIdAndUpdate(req.params.id, updates, { new: true })
      .populate('clientId', 'name email phone');

    // AUTO-CREATE PROPOSAL when the recommendation is sent (stage → client_approval).
    // This pushes the loan recommendation to the client's dashboard + Proposals page.
    if (newStage === 'client_approval' && current.stage !== 'client_approval' && lc.clientId) {
      try {
        const rec = lc.recommendation || {};
        const details = {};
        if (rec.recommendedBank)   details['Recommended Bank']  = rec.recommendedBank;
        if (lc.requestedAmount)     details['Loan Amount']       = `₹${Number(lc.requestedAmount).toLocaleString('en-IN')}`;
        if (rec.recommendedRate)   details['Interest Rate']     = `${rec.recommendedRate}% p.a.`;
        if (rec.recommendedTenure) details['Tenure']            = `${rec.recommendedTenure} months`;
        if (rec.recommendedEMI)    details['Monthly EMI']       = `₹${Number(rec.recommendedEMI).toLocaleString('en-IN')}`;

        const proposal = await Proposal.create({
          clientId:     lc.clientId._id,
          consultantId: lc.consultantId,
          department:   'loans',
          title:        `Loan Recommendation — ${lc.loanType || 'Loan'}`,
          summary:      rec.note || 'Your loan advisor has prepared a recommendation for your review. Please approve to proceed.',
          details,
          status:       'sent',
          caseId:       lc._id,
          caseModel:    'LoanCase',
        });

        await LoanCase.findByIdAndUpdate(lc._id, { proposalId: proposal._id });

        await Notification.create({
          userId:    lc.clientId._id,
          userModel: 'Client',
          type:      'proposal_created',
          title:     'New Loan Recommendation Ready',
          message:   'Your loan advisor has sent a recommendation for your approval. Check Proposals in your dashboard.',
          metadata:  { proposalId: proposal._id },
        });
      } catch (e) { console.error('[loanCases] auto-proposal error:', e.message); }
    }

    // AUTO-CREATE INVOICE when the decision is approved (offline/consultant-recorded path).
    const decision = req.body.clientDecision;
    if (decision?.status === 'Approved' && current.clientDecision?.status !== 'Approved' && lc.clientId) {
      try {
        await ensureInvoiceForCase('loans', lc);
      } catch (e) { console.error('[loanCases] auto-invoice error:', e.message); }
    }

    res.json({ status: 'success', loanCase: lc });
  } catch (err) { res.status(500).json({ status: 'error', message: err.message }); }
});

// ── PATCH /api/loan-cases/:id/document/:docId — update single doc status ───────
router.patch('/:id/document/:docId', authorize('consultant', 'department-admin'), async (req, res) => {
  try {
    const { status, rejectionNote } = req.body;
    const lc = await LoanCase.findById(req.params.id);
    if (!lc) return res.status(404).json({ status: 'error', message: 'Case not found' });
    const doc = lc.documents.id(req.params.docId);
    if (!doc) return res.status(404).json({ status: 'error', message: 'Document not found' });
    doc.status = status;
    if (status === 'Uploaded') doc.uploadedAt = new Date();
    if (rejectionNote) doc.rejectionNote = rejectionNote;
    await lc.save();
    res.json({ status: 'success', loanCase: lc });
  } catch (err) { res.status(500).json({ status: 'error', message: err.message }); }
});

// ── POST /api/loan-cases/:id/disburse — generate EMI schedule on disbursement ──
router.post('/:id/disburse', authorize('consultant'), async (req, res) => {
  try {
    const { disbursedAmount, disbursedDate, monthlyEMI, tenureMonths, interestRate, bankName } = req.body;
    const lc = await LoanCase.findById(req.params.id);
    if (!lc) return res.status(404).json({ status: 'error', message: 'Case not found' });

    lc.disbursedAmount = disbursedAmount;
    lc.disbursedDate   = disbursedDate || new Date();
    lc.monthlyEMI      = monthlyEMI;
    lc.tenureMonths    = tenureMonths;
    lc.interestRate    = interestRate;
    lc.bankName        = bankName || lc.bankName;
    lc.stage           = 'emi_tracking';
    lc.emiSchedule     = genEMISchedule(lc.disbursedDate, tenureMonths, monthlyEMI);
    await lc.save();
    const populated = await lc.populate('clientId', 'name email phone');
    res.json({ status: 'success', loanCase: populated });
  } catch (err) { res.status(500).json({ status: 'error', message: err.message }); }
});

// ── PATCH /api/loan-cases/:id/emi/:emiId — mark EMI paid/overdue ───────────────
router.patch('/:id/emi/:emiId', authorize('consultant', 'department-admin'), async (req, res) => {
  try {
    const { status, paidDate, penalty } = req.body;
    const lc = await LoanCase.findById(req.params.id);
    if (!lc) return res.status(404).json({ status: 'error', message: 'Case not found' });
    const emi = lc.emiSchedule.id(req.params.emiId);
    if (!emi) return res.status(404).json({ status: 'error', message: 'EMI record not found' });
    emi.status  = status;
    if (paidDate) emi.paidDate = paidDate;
    if (penalty !== undefined) emi.penalty = penalty;
    await lc.save();
    res.json({ status: 'success', loanCase: lc });
  } catch (err) { res.status(500).json({ status: 'error', message: err.message }); }
});

// ── POST /api/loan-cases/:id/note ─────────────────────────────────────────────
router.post('/:id/note', authorize('consultant', 'department-admin'), async (req, res) => {
  try {
    const lc = await LoanCase.findByIdAndUpdate(
      req.params.id,
      { $push: { notes: { text: req.body.text, addedBy: req.user?.name || 'Consultant' } } },
      { new: true }
    );
    if (!lc) return res.status(404).json({ status: 'error', message: 'Case not found' });
    res.json({ status: 'success', loanCase: lc });
  } catch (err) { res.status(500).json({ status: 'error', message: err.message }); }
});

export default router;
