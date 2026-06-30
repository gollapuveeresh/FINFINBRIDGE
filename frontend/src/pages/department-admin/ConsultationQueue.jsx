import { useState, useEffect } from 'react';
import DepartmentAdminLayout from '../../layouts/DepartmentAdminLayout';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function ConsultationQueue() {
  const { user } = useAuth();
  const dept = user?.department || 'loans';

  const [consultations, setConsultations] = useState([]);
  const [consultants, setConsultants]     = useState([]);
  const [loading, setLoading]             = useState(true);
  const [assigningId, setAssigningId]     = useState(null);

  useEffect(() => { fetchData(); }, [dept]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [cRes, advRes] = await Promise.all([
        api.get('/consultations'),
        api.get('/auth/consultants', { params: { department: dept } }),
      ]);
      setConsultations(cRes.data.data || []);
      setConsultants((advRes.data.consultants || []).filter(c => c.isActive));
    } catch { toast.error('Failed to load consultation requests'); }
    finally { setLoading(false); }
  };

  const handleAssign = async (consultationId, consultantId) => {
    if (!consultantId) return;
    try {
      setAssigningId(consultationId);
      await api.patch(`/consultations/${consultationId}/assign`, { consultantId });
      toast.success('Consultant assigned');
      fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Assignment failed'); }
    finally { setAssigningId(null); }
  };

  return (
    <DepartmentAdminLayout>
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-headline-lg font-bold text-accent capitalize">{dept} — Consultation Requests</h1>
          <p className="text-text-muted text-sm mt-1">Clients who booked a consultation for your department</p>
        </div>
        <button onClick={fetchData} className="btn-ghost flex items-center gap-2 px-4 py-2 text-sm">
          <span className="material-symbols-outlined text-base">refresh</span> Refresh
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-gutter">
        {[
          { label: 'Total Requests', value: consultations.length, color: 'text-accent', bg: 'bg-accent/10' },
          { label: 'Unassigned', value: consultations.filter(c => !c.consultantId).length, color: 'text-amber-400', bg: 'bg-amber-500/10' },
          { label: 'Assigned', value: consultations.filter(c => c.consultantId).length, color: 'text-green-400', bg: 'bg-green-500/10' },
        ].map((k, i) => (
          <div key={i} className="card p-5">
            <p className="text-text-muted text-xs font-semibold">{k.label}</p>
            <p className={`text-3xl font-bold mt-1 ${k.color}`}>{k.value}</p>
          </div>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="font-bold text-accent">Consultation Requests</h2>
        </div>
        {loading ? (
          <div className="py-16 text-center text-text-muted">Loading...</div>
        ) : consultations.length === 0 ? (
          <div className="py-16 text-center text-text-muted">No consultation requests for {dept} yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface border-b border-border">
                <tr className="text-left text-text-muted text-xs uppercase tracking-wider">
                  {['Client', 'Category', 'Notes', 'Requested On', 'Status', 'Consultant', 'Action'].map(h => (
                    <th key={h} className="px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {consultations.map(c => (
                  <tr key={c._id} className="hover:bg-surface/50">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-text">{c.clientId?.name || '—'}</p>
                      <p className="text-text-muted text-xs">{c.clientId?.email}</p>
                      {c.selectedPackage && (
                        <div className="mt-1">
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#D4AF37] bg-[#D4AF37]/10 px-1.5 py-0.5 rounded border border-[#D4AF37]/20 uppercase tracking-wider">
                            <span className="material-symbols-outlined text-[10px]">workspace_premium</span>
                            {c.selectedPackage}
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4 text-text-muted text-xs">{c.category}</td>
                    <td className="px-5 py-4 text-text-muted text-xs max-w-[180px]">
                      {c.selectedPackage === 'Custom Consultation Request' && c.customRequirement ? (
                        <div className="p-2 rounded border border-[#D4AF37]/15 bg-[#D4AF37]/5 text-text">
                          <p className="text-[9px] font-bold text-[#D4AF37] uppercase tracking-wider mb-0.5">Custom Req:</p>
                          <span className="line-clamp-3 italic font-normal">"{c.customRequirement}"</span>
                        </div>
                      ) : (
                        <span className="line-clamp-2">{c.clientNotes || '—'}</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-text-muted text-xs">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold capitalize ${
                        c.status === 'accepted' ? 'bg-green-500/20 text-green-400' :
                        c.status === 'completed' ? 'bg-blue-500/20 text-blue-400' :
                        c.status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
                        'bg-amber-500/20 text-amber-400'
                      }`}>{c.status}</span>
                    </td>
                    <td className="px-5 py-4 text-text-muted text-xs">
                      {c.consultantId?.name || <span className="text-amber-400 font-semibold">Unassigned</span>}
                    </td>
                    <td className="px-5 py-4">
                      <select
                        value={c.consultantId?._id || ''}
                        onChange={e => handleAssign(c._id, e.target.value)}
                        disabled={assigningId === c._id}
                        className="px-2 py-1.5 rounded-xl border border-border bg-bg text-xs max-w-[150px]"
                      >
                        <option value="">Assign...</option>
                        {consultants.map(adv => (
                          <option key={adv._id} value={adv._id}>{adv.name}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DepartmentAdminLayout>
  );
}
