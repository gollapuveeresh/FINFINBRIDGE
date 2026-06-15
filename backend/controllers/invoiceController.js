import Invoice from '../models/Invoice.js';
import Notification from '../models/Notification.js';

// POST /api/invoices — consultant creates invoice
export const createInvoice = async (req, res) => {
  try {
    const { clientId, proposalId, department, serviceTitle, lineItems, taxPercent, dueDate, notes } = req.body;
    const subtotal = lineItems.reduce((s, i) => s + i.amount, 0);
    const taxPct   = taxPercent ?? 18;
    const tax      = Math.round(subtotal * taxPct / 100);
    const invoice  = await Invoice.create({
      clientId, proposalId: proposalId || null,
      consultantId: req.user._id,
      department, serviceTitle, lineItems,
      subtotal, tax, taxPercent: taxPct,
      totalAmount: subtotal + tax,
      dueDate, notes,
    });

    await Notification.create({
      userId: clientId, userModel: 'Client',
      type: 'invoice_created',
      title: 'Invoice Received',
      message: `You have a new invoice: ${invoice.invoiceNumber} for ₹${invoice.totalAmount}`,
      metadata: { invoiceId: invoice._id },
    });

    res.status(201).json({ status: 'success', invoice });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// GET /api/invoices
export const getInvoices = async (req, res) => {
  try {
    const filter = { isActive: true };
    if (req.user.role === 'consultant')       filter.consultantId = req.user._id;
    if (req.user.role === 'client')           filter.clientId     = req.user._id;
    if (req.query.status)                     filter.status       = req.query.status;
    if (req.query.department)                 filter.department   = req.query.department;

    const invoices = await Invoice.find(filter)
      .populate('clientId',     'name email')
      .populate('consultantId', 'name email department')
      .populate('proposalId',   'title status')
      .sort({ createdAt: -1 });

    res.json({ status: 'success', count: invoices.length, invoices });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// GET /api/invoices/:id
export const getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('clientId',     'name email phone')
      .populate('consultantId', 'name email department')
      .populate('proposalId',   'title status');
    if (!invoice) return res.status(404).json({ status: 'error', message: 'Invoice not found' });
    res.json({ status: 'success', invoice });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// PATCH /api/invoices/:id
export const updateInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ status: 'error', message: 'Invoice not found' });

    const allowed = ['serviceTitle','lineItems','taxPercent','dueDate','notes','status'];
    allowed.forEach(f => { if (req.body[f] !== undefined) invoice[f] = req.body[f]; });

    if (req.body.lineItems) {
      invoice.subtotal    = req.body.lineItems.reduce((s, i) => s + i.amount, 0);
      invoice.tax         = Math.round(invoice.subtotal * (invoice.taxPercent / 100));
      invoice.totalAmount = invoice.subtotal + invoice.tax;
    }

    await invoice.save();
    res.json({ status: 'success', invoice });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// GET /api/invoices/stats — admin revenue analytics
export const getInvoiceStats = async (req, res) => {
  try {
    const [total, paid, overdue, byDept] = await Promise.all([
      Invoice.aggregate([{ $match: { isActive: true } }, { $group: { _id: null, total: { $sum: '$totalAmount' }, count: { $sum: 1 } } }]),
      Invoice.aggregate([{ $match: { isActive: true, status: 'paid' } }, { $group: { _id: null, total: { $sum: '$totalAmount' }, count: { $sum: 1 } } }]),
      Invoice.aggregate([{ $match: { isActive: true, status: 'overdue' } }, { $group: { _id: null, total: { $sum: '$totalAmount' }, count: { $sum: 1 } } }]),
      Invoice.aggregate([{ $match: { isActive: true, status: 'paid' } }, { $group: { _id: '$department', revenue: { $sum: '$totalAmount' }, count: { $sum: 1 } } }]),
    ]);
    res.json({
      status: 'success',
      stats: {
        totalInvoiced: total[0]?.total || 0,    totalCount: total[0]?.count || 0,
        totalPaid:     paid[0]?.total  || 0,    paidCount:  paid[0]?.count  || 0,
        totalOverdue:  overdue[0]?.total || 0,  overdueCount: overdue[0]?.count || 0,
        byDepartment: byDept,
      },
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};
