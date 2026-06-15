import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import ClientLayout from '../../layouts/ClientLayout';
import { formatCurrency } from '../../utils/currencyFormatter';

const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

const formatDateForInput = (dateVal) => {
  if (!dateVal) return '';
  const dateObj = new Date(dateVal);
  if (isNaN(dateObj.getTime())) return '';
  return dateObj.toISOString().split('T')[0];
};

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

const STATUS_STYLES = {
  'Active': 'status-badge status-success',
  'Closing Soon': 'status-badge status-warning',
  'Closed': 'status-badge status-neutral',
};

export default function LoanApplicationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loan, setLoan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form states (Edit modal)
  const [formOpen, setFormOpen] = useState(false);
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

  // Delete confirmation state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  // Toast notification state
  const [toast, setToast] = useState({ message: '', type: '' });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast({ message: '', type: '' });
    }, 4000);
  };

  const fetchLoan = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get(`/loans/${id}`);
      if (res.data?.status === 'success') {
        setLoan(res.data.data);
      } else {
        setError('Loan record could not be loaded.');
      }
    } catch (err) {
      console.error('Failed to fetch loan detail:', err);
      if (err.response?.status === 404) {
        setError('The requested loan account could not be found.');
      } else if (err.response?.status === 403) {
        setError('Access denied: You do not have permission to view this loan.');
      } else {
        setError('Failed to load loan details from server.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoan();
  }, [id]);

  const handleOpenEdit = () => {
    if (!loan) return;
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

      const res = await api.put(`/loans/${id}`, payload);
      if (res.data?.status === 'success') {
        showToast('Loan account specifications updated successfully!', 'success');
        setFormOpen(false);
        fetchLoan(); // Refresh detail view
      } else {
        showToast(res.data?.message || 'Operation failed', 'error');
      }
    } catch (err) {
      console.error('Update loan error:', err);
      showToast(err.response?.data?.message || 'Server error saving loan account details', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      const res = await api.delete(`/loans/${id}`);
      if (res.data?.status === 'success') {
        // Redirection must wait brief moment to show delete success toast
        showToast('Loan record deleted successfully!', 'success');
        setDeleteConfirmOpen(false);
        setTimeout(() => {
          navigate('/client/loans');
        }, 1500);
      } else {
        showToast(res.data?.message || 'Deletion failed', 'error');
      }
    } catch (err) {
      console.error('Delete loan error:', err);
      showToast(err.response?.data?.message || 'Server error deleting loan record', 'error');
    }
  };

  if (loading && !loan) {
    return (
      <ClientLayout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center">
          <div className="w-12 h-12 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-body-md text-text-muted mt-4 font-semibold">Loading loan details...</p>
        </div>
      </ClientLayout>
    );
  }

  if (error && !loan) {
    return (
      <ClientLayout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center max-w-xl mx-auto text-center space-y-4">
          <div className="w-16 h-16 bg-error/10 border border-error/25 text-error rounded-full flex items-center justify-center shadow-sm">
            <span className="material-symbols-outlined text-3xl">error</span>
          </div>
          <h2 className="text-headline-md font-bold text-accent">Error Loading Loan</h2>
          <p className="text-body-md text-text-muted">{error}</p>
          <Link to="/client/loans">
            <button className="btn-primary mt-2">Back to Loans</button>
          </Link>
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

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-label-lg text-text-muted mb-6">
        <Link to="/client/loans" className="hover:text-secondary transition-colors">Loans</Link>
        <span className="material-symbols-outlined text-sm">chevron_right</span>
        <span className="text-accent font-bold">{loan.loanNumber} — {loan.loanType}</span>
      </div>

      <div className="grid grid-cols-12 gap-gutter">
        {/* Main Details */}
        <div className="col-span-12 lg:col-span-8 space-y-gutter">

          {/* Loan Header Card */}
          <div className="card p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-headline-lg font-bold text-accent">{loan.loanType}</h1>
                  <span className={STATUS_STYLES[loan.status] || 'status-badge status-neutral'}>
                    {loan.status}
                  </span>
                </div>
                <p className="text-text-muted text-body-md">
                  Loan ID: <span className="font-mono font-bold text-accent">{loan.loanNumber}</span>
                </p>
                {loan.lenderName && (
                  <p className="text-text-muted text-body-md mt-1">
                    Lender: <span className="font-semibold text-text">{loan.lenderName}</span>
                  </p>
                )}
              </div>
              <div className="flex gap-3 shrink-0">
                <button
                  onClick={handleOpenEdit}
                  className="btn-primary flex items-center gap-2"
                >
                  <span className="material-symbols-outlined">edit</span>
                  Edit specs
                </button>
                <button
                  onClick={() => setDeleteConfirmOpen(true)}
                  className="bg-error/10 hover:bg-error/20 border border-error/30 text-error font-bold px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all"
                >
                  <span className="material-symbols-outlined">delete</span>
                  Delete loan
                </button>
              </div>
            </div>
          </div>

          {/* Financial Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-gutter">
            {[
              { label: 'Principal Amount', value: formatCurrency(loan.principalAmount) },
              { label: 'Outstanding Balance', value: formatCurrency(loan.outstandingBalance) },
              { label: 'Monthly EMI', value: formatCurrency(loan.monthlyEMI) },
              { label: 'Interest Rate', value: loan.interestRate != null ? `${loan.interestRate}% p.a.` : 'N/A' },
              { label: 'Tenure', value: loan.tenureMonths != null ? `${loan.tenureMonths} months` : 'N/A' },
              { label: 'Start Date', value: formatDate(loan.startDate) },
              { label: 'End Date', value: formatDate(loan.endDate) },
            ].map((item, i) => (
              <div key={i} className="card p-6">
                <p className="text-text-muted text-label-sm uppercase tracking-wider">{item.label}</p>
                <p className="text-headline-md font-bold text-accent mt-2">{item.value}</p>
              </div>
            ))}
          </div>

          {/* Notes */}
          {loan.notes && (
            <div className="card p-6">
              <h3 className="text-headline-md font-bold text-accent mb-3">Notes</h3>
              <p className="text-body-md text-text-muted">{loan.notes}</p>
            </div>
          )}

          {/* Payment Schedule (Empty State) */}
          <div className="card overflow-hidden">
            <div className="px-8 py-5 border-b border-border">
              <h3 className="text-headline-md font-bold text-accent">Payment Schedule</h3>
            </div>
            <div className="p-8 text-center flex flex-col items-center justify-center space-y-4">
              <div className="w-12 h-12 bg-surface-hover rounded-xl flex items-center justify-center text-text-muted border border-border">
                <span className="material-symbols-outlined">schedule</span>
              </div>
              <div>
                <p className="text-label-lg font-bold text-accent">No Data Available Yet</p>
                <p className="text-body-sm text-text-muted mt-1">
                  Payment logs are currently not active for this account.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="col-span-12 lg:col-span-4 space-y-gutter">
          {/* Loan Officer (Empty State) */}
          <div className="card p-6">
            <h3 className="text-headline-md font-bold text-accent mb-4">Loan Officer</h3>
            <div className="p-6 text-center flex flex-col items-center justify-center border border-dashed border-border rounded-xl">
              <span className="material-symbols-outlined text-text-muted text-3xl mb-2">person_off</span>
              <p className="text-label-md font-bold text-accent">No Data Available Yet</p>
              <p className="text-xs text-text-muted mt-1">No loan officer assigned to this account.</p>
            </div>
          </div>

          {/* Loan Documents (Empty State) */}
          <div className="card p-6">
            <h3 className="text-headline-md font-bold text-accent mb-4">Loan Documents</h3>
            <div className="p-6 text-center flex flex-col items-center justify-center border border-dashed border-border rounded-xl">
              <span className="material-symbols-outlined text-text-muted text-3xl mb-2">folder_off</span>
              <p className="text-label-md font-bold text-accent">No Data Available Yet</p>
              <p className="text-xs text-text-muted mt-1">No documents uploaded for this loan account.</p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="card p-6">
            <h3 className="text-headline-md font-bold text-accent mb-4">Quick Info</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-body-md text-text-muted">Loan Number</span>
                <span className="font-mono font-bold text-accent text-label-lg">{loan.loanNumber}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-body-md text-text-muted">Status</span>
                <span className={STATUS_STYLES[loan.status] || 'status-badge status-neutral'}>{loan.status}</span>
              </div>
              <div className="flex justify-between items-center py-2 flex-wrap gap-1">
                <span className="text-body-md text-text-muted">Created</span>
                <span className="text-body-md text-text">{formatDate(loan.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Form Modal */}
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
              <h3 className="text-headline-md font-bold text-accent mt-1">Edit Loan Specifications</h3>
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
                {submitting ? 'Processing...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmOpen && (
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
                onClick={() => setDeleteConfirmOpen(false)}
                className="btn-ghost flex-1 py-3"
              >
                Cancel
              </button>
              <button 
                onClick={handleDelete}
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
