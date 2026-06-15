import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import ClientLayout from '../../layouts/ClientLayout';
import { formatCurrency } from '../../utils/currencyFormatter';
import { motion } from 'framer-motion';

export default function InvestmentAdvisory() {
  const [profile, setProfile] = useState(null);
  const [investments, setInvestments] = useState([]);
  const [summary, setSummary] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  // Selected items for CRUD
  const [selectedInvestment, setSelectedInvestment] = useState(null);
  const [formData, setFormData] = useState({
    investmentType: 'Mutual Fund',
    amountInvested: '',
    currentValue: '',
    purchaseDate: '',
    riskLevel: 'Medium',
    notes: ''
  });
  const [formError, setFormError] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  const investmentTypes = [
    'Mutual Fund',
    'Stock',
    'Gold',
    'Fixed Deposit',
    'Real Estate',
    'ETF',
    'Bond',
    'Crypto',
    'PPF',
    'EPF',
    'NPS',
    'SIP',
    'ULIP',
    'Others'
  ];

  const riskLevels = ['Low', 'Medium', 'High'];

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [profileRes, invRes, summaryRes, historyRes] = await Promise.all([
        api.get('/financial-profile'),
        api.get('/investments'),
        api.get('/investments/summary'),
        api.get('/investments/history')
      ]);

      if (profileRes.data && profileRes.data.status === 'success') {
        setProfile(profileRes.data.data);
      }
      if (invRes.data && invRes.data.status === 'success') {
        setInvestments(invRes.data.data);
      }
      if (summaryRes.data && summaryRes.data.status === 'success') {
        setSummary(summaryRes.data.data);
      }
      if (historyRes.data && historyRes.data.status === 'success') {
        setHistory(historyRes.data.data);
      }
    } catch (err) {
      console.error('Failed to load investments module data:', err);
      if (err.response?.status === 404 && err.config.url.includes('financial-profile')) {
        setProfile(null);
      } else {
        setError(err.response?.data?.message || 'Failed to load investments and portfolio data.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAddModal = () => {
    setFormData({
      investmentType: 'Mutual Fund',
      amountInvested: '',
      currentValue: '',
      purchaseDate: new Date().toISOString().split('T')[0],
      riskLevel: 'Medium',
      notes: ''
    });
    setFormError('');
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (inv) => {
    setSelectedInvestment(inv);
    setFormData({
      investmentType: inv.investmentType,
      amountInvested: inv.amountInvested,
      currentValue: inv.currentValue,
      purchaseDate: new Date(inv.purchaseDate).toISOString().split('T')[0],
      riskLevel: inv.riskLevel,
      notes: inv.notes || ''
    });
    setFormError('');
    setIsEditModalOpen(true);
  };

  const handleOpenDeleteModal = (inv) => {
    setSelectedInvestment(inv);
    setIsDeleteModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    
    const amt = parseFloat(formData.amountInvested);
    const val = parseFloat(formData.currentValue);
    
    if (isNaN(amt) || amt <= 0) {
      setFormError('Amount invested must be a positive number greater than 0.');
      return;
    }
    if (isNaN(val) || val < 0) {
      setFormError('Current value must be a positive number.');
      return;
    }
    if (!formData.purchaseDate) {
      setFormError('Purchase date is required.');
      return;
    }

    try {
      setSubmitLoading(true);
      const res = await api.post('/investments', {
        ...formData,
        amountInvested: amt,
        currentValue: val
      });
      if (res.data && res.data.status === 'success') {
        setIsAddModalOpen(false);
        await fetchData(); // Refresh all summaries and tables
      }
    } catch (err) {
      setFormError(err.response?.data?.message || err.response?.data?.errors?.[0] || 'Failed to create investment record.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    
    const amt = parseFloat(formData.amountInvested);
    const val = parseFloat(formData.currentValue);
    
    if (isNaN(amt) || amt <= 0) {
      setFormError('Amount invested must be a positive number greater than 0.');
      return;
    }
    if (isNaN(val) || val < 0) {
      setFormError('Current value must be a positive number.');
      return;
    }
    if (!formData.purchaseDate) {
      setFormError('Purchase date is required.');
      return;
    }

    try {
      setSubmitLoading(true);
      const res = await api.put(`/investments/${selectedInvestment._id}`, {
        ...formData,
        amountInvested: amt,
        currentValue: val
      });
      if (res.data && res.data.status === 'success') {
        setIsEditModalOpen(false);
        await fetchData(); // Refresh all summaries and tables
      }
    } catch (err) {
      setFormError(err.response?.data?.message || err.response?.data?.errors?.[0] || 'Failed to update investment record.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDeleteSubmit = async () => {
    try {
      setSubmitLoading(true);
      const res = await api.delete(`/investments/${selectedInvestment._id}`);
      if (res.data && res.data.status === 'success') {
        setIsDeleteModalOpen(false);
        await fetchData(); // Refresh
      }
    } catch (err) {
      console.error('Failed to delete investment:', err);
      alert(err.response?.data?.message || 'Failed to delete investment.');
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <ClientLayout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center">
          <div className="w-12 h-12 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-body-md text-text-muted mt-4 font-semibold">Loading investment portfolio...</p>
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
          <h2 className="text-headline-md font-bold text-accent">Error Loading Portfolio</h2>
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
            You must complete your Financial Profile setup wizard before we can display your investment analysis.
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

  const recommendation = getRecommendationStrategy(profile.riskTolerance);

  // SVG Chart generator helper
  const renderSVGChart = () => {
    if (!history || history.length < 2) return null;

    const width = 600;
    const height = 180;
    const paddingX = 40;
    const paddingY = 20;

    const values = history.map(h => h.portfolioValue);
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    const delta = maxVal - minVal;
    
    // Add safe buffer to top and bottom to avoid squishing
    const buffer = delta === 0 ? 1000 : delta * 0.15;
    const min = Math.max(0, minVal - buffer);
    const max = maxVal + buffer;
    const valueRange = max - min || 1;

    // Build path points
    const points = history.map((pt, idx) => {
      const x = paddingX + (idx / (history.length - 1)) * (width - 2 * paddingX);
      const y = height - paddingY - ((pt.portfolioValue - min) / valueRange) * (height - 2 * paddingY);
      return { x, y, val: pt.portfolioValue, date: pt.recordedDate };
    });

    const pathD = points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
    const areaD = `${pathD} L ${points[points.length - 1].x.toFixed(1)} ${(height - paddingY).toFixed(1)} L ${points[0].x.toFixed(1)} ${(height - paddingY).toFixed(1)} Z`;

    return (
      <div className="relative w-full h-[180px]">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
          <defs>
            <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#785a02" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#785a02" stopOpacity="0.0" />
            </linearGradient>
          </defs>
          
          {/* Grid lines */}
          <line x1={paddingX} y1={paddingY} x2={width - paddingX} y2={paddingY} stroke="#e6e8ec" strokeDasharray="3 3" />
          <line x1={paddingX} y1={height / 2} x2={width - paddingX} y2={height / 2} stroke="#e6e8ec" strokeDasharray="3 3" />
          <line x1={paddingX} y1={height - paddingY} x2={width - paddingX} y2={height - paddingY} stroke="#e6e8ec" />

          {/* Area Fill */}
          <motion.path 
            d={areaD} 
            fill="url(#chartGrad)" 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 0.5 }}
          />

          {/* Line Path */}
          <motion.path 
            d={pathD} 
            fill="none" 
            stroke="#785a02" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          />

          {/* Markers */}
          {points.map((p, idx) => (
            <g key={idx} className="group/marker">
              <motion.circle 
                cx={p.x} 
                cy={p.y} 
                r="4" 
                fill="#0A1229" 
                stroke="#785a02" 
                strokeWidth="2" 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1.2 + idx * 0.05, duration: 0.3 }}
              />
              <circle 
                cx={p.x} 
                cy={p.y} 
                r="8" 
                fill="#785a02" 
                className="opacity-0 hover:opacity-20 transition-opacity cursor-pointer" 
              />
              {/* Tooltip on hover */}
              <title>{`${p.date}: ${formatCurrency(p.val)}`}</title>
            </g>
          ))}
          
          {/* Axis Labels */}
          <text x={points[0].x} y={height - 5} textAnchor="start" className="text-[10px] fill-on-surface-variant font-medium">
            {points[0].date}
          </text>
          <text x={points[points.length - 1].x} y={height - 5} textAnchor="end" className="text-[10px] fill-on-surface-variant font-medium">
            {points[points.length - 1].date}
          </text>
        </svg>
      </div>
    );
  };

  return (
    <ClientLayout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-headline-lg font-bold text-accent">Investment Advisory</h1>
          <p className="text-body-md text-text-muted mt-1">Manage holdings, track asset allocation and monitor historical growth trends.</p>
        </div>
        <div className="flex gap-3">
          <Link to="/client/investment-recommendations">
            <button className="btn-ghost flex items-center gap-2">
              <span className="material-symbols-outlined">tune</span>
              Recommendations
            </button>
          </Link>
          <button 
            onClick={handleOpenAddModal} 
            className="btn-primary flex items-center gap-2"
          >
            <span className="material-symbols-outlined">add</span>
            Add Investment
          </button>
        </div>
      </div>

      {/* Portfolio Overview KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-gutter">
        {/* Portfolio Value */}
        <div className="card p-6">
          <span className="text-text-muted text-label-lg mb-1 block">Portfolio Value</span>
          <span className="text-headline-md font-bold text-accent">
            {formatCurrency(summary?.totalPortfolioValue ?? 0)}
          </span>
          <p className="text-xs text-text-muted mt-2 flex items-center gap-1">
            <span className="material-symbols-outlined text-xs">info</span>
            Synced currentValue sum
          </p>
        </div>

        {/* Amount Invested */}
        <div className="card p-6">
          <span className="text-text-muted text-label-lg mb-1 block">Amount Invested</span>
          <span className="text-headline-md font-bold text-accent">
            {formatCurrency(summary?.totalAmountInvested ?? 0)}
          </span>
          <p className="text-xs text-text-muted mt-2 flex items-center gap-1">
            <span className="material-symbols-outlined text-xs">inventory_2</span>
            Total principal invested
          </p>
        </div>

        {/* Profit/Loss */}
        <div className="card p-6">
          <span className="text-text-muted text-label-lg mb-1 block">Profit / Loss</span>
          <span className={`text-headline-md font-bold ${(summary?.totalProfitLoss ?? 0) >= 0 ? 'text-success' : 'text-error'}`}>
            {(summary?.totalProfitLoss ?? 0) >= 0 ? '+' : ''}{formatCurrency(summary?.totalProfitLoss ?? 0)}
          </span>
          <p className="text-xs text-text-muted mt-2 flex items-center gap-1">
            <span className="material-symbols-outlined text-xs">show_chart</span>
            Net value growth return
          </p>
        </div>

        {/* ROI */}
        <div className="card p-6">
          <span className="text-text-muted text-label-lg mb-1 block">Overall ROI %</span>
          <span className={`text-headline-md font-bold ${(summary?.overallROI ?? 0) >= 0 ? 'text-success' : 'text-error'}`}>
            {(summary?.overallROI ?? 0) >= 0 ? '+' : ''}{(summary?.overallROI ?? 0).toFixed(2)}%
          </span>
          <p className="text-xs text-text-muted mt-2 flex items-center gap-1">
            <span className="material-symbols-outlined text-xs">percent</span>
            Total ROI calculation
          </p>
        </div>
      </div>

      {/* Main Grid: Historical Chart & Asset Allocation */}
      <div className="grid grid-cols-12 gap-gutter">
        {/* Historical performance trend */}
        <div className="col-span-12 lg:col-span-8 card p-8 space-y-6">
          <div className="flex justify-between items-center border-b border-border pb-4">
            <div>
              <h3 className="text-headline-md font-bold text-accent">Historical Performance</h3>
              <p className="text-body-sm text-text-muted">Daily portfolio valuation trend line</p>
            </div>
          </div>
          
          {history && history.length >= 2 ? (
            renderSVGChart()
          ) : (
            <div className="border border-dashed border-border/60 rounded-xl p-8 text-center flex flex-col items-center justify-center h-[180px]">
              <span className="material-symbols-outlined text-text-muted text-4xl mb-2">timeline</span>
              <p className="text-label-lg font-bold text-accent">No Historical Data Available Yet</p>
              <p className="text-xs text-text-muted mt-1">Requires at least two days of recordings to compile trend charts.</p>
            </div>
          )}
        </div>

        {/* Goals & Allocation */}
        <div className="col-span-12 lg:col-span-4 card p-8 flex flex-col justify-between space-y-6">
          <div>
            <div className="border-b border-border pb-4 mb-4">
              <h3 className="text-headline-md font-bold text-accent">Asset Allocation</h3>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-body-sm text-text-muted">Diversification:</span>
                <span className={`status-badge font-bold py-0.5 px-2 rounded-full text-xs
                  ${summary?.diversificationScore === 'Well Diversified' ? 'status-success' : 
                    summary?.diversificationScore === 'Moderate Diversification' ? 'bg-secondary/20 text-secondary' : 
                    summary?.diversificationScore === 'Poor Diversification' ? 'status-warning' : 'status-warning'}`}>
                  {summary?.diversificationScore ?? 'No Data'}
                </span>
              </div>
            </div>

            {summary && Object.keys(summary.allocation || {}).length > 0 ? (
              <div className="space-y-4">
                {Object.entries(summary.allocation).map(([type, percent]) => (
                  <div key={type} className="space-y-1">
                    <div className="flex justify-between text-body-sm">
                      <span className="font-semibold text-accent">{type}</span>
                      <span className="text-text-muted">{percent.toFixed(1)}%</span>
                    </div>
                    <div className="h-2 bg-surface-hover rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-accent rounded-full" 
                        initial={{ width: 0 }}
                        animate={{ width: `${percent}%` }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center flex flex-col items-center justify-center border border-dashed border-border/60 rounded-xl h-[120px]">
                <span className="material-symbols-outlined text-text-muted text-3xl mb-1">donut_large</span>
                <p className="text-label-sm font-bold text-accent">No Allocation Data</p>
                <p className="text-xs text-text-muted mt-1">Add investments to see allocation percentages.</p>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-border">
            <p className="text-label-sm font-bold text-accent mb-2 uppercase tracking-wide">Investment Goals</p>
            {profile.investmentGoals && profile.investmentGoals.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {profile.investmentGoals.map((g, idx) => (
                  <span key={idx} className="px-2.5 py-1 bg-accent/10 text-accent rounded-full text-xs font-semibold">{g}</span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-text-muted">No investment goals specified.</p>
            )}
          </div>
        </div>
      </div>

      {/* Advisor Recommendations Card */}
      <div className="card p-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-secondary/15 text-secondary rounded-lg">
            <span className="material-symbols-outlined">lightbulb</span>
          </div>
          <div>
            <h2 className="text-headline-md font-bold text-accent">Advisor Recommendation Strategy</h2>
            <p className="text-xs text-text-muted">Based on your Medium/High risk profile standing</p>
          </div>
        </div>
        <div className="p-6 bg-surface rounded-xl border border-border">
          <h3 className="text-headline-sm font-bold text-secondary mb-2">{recommendation.strategy}</h3>
          <p className="text-body-md text-text-muted leading-relaxed">
            {recommendation.desc}
          </p>
        </div>
      </div>

      {/* Holdings Table */}
      <div className="card overflow-hidden">
        <div className="px-8 py-5 border-b border-border flex justify-between items-center bg-surface">
          <h2 className="text-headline-md font-bold text-accent">Asset Holdings & Performance</h2>
          <span className="status-badge status-success font-bold">{investments.length} Active Records</span>
        </div>
        
        {investments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-surface-hover text-label-lg text-text-muted uppercase tracking-wider">
                  <th className="px-6 py-4 text-left">Type</th>
                  <th className="px-6 py-4 text-right">Amount Invested</th>
                  <th className="px-6 py-4 text-right">Current Value</th>
                  <th className="px-6 py-4 text-center">Risk Level</th>
                  <th className="px-6 py-4 text-left">Purchase Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/40">
                {investments.map((inv) => {
                  const profitLoss = inv.currentValue - inv.amountInvested;
                  return (
                    <tr key={inv._id} className="hover:bg-surface/30 transition-colors">
                      <td className="px-6 py-4 text-body-md font-bold text-accent">
                        {inv.investmentType}
                      </td>
                      <td className="px-6 py-4 text-body-md text-right font-medium text-accent">
                        {formatCurrency(inv.amountInvested)}
                      </td>
                      <td className="px-6 py-4 text-body-md text-right font-bold text-accent">
                        <div className="flex flex-col items-end">
                          <span>{formatCurrency(inv.currentValue)}</span>
                          <span className={`text-xs font-bold ${profitLoss >= 0 ? 'text-success' : 'text-error'}`}>
                            {profitLoss >= 0 ? '+' : ''}{formatCurrency(profitLoss)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`status-badge font-bold ${
                          inv.riskLevel === 'Low' ? 'status-success' :
                          inv.riskLevel === 'Medium' ? 'bg-secondary/20 text-secondary' : 'status-warning'}`}>
                          {inv.riskLevel}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-body-md text-text-muted">
                        {new Date(inv.purchaseDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Link to={`/client/investments/${inv._id}`}>
                            <button className="btn-ghost py-1 px-3 text-label-sm font-bold flex items-center gap-1">
                              <span className="material-symbols-outlined text-sm">visibility</span>
                              View
                            </button>
                          </Link>
                          <button 
                            onClick={() => handleOpenEditModal(inv)}
                            className="btn-ghost py-1 px-3 text-label-sm font-bold text-secondary flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-sm">edit</span>
                            Edit
                          </button>
                          <button 
                            onClick={() => handleOpenDeleteModal(inv)}
                            className="btn-ghost py-1 px-3 text-label-sm font-bold text-error flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-sm">delete</span>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center flex flex-col items-center justify-center max-w-xl mx-auto space-y-4">
            <div className="w-16 h-16 bg-surface-hover rounded-2xl flex items-center justify-center border border-border text-text-muted shadow-sm">
              <span className="material-symbols-outlined text-3xl">folder_off</span>
            </div>
            <div>
              <h3 className="text-headline-md font-bold text-accent">No Holdings Registered</h3>
              <p className="text-body-md text-text-muted mt-2">
                Click "Add Investment" to log your first asset holding. Summaries and trends will compute automatically.
              </p>
            </div>
            <button onClick={handleOpenAddModal} className="btn-primary mt-2">
              Log First Investment
            </button>
          </div>
        )}
      </div>

      {/* CRUD Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-surface card max-w-md w-full p-8 space-y-6 shadow-2xl border border-border/45 animate-fade-in relative">
            <div className="flex justify-between items-center border-b border-border pb-4">
              <h3 className="text-headline-md font-bold text-accent">Add New Holding</h3>
              <button 
                onClick={() => setIsAddModalOpen(false)} 
                className="text-text-muted hover:text-accent transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {formError && (
              <div className="p-4 bg-error/10 border border-error/25 rounded-xl text-error text-body-sm font-semibold">
                {formError}
              </div>
            )}

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-label-sm font-bold text-accent block">Asset / Investment Type</label>
                <select 
                  name="investmentType"
                  value={formData.investmentType}
                  onChange={handleInputChange}
                  className="w-full p-3 bg-surface border border-border rounded-xl text-accent font-semibold focus:outline-none focus:border-primary"
                >
                  {investmentTypes.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-label-sm font-bold text-accent block">Amount Invested (₹)</label>
                  <input 
                    type="number"
                    name="amountInvested"
                    value={formData.amountInvested}
                    onChange={handleInputChange}
                    placeholder="e.g. 50000"
                    required
                    className="w-full p-3 bg-surface border border-border rounded-xl text-accent font-medium focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-label-sm font-bold text-accent block">Current Value (₹)</label>
                  <input 
                    type="number"
                    name="currentValue"
                    value={formData.currentValue}
                    onChange={handleInputChange}
                    placeholder="e.g. 62000"
                    required
                    className="w-full p-3 bg-surface border border-border rounded-xl text-accent font-medium focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-label-sm font-bold text-accent block">Purchase Date</label>
                  <input 
                    type="date"
                    name="purchaseDate"
                    value={formData.purchaseDate}
                    onChange={handleInputChange}
                    required
                    className="w-full p-3 bg-surface border border-border rounded-xl text-accent font-medium focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-label-sm font-bold text-accent block">Risk Rating</label>
                  <select 
                    name="riskLevel"
                    value={formData.riskLevel}
                    onChange={handleInputChange}
                    className="w-full p-3 bg-surface border border-border rounded-xl text-accent font-semibold focus:outline-none focus:border-primary"
                  >
                    {riskLevels.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-label-sm font-bold text-accent block">Notes / Description (Optional)</label>
                <textarea 
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows="2"
                  placeholder="e.g. HDFC Top 100 Fund - Direct Growth Plan"
                  className="w-full p-3 bg-surface border border-border rounded-xl text-accent font-medium focus:outline-none focus:border-primary resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <button 
                  type="button" 
                  onClick={() => setIsAddModalOpen(false)}
                  className="btn-ghost py-3 px-6"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={submitLoading}
                  className="btn-primary py-3 px-6 flex items-center gap-2"
                >
                  {submitLoading ? 'Saving...' : 'Register Holding'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CRUD Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-surface card max-w-md w-full p-8 space-y-6 shadow-2xl border border-border/45 animate-fade-in relative">
            <div className="flex justify-between items-center border-b border-border pb-4">
              <h3 className="text-headline-md font-bold text-accent">Edit Holding Specifications</h3>
              <button 
                onClick={() => setIsEditModalOpen(false)} 
                className="text-text-muted hover:text-accent transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {formError && (
              <div className="p-4 bg-error/10 border border-error/25 rounded-xl text-error text-body-sm font-semibold">
                {formError}
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-label-sm font-bold text-accent block">Asset / Investment Type</label>
                <select 
                  name="investmentType"
                  value={formData.investmentType}
                  onChange={handleInputChange}
                  className="w-full p-3 bg-surface border border-border rounded-xl text-accent font-semibold focus:outline-none focus:border-primary"
                >
                  {investmentTypes.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-label-sm font-bold text-accent block">Amount Invested (₹)</label>
                  <input 
                    type="number"
                    name="amountInvested"
                    value={formData.amountInvested}
                    onChange={handleInputChange}
                    placeholder="e.g. 50000"
                    required
                    className="w-full p-3 bg-surface border border-border rounded-xl text-accent font-medium focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-label-sm font-bold text-accent block">Current Value (₹)</label>
                  <input 
                    type="number"
                    name="currentValue"
                    value={formData.currentValue}
                    onChange={handleInputChange}
                    placeholder="e.g. 62000"
                    required
                    className="w-full p-3 bg-surface border border-border rounded-xl text-accent font-medium focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-label-sm font-bold text-accent block">Purchase Date</label>
                  <input 
                    type="date"
                    name="purchaseDate"
                    value={formData.purchaseDate}
                    onChange={handleInputChange}
                    required
                    className="w-full p-3 bg-surface border border-border rounded-xl text-accent font-medium focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-label-sm font-bold text-accent block">Risk Rating</label>
                  <select 
                    name="riskLevel"
                    value={formData.riskLevel}
                    onChange={handleInputChange}
                    className="w-full p-3 bg-surface border border-border rounded-xl text-accent font-semibold focus:outline-none focus:border-primary"
                  >
                    {riskLevels.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-label-sm font-bold text-accent block">Notes / Description (Optional)</label>
                <textarea 
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows="2"
                  placeholder="e.g. HDFC Top 100 Fund - Direct Growth Plan"
                  className="w-full p-3 bg-surface border border-border rounded-xl text-accent font-medium focus:outline-none focus:border-primary resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <button 
                  type="button" 
                  onClick={() => setIsEditModalOpen(false)}
                  className="btn-ghost py-3 px-6"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={submitLoading}
                  className="btn-primary py-3 px-6 flex items-center gap-2"
                >
                  {submitLoading ? 'Saving Changes...' : 'Update Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CRUD Delete Confirmation Dialog */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-surface card max-w-sm w-full p-8 space-y-6 shadow-2xl border border-border/45 animate-fade-in relative text-center">
            <div className="w-16 h-16 bg-error/10 border border-error/25 text-error rounded-full flex items-center justify-center mx-auto shadow-sm">
              <span className="material-symbols-outlined text-3xl">delete_forever</span>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-headline-md font-bold text-accent">Remove Holding?</h3>
              <p className="text-body-md text-text-muted">
                Are you sure you want to delete this <strong>{selectedInvestment?.investmentType}</strong> investment record? This operation will recalculate all portfolio aggregates.
              </p>
            </div>

            <div className="flex justify-center gap-3 pt-2">
              <button 
                type="button" 
                onClick={() => setIsDeleteModalOpen(false)}
                className="btn-ghost py-3 px-5"
              >
                No, Keep It
              </button>
              <button 
                type="button" 
                onClick={handleDeleteSubmit}
                disabled={submitLoading}
                className="px-5 py-3 bg-error text-white font-bold rounded-lg hover:bg-red-700 transition-colors"
              >
                {submitLoading ? 'Removing...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ClientLayout>
  );
}
