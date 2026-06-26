import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import AdminLayout from '../../layouts/AdminLayout';
import ConsultantLayout from '../../layouts/ConsultantLayout';
import DepartmentAdminLayout from '../../layouts/DepartmentAdminLayout';
import api from '../../services/api';
import toast from 'react-hot-toast';

const DOC_LABELS = {
  GST_CERTIFICATE: 'VAT Registration (BIN)', PAN: 'TIN Certificate', CIN: 'CIN Document',
  INCORPORATION: 'Incorporation Certificate', BANK_STATEMENT: 'Bank Statement',
  FINANCIAL_STATEMENT: 'Financial Statements', OTHER: 'Other Document',
};
const STATUS_COLOR = {
  pending: 'bg-amber-500/15 text-amber-400',
  verified: 'bg-green-500/15 text-green-400',
  rejected: 'bg-red-500/15 text-red-400',
};

export default function KycReview() {
  const { user } = useAuth();
  const [docs, setDocs] = useState([]);

  const Layout = user?.role === 'admin'
    ? AdminLayout
    : user?.role === 'consultant'
    ? ConsultantLayout
    : DepartmentAdminLayout;
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(null);

  const fetchDocs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/kyc/documents');
      setDocs(res.data.documents || []);
    } catch { toast.error('Failed to load KYC documents'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchDocs(); }, [fetchDocs]);

  const review = async (docId, status) => {
    let note = null;
    if (status === 'rejected') {
      note = window.prompt('Reason for rejection (shown to the client):');
      if (note === null) return;                 // cancelled
    }
    try {
      setBusy(docId);
      await api.patch(`/kyc/documents/${docId}`, { status, note });
      toast.success(status === 'verified' ? 'Document verified' : 'Document rejected');
      fetchDocs();
    } catch (e) { toast.error(e.response?.data?.message || 'Action failed'); }
    finally { setBusy(null); }
  };

  const view = async (docId) => {
    try {
      const res = await api.get(`/kyc/documents/${docId}/file`);
      const { content, fileName } = res.data;
      if (!content) { toast.error('No file content'); return; }
      const a = document.createElement('a');
      a.href = content; a.download = fileName || 'document';
      document.body.appendChild(a); a.click(); a.remove();
    } catch { toast.error('Could not open the document'); }
  };

  // Group documents by organisation
  const orgs = Object.values(docs.reduce((acc, d) => {
    (acc[d.organizationId] ||= { id: d.organizationId, name: d.companyName, kycVerified: d.kycVerified, docs: [] }).docs.push(d);
    return acc;
  }, {}));

  const pendingCount = docs.filter(d => d.status === 'pending').length;

  return (
    <Layout>
      <div className="space-y-gutter">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-headline-lg font-bold text-accent">KYC Review</h1>
            <p className="text-text-muted text-sm mt-1">
              Verify client documents. An organization is KYC-approved once all required documents are verified.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs px-3 py-1.5 rounded-full bg-amber-500/15 text-amber-400 font-semibold">
              {pendingCount} pending review
            </span>
            <button onClick={fetchDocs} className="btn-ghost flex items-center gap-2 px-4 py-2 text-sm">
              <span className="material-symbols-outlined text-base">refresh</span> Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <div className="card py-16 text-center text-text-muted">Loading…</div>
        ) : orgs.length === 0 ? (
          <div className="card py-16 text-center text-text-muted">
            <span className="material-symbols-outlined text-3xl block mb-2 opacity-30">verified_user</span>
            No client documents have been uploaded yet.
          </div>
        ) : orgs.map(org => (
          <div key={org.id} className="card overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex justify-between items-center">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-secondary">apartment</span>
                <h2 className="font-bold text-accent">{org.name}</h2>
              </div>
              <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${org.kycVerified ? 'bg-green-500/15 text-green-400' : 'bg-amber-500/15 text-amber-400'}`}>
                {org.kycVerified ? '✓ KYC Verified' : '⏳ KYC Pending'}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-surface border-b border-border">
                  <tr className="text-left text-text-muted text-xs uppercase tracking-wider">
                    {['Document', 'File', 'Status', 'Actions'].map(h => <th key={h} className="px-5 py-3">{h}</th>)}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {org.docs.map(d => (
                    <tr key={d.id} className="hover:bg-surface/50">
                      <td className="px-5 py-4">
                        <span className="font-semibold text-text text-xs">{DOC_LABELS[d.documentType] || d.documentType}</span>
                        {d.required && <span className="ml-2 text-[10px] text-red-400 font-bold">Required</span>}
                        {d.status === 'rejected' && d.reviewerNote && (
                          <p className="text-[11px] text-red-400 mt-1">Rejected: {d.reviewerNote}</p>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <button onClick={() => view(d.id)} className="text-secondary hover:underline text-xs flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">visibility</span>
                          {d.fileName || 'View'}
                        </button>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${STATUS_COLOR[d.status] || ''}`}>{d.status}</span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <button onClick={() => review(d.id, 'verified')} disabled={busy === d.id || d.status === 'verified'}
                            className="text-xs font-bold px-3 py-1.5 rounded-lg border border-green-500/40 bg-green-500/10 text-green-400 hover:bg-green-500/20 disabled:opacity-40 transition-colors">
                            Verify
                          </button>
                          <button onClick={() => review(d.id, 'rejected')} disabled={busy === d.id || d.status === 'rejected'}
                            className="text-xs font-bold px-3 py-1.5 rounded-lg border border-red-500/40 bg-red-500/10 text-red-400 hover:bg-red-500/20 disabled:opacity-40 transition-colors">
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
}
