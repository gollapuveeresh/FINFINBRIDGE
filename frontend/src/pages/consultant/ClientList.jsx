import ConsultantLayout from '../../layouts/ConsultantLayout';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../../services/api';

export const clientPortfolio = [
  { name: 'Harrington Innovations LLC', contact: 'James Harrington', email: 'j.harrington@harrington.com', aum: '$4.2M', since: 'Jan 2021', tier: 'Platinum', score: 92, status: 'Active' },
  { name: 'Meridian Capital Group', contact: 'Sarah Mitchell', email: 's.mitchell@meridian.com', aum: '$8.7M', since: 'Mar 2020', tier: 'Platinum', score: 87, status: 'Active' },
  { name: 'Pacific Rim Ventures', contact: 'David Chen', email: 'd.chen@pacificrim.com', aum: '$1.9M', since: 'Jun 2022', tier: 'Gold', score: 74, status: 'Active' },
  { name: 'Cornerstone Real Estate', contact: 'Emma Williams', email: 'e.williams@cornerstone.com', aum: '$3.4M', since: 'Sep 2021', tier: 'Gold', score: 81, status: 'Review' },
  { name: 'Alpine Investment Partners', contact: 'Michael Steiner', email: 'm.steiner@alpine.com', aum: '$12.1M', since: 'Feb 2019', tier: 'Platinum', score: 95, status: 'Active' },
  { name: 'NextGen Fintech Solutions', contact: 'Priya Sharma', email: 'p.sharma@nextgen.com', aum: '$0.8M', since: 'Nov 2023', tier: 'Silver', score: 62, status: 'Onboarding' },
];

const tierColors = {
  Platinum: 'bg-accent-fixed text-accent',
  Gold: 'bg-accent/20 text-secondary',
  Silver: 'bg-surface-hover-high text-text-muted',
};

const allStatuses = ['All', 'Active', 'Review', 'Onboarding', 'Lead'];
const allTiers = ['All', 'Platinum', 'Gold', 'Silver'];

const STORAGE_KEY = 'finbridge_added_clients';
const emptyForm = { name: '', contact: '', email: '', aum: '', since: '', tier: 'Silver', score: 70, status: 'Onboarding' };

