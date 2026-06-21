import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import B2BLayout from '../../layouts/B2BLayout';
import { useB2BAuth } from '../../context/B2BAuthContext';
import b2bApi from '../../services/b2bApi';

const KPI = ({ icon, label, value, color }) => (
  <div className="card p-5 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color}`}>
      <span className="material-symbols-outlined text-2xl text-white">{icon}</span>
    </div>
    <div>
      <p className="text-text-muted text-xs font-semibold uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-bold text-accent mt-0.5">{value ?? '—'}</p>
    </div>
  </div>
);

const STATUS_COLORS = {
  submitted:'bg-blue-500/15 text-blue-400', under_review:'bg-amber-500/15 text-amber-400',
  in_progress:'bg-purple-500/15 text-purple-400', completed:'bg-green-500/15 text-green-400',
  rejected:'bg-red-500/15 text-red-400', proposal_sent:'bg-secondary/15 text-secondary',
};

export default function B2BDashboard() {
  const { company } = useB2BAuth();
  const [stats, setStats]     = useState(null);
  const [requests, setReqs]   = useState([]);
  const [proposals, setProps] = useState([]);
  const [meetings, setMeets]  = useState([]);
  const orgId = company?.organizationId;

  useEffect(() => {
    if (!orgId) return;
    b2bApi.get(`/b2b/organizations/${orgId}/stats`)
      .then(r => setStats(r.data))
      .catch(e => console.error('Failed to load stats:', e));

    b2bApi.get(`/b2b/organizations/${orgId}/service-requests`)
      .then(r => setReqs(r.data.slice(0, 5)))
      .catch(e => console.error('Failed to load service requests:', e));

    b2bApi.get(`/b2b/organizations/${orgId}/proposals`)
      .then(r => setProps(r.data.slice(0, 3)))
      .catch(e => console.error('Failed to load proposals:', e));

    b2bApi.get(`/b2b/organizations/${orgId}/meetings`)
      .then(r => setMeets(r.data.slice(0, 3)))
      .catch(e => console.error('Failed to load meetings:', e));
  }, [orgId]);

  return (
    <B2BLayout>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-accent">
            Welcome, {company?.companyName}
          </h1>
          <p className="text-text-muted text-sm mt-0.5">
            {company?.industry} · {company?.role?.replace(/_/g,' ')}
          </p>
        </div>
        <Link to="/b2b/services" className="btn-primary flex items-center gap-2 px-5 py-2.5">
          <span className="material-symbols-outlined text-lg">add</span>
          New Service Request
        </Link>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPI icon="hub"         label="Total Requests"    value={stats?.totalRequests}    color="bg-accent" />
        <KPI icon="pending"     label="Pending"           value={stats?.pendingRequests}  color="bg-amber-500" />
        <KPI icon="check_circle" label="Completed"        value={stats?.completedRequests} color="bg-green-600" />
        <KPI icon="payments"    label="Total Paid (₹)"   value={stats?.totalPaid ? `₹${Number(stats.totalPaid).toLocaleString('en-IN')}` : '₹0'} color="bg-secondary" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <KPI icon="folder_open"   label="Documents"          value={stats?.totalDocuments}   color="bg-purple-600" />
        <KPI icon="description"   label="Active Proposals"   value={stats?.activeProposals}  color="bg-blue-600" />
        <KPI icon="verified_user" label="KYC Status"         value={company?.kycVerified ? 'Verified' : 'Pending'} color={company?.kycVerified ? 'bg-green-600' : 'bg-amber-500'} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Service Requests */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-accent">Recent Service Requests</h2>
            <Link to="/b2b/services" className="text-xs text-secondary hover:underline">View all →</Link>
          </div>
          {requests.length === 0 ? (
            <div className="text-center py-8 text-text-muted text-sm">
              <span className="material-symbols-outlined text-3xl block mb-2 opacity-40">hub</span>
              No service requests yet.
              <Link to="/b2b/services" className="text-secondary ml-1 hover:underline">Create one</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map(r => (
                <div key={r.id} className="flex items-center justify-between p-3 rounded-xl bg-bg border border-border">
                  <div>
                    <p className="text-sm font-semibold text-text">{r.title}</p>
                    <p className="text-xs text-text-muted mt-0.5">{r.requestNumber} · {r.departmentId}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${STATUS_COLORS[r.status] || 'bg-surface text-text-muted'}`}>
                    {r.status.replace(/_/g,' ')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Proposals & Meetings */}
        <div className="space-y-6">
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-accent">Pending Proposals</h2>
              <Link to="/b2b/proposals" className="text-xs text-secondary hover:underline">View all →</Link>
            </div>
            {proposals.length === 0 ? (
              <p className="text-text-muted text-sm text-center py-4 opacity-60">No proposals yet.</p>
            ) : (
              <div className="space-y-2">
                {proposals.map(p => (
                  <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-bg border border-border">
                    <div>
                      <p className="text-sm font-semibold text-text">{p.title}</p>
                      <p className="text-xs text-text-muted">{p.department} · {p.feeAmount ? `₹${Number(p.feeAmount).toLocaleString('en-IN')}` : ''}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full
                      ${p.status==='sent'?'bg-blue-500/15 text-blue-400':p.status==='approved'?'bg-green-500/15 text-green-400':'bg-surface text-text-muted'}`}>
                      {p.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-accent">Upcoming Meetings</h2>
              <Link to="/b2b/meetings" className="text-xs text-secondary hover:underline">View all →</Link>
            </div>
            {meetings.length === 0 ? (
              <p className="text-text-muted text-sm text-center py-4 opacity-60">No meetings scheduled.</p>
            ) : (
              <div className="space-y-2">
                {meetings.map(m => (
                  <div key={m.id} className="flex items-center gap-3 p-3 rounded-xl bg-bg border border-border">
                    <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-accent text-lg">
                        {m.meetingType === 'video' ? 'videocam' : m.meetingType === 'phone' ? 'call' : 'location_on'}
                      </span>
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-sm font-semibold text-text truncate">{m.title}</p>
                      <p className="text-xs text-text-muted">
                        {m.scheduledAt ? new Date(m.scheduledAt).toLocaleString('en-IN', { dateStyle:'medium', timeStyle:'short' }) : 'TBD'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pending KYC banner */}
      {!company?.kycVerified && !stats?.allRequiredUploaded && (
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}
          className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-4">
          <span className="material-symbols-outlined text-amber-400 text-2xl mt-0.5">warning</span>
          <div>
            <p className="font-semibold text-amber-400">KYC Verification Pending</p>
            <p className="text-sm text-text-muted mt-1">
              Upload your GST Certificate, PAN, CIN, and Bank Statements to complete verification.
              Our compliance team will review within 24 hours.
            </p>
            <Link to="/b2b/documents" className="inline-block mt-3 btn-primary text-xs px-4 py-2">
              Upload Documents
            </Link>
          </div>
        </motion.div>
      )}
    </B2BLayout>
  );
}
