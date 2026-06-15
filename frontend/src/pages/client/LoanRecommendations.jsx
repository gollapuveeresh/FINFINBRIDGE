import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import ClientLayout from '../../layouts/ClientLayout';
import { formatCurrency } from '../../utils/currencyFormatter';

// Credit band badge colors
const bandColors = {
  'Excellent': 'bg-success/15 text-success border-success/25',
  'Good': 'bg-secondary/15 text-secondary border-secondary/25',
  'Fair': 'bg-warning/15 text-warning border-warning/25',
  'Poor': 'bg-error/15 text-error border-error/25',
  'High Risk': 'bg-error/20 text-error border-error/30'
};

// Tier config
const tierConfig = {
  highlyRecommended: { label: 'Highly Recommended', icon: 'verified', color: 'text-success', badgeBg: 'bg-success/15 text-success border-success/25' },
  recommended: { label: 'Recommended', icon: 'thumb_up', color: 'text-secondary', badgeBg: 'bg-secondary/15 text-secondary border-secondary/25' },
  considerLater: { label: 'Consider Later', icon: 'schedule', color: 'text-text-muted', badgeBg: 'bg-surface-hover text-text-muted border-border' }
};

function RecommendationCard({ product, tier }) {
  const [expanded, setExpanded] = useState(false);
  const tc = tierConfig[tier];

  return (
    <div className="card p-0 overflow-hidden hover:shadow-md transition-shadow duration-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`p-2 rounded-xl ${tc.badgeBg.split(' ').slice(0, 1).join(' ')}`}>
            <span className={`material-symbols-outlined ${tc.color}`}>{tc.icon}</span>
          </div>
          <div className="min-w-0">
            <h3 className="text-headline-sm font-bold text-accent truncate">{product.bankName}</h3>
            <p className="text-label-lg text-text-muted">{product.loanType}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          {product.isEligible ? (
            <span className="px-3 py-1 bg-success/15 text-success text-label-md font-bold rounded-lg border border-success/25 flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">check_circle</span>Eligible
            </span>
          ) : (
            <span className="px-3 py-1 bg-warning/15 text-warning text-label-md font-bold rounded-lg border border-warning/25 flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">info</span>Needs Improvement
            </span>
          )}
          <div className="text-right">
            <p className="text-headline-sm font-bold text-secondary">{product.interestRate}%</p>
            <p className="text-label-sm text-text-muted">Interest p.a.</p>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="px-6 py-4 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <p className="text-label-sm text-text-muted">Eligible Amount</p>
          <p className="text-body-lg font-bold text-accent">{formatCurrency(product.eligibleLoanAmount)}</p>
        </div>
        <div>
          <p className="text-label-sm text-text-muted">Estimated EMI</p>
          <p className="text-body-lg font-bold text-accent">{formatCurrency(product.estimatedEMI)}</p>
        </div>
        <div>
          <p className="text-label-sm text-text-muted">Tenure</p>
          <p className="text-body-lg font-bold text-accent">{product.tenureMonths} months</p>
        </div>
        <div>
          <p className="text-label-sm text-text-muted">Score</p>
          <div className="flex items-center gap-2">
            <p className="text-body-lg font-bold text-accent">{product.adjustedScore}</p>
            <div className="flex-1 h-2 bg-surface-hover rounded-full overflow-hidden max-w-[80px]">
              <div
                className={`h-full rounded-full transition-all duration-500 ${product.adjustedScore >= 80 ? 'bg-success' : product.adjustedScore >= 60 ? 'bg-secondary' : 'bg-warning'}`}
                style={{ width: `${Math.min(100, product.adjustedScore)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Expand toggle */}
      <div className="px-6 pb-4">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-center gap-1 text-label-md text-secondary font-bold py-2 rounded-lg hover:bg-secondary/10 transition-colors"
        >
          {expanded ? 'Hide Details' : 'View Details'}
          <span className={`material-symbols-outlined text-sm transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}>expand_more</span>
        </button>
      </div>

      {/* Expandable Details */}
      {expanded && (
        <div className="px-6 pb-6 space-y-4 border-t border-border/20 pt-4 animate-fadeIn">
          {/* Explanation reasons */}
          {product.recommendationExplanation && product.recommendationExplanation.length > 0 && (
            <div>
              <h4 className="text-label-lg font-bold text-accent mb-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-sm text-secondary">lightbulb</span>
                Why This Recommendation
              </h4>
              <ul className="space-y-1.5">
                {product.recommendationExplanation.map((reason, i) => (
                  <li key={i} className="flex items-start gap-2 text-body-md text-text-muted">
                    <span className="material-symbols-outlined text-sm text-success mt-0.5 flex-shrink-0">check</span>
                    {reason}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Features */}
          {product.features && product.features.length > 0 && (
            <div>
              <h4 className="text-label-lg font-bold text-accent mb-2">Key Features</h4>
              <div className="flex flex-wrap gap-2">
                {product.features.map((f, i) => (
                  <span key={i} className="px-3 py-1 bg-accent/8 text-accent text-label-md rounded-lg border border-primary/15">{f}</span>
                ))}
              </div>
            </div>
          )}

          {/* Additional info row */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4 bg-surface rounded-xl border border-border/20">
            <div>
              <p className="text-label-sm text-text-muted">Processing Fee</p>
              <p className="text-body-md font-bold text-accent">{product.processingFee}%</p>
            </div>
            <div>
              <p className="text-label-sm text-text-muted">Max Loan Amount</p>
              <p className="text-body-md font-bold text-accent">{formatCurrency(product.maxLoanAmount)}</p>
            </div>
            <div>
              <p className="text-label-sm text-text-muted">Affordability Ratio</p>
              <p className="text-body-md font-bold text-accent">{(product.affordabilityRatio * 100).toFixed(0)}%</p>
            </div>
          </div>

          {product.description && (
            <p className="text-body-sm text-text-muted italic">{product.description}</p>
          )}
        </div>
      )}
    </div>
  );
}

function TierSection({ title, icon, products, tier, color }) {
  if (!products || products.length === 0) return null;
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className={`material-symbols-outlined ${color}`}>{icon}</span>
        <h2 className="text-headline-md font-bold text-accent">{title}</h2>
        <span className="text-label-lg text-text-muted ml-1">({products.length})</span>
      </div>
      <div className="space-y-4">
        {products.map((p, i) => (
          <RecommendationCard key={p._id || i} product={p} tier={tier} />
        ))}
      </div>
    </div>
  );
}

export default function LoanRecommendations() {
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedType, setSelectedType] = useState('');

  const loanTypes = ['', 'Personal Loan', 'Home Loan', 'Car Loan', 'Education Loan', 'Business Loan', 'Gold Loan'];

  const fetchRecommendations = async (loanType = '') => {
    try {
      setLoading(true);
      setError('');
      const params = loanType ? `?loanType=${encodeURIComponent(loanType)}` : '';
      const res = await api.get(`/loan-products/recommendations${params}`);
      if (res.data && res.data.status === 'success') {
        setRecommendations(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch loan recommendations:', err);
      setError(err.response?.data?.message || 'Failed to load loan recommendations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations(selectedType);
  }, [selectedType]);

  if (loading) {
    return (
      <ClientLayout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center">
          <div className="w-12 h-12 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-body-md text-text-muted mt-4 font-semibold">Analyzing your profile for best matches...</p>
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
          <h2 className="text-headline-md font-bold text-accent">Error Loading Recommendations</h2>
          <p className="text-body-md text-text-muted">{error}</p>
          <button onClick={() => fetchRecommendations(selectedType)} className="btn-primary mt-4">Retry</button>
        </div>
      </ClientLayout>
    );
  }

  const data = recommendations;
  const totalResults = (data?.highlyRecommended?.length || 0) + (data?.recommended?.length || 0) + (data?.considerLater?.length || 0);
  const creditBandClass = bandColors[data?.creditBand] || bandColors['High Risk'];

  return (
    <ClientLayout>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-headline-lg font-bold text-accent">Loan Recommendations</h1>
          <p className="text-body-md text-text-muted mt-1">Personalized loan products matched to your financial profile.</p>
        </div>
        <div className="flex gap-3">
          <Link to="/client/loans">
            <button className="btn-ghost flex items-center gap-2">
              <span className="material-symbols-outlined">arrow_back</span>
              Back to Loans
            </button>
          </Link>
        </div>
      </div>

      {/* Credit Standing KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter">
        {[
          { label: 'Credit Score', value: `${data?.creditScore || 'N/A'}`, icon: 'credit_score', color: 'bg-success/15 text-success' },
          { label: 'Credit Band', value: data?.creditBand || 'N/A', icon: 'shield', color: creditBandClass },
          { label: 'Total Matches', value: `${data?.totalMatches || 0}`, icon: 'search', color: 'bg-secondary/15 text-secondary' },
          { label: 'Qualified Products', value: `${totalResults}`, icon: 'verified', color: 'bg-accent/10 text-accent' },
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

      {/* Quick Insights */}
      {data?.quickInsights && data.quickInsights.length > 0 && (
        <div className="card p-5 bg-secondary/5 border border-secondary/15">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-secondary mt-0.5">lightbulb</span>
            <div className="space-y-1">
              {data.quickInsights.map((insight, i) => (
                <p key={i} className="text-body-md text-text-muted">{insight}</p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Missing Requirements Warning */}
      {data?.missingRequirements && data.missingRequirements.length > 0 && (
        <div className="card p-5 bg-warning/5 border border-warning/20">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-warning mt-0.5">warning</span>
            <div>
              <h3 className="text-label-lg font-bold text-warning mb-1">Action Required</h3>
              <ul className="space-y-1">
                {data.missingRequirements.map((req, i) => (
                  <li key={i} className="text-body-md text-text-muted flex items-start gap-1.5">
                    <span className="text-warning mt-0.5">•</span>{req}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Loan Type Filter */}
      <div className="flex flex-wrap gap-2">
        {loanTypes.map((type) => (
          <button
            key={type || 'all'}
            onClick={() => setSelectedType(type)}
            className={`px-4 py-2 rounded-xl text-label-lg font-bold border transition-all duration-200 ${
              selectedType === type
                ? 'bg-accent text-on-primary border-primary shadow-sm'
                : 'bg-surface-hover text-text-muted border-border hover:border-primary/40 hover:text-accent'
            }`}
          >
            {type || 'All Categories'}
          </button>
        ))}
      </div>

      {/* Recommendation Tiers */}
      {totalResults > 0 ? (
        <div className="space-y-8">
          <TierSection title="Highly Recommended" icon="verified" products={data?.highlyRecommended} tier="highlyRecommended" color="text-success" />
          <TierSection title="Recommended" icon="thumb_up" products={data?.recommended} tier="recommended" color="text-secondary" />
          <TierSection title="Consider Later" icon="schedule" products={data?.considerLater} tier="considerLater" color="text-text-muted" />
        </div>
      ) : (
        <div className="card p-12 text-center flex flex-col items-center justify-center max-w-xl mx-auto space-y-4 my-4">
          <div className="w-16 h-16 bg-surface-hover rounded-2xl flex items-center justify-center border border-border text-text-muted shadow-sm">
            <span className="material-symbols-outlined text-3xl">search_off</span>
          </div>
          <div>
            <h3 className="text-headline-md font-bold text-accent">No Matching Products Found</h3>
            <p className="text-body-md text-text-muted mt-2">
              {selectedType
                ? `No ${selectedType} products match your current profile. Try selecting a different category.`
                : 'No loan products currently match your financial profile. Update your profile or check back later.'
              }
            </p>
          </div>
          {selectedType && (
            <button onClick={() => setSelectedType('')} className="btn-primary mt-2">
              View All Categories
            </button>
          )}
        </div>
      )}
    </ClientLayout>
  );
}
