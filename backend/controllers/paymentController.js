import crypto from 'crypto';
import Razorpay from 'razorpay';
import Payment from '../models/Payment.js';
import Invoice from '../models/Invoice.js';
import Notification from '../models/Notification.js';
import { advanceCaseAfterPayment } from '../utils/caseWorkflow.js';

// Lazily initialise Razorpay — returns null if keys are not configured
const getRazorpay = () => {
  if (!process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID.startsWith('rzp_test_your')) return null;
  return new Razorpay({
    key_id:     process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

// POST /api/payments/create-order
export const createOrder = async (req, res) => {
  try {
    const { invoiceId } = req.body;
    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) return res.status(404).json({ status: 'error', message: 'Invoice not found' });
    if (invoice.status === 'paid') return res.status(400).json({ status: 'error', message: 'Invoice already paid' });

    const razorpay = getRazorpay();
    let gatewayOrderId = null;

    if (razorpay) {
      const order = await razorpay.orders.create({
        amount:   invoice.totalAmount * 100,   // paise
        currency: invoice.currency || 'INR',
        receipt:  invoice.invoiceNumber,
        notes:    { invoiceId: invoiceId.toString(), clientId: invoice.clientId.toString() },
      });
      gatewayOrderId = order.id;
    }

    const payment = await Payment.create({
      clientId:       invoice.clientId,
      invoiceId:      invoice._id,
      amount:         invoice.totalAmount,
      currency:       invoice.currency || 'INR',
      gateway:        razorpay ? 'razorpay' : 'manual',
      gatewayOrderId,
      status:         'created',
    });

    await Invoice.findByIdAndUpdate(invoiceId, { status: 'sent' });

    res.status(201).json({
      status: 'success',
      payment,
      razorpayKeyId:  process.env.RAZORPAY_KEY_ID || null,
      gatewayOrderId,
      amount:         invoice.totalAmount * 100,
      currency:       invoice.currency || 'INR',
      invoiceNumber:  invoice.invoiceNumber,
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// POST /api/payments/verify — called by frontend after Razorpay success
export const verifyPayment = async (req, res) => {
  try {
    const { paymentId, gatewayOrderId, gatewayPaymentId, gatewaySignature } = req.body;

    const payment = await Payment.findById(paymentId);
    if (!payment) return res.status(404).json({ status: 'error', message: 'Payment record not found' });

    // Signature verification. In demo mode (no real Razorpay keys configured, or a
    // manual/demo payment record) we accept the dummy payment without a signature.
    const isDemo      = !getRazorpay() || payment.gateway === 'manual';
    const body        = `${gatewayOrderId}|${gatewayPaymentId}`;
    const expected    = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
                              .update(body).digest('hex');
    const isValid     = isDemo || !process.env.RAZORPAY_KEY_SECRET || expected === gatewaySignature;

    if (!isValid) {
      await Payment.findByIdAndUpdate(paymentId, { status: 'failed' });
      return res.status(400).json({ status: 'error', message: 'Payment signature verification failed' });
    }

    const now = new Date();
    await Payment.findByIdAndUpdate(paymentId, {
      gatewayPaymentId, gatewaySignature, status: 'paid', paidAt: now,
    });

    const invoice = await Invoice.findByIdAndUpdate(
      payment.invoiceId, { status: 'paid', paidAt: now }, { new: true }
    );

    // Auto-advance the linked case (any department, incl. loans) past the payment
    // gate into the next workflow stage.
    try {
      await advanceCaseAfterPayment(invoice);
    } catch (e) { console.error('[verifyPayment] stage advance error:', e.message); }

    await Notification.create({
      userId:    payment.clientId, userModel: 'Client',
      type:      'payment_success',
      title:     'Payment Successful',
      message:   `Your payment of ₹${payment.amount} for invoice ${invoice?.invoiceNumber} is confirmed.`,
      metadata:  { paymentId: payment._id, invoiceId: payment.invoiceId },
    });

    res.json({ status: 'success', message: 'Payment verified and service activated', payment });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// POST /api/payments/webhook — Razorpay webhook handler
export const handleWebhook = async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const secret    = process.env.RAZORPAY_WEBHOOK_SECRET || '';

    if (secret) {
      const digest = crypto.createHmac('sha256', secret)
                           .update(JSON.stringify(req.body)).digest('hex');
      if (digest !== signature) return res.status(400).json({ status: 'error', message: 'Invalid webhook signature' });
    }

    const event   = req.body.event;
    const payload = req.body.payload?.payment?.entity;

    if (event === 'payment.captured' && payload) {
      const payment = await Payment.findOne({ gatewayOrderId: payload.order_id });
      if (payment && payment.status !== 'paid') {
        const now = new Date();
        await Payment.findByIdAndUpdate(payment._id, {
          status: 'paid', paidAt: now,
          gatewayPaymentId: payload.id,
          method: payload.method || '',
        });
        const invoice = await Invoice.findByIdAndUpdate(payment.invoiceId, { status: 'paid', paidAt: now }, { new: true });
        try { await advanceCaseAfterPayment(invoice); } catch (e) { console.error('[webhook] stage advance error:', e.message); }
      }
    }

    res.json({ status: 'success' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// GET /api/payments — list payments
export const getPayments = async (req, res) => {
  try {
    const filter = {};
    if (req.user.role === 'client')     filter.clientId = req.user._id;
    if (req.query.status)               filter.status   = req.query.status;
    if (req.query.invoiceId)            filter.invoiceId = req.query.invoiceId;

    const payments = await Payment.find(filter)
      .populate('clientId',  'name email')
      .populate('invoiceId', 'invoiceNumber totalAmount department serviceTitle')
      .sort({ createdAt: -1 });
    res.json({ status: 'success', count: payments.length, payments });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// POST /api/payments/:id/refund
export const refundPayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment)                  return res.status(404).json({ status: 'error', message: 'Payment not found' });
    if (payment.status !== 'paid') return res.status(400).json({ status: 'error', message: 'Only paid payments can be refunded' });

    const { amount, notes } = req.body;
    const refundAmount = amount || payment.amount;

    const razorpay = getRazorpay();
    let refundId = `MANUAL-${Date.now()}`;

    if (razorpay && payment.gatewayPaymentId) {
      const refund = await razorpay.payments.refund(payment.gatewayPaymentId, {
        amount: refundAmount * 100,
        notes: { reason: notes || 'Refund requested' },
      });
      refundId = refund.id;
    }

    await Payment.findByIdAndUpdate(payment._id, {
      status: 'refunded', refundId, refundedAt: new Date(), refundAmount,
    });
    await Invoice.findByIdAndUpdate(payment.invoiceId, { status: 'cancelled' });

    res.json({ status: 'success', message: 'Refund processed', refundId });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// GET /api/payments/stats — revenue analytics for admin
export const getPaymentStats = async (req, res) => {
  try {
    const [total, monthly, byGateway] = await Promise.all([
      Payment.aggregate([
        { $match: { status: 'paid' } },
        { $group: { _id: null, totalRevenue: { $sum: '$amount' }, count: { $sum: 1 } } },
      ]),
      Payment.aggregate([
        { $match: { status: 'paid' } },
        { $group: {
          _id: { year: { $year: '$paidAt' }, month: { $month: '$paidAt' } },
          revenue: { $sum: '$amount' }, count: { $sum: 1 },
        }},
        { $sort: { '_id.year': 1, '_id.month': 1 } },
        { $limit: 12 },
      ]),
      Payment.aggregate([
        { $match: { status: 'paid' } },
        { $group: { _id: '$gateway', revenue: { $sum: '$amount' }, count: { $sum: 1 } } },
      ]),
    ]);

    res.json({
      status: 'success',
      stats: {
        totalRevenue:   total[0]?.totalRevenue || 0,
        totalTransactions: total[0]?.count    || 0,
        monthlyRevenue: monthly,
        byGateway,
      },
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};
