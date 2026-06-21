import { useState, useEffect } from 'react';
import CRMAdminLayout from '../../layouts/CRMAdminLayout';
import api from '../../services/api';
import { Link } from 'react-router-dom';

const STAGE_COLORS = {
  new: 'text-blue-400', contacted: 'text-cyan-400', interested: 'text-yellow-400',
  qualified: 'text-purple-400', assigned: 'text-indigo-400', consultation: 'text-orange-400',
  proposal: 'text-pink-400', won: 'text-green-400', rejected: 'text-red-400', lost: 'text-gray-400'
};

export default function CRMDashboard() {
  const [stats,          setStats]          = useState(null);
  const [clients,        setClients]        = useState([]);
  const [loadingClients, setLoadingClients] = useState(true);

  useEffect(() => {
    api.get('/leads/stats').then(r => setStats(r.data)).catch(() => {});
    api.get('/auth/clients')
      .then(r => setClients((r.data.clients || []).slice(0, 6)))
      .catch(() => {})
      .finally(() => setLoadingClients(false));
  }, []);

  const total    = stats?.pipeline?.reduce((s, p) => s + p.count, 0) || 0;
  const won      = stats?.pipeline?.find(p => p.status === 'won')?.count  || 0;
  const newLeads = stats?.pipeline?.find(p => p.status === 'new')?.count  || 0;
  const hotLeads = stats?.byPriority?.find(p => p._id === 'hot')?.count   || 0;

  return (
    <CRMAdminLayout>
      <div>
        <h1 className="text-headline-lg font-bold text-accent">CRM Dashboard</h1>
        <p className="text-text-muted mt-1">Qualify incoming leads, monitor new registrations, and route to departments.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter">
        {[
          { label: 'Total Leads',  value: total,    icon: 'contacts',              color: 'text-accent bg-accent/10' },
          { label: 'New (Unread)', value: newLeads, icon: 'mark_email_unread',     color: 'text-blue-400 bg-blue-500/10' },
          { label: 'Hot Leads',    value: hotLeads, icon: 'local_fire_department', color: 'text-red-400 bg-red-500/10' },
          { label: 'Converted',    value: won,      icon: 'check_circle',          color: 'text-green-400 bg-green-500/10' },
        ].map((k, i) => (
          <div key={i} className="card p-6">
            <div className={`p-2.5 rounded-xl w-fit mb-3 ${k.color.split(' ')[1]}`}>
              <span className={`material-symbols-outlined ${k.color.split(' ')[0]}`}>{k.icon}</span>
            </div>
            <p className="text-text-muted text-label-lg">{k.label}</p>
            <p className={`text-headline-md font-bold mt-1 ${k.color.split(' ')[0]}`}>{k.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-gutter">
        {/* Pipeline */}
        <div className="col-span-12 lg:col-span-5 card p-6">
          <h3 className="font-bold text-accent mb-4">Pipeline Breakdown</h3>
          <div className="space-y-3">
            {stats?.pipeline?.map(p => (
              <div key={p.status} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${STAGE_COLORS[p.status]?.replace('text-', 'bg-')}`} />
                  <span className="text-sm text-text capitalize">{p.status}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-24 h-1.5 bg-surface-hover-high rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 rounded-full"
                      style={{ width: `${total ? (p.count / total) * 100 : 0}%` }} />
                  </div>
                  <span className="text-xs font-bold text-accent w-4 text-right">{p.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* By Department */}
        <div className="col-span-12 lg:col-span-4 card p-6">
          <h3 className="font-bold text-accent mb-4">Leads by Department</h3>
          <div className="space-y-3">
            {stats?.byDepartment?.length > 0
              ? stats.byDepartment.map(d => (
                  <div key={d._id} className="flex items-center justify-between p-3 rounded-xl bg-surface border border-border/50">
                    <span className="text-sm text-text capitalize">{d._id || 'Unassigned'}</span>
                    <span className="font-bold text-accent">{d.count}</span>
                  </div>
                ))
              : <p className="text-text-muted text-sm">No department assignments yet.</p>
            }
            {(() => {
              const assigned   = stats?.byDepartment?.reduce((s, d) => s + d.count, 0) || 0;
              const unassigned = total - assigned;
              return unassigned > 0 ? (
                <div className="flex items-center justify-between p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <span className="text-sm text-amber-400 font-semibold">⚠ Unassigned</span>
                  <span className="font-bold text-amber-400">{unassigned}</span>
                </div>
              ) : null;
            })()}
          </div>
        </div>

        {/* By Source */}
        <div className="col-span-12 lg:col-span-3 card p-6">
          <h3 className="font-bold text-accent mb-4">Lead Sources</h3>
          <div className="space-y-2">
            {stats?.bySource?.map(s => (
              <div key={s._id} className="flex items-center justify-between text-sm">
                <span className="text-text-muted capitalize">{s._id?.replace(/_/g, ' ')}</span>
                <span className="font-bold text-accent">{s.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recently Registered Clients */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex justify-between items-center">
          <div>
            <h3 className="font-bold text-accent">Recently Registered Clients</h3>
            <p className="text-xs text-text-muted mt-0.5">
              Clients who registered via the portal — CRM lead auto-created for each
            </p>
          </div>
          <Link to="/crm-admin/leads" className="text-sm text-purple-400 hover:underline font-semibold">
            View All Leads →
          </Link>
        </div>
        {loadingClients ? (
          <div className="py-8 text-center text-text-muted text-sm">Loading...</div>
        ) : clients.length === 0 ? (
          <div className="py-10 text-center text-text-muted text-sm">No clients registered yet.</div>
        ) : (
          <div className="divide-y divide-border">
            {clients.map(client => (
              <div key={client._id} className="px-6 py-4 flex items-center justify-between hover:bg-surface/50">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold text-sm shrink-0">
                    {client.name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-text text-sm">{client.name}</p>
                    <p className="text-xs text-text-muted">
                      {client.email}{client.phone ? ` · ${client.phone}` : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-text-muted">
                    {new Date(client.createdAt).toLocaleDateString()}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                    client.isEmailVerified
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    {client.isEmailVerified ? 'Verified' : 'Unverified'}
                  </span>
                  <Link to="/crm-admin/leads" className="text-xs text-purple-400 hover:underline font-semibold">
                    View Lead
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recently Registered Clients Card */}
    </CRMAdminLayout>
  );
}
