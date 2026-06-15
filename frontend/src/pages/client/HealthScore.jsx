import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import ClientLayout from '../../layouts/ClientLayout';
import { getHealthMetrics } from '../../utils/healthScoreCalculator';
import { motion } from 'framer-motion';

export default function FinancialHealthScore() {
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
          console.error('Failed to fetch investments summary in health score:', sumErr);
        }
      }
    } catch (err) {
      console.error('Failed to fetch profile in health score:', err);
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
          <p className="text-body-md text-text-muted mt-4 font-semibold">Loading health score overview...</p>
        </div>
      </ClientLayout>
    );
  }

  if (error) {
    return (
      <ClientLayout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
          <span className="material-symbols-outlined text-error text-5xl mb-4">error</span>
          <h3 className="text-headline-md font-bold text-accent">Error Loading Health Score</h3>
          <p className="text-body-md text-text-muted mt-2 max-w-md">{error}</p>
          <button 
            onClick={fetchData} 
            className="btn-primary mt-6"
          >
            Retry
          </button>
        </div>
      </ClientLayout>
    );
  }

  // Fallback if no profile exists
  if (!profile) {
    return (
      <ClientLayout>
        <div className="max-w-xl mx-auto text-center py-16 space-y-6">
          <div className="w-20 h-20 bg-error/10 border border-error/25 text-error rounded-full flex items-center justify-center mx-auto shadow-sm">
            <span className="material-symbols-outlined text-4xl">warning</span>
          </div>
          <h1 className="text-headline-lg font-bold text-accent">Profile Not Completed</h1>
          <p className="text-body-lg text-text-muted max-w-md mx-auto">
            You must complete your Financial Profile setup wizard before we can analyze your standing and generate a health score assessment.
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

  // Fetch metrics from shared utility
  const metrics = getHealthMetrics(profile, summary);

  const ratioRows = [
    { 
      name: 'Emergency Fund Coverage', 
      actual: `${metrics.monthsCovered.toFixed(1)} Months`, 
      target: '6.0+ Months', 
      standing: metrics.monthsCovered >= 6 ? 'Optimal' : metrics.monthsCovered >= 3 ? 'Healthy' : 'Needs Attention', 
      class: metrics.monthsCovered >= 3 ? 'text-success' : 'text-error' 
    },
    { 
      name: 'Debt-to-Income (DTI)', 
      actual: `${metrics.dti.toFixed(1)}%`, 
      target: '< 35.0%', 
      standing: metrics.dti < 35 ? 'Healthy' : 'High Debt', 
      class: metrics.dti < 35 ? 'text-success' : 'text-error' 
    },
    { 
      name: 'Annual Net Savings Rate', 
      actual: `${metrics.savingsRate.toFixed(1)}%`, 
      target: '> 20.0%', 
      standing: metrics.savingsRate >= 20 ? 'On Target' : metrics.savingsRate >= 10 ? 'Moderate' : 'Low Savings', 
      class: metrics.savingsRate >= 10 ? 'text-success' : 'text-error' 
    },
    { 
      name: 'Credit Score', 
      actual: `${metrics.creditScore} Points`, 
      target: '750+ Points', 
      standing: metrics.creditScore >= 750 ? 'Excellent' : metrics.creditScore >= 700 ? 'Good' : 'Needs Work', 
      class: metrics.creditScore >= 700 ? 'text-success' : 'text-error' 
    },
    { 
      name: 'Investment Score', 
      actual: `${metrics.investmentScore}/100`, 
      target: '80+/100', 
      standing: metrics.investmentScore >= 80 ? 'Strong' : metrics.investmentScore >= 50 ? 'Moderate' : 'Low', 
      class: metrics.investmentScore >= 50 ? 'text-success' : 'text-error' 
    },
    { 
      name: 'Portfolio Diversification Boost', 
      actual: `+${metrics.diversificationBoost} Points`, 
      target: '+15 Points Max', 
      standing: summary?.diversificationScore || 'No Investments Yet', 
      class: metrics.diversificationBoost >= 10 ? 'text-success' : metrics.diversificationBoost > 0 ? 'text-secondary' : 'text-error' 
    },
  ];

  return (
    <ClientLayout>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-headline-lg font-bold text-accent">Financial Health Score</h1>
          <p className="text-body-md text-text-muted mt-1">Real-time assessment of your financial resilience and wealth alignment.</p>
        </div>
        <div className="flex gap-3">
          <button 
            className="btn-primary flex items-center gap-2" 
            onClick={fetchData}
          >
            <span className="material-symbols-outlined">restart_alt</span>
            Refresh Data
          </button>
        </div>
      </div>

      {/* Main Score Bento Grid */}
      <div className="grid grid-cols-12 gap-gutter">
        {/* Full-Width Current Rating Banner */}
        <div className="col-span-12 card p-8 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
          <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-accent/5 rounded-full blur-3xl"></div>
          <div className="relative z-10 flex-1 text-center md:text-left">
            <span className="text-secondary font-bold text-label-lg tracking-wider uppercase">Current Rating</span>
            <h2 className="text-headline-lg font-bold text-accent mt-2">{metrics.overallStanding}</h2>
            <p className="text-body-md text-text-muted mt-3 max-w-2xl">
              Your overall score is dynamically calculated from your active MongoDB profile parameters. Your savings rate is{' '}
              <strong>{metrics.savingsRate.toFixed(1)}%</strong>, with emergency reserves covering{' '}
              <strong>{metrics.monthsCovered.toFixed(1)} months</strong> of expenses.
            </p>
            <div className="mt-6 flex flex-wrap gap-3 justify-center md:justify-start">
              <span className={`status-badge ${metrics.score >= 70 ? 'status-success' : 'status-warning'}`}>{metrics.overallRisk}</span>
              <span className="status-badge bg-secondary/15 text-secondary font-bold">Premium Tier</span>
            </div>
          </div>

          {/* Interactive Score Ring */}
          <div className="relative w-48 h-48 flex items-center justify-center shrink-0">
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" fill="none" r="15.915" stroke="#e6e8ec" strokeWidth="3" />
              <motion.circle 
                cx="18" 
                cy="18" 
                fill="none" 
                r="15.915" 
                stroke="#785a02" 
                strokeWidth="3.2" 
                initial={{ strokeDasharray: "0 100" }}
                animate={{ strokeDasharray: `${metrics.score} ${100 - metrics.score}` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
            </svg>
            <div className="absolute inset-4 bg-surface rounded-full flex flex-col items-center justify-center shadow-md border border-border/20">
              <span className="text-5xl font-black text-accent leading-none">{metrics.score}</span>
              <span className="text-label-xs text-text-muted font-bold uppercase tracking-widest mt-1">out of 100</span>
            </div>
          </div>
        </div>
      </div>
 
      {/* Pillar Breakdown Cards */}
      <div>
        <h3 className="text-headline-md font-bold text-accent mb-6">Health Pillar Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-gutter">
          {[
            { name: 'Liquidity', score: metrics.liquidityPillarScore, status: metrics.liquidityPillarStatus, desc: 'Cash buffers and availability', icon: 'account_balance_wallet', statusClass: metrics.liquidityPillarScore >= 70 ? 'status-success' : 'status-warning' },
            { name: 'Debt Management', score: metrics.debtPillarScore, status: metrics.debtPillarStatus, desc: 'Debt utilization and coverage', icon: 'credit_score', statusClass: metrics.debtPillarScore >= 70 ? 'status-success' : 'status-warning' },
            { name: 'Savings & Retirement', score: metrics.savingsPillarScore, status: metrics.savingsPillarStatus, desc: 'Yearly accumulation rate', icon: 'savings', statusClass: metrics.savingsPillarScore >= 70 ? 'status-success' : 'status-warning' },
            { name: 'Investment Growth', score: metrics.investmentPillarScore, status: metrics.investmentPillarStatus, desc: 'Portfolio returns and assets', icon: 'trending_up', statusClass: metrics.investmentPillarScore >= 70 ? 'status-success' : 'status-warning' },
          ].map((pillar) => (
            <div key={pillar.name} className="card p-6 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-surface-hover rounded-xl">
                    <span className="material-symbols-outlined text-accent">{pillar.icon}</span>
                  </div>
                  <span className={`status-badge ${pillar.statusClass}`}>{pillar.status}</span>
                </div>
                <h4 className="text-label-lg font-bold text-accent">{pillar.name}</h4>
                <p className="text-xs text-text-muted mt-1 mb-6">{pillar.desc}</p>
              </div>
              
              <div>
                <div className="flex justify-between items-end mb-2">
                  <span className="text-body-sm text-text-muted">Pillar Score</span>
                  <span className="text-label-lg font-bold text-accent">{pillar.score}/100</span>
                </div>
                <div className="h-2 bg-surface-hover-high rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-accent rounded-full" 
                    initial={{ width: 0 }}
                    animate={{ width: `${pillar.score}%` }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* KPI Targets Section */}
      <div className="grid grid-cols-12 gap-gutter">
        {/* Core Ratios Table */}
        <div className="col-span-12 card p-8">
          <h3 className="text-headline-md font-bold text-accent mb-6">Financial Ratios & Ranks</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-surface text-label-lg text-text-muted uppercase tracking-wider">
                  <th className="px-6 py-4 text-left">Metric</th>
                  <th className="px-6 py-4 text-right">Actual Value</th>
                  <th className="px-6 py-4 text-right">Target Range</th>
                  <th className="px-6 py-4 text-left">Standing</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/40">
                {ratioRows.map((row, i) => (
                  <tr key={i} className="hover:bg-surface/30 transition-colors">
                    <td className="px-6 py-4 text-body-md font-medium text-accent">{row.name}</td>
                    <td className="px-6 py-4 text-body-md text-right font-bold text-accent">{row.actual}</td>
                    <td className="px-6 py-4 text-body-md text-right text-text-muted">{row.target}</td>
                    <td className="px-6 py-4 text-body-md"><span className={`font-bold ${row.class}`}>{row.standing}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </ClientLayout>
  );
}