export default function MyClients() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [tierFilter, setTierFilter] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const [apiClients, setApiClients] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addedClients, setAddedClients] = useState([]);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    // Pull clients from lead pipeline (won/assigned leads)
    api.get('/auth/consultant/clients').then(r => {
      const list = (r.data.clients || []).map(c => ({
        name: c.name,
        contact: c.name,
        email: c.email,
        aum: '—',
        since: new Date(c.createdAt || Date.now()).toLocaleString('en-US', { month: 'short', year: 'numeric' }),
        tier: 'Silver',
        score: 70,
        status: 'Active',
        _id: c._id,
      }));
      setApiClients(prev => [...list, ...prev.filter(p => p.status === 'Lead')]);
    }).catch(() => {});

    // Pull leads from the lead pipeline that haven't been converted to clients yet
    api.get('/leads', { params: { status: 'assigned' } }).then(r => {
      const list = (r.data.leads || []).filter(l => !l.convertedClientId).map(l => ({
        name: l.name,
        contact: l.name,
        email: l.email,
        aum: '—',
        since: new Date(l.createdAt || Date.now()).toLocaleString('en-US', { month: 'short', year: 'numeric' }),
        tier: 'Silver',
        score: l.score || 0,
        status: 'Lead',
        _id: l._id,
      }));
      setApiClients(prev => [...prev.filter(p => p.status !== 'Lead'), ...list]);
    }).catch(() => {});

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setAddedClients(JSON.parse(raw));
    } catch (e) { /* ignore */ }
  }, []);

  const persist = (list) => {
    setAddedClients(list);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); } catch (e) { /* ignore */ }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.contact.trim() || !form.email.trim()) return;
    const newClient = {
      ...form,
      score: Number(form.score) || 70,
      aum: form.aum || '$0.0M',
      since: form.since || new Date().toLocaleString('en-US', { month: 'short', year: 'numeric' }),
    };
    persist([...addedClients, newClient]);
    setForm(emptyForm);
    setShowAddModal(false);
  };

  const allClients = [...apiClients, ...addedClients];

  const filtered = allClients.filter((client) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      client.name.toLowerCase().includes(q) ||
      client.contact.toLowerCase().includes(q) ||
      client.email.toLowerCase().includes(q) ||
      client.tier.toLowerCase().includes(q) ||
      client.status.toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'All' || client.status === statusFilter;
    const matchesTier = tierFilter === 'All' || client.tier === tierFilter;
    return matchesSearch && matchesStatus && matchesTier;
  });

  return (
    <ConsultantLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-headline-lg font-bold text-accent">My Clients</h1>
          <p className="text-body-md text-text-muted mt-1">Manage your full client portfolio and relationships.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter">
        {[
          { label: 'Total Clients', value: String(allClients.length), icon: 'people', color: 'text-accent bg-accent/10' },
          { label: 'Total AUM', value: '$89.4M', icon: 'account_balance', color: 'text-secondary bg-secondary/10' },
          { label: 'Active', value: String(allClients.filter(c => c.status === 'Active').length), icon: 'check_circle', color: 'text-success bg-success/10' },
          { label: 'Avg Health Score', value: '82/100', icon: 'favorite', color: 'text-error bg-error/10' },
        ].map((s, i) => (
          <div key={i} className="card p-6 flex items-center gap-4">
            <div className={`p-3 rounded-xl ${s.color.split(' ')[1]}`}>
              <span className={`material-symbols-outlined ${s.color.split(' ')[0]}`}>{s.icon}</span>
            </div>
            <div>
              <p className="text-text-muted text-label-lg">{s.label}</p>
              <p className="text-headline-md font-bold text-accent">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Clients Table */}
      <div className="card overflow-hidden">
        <div className="px-8 py-5 border-b border-border flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="text-headline-md font-bold text-accent">Client Portfolio</h2>
          <div className="flex gap-3 flex-wrap">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">search</span>
              <input
                className="pl-9 pr-4 py-2 rounded-lg border border-border text-body-sm bg-surface focus:outline-none focus:border-secondary"
                placeholder="Search clients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 text-label-lg border px-4 py-2 rounded-lg transition-colors ${showFilters ? 'bg-accent text-on-primary border-accent' : 'text-text-muted border-border hover:bg-surface'}`}
            >
              <span className="material-symbols-outlined text-sm">filter_list</span>Filter
            </button>
          </div>
        </div>

        {/* Filter Dropdowns */}
        {showFilters && (
          <div className="px-8 py-4 border-b border-border bg-surface-hover-lowest flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <label className="text-label-lg font-bold text-accent text-sm">Status:</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 border border-border bg-surface rounded-lg text-body-sm focus:outline-none focus:border-secondary"
              >
                {allStatuses.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-label-lg font-bold text-accent text-sm">Tier:</label>
              <select
                value={tierFilter}
                onChange={(e) => setTierFilter(e.target.value)}
                className="px-3 py-1.5 border border-border bg-surface rounded-lg text-body-sm focus:outline-none focus:border-secondary"
              >
                {allTiers.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            {(statusFilter !== 'All' || tierFilter !== 'All' || searchQuery) && (
              <button
                onClick={() => { setStatusFilter('All'); setTierFilter('All'); setSearchQuery(''); }}
                className="text-xs text-error font-bold hover:underline flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">close</span>Clear Filters
              </button>
            )}
            <span className="text-xs text-text-muted ml-auto">{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-surface text-label-lg text-text-muted uppercase tracking-wider">
                <th className="px-6 py-4 text-left">Client</th>
                <th className="px-6 py-4 text-left">Contact</th>
                <th className="px-6 py-4 text-right">AUM</th>
                <th className="px-6 py-4 text-left">Tier</th>
                <th className="px-6 py-4 text-right">Health Score</th>
                <th className="px-6 py-4 text-left">Status</th>
                <th className="px-6 py-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-text-muted text-body-md">
                    No clients match your search or filter criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((client, i) => {
                  const parts = client.contact.trim().split(' ');
                  const clientKey = client._id || (parts[1] || parts[0] || 'client').toLowerCase();
                  return (
                    <tr key={i} className="hover:bg-surface/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-accent-container flex items-center justify-center text-on-primary font-bold shrink-0">
                            {client.name[0]}
                          </div>
                          <div>
                            <Link to={`/consultant/clients/${clientKey}`} className="font-bold text-accent text-body-md hover:text-secondary transition-colors">
                              {client.name}
                            </Link>
                            <p className="text-xs text-text-muted">Since {client.since}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-body-sm text-text">{client.contact}</p>
                        <p className="text-xs text-text-muted">{client.email}</p>
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-accent">{client.aum}</td>
                      <td className="px-6 py-4">
                        <span className={`status-badge ${tierColors[client.tier]}`}>{client.tier}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-16 h-1.5 bg-surface-hover-high rounded-full overflow-hidden">
                            <div className="h-full bg-accent rounded-full" style={{ width: `${client.score}%` }}></div>
                          </div>
                          <span className="font-bold text-accent text-label-lg">{client.score}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`status-badge ${client.status === 'Active' ? 'status-success' : client.status === 'Review' ? 'status-warning' : client.status === 'Lead' ? 'status-warning' : 'status-info'}`}>{client.status}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <Link to={`/consultant/clients/${clientKey}`}>
                            <button className="text-secondary hover:text-accent transition-colors">
                              <span className="material-symbols-outlined text-base">open_in_new</span>
                            </button>
                          </Link>
                          <button className="text-secondary hover:text-accent transition-colors"><span className="material-symbols-outlined text-base">chat_bubble</span></button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Client Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowAddModal(false)}>
          <div className="bg-surface rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-border flex justify-between items-center">
              <h3 className="text-headline-md font-bold text-accent">Add New Client</h3>
              <button onClick={() => setShowAddModal(false)} className="text-text-muted hover:text-accent">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-label-lg font-bold text-accent mb-1">Company Name *</label>
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border border-border bg-surface rounded-lg text-body-sm focus:outline-none focus:border-secondary" />
              </div>
              <div>
                <label className="block text-label-lg font-bold text-accent mb-1">Contact Person *</label>
                <input required value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })}
                  className="w-full px-3 py-2 border border-border bg-surface rounded-lg text-body-sm focus:outline-none focus:border-secondary" />
              </div>
              <div>
                <label className="block text-label-lg font-bold text-accent mb-1">Email *</label>
                <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3 py-2 border border-border bg-surface rounded-lg text-body-sm focus:outline-none focus:border-secondary" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-label-lg font-bold text-accent mb-1">AUM</label>
                  <input placeholder="$1.0M" value={form.aum} onChange={(e) => setForm({ ...form, aum: e.target.value })}
                    className="w-full px-3 py-2 border border-border bg-surface rounded-lg text-body-sm focus:outline-none focus:border-secondary" />
                </div>
                <div>
                  <label className="block text-label-lg font-bold text-accent mb-1">Since</label>
                  <input placeholder="Jun 2024" value={form.since} onChange={(e) => setForm({ ...form, since: e.target.value })}
                    className="w-full px-3 py-2 border border-border bg-surface rounded-lg text-body-sm focus:outline-none focus:border-secondary" />
                </div>
                <div>
                  <label className="block text-label-lg font-bold text-accent mb-1">Tier</label>
                  <select value={form.tier} onChange={(e) => setForm({ ...form, tier: e.target.value })}
                    className="w-full px-3 py-2 border border-border bg-surface rounded-lg text-body-sm focus:outline-none focus:border-secondary">
                    <option>Platinum</option><option>Gold</option><option>Silver</option>
                  </select>
                </div>
                <div>
                  <label className="block text-label-lg font-bold text-accent mb-1">Status</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full px-3 py-2 border border-border bg-surface rounded-lg text-body-sm focus:outline-none focus:border-secondary">
                    <option>Active</option><option>Review</option><option>Onboarding</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-label-lg font-bold text-accent mb-1">Health Score (0-100)</label>
                  <input type="number" min="0" max="100" value={form.score} onChange={(e) => setForm({ ...form, score: e.target.value })}
                    className="w-full px-3 py-2 border border-border bg-surface rounded-lg text-body-sm focus:outline-none focus:border-secondary" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <button type="button" onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-border rounded-lg text-text-muted hover:bg-surface-hover-lowest">Cancel</button>
                <button type="submit" className="btn-primary">Save Client</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </ConsultantLayout>
  );
}
