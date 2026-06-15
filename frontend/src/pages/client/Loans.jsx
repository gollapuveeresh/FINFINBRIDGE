import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import ClientLayout from '../../layouts/ClientLayout';
import { formatCurrency } from '../../utils/currencyFormatter';

const STATUS_STYLES = {
  'Active': 'status-badge status-success',
  'Closing Soon': 'status-badge status-warning',
  'Closed': 'status-badge status-neutral',
};

// ─────────────────────────────────────────────────────────────────────────────
// Helpers: EMI Calculation & Date Formatting for Form Inputs
// ─────────────────────────────────────────────────────────────────────────────
const calculateEMI = (principal, annualRate, tenure) => {
  const p = parseFloat(principal);
  const r = parseFloat(annualRate) / 12 / 100;
  const n = parseInt(tenure, 10);

  if (isNaN(p) || isNaN(r) || isNaN(n) || p <= 0 || n <= 0) {
    return 0;
  }

  if (r === 0) {
    return Math.round(p / n);
  }

  const emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  return Math.round(emi);
};

const formatDateForInput = (dateVal) => {
  if (!dateVal) return '';
  const dateObj = new Date(dateVal);
  if (isNaN(dateObj.getTime())) return '';
  return dateObj.toISOString().split('T')[0];
};

