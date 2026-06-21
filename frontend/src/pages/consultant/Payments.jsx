import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ConsultantLayout from '../../layouts/ConsultantLayout';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function ConsultantPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEarned: 0,
    paidAmount: 0,
    pendingAmount: 0,
    payoutCount: 0
  });

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/consultations/payments');
      const list = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      setPayments(list);

      // Compute statistics
      let total = 0;
      let paid = 0;
      let pending = 0;
      let count = 0;

      list.forEach(p => {
        const amt = Number(p.commissionAmount || 0);
        if (p.status === 'paid') {
          paid += amt;
          count++;
        } else {
          pending += amt;
        }
        total += amt;
      });

      setStats({
        totalEarned: total,
        paidAmount: paid,
        pendingAmount: pending,
        payoutCount: count
      });
    } catch (err) {
      toast.error('Failed to load payments ledger');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  return (
    <ConsultantLayout>
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-headline-lg font-bold text-accent">Earnings & Commission Ledger</h1>
          <p className="text-body-md text-text-muted mt-1">
            Track your 20% consultant commission payouts for verified client consultations.
          </p>
        </div>
        <button 
          onClick={fetchPayments} 
          className="btn-ghost flex items-center gap-2 px-4 py-2 text-sm"
        >
          <span className="material-symbols-outlined text-base">refresh</span> Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter my-6">
        {[
          { 
            label: 'Total Commissions', 
            value: `₹${stats.totalEarned.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 
            color: 'text-accent', 
            bg: 'bg-accent/10',
            icon: 'payments'
          },
          { 
            label: 'Paid to Account', 
            value: `₹${stats.paidAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 
            color: 'text-green-400', 
            bg: 'bg-green-500/10',
            icon: 'account_balance_wallet'
          },
          { 
            label: 'Pending Payouts', 
            value: `₹${stats.pendingAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 
            color: 'text-amber-400', 
            bg: 'bg-amber-500/10',
            icon: 'pending'
          },
        ].map((k, i) => (
          <div key={i} className="card p-6 flex justify-between items-center">
            <div>
              <p className="text-text-muted text-xs font-semibold uppercase tracking-wider">{k.label}</p>
              <p className={`text-2xl font-bold mt-2 ${k.color}`}>{k.value}</p>
            </div>
            <div className={`p-3 rounded-xl ${k.bg} shrink-0`}>
              <span className={`material-symbols-outlined ${k.color} text-[28px]`}>{k.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Ledger Table */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-surface-hover-lowest">
          <h2 className="font-bold text-accent">Payout History</h2>
          <span className="text-xs px-2.5 py-1 bg-accent/10 text-accent rounded-full font-bold">
            {payments.length} transactions
          </span>
        </div>

        {loading ? (
          <div className="py-16 text-center text-text-muted flex flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
            <p className="font-semibold text-sm">Loading ledger...</p>
          </div>
        ) : payments.length === 0 ? (
          <div className="py-20 text-center text-text-muted">
            <span className="material-symbols-outlined text-[48px] text-text-faint">currency_rupee</span>
            <p className="mt-3 text-body-md font-semibold">No payments recorded yet.</p>
            <p className="text-xs mt-1 text-text-faint">Commissions are credited automatically when department admins verify completed meetings.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface border-b border-border">
                <tr className="text-left text-text-muted text-xs uppercase tracking-wider">
                  <th className="px-6 py-4">Client Name</th>
                  <th className="px-6 py-4">Department</th>
                  <th className="px-6 py-4">Standard Consultation Fee</th>
                  <th className="px-6 py-4">Your Commission (20%)</th>
                  <th className="px-6 py-4">Processed Date</th>
                  <th className="px-6 py-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {payments.map(p => (
                  <tr key={p.id} className="hover:bg-surface/50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-text">
                      {p.clientName || '—'}
                    </td>
                    <td className="px-6 py-4 capitalize text-text-muted">
                      {p.department || '—'}
                    </td>
                    <td className="px-6 py-4 text-text-muted">
                      ₹{Number(p.feeAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 font-bold text-accent">
                      ₹{Number(p.commissionAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-xs text-text-muted">
                      {p.processedAt ? new Date(p.processedAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`status-badge ${p.status === 'paid' ? 'status-success' : 'status-warning'}`}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </ConsultantLayout>
  );
}
