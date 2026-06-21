import { useState, useEffect } from 'react';
import DepartmentAdminLayout from '../../layouts/DepartmentAdminLayout';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';

const PRIORITY_COLOR = {
  hot: 'bg-red-500/20 text-red-400',
  warm: 'bg-amber-500/20 text-amber-400',
  cold: 'bg-blue-500/20 text-blue-400',
};

export default function DeptLeadQueue() {
  const { user } = useAuth();
  const dept = user?.department || 'loans';

  const [leads, setLeads]             = useState([]);
  const [consultants, setConsultants] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [assigningId, setAssigningId] = useState(null);

  useEffect(() => { fetchData(); }, [dept]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [lRes, cRes] = await Promise.all([
        api.get('/leads', { params: { department: dept } }),
        api.get('/auth/consultants', { params: { department: dept } }),
      ]);
      // Only show leads routed by CRM that do not have a consultant assigned yet
      const all = lRes.data.leads || [];
      setLeads(all.filter(l => !['new','contacted','interested','assigned','won','lost','rejected'].includes(l.status) && !l.assignedConsultant));
      setConsultants((cRes.data.consultants || []).filter(c => c.isActive));
    } catch { toast.error('Failed to load leads'); }
    finally { setLoading(false); }
  };

  const handleAssign = async (leadId, consultantId) => {
    try {
      setAssigningId(leadId);
      await api.patch(`/leads/${leadId}`, {
        assignedConsultant: consultantId || null,
        status: consultantId ? 'assigned' : 'qualified',
      });
      toast.success(consultantId ? 'Consultant assigned' : 'Unassigned');
      fetchData();
    } catch { toast.error('Assignment failed'); }
    finally { setAssigningId(null); }
  };

  return (
    <DepartmentAdminLayout>
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-headline-lg font-bold text-accent capitalize">{dept} — Lead Queue</h1>
          <p className="text-text-muted text-sm mt-1">Leads routed to your department by the CRM Admin</p>
        </div>
        <button onClick={fetchData} className="btn-ghost flex items-center gap-2 px-4 py-2 text-sm">
          <span className="material-symbols-outlined text-base">refresh</span> Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 gap-gutter">
        {[
          { label: 'Unassigned Leads', value: leads.length, color: 'text-amber-400', bg: 'bg-amber-500/10' },
          { label: 'Active Consultants', value: consultants.length, color: 'text-accent', bg: 'bg-accent/10' },
        ].map((k, i) => (
          <div key={i} className="card p-5">
            <p className="text-text-muted text-xs font-semibold">{k.label}</p>
            <p className={`text-3xl font-bold mt-1 ${k.color}`}>{k.value}</p>
          </div>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="font-bold text-accent">Routed Leads</h2>
        </div>
        {loading ? (
          <div className="py-16 text-center text-text-muted">Loading...</div>
        ) : leads.length === 0 ? (
          <div className="py-16 text-center text-text-muted">No leads routed to {dept} department yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface border-b border-border">
                <tr className="text-left text-text-muted text-xs uppercase tracking-wider">
                  {['Lead Name', 'Service', 'CRM Note', 'Consultant', 'Routed On', 'Status', 'Action'].map(h => (
                    <th key={h} className="px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {leads.map(lead => {
                  const crmNote = lead.notes?.find(n => n.text?.startsWith('[CRM'));
                  return (
                    <tr key={lead._id} className="hover:bg-surface/50">
                      <td className="px-5 py-4">
                        <p className="font-semibold text-text">{lead.name}</p>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold capitalize ${PRIORITY_COLOR[lead.priority]}`}>
                          {lead.priority}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-text-muted text-xs">{lead.serviceType || '—'}</td>
                      <td className="px-5 py-4 text-text-muted text-xs max-w-[180px]">
                        <span className="line-clamp-2">{crmNote ? crmNote.text.replace(/^\[CRM[^\]]*\]\s*/, '') : '—'}</span>
                      </td>
                      <td className="px-5 py-4 text-text-muted text-xs">
                        {lead.assignedConsultant?.name || <span className="text-amber-400 font-semibold">Unassigned</span>}
                      </td>
                      <td className="px-5 py-4 text-text-muted text-xs">
                        {new Date(lead.updatedAt).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold capitalize ${
                          lead.status === 'won' ? 'bg-green-500/20 text-green-400' :
                          lead.status === 'assigned' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-amber-500/20 text-amber-400'
                        }`}>{lead.status}</span>
                      </td>
                      <td className="px-5 py-4">
                        <select
                          value={lead.assignedConsultant?._id || ''}
                          onChange={e => handleAssign(lead._id, e.target.value)}
                          disabled={assigningId === lead._id}
                          className="px-2 py-1.5 rounded-xl border border-border bg-bg text-xs max-w-[150px]"
                        >
                          <option value="">Assign...</option>
                          {consultants.map(c => (
                            <option key={c._id} value={c._id}>{c.name}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DepartmentAdminLayout>
  );
}
