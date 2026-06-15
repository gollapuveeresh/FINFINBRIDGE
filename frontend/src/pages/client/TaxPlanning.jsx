import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import ClientLayout from '../../layouts/ClientLayout';
import { calculateTax } from '../../utils/taxCalculator';
import { formatCurrency } from '../../utils/currencyFormatter';

export default function TaxPlanning() {
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
      console.error('Failed to fetch profile in tax planning:', err);
      if (err.response?.status === 404) {
        setProfile(null);
      } else {
        setError(err.response?.data?.message || 'Failed to load tax profile data.');
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
          <p className="text-body-md text-text-muted mt-4 font-semibold">Loading tax estimator...</p>
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
          <h2 className="text-headline-md font-bold text-accent">Error Loading Tax Estimator</h2>
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
            You must complete your Financial Profile setup wizard before we can display your tax calculations.
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
            <span className="material-symbols-outlined text-4xl text-text-muted">calculate</span>
          </div>
          <h1 className="text-headline-lg font-bold text-accent">No Tax Data Available Yet</h1>
          <p className="text-body-lg text-text-muted max-w-md mx-auto">
            Please enter your income details in your Financial Profile to view tax planning and slab calculations.
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
  const annualExpenses = profile.annualExpenses || 0; // Business Expenses

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
  console.log('--- TAX PLANNING DEBUG LOGS ---');
  console.log('Profile Data:', profile);
  console.log('Calculated Tax Data:', calculatedTaxData);

  return (
    <ClientLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-headline-lg font-bold text-accent">Tax Planning</h1>
          <p className="text-body-md text-text-muted mt-1">Optimize your tax strategy with calculations derived from your profile.</p>
        </div>
        <div className="flex gap-3">
          <Link to="/client/tax-summary">
            <button className="btn-ghost flex items-center gap-2">
              <span className="material-symbols-outlined">receipt_long</span>
              View Tax Summary
            </button>
          </Link>
        </div>
      </div>

      {/* Tax Year Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter">
        {[
          { label: 'Gross Income', value: formatCurrency(grossIncome), icon: 'trending_up', isCalculated: true },
          { label: 'Business Expenses', value: formatCurrency(deductions), icon: 'volunteer_activism', isCalculated: true },
          { label: 'Taxable Income', value: formatCurrency(taxableIncome), icon: 'receipt_long', isCalculated: true },
          { label: 'Est. Tax Liability', value: formatCurrency(taxLiability), icon: 'account_balance', isCalculated: true },
        ].map((kpi, i) => (
          <div key={i} className="card p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-accent/10 rounded-lg">
                <span className="material-symbols-outlined text-accent">{kpi.icon}</span>
              </div>
            </div>
            <p className="text-text-muted text-label-lg">{kpi.label}</p>
            <p className={`text-headline-md font-bold mt-1 ${kpi.isCalculated ? 'text-accent' : 'text-text-muted text-body-md font-semibold'}`}>
              {kpi.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-gutter">
        {/* Dynamic New regime slabs */}
        <div className="col-span-12 lg:col-span-8 card p-8 space-y-6">
          <div className="flex justify-between items-center border-b border-border pb-4">
            <h3 className="text-headline-md font-bold text-accent">Tax Slab Breakdown</h3>
            <span className="status-badge status-success">New Regime Slabs</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-gutter">
            <div className="p-4 bg-surface-hover rounded-xl">
              <p className="text-label-sm text-text-muted uppercase tracking-wider">Effective Tax Rate</p>
              <p className="text-headline-md font-bold text-accent mt-1">{effectiveTaxRate}%</p>
            </div>
            <div className="p-4 bg-surface-hover rounded-xl">
              <p className="text-label-sm text-text-muted uppercase tracking-wider">Applicable Tax Slab</p>
              <p className="text-headline-md font-bold text-secondary mt-1">{currentSlabLabel}</p>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-label-lg font-bold text-accent">Slab Margins Breakdown (FY 2026-27)</h4>
            <div className="overflow-hidden border border-border rounded-xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface text-label-sm text-text-muted uppercase tracking-wider">
                    <th className="px-4 py-3">Income Slab</th>
                    <th className="px-4 py-3 text-right">Tax Rate</th>
                    <th className="px-4 py-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/30 text-body-md">
                  {[
                    { range: 'Up to ₹3,00,000', rate: 'Nil (0%)', match: taxableIncome <= 300000 },
                    { range: '₹3,00,001 to ₹7,00,000', rate: '5%', match: taxableIncome > 300000 && taxableIncome <= 700000 },
                    { range: '₹7,00,001 to ₹10,00,000', rate: '10%', match: taxableIncome > 700000 && taxableIncome <= 1000000 },
                    { range: '₹10,00,001 to ₹12,00,000', rate: '15%', match: taxableIncome > 1000000 && taxableIncome <= 1200000 },
                    { range: '₹12,00,001 to ₹15,00,000', rate: '20%', match: taxableIncome > 1200000 && taxableIncome <= 1500000 },
                    { range: 'Above ₹15,00,000', rate: '30%', match: taxableIncome > 1500000 }
                  ].map((slab, index) => (
                    <tr 
                      key={index} 
                      className={`transition-colors ${
                        slab.match 
                          ? 'bg-accent/20/20 text-accent font-bold' 
                          : 'text-text-muted hover:bg-surface/30'
                      }`}
                    >
                      <td className="px-4 py-3.5">{slab.range}</td>
                      <td className="px-4 py-3.5 text-right font-semibold">{slab.rate}</td>
                      <td className="px-4 py-3.5 text-center">
                        {slab.match ? (
                          <span className="status-badge status-info text-xs">Active Slab</span>
                        ) : (
                          <span className="text-text-faint-variant text-xs">•</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-[10px] text-text-muted/70 italic mt-2">
              * Calculations include Section 87A rebate for taxable income up to ₹7 Lakhs and 4% Health & Education Cess.
            </p>
          </div>
        </div>

        {/* Deductions Suggestions */}
        <div className="col-span-12 lg:col-span-4 space-y-gutter">
          <div className="card p-8 space-y-6 h-full">
            <div className="border-b border-border pb-4">
              <h3 className="text-headline-md font-bold text-accent">Tax Saving Advisory</h3>
              <p className="text-body-sm text-text-muted mt-1">Key opportunities to plan deductions under the New Regime.</p>
            </div>
            <div className="space-y-4">
              {[
                { title: 'Standard Deduction Benefit', desc: 'A flat deduction of ₹75,000 is available for salaried individuals under the new tax regime.', active: true },
                { title: 'National Pension Scheme', desc: 'Contributions under Section 80CCD(1B) up to ₹50,000 offer additional pension incentives.', active: taxableIncome > 700000 },
                { title: 'Business Expense Deduction', desc: 'Ensure home office expenses or travel allowances are structured appropriately to offset business revenue.', active: deductions > 0 }
              ].map((tip, i) => (
                <div key={i} className="p-4 bg-surface-hover rounded-xl border border-border/20">
                  <h4 className="text-body-md font-bold text-accent flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary text-base">tips_and_updates</span>
                    {tip.title}
                  </h4>
                  <p className="text-body-sm text-text-muted mt-2">{tip.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Filing Timeline */}
      <div className="card p-8">
        <h2 className="text-headline-md font-bold text-accent mb-6">Tax Filing Timeline</h2>
        <div className="p-12 text-center flex flex-col items-center justify-center max-w-xl mx-auto space-y-4">
          <div className="w-16 h-16 bg-surface-hover rounded-2xl flex items-center justify-center border border-border text-text-muted shadow-sm">
            <span className="material-symbols-outlined text-3xl">calendar_today</span>
          </div>
          <div>
            <h3 className="text-headline-md font-bold text-accent">Timeline Integration Pending</h3>
            <p className="text-body-md text-text-muted mt-2">
              Income tax filing deadlines and schedule integration will be linked to your financial year calendar.
            </p>
          </div>
        </div>
      </div>
    </ClientLayout>
  );
}
