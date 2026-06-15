import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const DOC_TYPE_ICON = { Report: 'description', Proposal: 'article', 'Tax Doc': 'receipt_long', Quote: 'request_quote', KYC: 'badge', Other: 'folder' };
const DOC_STATUS_COLOR = {
  Signed: 'bg-green-500/20 text-green-400',
  'Pending Sign': 'bg-amber-500/20 text-amber-400',
  Uploaded: 'bg-blue-500/20 text-blue-400',
};

// role: 'department-admin' | 'consultant'
export default function ClientDocuments({ role = 'department-admin', Layout }) {
  const [docs, setDocs]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [typeFilter, setType] = useState('All');

  useEffect(() => { fetchDocs(); }, [role]);

  const fetchDocs = async () => {
    try {
      setLoading(true);
      const endpoint = role === 'consultant' ? '/documents/consultant' : '/documents/department';
      const res = await api.get(endpoint);
      setDocs(res.data.documents || []);
    } catch { toast.error('Failed to load documents'); }
    finally { setLoading(false); }
  };

  const types = ['All', ...new Set(docs.map(d => d.type))];

  const filtered = docs.filter(d => {
    const matchSearch = d.name?.toLowerCase().includes(search.toLowerCase()) ||
      d.clientId?.name?.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'All' || d.type === typeFilter;
    return matchSearch && matchType;
  });

  const content = (
    <div className="space-y-gutter">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-headline-lg font-bold text-accent">Client Documents</h1>
          <p className="text-text-muted text-sm mt-1">Documents uploaded by your clients</p>
        </div>
        <button onClick={fetchDocs} className="btn-ghost flex items-center gap-2 px-4 py-2 text-sm">
          <span className="material-symbols-outlined text-base">refresh</span> Refresh
        </button>
      </div>

      <div className="grid grid-cols-3 gap-gutter">
        {[
          { label: 'Total Documents', value: docs.length, color: 'text-accent', bg: 'bg-accent/10' },
          { label: 'Signed', value: docs.filter(d => d.status === 'Signed').length, color: 'text-green-400', bg: 'bg-green-500/10' },
          { label: 'Pending Sign', value: docs.filter(d => d.status === 'Pending Sign').length, color: 'text-amber-400', bg: 'bg-amber-500/10' },
        ].map((k, i) => (
          <div key={i} className="card p-5">
            <p className="text-text-muted text-xs font-semibold">{k.label}</p>
            <p className={`text-3xl font-bold mt-1 ${k.color}`}>{k.value}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-3 flex-wrap items-center">
        <div className="relative flex-1 min-w-[200px]">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">search</span>
          <input value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-bg text-sm"
            placeholder="Search by document name or client..." />
        </div>
        <div className="flex gap-2 flex-wrap">
          {types.map(t => (
            <button key={t} onClick={() => setType(t)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${typeFilter === t ? 'bg-accent text-white' : 'bg-surface border border-border text-text-muted hover:text-text'}`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex justify-between items-center">
          <h2 className="font-bold text-accent">All Client Documents</h2>
          <span className="text-xs text-text-muted">{filtered.length} documents</span>
        </div>
        {loading ? (
          <div className="py-16 text-center text-text-muted">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-text-muted">No documents found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface border-b border-border">
                <tr className="text-left text-text-muted text-xs uppercase tracking-wider">
                  {['Document', 'Client', 'Type', 'Size', 'Uploaded On', 'Status'].map(h => (
                    <th key={h} className="px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map(doc => (
                  <tr key={doc._id} className="hover:bg-surface/50">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-accent text-base">
                          {DOC_TYPE_ICON[doc.type] || 'folder'}
                        </span>
                        <span className="font-semibold text-text text-xs max-w-[200px] truncate">{doc.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-text text-xs">{doc.clientId?.name || '—'}</p>
                      <p className="text-[10px] text-text-muted">{doc.clientId?.email || ''}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent font-semibold">{doc.type}</span>
                    </td>
                    <td className="px-5 py-4 text-xs text-text-muted">{doc.size || '—'}</td>
                    <td className="px-5 py-4 text-xs text-text-muted">
                      {new Date(doc.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${DOC_STATUS_COLOR[doc.status] || 'bg-surface text-text-muted'}`}>
                        {doc.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  return Layout ? <Layout>{content}</Layout> : content;
}
