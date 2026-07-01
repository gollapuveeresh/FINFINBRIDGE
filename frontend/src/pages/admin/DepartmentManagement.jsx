import { useState, useEffect } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import api from '../../services/api';
import toast from 'react-hot-toast';

const DEPARTMENTS = [
  { key: 'loans', label: 'Loans', icon: 'payments', color: 'text-blue-400 bg-blue-500/10' },
  { key: 'insurance', label: 'Insurance', icon: 'health_and_safety', color: 'text-green-400 bg-green-500/10' },
  { key: 'investments', label: 'Investments', icon: 'trending_up', color: 'text-purple-400 bg-purple-500/10' },
  { key: 'tax', label: 'Tax', icon: 'calculate', color: 'text-amber-400 bg-amber-500/10' },
  { key: 'wealth', label: 'Wealth', icon: 'account_balance', color: 'text-rose-400 bg-rose-500/10' },
];

export default function DepartmentManagement() {
  const [activeDept, setActiveDept] = useState('loans');
  const [deptAdmins, setDeptAdmins] = useState([]);
  const [consultants, setConsultants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [showAddConsultant, setShowAddConsultant] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [saving, setSaving] = useState(false);
  const [expandedAdmin, setExpandedAdmin] = useState(null);

  useEffect(() => { fetchData(); }, [activeDept]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [adminsRes, consultantsRes] = await Promise.all([
        api.get('/auth/admins', { params: { role: 'department-admin', department: activeDept } }),
        api.get('/auth/consultants', { params: { department: activeDept } }),
      ]);
      setDeptAdmins(adminsRes.data.admins || []);
      setConsultants(consultantsRes.data.consultants || []);
    } catch { toast.error('Failed to load data'); }
    finally { setLoading(false); }
  };

  const handleAddAdmin = async () => {
    if (!form.name || !form.email || !form.password) { toast.error('Name, email and password required'); return; }
    try {
      setSaving(true);
      await api.post('/auth/create-admin', { ...form, role: 'department-admin', department: activeDept });
      toast.success(`${activeDept} dept admin created`);
      setShowAddAdmin(false);
      setForm({ name: '', email: '', password: '', phone: '' });
      fetchData();
    } catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleAddConsultant = async () => {
    if (!form.name || !form.email || !form.password) { toast.error('Name, email and password required'); return; }
    try {
      setSaving(true);
      await api.post('/auth/create-consultant', { ...form, department: activeDept });
      toast.success(`Consultant added to ${activeDept}`);
      setShowAddConsultant(false);
      setForm({ name: '', email: '', password: '', phone: '' });
      fetchData();
    } catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id, type) => {
    if (!window.confirm(`Delete this ${type}?`)) return;
    try {
      if (type === 'admin') await api.delete(`/auth/admins/${id}`);
      else await api.delete(`/auth/consultants/${id}`);
      toast.success('Deleted successfully');
      fetchData();
    } catch { toast.error('Failed to delete'); }
  };

  const handleToggle = async (id, isActive, type) => {
    try {
      if (type === 'admin') await api.patch(`/auth/admins/${id}`, { isActive: !isActive });
      else await api.patch(`/auth/consultants/${id}`, { isActive: !isActive });
      toast.success(isActive ? 'Deactivated' : 'Activated');
      fetchData();
    } catch { toast.error('Failed'); }
  };

  const dept = DEPARTMENTS.find(d => d.key === activeDept);

  return (
    <AdminLayout>
      <div>
        <h1 className="text-headline-lg font-bold text-accent">Department Management</h1>
        <p className="text-text-muted mt-1">View and manage department admins and consultants for each department.</p>
      </div>

      {/* Department Tabs */}
      <div className="flex gap-3 flex-wrap">
        {DEPARTMENTS.map(d => (
          <button key={d.key} onClick={() => setActiveDept(d.key)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-semibold text-sm border transition-all ${activeDept === d.key
                ? 'bg-accent text-on-primary border-accent'
                : 'border-border text-text-muted hover:border-secondary hover:text-secondary'
              }`}>
            <span className="material-symbols-outlined text-base">{d.icon}</span>
            {d.label}
          </button>
        ))}
      </div>

      {/* Department Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter">
        {[
          { label: 'Dept Admins', value: deptAdmins.length, icon: 'admin_panel_settings', color: dept?.color },
          { label: 'Consultants', value: consultants.length, icon: 'badge', color: 'text-secondary bg-secondary/10' },
          { label: 'Active Admins', value: deptAdmins.filter(a => a.isActive).length, icon: 'check_circle', color: 'text-green-400 bg-green-500/10' },
          { label: 'Active Consultants', value: consultants.filter(c => c.isActive).length, icon: 'people', color: 'text-blue-400 bg-blue-500/10' },
        ].map((k, i) => (
          <div key={i} className="card p-5 flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${k.color?.split(' ')[1]}`}>
              <span className={`material-symbols-outlined ${k.color?.split(' ')[0]}`}>{k.icon}</span>
            </div>
            <div>
              <p className="text-text-muted text-xs">{k.label}</p>
              <p className="text-2xl font-bold text-accent">{k.value}</p>
            </div>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="py-16 text-center text-text-muted">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter">

          {/* Department Admins */}
          <div className="card overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex justify-between items-center">
              <div>
                <h2 className="font-bold text-accent capitalize">{activeDept} — Department Admins</h2>
                <p className="text-xs text-text-muted mt-0.5">{deptAdmins.length} admins</p>
              </div>
              <button onClick={() => { setShowAddAdmin(true); setForm({ name: '', email: '', password: '', phone: '' }); }}
                className="btn-primary flex items-center gap-1.5 px-4 py-2 text-sm">
                <span className="material-symbols-outlined text-base">add</span> Add Admin
              </button>
            </div>

            {deptAdmins.length === 0 ? (
              <div className="py-12 text-center text-text-muted text-sm">No department admins for {activeDept} yet.</div>
            ) : (
              <div className="divide-y divide-border">
                {deptAdmins.map(admin => (
                  <div key={admin._id}>
                    <div className="px-6 py-4 flex items-center justify-between hover:bg-surface/50 cursor-pointer"
                      onClick={() => setExpandedAdmin(expandedAdmin === admin._id ? null : admin._id)}>
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full ${dept?.color?.split(' ')[1]} flex items-center justify-center ${dept?.color?.split(' ')[0]} font-bold`}>
                          {admin.name?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-text text-sm">{admin.name}</p>
                          <p className="text-xs text-text-muted">{admin.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${admin.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                          {admin.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <span className="material-symbols-outlined text-text-muted text-sm">
                          {expandedAdmin === admin._id ? 'expand_less' : 'expand_more'}
                        </span>
                      </div>
                    </div>

                    {expandedAdmin === admin._id && (
                      <div className="px-6 pb-4 bg-bg/50">
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          <div className="p-3 rounded-xl bg-bg border border-border/50">
                            <p className="text-xs text-text-muted">Phone</p>
                            <p className="text-sm font-semibold">{admin.phone || '—'}</p>
                          </div>
                          <div className="p-3 rounded-xl bg-bg border border-border/50">
                            <p className="text-xs text-text-muted">Joined</p>
                            <p className="text-sm font-semibold">{new Date(admin.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>

                        {/* Consultants under this admin's dept */}
                        <p className="text-xs text-text-muted font-semibold uppercase mb-2">Consultants in {activeDept}</p>
                        <div className="space-y-2 max-h-40 overflow-y-auto mb-3">
                          {consultants.length === 0 ? (
                            <p className="text-xs text-text-muted">No consultants assigned yet.</p>
                          ) : consultants.map(c => (
                            <div key={c._id} className="flex items-center justify-between p-2 rounded-xl bg-bg border border-border/40">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full bg-secondary/20 flex items-center justify-center text-secondary text-xs font-bold">{c.name?.charAt(0)}</div>
                                <div>
                                  <p className="text-xs font-semibold text-text">{c.name}</p>
                                  <p className="text-[10px] text-text-muted">{c.email}</p>
                                </div>
                              </div>
                              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${c.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                {c.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                          ))}
                        </div>

                        <div className="flex gap-2">
                          <button onClick={() => handleToggle(admin._id, admin.isActive, 'admin')}
                            className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-colors ${admin.isActive ? 'border-amber-500/30 text-amber-400 hover:bg-amber-500/10' : 'border-green-500/30 text-green-400 hover:bg-green-500/10'}`}>
                            {admin.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                          <button onClick={() => handleDelete(admin._id, 'admin')}
                            className="flex-1 py-2 rounded-xl text-xs font-semibold border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors">
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Consultants */}
          <div className="card overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex justify-between items-center">
              <div>
                <h2 className="font-bold text-accent capitalize">{activeDept} — Consultants</h2>
                <p className="text-xs text-text-muted mt-0.5">{consultants.length} consultants</p>
              </div>
              <button onClick={() => { setShowAddConsultant(true); setForm({ name: '', email: '', password: '', phone: '' }); }}
                className="btn-primary flex items-center gap-1.5 px-4 py-2 text-sm">
                <span className="material-symbols-outlined text-base">add</span> Add Consultant
              </button>
            </div>

            {consultants.length === 0 ? (
              <div className="py-12 text-center text-text-muted text-sm">No consultants for {activeDept} yet.</div>
            ) : (
              <div className="divide-y divide-border">
                {consultants.map(c => (
                  <div key={c._id} className="px-6 py-4 flex items-center justify-between hover:bg-surface/50">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-secondary/20 flex items-center justify-center text-secondary font-bold">
                        {c.name?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-text text-sm">{c.name}</p>
                        <p className="text-xs text-text-muted">{c.email}</p>
                        <p className="text-xs text-text-muted">{c.phone || '—'}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${c.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {c.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <div className="flex gap-2">
                        <button onClick={() => handleToggle(c._id, c.isActive, 'consultant')}
                          className={`text-xs font-semibold hover:underline ${c.isActive ? 'text-amber-400' : 'text-green-400'}`}>
                          {c.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button onClick={() => handleDelete(c._id, 'consultant')}
                          className="text-red-400 hover:text-red-300">
                          <span className="material-symbols-outlined text-base">delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Admin Modal */}
      {showAddAdmin && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4">
          <div className="bg-surface rounded-3xl p-8 w-full max-w-md">
            <h2 className="text-xl font-bold mb-1">Add {activeDept} Department Admin</h2>
            <p className="text-text-muted text-sm mb-6">This admin will manage the {activeDept} department.</p>
            <div className="space-y-4">
              {[
                { key: 'name', label: 'Full Name', type: 'text', placeholder: 'Admin Name' },
                { key: 'email', label: 'Email', type: 'email', placeholder: 'admin@finbridge.com' },
                { key: 'password', label: 'Password', type: 'password', placeholder: '••••••••' },
                { key: 'phone', label: 'Phone (optional)', type: 'text', placeholder: '+91 9876543210' },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-xs text-text-muted block mb-1">{f.label}</label>
                  <input type={f.type} placeholder={f.placeholder} value={form[f.key]}
                    onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    className="w-full p-2.5 rounded-xl border border-border bg-bg text-sm" />
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowAddAdmin(false)} className="flex-1 btn-ghost py-3">Cancel</button>
              <button onClick={handleAddAdmin} disabled={saving}
                className="flex-1 btn-primary py-3 disabled:opacity-60">
                {saving ? 'Creating...' : 'Create Dept Admin'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Consultant Modal */}
      {showAddConsultant && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4">
          <div className="bg-surface rounded-3xl p-8 w-full max-w-md">
            <h2 className="text-xl font-bold mb-1">Add {activeDept} Consultant</h2>
            <p className="text-text-muted text-sm mb-6">This consultant will handle {activeDept} clients.</p>
            <div className="space-y-4">
              {[
                { key: 'name', label: 'Full Name', type: 'text', placeholder: 'Consultant Name', required: true },
                { key: 'email', label: 'Email', type: 'email', placeholder: 'consultant@finbridge.com', required: true },
                { key: 'password', label: 'Password', type: 'password', placeholder: '••••••••', required: true },
                { key: 'phone', label: 'Phone', type: 'text', placeholder: '+91 9876543210', required: false },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-xs text-text-muted block mb-1">
                    {f.label}
                    {f.required ? ' *' : ' (Optional)'}
                  </label>
                  <input type={f.type} placeholder={f.placeholder} value={form[f.key]}
                    onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    className="w-full p-2.5 rounded-xl border border-border bg-bg text-sm" />
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => { setShowAddConsultant(false); setForm({ name: '', email: '', password: '', phone: '' }); }} className="flex-1 btn-ghost py-3">Cancel</button>
              <button onClick={handleAddConsultant} disabled={saving}
                className="flex-1 btn-primary py-3 disabled:opacity-60">
                {saving ? 'Creating...' : 'Create Consultant'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
