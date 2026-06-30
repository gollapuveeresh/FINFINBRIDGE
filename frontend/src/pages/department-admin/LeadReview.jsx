import React, { useState, useEffect } from 'react';
import DepartmentAdminLayout from '../../layouts/DepartmentAdminLayout';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const STATUSES = ['new','contacted','interested','qualified','assigned','consultation','proposal','won','rejected','lost'];
const PRIORITY_COLORS = { hot: 'text-red-400 bg-red-500/10', warm: 'text-amber-400 bg-amber-500/10', cold: 'text-blue-400 bg-blue-500/10' };

export default function DepartmentLeadReview() {
  const { user } = useAuth();
  const department = user?.department || 'loans';
  const [leads, setLeads] = useState([]);
  const [consultants, setConsultants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => { fetchLeads(); fetchConsultants(); }, [department]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      // Fetch leads assigned to this department OR unassigned (null) so dept admin can claim them
      const [deptRes, unassignedRes] = await Promise.all([
        api.get('/leads', { params: { department } }),
        api.get('/leads', { params: { department: '' } })
      ]);
      const deptLeads = deptRes.data.leads || [];
      // Only include unassigned if they have no department set
      const unassigned = (unassignedRes.data.leads || []).filter(l => !l.department);
      // Merge, deduplicate by _id
      const merged = [...deptLeads];
      unassigned.forEach(u => { if (!merged.find(l => l._id === u._id)) merged.push(u); });
      setLeads(merged);
    } catch { toast.error('Failed to load leads'); }
    finally { setLoading(false); }
  };

  const fetchConsultants = async () => {
    try {
      const res = await api.get('/auth/consultants');
      setConsultants((res.data.consultants || []).filter(c => c.department === department));
    } catch {}
  };

  const handleAssign = async (leadId, consultantId) => {
    try {
      const res = await api.patch(`/leads/${leadId}`, { assignedConsultant: consultantId || null, status: consultantId ? 'assigned' : 'qualified' });
      setLeads(prev => prev.map(l => l._id === leadId ? res.data.lead : l));
      if (selected?._id === leadId) setSelected(res.data.lead);
      toast.success('Consultant assigned');
    } catch { toast.error('Assignment failed'); }
  };

  const handleStatusChange = async (leadId, status) => {
    try {
      const res = await api.patch(`/leads/${leadId}`, { status });
      setLeads(prev => prev.map(l => l._id === leadId ? res.data.lead : l));
      if (selected?._id === leadId) setSelected(res.data.lead);
      toast.success('Status updated');
    } catch { toast.error('Update failed'); }
  };

  const pending = leads.filter(l => !['assigned','consultation','proposal','won'].includes(l.status));
  const assigned = leads.filter(l => ['assigned','consultation','proposal'].includes(l.status));
  const won = leads.filter(l => l.status === 'won');

  return (
    <DepartmentAdminLayout>
      <div className="flex justify-between items-start mb-2">
        <div>
          <h1 className="text-headline-lg font-bold text-accent capitalize">{department} — Lead Review</h1>
          <p className="text-text-muted">Review incoming leads for your department + unassigned leads you can claim.</p>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-3 gap-gutter">
        {[
          { label: 'Pending Review', value: pending.length, color: 'text-amber-400' },
          { label: 'Assigned / Active', value: assigned.length, color: 'text-blue-400' },
          { label: 'Converted', value: won.length, color: 'text-green-400' },
        ].map((k, i) => (
          <div key={i} className="card p-5 text-center">
            <p className="text-text-muted text-xs">{k.label}</p>
            <p className={`text-3xl font-bold mt-1 ${k.color}`}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Leads Table */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex justify-between items-center">
          <h2 className="font-bold text-accent">All Leads — {department} Department</h2>
          <span className="text-xs text-text-muted">{leads.length} leads</span>
        </div>
        {loading ? (
          <div className="py-16 text-center text-text-muted">Loading...</div>
        ) : leads.length === 0 ? (
          <div className="py-16 text-center text-text-muted">No leads assigned to {department} department yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface">
                <tr className="text-left">
                  {['Lead', 'Contact', 'Priority', 'Score', 'Status', 'Assigned To', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-text-muted font-semibold text-xs uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {leads.map(lead => (
                  <tr key={lead._id} className="hover:bg-surface/50">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-text">{lead.name}</p>
                      <p className="text-xs font-mono text-text-muted">{lead.leadId}</p>
                      {!lead.department && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-semibold mt-1 inline-block">Unassigned</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-text-muted text-xs">{lead.email}<br/>{lead.phone}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${PRIORITY_COLORS[lead.priority]}`}>{lead.priority}</span>
                    </td>
                    <td className="px-4 py-3 font-bold text-accent">{lead.score}</td>
                    <td className="px-4 py-3">
                      <select value={lead.status} onChange={e => handleStatusChange(lead._id, e.target.value)}
                        className="px-2 py-1 rounded-xl border border-border bg-bg text-xs capitalize">
                        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <select value={lead.assignedConsultant?._id || ''} onChange={e => handleAssign(lead._id, e.target.value)}
                        className="px-2 py-1 rounded-xl border border-border bg-bg text-xs max-w-[140px]">
                        <option value="">Unassigned</option>
                        {consultants.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => setSelected(lead)} className="text-accent hover:underline text-xs font-semibold">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4">
          <div className="bg-surface rounded-3xl p-8 w-full max-w-lg">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-xs text-text-muted font-mono">{selected.leadId}</p>
                <h2 className="text-xl font-bold text-accent">{selected.name}</h2>
              </div>
              <button onClick={() => setSelected(null)} className="p-2 rounded-xl hover:bg-surface-hover text-text-muted">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="space-y-3 mb-6">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-bg rounded-xl"><p className="text-xs text-text-muted">Email</p><p className="text-sm font-semibold">{selected.email}</p></div>
                <div className="p-3 bg-bg rounded-xl"><p className="text-xs text-text-muted">Phone</p><p className="text-sm font-semibold">{selected.phone || '—'}</p></div>
                <div className="p-3 bg-bg rounded-xl"><p className="text-xs text-text-muted">Income</p><p className="text-sm font-semibold">₹{selected.income?.toLocaleString('en-IN') || '—'}</p></div>
                <div className="p-3 bg-bg rounded-xl"><p className="text-xs text-text-muted">Budget</p><p className="text-sm font-semibold">₹{selected.budget?.toLocaleString('en-IN') || '—'}</p></div>
              </div>
              {selected.serviceType && (
                <div className="p-3 bg-bg rounded-xl">
                  <p className="text-xs text-text-muted mb-1">Service Requested</p>
                  <p className="text-sm font-semibold text-secondary">{selected.serviceType}</p>
                </div>
              )}
              {selected.requirement && (
                <div className="p-3 bg-bg rounded-xl"><p className="text-xs text-text-muted mb-1">Requirement</p><p className="text-sm">{selected.requirement}</p></div>
              )}
              {selected.selectedPackage && (
                <div className="p-3 bg-bg rounded-xl border border-[#D4AF37]/20 bg-[#D4AF37]/5">
                  <p className="text-xs text-[#D4AF37] font-bold uppercase tracking-wider mb-1">Selected Package</p>
                  <p className="text-sm font-semibold text-[#D4AF37]">{selected.selectedPackage}</p>
                  {selected.selectedPackage === 'Custom Consultation Request' && selected.customRequirement && (
                    <div className="mt-2 pt-2 border-t border-[#D4AF37]/10">
                      <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider mb-0.5">Custom Requirement</p>
                      <p className="text-xs text-text italic">"{selected.customRequirement}"</p>
                    </div>
                  )}
                </div>
              )}
              {selected.notes?.length > 0 && (
                <div>
                  <p className="text-xs text-text-muted mb-2">Notes</p>
                  {selected.notes.map((n, i) => (
                    <div key={i} className="p-2 bg-bg rounded-xl mb-1 text-xs">{n.text} <span className="text-text-muted">— {n.addedBy}</span></div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex gap-3">
              {!selected.department && (
                <button
                  onClick={async () => {
                    try {
                      const res = await api.patch(`/leads/${selected._id}`, { department });
                      setSelected(res.data.lead);
                      setLeads(prev => prev.map(l => l._id === selected._id ? res.data.lead : l));
                      toast.success(`Lead claimed for ${department} department`);
                    } catch { toast.error('Failed to claim lead'); }
                  }}
                  className="flex-1 py-2.5 bg-secondary/20 hover:bg-secondary/30 text-secondary border border-secondary/40 rounded-2xl font-semibold text-sm transition-colors"
                >
                  Claim for {department}
                </button>
              )}
              <button onClick={() => setSelected(null)} className="flex-1 btn-ghost py-3">Close</button>
            </div>
          </div>
        </div>
      )}
    </DepartmentAdminLayout>
  );
}
