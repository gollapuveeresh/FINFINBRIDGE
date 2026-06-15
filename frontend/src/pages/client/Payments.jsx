import { useState, useEffect, useCallback } from 'react';
import ClientLayout from '../../layouts/ClientLayout';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { downloadInvoicePDF } from '../../utils/pdfGenerator';

const STATUS_COLORS = {
  draft: 'text-gray-400', sent: 'text-amber-400', paid: 'text-green-400',
  overdue: 'text-red-400', cancelled: 'text-gray-500',
};
const STATUS_BG = {
  draft: 'bg-gray-500/10', sent: 'bg-amber-500/10', paid: 'bg-green-500/10',
  overdue: 'bg-red-500/10', cancelled: 'bg-gray-500/10',
};

const loadRazorpay = () =>
  new Promise(resolve => {
    if (window.Razorpay) return resolve(true);
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });

// ── Demo Gateway Modal ────────────────────────────────────────────────────────
function DemoGatewayModal({ invoice, onSuccess, onClose }) {
  const [step, setStep]       = useState('method');   // method → processing → success
  const [method, setMethod]   = useState('');

  const METHODS = [
    { key: 'upi',        label: 'UPI',          icon: '📱', desc: 'Pay via UPI ID or QR Code' },
    { key: 'card',       label: 'Credit / Debit Card', icon: '💳', desc: 'Visa, Mastercard, Rupay' },
    { key: 'netbanking', label: 'Net Banking',   icon: '🏦', desc: 'All major banks supported' },
    { key: 'wallet',     label: 'Wallet',        icon: '👜', desc: 'Paytm, PhonePe, Amazon Pay' },
    { key: 'emi',        label: 'EMI',           icon: '📅', desc: 'No-cost EMI on select cards' },
  ];

  const handlePay = async () => {
    if (!method) { toast.error('Select a payment method'); return; }
    setStep('processing');
    await new Promise(r => setTimeout(r, 2000));
    setStep('success');
    await new Promise(r => setTimeout(r, 1000));
    onSuccess(method);
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center px-4">
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="bg-[#1a1a2e] rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-white/10">

        {/* Gateway Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-5 flex items-center justify-between">
          <div>
            <p className="text-white/70 text-xs font-semibold uppercase tracking-wider">FinBridge Secure Payment</p>
            <p className="text-white text-xl font-black mt-0.5">₹{invoice.totalAmount?.toLocaleString('en-IN')}</p>
            <p className="text-white/70 text-xs mt-0.5">{invoice.serviceTitle}</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-green-300 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              Secure
            </div>
            <p className="text-white/50 text-xs mt-1">{invoice.invoiceNumber}</p>
          </div>
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">

            {/* Step 1 — Choose Method */}
            {step === 'method' && (
              <motion.div key="method" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <p className="text-white/70 text-xs font-bold uppercase tracking-wider mb-4">Choose Payment Method</p>
                <div className="space-y-2">
                  {METHODS.map(m => (
                    <button key={m.key} onClick={() => setMethod(m.key)}
                      className={`w-full flex items-center gap-4 p-3.5 rounded-2xl border transition-all ${
                        method === m.key
                          ? 'border-indigo-500 bg-indigo-500/20 text-white'
                          : 'border-white/10 bg-white/5 text-white/70 hover:border-white/20 hover:bg-white/10'
                      }`}>
                      <span className="text-2xl w-8 text-center">{m.icon}</span>
                      <div className="text-left flex-1">
                        <p className="font-semibold text-sm">{m.label}</p>
                        <p className="text-xs text-white/40">{m.desc}</p>
                      </div>
                      {method === m.key && <span className="text-indigo-400 text-lg">✓</span>}
                    </button>
                  ))}
                </div>

                {/* UPI input if selected */}
                {method === 'upi' && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-3">
                    <input className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white text-sm placeholder-white/30"
                      placeholder="Enter UPI ID (e.g. name@upi)" />
                  </motion.div>
                )}

                {method === 'card' && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-3 space-y-2">
                    <input className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white text-sm placeholder-white/30"
                      placeholder="Card Number" />
                    <div className="grid grid-cols-2 gap-2">
                      <input className="p-3 rounded-xl bg-white/10 border border-white/20 text-white text-sm placeholder-white/30"
                        placeholder="MM / YY" />
                      <input className="p-3 rounded-xl bg-white/10 border border-white/20 text-white text-sm placeholder-white/30"
                        placeholder="CVV" />
                    </div>
                  </motion.div>
                )}

                <div className="mt-5 space-y-3">
                  <button onClick={handlePay} disabled={!method}
                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-2xl font-bold text-base transition-all">
                    Pay ₹{invoice.totalAmount?.toLocaleString('en-IN')}
                  </button>
                  <button onClick={onClose} className="w-full py-3 text-white/40 hover:text-white/70 text-sm transition-colors">
                    Cancel
                  </button>
                </div>

                {/* Security badges */}
                <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-white/10">
                  {['🔒 SSL Secured', '🛡️ PCI DSS', '✓ Razorpay'].map(b => (
                    <span key={b} className="text-[10px] text-white/30 font-semibold">{b}</span>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 2 — Processing */}
            {step === 'processing' && (
              <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="py-12 flex flex-col items-center gap-4">
                <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-white font-bold text-lg">Processing Payment...</p>
                <p className="text-white/50 text-sm">Please do not close this window</p>
                <div className="flex gap-2 mt-2">
                  {['Authenticating','Verifying','Confirming'].map((s, i) => (
                    <span key={s} className="text-xs text-white/30 flex items-center gap-1">
                      <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, delay: i * 0.5, repeat: Infinity }}>●</motion.span>
                      {s}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 3 — Success */}
            {step === 'success' && (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                className="py-10 flex flex-col items-center gap-3">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}
                  className="w-20 h-20 rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center">
                  <span className="text-green-400 text-4xl">✓</span>
                </motion.div>
                <p className="text-white font-black text-xl">Payment Successful!</p>
                <p className="text-white/60 text-sm text-center">₹{invoice.totalAmount?.toLocaleString('en-IN')} paid via {METHODS.find(m => m.key === method)?.label}</p>
                <p className="text-green-400 text-xs font-semibold">Service Activated</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

// ── Main Payments Page ────────────────────────────────────────────────────────
export default function ClientPayments() {
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [paying,   setPaying]   = useState(null);   // invoice being paid
  const [tab,      setTab]      = useState('invoices');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [invRes, payRes] = await Promise.all([
        api.get('/invoices'),
        api.get('/payments'),
      ]);
      setInvoices(invRes.data.invoices || []);
      setPayments(payRes.data.payments || []);
    } catch { toast.error('Failed to load payment data'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handlePay = async (invoice) => {
    // Demo mode is decided by the backend response (razorpayKeyId). No use of
    // process.env here — that is undefined in the browser.
    try {
      const { data } = await api.post('/payments/create-order', { invoiceId: invoice._id });
      if (data.razorpayKeyId && !data.razorpayKeyId.startsWith('rzp_test_your')) {
        // Real keys — open Razorpay
        const loaded = await loadRazorpay();
        if (!loaded) { toast.error('Payment gateway failed to load'); return; }
        new window.Razorpay({
          key: data.razorpayKeyId, amount: data.amount, currency: data.currency,
          name: 'FinBridge Solutions', description: invoice.serviceTitle,
          order_id: data.gatewayOrderId,
          handler: async (r) => {
            await api.post('/payments/verify', {
              paymentId: data.payment._id,
              gatewayOrderId: r.razorpay_order_id,
              gatewayPaymentId: r.razorpay_payment_id,
              gatewaySignature: r.razorpay_signature,
            });
            toast.success('Payment successful! Service activated.');
            fetchData();
          },
          theme: { color: '#6366f1' },
        }).open();
      } else {
        // Demo keys — show our demo modal
        setPaying({ invoice, paymentId: data.payment._id, gatewayOrderId: data.gatewayOrderId });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to initiate payment');
    }
  };

  const handleDemoSuccess = async (method) => {
    try {
      await api.post('/payments/verify', {
        paymentId:        paying.paymentId,
        gatewayOrderId:   paying.gatewayOrderId || 'demo_order',
        gatewayPaymentId: 'demo_pay_' + Date.now(),
        gatewaySignature: 'demo_signature',
      });
      toast.success('Payment confirmed! Service activated.');
      setPaying(null);
      fetchData();
    } catch { toast.error('Verification failed'); }
  };

  const totalPaid    = payments.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0);
  const pendingCount = invoices.filter(i => i.status === 'sent').length;
  const paidCount    = invoices.filter(i => i.status === 'paid').length;

  if (loading) return (
    <ClientLayout>
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-text-muted mt-4 text-sm">Loading payment data...</p>
      </div>
    </ClientLayout>
  );

  return (
    <ClientLayout>
      <div className="space-y-gutter">

        {/* Header */}
        <div>
          <h1 className="text-headline-md font-bold text-accent">Payments & Invoices</h1>
          <p className="text-text-muted text-body-md mt-1">View invoices, pay securely via Razorpay, and track payment history.</p>
        </div>

        {/* Payment Gateway Info Banner */}
        <div className="card p-5 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-indigo-500/20 shrink-0">
              <span className="material-symbols-outlined text-indigo-400 text-2xl">lock</span>
            </div>
            <div className="flex-1">
              <p className="font-bold text-accent">Secured by Razorpay Payment Gateway</p>
              <p className="text-text-muted text-sm mt-1">All payments are encrypted with 256-bit SSL. Supports UPI, Credit/Debit Cards, Net Banking, Wallets & EMI.</p>
              <div className="flex flex-wrap gap-3 mt-3">
                {['UPI', 'Credit Card', 'Debit Card', 'Net Banking', 'Wallets', 'EMI'].map(m => (
                  <span key={m} className="text-xs px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 font-semibold border border-indigo-500/20">{m}</span>
                ))}
              </div>
            </div>
            <div className="text-right shrink-0 hidden md:block">
              <div className="flex items-center gap-1 text-green-400 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                Gateway Active
              </div>
              <p className="text-text-muted text-xs mt-1">PCI DSS Compliant</p>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Invoices',   value: invoices.length,                                    color: 'text-accent',        icon: 'receipt' },
            { label: 'Pending Payment',  value: pendingCount,                                        color: 'text-amber-400',     icon: 'pending_actions' },
            { label: 'Paid',             value: paidCount,                                           color: 'text-green-400',     icon: 'check_circle' },
            { label: 'Total Paid',       value: `₹${totalPaid.toLocaleString('en-IN')}`,            color: 'text-emerald-400',   icon: 'payments' },
          ].map(k => (
            <div key={k.label} className="card p-5">
              <div className="flex items-center gap-3 mb-2">
                <span className={`material-symbols-outlined text-xl ${k.color}`}>{k.icon}</span>
                <p className="text-text-muted text-xs font-semibold">{k.label}</p>
              </div>
              <p className={`text-2xl font-bold ${k.color}`}>{k.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-border pb-1">
          {[
            { key: 'invoices', label: 'Invoices', badge: pendingCount },
            { key: 'history',  label: 'Payment History', badge: 0 },
            { key: 'howto',    label: 'How It Works', badge: 0 },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-4 py-2.5 rounded-t-xl text-sm font-semibold transition-colors flex items-center gap-2 ${
                tab === t.key ? 'bg-indigo-500/10 text-indigo-400 border-b-2 border-indigo-500' : 'text-text-muted hover:text-accent'
              }`}>
              {t.label}
              {t.badge > 0 && <span className="px-1.5 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-bold">{t.badge}</span>}
            </button>
          ))}
        </div>

        {/* Invoices Tab */}
        {tab === 'invoices' && (
          invoices.length === 0 ? (
            <div className="card p-16 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-indigo-400 text-3xl">receipt_long</span>
              </div>
              <p className="font-bold text-accent text-lg">No Invoices Yet</p>
              <p className="text-text-muted text-sm max-w-md mx-auto">
                Once your consultant creates a proposal and you approve it, they will generate an invoice here for you to pay.
              </p>
              <div className="flex justify-center gap-3 mt-4">
                <a href="/client/proposals" className="btn-primary px-5 py-2.5 text-sm">View Proposals</a>
                <a href="/client/consultations" className="btn-ghost px-5 py-2.5 text-sm">Book Consultation</a>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {invoices.map(inv => (
                <motion.div key={inv._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className={`card p-6 border-l-4 ${inv.status === 'sent' ? 'border-amber-500' : inv.status === 'paid' ? 'border-green-500' : 'border-border'}`}>
                  <div className="flex justify-between items-start flex-wrap gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <p className="font-bold text-accent text-lg">{inv.invoiceNumber}</p>
                        <span className={`text-xs px-2.5 py-1 rounded-full font-bold capitalize ${STATUS_COLORS[inv.status]} ${STATUS_BG[inv.status]}`}>
                          {inv.status}
                        </span>
                      </div>
                      <p className="text-sm text-text-muted">{inv.serviceTitle}</p>
                      <p className="text-xs text-text-muted capitalize mt-0.5">{inv.department} · by {inv.consultantId?.name}</p>
                      {inv.dueDate && (
                        <p className={`text-xs font-semibold mt-1 ${new Date(inv.dueDate) < new Date() ? 'text-red-400' : 'text-text-muted'}`}>
                          Due: {new Date(inv.dueDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black text-accent">₹{inv.totalAmount?.toLocaleString('en-IN')}</p>
                      <p className="text-xs text-text-muted mt-1">incl. {inv.taxPercent}% GST</p>
                      <button onClick={() => downloadInvoicePDF(inv, null)}
                        className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
                        <span className="material-symbols-outlined text-sm">download</span>
                        Download Invoice
                      </button>
                    </div>
                  </div>

                  {/* Line Items */}
                  <div className="mt-4 p-4 bg-bg rounded-2xl border border-border/40 space-y-2">
                    {inv.lineItems?.map((li, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-text-muted">{li.description}</span>
                        <span className="font-semibold text-accent">₹{li.amount?.toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                    <div className="border-t border-border/30 pt-2 mt-2 grid grid-cols-3 gap-2 text-xs">
                      <div className="text-center">
                        <p className="text-text-muted">Subtotal</p>
                        <p className="font-bold text-accent">₹{inv.subtotal?.toLocaleString('en-IN')}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-text-muted">GST ({inv.taxPercent}%)</p>
                        <p className="font-bold text-amber-400">₹{inv.tax?.toLocaleString('en-IN')}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-text-muted">Total</p>
                        <p className="font-bold text-green-400">₹{inv.totalAmount?.toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                  </div>

                  {inv.notes && <p className="text-xs text-text-muted mt-3 italic">Note: {inv.notes}</p>}

                  {/* Pay Button */}
                  {inv.status === 'sent' && (
                    <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                      onClick={() => handlePay(inv)}
                      className="w-full mt-4 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-2xl font-bold text-base transition-all flex items-center justify-center gap-3 shadow-lg shadow-indigo-500/20">
                      <span className="material-symbols-outlined">lock</span>
                      Pay ₹{inv.totalAmount?.toLocaleString('en-IN')} Securely
                      <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">Razorpay</span>
                    </motion.button>
                  )}

                  {inv.status === 'paid' && (
                    <div className="mt-4 p-3 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center gap-3">
                      <span className="material-symbols-outlined text-green-400">check_circle</span>
                      <div>
                        <p className="text-green-400 font-bold text-sm">Payment Confirmed</p>
                        <p className="text-text-muted text-xs">Paid on {inv.paidAt ? new Date(inv.paidAt).toLocaleDateString() : '—'} · Service Activated</p>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )
        )}

        {/* Payment History Tab */}
        {tab === 'history' && (
          payments.length === 0 ? (
            <div className="card p-12 text-center text-text-muted">No payment history yet.</div>
          ) : (
            <div className="card overflow-hidden">
              <div className="px-5 py-4 border-b border-border flex justify-between items-center">
                <h3 className="font-bold text-accent">Transaction History</h3>
                <span className="text-xs text-text-muted">{payments.length} transactions</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-surface border-b border-border">
                    <tr className="text-left text-text-muted text-xs uppercase tracking-wider">
                      {['Invoice', 'Service', 'Amount', 'Method', 'Gateway', 'Status', 'Date'].map(h => (
                        <th key={h} className="px-5 py-3">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {payments.map(p => (
                      <tr key={p._id} className="hover:bg-surface/50">
                        <td className="px-5 py-4 font-semibold text-accent">{p.invoiceId?.invoiceNumber || '—'}</td>
                        <td className="px-5 py-4 text-text-muted text-xs">{p.invoiceId?.serviceTitle || '—'}</td>
                        <td className="px-5 py-4 font-bold">₹{p.amount?.toLocaleString('en-IN')}</td>
                        <td className="px-5 py-4 capitalize text-text-muted">{p.method || '—'}</td>
                        <td className="px-5 py-4 capitalize text-text-muted">{p.gateway}</td>
                        <td className={`px-5 py-4 font-semibold capitalize ${p.status === 'paid' ? 'text-green-400' : p.status === 'failed' ? 'text-red-400' : 'text-amber-400'}`}>
                          {p.status}
                        </td>
                        <td className="px-5 py-4 text-text-muted text-xs">{p.paidAt ? new Date(p.paidAt).toLocaleDateString() : new Date(p.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        )}

        {/* How It Works Tab */}
        {tab === 'howto' && (
          <div className="space-y-gutter">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
              {/* Payment Flow */}
              <div className="card p-6">
                <h3 className="font-bold text-accent mb-5">Payment Flow</h3>
                <div className="space-y-4">
                  {[
                    { step: 1, icon: 'description',   color: 'bg-blue-500/20 text-blue-400',    title: 'Proposal Approved',     desc: 'You approve consultant\'s service proposal' },
                    { step: 2, icon: 'receipt',        color: 'bg-amber-500/20 text-amber-400',  title: 'Invoice Generated',     desc: 'Consultant creates invoice with line items + GST' },
                    { step: 3, icon: 'notifications',  color: 'bg-purple-500/20 text-purple-400',title: 'You are Notified',      desc: 'Invoice appears here with Pay button' },
                    { step: 4, icon: 'lock',           color: 'bg-indigo-500/20 text-indigo-400',title: 'Secure Payment',        desc: 'Pay via UPI / Card / Net Banking / Wallet' },
                    { step: 5, icon: 'verified',       color: 'bg-green-500/20 text-green-400',  title: 'Payment Verified',      desc: 'Razorpay webhook confirms payment instantly' },
                    { step: 6, icon: 'rocket_launch',  color: 'bg-emerald-500/20 text-emerald-400',title: 'Service Activated',  desc: 'Your service is live — work begins' },
                  ].map((s, i) => (
                    <div key={s.step} className="flex items-start gap-4">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${s.color}`}>
                        <span className="material-symbols-outlined text-base">{s.icon}</span>
                      </div>
                      <div className="flex-1 pt-1">
                        <p className="font-semibold text-accent text-sm">{s.title}</p>
                        <p className="text-text-muted text-xs mt-0.5">{s.desc}</p>
                      </div>
                      {i < 5 && <div className="absolute ml-4 mt-9 w-px h-4 bg-border" />}
                    </div>
                  ))}
                </div>
              </div>

              {/* Supported Methods */}
              <div className="card p-6">
                <h3 className="font-bold text-accent mb-5">Supported Payment Methods</h3>
                <div className="space-y-3">
                  {[
                    { icon: '📱', label: 'UPI',           desc: 'Google Pay, PhonePe, Paytm, BHIM', color: 'border-green-500/30 bg-green-500/5' },
                    { icon: '💳', label: 'Credit Card',   desc: 'Visa, Mastercard, Amex, Rupay',    color: 'border-blue-500/30 bg-blue-500/5' },
                    { icon: '💳', label: 'Debit Card',    desc: 'All major bank debit cards',        color: 'border-blue-500/30 bg-blue-500/5' },
                    { icon: '🏦', label: 'Net Banking',   desc: 'SBI, HDFC, ICICI, Axis, 50+ banks',color: 'border-amber-500/30 bg-amber-500/5' },
                    { icon: '👜', label: 'Wallets',       desc: 'Paytm, Amazon Pay, Mobikwik',       color: 'border-purple-500/30 bg-purple-500/5' },
                    { icon: '📅', label: 'EMI',           desc: 'No-cost EMI on select cards',       color: 'border-rose-500/30 bg-rose-500/5' },
                  ].map(m => (
                    <div key={m.label} className={`flex items-center gap-3 p-3 rounded-xl border ${m.color}`}>
                      <span className="text-2xl">{m.icon}</span>
                      <div>
                        <p className="font-semibold text-accent text-sm">{m.label}</p>
                        <p className="text-text-muted text-xs">{m.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Security */}
                <div className="mt-5 p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/20">
                  <p className="text-indigo-400 font-bold text-sm mb-2">🔒 Security Guarantee</p>
                  <ul className="space-y-1">
                    {['256-bit SSL encryption on all transactions','PCI DSS Level 1 compliant','Real-time fraud detection by Razorpay','Instant refund processing if needed'].map(s => (
                      <li key={s} className="text-xs text-text-muted flex items-start gap-2">
                        <span className="text-green-400 mt-0.5">✓</span>{s}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* To get started */}
            <div className="card p-6 border border-amber-500/20 bg-amber-500/5">
              <div className="flex items-start gap-4">
                <span className="material-symbols-outlined text-amber-400 text-2xl mt-0.5">info</span>
                <div>
                  <p className="font-bold text-accent">To receive your first invoice</p>
                  <p className="text-text-muted text-sm mt-1">
                    Invoices are created by your consultant after a proposal is approved. Complete these steps:
                  </p>
                  <div className="flex flex-wrap gap-3 mt-3">
                    <a href="/client/consultations" className="btn-primary text-sm px-4 py-2">1. Book Consultation</a>
                    <a href="/client/proposals" className="btn-ghost text-sm px-4 py-2">2. Review Proposals</a>
                    <span className="btn-ghost text-sm px-4 py-2 opacity-50 cursor-default">3. Pay Invoice ← You are here</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Demo Gateway Modal */}
      {paying && (
        <DemoGatewayModal
          invoice={paying.invoice}
          onSuccess={handleDemoSuccess}
          onClose={() => setPaying(null)}
        />
      )}
    </ClientLayout>
  );
}
