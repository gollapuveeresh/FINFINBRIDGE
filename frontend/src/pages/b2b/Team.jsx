import { useEffect, useState } from 'react';
import B2BLayout from '../../layouts/B2BLayout';
import { useB2BAuth } from '../../context/B2BAuthContext';
import b2bApi from '../../services/b2bApi';
import toast from 'react-hot-toast';

const ROLES = ['COMPANY_ADMIN','FINANCE_MANAGER','DIRECTOR','EMPLOYEE'];
const ROLE_COLORS = {
  COMPANY_ADMIN:'bg-accent/15 text-accent', FINANCE_MANAGER:'bg-secondary/15 text-secondary',
  DIRECTOR:'bg-purple-500/15 text-purple-400', EMPLOYEE:'bg-surface text-text-muted',
};

export default function B2BTeam() {
  const { company } = useB2BAuth();
  const orgId = company?.organizationId;
  const [members, setMembers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name:'', email:'', role:'EMPLOYEE', password:'' });

  const load = () => {
    if (!orgId) return;
    b2bApi.get(`/b2b/organizations/${orgId}/team`).then(r => setMembers(r.data)).catch(() => {});
  };

  useEffect(() => { load(); }, [orgId]);

  const handleAdd = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await b2bApi.post(`/b2b/organizations/${orgId}/team`, form);
      toast.success('Team member added');
      setShowModal(false);
      setForm({ name:'', email:'', role:'EMPLOYEE', password:'' });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add member');
    } finally { setLoading(false); }
  };

  return (
    <B2BLayout>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-accent">Team Members</h1>
          <p className="text-text-muted text-sm mt-0.5">Manage access and roles for your company's portal users</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2 px-5 py-2.5">
          <span className="material-symbols-outlined text-lg">person_add</span>Add Member
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {ROLES.map(r => {
          const count = members.filter(m => m.role === r).length;
          return (
            <div key={r} className="card p-4 text-center">
              <p className="text-2xl font-bold text-accent">{count}</p>
              <p className="text-xs text-text-muted mt-1">{r.replace(/_/g,' ')}</p>
            </div>
          );
        })}
      </div>

      {/* Members grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {members.map(m => (
          <div key={m.id} className="card p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center text-secondary font-bold text-base shrink-0">
              {m.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-text truncate">{m.name}</p>
              <p className="text-xs text-text-muted truncate">{m.email}</p>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full mt-1.5 inline-block ${ROLE_COLORS[m.role] || ''}`}>
                {m.role.replace(/_/g,' ')}
              </span>
            </div>
            <span className={`w-2 h-2 rounded-full shrink-0 ${m.active ? 'bg-green-500' : 'bg-border'}`} title={m.active ? 'Active' : 'Inactive'} />
          </div>
        ))}

        {members.length === 0 && (
          <div className="col-span-3 card p-12 text-center text-text-muted">
            <span className="material-symbols-outlined text-3xl block mb-2 opacity-30">group</span>
            <p>No team members yet. Add your first team member.</p>
          </div>
        )}
      </div>

      {/* Add modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="card w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-accent">Add Team Member</h2>
              <button onClick={() => setShowModal(false)} className="text-text-muted hover:text-text">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleAdd} className="space-y-4">
              {[
                { label:'Full Name', k:'name', type:'text', placeholder:'Jane Smith' },
                { label:'Email Address', k:'email', type:'email', placeholder:'jane@company.com' },
                { label:'Temporary Password', k:'password', type:'password', placeholder:'••••••••' },
              ].map(f => (
                <div key={f.k}>
                  <label className="text-xs text-text-muted block mb-1">{f.label} *</label>
                  <input type={f.type} value={form[f.k]} onChange={e => setForm(p=>({...p,[f.k]:e.target.value}))}
                    className="w-full p-2.5 rounded-xl border border-border bg-bg text-sm focus:outline-none focus:border-secondary"
                    placeholder={f.placeholder} required />
                </div>
              ))}
              <div>
                <label className="text-xs text-text-muted block mb-1">Role *</label>
                <select value={form.role} onChange={e => setForm(p=>({...p,role:e.target.value}))}
                  className="w-full p-2.5 rounded-xl border border-border bg-bg text-sm">
                  {ROLES.map(r => <option key={r} value={r}>{r.replace(/_/g,' ')}</option>)}
                </select>
              </div>
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-400">
                The team member will receive login credentials via email.
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 btn-ghost py-2.5">Cancel</button>
                <button type="submit" disabled={loading} className="flex-1 btn-primary py-2.5 disabled:opacity-60">
                  {loading ? 'Adding...' : 'Add Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </B2BLayout>
  );
}
