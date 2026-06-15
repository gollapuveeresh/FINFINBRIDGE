import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DEPT_COLORS = ['#6366f1','#22d3ee','#f59e0b','#10b981','#f43f5e'];

export default function RevenueAnalytics() {
  const [payStats,  setPayStats]  = useState(null);
  const [invStats,  setInvStats]  = useState(null);
  const [payments,  setPayments]  = useState([]);
  const [invoices,  setInvoices]  = useState([]);
  const [loading,   setLoading]   = useState(true);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      const [ps, is, pList, iList] = await Promise.all([
        api.get('/payments/stats'),
        api.get('/invoices/stats'),
        api.get('/payments'),
        api.get('/invoices'),
      ]);
      setPayStats(ps.data.stats);
      setInvStats(is.data.stats);
      setPayments(pList.data.payments || []);
      setInvoices(iList.data.invoices || []);
    } catch { toast.error('Failed to load revenue data'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const monthlyData = (payStats?.monthlyRevenue || []).map(m => ({
    name: MONTHS[(m._id.month - 1)],
    revenue: m.revenue,
    count: m.count,
  }));

  const deptData = (invStats?.byDepartment || []).map(d => ({
    name: d._id?.charAt(0).toUpperCase() + d._id?.slice(1),
    value: d.revenue,
    count: d.count,
  }));

  if (loading) return (
    <AdminLayout>
      <div className="text-center py-20 text-text-muted">Loading revenue analytics...</div>
    </AdminLayout>
  );

  return (
    <AdminLayout>
      <div className="space-y-gutter">
        <div>
          <h2 className="text-headline-md font-bold text-accent">Revenue Analytics</h2>
          <p className="text-text-muted text-body-md mt-1">Full payment and revenue tracking across all departments.</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Revenue',    value: `₹${(payStats?.totalRevenue || 0).toLocaleString('en-IN')}`,    c: 'text-green-400' },
            { label: 'Transactions',     value: payStats?.totalTransactions || 0,                                c: 'text-blue-400' },
            { label: 'Total Invoiced',   value: `₹${(invStats?.totalInvoiced || 0).toLocaleString('en-IN')}`,   c: 'text-amber-400' },
            { label: 'Overdue Invoices', value: invStats?.overdueCount || 0,                                     c: 'text-red-400' },
          ].map(k => (
            <div key={k.label} className="card p-5 text-center">
              <p className={`text-2xl font-bold ${k.c}`}>{k.value}</p>
              <p className="text-xs text-text-muted mt-1">{k.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter">
          {/* Monthly Revenue Chart */}
          <div className="card p-6">
            <h3 className="font-bold text-accent mb-4">Monthly Revenue</h3>
            {monthlyData.length === 0
              ? <p className="text-text-muted text-sm text-center py-8">No data yet</p>
              : <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                    <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                    <Tooltip formatter={v => [`₹${v.toLocaleString('en-IN')}`, 'Revenue']} contentStyle={{ background: '#1e293b', border: '1px solid #334155' }} />
                    <Bar dataKey="revenue" fill="#6366f1" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
            }
          </div>

          {/* Department Revenue Pie */}
          <div className="card p-6">
            <h3 className="font-bold text-accent mb-4">Revenue by Department</h3>
            {deptData.length === 0
              ? <p className="text-text-muted text-sm text-center py-8">No paid invoices yet</p>
              : <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={deptData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`}>
                      {deptData.map((_, i) => <Cell key={i} fill={DEPT_COLORS[i % DEPT_COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={v => [`₹${v.toLocaleString('en-IN')}`, 'Revenue']} contentStyle={{ background: '#1e293b', border: '1px solid #334155' }} />
                  </PieChart>
                </ResponsiveContainer>
            }
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="card p-6">
          <h3 className="font-bold text-accent mb-4">Recent Transactions</h3>
          {payments.length === 0
            ? <p className="text-text-muted text-sm text-center py-8">No transactions yet.</p>
            : <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-border text-text-muted text-left">
                    {['Client','Invoice','Amount','Gateway','Method','Status','Date'].map(h => (
                      <th key={h} className="pb-3 pr-4 font-semibold">{h}</th>
                    ))}
                  </tr></thead>
                  <tbody className="divide-y divide-border/30">
                    {payments.slice(0, 20).map(p => (
                      <tr key={p._id}>
                        <td className="py-3 pr-4 text-accent">{p.clientId?.name || '—'}</td>
                        <td className="py-3 pr-4 text-text-muted">{p.invoiceId?.invoiceNumber || '—'}</td>
                        <td className="py-3 pr-4 font-semibold">₹{p.amount?.toLocaleString('en-IN')}</td>
                        <td className="py-3 pr-4 capitalize text-text-muted">{p.gateway}</td>
                        <td className="py-3 pr-4 capitalize text-text-muted">{p.method || '—'}</td>
                        <td className={`py-3 pr-4 font-semibold capitalize ${p.status === 'paid' ? 'text-green-400' : p.status === 'failed' ? 'text-red-400' : 'text-amber-400'}`}>{p.status}</td>
                        <td className="py-3 text-text-muted">{new Date(p.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
          }
        </div>

        {/* Invoice Management */}
        <div className="card p-6">
          <h3 className="font-bold text-accent mb-4">All Invoices</h3>
          {invoices.length === 0
            ? <p className="text-text-muted text-sm text-center py-8">No invoices yet.</p>
            : <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-border text-text-muted text-left">
                    {['Invoice#','Client','Consultant','Service','Department','Amount','Status','Date'].map(h => (
                      <th key={h} className="pb-3 pr-4 font-semibold">{h}</th>
                    ))}
                  </tr></thead>
                  <tbody className="divide-y divide-border/30">
                    {invoices.slice(0, 30).map(inv => (
                      <tr key={inv._id}>
                        <td className="py-3 pr-4 font-semibold text-accent">{inv.invoiceNumber}</td>
                        <td className="py-3 pr-4 text-text-muted">{inv.clientId?.name || '—'}</td>
                        <td className="py-3 pr-4 text-text-muted">{inv.consultantId?.name || '—'}</td>
                        <td className="py-3 pr-4 text-text-muted">{inv.serviceTitle}</td>
                        <td className="py-3 pr-4 capitalize text-text-muted">{inv.department}</td>
                        <td className="py-3 pr-4 font-semibold">₹{inv.totalAmount?.toLocaleString('en-IN')}</td>
                        <td className={`py-3 pr-4 font-semibold capitalize ${inv.status === 'paid' ? 'text-green-400' : inv.status === 'sent' ? 'text-blue-400' : inv.status === 'overdue' ? 'text-red-400' : 'text-gray-400'}`}>{inv.status}</td>
                        <td className="py-3 text-text-muted">{new Date(inv.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
          }
        </div>
      </div>
    </AdminLayout>
  );
}
