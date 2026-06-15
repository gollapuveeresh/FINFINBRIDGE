import Proposal from '../models/Proposal.js';
import Lead from '../models/Lead.js';
import Notification from '../models/Notification.js';
import { DEPT_MODEL, PROPOSAL_TO_DECISION, ensureInvoiceForCase } from '../utils/caseWorkflow.js';

// POST /api/proposals — consultant creates proposal
export const createProposal = async (req, res) => {
  try {
    const { leadId, clientId, department, title, summary, details, validUntil } = req.body;
    const proposal = await Proposal.create({
      leadId, clientId, consultantId: req.user._id,
      department, title, summary, details, validUntil
    });

    // Update lead status
    if (leadId) {
      await Lead.findByIdAndUpdate(leadId, { status: 'proposal' });
    }

    // Notify client if linked
    if (clientId) {
      await Notification.create({
        userId: clientId, userModel: 'Client',
        type: 'proposal_created',
        title: 'New Proposal Available',
        message: `Your consultant has prepared a new proposal: ${title}`,
        metadata: { proposalId: proposal._id }
      });
    }

    res.status(201).json({ status: 'success', proposal });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// GET /api/proposals — list proposals
export const getProposals = async (req, res) => {
  try {
    let filter = { isActive: true };
    if (req.user.role === 'consultant') filter.consultantId = req.user._id;
    if (req.user.role === 'client') {
      // Return proposals where clientId matches OR proposals linked via leadId
      // where the lead was converted to this client
      const Lead = (await import('../models/Lead.js')).default;
      const convertedLeads = await Lead.find({ convertedClientId: req.user._id }).select('_id');
      const leadIds = convertedLeads.map(l => l._id);
      filter = {
        isActive: true,
        $or: [
          { clientId: req.user._id },
          { leadId: { $in: leadIds } },
        ],
      };
    }
    if (req.query.status)     filter.status     = req.query.status;
    if (req.query.department) filter.department = req.query.department;

    const proposals = await Proposal.find(filter)
      .populate('consultantId', 'name email department')
      .populate('clientId', 'name email')
      .populate('leadId', 'name leadId')
      .sort({ createdAt: -1 });
    res.json({ status: 'success', count: proposals.length, proposals });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// GET /api/proposals/:id
export const getProposalById = async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.id)
      .populate('consultantId', 'name email department')
      .populate('clientId', 'name email')
      .populate('leadId', 'name leadId status');
    if (!proposal) return res.status(404).json({ status: 'error', message: 'Proposal not found' });
    res.json({ status: 'success', proposal });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// PATCH /api/proposals/:id — update proposal
export const updateProposal = async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.id);
    if (!proposal) return res.status(404).json({ status: 'error', message: 'Proposal not found' });

    const { title, summary, details, status, clientFeedback, validUntil } = req.body;
    if (title) proposal.title = title;
    if (summary) proposal.summary = summary;
    if (details) proposal.details = details;
    if (validUntil) proposal.validUntil = validUntil;

    // Client approves / requests changes / rejects
    if (status && req.user.role === 'client') {
      proposal.status = status;
      if (clientFeedback) proposal.clientFeedback = clientFeedback;

      if (status === 'approved' && proposal.leadId) {
        await Lead.findByIdAndUpdate(proposal.leadId, { status: 'won' });
      }

      // Propagate the client's decision back to the originating workflow case so
      // the consultant's dashboard advances, and generate the payment link.
      const Model = DEPT_MODEL[proposal.department];
      if (proposal.caseId && Model) {
        const caseDoc = await Model.findById(proposal.caseId);
        if (caseDoc) {
          const decisionStatus = PROPOSAL_TO_DECISION[status];
          if (decisionStatus) {
            caseDoc.clientDecision = {
              status:    decisionStatus,
              feedback:  clientFeedback || '',
              decidedAt: new Date(),
            };
            await caseDoc.save();
          }
          // On approval, generate (or reuse) the invoice — payment link for the client.
          if (status === 'approved') {
            const invoice = await ensureInvoiceForCase(proposal.department, caseDoc);
            proposal.invoiceId = invoice._id;
          }
        }
      }

      // Notify consultant
      await Notification.create({
        userId: proposal.consultantId, userModel: 'Consultant',
        type: 'proposal_response',
        title: `Proposal ${status.replace('_', ' ')}`,
        message: `Client ${status.replace('_', ' ')} your proposal: ${proposal.title}`,
        metadata: { proposalId: proposal._id }
      });
    } else if (status && (req.user.role === 'consultant' || req.user.role === 'admin' || req.user.role === 'department-admin')) {
      proposal.status = status;
    }

    await proposal.save();
    res.json({ status: 'success', proposal });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// DELETE /api/proposals/:id
export const deleteProposal = async (req, res) => {
  try {
    await Proposal.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ status: 'success', message: 'Proposal deleted' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};
