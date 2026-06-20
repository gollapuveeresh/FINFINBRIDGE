import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import B2BLayout from '../../layouts/B2BLayout';
import { useB2BAuth } from '../../context/B2BAuthContext';
import b2bApi from '../../services/b2bApi';
import { downloadInvoicePDF } from '../../utils/pdfGenerator';

const STATUS_COLORS = {
  pending:'bg-amber-500/15 text-amber-400', paid:'bg-green-500/15 text-green-400',
  failed:'bg-red-500/15 text-red-400', refunded:'bg-blue-500/15 text-blue-400',
};

export default function B2BPayments() {
  const { company } = useB2BAuth();
  const orgId = company?.organizationId;
  const [payments, setPayments] = useState([]);
  const [payTarget, setPayTarget] = useState(null);   // payment row being paid (opens the modal)
  const [processing, setProcessing] = useState(false);

  const fetchPayments = useCallback(() => {
    if (!orgId) return;
    b2bApi.get(`/b2b/organizations/${orgId}/payments`).then(r => setPayments(r.data)).catch(() => {});
  }, [orgId]);

  useEffect(() => { fetchPayments(); }, [fetchPayments]);

  const totalPaid = payments.filter(p => p.status === 'paid').reduce((a, p) => a + Number(p.amount), 0);
  const totalPending = payments.filter(p => p.status === 'pending').reduce((a, p) => a + Number(p.amount), 0);

  // ── Payment (mock Razorpay) ──────────────────────────────────────────────
  // Real flow later: create order on backend → window.Razorpay checkout → on success
  // send {razorpay_payment_id, signature} to /pay for verification. For now we post directly.
  const confirmPay = async () => {
    if (!payTarget) return;
    setProcessing(true);
    try {
      const mockRef = 'pay_test_' + Math.random().toString(36).slice(2, 12);
      await b2bApi.post(`/b2b/payments/${payTarget.id}/pay`, { razorpayPaymentId: mockRef });
      toast.success(`Payment successful — ₹${Number(payTarget.amount).toLocaleString('en-IN')} paid`);
      setPayTarget(null);
      fetchPayments();
    } catch {
      toast.error('Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = async (p) => {
    try {
      const res = await b2bApi.get(`/b2b/payments/${p.id}/invoice`);
      downloadInvoicePDF(res.data, company);
    } catch {
      toast.error('Could not load the invoice.');
    }
  };

  return (
    <B2BLayout>
      <div>
        <h1 className="text-xl font-bold text-accent">Payments &amp; Invoices</h1>
        <p className="text-text-muted text-sm mt-0.5">Track all financial transactions with FinBridge</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label:'Total Paid', value:`₹${totalPaid.toLocaleString('en-IN')}`, color:'bg-green-600', icon:'check_circle' },
          { label:'Pending', value:`₹${totalPending.toLocaleString('en-IN')}`, color:'bg-amber-500', icon:'schedule' },
          { label:'Total Transactions', value:payments.length, color:'bg-accent', icon:'receipt_long' },
        ].map(k => (
          <div key={k.label} className="card p-5 flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl ${k.color} flex items-center justify-center`}>
              <span className="material-symbols-outlined text-white text-xl">{k.icon}</span>
            </div>
            <div>
              <p className="text-text-muted text-xs font-semibold uppercase tracking-wider">{k.label}</p>
              <p className="text-xl font-bold text-accent mt-0.5">{k.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Payment table */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="font-bold text-accent">Transaction History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-hover-lowest">
                {['Payment #','Amount','Department / Service','Status','Gateway Ref','Date','Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-bold text-text-muted uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {payments.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-text-muted">
                  <span className="material-symbols-outlined text-3xl block mb-2 opacity-30">payments</span>
                  No transactions yet
                </td></tr>
              ) : payments.map(p => (
                <tr key={p.id} className="border-b border-border hover:bg-surface-hover transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-secondary">{p.paymentNumber}</td>
                  <td className="px-4 py-3 font-bold text-text">₹{Number(p.amount).toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3 text-text-muted text-xs">{p.serviceRequest?.departmentId || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${STATUS_COLORS[p.status] || ''}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-text-muted">{p.gatewayPaymentId || p.gatewayOrderId || '—'}</td>
                  <td className="px-4 py-3 text-text-muted text-xs">{new Date(p.createdAt).toLocaleDateString('en-IN')}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {p.status === 'pending' && (
                        <button onClick={() => setPayTarget(p)}
                          className="inline-flex items-center gap-1 bg-secondary text-on-secondary text-xs font-bold px-3 py-1.5 rounded-lg hover:opacity-90 active:scale-95 transition">
                          <span className="material-symbols-outlined text-sm">credit_card</span> Pay
                        </button>
                      )}
                      <button onClick={() => handleDownload(p)} title="Download invoice"
                        className="inline-flex items-center gap-1 border border-border text-text-muted text-xs font-semibold px-3 py-1.5 rounded-lg hover:text-accent hover:border-accent active:scale-95 transition">
                        <span className="material-symbols-outlined text-sm">download</span> Invoice
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mock Razorpay checkout modal */}
      {payTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => !processing && setPayTarget(null)}>
          <div className="w-full max-w-sm rounded-2xl bg-surface border border-border overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="bg-[#0b1f3a] px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-white">account_balance</span>
                <span className="text-white font-bold">FinBridge · Razorpay</span>
              </div>
              <span className="text-[10px] font-bold bg-amber-400/90 text-black px-2 py-0.5 rounded">TEST MODE</span>
            </div>
            <div className="p-5 space-y-4">
              <div className="text-center">
                <p className="text-text-muted text-xs">Amount payable</p>
                <p className="text-3xl font-bold text-accent">₹{Number(payTarget.amount).toLocaleString('en-IN')}</p>
                <p className="text-text-muted text-xs mt-1 font-mono">{payTarget.paymentNumber}</p>
              </div>
              <div className="rounded-lg bg-surface-hover-lowest border border-border p-3 text-xs text-text-muted">
                This is a simulated payment for demo purposes — no real charge is made. Once live Razorpay
                keys are configured, this opens the secure Razorpay checkout.
              </div>
              <button onClick={confirmPay} disabled={processing}
                className="w-full bg-secondary text-on-secondary font-bold py-3 rounded-xl hover:opacity-90 active:scale-[0.99] transition disabled:opacity-60">
                {processing ? 'Processing…' : `Pay ₹${Number(payTarget.amount).toLocaleString('en-IN')}`}
              </button>
              <button onClick={() => setPayTarget(null)} disabled={processing}
                className="w-full text-text-muted text-sm py-1 hover:text-text transition disabled:opacity-60">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </B2BLayout>
  );
}
