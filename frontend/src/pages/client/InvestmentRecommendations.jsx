import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import ClientLayout from '../../layouts/ClientLayout';
import { formatCurrency } from '../../utils/currencyFormatter';

export default function InvestmentRecommendations() {
  const [profile, setProfile] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const profileRes = await api.get('/financial-profile');
      if (profileRes.data && profileRes.data.status === 'success') {
        setProfile(profileRes.data.data);
        
        try {
          const summaryRes = await api.get('/investments/summary');
          if (summaryRes.data && summaryRes.data.status === 'success') {
            setSummary(summaryRes.data.data);
          }
        } catch (sumErr) {
          console.error('Failed to fetch investments summary in recommendations:', sumErr);
        }
      }
    } catch (err) {
      console.error('Failed to fetch profile in investment recommendations:', err);
      if (err.response?.status === 404) {
        setProfile(null);
      } else {
        setError(err.response?.data?.message || 'Failed to load profile.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <ClientLayout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center">
          <div className="w-12 h-12 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-body-md text-text-muted mt-4 font-semibold">Loading recommendations...</p>
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
          <h2 className="text-headline-md font-bold text-accent">Error Loading Profile</h2>
          <p className="text-body-md text-text-muted">{error}</p>
          <button onClick={fetchData} className="btn-primary mt-4">Retry</button>
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
            You must complete your Financial Profile setup wizard before we can display your investment recommendations.
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

  const currentPortfolioValue = summary ? summary.totalPortfolioValue : (profile.currentInvestments || 0);

  // Empty State: currentPortfolioValue is missing or 0
  if (currentPortfolioValue === 0) {
    return (
      <ClientLayout>
        <div className="max-w-xl mx-auto text-center py-16 space-y-6">
          <div className="w-20 h-20 bg-accent/10 border border-primary/25 text-accent rounded-full flex items-center justify-center mx-auto shadow-sm">
            <span className="material-symbols-outlined text-4xl">folder_open</span>
          </div>
          <h1 className="text-headline-lg font-bold text-accent">No Investment Data Available Yet</h1>
          <p className="text-body-lg text-text-muted max-w-md mx-auto">
            You currently do not have any active investment balances tracked in your financial profile.
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

  const riskTolerance = profile.riskTolerance || 'Medium';
  const investmentGoals = profile.investmentGoals || [];

  // Map risk level to recommendation strategy
  const getRecommendationStrategy = (risk) => {
    const r = (risk || 'Medium').toLowerCase();
    if (r === 'low') {
      return {
        strategy: 'Conservative Portfolio Strategy',
        desc: 'Focuses on capital preservation, steady income stream generation, and minimizing downside risk by emphasizing high-quality fixed income assets and liquidity.'
      };
    } else if (r === 'high') {
      return {
        strategy: 'Aggressive Growth Strategy',
        desc: 'Focuses on maximum capital appreciation over a long term horizon. Emphasizes growth equities, emerging markets, and alternative assets, accepting higher short-term volatility.'
      };
    } else {
      return {
        strategy: 'Balanced Growth Strategy',
        desc: 'Focuses on a blend of capital appreciation and preservation. Establishes a standard balanced allocation between core equities and stable fixed income assets.'
      };
    }
  };

  const recommendation = getRecommendationStrategy(riskTolerance);

  return (
    <ClientLayout>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-headline-lg font-bold text-accent">Portfolio Advisory & Rebalancing</h1>
          <p className="text-body-md text-text-muted mt-1">Strategic target allocations and rebalancing parameters derived from your profile.</p>
        </div>
        <div className="flex gap-3">
          <Link to="/client/investments">
            <button className="btn-ghost flex items-center gap-2">
              <span className="material-symbols-outlined">arrow_back</span>
              View Portfolio
            </button>
          </Link>
        </div>
      </div>

      {/* Main Stats KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
        {[
          { label: 'Current Investments', value: formatCurrency(currentPortfolioValue), icon: 'pie_chart', color: 'bg-accent/10 text-accent' },
          { label: 'Risk Tolerance', value: riskTolerance, icon: 'tune', color: 'bg-success/15 text-success' },
          { label: 'Investment Goals Count', value: `${investmentGoals.length} Saved`, icon: 'flag', color: 'bg-secondary/15 text-secondary' },
        ].map((kpi, i) => (
          <div key={i} className="card p-6 flex items-center gap-5">
            <div className={`p-3 rounded-xl ${kpi.color.split(' ')[0]}`}>
              <span className={`material-symbols-outlined ${kpi.color.split(' ')[1]}`}>{kpi.icon}</span>
            </div>
            <div>
              <p className="text-text-muted text-label-lg">{kpi.label}</p>
              <p className="text-headline-md font-bold text-accent mt-1">{kpi.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Strategy Recommendation section */}
      <div className="card p-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-secondary/15 text-secondary rounded-lg">
            <span className="material-symbols-outlined">lightbulb</span>
          </div>
          <h2 className="text-headline-md font-bold text-accent">Advisor Recommendation Strategy</h2>
        </div>
        <div className="p-6 bg-surface rounded-xl border border-border">
          <h3 className="text-headline-sm font-bold text-secondary mb-2">{recommendation.strategy}</h3>
          <p className="text-body-md text-text-muted leading-relaxed">
            {recommendation.desc}
          </p>
        </div>
      </div>

      {/* Goals & Projections */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        {/* Investment Goals */}
        <div className="col-span-12 lg:col-span-8 card p-8">
          <h3 className="text-headline-md font-bold text-accent mb-6">Investment Goals Saved</h3>
          {investmentGoals.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {investmentGoals.map((g, idx) => (
                <span key={idx} className="px-4 py-2 bg-accent/10 text-accent rounded-xl text-body-md font-bold border border-primary/20">{g}</span>
              ))}
            </div>
          ) : (
            <p className="text-body-md text-text-muted">No investment goals specified in your profile.</p>
          )}
        </div>

        {/* Projection (Empty State) */}
        <div className="col-span-12 lg:col-span-4 card p-8 flex flex-col justify-center text-center">
          <div className="w-16 h-16 bg-surface-hover rounded-2xl flex items-center justify-center border border-border text-text-muted shadow-sm mx-auto mb-4">
            <span className="material-symbols-outlined text-3xl">insights</span>
          </div>
          <div>
            <h3 className="text-headline-sm font-bold text-accent">No Performance Projection</h3>
            <p className="text-body-sm text-text-muted mt-2">
              Performance modeling is currently not active for this account.
            </p>
          </div>
        </div>
      </div>

      {/* Target Allocation & Rebalancing Orders (Empty State) */}
      <div className="card overflow-hidden">
        <div className="px-8 py-5 border-b border-border">
          <h2 className="text-headline-md font-bold text-accent">Required Action Trades & Allocations</h2>
          <p className="text-body-sm text-text-muted mt-0.5">Execution checklist to realign assets to target risk weights.</p>
        </div>
        <div className="p-12 text-center flex flex-col items-center justify-center max-w-xl mx-auto space-y-4">
          <div className="w-16 h-16 bg-surface-hover rounded-2xl flex items-center justify-center border border-border text-text-muted shadow-sm">
            <span className="material-symbols-outlined text-3xl">info_outline</span>
          </div>
          <div>
            <h3 className="text-headline-md font-bold text-accent">No Data Available Yet</h3>
            <p className="text-body-md text-text-muted mt-2">
              Asset allocation target weights, trade recommendations, and rebalancing suggestions are not available.
            </p>
          </div>
        </div>
      </div>
    </ClientLayout>
  );
}
