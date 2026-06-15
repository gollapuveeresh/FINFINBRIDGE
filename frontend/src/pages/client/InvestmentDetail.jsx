import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import ClientLayout from '../../layouts/ClientLayout';
import { formatCurrency } from '../../utils/currencyFormatter';

export default function InvestmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [investment, setInvestment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchInvestment = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get(`/investments/${id}`);
      if (res.data && res.data.status === 'success') {
        setInvestment(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch investment details:', err);
      setError(err.response?.data?.message || 'Failed to load investment specifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvestment();
  }, [id]);

  if (loading) {
    return (
      <ClientLayout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center">
          <div className="w-12 h-12 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-body-md text-text-muted mt-4 font-semibold">Loading holding analytics...</p>
        </div>
      </ClientLayout>
    );
  }

  if (error || !investment) {
    return (
      <ClientLayout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center max-w-xl mx-auto text-center space-y-4">
          <div className="w-16 h-16 bg-error/10 border border-error/25 text-error rounded-full flex items-center justify-center shadow-sm">
            <span className="material-symbols-outlined text-3xl">error</span>
          </div>
          <h2 className="text-headline-md font-bold text-accent">Holding Not Found</h2>
          <p className="text-body-md text-text-muted">{error || 'This investment record does not exist or has been deleted.'}</p>
          <div className="flex gap-4 mt-4">
            <button onClick={fetchInvestment} className="btn-primary">Retry</button>
            <Link to="/client/investments"><button className="btn-ghost">Back to Portfolio</button></Link>
          </div>
        </div>
      </ClientLayout>
    );
  }

  // ROI & Performance Calculations
  const amountInvested = investment.amountInvested || 0;
  const currentValue = investment.currentValue || 0;
  const profitLoss = currentValue - amountInvested;
  
  // Safe ROI Division-by-Zero Check
  const roiPercentage = amountInvested > 0 ? (profitLoss / amountInvested) * 100 : 0;

  // Holding Period Calculation
  const purchaseDate = new Date(investment.purchaseDate);
  const diffTime = Math.max(0, new Date() - purchaseDate);
  const holdingPeriodDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  // Gain/Loss status determination
  let status = 'Break Even';
  let statusClass = 'bg-surface-hover text-text-muted border-border';
  if (profitLoss > 0) {
    status = 'Gain';
    statusClass = 'status-success';
  } else if (profitLoss < 0) {
    status = 'Loss';
    statusClass = 'status-warning';
  }

  return (
    <ClientLayout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Link to="/client/investments">
            <button className="p-2 hover:bg-surface-hover rounded-lg text-accent transition-colors flex items-center">
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
          </Link>
          <div>
            <h1 className="text-headline-lg font-bold text-accent">{investment.investmentType} Holding</h1>
            <p className="text-body-md text-text-muted mt-1">Detailed performance audit for individual registered assets.</p>
          </div>
        </div>
        <div>
          <Link to="/client/investments">
            <button className="btn-secondary flex items-center gap-2">
              <span className="material-symbols-outlined">payments</span>
              Back to Portfolio
            </button>
          </Link>
        </div>
      </div>

      {/* Main KPI Details Bento Grid */}
      <div className="grid grid-cols-12 gap-gutter">
        {/* Core Return Card */}
        <div className="col-span-12 lg:col-span-8 card p-8 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute -right-16 -top-16 w-64 h-64 bg-secondary/5 rounded-full blur-3xl"></div>
          
          <div>
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="text-label-lg text-text-muted uppercase tracking-wider block">Current Asset Value</span>
                <span className="text-display-lg font-black text-accent block mt-1">{formatCurrency(currentValue)}</span>
              </div>
              <span className={`status-badge font-bold py-1.5 px-4 text-sm border ${statusClass}`}>{status}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-6 border-t border-border">
              <div>
                <span className="text-label-sm font-bold text-text-muted uppercase tracking-wider block">Principal Amount Invested</span>
                <span className="text-headline-md font-bold text-accent block mt-1">{formatCurrency(amountInvested)}</span>
              </div>
              <div>
                <span className="text-label-sm font-bold text-text-muted uppercase tracking-wider block">Net Return (Profit / Loss)</span>
                <span className={`text-headline-md font-bold block mt-1 ${profitLoss >= 0 ? 'text-success' : 'text-error'}`}>
                  {profitLoss >= 0 ? '+' : ''}{formatCurrency(profitLoss)}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 pt-8 mt-8 border-t border-border bg-surface/30 p-6 rounded-xl border border-border/10">
            <div>
              <span className="text-xs text-text-muted uppercase tracking-wider block font-bold">Overall ROI %</span>
              <span className={`text-headline-lg font-black block mt-1 ${roiPercentage >= 0 ? 'text-success' : 'text-error'}`}>
                {roiPercentage >= 0 ? '+' : ''}{roiPercentage.toFixed(2)}%
              </span>
            </div>
            <div>
              <span className="text-xs text-text-muted uppercase tracking-wider block font-bold">Holding Period</span>
              <span className="text-headline-lg font-black text-accent block mt-1">
                {holdingPeriodDays} <span className="text-label-lg text-text-muted font-bold">Days</span>
              </span>
            </div>
          </div>
        </div>

        {/* Specifications Panel */}
        <div className="col-span-12 lg:col-span-4 card p-8 space-y-6">
          <h3 className="text-headline-md font-bold text-accent border-b border-border pb-4">Asset Specifications</h3>
          
          <div className="space-y-4">
            <div className="flex justify-between border-b border-border/15 pb-2">
              <span className="text-body-md text-text-muted">Asset Class</span>
              <span className="text-body-md font-bold text-accent">{investment.investmentType}</span>
            </div>
            <div className="flex justify-between border-b border-border/15 pb-2">
              <span className="text-body-md text-text-muted">Risk Rating</span>
              <span className={`status-badge font-bold py-0.5 px-3 text-xs ${
                investment.riskLevel === 'Low' ? 'status-success' :
                investment.riskLevel === 'Medium' ? 'bg-secondary/20 text-secondary' : 'status-warning'}`}>
                {investment.riskLevel}
              </span>
            </div>
            <div className="flex justify-between border-b border-border/15 pb-2">
              <span className="text-body-md text-text-muted">Purchase Date</span>
              <span className="text-body-md font-medium text-accent">
                {new Date(investment.purchaseDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>
            <div className="flex justify-between border-b border-border/15 pb-2">
              <span className="text-body-md text-text-muted">Holding Status</span>
              <span className="status-badge status-success">Active Holding</span>
            </div>
          </div>

          <div className="pt-4 space-y-2">
            <span className="text-label-sm font-bold text-accent block uppercase tracking-wider">Holding Notes</span>
            <div className="p-4 bg-surface-hover rounded-xl border border-border/20 text-body-md text-accent italic font-medium">
              {investment.notes || 'No description or remarks added to this holding.'}
            </div>
          </div>
        </div>
      </div>
    </ClientLayout>
  );
}
