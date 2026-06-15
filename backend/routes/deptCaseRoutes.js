import express from 'express';
import { TaxCase, InvestmentCase, InsuranceCase, WealthCase } from '../models/DeptCases.js';
import { protect } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/roleMiddleware.js';
import { resolveCaseClient } from '../utils/resolveCaseClient.js';
import { MODEL_NAME, reconcilePaidCase } from '../utils/caseWorkflow.js';

const router = express.Router();
router.use(protect, authorize('consultant', 'department-admin'));

const MODEL = {
  tax:        TaxCase,
  investment: InvestmentCase,
  insurance:  InsuranceCase,
  wealth:     WealthCase,
};

const DEFAULT_DOCS = {
  tax: [
    { name: 'Form 16 / Salary Certificate', category: 'Income' },
    { name: 'Bank Statement (FY)',           category: 'Income' },
    { name: 'Investment Proofs (80C)',        category: 'Investment' },
    { name: 'Health Insurance Premium (80D)',category: 'Investment' },
    { name: 'Home Loan Interest Certificate',category: 'Property' },
    { name: 'Aadhaar & PAN',                 category: 'Other' },
  ],
  investment: [],
  insurance:  [],
  wealth:     [],
};

// Stages that require payment before they can be manually advanced to
const POST_APPROVAL_STAGES = {
  tax:        ['return_filing', 'completion'],
  investment: ['investment_execution', 'portfolio_monitoring', 'periodic_reviews'],
  insurance:  ['policy_purchase', 'renewal_tracking'],
  wealth:     ['portfolio_creation', 'continuous_monitoring', 'quarterly_reviews'],
};

// ── GET /api/dept-cases/:dept ─────────────────────────────────────────────────
router.get('/:dept', async (req, res) => {
  try {
    const Model = MODEL[req.params.dept];
    if (!Model) return res.status(400).json({ status: 'error', message: 'Invalid department' });
    const filter = { isActive: true };
    if (req.user.role === 'consultant') filter.consultantId = req.user._id;
    const cases = await Model.find(filter)
      .populate('clientId',     'name email phone')
      .populate('consultantId', 'name email')
      .sort({ createdAt: -1 });
    // Self-heal: advance any case that's been paid but didn't move forward.
    for (const c of cases) { try { await reconcilePaidCase(req.params.dept, c); } catch { /* non-fatal */ } }
    res.json({ status: 'success', cases });
  } catch (err) { res.status(500).json({ status: 'error', message: err.message }); }
});

// ── POST /api/dept-cases/:dept ────────────────────────────────────────────────
router.post('/:dept', async (req, res) => {
  try {
    const Model = MODEL[req.params.dept];
    if (!Model) return res.status(400).json({ status: 'error', message: 'Invalid department' });
    const { clientId: rawClientId, leadId, ...rest } = req.body;
    const clientId = await resolveCaseClient({ clientId: rawClientId, leadId });
    if (!clientId) return res.status(400).json({ status: 'error', message: 'clientId or leadId required' });
    const docs = DEFAULT_DOCS[req.params.dept] || [];
    const lc = await Model.create({
      clientId, leadId: leadId || null,
      consultantId: req.user._id,
      ...rest,
      ...(docs.length ? { documents: docs } : {}),
    });
    const populated = await lc.populate('clientId', 'name email phone');
    res.status(201).json({ status: 'success', case: populated });
  } catch (err) { res.status(500).json({ status: 'error', message: err.message }); }
});

// ── GET /api/dept-cases/:dept/:id ─────────────────────────────────────────────
router.get('/:dept/:id', async (req, res) => {
  try {
    const Model = MODEL[req.params.dept];
    if (!Model) return res.status(400).json({ status: 'error', message: 'Invalid department' });
    const lc = await Model.findById(req.params.id)
      .populate('clientId',     'name email phone')
      .populate('consultantId', 'name email');
    if (!lc) return res.status(404).json({ status: 'error', message: 'Case not found' });
    res.json({ status: 'success', case: lc });
  } catch (err) { res.status(500).json({ status: 'error', message: err.message }); }
});

