import { useState, useEffect } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function CRMManagement() {
  const [crmAdmins, setCrmAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchCRMAdmins(); }, []);

  const fetchCRMAdmins = async () => {
    try {
      setLoading(true);
      const res = await api.get('/auth/admins', { params: { role: 'crm-admin' } });
      setCrmAdmins(res.data.admins || []);
    } catch { toast.error('Failed to load CRM admins'); }
    finally { setLoading(false); }
  };

  const handleAdd = async () => {
    if (!form.name || !form.email || !form.password) { toast.error('Name, email and password are required'); return; }
    try {
      setSaving(true);
      await api.post('/auth/create-admin', { ...form, role: 'crm-admin', department: 'crm' });
      toast.success('CRM Admin created successfully');
      setShowAdd(false);
      setForm({ name: '', email: '', password: '', phone: '' });
      fetchCRMAdmins();
    } catch (e) { toast.error(e.response?.data?.message || 'Failed to create'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this CRM Admin?')) return;
    try {
      await api.delete(`/auth/admins/${id}`);
      toast.success('CRM Admin deleted');
      fetchCRMAdmins();
    } catch { toast.error('Failed to delete'); }
  };

  const handleToggle = async (id, isActive) => {
    try {
      await api.patch(`/auth/admins/${id}`, { isActive: !isActive });
      toast.success(isActive ? 'Admin deactivated' : 'Admin activated');
      fetchCRMAdmins();
    } catch { toast.error('Failed to update'); }
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-headline-lg font-bold text-accent">CRM Management</h1>
          <p className="text-text-muted mt-1">Manage CRM team admins who handle lead qualification and routing.</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2 px-6">
          <span className="material-symbols-outlined">person_add</span> Add CRM Admin
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-gutter">
        {[
          { label: 'Total CRM Admins', value: crmAdmins.length, icon: 'support_agent', color: 'text-purple-400 bg-purple-500/10' },
          { label: 'Active', value: crmAdmins.filter(a => a.isActive).length, icon: 'check_circle', color: 'text-green-400 bg-green-500/10' },
          { label: 'Inactive', value: crmAdmins.filter(a => !a.isActive).length, icon: 'block', color: 'text-red-400 bg-red-500/10' },
        ].map((k, i) => (
          <div key={i} className="card p-6 flex items-center gap-4">
            <div className={`p-3 rounded-xl ${k.color.split(' ')[1]}`}>
              <span className={`material-symbols-outlined ${k.color.split(' ')[0]}`}>{k.icon}</span>
            </div>
            <div>
              <p className="text-text-muted text-label-lg">{k.label}</p>
              <p className="text-headline-md font-bold text-accent mt-1">{k.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* CRM Admins Table */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex justify-between items-center">
          <h2 className="font-bold text-accent">CRM Admin Accounts</h2>
          <span className="text-xs text-text-muted">{crmAdmins.length} accounts</span>
        </div>

        {loading ? (
          <div className="py-16 text-center text-text-muted">Loading...</div>
        ) : crmAdmins.length === 0 ? (
          <div className="py-16 text-center text-text-muted">No CRM admins yet. Add your first one.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface border-b border-border">
                <tr className="text-left">
                  {['Name', 'Email', 'Phone', 'Status', 'Created', 'Actions'].map(h => (
                    <th key={h} className="px-5 py-3 text-text-muted font-semibold text-xs uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {crmAdmins.map(admin => (
                  <tr key={admin._id} className="hover:bg-surface/50">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold shrink-0">
                          {admin.name?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-text">{admin.name}</p>
                          <p className="text-xs text-text-muted">CRM Admin</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-text-muted">{admin.email}</td>
                    <td className="px-5 py-4 text-text-muted">{admin.phone || '—'}</td>
                    <td className="px-5 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${admin.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {admin.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-text-muted text-xs">{new Date(admin.createdAt).toLocaleDateString()}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <button onClick={() => handleToggle(admin._id, admin.isActive)}
                          className={`text-xs font-semibold hover:underline ${admin.isActive ? 'text-amber-400' : 'text-green-400'}`}>
                          {admin.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button onClick={() => handleDelete(admin._id)}
                          className="text-red-400 hover:text-red-300 transition-colors">
                          <span className="material-symbols-outlined text-base">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4">
          <div className="bg-surface rounded-3xl p-8 w-full max-w-md">
            <h2 className="text-xl font-bold mb-6">Add New CRM Admin</h2>
            <div className="space-y-4">
              {[
                { key: 'name', label: 'Full Name', type: 'text', placeholder: 'CRM Executive' },
                { key: 'email', label: 'Email', type: 'email', placeholder: 'crm@gmail.com' },
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
              <button onClick={() => setShowAdd(false)} className="flex-1 btn-ghost py-3">Cancel</button>
              <button onClick={handleAdd} disabled={saving}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-semibold py-3 disabled:opacity-60 transition-colors">
                {saving ? 'Creating...' : 'Create CRM Admin'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
