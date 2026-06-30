import React, { useState, useEffect } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import api from '../../services/api';
import toast from 'react-hot-toast';

const SOURCES = ['website_form','google_ads','facebook_ads','instagram','linkedin','referral','walk_in','call_center','partner_channel'];
const STATUSES = ['new','contacted','interested','qualified','rejected','lost','assigned','consultation','proposal','won'];
const DEPARTMENTS = ['loans','tax','investment','insurance','wealth'];
const PRIORITY_COLORS = { hot: 'bg-red-500/20 text-red-400 border-red-500/30', warm: 'bg-amber-500/20 text-amber-400 border-amber-500/30', cold: 'bg-blue-500/20 text-blue-400 border-blue-500/30' };
const STATUS_COLORS = { new: 'text-blue-400', contacted: 'text-cyan-400', interested: 'text-yellow-400', qualified: 'text-purple-400', rejected: 'text-red-400', lost: 'text-gray-400', assigned: 'text-indigo-400', consultation: 'text-orange-400', proposal: 'text-pink-400', won: 'text-green-400' };

export default function LeadManagement() {
  const [leads, setLeads] = useState([]);
  const [stats, setStats] = useState({ pipeline: [], bySource: [], byPriority: [] });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', priority: '', department: '', source: '', selectedPackage: '' });
  const [selected, setSelected] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [form, setForm] = useState({ name: '', email: '', phone: '', income: '', requirement: '', budget: '', source: 'website_form', department: '', serviceType: '' });
  const [consultants, setConsultants] = useState([]);

  useEffect(() => { fetchLeads(); fetchStats(); fetchConsultants(); }, [filters]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
      const res = await api.get('/leads', { params });
      setLeads(res.data.leads || []);
    } catch { toast.error('Failed to load leads'); }
    finally { setLoading(false); }
  };

  const fetchStats = async () => {
    try {
      const res = await api.get('/leads/stats');
      setStats(res.data);
    } catch {}
  };

  const fetchConsultants = async () => {
    try {
      const res = await api.get('/auth/consultants');
      setConsultants(res.data.consultants || []);
    } catch {}
  };

  const handleCreate = async () => {
    try {
      await api.post('/leads', form);
      toast.success('Lead created');
      setShowCreate(false);
      setForm({ name: '', email: '', phone: '', income: '', requirement: '', budget: '', source: 'website_form', department: '', serviceType: '' });
      fetchLeads(); fetchStats();
    } catch (e) { toast.error(e.response?.data?.message || 'Failed to create lead'); }
  };

  const handleUpdate = async (id, updates) => {
    try {
      const res = await api.patch(`/leads/${id}`, updates);
      setSelected(res.data.lead);
      setLeads(prev => prev.map(l => l._id === id ? res.data.lead : l));
      toast.success('Lead updated');
      fetchStats();
    } catch { toast.error('Update failed'); }
  };

  const handleAddNote = async () => {
    if (!noteText.trim()) return;
    try {
      const res = await api.post(`/leads/${selected._id}/note`, { text: noteText });
      setSelected(res.data.lead);
      setNoteText('');
      toast.success('Note added');
    } catch { toast.error('Failed to add note'); }
  };

  const handleConvert = async (id) => {
    if (!window.confirm('Convert this lead to a client?')) return;
    try {
      const res = await api.post(`/leads/${id}/convert`);
      const { isNewClient, tempPassword, client } = res.data;
      if (isNewClient) {
        toast.success(`Client account created! Temp password: ${tempPassword}`);
      } else {
        toast.success(`Lead linked to existing client: ${client.email}`);
      }
      fetchLeads(); fetchStats();
      setSelected(null);
    } catch (e) { toast.error(e.response?.data?.message || 'Conversion failed'); }
  };

  const totalLeads = stats.pipeline?.reduce((s, p) => s + p.count, 0) || 0;
  const wonLeads = stats.pipeline?.find(p => p.status === 'won')?.count || 0;
  const hotLeads = stats.byPriority?.find(p => p._id === 'hot')?.count || 0;

  return (
    <AdminLayout>
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-headline-lg font-bold text-accent">Lead Management</h1>
          <p className="text-text-muted text-body-md mt-1">Capture, score and qualify leads across all channels.</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2 px-6">
          <span className="material-symbols-outlined">add_circle</span> Add Lead
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter">
        {[
          { label: 'Total Leads', value: totalLeads, icon: 'contacts', color: 'text-accent' },
          { label: 'Hot Leads', value: hotLeads, icon: 'local_fire_department', color: 'text-red-400' },
          { label: 'Won / Converted', value: wonLeads, icon: 'check_circle', color: 'text-green-400' },
          { label: 'Conversion Rate', value: totalLeads ? `${((wonLeads / totalLeads) * 100).toFixed(1)}%` : '0%', icon: 'trending_up', color: 'text-secondary' },
        ].map((k, i) => (
          <div key={i} className="card p-6">
            <span className={`material-symbols-outlined text-3xl ${k.color}`}>{k.icon}</span>
            <p className="text-text-muted text-label-lg mt-2">{k.label}</p>
            <p className={`text-headline-md font-bold mt-1 ${k.color}`}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card p-5 flex flex-wrap gap-3">
        {[
          { key: 'status', options: STATUSES, placeholder: 'All Statuses' },
          { key: 'priority', options: ['hot', 'warm', 'cold'], placeholder: 'All Priorities' },
          { key: 'department', options: DEPARTMENTS, placeholder: 'All Departments' },
          { key: 'source', options: SOURCES, placeholder: 'All Sources' },
        ].map(f => (
          <select key={f.key} value={filters[f.key]} onChange={e => setFilters(p => ({ ...p, [f.key]: e.target.value }))}
            className="px-3 py-2 rounded-xl border border-border bg-bg text-sm text-text capitalize flex-1 min-w-[140px]">
            <option value="">{f.placeholder}</option>
            {f.options.map(o => <option key={o} value={o}>{o.replace(/_/g, ' ')}</option>)}
          </select>
        ))}
        <select value={filters.selectedPackage} onChange={e => setFilters(p => ({ ...p, selectedPackage: e.target.value }))}
          className="px-3 py-2 rounded-xl border border-border bg-bg text-sm text-text flex-1 min-w-[200px]">
          <option value="">All Packages</option>
          <option value="Custom Consultation Request">Custom Consultation Request</option>
        </select>
        <button onClick={() => setFilters({ status: '', priority: '', department: '', source: '', selectedPackage: '' })}
          className="px-4 py-2 rounded-xl border border-border text-text-muted hover:text-text text-sm">Reset</button>
      </div>

      {/* Leads Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface border-b border-border">
              <tr className="text-left">
                {['Lead ID', 'Name', 'Source', 'Department', 'Priority', 'Score', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-text-muted font-semibold text-xs uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan={8} className="py-12 text-center text-text-muted">Loading leads...</td></tr>
              ) : leads.length === 0 ? (
                <tr><td colSpan={8} className="py-12 text-center text-text-muted">No leads found</td></tr>
              ) : leads.map(lead => (
                <tr key={lead._id} className="hover:bg-surface/50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-text-muted">{lead.leadId}</td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-text">{lead.name}</p>
                    <p className="text-xs text-text-muted">{lead.email}</p>
                  </td>
                  <td className="px-4 py-3 text-text-muted capitalize">{lead.source?.replace(/_/g, ' ')}</td>
                  <td className="px-4 py-3 text-text capitalize">{lead.department || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full border text-xs font-semibold capitalize ${PRIORITY_COLORS[lead.priority]}`}>{lead.priority}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-16 bg-surface-hover-high rounded-full overflow-hidden">
                        <div className="h-full bg-secondary rounded-full" style={{ width: `${lead.score}%` }} />
                      </div>
                      <span className="text-xs font-bold text-accent">{lead.score}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`font-semibold capitalize text-xs ${STATUS_COLORS[lead.status]}`}>{lead.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => setSelected(lead)} className="text-accent hover:underline text-xs font-semibold">Manage</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lead Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-start justify-center pt-8 px-4 overflow-y-auto">
          <div className="bg-surface rounded-3xl p-8 w-full max-w-2xl mb-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-xs text-text-muted font-mono">{selected.leadId}</p>
                <h2 className="text-2xl font-bold text-accent">{selected.name}</h2>
                <p className="text-text-muted">{selected.email} • {selected.phone}</p>
              </div>
              <button onClick={() => setSelected(null)} className="p-2 rounded-xl hover:bg-surface-hover text-text-muted">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 rounded-2xl bg-bg">
                <p className="text-xs text-text-muted mb-1">Income</p>
                <p className="font-bold text-accent">₹{selected.income?.toLocaleString('en-IN') || '—'}</p>
              </div>
              <div className="p-4 rounded-2xl bg-bg">
                <p className="text-xs text-text-muted mb-1">Budget</p>
                <p className="font-bold text-accent">₹{selected.budget?.toLocaleString('en-IN') || '—'}</p>
              </div>
              <div className="p-4 rounded-2xl bg-bg col-span-2">
                <p className="text-xs text-text-muted mb-1">Requirement</p>
                <p className="font-semibold text-text">{selected.requirement || '—'}</p>
              </div>
              {selected.selectedPackage && (
                <div className="p-4 rounded-2xl bg-bg col-span-2 border border-[#D4AF37]/20 bg-[#D4AF37]/5">
                  <p className="text-xs text-[#D4AF37] font-bold uppercase tracking-wider mb-1">Selected Package</p>
                  <p className="font-semibold text-[#D4AF37]">{selected.selectedPackage}</p>
                  {selected.selectedPackage === 'Custom Consultation Request' && selected.customRequirement && (
                    <div className="mt-2 pt-2 border-t border-[#D4AF37]/10">
                      <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider mb-0.5">Custom Requirement</p>
                      <p className="text-xs text-text italic">"{selected.customRequirement}"</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="text-xs text-text-muted block mb-1">Status</label>
                <select value={selected.status} onChange={e => handleUpdate(selected._id, { status: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-border bg-bg text-sm capitalize">
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-text-muted block mb-1">Department</label>
                <select value={selected.department || ''} onChange={e => handleUpdate(selected._id, { department: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-border bg-bg text-sm capitalize">
                  <option value="">Unassigned</option>
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-text-muted block mb-1">Priority</label>
                <select value={selected.priority} onChange={e => handleUpdate(selected._id, { priority: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-border bg-bg text-sm capitalize">
                  {['hot','warm','cold'].map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-text-muted block mb-1">Assign Consultant</label>
                <select value={selected.assignedConsultant?._id || ''} onChange={e => handleUpdate(selected._id, { assignedConsultant: e.target.value || null })}
                  className="w-full p-2.5 rounded-xl border border-border bg-bg text-sm">
                  <option value="">Unassigned</option>
                  {consultants.map(c => <option key={c._id} value={c._id}>{c.name} ({c.department})</option>)}
                </select>
              </div>
            </div>

            {/* Notes */}
            <div className="mb-6">
              <h3 className="font-bold text-text mb-3">CRM Notes</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto mb-3">
                {selected.notes?.length > 0 ? selected.notes.map((n, i) => (
                  <div key={i} className="p-3 bg-bg rounded-xl">
                    <p className="text-sm text-text">{n.text}</p>
                    <p className="text-xs text-text-muted mt-1">{n.addedBy} · {new Date(n.addedAt).toLocaleDateString()}</p>
                  </div>
                )) : <p className="text-text-muted text-sm">No notes yet</p>}
              </div>
              <div className="flex gap-2">
                <input value={noteText} onChange={e => setNoteText(e.target.value)} placeholder="Add a note..."
                  className="flex-1 p-2.5 rounded-xl border border-border bg-bg text-sm" onKeyDown={e => e.key === 'Enter' && handleAddNote()} />
                <button onClick={handleAddNote} className="btn-primary px-4 py-2 text-sm">Add</button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              {selected.status !== 'won' && (
                <button onClick={() => handleConvert(selected._id)} className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-semibold transition-colors flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-lg">person_add</span> Convert to Client
                </button>
              )}
              <button onClick={() => setSelected(null)} className="flex-1 btn-ghost py-3">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Create Lead Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4">
          <div className="bg-surface rounded-3xl p-8 w-full max-w-lg">
            <h2 className="text-2xl font-bold mb-6">New Lead</h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                { key: 'name', label: 'Full Name', type: 'text', placeholder: 'John Doe' },
                { key: 'email', label: 'Email', type: 'email', placeholder: 'john@example.com' },
                { key: 'phone', label: 'Phone', type: 'text', placeholder: '+91 9876543210' },
                { key: 'income', label: 'Annual Income (₹)', type: 'number', placeholder: '1200000' },
                { key: 'budget', label: 'Budget (₹)', type: 'number', placeholder: '6000000' },
                { key: 'serviceType', label: 'Service Interest', type: 'text', placeholder: 'Home Loan' },
              ].map(f => (
                <div key={f.key} className={f.key === 'name' || f.key === 'email' ? 'col-span-2' : ''}>
                  <label className="text-xs text-text-muted block mb-1">{f.label}</label>
                  <input type={f.type} placeholder={f.placeholder} value={form[f.key]}
                    onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    className="w-full p-2.5 rounded-xl border border-border bg-bg text-sm" />
                </div>
              ))}
              <div>
                <label className="text-xs text-text-muted block mb-1">Source</label>
                <select value={form.source} onChange={e => setForm(p => ({ ...p, source: e.target.value }))}
                  className="w-full p-2.5 rounded-xl border border-border bg-bg text-sm capitalize">
                  {SOURCES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-text-muted block mb-1">Department</label>
                <select value={form.department} onChange={e => setForm(p => ({ ...p, department: e.target.value }))}
                  className="w-full p-2.5 rounded-xl border border-border bg-bg text-sm capitalize">
                  <option value="">Auto-assign</option>
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className="text-xs text-text-muted block mb-1">Requirement</label>
                <textarea value={form.requirement} onChange={e => setForm(p => ({ ...p, requirement: e.target.value }))}
                  className="w-full p-2.5 rounded-xl border border-border bg-bg text-sm h-20 resize-none"
                  placeholder="Brief description of client requirement..." />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowCreate(false)} className="flex-1 btn-ghost py-3">Cancel</button>
              <button onClick={handleCreate} className="flex-1 btn-primary py-3">Create Lead</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