// ── PATCH /api/dept-cases/:dept/:id ──────────────────────────────────────────
router.patch('/:dept/:id', async (req, res) => {
  try {
    const Model = MODEL[req.params.dept];
    if (!Model) return res.status(400).json({ status: 'error', message: 'Invalid department' });

    const current  = await Model.findById(req.params.id);
    if (!current) return res.status(404).json({ status: 'error', message: 'Case not found' });

    const dept     = req.params.dept;
    const newStage = req.body.stage;

    // PAYMENT GATE — block manual advance past client_approval until invoice is paid
    if (newStage && (POST_APPROVAL_STAGES[dept] || []).includes(newStage)) {
      const Invoice = (await import('../models/Invoice.js')).default;
      const inv     = current.invoiceId ? await Invoice.findById(current.invoiceId) : null;
      if (!inv || inv.status !== 'paid') {
        return res.status(402).json({
          status:  'error',
          message: 'Payment required. The client must pay the invoice before this step can proceed.',
        });
      }
    }

    // Apply updates
    const lc = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('clientId', 'name email phone');

    // AUTO-CREATE PROPOSAL when stage first becomes client_approval
    if (
      newStage === 'client_approval' &&
      current.stage !== 'client_approval' &&
      lc.clientId &&
      !current.proposalId
    ) {
      try {
        const Proposal     = (await import('../models/Proposal.js')).default;
        const Notification = (await import('../models/Notification.js')).default;
        const deptLabel    = { tax: 'Tax', investment: 'Investment', insurance: 'Insurance', wealth: 'Wealth' }[dept] || dept;

        const titleMap = {
          tax:        `Tax Filing Plan — ${lc.filingType || 'ITR'} ${lc.financialYear || ''}`.trim(),
          investment: `Investment Portfolio — ${lc.investmentGoal || 'Wealth Creation'}`,
          insurance:  `Insurance Recommendation — ${lc.insuranceType || ''}`.trim(),
          wealth:     'Wealth Management Plan',
        };

        const details = {};
        if (dept === 'tax' && lc.analysis) {
          if (lc.analysis.grossIncome)    details['Gross Income']   = `₹${Number(lc.analysis.grossIncome).toLocaleString('en-IN')}`;
          if (lc.analysis.taxableIncome)  details['Taxable Income'] = `₹${Number(lc.analysis.taxableIncome).toLocaleString('en-IN')}`;
          if (lc.analysis.taxPayable)     details['Tax Payable']    = `₹${Number(lc.analysis.taxPayable).toLocaleString('en-IN')}`;
        }
        if (dept === 'investment' && lc.portfolio?.length) {
          lc.portfolio.slice(0, 4).forEach(p => {
            details[p.assetClass] = `${p.allocation}% — ₹${Number(p.amount || 0).toLocaleString('en-IN')}`;
          });
        }
        if (dept === 'insurance' && lc.recommendation?.selectedPlan) {
          details['Plan']           = lc.recommendation.selectedPlan;
          details['Insurer']        = lc.recommendation.insurer || '';
          details['Annual Premium'] = `₹${Number(lc.recommendation.premium || 0).toLocaleString('en-IN')}`;
          details['Cover Amount']   = `₹${Number(lc.recommendation.coverAmount || 0).toLocaleString('en-IN')}`;
        }
        if (dept === 'wealth' && lc.assetAllocation?.length) {
          lc.assetAllocation.slice(0, 4).forEach(a => { details[a.assetClass] = `${a.allocation}%`; });
        }

        const proposal = await Proposal.create({
          clientId:     lc.clientId._id,
          consultantId: lc.consultantId,
          department:   dept,
          title:        titleMap[dept] || `${deptLabel} Advisory Proposal`,
          summary:      `Your ${deptLabel} advisor has prepared a recommendation. Please review and approve to proceed with the service.`,
          details,
          status:       'sent',
          caseId:       lc._id,
          caseModel:    MODEL_NAME[dept] || null,
        });

        await Model.findByIdAndUpdate(req.params.id, { proposalId: proposal._id });

        await Notification.create({
          userId: lc.clientId._id, userModel: 'Client',
          type:    'proposal_created',
          title:   `New ${deptLabel} Proposal Ready`,
          message: `Your ${deptLabel} advisor has sent a proposal. Review it in your dashboard under Proposals.`,
          metadata: { proposalId: proposal._id },
        });
      } catch (e) { console.error('[deptCases] auto-proposal error:', e.message); }
    }

    // AUTO-CREATE INVOICE when client approves (first time only)
    const decision = req.body.clientDecision;
    if (
      decision?.status === 'Approved' &&
      current.clientDecision?.status !== 'Approved' &&
      lc.clientId &&
      !current.invoiceId
    ) {
      try {
        const Invoice      = (await import('../models/Invoice.js')).default;
        const Notification = (await import('../models/Notification.js')).default;

        const svcMap = {
          tax:        { title: 'Tax Filing & Advisory Service',         amount: 4999  },
          investment: { title: 'Investment Portfolio Advisory Service',  amount: 9999  },
          insurance:  { title: 'Insurance Advisory & Policy Service',   amount: 2999  },
          wealth:     { title: 'Wealth Management Advisory Service',    amount: 14999 },
        };
        const svc     = svcMap[dept] || { title: 'Advisory Service', amount: 4999 };
        const taxAmt  = Math.round(svc.amount * 0.18);
        const total   = svc.amount + taxAmt;

        const invoice = await Invoice.create({
          clientId:     lc.clientId._id,
          consultantId: lc.consultantId,
          proposalId:   current.proposalId || null,
          department:   dept,
          serviceTitle: svc.title,
          lineItems:    [{ description: svc.title, amount: svc.amount }],
          subtotal:     svc.amount,
          tax:          taxAmt,
          taxPercent:   18,
          totalAmount:  total,
          status:       'sent',
          dueDate:      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });

        await Model.findByIdAndUpdate(req.params.id, { invoiceId: invoice._id });

        await Notification.create({
          userId: lc.clientId._id, userModel: 'Client',
          type:    'invoice_created',
          title:   'Invoice Ready — Payment Required',
          message: `Your proposal has been approved! Please pay ₹${total.toLocaleString('en-IN')} to activate the service. Go to Payments in your dashboard.`,
          metadata: { invoiceId: invoice._id },
        });
      } catch (e) { console.error('[deptCases] auto-invoice error:', e.message); }
    }

    res.json({ status: 'success', case: lc });
  } catch (err) { res.status(500).json({ status: 'error', message: err.message }); }
});

