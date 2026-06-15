import { useState, useEffect, useCallback } from 'react';
import ConsultantLayout from '../../layouts/ConsultantLayout';
import api from '../../services/api';
import toast from 'react-hot-toast';

const DEPTS = ['loans','tax','investment','insurance','wealth'];
const STATUS_COLORS = {
  draft: 'text-gray-400', sent: 'text-blue-400', paid: 'text-green-400',
  overdue: 'text-red-400', cancelled: 'text-gray-500',
};

const emptyItem = () => ({ description: '', amount: '' });

export default function ConsultantInvoices() {
  const [invoices, setInvoices] = useState([]);
  const [clients,  setClients]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    clientId: '', department: 'loans', serviceTitle: '',
    lineItems: [emptyItem()], taxPercent: 18, dueDate: '', notes: '',
  });

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      const [invRes, cliRes] = await Promise.all([
        api.get('/invoices'),
        api.get('/auth/consultant/clients'),
      ]);
      setInvoices(invRes.data.invoices || []);
      setClients(cliRes.data.clients || []);
    } catch { toast.error('Failed to load data'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const addLine  = () => setForm(f => ({ ...f, lineItems: [...f.lineItems, emptyItem()] }));
  const removeLine = (i) => setForm(f => ({ ...f, lineItems: f.lineItems.filter((_, idx) => idx !== i) }));
  const updateLine = (i, field, val) => setForm(f => {
    const items = [...f.lineItems];
    items[i] = { ...items[i], [field]: val };
    return { ...f, lineItems: items };
  });

  const subtotal = form.lineItems.reduce((s, li) => s + (parseFloat(li.amount) || 0), 0);
  const tax      = Math.round(subtotal * (form.taxPercent / 100));
  const total    = subtotal + tax;

  const submit = async (e) => {
    e.preventDefault();
    if (!form.clientId) return toast.error('Select a client');
    if (!form.serviceTitle.trim()) return toast.error('Service title required');
    if (form.lineItems.some(li => !li.description || !li.amount)) return toast.error('Complete all line items');
    try {
      await api.post('/invoices', {
        ...form,
        lineItems: form.lineItems.map(li => ({ description: li.description, amount: parseFloat(li.amount) })),
      });
      toast.success('Invoice created and sent to client');
      setShowForm(false);
      setForm({ clientId: '', department: 'loans', serviceTitle: '', lineItems: [emptyItem()], taxPercent: 18, dueDate: '', notes: '' });
      fetch();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to create invoice'); }
  };

  const markSent = async (id) => {
    try {
      await api.patch(`/invoices/${id}`, { status: 'sent' });
      toast.success('Invoice marked as sent');
      fetch();
    } catch { toast.error('Failed to update'); }
  };

  if (loading) return (
    <ConsultantLayout>
      <div className="text-center py-20 text-text-muted">Loading invoices...</div>
    </ConsultantLayout>
  );

  return (
    <ConsultantLayout>
      <div className="space-y-gutter">
        <div className="flex justify-between items-center flex-wrap gap-3">
          <div>
            <h2 className="text-headline-md font-bold text-accent">Invoices</h2>
            <p className="text-text-muted text-body-md mt-1">Create and track client invoices.</p>
          </div>
          <button onClick={() => setShowForm(true)} className="btn-primary px-5 py-2.5 text-sm">
            + Create Invoice
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total', value: invoices.length, c: 'text-blue-400' },
            { label: 'Sent', value: invoices.filter(i => i.status === 'sent').length, c: 'text-amber-400' },
            { label: 'Paid', value: invoices.filter(i => i.status === 'paid').length, c: 'text-green-400' },
            { label: 'Revenue', value: `₹${invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.totalAmount, 0).toLocaleString('en-IN')}`, c: 'text-green-400' },
          ].map(s => (
            <div key={s.label} className="card p-4 text-center">
              <p className={`text-2xl font-bold ${s.c}`}>{s.value}</p>
              <p className="text-xs text-text-muted mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Invoice list */}
        {invoices.length === 0
          ? <div className="card p-12 text-center text-text-muted">No invoices yet. Create your first invoice above.</div>
          : <div className="space-y-3">
              {invoices.map(inv => (
                <div key={inv._id} className="card p-5 flex justify-between items-center flex-wrap gap-3">
                  <div>
                    <p className="font-bold text-accent">{inv.invoiceNumber}</p>
                    <p className="text-sm text-text-muted mt-0.5">{inv.serviceTitle} · {inv.clientId?.name}</p>
                    <p className="text-xs text-text-muted capitalize mt-0.5">{inv.department}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-bold text-accent">₹{inv.totalAmount?.toLocaleString('en-IN')}</p>
                      <p className={`text-xs font-semibold capitalize ${STATUS_COLORS[inv.status]}`}>{inv.status}</p>
                    </div>
                    {inv.status === 'draft' && (
                      <button onClick={() => markSent(inv._id)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors">
                        Send to Client
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
        }

        {/* Create Invoice Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/70 z-50 flex items-start justify-center overflow-y-auto py-8 px-4">
            <div className="bg-surface rounded-3xl p-8 w-full max-w-2xl">
              <h2 className="text-xl font-bold mb-6">Create Invoice</h2>
              <form onSubmit={submit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-text-muted block mb-1">Client *</label>
                    <select value={form.clientId} onChange={e => setForm(f => ({ ...f, clientId: e.target.value }))}
                      className="w-full p-2.5 rounded-xl border border-border bg-bg text-sm">
                      <option value="">Select client</option>
                      {clients.map(c => <option key={c._id} value={c._id}>{c.name} ({c.email})</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-text-muted block mb-1">Department *</label>
                    <select value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))}
                      className="w-full p-2.5 rounded-xl border border-border bg-bg text-sm capitalize">
                      {DEPTS.map(d => <option key={d} value={d} className="capitalize">{d}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-text-muted block mb-1">Service Title *</label>
                  <input value={form.serviceTitle} onChange={e => setForm(f => ({ ...f, serviceTitle: e.target.value }))}
                    className="w-full p-2.5 rounded-xl border border-border bg-bg text-sm"
                    placeholder="e.g. ITR Filing FY 2024-25" />
                </div>

                {/* Line Items */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs text-text-muted">Line Items *</label>
                    <button type="button" onClick={addLine} className="text-xs text-primary hover:underline">+ Add Item</button>
                  </div>
                  {form.lineItems.map((li, i) => (
                    <div key={i} className="flex gap-2 mb-2">
                      <input value={li.description} onChange={e => updateLine(i, 'description', e.target.value)}
                        className="flex-1 p-2 rounded-xl border border-border bg-bg text-sm"
                        placeholder="Description" />
                      <input type="number" value={li.amount} onChange={e => updateLine(i, 'amount', e.target.value)}
                        className="w-28 p-2 rounded-xl border border-border bg-bg text-sm"
                        placeholder="₹ Amount" />
                      {form.lineItems.length > 1 && (
                        <button type="button" onClick={() => removeLine(i)} className="text-red-400 hover:text-red-300 px-2">✕</button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs text-text-muted block mb-1">GST %</label>
                    <input type="number" value={form.taxPercent} onChange={e => setForm(f => ({ ...f, taxPercent: parseFloat(e.target.value) || 0 }))}
                      className="w-full p-2.5 rounded-xl border border-border bg-bg text-sm" />
                  </div>
                  <div>
                    <label className="text-xs text-text-muted block mb-1">Due Date</label>
                    <input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
                      className="w-full p-2.5 rounded-xl border border-border bg-bg text-sm" />
                  </div>
                  <div className="flex flex-col justify-end">
                    <div className="bg-bg rounded-xl p-3 text-sm">
                      <div className="flex justify-between text-text-muted"><span>Subtotal</span><span>₹{subtotal.toLocaleString('en-IN')}</span></div>
                      <div className="flex justify-between text-text-muted"><span>GST</span><span>₹{tax.toLocaleString('en-IN')}</span></div>
                      <div className="flex justify-between font-bold text-accent border-t border-border/30 mt-1 pt-1"><span>Total</span><span>₹{total.toLocaleString('en-IN')}</span></div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-text-muted block mb-1">Notes</label>
                  <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                    className="w-full p-2.5 rounded-xl border border-border bg-bg text-sm h-20 resize-none"
                    placeholder="Any additional notes..." />
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="submit" className="flex-1 btn-primary py-3 font-semibold">Create Invoice</button>
                  <button type="button" onClick={() => setShowForm(false)} className="flex-1 btn-ghost py-3">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </ConsultantLayout>
  );
}