export default function LoanManagement() {
  const [loans, setLoans] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form states
  const [formOpen, setFormOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    loanType: 'Home Loan',
    lenderName: '',
    principalAmount: '',
    outstandingBalance: '',
    interestRate: '',
    tenureMonths: '',
    monthlyEMI: '',
    startDate: '',
    endDate: '',
    status: 'Active',
    notes: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Delete modal state
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Toast notification state
  const [toast, setToast] = useState({ message: '', type: '' });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast({ message: '', type: '' });
    }, 4000);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      const [loansRes, profileRes] = await Promise.allSettled([
        api.get('/loans'),
        api.get('/financial-profile')
      ]);

      if (loansRes.status === 'fulfilled' && loansRes.value.data?.status === 'success') {
        setLoans(loansRes.value.data.data || []);
      } else if (loansRes.status === 'rejected') {
        console.error('Failed to fetch loans:', loansRes.reason);
        setError('Failed to load loan records from server.');
      }

      if (profileRes.status === 'fulfilled' && profileRes.value.data?.status === 'success') {
        setProfile(profileRes.value.data.data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAdd = () => {
    setEditId(null);
    setFormData({
      loanType: 'Home Loan',
      lenderName: '',
      principalAmount: '',
      outstandingBalance: '',
      interestRate: '',
      tenureMonths: '',
      monthlyEMI: '',
      startDate: '',
      endDate: '',
      status: 'Active',
      notes: ''
    });
    setFormErrors({});
    setFormOpen(true);
  };

  const handleOpenEdit = (loan) => {
    setEditId(loan._id);
    setFormData({
      loanType: loan.loanType || 'Home Loan',
      lenderName: loan.lenderName || '',
      principalAmount: loan.principalAmount || '',
      outstandingBalance: loan.outstandingBalance || '',
      interestRate: loan.interestRate || '',
      tenureMonths: loan.tenureMonths || '',
      monthlyEMI: loan.monthlyEMI || '',
      startDate: formatDateForInput(loan.startDate),
      endDate: formatDateForInput(loan.endDate),
      status: loan.status || 'Active',
      notes: loan.notes || ''
    });
    setFormErrors({});
    setFormOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Triggers recalculation on dependencies change
  const handleNumericChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...formData, [name]: value };

    const p = name === 'principalAmount' ? value : formData.principalAmount;
    const r = name === 'interestRate' ? value : formData.interestRate;
    const n = name === 'tenureMonths' ? value : formData.tenureMonths;

    const calculated = calculateEMI(p, r, n);
    if (calculated > 0) {
      updated.monthlyEMI = calculated;
    }
    setFormData(updated);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.loanType.trim()) errors.loanType = 'Loan type is required';
    if (!formData.lenderName.trim()) errors.lenderName = 'Lender name is required';

    const p = parseFloat(formData.principalAmount);
    if (isNaN(p) || p <= 0) errors.principalAmount = 'Principal must be greater than 0';

    const o = parseFloat(formData.outstandingBalance);
    if (isNaN(o) || o < 0) {
      errors.outstandingBalance = 'Outstanding balance must be positive';
    } else if (o > p) {
      errors.outstandingBalance = 'Outstanding balance cannot exceed principal amount';
    }

    const r = parseFloat(formData.interestRate);
    if (isNaN(r) || r < 0) errors.interestRate = 'Interest rate must be positive';

    const n = parseInt(formData.tenureMonths, 10);
    if (isNaN(n) || n < 1) errors.tenureMonths = 'Tenure must be at least 1 month';

    const emi = parseFloat(formData.monthlyEMI);
    if (isNaN(emi) || emi < 0) errors.monthlyEMI = 'EMI must be positive';

    if (!formData.startDate) errors.startDate = 'Start date is required';
    if (!formData.endDate) {
      errors.endDate = 'End date is required';
    } else if (formData.startDate && new Date(formData.endDate) < new Date(formData.startDate)) {
      errors.endDate = 'End date cannot be earlier than start date';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const payload = {
        loanType: formData.loanType,
        lenderName: formData.lenderName,
        principalAmount: parseFloat(formData.principalAmount),
        outstandingBalance: parseFloat(formData.outstandingBalance),
        interestRate: parseFloat(formData.interestRate),
        tenureMonths: parseInt(formData.tenureMonths, 10),
        monthlyEMI: parseFloat(formData.monthlyEMI),
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        status: formData.status,
        notes: formData.notes
      };

      let res;
      if (editId) {
        res = await api.put(`/loans/${editId}`, payload);
      } else {
        res = await api.post('/loans', payload);
      }

      if (res.data?.status === 'success') {
        showToast(editId ? 'Loan account updated successfully!' : 'New loan account registered successfully!', 'success');
        setFormOpen(false);
        fetchData(); // Refresh loan list and totals
      } else {
        showToast(res.data?.message || 'Operation failed', 'error');
      }
    } catch (err) {
      console.error('Submit loan error:', err);
      showToast(err.response?.data?.message || 'Server error saving loan account details', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (id) => {
    setDeleteConfirmId(id);
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmId) return;

    try {
      const res = await api.delete(`/loans/${deleteConfirmId}`);
      if (res.data?.status === 'success') {
        showToast('Loan record deleted successfully!', 'success');
        setDeleteConfirmId(null);
        fetchData(); // Refresh list and profile metrics
      } else {
        showToast(res.data?.message || 'Deletion failed', 'error');
      }
    } catch (err) {
      console.error('Delete loan error:', err);
      showToast(err.response?.data?.message || 'Server error deleting loan record', 'error');
    }
  };

  if (loading && loans.length === 0) {
    return (
      <ClientLayout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center">
          <div className="w-12 h-12 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-body-md text-text-muted mt-4 font-semibold">Loading loan accounts...</p>
        </div>
      </ClientLayout>
    );
  }

  if (error && loans.length === 0) {
    return (
      <ClientLayout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center max-w-xl mx-auto text-center space-y-4">
          <div className="w-16 h-16 bg-error/10 border border-error/25 text-error rounded-full flex items-center justify-center shadow-sm">
            <span className="material-symbols-outlined text-3xl">error</span>
          </div>
          <h2 className="text-headline-md font-bold text-accent">Error Loading Loans</h2>
          <p className="text-body-md text-text-muted">{error}</p>
          <button onClick={fetchData} className="btn-primary mt-2">Retry</button>
        </div>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout>
      {/* Toast Notification */}
      {toast.message && (
        <div className={`fixed bottom-5 right-5 z-[10000] p-4 rounded-xl shadow-2xl flex items-center gap-3 border animate-slide-in ${
          toast.type === 'success' 
            ? 'bg-success-container/95 border-success/30 text-success' 
            : 'bg-error-container/95 border-error/30 text-error'
        }`}>
          <span className="material-symbols-outlined">{toast.type === 'success' ? 'check_circle' : 'error'}</span>
          <span className="text-body-md font-semibold">{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-headline-lg font-bold text-accent">Loan Management</h1>
          <p className="text-body-md text-text-muted mt-1">
            Manage and monitor all your active and historical loan accounts.
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleOpenAdd}
            className="btn-primary flex items-center gap-2"
          >
            <span className="material-symbols-outlined">add</span>
            Add Loan
          </button>
          <Link to="/client/loans/recommendations">
            <button className="btn-ghost flex items-center gap-2">
              <span className="material-symbols-outlined">reviews</span>
              View Recommendations
            </button>
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
        {[
          {
            label: 'Total Outstanding',
            value: formatCurrency(profile?.totalLoanAmount ?? 0),
            icon: 'account_balance',
            color: 'bg-accent/10 text-accent'
          },
          {
            label: 'Monthly EMI Due',
            value: formatCurrency(profile?.monthlyEMI ?? 0),
            icon: 'payments',
            color: 'bg-secondary/10 text-secondary'
          },
          {
            label: 'Credit Score',
            value: profile?.creditScore ? `${profile.creditScore}` : 'N/A',
            icon: 'credit_score',
            color: 'bg-success/10 text-success'
          },
        ].map((s, i) => (
          <div key={i} className="card p-6 flex items-center gap-5">
            <div className={`p-3 rounded-xl ${s.color.split(' ')[0]}`}>
              <span className={`material-symbols-outlined ${s.color.split(' ')[1]}`}>{s.icon}</span>
            </div>
            <div>
              <p className="text-text-muted text-label-lg">{s.label}</p>
              <p className="text-headline-md font-bold text-accent mt-1">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Loans Table */}
      <div className="card overflow-hidden">
        <div className="px-8 py-5 border-b border-border flex justify-between items-center">
          <h2 className="text-headline-md font-bold text-accent">All Loan Accounts</h2>
          <span className="text-label-lg text-text-muted">{loans.length} record{loans.length !== 1 ? 's' : ''}</span>
        </div>

        {loans.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center max-w-xl mx-auto space-y-6 fade-in">
            <div className="w-16 h-16 bg-surface-hover rounded-2xl flex items-center justify-center border border-border text-text-muted shadow-sm">
              <span className="material-symbols-outlined text-3xl">account_balance</span>
            </div>
            <div>
              <h3 className="text-headline-md font-bold text-accent">No Loans Added Yet</h3>
              <p className="text-body-md text-text-muted mt-2">
                No active loan records found under your profile. Please add a loan account to begin tracking.
              </p>
            </div>
            <button onClick={handleOpenAdd} className="btn-primary flex items-center gap-2">
              <span className="material-symbols-outlined">add</span>Add Loan Now
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-surface text-label-lg text-text-muted uppercase tracking-wider">
                  <th className="px-6 py-4 text-left">Loan Number</th>
                  <th className="px-6 py-4 text-left">Type</th>
                  <th className="px-6 py-4 text-left">Lender</th>
                  <th className="px-6 py-4 text-right">Outstanding Balance</th>
                  <th className="px-6 py-4 text-right">Monthly EMI</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/50">
                {loans.map((loan) => (
                  <tr key={loan._id} className="hover:bg-surface/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-label-lg text-accent font-bold">
                      {loan.loanNumber}
                    </td>
                    <td className="px-6 py-4 text-body-md text-text">{loan.loanType}</td>
                    <td className="px-6 py-4 text-body-md text-text">{loan.lenderName}</td>
                    <td className="px-6 py-4 text-body-md text-text text-right font-semibold">
                      {formatCurrency(loan.outstandingBalance)}
                    </td>
                    <td className="px-6 py-4 text-body-md text-secondary text-right font-semibold">
                      {formatCurrency(loan.monthlyEMI)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={STATUS_STYLES[loan.status] || 'status-badge status-neutral'}>
                        {loan.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-4">
                        <Link
                          to={`/client/loans/${loan._id}`}
                          className="text-secondary hover:text-accent font-bold text-label-lg flex items-center"
                          title="View details"
                        >
                          <span className="material-symbols-outlined text-base">visibility</span>
                        </Link>
                        <button
                          onClick={() => handleOpenEdit(loan)}
                          className="text-secondary hover:text-accent font-bold flex items-center"
                          title="Edit parameters"
                        >
                          <span className="material-symbols-outlined text-base">edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteClick(loan._id)}
                          className="text-error hover:text-accent font-bold flex items-center"
                          title="Delete loan"
                        >
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

      {/* Add / Edit Modal */}
      {formOpen && (
        <div className="fixed inset-0 bg-accent/45 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 overflow-y-auto">
          <form 
            onSubmit={handleSubmit}
            className="card w-full max-w-2xl p-8 relative shadow-2xl space-y-6 my-8 fade-in scrollbar-none max-h-[90vh] overflow-y-auto"
          >
            <button 
              type="button" 
              onClick={() => setFormOpen(false)}
              className="absolute top-4 right-4 text-text-muted hover:text-accent"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            <div>
              <span className="text-xs text-secondary font-bold uppercase tracking-widest">Loan Account Registry</span>
              <h3 className="text-headline-md font-bold text-accent mt-1">
                {editId ? 'Edit Loan Specifications' : 'Register New Loan Account'}
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-label-lg text-accent font-bold">Loan Type</label>
                <select 
                  name="loanType"
                  value={formData.loanType}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                >
                  <option value="Home Loan">Home Loan</option>
                  <option value="Personal Loan">Personal Loan</option>
                  <option value="Business Loan">Business Loan</option>
                  <option value="Car Loan">Car Loan</option>
                  <option value="Education Loan">Education Loan</option>
                  <option value="Gold Loan">Gold Loan</option>
                  <option value="Other">Other</option>
                </select>
                {formErrors.loanType && <p className="text-error text-xs">{formErrors.loanType}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-label-lg text-accent font-bold">Lender Name</label>
                <input 
                  type="text"
                  name="lenderName"
                  value={formData.lenderName}
                  onChange={handleInputChange}
                  placeholder="e.g. HDFC Bank, SBI"
                  className="form-input"
                  required
                />
                {formErrors.lenderName && <p className="text-error text-xs">{formErrors.lenderName}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-label-lg text-accent font-bold">Principal Amount (INR)</label>
                <input 
                  type="number"
                  name="principalAmount"
                  value={formData.principalAmount}
                  onChange={handleNumericChange}
                  placeholder="e.g. 500000"
                  className="form-input"
                  min="0"
                  required
                />
                {formErrors.principalAmount && <p className="text-error text-xs">{formErrors.principalAmount}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-label-lg text-accent font-bold">Outstanding Balance (INR)</label>
                <input 
                  type="number"
                  name="outstandingBalance"
                  value={formData.outstandingBalance}
                  onChange={handleInputChange}
                  placeholder="e.g. 450000"
                  className="form-input"
                  min="0"
                  required
                />
                {formErrors.outstandingBalance && <p className="text-error text-xs">{formErrors.outstandingBalance}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-label-lg text-accent font-bold">Interest Rate (% p.a.)</label>
                <input 
                  type="number"
                  name="interestRate"
                  step="0.01"
                  value={formData.interestRate}
                  onChange={handleNumericChange}
                  placeholder="e.g. 8.5"
                  className="form-input"
                  min="0"
                  required
                />
                {formErrors.interestRate && <p className="text-error text-xs">{formErrors.interestRate}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-label-lg text-accent font-bold">Tenure (Months)</label>
                <input 
                  type="number"
                  name="tenureMonths"
                  value={formData.tenureMonths}
                  onChange={handleNumericChange}
                  placeholder="e.g. 60"
                  className="form-input"
                  min="1"
                  required
                />
                {formErrors.tenureMonths && <p className="text-error text-xs">{formErrors.tenureMonths}</p>}
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-label-lg text-accent font-bold">Monthly EMI (INR)</label>
                  <span className="text-[10px] text-secondary font-bold uppercase tracking-wider bg-accent/20 px-2 py-0.5 rounded">Auto-Calculated</span>
                </div>
                <input 
                  type="number"
                  name="monthlyEMI"
                  value={formData.monthlyEMI}
                  onChange={handleInputChange}
                  placeholder="e.g. 10245"
                  className="form-input font-semibold text-secondary"
                  min="0"
                  required
                />
                {formErrors.monthlyEMI && <p className="text-error text-xs">{formErrors.monthlyEMI}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-label-lg text-accent font-bold">Status</label>
                <select 
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="form-input font-bold"
                >
                  <option value="Active">Active</option>
                  <option value="Closing Soon">Closing Soon</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-label-lg text-accent font-bold">Start Date</label>
                <input 
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
                {formErrors.startDate && <p className="text-error text-xs">{formErrors.startDate}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-label-lg text-accent font-bold">End Date</label>
                <input 
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
                {formErrors.endDate && <p className="text-error text-xs">{formErrors.endDate}</p>}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-label-lg text-accent font-bold">Additional Notes (Optional)</label>
              <textarea 
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Specific loan clauses, payment terms, or comments..."
                className="form-input min-h-[80px] resize-none text-body-md"
              />
            </div>

            <div className="flex gap-3 pt-4 border-t border-border">
              <button 
                type="button" 
                onClick={() => setFormOpen(false)}
                className="btn-ghost flex-1 py-3"
                disabled={submitting}
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="btn-primary flex-1 py-3"
                disabled={submitting}
              >
                {submitting ? 'Processing...' : (editId ? 'Save Changes' : 'Register Loan')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-accent/45 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="card w-full max-w-md p-8 relative shadow-2xl text-center space-y-6 fade-in">
            <div className="w-16 h-16 bg-error/10 border border-error/25 text-error rounded-full flex items-center justify-center mx-auto shadow-sm">
              <span className="material-symbols-outlined text-4xl">warning</span>
            </div>
            <div>
              <h3 className="text-headline-md font-bold text-accent">Delete Loan Record?</h3>
              <p className="text-body-md text-text-muted mt-2">
                Are you sure you want to delete this loan account? This will recalculate your outstanding balance and EMI metrics. This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button 
                onClick={() => setDeleteConfirmId(null)}
                className="btn-ghost flex-1 py-3"
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmDelete}
                className="bg-error hover:bg-error/90 text-white flex-1 py-3 rounded-lg font-bold transition-all"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </ClientLayout>
  );
}
