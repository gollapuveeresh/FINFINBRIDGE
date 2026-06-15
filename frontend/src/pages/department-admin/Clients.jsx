import { useState, useEffect } from 'react';
import DepartmentAdminLayout from '../../layouts/DepartmentAdminLayout';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function DepartmentAdminClients() {
  const { user } = useAuth();
  const dept = user?.department || 'loans';

  const [clients, setClients]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');

  useEffect(() => { fetchClients(); }, [dept]);

  const fetchClients = async () => {
    try {
      setLoading(true);
      // Get won leads in this dept that have been converted to clients
      const res = await api.get('/leads', { params: { department: dept } });
      const won = (res.data.leads || []).filter(l => l.status === 'won' && l.convertedClientId);
      setClients(won);
    } catch { toast.error('Failed to load clients'); }
    finally { setLoading(false); }
  };

  const filtered = clients.filter(l =>
    l.name?.toLowerCase().includes(search.toLowerCase()) ||
    l.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DepartmentAdminLayout>
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-headline-lg font-bold text-accent capitalize">{dept} — Client Queue</h1>
          <p className="text-text-muted text-sm mt-1">All clients in your department</p>
        </div>
        <button onClick={fetchClients} className="btn-ghost flex items-center gap-2 px-4 py-2 text-sm">
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
          <h2 className="font-bold text-accent">Active Clients</h2>
          <span className="text-xs text-text-muted">{filtered.length} clients</span>
        </div>
        {loading ? (
          <div className="py-16 text-center text-text-muted">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-text-muted">No clients in {dept} department yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface border-b border-border">
                <tr className="text-left text-text-muted text-xs uppercase tracking-wider">
                  {['Client', 'Email', 'Phone', 'Service', 'Consultant', 'Converted On'].map(h => (
                    <th key={h} className="px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map(lead => (
                  <tr key={lead._id} className="hover:bg-surface/50">
                    <td className="px-5 py-4 font-semibold text-text">{lead.name}</td>
                    <td className="px-5 py-4 text-text-muted text-xs">{lead.email}</td>
                    <td className="px-5 py-4 text-text-muted text-xs">{lead.phone || '—'}</td>
                    <td className="px-5 py-4 text-text-muted text-xs">{lead.serviceType || '—'}</td>
                    <td className="px-5 py-4 text-text-muted text-xs">
                      {lead.assignedConsultant?.name || <span className="text-amber-400">Unassigned</span>}
                    </td>
                    <td className="px-5 py-4 text-text-muted text-xs">
                      {new Date(lead.updatedAt).toLocaleDateString()}
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
