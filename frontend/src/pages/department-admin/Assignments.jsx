import { useState, useEffect } from 'react';
import DepartmentAdminLayout from '../../layouts/DepartmentAdminLayout';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function DeptAssignments() {
  const { user } = useAuth();
  const dept = user?.department || 'loans';

  const [consultants, setConsultants] = useState([]);
  const [leads, setLeads]             = useState([]);
  const [loading, setLoading]         = useState(true);

  useEffect(() => { fetchData(); }, [dept]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [cRes, lRes] = await Promise.all([
        api.get('/auth/consultants', { params: { department: dept } }),
        api.get('/leads', { params: { department: dept } }),
      ]);
      setConsultants(cRes.data.consultants || []);
      setLeads(lRes.data.leads || []);
    } catch { toast.error('Failed to load data'); }
    finally { setLoading(false); }
  };

  // Count assigned leads per consultant
  const getLoad = (consultantId) =>
    leads.filter(l => l.assignedConsultant?._id === consultantId || l.assignedConsultant === consultantId).length;

  return (
    <DepartmentAdminLayout>
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-headline-lg font-bold text-accent capitalize">{dept} — Assignments</h1>
          <p className="text-text-muted text-sm mt-1">All consultants and their current client load</p>
        </div>
        <button onClick={fetchData} className="btn-ghost flex items-center gap-2 px-4 py-2 text-sm">
          <span className="material-symbols-outlined text-base">refresh</span> Refresh
        </button>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-3 gap-gutter">
        {[
          { label: 'Total Consultants', value: consultants.length, color: 'text-accent', bg: 'bg-accent/10' },
          { label: 'Active', value: consultants.filter(c => c.isActive).length, color: 'text-green-400', bg: 'bg-green-500/10' },
          { label: 'Total Assigned Leads', value: leads.filter(l => l.assignedConsultant).length, color: 'text-blue-400', bg: 'bg-blue-500/10' },
        ].map((k, i) => (
          <div key={i} className="card p-5">
            <p className="text-text-muted text-xs font-semibold">{k.label}</p>
            <p className={`text-3xl font-bold mt-1 ${k.color}`}>{k.value}</p>
          </div>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="font-bold text-accent">Consultant Overview</h2>
        </div>
        {loading ? (
          <div className="py-16 text-center text-text-muted">Loading...</div>
        ) : consultants.length === 0 ? (
          <div className="py-16 text-center text-text-muted">No consultants in {dept} department yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface border-b border-border">
                <tr className="text-left text-text-muted text-xs uppercase tracking-wider">
                  {['Consultant', 'Email', 'Phone', 'Status', 'Client Load', 'Capacity'].map(h => (
                    <th key={h} className="px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {consultants.map(c => {
                  const load = getLoad(c._id);
                  const MAX = 10;
                  const pct = Math.min(Math.round((load / MAX) * 100), 100);
                  return (
                    <tr key={c._id} className="hover:bg-surface/50">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold text-sm">
                            {c.name?.[0]?.toUpperCase()}
                          </div>
                          <p className="font-semibold text-text">{c.name}</p>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-text-muted text-xs">{c.email}</td>
                      <td className="px-5 py-4 text-text-muted text-xs">{c.phone || '—'}</td>
                      <td className="px-5 py-4">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${c.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                          {c.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-bold text-accent">{load}</td>
                      <td className="px-5 py-4 min-w-[140px]">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-surface rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${pct >= 80 ? 'bg-red-500' : pct >= 50 ? 'bg-amber-500' : 'bg-green-500'}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-xs text-text-muted w-8">{pct}%</span>
                        </div>
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