// ── PATCH /api/dept-cases/:dept/:id/document/:docId ───────────────────────────
router.patch('/:dept/:id/document/:docId', async (req, res) => {
  try {
    const Model = MODEL[req.params.dept];
    if (!Model) return res.status(400).json({ status: 'error', message: 'Invalid department' });
    const { status, rejectionNote } = req.body;
    const lc = await Model.findById(req.params.id);
    if (!lc) return res.status(404).json({ status: 'error', message: 'Case not found' });
    const doc = lc.documents.id(req.params.docId);
    if (!doc) return res.status(404).json({ status: 'error', message: 'Document not found' });
    doc.status = status;
    if (status === 'Uploaded') doc.uploadedAt = new Date();
    if (rejectionNote) doc.rejectionNote = rejectionNote;
    await lc.save();
    res.json({ status: 'success', case: lc });
  } catch (err) { res.status(500).json({ status: 'error', message: err.message }); }
});

// ── POST /api/dept-cases/:dept/:id/note ──────────────────────────────────────
router.post('/:dept/:id/note', async (req, res) => {
  try {
    const Model = MODEL[req.params.dept];
    if (!Model) return res.status(400).json({ status: 'error', message: 'Invalid department' });
    const lc = await Model.findByIdAndUpdate(
      req.params.id,
      { $push: { notes: { text: req.body.text, addedBy: req.user?.name || 'Consultant' } } },
      { new: true }
    );
    if (!lc) return res.status(404).json({ status: 'error', message: 'Case not found' });
    res.json({ status: 'success', case: lc });
  } catch (err) { res.status(500).json({ status: 'error', message: err.message }); }
});

export default router;
