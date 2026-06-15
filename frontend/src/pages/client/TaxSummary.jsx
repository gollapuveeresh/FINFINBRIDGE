import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import ClientLayout from '../../layouts/ClientLayout';
import { calculateTax } from '../../utils/taxCalculator';
import { formatCurrency } from '../../utils/currencyFormatter';

export default function TaxSummary() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/financial-profile');
      if (res.data && res.data.status === 'success') {
        setProfile(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch profile in tax summary:', err);
      if (err.response?.status === 404) {
        setProfile(null);
      } else {
        setError(err.response?.data?.message || 'Failed to load tax summary.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <ClientLayout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center">
          <div className="w-12 h-12 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-body-md text-text-muted mt-4 font-semibold">Loading tax summary...</p>
        </div>
      </ClientLayout>
    );
  }

  if (error) {
    return (
      <ClientLayout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center max-w-xl mx-auto text-center space-y-4">
          <div className="w-16 h-16 bg-error/10 border border-error/25 text-error rounded-full flex items-center justify-center shadow-sm">
            <span className="material-symbols-outlined text-3xl">error</span>
          </div>
          <h2 className="text-headline-md font-bold text-accent">Error Loading Tax Summary</h2>
          <p className="text-body-md text-text-muted">{error}</p>
          <button onClick={fetchProfile} className="btn-primary mt-4">Retry</button>
        </div>
      </ClientLayout>
    );
  }

  // Profile Not Completed State
  if (!profile) {
    return (
      <ClientLayout>
        <div className="max-w-xl mx-auto text-center py-16 space-y-6">
          <div className="w-20 h-20 bg-error/10 border border-error/25 text-error rounded-full flex items-center justify-center mx-auto shadow-sm">
            <span className="material-symbols-outlined text-4xl">warning</span>
          </div>
          <h1 className="text-headline-lg font-bold text-accent">Profile Not Completed</h1>
          <p className="text-body-lg text-text-muted max-w-md mx-auto">
            You must complete your Financial Profile setup wizard before we can display your tax summary details.
          </p>
          <Link to="/client/financial-profile">
            <button className="btn-primary mt-4 py-3 px-8 text-label-lg font-bold">
              Set Up Financial Profile
            </button>
          </Link>
        </div>
      </ClientLayout>
    );
  }

  // Empty State Check: annualIncome, annualRevenue, and annualExpenses are ALL null or undefined
  const isEmpty = (profile.annualIncome === null || profile.annualIncome === undefined) &&
                  (profile.annualRevenue === null || profile.annualRevenue === undefined) &&
                  (profile.annualExpenses === null || profile.annualExpenses === undefined);

  if (isEmpty) {
    return (
      <ClientLayout>
        <div className="max-w-xl mx-auto text-center py-16 space-y-6">
          <div className="w-20 h-20 bg-surface-hover rounded-full flex items-center justify-center mx-auto shadow-sm border border-border">
            <span className="material-symbols-outlined text-4xl text-text-muted">receipt_long</span>
          </div>
          <h1 className="text-headline-lg font-bold text-accent">No Tax Summary Available</h1>
          <p className="text-body-lg text-text-muted max-w-md mx-auto">
            Please enter your income details in your Financial Profile to generate annual tax summary ledgers.
          </p>
          <Link to="/client/financial-profile">
            <button className="btn-primary mt-4 py-3 px-8 text-label-lg font-bold">
              Update Financial Profile
            </button>
          </Link>
        </div>
      </ClientLayout>
    );
  }

  // Calculations based on MongoDB profile
  const annualIncome = profile.annualIncome || 0;
  const annualRevenue = profile.annualRevenue || 0;
  const annualExpenses = profile.annualExpenses || 0;

  const grossIncome = annualIncome + annualRevenue;
  const deductions = annualExpenses;
  const taxableIncome = Math.max(0, grossIncome - deductions);
  const taxLiability = calculateTax(taxableIncome);
  const effectiveTaxRate = taxableIncome > 0 ? ((taxLiability / taxableIncome) * 100).toFixed(2) : '0.00';

  const getTaxSlab = (income) => {
    if (income <= 300000) return 'Nil (0%)';
    if (income <= 700000) return '5%';
    if (income <= 1000000) return '10%';
    if (income <= 1200000) return '15%';
    if (income <= 1500000) return '20%';
    return '30%';
  };
  const currentSlabLabel = getTaxSlab(taxableIncome);

  const calculatedTaxData = {
    grossIncome,
    deductions,
    taxableIncome,
    taxLiability,
    effectiveTaxRate,
    currentSlabLabel
  };

  // Debug logs
  console.log('--- TAX SUMMARY DEBUG LOGS ---');
  console.log('Profile Data:', profile);
  console.log('Calculated Tax Data:', calculatedTaxData);

  return (
    <ClientLayout>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-headline-lg font-bold text-accent">Annual Tax Summary</h1>
          <p className="text-body-md text-text-muted mt-1">Filing status ledger logs and deduction summaries based on your profile.</p>
        </div>
        <div className="flex gap-3">
          <Link to="/client/tax-planning">
            <button className="btn-ghost flex items-center gap-2">
              <span className="material-symbols-outlined">arrow_back</span>
              Back to Estimator
            </button>
          </Link>
        </div>
      </div>

      {/* Tax Position Ratios */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter">
        {[
          { label: 'Gross Annual Income', value: formatCurrency(grossIncome), desc: 'All personal & business inflows', icon: 'trending_up', color: 'bg-accent/10 text-accent', isCalculated: true },
          { label: 'Business Expenses', value: formatCurrency(deductions), desc: 'Expenses & deductions applied', icon: 'volunteer_activism', color: 'bg-success/15 text-success', isCalculated: true },
          { label: 'Net Taxable Income', value: formatCurrency(taxableIncome), desc: 'Income subject to slab rates', icon: 'receipt_long', color: 'bg-secondary/15 text-secondary', isCalculated: true },
          { label: 'Est. Total Liability', value: formatCurrency(taxLiability), desc: 'Active tax engine calculations', icon: 'account_balance', color: 'bg-error/10 text-error', isCalculated: true },
        ].map((kpi, i) => (
          <div key={i} className="card p-6 flex items-center gap-5">
            <div className={`p-3 rounded-xl ${kpi.color.split(' ')[0]}`}>
              <span className={`material-symbols-outlined ${kpi.color.split(' ')[1]}`}>{kpi.icon}</span>
            </div>
            <div>
              <p className="text-text-muted text-label-lg">{kpi.label}</p>
              <p className={`font-bold mt-1 ${kpi.isCalculated ? 'text-headline-md text-accent' : 'text-body-md text-text-muted'}`}>{kpi.value}</p>
              <p className="text-xs text-text-muted mt-1">{kpi.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quarterly Estimated Payments Schedule (Empty State) */}
      <div>
        <h3 className="text-headline-md font-bold text-accent mb-6">Quarterly Installment Schedule</h3>
        <div className="card p-12 text-center flex flex-col items-center justify-center max-w-xl mx-auto space-y-4">
          <div className="w-16 h-16 bg-surface-hover rounded-2xl flex items-center justify-center border border-border text-text-muted shadow-sm">
            <span className="material-symbols-outlined text-3xl">payments</span>
          </div>
          <div>
            <h3 className="text-headline-md font-bold text-accent">Schedule Integration Pending</h3>
            <p className="text-body-md text-text-muted mt-2">
              Quarterly estimated tax payments schedules are not active for this account.
            </p>
          </div>
        </div>
      </div>

      {/* Historical filing archives (Empty State) */}
      <div className="card overflow-hidden">
        <div className="px-8 py-5 border-b border-border flex justify-between items-center bg-surface-hover-lowest">
          <h2 className="text-headline-md font-bold text-accent">Historical Filing Archives</h2>
        </div>
        <div className="p-12 text-center flex flex-col items-center justify-center max-w-xl mx-auto space-y-4">
          <div className="w-16 h-16 bg-surface-hover rounded-2xl flex items-center justify-center border border-border text-text-muted shadow-sm">
            <span className="material-symbols-outlined text-3xl">folder_off</span>
          </div>
          <div>
            <h3 className="text-headline-md font-bold text-accent">No Archive Records</h3>
            <p className="text-body-md text-text-muted mt-2">
              Historical income tax filing forms and PDF records are not available.
            </p>
          </div>
        </div>
      </div>
    </ClientLayout>
  );
}
