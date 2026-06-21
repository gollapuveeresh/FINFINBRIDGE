import { useState, useEffect } from 'react';
import CRMAdminLayout from '../../layouts/CRMAdminLayout';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function CRMClients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const res = await api.get('/auth/clients');
      setClients(res.data.clients || []);
    } catch {
      toast.error('Failed to load clients');
    } finally {
      setLoading(false);
    }
  };

  const filtered = clients.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.companyName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <CRMAdminLayout>
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-headline-lg font-bold text-accent">Converted Clients</h1>
          <p className="text-text-muted mt-1">View list of all clients converted from CRM leads.</p>
        </div>
        <div className="text-sm text-text-muted card px-4 py-2">{filtered.length} clients</div>
      </div>

      {/* Search */}
      <div className="card p-4">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, email, or company..."
          className="w-full max-w-md px-4 py-2.5 rounded-xl border border-border bg-bg text-sm text-text focus:outline-none focus:border-purple-500"
        />
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface border-b border-border">
              <tr className="text-left">
                {['Client Name', 'Company Name', 'Email', 'Phone', 'Department', 'Joined Date'].map(h => (
                  <th key={h} className="px-5 py-3 text-text-muted font-semibold text-xs uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan={6} className="py-12 text-center text-text-muted">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="py-12 text-center text-text-muted">No clients found</td></tr>
              ) : filtered.map(client => (
                <tr key={client._id} className="hover:bg-surface/50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-purple-600/20 flex items-center justify-center text-purple-400 font-bold text-sm shrink-0">
                        {client.name?.[0]?.toUpperCase()}
                      </div>
                      <p className="font-semibold text-text">{client.name}</p>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-text font-semibold">{client.companyName || 'Individual Client'}</td>
                  <td className="px-5 py-4 text-text-muted text-xs">{client.email}</td>
                  <td className="px-5 py-4 text-text-muted text-xs">{client.phone || '—'}</td>
                  <td className="px-5 py-4 capitalize text-secondary font-semibold">{client.department || '—'}</td>
                  <td className="px-5 py-4 text-text-muted text-xs">{new Date(client.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </CRMAdminLayout>
  );
}
