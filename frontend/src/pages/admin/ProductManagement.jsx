import AdminLayout from '../../layouts/AdminLayout';
import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const initialLoans = [
  { id: 'l-1', name: 'Commercial Mortgate Refinance', rate: '5.40%', tenure: '15 Years', criteria: 'Portfolios over $1M, clean credit history', status: 'Active' },
  { id: 'l-2', name: 'Corporate Expansion Term Loan', rate: '6.80%', tenure: '5 Years', criteria: 'Annual revenue > $500k, 2+ yrs operating', status: 'Active' },
  { id: 'l-3', name: 'Portfolio Asset Leverage (ABLOC)', rate: '5.95%', tenure: 'Flexible (Interest-Only)', criteria: 'Diversified brokerage holdings over $500k', status: 'Active' },
];

const initialInvestments = [
  { id: 'i-1', name: 'Institutional Capital Growth', risk: 'Medium-High', returnRate: '11.4%', status: 'Active' },
  { id: 'i-2', name: 'Municipal Tax-Free Bonds Pool', risk: 'Low', returnRate: '4.85%', status: 'Active' },
  { id: 'i-3', name: 'Advisory Balanced Hedge Strategy', risk: 'Medium', returnRate: '8.25%', status: 'Suspended' },
];

export default function ProductManagement() {
  const [activeTab, setActiveTab] = useState('loans');
  const [loans, setLoans] = useState(initialLoans);
  const [investments, setInvestments] = useState(initialInvestments);
  
  // Consulting Packages dynamic state
  const [packages, setPackages] = useState([]);
  const [loadingPackages, setLoadingPackages] = useState(false);

  // Form modal states
  const [formOpen, setFormOpen] = useState(false);
  const [editId, setEditId] = useState(null); // if set, we edit this product
  
  // Fields state
  const [prodName, setProdName] = useState('');
  const [prodRate, setProdRate] = useState('');
  const [prodTenure, setProdTenure] = useState('');
  const [prodCriteria, setProdCriteria] = useState('');
  const [prodRisk, setProdRisk] = useState('Medium');
  const [prodStatus, setProdStatus] = useState('Active');

  // Packages fields
  const [prodDesc, setProdDesc] = useState('');
  const [prodDept, setProdDept] = useState('loans');
  const [prodFeatures, setProdFeatures] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodDuration, setProdDuration] = useState('');

  useEffect(() => {
    if (activeTab === 'packages') {
      fetchPackages();
    }
  }, [activeTab]);

  const fetchPackages = async () => {
    setLoadingPackages(true);
    try {
      const res = await api.get('/packages');
      setPackages(res.data || []);
    } catch (e) {
      toast.error('Failed to load consulting packages');
    } finally {
      setLoadingPackages(false);
    }
  };

  const handleOpenAdd = () => {
    setEditId(null);
    setProdName('');
    setProdRate('');
    setProdTenure('');
    setProdCriteria('');
    setProdRisk('Medium');
    setProdStatus('Active');
    setProdDesc('');
    setProdDept('loans');
    setProdFeatures('');
    setProdPrice('');
    setProdDuration('');
    setFormOpen(true);
  };

  const handleOpenEdit = (product) => {
    const idVal = product.id || product._id;
    setEditId(idVal);
    setProdName(product.name);
    setProdStatus(product.status || 'Active');
    if (activeTab === 'loans') {
      setProdRate(product.rate);
      setProdTenure(product.tenure);
      setProdCriteria(product.criteria);
    } else if (activeTab === 'investments') {
      setProdRisk(product.risk);
      setProdRate(product.returnRate);
    } else if (activeTab === 'packages') {
      setProdDesc(product.description || '');
      setProdDept(product.department || 'loans');
      setProdFeatures(product.features ? product.features.join(', ') : '');
      setProdPrice(product.price != null ? String(product.price) : '');
      setProdDuration(product.duration || '');
    }
    setFormOpen(true);
  };

  const handleDelete = async (id) => {
    if (activeTab === 'loans') {
      setLoans(prev => prev.filter(p => p.id !== id));
    } else if (activeTab === 'investments') {
      setInvestments(prev => prev.filter(p => p.id !== id));
    } else if (activeTab === 'packages') {
      try {
        await api.delete(`/packages/${id}`);
        toast.success('Consulting package deleted');
        fetchPackages();
      } catch (e) {
        toast.error('Failed to delete consulting package');
      }
    }
  };

  const handleToggleStatus = async (product) => {
    const idVal = product.id || product._id;
    if (activeTab === 'loans') {
      setLoans(prev => prev.map(p => p.id === idVal ? { ...p, status: p.status === 'Active' ? 'Suspended' : 'Active' } : p));
    } else if (activeTab === 'investments') {
      setInvestments(prev => prev.map(p => p.id === idVal ? { ...p, status: p.status === 'Active' ? 'Suspended' : 'Active' } : p));
    } else if (activeTab === 'packages') {
      try {
        const nextStatus = product.status === 'Active' ? 'Suspended' : 'Active';
        await api.put(`/packages/${idVal}`, {
          ...product,
          status: nextStatus
        });
        toast.success(`Package status updated to ${nextStatus}`);
        fetchPackages();
      } catch (e) {
        toast.error('Failed to toggle status');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prodName) return;

    if (activeTab === 'loans') {
      if (!prodRate) return;
      if (editId) {
        setLoans(prev => prev.map(p => p.id === editId ? { id: editId, name: prodName, rate: prodRate, tenure: prodTenure, criteria: prodCriteria, status: prodStatus } : p));
      } else {
        setLoans(prev => [
          ...prev,
          { id: `l-${Date.now()}`, name: prodName, rate: prodRate, tenure: prodTenure, criteria: prodCriteria, status: prodStatus }
        ]);
      }
      setFormOpen(false);
    } else if (activeTab === 'investments') {
      if (!prodRate) return;
      if (editId) {
        setInvestments(prev => prev.map(p => p.id === editId ? { id: editId, name: prodName, risk: prodRisk, returnRate: prodRate, status: prodStatus } : p));
      } else {
        setInvestments(prev => [
          ...prev,
          { id: `i-${Date.now()}`, name: prodName, risk: prodRisk, returnRate: prodRate, status: prodStatus }
        ]);
      }
      setFormOpen(false);
    } else if (activeTab === 'packages') {
      try {
        const featuresArray = prodFeatures
          ? prodFeatures.split(',').map(f => f.trim()).filter(Boolean)
          : [];
        const payload = {
          name: prodName,
          description: prodDesc,
          department: prodDept,
          price: prodPrice ? parseFloat(prodPrice) : null,
          duration: prodDuration,
          features: featuresArray,
          status: prodStatus
        };

        if (editId) {
          await api.put(`/packages/${editId}`, payload);
          toast.success('Consulting package updated');
        } else {
          await api.post('/packages', payload);
          toast.success('Consulting package created');
        }
        fetchPackages();
        setFormOpen(false);
      } catch (e) {
        toast.error('Failed to save consulting package');
      }
    }
  };

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-headline-lg font-bold text-accent">Platform Offerings & Registry</h1>
          <p className="text-body-md text-text-muted mt-1">Configure interest margins, dynamic parameters, and active advisory catalogs.</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="btn-primary flex items-center gap-2"
        >
          <span className="material-symbols-outlined">add</span>
          {activeTab === 'packages' ? 'Add Package' : 'Add New Product'}
        </button>
      </div>

      {/* Tabs list */}
      <div className="card overflow-hidden">
        <div className="flex border-b border-border/40 bg-surface-hover-lowest overflow-x-auto">
          {[
            { id: 'loans', label: 'Loan & Refinancing Products', icon: 'payments' },
            { id: 'investments', label: 'Asset Management Portfolios', icon: 'trending_up' },
            { id: 'packages', label: 'Consulting Packages', icon: 'workspace_premium' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setFormOpen(false); }}
              className={`px-6 py-4 text-label-lg font-semibold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-secondary text-accent font-bold bg-surface'
                  : 'border-transparent text-text-muted hover:text-accent'
              }`}
            >
              <span className="material-symbols-outlined text-sm">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content list */}
        <div className="p-8">
          {activeTab === 'loans' ? (
            <div className="overflow-x-auto fade-in">
              <table className="w-full">
                <thead>
                  <tr className="bg-surface text-label-lg text-text-muted uppercase tracking-wider">
                    <th className="px-6 py-4 text-left">Product Name</th>
                    <th className="px-6 py-4 text-right">Target APR</th>
                    <th className="px-6 py-4 text-left">Tenure Span</th>
                    <th className="px-6 py-4 text-left">Compliance / Eligibility Rules</th>
                    <th className="px-6 py-4 text-left">Status</th>
                    <th className="px-6 py-4 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/40 text-body-md text-text">
                  {loans.map((item) => (
                    <tr key={item.id} className="hover:bg-surface/30 transition-colors">
                      <td className="px-6 py-4 font-bold text-accent">{item.name}</td>
                      <td className="px-6 py-4 text-right font-bold text-secondary">{item.rate}</td>
                      <td className="px-6 py-4 font-semibold text-accent">{item.tenure}</td>
                      <td className="px-6 py-4 text-body-sm text-text-muted max-w-[200px] truncate" title={item.criteria}>{item.criteria}</td>
                      <td className="px-6 py-4">
                        <span className={`status-badge ${item.status === 'Active' ? 'status-success' : 'bg-outline-variant/40 text-text-muted'}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button onClick={() => handleOpenEdit(item)} className="text-secondary hover:text-accent transition-colors p-1" title="Edit"><span className="material-symbols-outlined text-base">edit</span></button>
                          <button onClick={() => handleToggleStatus(item)} className="text-secondary hover:text-accent transition-colors p-1" title="Toggle Status"><span className="material-symbols-outlined text-base">sync</span></button>
                          <button onClick={() => handleDelete(item.id)} className="text-error hover:underline transition-colors p-1" title="Delete"><span className="material-symbols-outlined text-base">delete</span></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {loans.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-text-muted">No loan products in registry.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : activeTab === 'investments' ? (
            <div className="overflow-x-auto fade-in">
              <table className="w-full">
                <thead>
                  <tr className="bg-surface text-label-lg text-text-muted uppercase tracking-wider">
                    <th className="px-6 py-4 text-left">Portfolio Name</th>
                    <th className="px-6 py-4 text-left">Risk Level</th>
                    <th className="px-6 py-4 text-right">Expected IRR</th>
                    <th className="px-6 py-4 text-left">Status</th>
                    <th className="px-6 py-4 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/40 text-body-md text-text">
                  {investments.map((item) => (
                    <tr key={item.id} className="hover:bg-surface/30 transition-colors">
                      <td className="px-6 py-4 font-bold text-accent">{item.name}</td>
                      <td className="px-6 py-4">
                        <span className={`status-badge ${
                          item.risk === 'Low' ? 'status-success' : item.risk === 'Medium' ? 'status-info' : 'status-warning'
                        }`}>{item.risk}</span>
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-secondary">{item.returnRate}</td>
                      <td className="px-6 py-4">
                        <span className={`status-badge ${item.status === 'Active' ? 'status-success' : 'bg-outline-variant/40 text-text-muted'}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button onClick={() => handleOpenEdit(item)} className="text-secondary hover:text-accent transition-colors p-1" title="Edit"><span className="material-symbols-outlined text-base">edit</span></button>
                          <button onClick={() => handleToggleStatus(item)} className="text-secondary hover:text-accent transition-colors p-1" title="Toggle Status"><span className="material-symbols-outlined text-base">sync</span></button>
                          <button onClick={() => handleDelete(item.id)} className="text-error hover:underline transition-colors p-1" title="Delete"><span className="material-symbols-outlined text-base">delete</span></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {investments.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-text-muted">No investment portfolios in registry.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto fade-in">
              <table className="w-full">
                <thead>
                  <tr className="bg-surface text-label-lg text-text-muted uppercase tracking-wider">
                    <th className="px-6 py-4 text-left">Package Name</th>
                    <th className="px-6 py-4 text-left">Department</th>
                    <th className="px-6 py-4 text-right">Price</th>
                    <th className="px-6 py-4 text-left">Duration</th>
                    <th className="px-6 py-4 text-left">Features</th>
                    <th className="px-6 py-4 text-left">Status</th>
                    <th className="px-6 py-4 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/40 text-body-md text-text">
                  {loadingPackages ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-text-muted">Loading packages...</td>
                    </tr>
                  ) : packages.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-text-muted">No consulting packages in registry.</td>
                    </tr>
                  ) : (
                    packages.map((item) => (
                      <tr key={item.id || item._id} className="hover:bg-surface/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-accent">{item.name}</div>
                          <div className="text-xs text-text-muted mt-0.5 max-w-[220px] truncate" title={item.description}>{item.description}</div>
                        </td>
                        <td className="px-6 py-4 capitalize font-semibold text-accent">{item.department}</td>
                        <td className="px-6 py-4 text-right font-bold text-secondary">
                          {item.price ? `₹${Number(item.price).toLocaleString('en-IN')}` : 'Free'}
                        </td>
                        <td className="px-6 py-4 text-accent font-semibold">{item.duration || 'Flexible'}</td>
                        <td className="px-6 py-4 text-body-sm text-text-muted max-w-[200px] truncate" title={item.features?.join(', ')}>
                          {item.features?.join(', ') || 'None'}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`status-badge ${item.status === 'Active' ? 'status-success' : 'bg-outline-variant/40 text-text-muted'}`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button onClick={() => handleOpenEdit(item)} className="text-secondary hover:text-accent transition-colors p-1" title="Edit"><span className="material-symbols-outlined text-base">edit</span></button>
                            <button onClick={() => handleToggleStatus(item)} className="text-secondary hover:text-accent transition-colors p-1" title="Toggle Status"><span className="material-symbols-outlined text-base">sync</span></button>
                            <button onClick={() => handleDelete(item.id || item._id)} className="text-error hover:underline transition-colors p-1" title="Delete"><span className="material-symbols-outlined text-base">delete</span></button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Form Modal */}
      {formOpen && (
        <div className="fixed inset-0 bg-accent/45 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <form 
            onSubmit={handleSubmit}
            className="card w-full max-w-lg p-8 relative shadow-2xl space-y-5 fade-in"
          >
            <button 
              type="button" 
              onClick={() => setFormOpen(false)}
              className="absolute top-4 right-4 text-text-muted hover:text-accent"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            <div>
              <span className="text-xs text-text-muted font-bold uppercase tracking-widest">
                {activeTab === 'loans' ? 'Loan Product Config' : activeTab === 'investments' ? 'Advisory Portfolio Config' : 'Consulting Package Config'}
              </span>
              <h3 className="text-headline-md font-bold text-accent mt-1">{editId ? 'Edit Offering Parameters' : 'Register New Offering'}</h3>
            </div>

            <div className="space-y-2">
              <label className="text-label-lg text-accent font-bold">Name</label>
              <input 
                type="text"
                value={prodName}
                onChange={(e) => setProdName(e.target.value)}
                placeholder="e.g. Startup Launch Package"
                className="form-input"
                required
              />
            </div>

            {activeTab === 'packages' ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-label-lg text-accent font-bold">Price (₹)</label>
                    <input 
                      type="number"
                      value={prodPrice}
                      onChange={(e) => setProdPrice(e.target.value)}
                      placeholder="e.g. 150000"
                      className="form-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-label-lg text-accent font-bold">Duration</label>
                    <input 
                      type="text"
                      value={prodDuration}
                      onChange={(e) => setProdDuration(e.target.value)}
                      placeholder="e.g. 3 Months"
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-label-lg text-accent font-bold">Department</label>
                    <select 
                      value={prodDept}
                      onChange={(e) => setProdDept(e.target.value)}
                      className="form-input font-bold"
                    >
                      <option value="loans">Loans</option>
                      <option value="tax">Tax</option>
                      <option value="investment">Investment</option>
                      <option value="insurance">Insurance</option>
                      <option value="wealth">Wealth</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-label-lg text-accent font-bold">Initial Roster Status</label>
                    <select 
                      value={prodStatus}
                      onChange={(e) => setProdStatus(e.target.value)}
                      className="form-input font-bold"
                    >
                      <option value="Active">Active</option>
                      <option value="Suspended">Suspended</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-label-lg text-accent font-bold">Description</label>
                  <textarea 
                    value={prodDesc}
                    onChange={(e) => setProdDesc(e.target.value)}
                    placeholder="Short description of the consulting package..."
                    className="form-input min-h-[60px] resize-none text-body-md"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-label-lg text-accent font-bold">Features (comma-separated)</label>
                  <input 
                    type="text"
                    value={prodFeatures}
                    onChange={(e) => setProdFeatures(e.target.value)}
                    placeholder="e.g. Pitch Deck Review, Funding Strategy"
                    className="form-input"
                  />
                </div>
              </>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-label-lg text-accent font-bold">{activeTab === 'loans' ? 'Rate / Returns (%)' : 'Expected IRR (%)'}</label>
                    <input 
                      type="text"
                      value={prodRate}
                      onChange={(e) => setProdRate(e.target.value)}
                      placeholder="e.g. 5.95%"
                      className="form-input"
                      required
                    />
                  </div>

                  {activeTab === 'loans' ? (
                    <div className="space-y-2">
                      <label className="text-label-lg text-accent font-bold">Tenure Term</label>
                      <input 
                        type="text"
                        value={prodTenure}
                        onChange={(e) => setProdTenure(e.target.value)}
                        placeholder="e.g. 15 Years"
                        className="form-input"
                        required
                      />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <label className="text-label-lg text-accent font-bold">Risk Level</label>
                      <select 
                        value={prodRisk}
                        onChange={(e) => setProdRisk(e.target.value)}
                        className="form-input font-bold"
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="Medium-High">Medium-High</option>
                        <option value="High">High</option>
                      </select>
                    </div>
                  )}
                </div>

                {activeTab === 'loans' && (
                  <div className="space-y-2">
                    <label className="text-label-lg text-accent font-bold">Compliance Eligibility Criteria</label>
                    <textarea 
                      value={prodCriteria}
                      onChange={(e) => setProdCriteria(e.target.value)}
                      placeholder="Qualifications for loan approval..."
                      className="form-input min-h-[80px] resize-none text-body-md"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-label-lg text-accent font-bold">Initial Roster Status</label>
                  <select 
                    value={prodStatus}
                    onChange={(e) => setProdStatus(e.target.value)}
                    className="form-input font-bold"
                  >
                    <option value="Active">Active</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
              </>
            )}

            <div className="flex gap-3 pt-4 border-t border-border/35">
              <button 
                type="button" 
                onClick={() => setFormOpen(false)}
                className="btn-ghost flex-1 py-3"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="btn-primary flex-1 py-3"
              >
                {editId ? 'Sync Changes' : 'Publish Product'}
              </button>
            </div>
          </form>
        </div>
      )}
    </AdminLayout>
  );
}
