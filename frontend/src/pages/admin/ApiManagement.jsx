import React, { useState, useEffect } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import api from '../../services/api';
import toast from 'react-hot-toast';

const DEPARTMENTS = [
  { value: 'loans', label: 'Loans (PaisaBazaar)', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  { value: 'tax', label: 'Tax (Mutual Funds)', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  { value: 'investments', label: 'Investments (Moneycontrol)', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  { value: 'insurance', label: 'Insurance (LIC)', color: 'bg-rose-500/20 text-rose-400 border-rose-500/30' },
  { value: 'wealth', label: 'Wealth (HDFC Life)', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
];

export default function ApiManagement() {
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingConfig, setEditingConfig] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');

  const [form, setForm] = useState({
    name: '',
    department: 'loans',
    apiUrl: '',
    apiKey: '',
    apiSecret: '',
    active: true
  });

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api-configurations');
      setConfigs(res.data.configurations || []);
    } catch {
      toast.error('Failed to fetch API configurations');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingConfig(null);
    setForm({
      name: '',
      department: 'loans',
      apiUrl: '',
      apiKey: '',
      apiSecret: '',
      active: true
    });
    setShowModal(true);
  };

  const handleOpenEdit = (config) => {
    setEditingConfig(config);
    setForm({
      name: config.name,
      department: config.department,
      apiUrl: config.apiUrl,
      apiKey: config.apiKey || '',
      apiSecret: config.apiSecret || '',
      active: config.active
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name || !form.apiUrl) {
      toast.error('Name and API URL are required');
      return;
    }

    try {
      if (editingConfig) {
        const res = await api.put(`/api-configurations/${editingConfig.id}`, form);
        setConfigs(configs.map(c => c.id === editingConfig.id ? res.data.configuration : c));
        toast.success('API configuration updated successfully!');
      } else {
        const res = await api.post('/api-configurations', form);
        setConfigs([...configs, res.data.configuration]);
        toast.success('API configuration added successfully!');
      }
      setShowModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save configuration');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this API configuration?')) {
      try {
        await api.delete(`/api-configurations/${id}`);
        setConfigs(configs.filter(c => c.id !== id));
        toast.success('API configuration deleted');
      } catch {
        toast.error('Failed to delete configuration');
      }
    }
  };

  const handleToggleActive = async (config) => {
    try {
      const updatedForm = {
        name: config.name,
        department: config.department,
        apiUrl: config.apiUrl,
        apiKey: config.apiKey,
        apiSecret: config.apiSecret,
        active: !config.active
      };
      const res = await api.put(`/api-configurations/${config.id}`, updatedForm);
      setConfigs(configs.map(c => c.id === config.id ? res.data.configuration : c));
      toast.success(`API configuration ${!config.active ? 'enabled' : 'disabled'}`);
    } catch {
      toast.error('Failed to toggle API status');
    }
  };

  const filteredConfigs = configs.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.apiUrl.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = selectedDept === 'All' || c.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  const getDeptColor = (dept) => {
    const found = DEPARTMENTS.find(d => d.value === dept);
    return found ? found.color : 'bg-surface text-text border border-border';
  };

  const getDeptLabel = (dept) => {
    const found = DEPARTMENTS.find(d => d.value === dept);
    return found ? found.label.split(' ')[0] : dept;
  };

  // Stats computation
  const totalApis = configs.length;
  const activeApis = configs.filter(c => c.active).length;
  const inactiveApis = totalApis - activeApis;

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-headline-lg font-bold text-accent font-sans">API Management</h1>
          <p className="text-body-md text-text-muted mt-1">Configure and manage external third-party APIs department-wise for live financial recommendations.</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="btn-primary flex items-center gap-2 px-5 py-3 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <span className="material-symbols-outlined text-base">add_link</span>
          Add API Connection
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter mb-8">
        <div className="card p-6 flex items-center gap-4">
          <div className="p-3 bg-accent/10 rounded-2xl">
            <span className="material-symbols-outlined text-accent text-2xl">link</span>
          </div>
          <div>
            <p className="text-text-muted text-xs font-semibold uppercase tracking-wider">Total Connections</p>
            <p className="text-2xl font-black text-accent mt-0.5">{totalApis}</p>
          </div>
        </div>
        <div className="card p-6 flex items-center gap-4">
          <div className="p-3 bg-green-500/10 rounded-2xl">
            <span className="material-symbols-outlined text-green-400 text-2xl">check_circle</span>
          </div>
          <div>
            <p className="text-text-muted text-xs font-semibold uppercase tracking-wider">Active APIs</p>
            <p className="text-2xl font-black text-green-400 mt-0.5">{activeApis}</p>
          </div>
        </div>
        <div className="card p-6 flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 rounded-2xl">
            <span className="material-symbols-outlined text-amber-400 text-2xl">error</span>
          </div>
          <div>
            <p className="text-text-muted text-xs font-semibold uppercase tracking-wider">Offline/Mock Fallbacks</p>
            <p className="text-2xl font-black text-amber-400 mt-0.5">{5 - activeApis < 0 ? 0 : 5 - activeApis} / 5</p>
          </div>
        </div>
      </div>

      {/* Filter panel */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <span className="material-symbols-outlined absolute left-4 top-3.5 text-text-muted text-sm">search</span>
          <input 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-surface border border-border rounded-2xl focus:outline-none focus:border-accent text-sm"
            placeholder="Search by API name or URL..."
          />
        </div>
        <select 
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
          className="px-4 py-3 bg-surface border border-border rounded-2xl text-sm text-text focus:outline-none focus:border-accent min-w-[200px]"
        >
          <option value="All">All Departments</option>
          {DEPARTMENTS.map(d => (
            <option key={d.value} value={d.value}>{d.label}</option>
          ))}
        </select>
      </div>

      {/* Table Card */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="py-24 text-center text-text-muted animate-pulse">Loading API connections...</div>
        ) : filteredConfigs.length === 0 ? (
          <div className="py-20 text-center">
            <span className="material-symbols-outlined text-5xl text-text-muted">link_off</span>
            <p className="font-bold text-accent mt-4 text-lg">No API Connections found</p>
            <p className="text-text-muted text-sm mt-1">Configure an API to query live offerings for your consultants.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface border-b border-border">
                <tr className="text-left text-text-muted text-xs uppercase tracking-wider font-semibold">
                  <th className="px-6 py-4">Department</th>
                  <th className="px-6 py-4">API Name</th>
                  <th className="px-6 py-4">Endpoint URL</th>
                  <th className="px-6 py-4">API Key</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredConfigs.map(config => (
                  <tr key={config.id} className="hover:bg-surface-hover/30 transition-colors">
                    <td className="px-6 py-4">
                      <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold border capitalize tracking-wider ${getDeptColor(config.department)}`}>
                        {getDeptLabel(config.department)}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-accent">{config.name}</td>
                    <td className="px-6 py-4 text-xs font-mono text-text-muted max-w-[200px] truncate" title={config.apiUrl}>
                      {config.apiUrl}
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-text-muted">
                      {config.apiKey ? `${config.apiKey.substring(0, 4)}...****` : '—'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => handleToggleActive(config)}
                        className={`relative w-11 h-6 rounded-full transition-colors ${config.active ? 'bg-green-500' : 'bg-border'}`}
                        title={config.active ? 'Click to Disable' : 'Click to Enable'}
                      >
                        <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all duration-200 ${config.active ? 'right-1' : 'left-1'}`} />
                      </button>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button 
                          onClick={() => handleOpenEdit(config)}
                          className="p-2 rounded-xl text-text-muted hover:text-accent hover:bg-surface-hover transition-colors"
                          title="Edit Settings"
                        >
                          <span className="material-symbols-outlined text-lg">edit</span>
                        </button>
                        <button 
                          onClick={() => handleDelete(config.id)}
                          className="p-2 rounded-xl text-text-muted hover:text-red-500 hover:bg-red-500/10 transition-colors"
                          title="Delete API"
                        >
                          <span className="material-symbols-outlined text-lg">delete</span>
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

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center px-4 transition-all duration-300">
          <div className="bg-surface border border-border/40 rounded-3xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col gap-6">
            
            <div className="flex justify-between items-center border-b border-border/40 pb-4">
              <h3 className="text-xl font-bold text-accent">{editingConfig ? 'Edit API Connection' : 'Add New API Connection'}</h3>
              <button 
                onClick={() => setShowModal(false)} 
                className="p-2 rounded-xl hover:bg-surface-hover text-text-muted transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-xs text-text-muted font-bold block mb-1">API Provider Name *</label>
                <input 
                  type="text" 
                  value={form.name} 
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Paisabazaar Production API"
                  className="w-full p-3 rounded-xl border border-border bg-bg text-sm focus:outline-none focus:border-accent"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-text-muted font-bold block mb-1">Department Category *</label>
                <select 
                  value={form.department} 
                  onChange={e => setForm({ ...form, department: e.target.value })}
                  className="w-full p-3 rounded-xl border border-border bg-bg text-sm focus:outline-none focus:border-accent"
                >
                  {DEPARTMENTS.map(d => (
                    <option key={d.value} value={d.value}>{d.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-text-muted font-bold block mb-1">Endpoint URL *</label>
                <input 
                  type="url" 
                  value={form.apiUrl} 
                  onChange={e => setForm({ ...form, apiUrl: e.target.value })}
                  placeholder="https://api.externalpartner.com/v1/quotes"
                  className="w-full p-3 rounded-xl border border-border bg-bg text-sm font-mono focus:outline-none focus:border-accent"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-text-muted font-bold block mb-1">API Key</label>
                  <input 
                    type="password" 
                    value={form.apiKey} 
                    onChange={e => setForm({ ...form, apiKey: e.target.value })}
                    placeholder="X-API-KEY"
                    className="w-full p-3 rounded-xl border border-border bg-bg text-sm font-mono focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="text-xs text-text-muted font-bold block mb-1">API Secret / Client ID</label>
                  <input 
                    type="password" 
                    value={form.apiSecret} 
                    onChange={e => setForm({ ...form, apiSecret: e.target.value })}
                    placeholder="API Secret Key"
                    className="w-full p-3 rounded-xl border border-border bg-bg text-sm font-mono focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 py-2">
                <input 
                  type="checkbox" 
                  id="active" 
                  checked={form.active}
                  onChange={e => setForm({ ...form, active: e.target.checked })}
                  className="w-4 h-4 rounded text-accent focus:ring-accent border-border"
                />
                <label htmlFor="active" className="text-sm font-semibold text-text">Enable API configuration instantly</label>
              </div>

              <div className="flex gap-3 pt-4 border-t border-border/40 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 btn-ghost py-3 rounded-xl">
                  Cancel
                </button>
                <button type="submit" className="flex-1 btn-primary py-3 rounded-xl">
                  Save Connection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
