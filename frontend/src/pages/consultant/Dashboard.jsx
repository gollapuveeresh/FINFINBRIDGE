import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import ConsultantLayout from '../../layouts/ConsultantLayout';
import { useAuth } from '../../context/AuthContext';
import { getDepartmentDashboard } from '../../data/departmentDashboards';
import { getUserDepartment } from '../../utils/departmentAccess';
import api from '../../services/api';
import toast from 'react-hot-toast';

// ── helpers ───────────────────────────────────────────────────────────────────
const PRIORITY_COLOR = {
  hot: 'bg-red-500/20 text-red-400', warm: 'bg-amber-500/20 text-amber-400',
  cold: 'bg-blue-500/20 text-blue-400', High: 'bg-red-500/20 text-red-400',
  Medium: 'bg-amber-500/20 text-amber-400', Low: 'bg-blue-500/20 text-blue-400',
};
const STATUS_COLOR = {
  pending: 'bg-amber-500/20 text-amber-400', done: 'bg-green-500/20 text-green-400',
  overdue: 'bg-red-500/20 text-red-400', upcoming: 'bg-blue-500/20 text-blue-400',
};

function KPI({ icon, label, value, sub, color = 'text-accent', bg = 'bg-accent/10' }) {
  return (
    <div className="card p-5">
      <div className={`p-2.5 rounded-xl w-fit mb-3 ${bg}`}>
        <span className={`material-symbols-outlined ${color}`}>{icon}</span>
      </div>
      <p className="text-text-muted text-xs font-semibold">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
      {sub && <p className="text-xs text-text-muted mt-1">{sub}</p>}
    </div>
  );
}

