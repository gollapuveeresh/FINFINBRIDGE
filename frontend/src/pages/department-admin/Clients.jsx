import { useState, useEffect } from 'react';
import DepartmentAdminLayout from '../../layouts/DepartmentAdminLayout';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';

const PRIORITY_COLOR = {
  hot: 'bg-red-500/20 text-red-400 border-red-500/30',
  warm: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  cold: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
};

export default function DepartmentAdminClients() {
  const { user } = useAuth();
  const dept = user?.department || 'loans';

  const [clients, setClients]         = useState([]);
  const [consultants, setConsultants] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [assigningId, setAssigningId] = useState(null);
  const [search, setSearch]           = useState('');

  useEffect(() => { fetchData(); }, [dept]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [lRes, cRes] = await Promise.all([
        api.get('/leads', { params: { department: dept } }),
        api.get('/auth/consultants', { params: { department: dept } }),
      ]);
      
      const allLeads = lRes.data.leads || [];
      const filteredLeads = allLeads.filter(l => 
        l.status !== 'lost' && 
        l.status !== 'rejected' &&
        !(l.assignedConsultantId || l.assignedConsultant?._id || l.assignedConsultant)
      );
      setClients(filteredLeads);
      setConsultants((cRes.data.consultants || []).filter(c => c.isActive));
    } catch { 
      toast.error('Failed to load clients'); 
    } finally { 
      setLoading(false); 
    }
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
    } catch { 
      toast.error('Assignment failed'); 
    } finally { 
      setAssigningId(null); 
    }
  };

  const handleSendFeeProposal = async (leadId) => {
    try {
      setAssigningId(leadId);
      await api.post(`/leads/${leadId}/send-fee-proposal`);
      toast.success('Fee proposal sent to client');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send fee proposal');
    } finally {
      setAssigningId(null);
    }
  };

  // Filter clients by search query
  const searchedClients = clients.filter(l =>
    l.name?.toLowerCase().includes(search.toLowerCase()) ||
    l.email?.toLowerCase().includes(search.toLowerCase())
  );

  // Sort: newest first
  const sortedClients = [...searchedClients].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <DepartmentAdminLayout>
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-headline-lg font-bold text-accent capitalize">{dept} — Consultation Request</h1>
          <p className="text-text-muted text-sm mt-1">Unassigned clients in your department awaiting assignment to a consultant</p>
        </div>
        <button onClick={fetchData} className="btn-ghost flex items-center gap-2 px-4 py-2 text-sm">
          <span className="material-symbols-outlined text-base">refresh</span> Refresh
        </button>
      </div>

      <div className="card p-4">
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">search</span>
          <input value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-bg text-sm"
            placeholder="Search by name or email..." />
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex justify-between items-center">
          <h2 className="font-bold text-accent">Clients list</h2>
          <span className="text-xs text-text-muted">{sortedClients.length} clients</span>
        </div>
        {loading ? (
          <div className="py-16 text-center text-text-muted">Loading...</div>
        ) : sortedClients.length === 0 ? (
          <div className="py-16 text-center text-text-muted">No unassigned clients in {dept} department yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface border-b border-border">
                <tr className="text-left text-text-muted text-xs uppercase tracking-wider">
                  {['Client', 'Email', 'Phone', 'Service Type', 'Status', 'Origin', 'Action'].map(h => (
                    <th key={h} className="px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {sortedClients.map(lead => {
                  const consultantVal = lead.assignedConsultantId || lead.assignedConsultant?._id || lead.assignedConsultant || '';
                  const isConverted = lead.status === 'won' || !!lead.convertedClientId;

                  return (
                    <tr key={lead._id} className="hover:bg-surface/50">
                      <td className="px-5 py-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-text">{lead.name}</span>
                          <span className={`w-fit mt-1 text-[9px] px-1.5 py-0.5 rounded-full border font-bold capitalize ${PRIORITY_COLOR[lead.priority] || 'bg-border/20 text-text-muted border-border/30'}`}>
                            {lead.priority || 'medium'}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-text-muted text-xs">{lead.email}</td>
                      <td className="px-5 py-4 text-text-muted text-xs">{lead.phone || '—'}</td>
                      <td className="px-5 py-4 text-text-muted text-xs font-semibold text-secondary">{lead.serviceType || '—'}</td>
                      <td className="px-5 py-4">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold capitalize ${
                          lead.status === 'won' ? 'bg-green-500/20 text-green-400' :
                          lead.status === 'assigned' ? 'bg-blue-500/20 text-blue-400' :
                          lead.status === 'pending_fee' ? 'bg-amber-500/20 text-amber-400' :
                          lead.status === 'fee_paid' ? 'bg-purple-500/20 text-purple-400' :
                          'bg-amber-500/20 text-amber-400'
                        }`}>{lead.status ? lead.status.replace('_', ' ') : 'new'}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-[10px] px-2 py-1 rounded-full font-semibold capitalize ${
                          isConverted 
                            ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' 
                            : 'bg-teal-500/10 text-teal-400 border border-teal-500/20'
                        }`}>
                          {isConverted ? 'Sent by a CRM' : 'Received by a client'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {(!lead.status || lead.status === 'qualified' || lead.status === 'new' || lead.status === 'won') ? (
                          <button
                            onClick={() => handleSendFeeProposal(lead._id)}
                            disabled={assigningId === lead._id}
                            className="px-3 py-1.5 bg-accent hover:bg-accent/80 text-bg rounded-xl text-xs font-semibold"
                          >
                            Send Fee Proposal
                          </button>
                        ) : lead.status === 'pending_fee' ? (
                          <span className="text-xs px-3 py-1.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-xl font-semibold">
                            Awaiting Payment
                          </span>
                        ) : lead.status === 'fee_paid' ? (
                          <select
                            value={consultantVal}
                            onChange={e => handleAssign(lead._id, e.target.value)}
                            disabled={assigningId === lead._id}
                            className="px-2 py-1.5 rounded-xl border border-border bg-bg text-xs max-w-[150px] font-semibold text-accent focus:outline-none focus:border-purple-500"
                          >
                            <option value="">Assign Consultant...</option>
                            {consultants.map(c => (
                              <option key={c._id} value={c._id}>{c.name}</option>
                            ))}
                          </select>
                        ) : (
                          <span className="text-text-muted text-xs">—</span>
                        )}
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