// ── TAB: Client Management ────────────────────────────────────────────────────
function ClientManagementTab({ deptData, assignedLeads, consultations, leadsLoading }) {
  const [search, setSearch] = useState('');
  const data = deptData.consultant;

  const filteredLeads = assignedLeads.filter(l =>
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    (l.email || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-gutter">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter">
        <KPI icon="groups"       label="Total Clients"   value={data.totalClients}  sub="Portfolio" />
        <KPI icon="check_circle" label="Active Clients"  value={data.activeClients} sub="Under advisory" color="text-green-400" bg="bg-green-500/10" />
        <KPI icon="contacts"     label="Leads Assigned"  value={String(assignedLeads.length)} sub="In pipeline" color="text-purple-400" bg="bg-purple-500/10" />
        <KPI icon="event"        label="Consultations"   value={String(consultations.length)} sub="Scheduled" color="text-secondary" bg="bg-secondary/10" />
      </div>

      {/* Lead Pipeline */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h3 className="font-bold text-accent">Lead Pipeline</h3>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted text-sm">search</span>
            <input value={search} onChange={e => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-xl border border-border bg-bg text-xs w-48"
              placeholder="Search leads..." />
          </div>
        </div>
        {leadsLoading ? (
          <div className="py-12 text-center text-text-muted text-sm">Loading leads...</div>
        ) : filteredLeads.length === 0 ? (
          <div className="py-12 text-center text-text-muted text-sm">No leads assigned yet.</div>
        ) : (
          <div className="divide-y divide-border">
            {filteredLeads.map(lead => (
              <Link key={lead._id} to={`/consultant/clients/${lead._id}`} className="px-6 py-4 flex items-center justify-between hover:bg-surface/50">
                <div>
                  <p className="font-semibold text-text text-sm">{lead.name}</p>
                  <p className="text-xs text-text-muted">{lead.email} · {lead.serviceType || lead.department || '—'}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold capitalize ${PRIORITY_COLOR[lead.priority]}`}>{lead.priority}</span>
                  <span className="text-xs font-bold text-accent">{lead.score}</span>
                  <span className="text-xs text-text-muted capitalize">{lead.status}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Consultation History */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex justify-between items-center">
          <h3 className="font-bold text-accent">Consultation History</h3>
          <Link to="/consultant/schedule" className="text-xs text-secondary hover:underline font-semibold">Manage →</Link>
        </div>
        {consultations.length === 0 ? (
          <div className="py-10 text-center text-text-muted text-sm">No consultations yet.</div>
        ) : (
          <div className="divide-y divide-border">
            {consultations.slice(0, 6).map(c => (
              <div key={c._id} className="px-6 py-4 flex items-center justify-between hover:bg-surface/50">
                <div>
                  <p className="font-semibold text-text text-sm">{c.clientId?.name || 'Client'}</p>
                  <p className="text-xs text-text-muted">{c.category} · {c.confirmedDate || 'Pending schedule'}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold capitalize ${c.status === 'confirmed' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}`}>
                  {c.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Static dept clients snapshot */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h3 className="font-bold text-accent">{deptData.name} Consultation Request</h3>
        </div>
        <div className="divide-y divide-border">
          {deptData.clients.map((c, i) => (
            <div key={i} className="px-6 py-4 flex items-center justify-between hover:bg-surface/50">
              <div>
                <p className="font-semibold text-text text-sm">{c.name}</p>
                <p className="text-xs text-text-muted">{c.service}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${PRIORITY_COLOR[c.priority]}`}>{c.priority}</span>
                <span className="text-xs text-text-muted">{c.status}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="px-6 py-3 border-t border-border">
          <Link to="/consultant/clients" className="text-xs text-secondary hover:underline font-semibold">View full client portfolio →</Link>
        </div>
      </div>
    </div>
  );
}

// ── TAB: Tasks ────────────────────────────────────────────────────────────────
const INITIAL_TASKS = [
  { id: 1, title: 'Submit Q2 loan recommendation for James Harrington', priority: 'High',   status: 'pending',  due: '2025-07-05', category: 'Proposal' },
  { id: 2, title: 'Follow up with Sarah Mitchell on tax strategy approval', priority: 'High',  status: 'pending',  due: '2025-07-03', category: 'Follow-up' },
  { id: 3, title: 'Upload portfolio rebalancing report — Noor Patel',       priority: 'Medium', status: 'pending',  due: '2025-07-08', category: 'Document' },
  { id: 4, title: 'Appointment: Emma Williams — Loan offer comparison',     priority: 'High',   status: 'upcoming', due: '2025-07-02', category: 'Appointment' },
  { id: 5, title: 'Review draft proposal for Alexander Vance',               priority: 'Medium', status: 'pending',  due: '2025-07-10', category: 'Proposal' },
  { id: 6, title: 'Compliance check — Lucas Reed insurance renewal',         priority: 'Low',    status: 'done',     due: '2025-06-30', category: 'Compliance' },
  { id: 7, title: 'Send onboarding docs to Priya Sharma',                    priority: 'Medium', status: 'overdue',  due: '2025-06-28', category: 'Document' },
];
const CATEGORIES = ['All', 'Proposal', 'Follow-up', 'Document', 'Appointment', 'Compliance'];

function TasksTab() {
  const [tasks, setTasks]       = useState(INITIAL_TASKS);
  const [filter, setFilter]     = useState('All');
  const [catFilter, setCatFilter] = useState('All');
  const [showAdd, setShowAdd]   = useState(false);
  const [form, setForm]         = useState({ title: '', priority: 'Medium', due: '', category: 'Proposal' });

  const toggle = (id) => setTasks(prev => prev.map(t =>
    t.id === id ? { ...t, status: t.status === 'done' ? 'pending' : 'done' } : t
  ));

  const addTask = () => {
    if (!form.title.trim()) return;
    setTasks(prev => [...prev, { ...form, id: Date.now(), status: 'pending' }]);
    setForm({ title: '', priority: 'Medium', due: '', category: 'Proposal' });
    setShowAdd(false);
    toast.success('Task added');
  };

  const deleteTask = (id) => setTasks(prev => prev.filter(t => t.id !== id));

  const filtered = tasks.filter(t => {
    const matchStatus = filter === 'All' || t.status === filter;
    const matchCat    = catFilter === 'All' || t.category === catFilter;
    return matchStatus && matchCat;
  });

  const counts = { pending: tasks.filter(t => t.status === 'pending').length, overdue: tasks.filter(t => t.status === 'overdue').length, done: tasks.filter(t => t.status === 'done').length, upcoming: tasks.filter(t => t.status === 'upcoming').length };

  return (
    <div className="space-y-gutter">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-bold text-accent">Tasks & Follow-ups</h2>
          <p className="text-text-muted text-sm mt-0.5">Track pending actions, follow-ups, and appointments</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2 px-5">
          <span className="material-symbols-outlined text-lg">add_task</span> New Task
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter">
        <KPI icon="pending_actions" label="Pending"   value={String(counts.pending)}  sub="Actions needed"  color="text-amber-400" bg="bg-amber-500/10" />
        <KPI icon="warning"         label="Overdue"   value={String(counts.overdue)}  sub="Past due date"   color="text-red-400"   bg="bg-red-500/10" />
        <KPI icon="event_upcoming"  label="Upcoming"  value={String(counts.upcoming)} sub="Appointments"    color="text-blue-400"  bg="bg-blue-500/10" />
        <KPI icon="task_alt"        label="Completed" value={String(counts.done)}     sub="Done"            color="text-green-400" bg="bg-green-500/10" />
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3 items-center">
        <div className="flex gap-2 flex-wrap">
          {['All','pending','upcoming','overdue','done'].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-colors ${filter === s ? 'bg-accent text-on-primary' : 'bg-surface border border-border text-text-muted hover:text-text'}`}>
              {s === 'All' ? 'All Status' : s}
            </button>
          ))}
        </div>
        <div className="w-px h-5 bg-border hidden md:block" />
        <select value={catFilter} onChange={e => setCatFilter(e.target.value)}
          className="px-3 py-1.5 rounded-xl border border-border bg-bg text-xs text-text">
          {CATEGORIES.map(c => <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>)}
        </select>
      </div>

      <div className="card overflow-hidden">
        <div className="divide-y divide-border">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-text-muted text-sm">No tasks match filters.</div>
          ) : filtered.map(task => (
            <div key={task.id} className={`px-6 py-4 flex items-start gap-4 hover:bg-surface/50 transition-colors ${task.status === 'done' ? 'opacity-50' : ''}`}>
              <button onClick={() => toggle(task.id)}
                className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${task.status === 'done' ? 'bg-green-500 border-green-500' : 'border-border hover:border-accent'}`}>
                {task.status === 'done' && <span className="material-symbols-outlined text-white text-xs">check</span>}
              </button>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold text-text ${task.status === 'done' ? 'line-through' : ''}`}>{task.title}</p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${PRIORITY_COLOR[task.priority]}`}>{task.priority}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface border border-border text-text-muted">{task.category}</span>
                  {task.due && <span className="text-[10px] text-text-muted">Due: {task.due}</span>}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold capitalize ${STATUS_COLOR[task.status] || 'bg-surface text-text-muted'}`}>{task.status}</span>
                <button onClick={() => deleteTask(task.id)} className="text-text-muted hover:text-red-400 transition-colors">
                  <span className="material-symbols-outlined text-base">delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4">
          <div className="bg-surface rounded-3xl p-8 w-full max-w-md">
            <h3 className="text-xl font-bold text-accent mb-6">Add New Task</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-text-muted block mb-1">Task Description *</label>
                <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                  className="w-full p-2.5 rounded-xl border border-border bg-bg text-sm"
                  placeholder="Describe the task..." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-text-muted block mb-1">Priority</label>
                  <select value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}
                    className="w-full p-2.5 rounded-xl border border-border bg-bg text-sm">
                    {['High','Medium','Low'].map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-text-muted block mb-1">Category</label>
                  <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                    className="w-full p-2.5 rounded-xl border border-border bg-bg text-sm">
                    {CATEGORIES.filter(c => c !== 'All').map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs text-text-muted block mb-1">Due Date</label>
                <input type="date" value={form.due} onChange={e => setForm(p => ({ ...p, due: e.target.value }))}
                  className="w-full p-2.5 rounded-xl border border-border bg-bg text-sm" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowAdd(false)} className="flex-1 btn-ghost py-3">Cancel</button>
              <button onClick={addTask} className="flex-1 btn-primary py-3">Add Task</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── TAB: Documents ────────────────────────────────────────────────────────────
const INITIAL_DOCS = [
  { id: 1, name: 'Q2_Portfolio_Review_Vance.pdf',    client: 'Alexander Vance',   type: 'Report',    size: '2.4 MB', uploaded: '2025-06-28', status: 'Signed' },
  { id: 2, name: 'Harrington_Loan_Proposal.pdf',     client: 'James Harrington',  type: 'Proposal',  size: '1.1 MB', uploaded: '2025-06-25', status: 'Pending Sign' },
  { id: 3, name: 'Mitchell_TaxStrategy_2025.xlsx',   client: 'Sarah Mitchell',    type: 'Tax Doc',   size: '540 KB', uploaded: '2025-06-20', status: 'Uploaded' },
  { id: 4, name: 'Patel_InsuranceQuote.pdf',         client: 'Noor Patel',        type: 'Quote',     size: '890 KB', uploaded: '2025-06-18', status: 'Signed' },
  { id: 5, name: 'Williams_CreditReport.pdf',        client: 'Emma Williams',     type: 'Report',    size: '3.2 MB', uploaded: '2025-06-15', status: 'Uploaded' },
];
const DOC_TYPE_ICON = { Report: 'description', Proposal: 'article', 'Tax Doc': 'receipt_long', Quote: 'request_quote', KYC: 'badge', Other: 'folder' };
const DOC_STATUS_COLOR = {
  Signed: 'bg-green-500/20 text-green-400', 'Pending Sign': 'bg-amber-500/20 text-amber-400',
  Uploaded: 'bg-blue-500/20 text-blue-400', Rejected: 'bg-red-500/20 text-red-400',
};

function DocumentsTab() {
  const [docs, setDocs]           = useState(INITIAL_DOCS);
  const [docSearch, setDocSearch] = useState('');
  const [uploading, setUploading] = useState(false);
  const [form, setForm]           = useState({ name: '', client: '', type: 'Report' });
  const [showUpload, setShowUpload] = useState(false);
  const fileRef = useRef(null);

  const filtered = docs.filter(d =>
    d.name.toLowerCase().includes(docSearch.toLowerCase()) ||
    d.client.toLowerCase().includes(docSearch.toLowerCase())
  );

  const handleUpload = () => {
    if (!form.name.trim() || !form.client.trim()) { toast.error('Name and client required'); return; }
    setUploading(true);
    setTimeout(() => {
      setDocs(prev => [{
        id: Date.now(), name: form.name, client: form.client, type: form.type,
        size: '—', uploaded: new Date().toISOString().split('T')[0], status: 'Uploaded'
      }, ...prev]);
      setForm({ name: '', client: '', type: 'Report' });
      setShowUpload(false);
      setUploading(false);
      toast.success('Document uploaded');
    }, 800);
  };

  const requestSign = (id) => {
    setDocs(prev => prev.map(d => d.id === id ? { ...d, status: 'Pending Sign' } : d));
    toast.success('E-sign request sent to client');
  };

  const docCounts = {
    total: docs.length,
    signed: docs.filter(d => d.status === 'Signed').length,
    pending: docs.filter(d => d.status === 'Pending Sign').length,
  };

  return (
    <div className="space-y-gutter">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-bold text-accent">Documents & E-Sign</h2>
          <p className="text-text-muted text-sm mt-0.5">Upload reports, manage client documents, and send e-sign requests</p>
        </div>
        <button onClick={() => setShowUpload(true)} className="btn-primary flex items-center gap-2 px-5">
          <span className="material-symbols-outlined text-lg">upload_file</span> Upload Document
        </button>
      </div>

      <div className="grid grid-cols-3 gap-gutter">
        <KPI icon="folder_open" label="Total Documents" value={String(docCounts.total)} sub="All files" />
        <KPI icon="verified"    label="E-Signed"        value={String(docCounts.signed)} sub="Completed" color="text-green-400" bg="bg-green-500/10" />
        <KPI icon="draw"        label="Pending Sign"    value={String(docCounts.pending)} sub="Awaiting client" color="text-amber-400" bg="bg-amber-500/10" />
      </div>

      {/* Search */}
      <div className="card p-4">
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">search</span>
          <input value={docSearch} onChange={e => setDocSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-bg text-sm"
            placeholder="Search by document name or client..." />
        </div>
      </div>

      {/* Document list */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface border-b border-border">
              <tr className="text-left text-text-muted text-xs uppercase tracking-wider">
                {['Document','Client','Type','Size','Uploaded','Status','Actions'].map(h => (
                  <th key={h} className="px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="py-12 text-center text-text-muted">No documents found.</td></tr>
              ) : filtered.map(doc => (
                <tr key={doc.id} className="hover:bg-surface/50">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-accent text-lg">{DOC_TYPE_ICON[doc.type] || 'folder'}</span>
                      <span className="font-semibold text-text text-xs max-w-[160px] truncate">{doc.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-text-muted text-xs">{doc.client}</td>
                  <td className="px-5 py-4">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent font-semibold">{doc.type}</span>
                  </td>
                  <td className="px-5 py-4 text-xs text-text-muted">{doc.size}</td>
                  <td className="px-5 py-4 text-xs text-text-muted">{doc.uploaded}</td>
                  <td className="px-5 py-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${DOC_STATUS_COLOR[doc.status] || ''}`}>{doc.status}</span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      <button className="text-xs text-accent hover:underline font-semibold">View</button>
                      {doc.status === 'Uploaded' && (
                        <button onClick={() => requestSign(doc.id)}
                          className="text-xs text-amber-400 hover:underline font-semibold">E-Sign</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* E-Sign workflow info */}
      <div className={`card p-5 border border-purple-500/20 bg-purple-500/5 flex items-start gap-4`}>
        <span className="material-symbols-outlined text-purple-400 text-2xl mt-0.5">draw</span>
        <div>
          <p className="font-semibold text-purple-400">E-Sign Workflow</p>
          <p className="text-xs text-text-muted mt-1">Click "E-Sign" on any uploaded document to send an e-signature request to the client. The client will receive an in-app notification and can sign directly from their portal.</p>
        </div>
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4">
          <div className="bg-surface rounded-3xl p-8 w-full max-w-md">
            <h3 className="text-xl font-bold text-accent mb-6">Upload Document</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-text-muted block mb-1">Document Name *</label>
                <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Q3_Report_Client.pdf"
                  className="w-full p-2.5 rounded-xl border border-border bg-bg text-sm" />
              </div>
              <div>
                <label className="text-xs text-text-muted block mb-1">Client Name *</label>
                <input value={form.client} onChange={e => setForm(p => ({ ...p, client: e.target.value }))}
                  placeholder="e.g. Alexander Vance"
                  className="w-full p-2.5 rounded-xl border border-border bg-bg text-sm" />
              </div>
              <div>
                <label className="text-xs text-text-muted block mb-1">Document Type</label>
                <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                  className="w-full p-2.5 rounded-xl border border-border bg-bg text-sm">
                  {Object.keys(DOC_TYPE_ICON).map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              {/* File picker (visual only — no actual upload backend) */}
              <div onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed border-border rounded-2xl p-8 text-center cursor-pointer hover:border-accent transition-colors">
                <span className="material-symbols-outlined text-accent text-3xl">cloud_upload</span>
                <p className="text-sm text-text-muted mt-2">Click to select file</p>
                <input ref={fileRef} type="file" className="hidden" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowUpload(false)} className="flex-1 btn-ghost py-3">Cancel</button>
              <button onClick={handleUpload} disabled={uploading} className="flex-1 btn-primary py-3 disabled:opacity-60">
                {uploading ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── TAB: Communication ────────────────────────────────────────────────────────
const CHAT_CONTACTS = [
  { id: 'dept', name: 'Department Admin', role: 'Dept Admin', online: true },
  { id: 'ops',  name: 'Operations Team', role: 'Internal',   online: true },
  { id: 'c1',   name: 'James Harrington', role: 'Client',    online: false },
  { id: 'c2',   name: 'Sarah Mitchell',   role: 'Client',    online: true },
];
const INITIAL_MSGS = {
  dept: [
    { from: 'them', text: 'Please submit the Harrington proposal by EOD Friday.', time: '10:32 AM' },
    { from: 'me',   text: 'Understood, will do. Working on the details now.',       time: '10:45 AM' },
  ],
  ops:  [{ from: 'them', text: 'System maintenance scheduled for Saturday 2AM–4AM.', time: 'Yesterday' }],
  c1:   [{ from: 'them', text: 'When can we discuss the refinancing options?', time: '9:00 AM' }],
  c2:   [{ from: 'them', text: 'Please send me the updated tax strategy document.', time: '2 days ago' }],
};
const EMAIL_TEMPLATES = [
  { label: 'Consultation Follow-up', subject: 'Follow-up: Your Consultation Summary', body: 'Dear [Client Name],\n\nThank you for your time today. Please find a summary of our discussion attached.\n\nBest regards,\n[Your Name]' },
  { label: 'Proposal Ready',         subject: 'Your Financial Proposal is Ready', body: 'Dear [Client Name],\n\nYour customized financial proposal is now available in your portal under "Proposals".\n\nPlease review and let us know if you have any questions.\n\nBest regards,\n[Your Name]' },
  { label: 'Document Request',       subject: 'Documents Required for Your File', body: 'Dear [Client Name],\n\nWe require the following documents to proceed:\n- [Document 1]\n- [Document 2]\n\nPlease upload them to your portal.\n\nBest regards,\n[Your Name]' },
  { label: 'Appointment Reminder',   subject: 'Reminder: Upcoming Appointment', body: 'Dear [Client Name],\n\nThis is a reminder for your upcoming consultation scheduled on [Date] at [Time].\n\nBest regards,\n[Your Name]' },
];

function CommunicationTab({ notifications }) {
  const [activeContact, setActiveContact] = useState('dept');
  const [messages, setMessages]           = useState(INITIAL_MSGS);
  const [input, setInput]                 = useState('');
  const [commTab, setCommTab]             = useState('chat');  // chat | email | sms
  const [emailForm, setEmailForm]         = useState({ to: '', subject: '', body: '' });
  const [smsForm, setSmsForm]             = useState({ to: '', message: '' });
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const chatBottomRef = useRef(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeContact]);

  const sendMsg = () => {
    if (!input.trim()) return;
    setMessages(prev => ({
      ...prev,
      [activeContact]: [...(prev[activeContact] || []), { from: 'me', text: input, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]
    }));
    setInput('');
  };

  const sendEmail = () => {
    if (!emailForm.to || !emailForm.subject) { toast.error('To and Subject required'); return; }
    toast.success(`Email sent to ${emailForm.to}`);
    setEmailForm({ to: '', subject: '', body: '' });
    setSelectedTemplate('');
  };

  const sendSms = () => {
    if (!smsForm.to || !smsForm.message) { toast.error('Phone and message required'); return; }
    toast.success(`SMS sent to ${smsForm.to}`);
    setSmsForm({ to: '', message: '' });
  };

  const applyTemplate = (label) => {
    const t = EMAIL_TEMPLATES.find(t => t.label === label);
    if (t) setEmailForm(p => ({ ...p, subject: t.subject, body: t.body }));
    setSelectedTemplate(label);
  };

  const unread = notifications.filter(n => !n.isRead).length;

  return (
    <div className="space-y-gutter">
      <div>
        <h2 className="text-xl font-bold text-accent">Communication Hub</h2>
        <p className="text-text-muted text-sm mt-0.5">Internal chat, email integration, and SMS notifications</p>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-2 border-b border-border pb-0">
        {[
          { key: 'chat',  label: 'Internal Chat',     icon: 'chat' },
          { key: 'email', label: 'Email Integration', icon: 'email' },
          { key: 'sms',   label: 'SMS Notifications', icon: 'sms' },
          { key: 'inbox', label: `Notifications${unread > 0 ? ` (${unread})` : ''}`, icon: 'notifications' },
        ].map(t => (
          <button key={t.key} onClick={() => setCommTab(t.key)}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-t-xl text-sm font-semibold border-b-2 transition-all ${
              commTab === t.key ? 'border-accent text-accent bg-accent/5' : 'border-transparent text-text-muted hover:text-text'
            }`}>
            <span className="material-symbols-outlined text-base">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* CHAT */}
      {commTab === 'chat' && (
        <div className="grid grid-cols-12 gap-gutter">
          {/* Contact list */}
          <div className="col-span-12 md:col-span-3 card overflow-hidden">
            <div className="px-4 py-3 border-b border-border">
              <p className="text-xs font-bold text-text-muted uppercase tracking-wider">Contacts</p>
            </div>
            <div className="divide-y divide-border">
              {CHAT_CONTACTS.map(c => (
                <button key={c.id} onClick={() => setActiveContact(c.id)}
                  className={`w-full px-4 py-3 flex items-center gap-3 text-left transition-colors hover:bg-surface/50 ${activeContact === c.id ? 'bg-accent/5 border-r-2 border-accent' : ''}`}>
                  <div className="relative">
                    <div className="w-9 h-9 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold text-sm">
                      {c.name[0]}
                    </div>
                    <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-surface ${c.online ? 'bg-green-400' : 'bg-gray-400'}`} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-text truncate">{c.name}</p>
                    <p className="text-xs text-text-muted">{c.role}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Chat window */}
          <div className="col-span-12 md:col-span-9 card flex flex-col h-[420px]">
            <div className="px-5 py-3 border-b border-border flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold text-sm">
                {CHAT_CONTACTS.find(c => c.id === activeContact)?.name[0]}
              </div>
              <div>
                <p className="text-sm font-bold text-accent">{CHAT_CONTACTS.find(c => c.id === activeContact)?.name}</p>
                <p className="text-xs text-text-muted">{CHAT_CONTACTS.find(c => c.id === activeContact)?.role}</p>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {(messages[activeContact] || []).map((m, i) => (
                <div key={i} className={`flex ${m.from === 'me' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm ${m.from === 'me' ? 'bg-accent text-on-primary rounded-br-sm' : 'bg-surface border border-border text-text rounded-bl-sm'}`}>
                    <p>{m.text}</p>
                    <p className={`text-[10px] mt-1 ${m.from === 'me' ? 'text-white/60' : 'text-text-muted'} text-right`}>{m.time}</p>
                  </div>
                </div>
              ))}
              <div ref={chatBottomRef} />
            </div>
            <div className="px-5 py-3 border-t border-border flex gap-2">
              <input value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMsg()}
                className="flex-1 p-2.5 rounded-xl border border-border bg-bg text-sm"
                placeholder="Type a message..." />
              <button onClick={sendMsg} disabled={!input.trim()}
                className="btn-primary px-4 py-2.5 disabled:opacity-50 flex items-center gap-1">
                <span className="material-symbols-outlined text-base">send</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EMAIL */}
      {commTab === 'email' && (
        <div className="card p-8 max-w-2xl">
          <div className="flex items-center gap-2 mb-6">
            <span className="material-symbols-outlined text-accent">email</span>
            <h3 className="text-lg font-bold text-accent">Compose Email</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-text-muted block mb-1">Template (optional)</label>
              <select value={selectedTemplate} onChange={e => applyTemplate(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-border bg-bg text-sm">
                <option value="">Select a template...</option>
                {EMAIL_TEMPLATES.map(t => <option key={t.label} value={t.label}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-text-muted block mb-1">To *</label>
              <input value={emailForm.to} onChange={e => setEmailForm(p => ({ ...p, to: e.target.value }))}
                placeholder="client@example.com" className="w-full p-2.5 rounded-xl border border-border bg-bg text-sm" />
            </div>
            <div>
              <label className="text-xs text-text-muted block mb-1">Subject *</label>
              <input value={emailForm.subject} onChange={e => setEmailForm(p => ({ ...p, subject: e.target.value }))}
                placeholder="Email subject" className="w-full p-2.5 rounded-xl border border-border bg-bg text-sm" />
            </div>
            <div>
              <label className="text-xs text-text-muted block mb-1">Body</label>
              <textarea value={emailForm.body} onChange={e => setEmailForm(p => ({ ...p, body: e.target.value }))}
                className="w-full p-2.5 rounded-xl border border-border bg-bg text-sm h-40 resize-none"
                placeholder="Email content..." />
            </div>
            <button onClick={sendEmail} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
              <span className="material-symbols-outlined">send</span> Send Email
            </button>
          </div>
        </div>
      )}

      {/* SMS */}
      {commTab === 'sms' && (
        <div className="card p-8 max-w-md">
          <div className="flex items-center gap-2 mb-6">
            <span className="material-symbols-outlined text-accent">sms</span>
            <h3 className="text-lg font-bold text-accent">Send SMS Notification</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-text-muted block mb-1">Phone Number *</label>
              <input value={smsForm.to} onChange={e => setSmsForm(p => ({ ...p, to: e.target.value }))}
                placeholder="+91 9876543210" className="w-full p-2.5 rounded-xl border border-border bg-bg text-sm" />
            </div>
            <div>
              <label className="text-xs text-text-muted block mb-1">Message * ({smsForm.message.length}/160)</label>
              <textarea value={smsForm.message} onChange={e => setSmsForm(p => ({ ...p, message: e.target.value.slice(0, 160) }))}
                className="w-full p-2.5 rounded-xl border border-border bg-bg text-sm h-28 resize-none"
                placeholder="Your SMS message..." />
            </div>
            {/* Quick templates */}
            <div>
              <p className="text-xs text-text-muted mb-2">Quick templates</p>
              <div className="flex flex-wrap gap-2">
                {[
                  'Your appointment is confirmed.',
                  'Please upload your documents.',
                  'Your proposal is ready to review.',
                ].map(t => (
                  <button key={t} onClick={() => setSmsForm(p => ({ ...p, message: t }))}
                    className="text-xs px-3 py-1.5 rounded-xl bg-surface border border-border text-text-muted hover:text-text hover:border-accent transition-colors">
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={sendSms} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
              <span className="material-symbols-outlined">sms</span> Send SMS
            </button>
          </div>
        </div>
      )}

      {/* INBOX / NOTIFICATIONS */}
      {commTab === 'inbox' && (
        <div className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex justify-between items-center">
            <h3 className="font-bold text-accent">Notification Inbox</h3>
            {unread > 0 && <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-semibold">{unread} unread</span>}
          </div>
          {notifications.length === 0 ? (
            <div className="py-12 text-center text-text-muted text-sm">No notifications yet.</div>
          ) : (
            <div className="divide-y divide-border">
              {notifications.map(n => (
                <div key={n._id} className={`px-6 py-4 flex items-start gap-4 hover:bg-surface/50 ${!n.isRead ? 'bg-accent/[0.02]' : 'opacity-70'}`}>
                  <div className={`p-2 rounded-xl shrink-0 ${!n.isRead ? 'bg-secondary/10 text-secondary' : 'bg-surface text-text-muted'}`}>
                    <span className="material-symbols-outlined text-base">notifications</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-text text-sm">{n.title}</p>
                      {!n.isRead && <span className="w-1.5 h-1.5 rounded-full bg-secondary" />}
                    </div>
                    <p className="text-xs text-text-muted mt-0.5">{n.message}</p>
                    <p className="text-[10px] text-text-muted mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="px-6 py-3 border-t border-border">
            <Link to="/consultant/notifications" className="text-xs text-secondary hover:underline font-semibold">View all notifications →</Link>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
const TABS = [
  { key: 'clients',       label: 'Client Management', icon: 'groups' },
  { key: 'tasks',         label: 'Tasks',             icon: 'task_alt' },
  { key: 'documents',     label: 'Documents',         icon: 'folder_open' },
  { key: 'communication', label: 'Communication',     icon: 'chat' },
];

export default function ConsultantDashboard({ department: deptProp = 'loans' }) {
  const { user } = useAuth();
  const dept    = getUserDepartment(user) || deptProp;
  const deptKey = dept === 'investments' ? 'investments' : dept;
  const deptData = getDepartmentDashboard(deptKey);

  const [activeTab,      setActiveTab]      = useState('clients');
  const [assignedLeads,  setAssignedLeads]  = useState([]);
  const [consultations,  setConsultations]  = useState([]);
  const [notifications,  setNotifications]  = useState([]);
  const [leadsLoading,   setLeadsLoading]   = useState(true);

  useEffect(() => {
    // Leads assigned to this consultant
    api.get('/leads', { params: { status: 'assigned' } })
      .then(r => setAssignedLeads(r.data.leads || []))
      .catch(() => {})
      .finally(() => setLeadsLoading(false));

    // Consultations
    api.get('/consultations').then(r => setConsultations(r.data.data || [])).catch(() => {});

    // Notifications
    api.get('/notifications').then(r => setNotifications(r.data.data || [])).catch(() => {});
  }, []);

  const unreadNotifs = notifications.filter(n => !n.isRead).length;

  const renderTab = () => {
    switch (activeTab) {
      case 'clients':       return <ClientManagementTab deptData={deptData} assignedLeads={assignedLeads} consultations={consultations} leadsLoading={leadsLoading} />;
      case 'tasks':         return <TasksTab />;
      case 'documents':     return <DocumentsTab />;
      case 'communication': return <CommunicationTab notifications={notifications} />;
      default:              return null;
    }
  };

  return (
    <ConsultantLayout>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 rounded-xl bg-accent/10">
              <span className="material-symbols-outlined text-accent">{deptData.icon}</span>
            </div>
            <h1 className="text-headline-lg font-bold text-accent">{deptData.consultant.title}</h1>
          </div>
          <p className="text-text-muted text-sm">
            Welcome back, <span className="font-semibold text-accent">{user?.name || 'Consultant'}</span>
            {' '}· {deptData.name} Department
            {unreadNotifs > 0 && (
              <span className="ml-2 px-2 py-0.5 rounded-full bg-secondary/20 text-secondary text-xs font-semibold">
                {unreadNotifs} new notification{unreadNotifs > 1 ? 's' : ''}
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-3">
          <Link to="/consultant/schedule">
            <button className="btn-primary flex items-center gap-2 text-sm px-4 py-2.5">
              <span className="material-symbols-outlined text-base">calendar_month</span> Schedule
            </button>
          </Link>
        </div>
      </div>

      {/* Tab Nav */}
      <div className="flex flex-wrap gap-1 border-b border-border">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-t-xl text-sm font-semibold border-b-2 transition-all relative ${
              activeTab === t.key
                ? 'border-accent text-accent bg-accent/5'
                : 'border-transparent text-text-muted hover:text-text hover:bg-surface/50'
            }`}>
            <span className="material-symbols-outlined text-base">{t.icon}</span>
            {t.label}
            {t.key === 'communication' && unreadNotifs > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-secondary text-white text-[10px] font-bold leading-none">
                {unreadNotifs}
              </span>
            )}
          </button>
        ))}
      </div>

      {renderTab()}
    </ConsultantLayout>
  );
}
