import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ClientLayout from '../../layouts/ClientLayout';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { getHealthMetrics } from '../../utils/healthScoreCalculator';
import { formatCurrency } from '../../utils/currencyFormatter';
import { downloadPDFReport, downloadInvoicePDF } from '../../utils/pdfGenerator';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

// ── Shared KPI card ───────────────────────────────────────────────────────────
function KPI({ icon, label, value, sub, color = 'text-accent', bg = 'bg-accent/10', onClick }) {
  return (
    <div className={`card p-5 ${onClick ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''}`} onClick={onClick}>
      <div className={`p-2.5 rounded-xl w-fit mb-3 ${bg}`}>
        <span className={`material-symbols-outlined ${color}`}>{icon}</span>
      </div>
      <p className="text-text-muted text-xs font-semibold">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
      {sub && <p className="text-xs text-text-muted mt-1">{sub}</p>}
    </div>
  );
}

// ── Health Score Ring ─────────────────────────────────────────────────────────
function HealthRing({ score, size = 120, stroke = 4 }) {
  const r = (size / 2) - stroke * 2;
  const circ = 2 * Math.PI * r;
  const color = score >= 85 ? '#22c55e' : score >= 70 ? '#785a02' : score >= 50 ? '#f59e0b' : '#ef4444';
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#1e293b" strokeWidth={stroke} />
      <motion.circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeLinecap="round"
        initial={{ strokeDasharray: `0 ${circ}` }}
        animate={{ strokeDasharray: `${(score / 100) * circ} ${circ}` }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
      />
    </svg>
  );
}

// ── OVERVIEW TAB ─────────────────────────────────────────────────────────────
function OverviewTab({ user, profile, summary, loans, consultations, proposals, invoices, payments, onTabSwitch }) {
  const metrics    = getHealthMetrics(profile, summary);
  const upcoming   = consultations.filter(c => c.status === 'accepted');
  const pendingPay = invoices.filter(i => i.status === 'sent');
  const activeProposals = proposals.filter(p => p.status === 'sent');
  const wonProposals    = proposals.filter(p => p.status === 'approved');
  const totalPaid = payments.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0);

  const scoreColor = metrics.score >= 85 ? 'text-green-400' : metrics.score >= 70 ? 'text-accent' : metrics.score >= 50 ? 'text-amber-400' : 'text-red-400';
  const scoreBg    = metrics.score >= 85 ? 'from-green-500/10' : metrics.score >= 70 ? 'from-accent/10' : 'from-amber-500/10';

  return (
    <div className="space-y-gutter">

      {/* Welcome + Health Score hero */}
      <div className={`card p-7 bg-gradient-to-r ${scoreBg} to-bg border border-border`}>
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Score ring */}
          <div className="relative shrink-0">
            <HealthRing score={metrics.score} size={130} stroke={5} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-3xl font-black ${scoreColor}`}>{metrics.score}</span>
              <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">/ 100</span>
            </div>
          </div>
          <div className="flex-1 text-center md:text-left">
            <p className="text-xs font-bold text-text-muted uppercase tracking-widest mb-1">Financial Health Score</p>
            <h2 className={`text-2xl font-black ${scoreColor}`}>{metrics.overallStanding}</h2>
            <p className="text-text-muted text-sm mt-1">{metrics.overallRisk}</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
              {[
                { label: 'Liquidity',  val: metrics.liquidityPillarScore,  status: metrics.liquidityPillarStatus },
                { label: 'Debt',       val: metrics.debtPillarScore,        status: metrics.debtPillarStatus },
                { label: 'Savings',    val: metrics.savingsPillarScore,     status: metrics.savingsPillarStatus },
                { label: 'Investment', val: metrics.investmentPillarScore,  status: metrics.investmentPillarStatus },
              ].map(p => (
                <div key={p.label} className="bg-surface/60 rounded-xl p-3">
                  <p className="text-xs text-text-muted">{p.label}</p>
                  <p className="text-base font-bold text-accent">{p.val}</p>
                  <p className={`text-[10px] font-semibold mt-0.5 ${p.val >= 85 ? 'text-green-400' : p.val >= 70 ? 'text-amber-400' : 'text-red-400'}`}>{p.status}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2 shrink-0">
            <Link to="/client/health-score" className="btn-primary text-sm px-4 py-2.5 text-center">
              Full Report
            </Link>
            <button onClick={() => downloadPDFReport(profile, summary, loans, user)}
              className="btn-ghost text-sm px-4 py-2.5 flex items-center gap-2">
              <span className="material-symbols-outlined text-base">download</span> PDF
            </button>
          </div>
        </div>
      </div>

      {/* Key Financial KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter">
        <KPI icon="account_balance_wallet" label="Annual Income"   value={formatCurrency(profile.annualIncome)}       sub="Personal salary"     color="text-green-400"  bg="bg-green-500/10" />
        <KPI icon="savings"                label="Total Savings"   value={formatCurrency(profile.savings)}            sub="Liquid + Emergency"  color="text-secondary"  bg="bg-secondary/10" />
        <KPI icon="pie_chart"              label="Investments"     value={formatCurrency(profile.currentInvestments)} sub="Portfolio value"     color="text-purple-400" bg="bg-purple-500/10" />
        <KPI icon="credit_score"           label="Credit Score"    value={String(profile.creditScore || '—')}         sub="/ 850"
          color={profile.creditScore >= 740 ? 'text-green-400' : profile.creditScore >= 670 ? 'text-amber-400' : 'text-red-400'}
          bg={profile.creditScore >= 740 ? 'bg-green-500/10' : 'bg-amber-500/10'} />
      </div>

      {/* Action Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">

        {/* Pending Payments */}
        <div className="card p-5 border-l-4 border-emerald-500">
          <div className="flex items-center gap-3 mb-3">
            <span className="material-symbols-outlined text-emerald-400">payments</span>
            <h3 className="font-bold text-accent">Payments</h3>
          </div>
          {pendingPay.length > 0 ? (
            <div className="space-y-2">
              {pendingPay.slice(0, 2).map(inv => (
                <div key={inv._id} className="flex justify-between items-center p-3 bg-bg rounded-xl border border-emerald-500/20">
                  <div>
                    <p className="text-xs font-semibold text-accent">{inv.invoiceNumber}</p>
                    <p className="text-xs text-text-muted">{inv.serviceTitle}</p>
                  </div>
                  <p className="text-sm font-bold text-emerald-400">₹{inv.totalAmount?.toLocaleString('en-IN')}</p>
                </div>
              ))}
              <Link to="/client/payments" className="block mt-2 text-xs text-emerald-400 font-semibold hover:underline text-center">
                Pay Now →
              </Link>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-text-muted">No pending payments</p>
              <p className="text-xs text-green-400 font-semibold mt-1">₹{totalPaid.toLocaleString('en-IN')} total paid</p>
            </div>
          )}
        </div>

        {/* Active Proposals */}
        <div className="card p-5 border-l-4 border-blue-500">
          <div className="flex items-center gap-3 mb-3">
            <span className="material-symbols-outlined text-blue-400">description</span>
            <h3 className="font-bold text-accent">Proposals</h3>
          </div>
          {activeProposals.length > 0 ? (
            <div className="space-y-2">
              {activeProposals.slice(0, 2).map(p => (
                <div key={p._id} className="p-3 bg-bg rounded-xl border border-blue-500/20">
                  <p className="text-xs font-semibold text-accent truncate">{p.title}</p>
                  <p className="text-xs text-text-muted capitalize mt-0.5">{p.department} · {p.consultantId?.name}</p>
                </div>
              ))}
              <Link to="/client/proposals" className="block mt-2 text-xs text-blue-400 font-semibold hover:underline text-center">
                Review & Respond →
              </Link>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-text-muted">No pending proposals</p>
              <p className="text-xs text-green-400 font-semibold mt-1">{wonProposals.length} approved</p>
            </div>
          )}
        </div>

        {/* Upcoming Consultations */}
        <div className="card p-5 border-l-4 border-purple-500">
          <div className="flex items-center gap-3 mb-3">
            <span className="material-symbols-outlined text-purple-400">video_call</span>
            <h3 className="font-bold text-accent">Consultations</h3>
          </div>
          {upcoming.length > 0 ? (
            <div className="space-y-2">
              {upcoming.slice(0, 2).map(c => (
                <div key={c._id} className="p-3 bg-bg rounded-xl border border-purple-500/20">
                  <p className="text-xs font-semibold text-accent">{c.category}</p>
                  <p className="text-xs text-purple-400 font-semibold mt-0.5">{c.confirmedDate} at {c.confirmedTime}</p>
                </div>
              ))}
              <Link to="/client/consultations" className="block mt-2 text-xs text-purple-400 font-semibold hover:underline text-center">
                View All →
              </Link>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-text-muted">No upcoming sessions</p>
              <button onClick={() => onTabSwitch('appointments')}
                className="text-xs text-purple-400 font-semibold hover:underline mt-1 block mx-auto">
                Book Consultation →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Services Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-accent">My Services</h3>
          <button onClick={() => onTabSwitch('services')} className="text-xs text-secondary hover:underline font-semibold">View All</button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: 'calculate',        label: 'Tax',        color: 'text-amber-400',  bg: 'bg-amber-500/10',  to: '/client/tax-planning',   stat: 'FY 2024-25' },
            { icon: 'trending_up',      label: 'Investment', color: 'text-purple-400', bg: 'bg-purple-500/10', to: '/client/investments',     stat: summary ? formatCurrency(summary.totalPortfolioValue) : '—' },
            { icon: 'payments',         label: 'Loans',      color: 'text-blue-400',   bg: 'bg-blue-500/10',   to: '/client/loans',           stat: `${loans.length} active` },
            { icon: 'account_balance',  label: 'Wealth',     color: 'text-rose-400',   bg: 'bg-rose-500/10',   to: '/client/health-score',    stat: 'HNI Advisory' },
          ].map(s => (
            <Link key={s.label} to={s.to} className="card p-5 hover:shadow-lg transition-shadow group">
              <div className={`p-2.5 rounded-xl w-fit mb-3 ${s.bg}`}>
                <span className={`material-symbols-outlined ${s.color}`}>{s.icon}</span>
              </div>
              <p className="font-bold text-accent text-sm group-hover:text-secondary transition-colors">{s.label}</p>
              <p className="text-xs text-text-muted mt-1">{s.stat}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Financial Assessment summary */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-accent">Financial Assessment</h3>
          <Link to="/client/financial-profile" className="text-xs text-secondary hover:underline font-semibold">Update →</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Monthly Income',   val: formatCurrency(profile.monthlyIncome),   icon: 'trending_up',      color: 'text-green-400' },
            { label: 'Monthly Expenses', val: formatCurrency(profile.monthlyExpenses),  icon: 'shopping_cart',    color: 'text-amber-400' },
            { label: 'Emergency Fund',   val: `${metrics.monthsCovered.toFixed(1)} mo`, icon: 'savings',          color: 'text-blue-400' },
            { label: 'Debt-to-Income',   val: `${metrics.dti.toFixed(1)}%`,            icon: 'account_balance',  color: metrics.dti <= 36 ? 'text-green-400' : 'text-red-400' },
          ].map(item => (
            <div key={item.label} className="bg-bg rounded-xl p-4 border border-border/50">
              <div className="flex items-center gap-2 mb-2">
                <span className={`material-symbols-outlined text-base ${item.color}`}>{item.icon}</span>
                <p className="text-xs text-text-muted">{item.label}</p>
              </div>
              <p className={`text-lg font-bold ${item.color}`}>{item.val}</p>
            </div>
          ))}
        </div>
        {profile.existingLoans?.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border/30">
            <p className="text-xs font-bold text-text-muted mb-3 uppercase tracking-wider">Existing Loans</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {profile.existingLoans.map((ln, i) => (
                <div key={i} className="flex justify-between items-center p-3 bg-bg rounded-xl border border-border/40 text-sm">
                  <span className="text-text capitalize">{ln.loanType}</span>
                  <div className="text-right">
                    <span className="font-semibold text-accent">{formatCurrency(ln.amount)}</span>
                    <span className="text-xs text-text-muted ml-2">EMI {formatCurrency(ln.monthlyPayment)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {profile.investmentGoals?.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border/30">
            <p className="text-xs font-bold text-text-muted mb-2 uppercase tracking-wider">Investment Goals</p>
            <div className="flex flex-wrap gap-2">
              {profile.investmentGoals.map(g => (
                <span key={g} className="text-xs px-3 py-1 rounded-full bg-accent/10 text-accent font-semibold">{g}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Assigned Advisor */}
      {profile.assignedConsultant && (
        <div className="card p-6 flex items-center gap-5 border border-secondary/20 bg-secondary/5">
          <div className="w-14 h-14 rounded-2xl bg-secondary/20 flex items-center justify-center text-secondary font-black text-xl shrink-0">
            {profile.assignedConsultant.name?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-secondary uppercase tracking-wider">Your Assigned Advisor</p>
            <h3 className="font-bold text-accent text-lg">{profile.assignedConsultant.name}</h3>
            <p className="text-text-muted text-sm">{profile.assignedConsultant.email} · {profile.assignedConsultant.department}</p>
          </div>
          <div className="flex gap-3 shrink-0">
            <a href={`mailto:${profile.assignedConsultant.email}`} className="btn-ghost text-sm px-4 py-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-base">mail</span> Email
            </a>
            <button onClick={() => onTabSwitch('appointments')} className="btn-primary text-sm px-4 py-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-base">video_call</span> Book Session
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── SERVICES TAB ──────────────────────────────────────────────────────────────
function ServicesTab({ profile, summary, loans }) {
  const services = [
    {
      key: 'tax', label: 'Tax Management', icon: 'calculate', color: 'text-amber-400', bg: 'bg-amber-500/10',
      to: '/client/tax-planning', stat: 'FY 2024-25 Active',
      desc: 'ITR filing, GST returns, tax-saving investments, and advance tax planning.',
      workflow: ['Document Collection', 'Tax Analysis', 'Tax Saving Recommendations', 'Client Approval', 'Return Filing'],
      actions: [{ label: 'Tax Calculator', to: '/client/tax-planning' }, { label: 'View Summary', to: '/client/tax-summary' }],
    },
    {
      key: 'investment', label: 'Investment Management', icon: 'trending_up', color: 'text-purple-400', bg: 'bg-purple-500/10',
      to: '/client/investments', stat: summary ? formatCurrency(summary.totalPortfolioValue) : 'Set up portfolio',
      desc: 'Mutual funds, SIP, stocks, bonds, portfolio rebalancing and ROI monitoring.',
      workflow: ['Risk Assessment', 'Portfolio Design', 'Client Approval', 'Investment Execution', 'Portfolio Monitoring'],
      actions: [{ label: 'View Portfolio', to: '/client/investments' }, { label: 'Recommendations', to: '/client/investment-recommendations' }],
    },
    {
      key: 'loans', label: 'Loan Management', icon: 'payments', color: 'text-blue-400', bg: 'bg-blue-500/10',
      to: '/client/loans', stat: loans?.length ? `${loans.length} active` : 'No loans',
      desc: 'Home, personal, business & vehicle loans. Eligibility check, EMI tracker, bank submission.',
      workflow: ['Eligibility Check', 'EMI Calculation', 'Document Upload', 'Bank Submission', 'Disbursement'],
      actions: [{ label: 'Apply for Loan', to: '/client/loans' }, { label: 'EMI Schedule', to: '/client/loans' }],
    },
    {
      key: 'insurance', label: 'Insurance', icon: 'health_and_safety', color: 'text-green-400', bg: 'bg-green-500/10',
      to: '/client/proposals', stat: 'Life · Health · Motor',
      desc: 'Life, health, motor & business insurance. Policy comparison, renewal tracking and claims.',
      workflow: ['Policy Comparison', 'Recommendation', 'Client Approval', 'Policy Purchase', 'Renewal Tracking'],
      actions: [{ label: 'View Policies', to: '/client/proposals' }, { label: 'Compare Plans', to: '/client/proposals' }],
    },
    {
      key: 'wealth', label: 'Wealth Management', icon: 'account_balance', color: 'text-rose-400', bg: 'bg-rose-500/10',
      to: '/client/health-score', stat: 'HNI Advisory',
      desc: 'Goal planning, estate planning, asset allocation, succession planning and legacy management.',
      workflow: ['Financial Assessment', 'Goal Planning', 'Asset Allocation', 'Client Approval', 'Progress Monitoring'],
      actions: [{ label: 'Wealth Plan', to: '/client/health-score' }, { label: 'Set Goals', to: '/client/health-score' }],
    },
  ];

  return (
    <div className="space-y-gutter">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter">
        <KPI icon="account_balance" label="Net Worth"      value={profile ? formatCurrency((profile.savings||0)+(profile.currentInvestments||0)-(profile.totalLoanAmount||0)) : '—'} sub="Assets minus liabilities" />
        <KPI icon="payments"        label="Active Loans"   value={String(loans?.length||0)}  sub="Running EMIs"       color="text-blue-400"   bg="bg-blue-500/10" />
        <KPI icon="trending_up"     label="Portfolio"      value={summary ? formatCurrency(summary.totalPortfolioValue) : '—'} sub="Market value" color="text-purple-400" bg="bg-purple-500/10" />
        <KPI icon="show_chart"      label="ROI"            value={summary ? `${summary.overallROI?.toFixed(1)||0}%` : '—'} sub="Return on investment" color={summary?.overallROI>=0 ? 'text-green-400' : 'text-red-400'} bg={summary?.overallROI>=0 ? 'bg-green-500/10' : 'bg-red-500/10'} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-gutter">
        {services.map(svc => (
          <div key={svc.key} className="card p-6 flex flex-col justify-between hover:shadow-lg transition-shadow">
            <div>
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${svc.bg}`}>
                  <span className={`material-symbols-outlined ${svc.color}`}>{svc.icon}</span>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${svc.bg} ${svc.color}`}>{svc.stat}</span>
              </div>
              <h3 className="font-bold text-accent text-base">{svc.label}</h3>
              <p className="text-text-muted text-xs mt-1 leading-relaxed">{svc.desc}</p>
              {/* Workflow pipeline */}
              <div className="mt-4 flex items-center gap-1 flex-wrap">
                {svc.workflow.map((step, i) => (
                  <div key={step} className="flex items-center gap-1">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${i === 0 ? `${svc.bg} ${svc.color}` : 'bg-surface text-text-muted border border-border/50'}`}>{step}</span>
                    {i < svc.workflow.length - 1 && <span className="text-text-muted text-[10px]">›</span>}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              {svc.actions.map(a => (
                <Link key={a.label} to={a.to} className="flex-1">
                  <button className={`w-full py-2 text-xs font-semibold rounded-xl border transition-colors ${svc.bg} ${svc.color} border-current/20 hover:opacity-80`}>
                    {a.label}
                  </button>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── PROPOSALS & PAYMENTS TAB ──────────────────────────────────────────────────
const loadRazorpay = () => new Promise(resolve => {
  if (window.Razorpay) return resolve(true);
  const s = document.createElement('script');
  s.src = 'https://checkout.razorpay.com/v1/checkout.js';
  s.onload = () => resolve(true);
  s.onerror = () => resolve(false);
  document.body.appendChild(s);
});

function ProposalsPaymentsTab({ proposals, invoices, payments, onRefetch }) {
  const [tab, setTab]         = useState('proposals');
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [responding, setResponding] = useState(false);
  const [paying, setPaying]   = useState(null);

  const STATUS_COLOR = {
    draft: 'text-gray-400', sent: 'text-blue-400', approved: 'text-green-400',
    changes_requested: 'text-amber-400', rejected: 'text-red-400',
  };
  const INV_COLOR = { draft: 'text-gray-400', sent: 'text-amber-400', paid: 'text-green-400', overdue: 'text-red-400', cancelled: 'text-gray-500' };

  const respond = async (id, status) => {
    try {
      setResponding(true);
      await api.patch(`/proposals/${id}`, { status, clientFeedback: feedback });
      toast.success(status === 'approved' ? 'Proposal approved!' : status === 'changes_requested' ? 'Changes requested' : 'Proposal rejected');
      setSelected(null); setFeedback('');
      onRefetch();
    } catch { toast.error('Action failed'); }
    finally { setResponding(false); }
  };

  const handlePay = async (invoice) => {
    setPaying(invoice._id);
    try {
      const loaded = await loadRazorpay();
      if (!loaded) { toast.error('Payment gateway failed to load'); return; }
      const { data } = await api.post('/payments/create-order', { invoiceId: invoice._id });
      if (!data.razorpayKeyId || data.razorpayKeyId.startsWith('rzp_test_your')) {
        await api.post('/payments/verify', {
          paymentId: data.payment._id,
          gatewayOrderId: data.gatewayOrderId || 'demo_order',
          gatewayPaymentId: 'demo_' + Date.now(),
          gatewaySignature: 'demo_signature',
        });
        toast.success('Demo mode: payment confirmed!');
        onRefetch();
        return;
      }
      new window.Razorpay({
        key: data.razorpayKeyId, amount: data.amount, currency: data.currency,
        name: 'FinBridge Solutions', description: invoice.serviceTitle,
        order_id: data.gatewayOrderId,
        handler: async (r) => {
          await api.post('/payments/verify', {
            paymentId: data.payment._id,
            gatewayOrderId: r.razorpay_order_id,
            gatewayPaymentId: r.razorpay_payment_id,
            gatewaySignature: r.razorpay_signature,
          });
          toast.success('Payment successful! Service activated.');
          onRefetch();
        },
        theme: { color: '#6366f1' },
        modal: { ondismiss: () => setPaying(null) },
      }).open();
    } catch (err) { toast.error(err.response?.data?.message || 'Payment failed'); }
    finally { setPaying(null); }
  };

  const pendingInvoices = invoices.filter(i => i.status === 'sent');
  const totalPaid = payments.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0);

  return (
    <div className="space-y-gutter">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPI icon="description"    label="Total Proposals"  value={proposals.length}                                  sub="All time"            color="text-blue-400"    bg="bg-blue-500/10" />
        <KPI icon="pending_actions" label="Awaiting Review"  value={proposals.filter(p=>p.status==='sent').length}    sub="Need your response"  color="text-amber-400"   bg="bg-amber-500/10" />
        <KPI icon="receipt"        label="Pending Payment"  value={pendingInvoices.length}                            sub="Invoices due"        color="text-emerald-400" bg="bg-emerald-500/10" />
        <KPI icon="payments"       label="Total Paid"       value={`₹${totalPaid.toLocaleString('en-IN')}`}          sub="Across all services" color="text-green-400"   bg="bg-green-500/10" />
      </div>

      <div className="flex gap-2 border-b border-border pb-1">
        {[{ key: 'proposals', label: 'Proposals' }, { key: 'invoices', label: 'Invoices' }, { key: 'history', label: 'Payment History' }].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-t-xl text-sm font-semibold transition-colors ${tab === t.key ? 'bg-primary text-white' : 'text-text-muted hover:text-accent'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Proposals */}
      {tab === 'proposals' && (
        proposals.length === 0
          ? <div className="card p-12 text-center text-text-muted">No proposals yet. Your consultant will send one after consultation.</div>
          : <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
              {proposals.map(p => (
                <div key={p._id} className="card p-6">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-bold text-accent">{p.title}</p>
                      <p className="text-xs text-text-muted capitalize mt-0.5">{p.department} · by {p.consultantId?.name}</p>
                      <p className="text-xs text-text-muted mt-0.5">{new Date(p.createdAt).toLocaleDateString()}</p>
                    </div>
                    <span className={`text-xs font-semibold capitalize ${STATUS_COLOR[p.status]}`}>{p.status?.replace(/_/g,' ')}</span>
                  </div>
                  {p.summary && <p className="text-sm text-text-muted mb-3 leading-relaxed">{p.summary}</p>}
                  {p.details && Object.keys(p.details).length > 0 && (
                    <div className="bg-bg rounded-xl p-3 mb-3 space-y-1">
                      {Object.entries(p.details).map(([k,v]) => (
                        <div key={k} className="flex justify-between text-xs py-1 border-b border-border/20 last:border-0">
                          <span className="text-text-muted capitalize">{k.replace(/([A-Z])/g,' $1')}</span>
                          <span className="font-semibold text-accent">{String(v)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {p.clientFeedback && <p className="text-xs text-text-muted italic mb-3">Your feedback: {p.clientFeedback}</p>}
                  {p.status === 'sent' && (
                    <button onClick={() => { setSelected(p); setFeedback(''); }} className="w-full btn-primary py-2.5 text-sm mt-2">
                      Review & Respond
                    </button>
                  )}
                  {p.status === 'approved' && p.invoiceId && (
                    <div className="mt-2 p-2 rounded-xl bg-green-500/10 text-xs text-green-400 font-semibold text-center">
                      ✓ Approved — Check Invoices tab to pay
                    </div>
                  )}
                </div>
              ))}
            </div>
      )}

      {/* Invoices */}
      {tab === 'invoices' && (
        invoices.length === 0
          ? <div className="card p-12 text-center text-text-muted">No invoices yet.</div>
          : <div className="space-y-3">
              {invoices.map(inv => (
                <div key={inv._id} className="card p-5">
                  <div className="flex justify-between items-start flex-wrap gap-3">
                    <div>
                      <p className="font-bold text-accent">{inv.invoiceNumber}</p>
                      <p className="text-sm text-text-muted mt-0.5">{inv.serviceTitle}</p>
                      <p className="text-xs text-text-muted capitalize mt-0.5">{inv.department} · {inv.consultantId?.name}</p>
                      {inv.dueDate && <p className="text-xs text-text-muted mt-0.5">Due: {new Date(inv.dueDate).toLocaleDateString()}</p>}
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-accent">₹{inv.totalAmount?.toLocaleString('en-IN')}</p>
                      <p className={`text-xs font-semibold capitalize mt-1 ${INV_COLOR[inv.status]}`}>{inv.status}</p>
                      <button onClick={() => downloadInvoicePDF(inv, null)}
                        className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
                        <span className="material-symbols-outlined text-sm">download</span>
                        Download
                      </button>
                    </div>
                  </div>
                  <div className="mt-3 border-t border-border/30 pt-3 space-y-1">
                    {inv.lineItems?.map((li, i) => (
                      <div key={i} className="flex justify-between text-xs">
                        <span className="text-text-muted">{li.description}</span>
                        <span className="text-accent">₹{li.amount?.toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                    <div className="flex justify-between text-xs border-t border-border/20 pt-1 mt-1">
                      <span className="text-text-muted">GST ({inv.taxPercent}%)</span>
                      <span className="text-accent">₹{inv.tax?.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                  {inv.status === 'sent' && (
                    <button onClick={() => handlePay(inv)} disabled={paying === inv._id}
                      className="w-full mt-4 py-3 btn-primary font-semibold disabled:opacity-60">
                      {paying === inv._id ? 'Processing...' : `Pay ₹${inv.totalAmount?.toLocaleString('en-IN')} via Razorpay`}
                    </button>
                  )}
                  {inv.status === 'paid' && (
                    <div className="mt-3 text-green-400 text-sm font-semibold flex items-center gap-2">
                      <span>✓</span> Paid on {inv.paidAt ? new Date(inv.paidAt).toLocaleDateString() : '—'}
                    </div>
                  )}
                </div>
              ))}
            </div>
      )}

      {/* Payment History */}
      {tab === 'history' && (
        payments.length === 0
          ? <div className="card p-12 text-center text-text-muted">No payment history yet.</div>
          : <div className="card overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-border text-text-muted text-left">
                  {['Invoice','Amount','Gateway','Method','Status','Date'].map(h => (
                    <th key={h} className="px-5 py-3 font-semibold">{h}</th>
                  ))}
                </tr></thead>
                <tbody className="divide-y divide-border/30">
                  {payments.map(p => (
                    <tr key={p._id} className="hover:bg-surface/50">
                      <td className="px-5 py-3 text-accent font-semibold">{p.invoiceId?.invoiceNumber || '—'}</td>
                      <td className="px-5 py-3 font-bold">₹{p.amount?.toLocaleString('en-IN')}</td>
                      <td className="px-5 py-3 capitalize text-text-muted">{p.gateway}</td>
                      <td className="px-5 py-3 capitalize text-text-muted">{p.method || '—'}</td>
                      <td className={`px-5 py-3 font-semibold capitalize ${p.status==='paid' ? 'text-green-400' : p.status==='failed' ? 'text-red-400' : 'text-amber-400'}`}>{p.status}</td>
                      <td className="px-5 py-3 text-text-muted">{p.paidAt ? new Date(p.paidAt).toLocaleDateString() : new Date(p.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
      )}

      {/* Response Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4">
          <div className="bg-surface rounded-3xl p-8 w-full max-w-md space-y-5">
            <div>
              <h2 className="text-xl font-bold text-accent">{selected.title}</h2>
              <p className="text-text-muted text-sm capitalize mt-0.5">{selected.department} · {selected.consultantId?.name}</p>
            </div>
            {selected.summary && <p className="text-sm text-text-muted bg-bg p-4 rounded-xl">{selected.summary}</p>}
            <div>
              <label className="text-xs text-text-muted block mb-1">Feedback (optional)</label>
              <textarea value={feedback} onChange={e => setFeedback(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-border bg-bg text-sm h-24 resize-none"
                placeholder="Any comments or changes needed..." />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <button onClick={() => respond(selected._id, 'approved')} disabled={responding}
                className="py-3 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-semibold text-sm disabled:opacity-50">✓ Approve</button>
              <button onClick={() => respond(selected._id, 'changes_requested')} disabled={responding}
                className="py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl font-semibold text-sm disabled:opacity-50">✎ Changes</button>
              <button onClick={() => respond(selected._id, 'rejected')} disabled={responding}
                className="py-3 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-semibold text-sm disabled:opacity-50">✗ Reject</button>
            </div>
            <button onClick={() => setSelected(null)} className="w-full btn-ghost py-3">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── APPOINTMENTS TAB ──────────────────────────────────────────────────────────
function AppointmentsTab({ consultations, onRefetch }) {
  const [showBook, setShowBook] = useState(false);
  const [category, setCategory] = useState('General Consultation');
  const [notes, setNotes]       = useState('');
  const [booking, setBooking]   = useState(false);

  const CATEGORY_DEPT = {
    'General Consultation':  'loans',
    'Loan Advisory':         'loans',
    'Tax Strategy':          'tax',
    'Investment Review':     'investment',
    'Insurance Review':      'insurance',
    'Wealth Planning':       'wealth',
  };

  const handleBook = async (e) => {
    e.preventDefault();
    try {
      setBooking(true);
      await api.post('/consultations', {
        category,
        clientNotes: notes,
        department: CATEGORY_DEPT[category] || 'loans',
      });
      toast.success('Consultation request submitted! Advisor will confirm shortly.');
      setNotes(''); setShowBook(false);
      onRefetch();
    } catch (err) { toast.error(err.response?.data?.message || 'Booking failed'); }
    finally { setBooking(false); }
  };

  const upcoming  = consultations.filter(c => c.status === 'accepted');
  const pending   = consultations.filter(c => c.status === 'pending');
  const completed = consultations.filter(c => c.status === 'completed');

  return (
    <div className="space-y-gutter">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-bold text-accent">Consultations & Appointments</h2>
          <p className="text-text-muted text-sm mt-0.5">Book sessions, join video consultations, and track history</p>
        </div>
        <button onClick={() => setShowBook(true)} className="btn-primary flex items-center gap-2 px-5">
          <span className="material-symbols-outlined text-lg">add_circle</span> Book Consultation
        </button>
      </div>

      <div className="grid grid-cols-3 gap-gutter">
        <KPI icon="event_upcoming" label="Upcoming"  value={String(upcoming.length)}  sub="Confirmed sessions"    color="text-green-400"  bg="bg-green-500/10" />
        <KPI icon="pending"        label="Pending"   value={String(pending.length)}   sub="Awaiting confirmation" color="text-amber-400"  bg="bg-amber-500/10" />
        <KPI icon="history"        label="Completed" value={String(completed.length)} sub="Past sessions"         color="text-accent"     bg="bg-accent/10" />
      </div>

      {upcoming.length > 0 && (
        <div className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-border bg-green-500/5">
            <h3 className="font-bold text-green-400">✓ Confirmed Sessions ({upcoming.length})</h3>
          </div>
          <div className="divide-y divide-border">
            {upcoming.map(c => (
              <div key={c._id} className="px-6 py-5 flex items-start gap-4 hover:bg-surface/50">
                <div className="p-3 rounded-xl bg-green-500/10">
                  <span className="material-symbols-outlined text-green-400">video_call</span>
                </div>
                <div className="flex-1">
                  <p className="font-bold text-accent">{c.category}</p>
                  <p className="text-xs text-text-muted mt-0.5">With: {c.consultantId?.name || 'Advisor'}</p>
                  <p className="text-xs text-green-400 font-semibold mt-1">{c.confirmedDate} at {c.confirmedTime}</p>
                </div>
                {c.meetingLink && (
                  <a href={c.meetingLink} target="_blank" rel="noopener noreferrer">
                    <button className="btn-primary text-xs px-4 py-2 flex items-center gap-1">
                      <span className="material-symbols-outlined text-base">videocam</span> Join
                    </button>
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {pending.length > 0 && (
        <div className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-border bg-amber-500/5">
            <h3 className="font-bold text-amber-400">⏳ Pending Confirmation ({pending.length})</h3>
          </div>
          <div className="divide-y divide-border">
            {pending.map(c => (
              <div key={c._id} className="px-6 py-5 flex items-center gap-4 hover:bg-surface/50">
                <div className="p-3 rounded-xl bg-amber-500/10">
                  <span className="material-symbols-outlined text-amber-400">pending</span>
                </div>
                <div className="flex-1">
                  <p className="font-bold text-accent">{c.category}</p>
                  <p className="text-xs text-text-muted mt-0.5">Advisor will confirm timing shortly</p>
                  {c.clientNotes && <p className="text-xs italic text-text-muted mt-1">"{c.clientNotes}"</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex justify-between items-center">
          <h3 className="font-bold text-accent">All Consultations</h3>
          <span className="text-xs text-text-muted">{consultations.length} total</span>
        </div>
        {consultations.length === 0 ? (
          <div className="py-14 text-center space-y-3">
            <span className="material-symbols-outlined text-4xl text-text-muted">event_busy</span>
            <p className="font-bold text-accent">No Sessions Yet</p>
            <button onClick={() => setShowBook(true)} className="btn-primary px-6 py-2.5 text-sm">Book First Consultation</button>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {consultations.map(c => (
              <div key={c._id} className="px-6 py-4 flex items-center justify-between hover:bg-surface/50">
                <div className="flex items-center gap-4">
                  <span className={`material-symbols-outlined text-base ${c.status === 'accepted' ? 'text-green-400' : c.status === 'pending' ? 'text-amber-400' : 'text-text-muted'}`}>
                    {c.status === 'accepted' ? 'video_call' : 'event'}
                  </span>
                  <div>
                    <p className="font-semibold text-text text-sm">{c.category}</p>
                    <p className="text-xs text-text-muted">{c.consultantId?.name || 'Advisor'} · {c.confirmedDate || 'TBC'}</p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold capitalize ${c.status === 'accepted' ? 'bg-green-500/20 text-green-400' : c.status === 'pending' ? 'bg-amber-500/20 text-amber-400' : 'bg-surface text-text-muted border border-border'}`}>
                  {c.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {showBook && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4">
          <div className="bg-surface rounded-3xl p-8 w-full max-w-md">
            <h3 className="text-xl font-bold text-accent mb-6">Book a Consultation</h3>
            <form onSubmit={handleBook} className="space-y-4">
              <div>
                <label className="text-xs text-text-muted block mb-1">Consultation Type</label>
                <select value={category} onChange={e => setCategory(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-border bg-bg text-sm">
                  {['General Consultation','Loan Advisory','Tax Strategy','Investment Review','Insurance Review','Wealth Planning'].map(v => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-text-muted block mb-1">Notes (optional)</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-border bg-bg text-sm h-24 resize-none"
                  placeholder="What would you like to discuss?" />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowBook(false)} className="flex-1 btn-ghost py-3">Cancel</button>
                <button type="submit" disabled={booking} className="flex-1 btn-primary py-3 disabled:opacity-60">
                  {booking ? 'Booking...' : 'Confirm Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ── DOCUMENTS TAB ─────────────────────────────────────────────────────────────
const DOC_TYPE_ICON = { Report: 'description', Proposal: 'article', 'Tax Doc': 'receipt_long', Quote: 'request_quote', KYC: 'badge', Other: 'folder' };
const DOC_STATUS_COLOR = { Signed: 'bg-green-500/20 text-green-400', 'Pending Sign': 'bg-amber-500/20 text-amber-400', Uploaded: 'bg-blue-500/20 text-blue-400' };
const FALLBACK_DOCS = [
  { id: 1, name: 'Q2_Portfolio_Review.pdf', type: 'Report',   size: '2.4 MB', date: '2025-06-28', status: 'Signed',       canDownload: true },
  { id: 2, name: 'Home_Loan_Proposal.pdf',  type: 'Proposal', size: '1.1 MB', date: '2025-06-25', status: 'Pending Sign', canDownload: false },
  { id: 3, name: 'ITR_Filing_FY2024.xlsx',  type: 'Tax Doc',  size: '540 KB', date: '2025-06-20', status: 'Uploaded',     canDownload: true },
];

function DocumentsTab({ profile, summary, loans, user }) {
  const [docs, setDocs]           = useState([]);
  const [search, setSearch]       = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [form, setForm]           = useState({ name: '', type: 'Report' });
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    api.get('/documents/my').then(r => setDocs(r.data.documents || [])).catch(() => setDocs(FALLBACK_DOCS));
  }, []);

  const filtered = docs.filter(d => d.name.toLowerCase().includes(search.toLowerCase()));

  const handleUpload = async () => {
    if (!form.name.trim()) { toast.error('Document name required'); return; }
    try {
      setUploading(true);
      const res = await api.post('/documents/upload', { name: form.name, type: form.type, size: '—' });
      setDocs(prev => [res.data.document, ...prev]);
      setForm({ name: '', type: 'Report' });
      setShowUpload(false);
      toast.success('Document uploaded');
    } catch { toast.error('Upload failed'); }
    finally { setUploading(false); }
  };

  const handleSign = async (id) => {
    try {
      const res = await api.patch(`/documents/${id}/sign`);
      setDocs(prev => prev.map(d => d._id === id ? res.data.document : d));
      toast.success('Document signed');
    } catch { toast.error('Sign failed'); }
  };

  return (
    <div className="space-y-gutter">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-bold text-accent">Documents & E-Sign</h2>
          <p className="text-text-muted text-sm mt-0.5">Upload, download and e-sign your financial documents</p>
        </div>
        <button onClick={() => setShowUpload(true)} className="btn-primary flex items-center gap-2 px-5">
          <span className="material-symbols-outlined text-lg">upload_file</span> Upload
        </button>
      </div>

      <div className="grid grid-cols-3 gap-gutter">
        <KPI icon="folder_open" label="Total Documents" value={String(docs.length)}                                       sub="All files" />
        <KPI icon="verified"    label="Signed"           value={String(docs.filter(d=>d.status==='Signed').length)}        sub="E-signed"     color="text-green-400" bg="bg-green-500/10" />
        <KPI icon="draw"        label="Pending Sign"     value={String(docs.filter(d=>d.status==='Pending Sign').length)}  sub="Action needed" color="text-amber-400" bg="bg-amber-500/10" />
      </div>

      <div className="card p-3">
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">search</span>
          <input value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-bg text-sm"
            placeholder="Search documents..." />
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface border-b border-border">
              <tr className="text-left text-text-muted text-xs uppercase tracking-wider">
                {['Document','Type','Size','Date','Status','Actions'].map(h => (
                  <th key={h} className="px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0
                ? <tr><td colSpan={6} className="py-12 text-center text-text-muted">No documents found.</td></tr>
                : filtered.map(doc => (
                  <tr key={doc._id || doc.id} className="hover:bg-surface/50">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-accent text-base">{DOC_TYPE_ICON[doc.type] || 'folder'}</span>
                        <span className="font-semibold text-text text-xs max-w-[180px] truncate">{doc.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4"><span className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent font-semibold">{doc.type}</span></td>
                    <td className="px-5 py-4 text-xs text-text-muted">{doc.size}</td>
                    <td className="px-5 py-4 text-xs text-text-muted">{doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : doc.date}</td>
                    <td className="px-5 py-4"><span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${DOC_STATUS_COLOR[doc.status] || ''}`}>{doc.status}</span></td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        {doc.canDownload && (
                          <button onClick={() => downloadPDFReport(profile, summary, loans, user)}
                            className="text-xs text-accent hover:underline font-semibold">Download</button>
                        )}
                        {doc.status === 'Pending Sign' && (
                          <button onClick={() => handleSign(doc._id || doc.id)}
                            className="text-xs text-amber-400 hover:underline font-semibold">Sign</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>

      {showUpload && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4">
          <div className="bg-surface rounded-3xl p-8 w-full max-w-md">
            <h3 className="text-xl font-bold text-accent mb-6">Upload Document</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-text-muted block mb-1">Document Name *</label>
                <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Form_16_FY2025.pdf"
                  className="w-full p-2.5 rounded-xl border border-border bg-bg text-sm" />
              </div>
              <div>
                <label className="text-xs text-text-muted block mb-1">Type</label>
                <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                  className="w-full p-2.5 rounded-xl border border-border bg-bg text-sm">
                  {Object.keys(DOC_TYPE_ICON).map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed border-border rounded-2xl p-8 text-center cursor-pointer hover:border-accent transition-colors">
                <span className="material-symbols-outlined text-accent text-3xl">cloud_upload</span>
                <p className="text-sm text-text-muted mt-2">Click to select file</p>
                <input ref={fileRef} type="file" className="hidden" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowUpload(false)} className="flex-1 btn-ghost py-3">Cancel</button>
              <button onClick={handleUpload} disabled={uploading} className="flex-1 btn-primary py-3 disabled:opacity-60">
                {uploading ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── NOTIFICATIONS TAB ─────────────────────────────────────────────────────────
const NOTIF_TAGS = ['All','Policy','Tax','EMI','Investment'];
const NOTIF_DATA = [
  { id:1, icon:'health_and_safety', color:'text-green-400 bg-green-500/10',  title:'Policy Renewal Due',      desc:'Your LIC Health Insurance policy renews on Aug 15, 2025. Premium: ₹18,000.',              time:'2h ago',  read:false, tag:'Policy' },
  { id:2, icon:'receipt_long',      color:'text-amber-400 bg-amber-500/10',  title:'Tax Filing Deadline',     desc:'ITR deadline for FY 2024-25 is July 31. Please upload Form 16 and bank statements.',     time:'5h ago',  read:false, tag:'Tax' },
  { id:3, icon:'payments',          color:'text-blue-400 bg-blue-500/10',    title:'EMI Due in 3 Days',        desc:'Your home loan EMI of ₹42,500 is due on July 5. Ensure sufficient balance.',             time:'1d ago',  read:false, tag:'EMI' },
  { id:4, icon:'trending_up',       color:'text-purple-400 bg-purple-500/10',title:'Portfolio Milestone',     desc:'Your SIP portfolio has crossed ₹5,00,000! CAGR: +12.4%. Consider rebalancing.',           time:'2d ago',  read:true,  tag:'Investment' },
  { id:5, icon:'calculate',         color:'text-amber-400 bg-amber-500/10',  title:'Tax Saving Opportunity',  desc:'Save up to ₹46,800 in taxes by maxing your Section 80C investments before March 31.',      time:'1w ago',  read:true,  tag:'Tax' },
];

function NotificationsTab({ liveNotifs }) {
  const [list, setList] = useState([]);
  const [tag, setTag]   = useState('All');

  useEffect(() => {
    const merged = [...(liveNotifs || []).map((n, i) => ({
      id: n._id || i, icon: 'notifications', color: 'text-accent bg-accent/10',
      title: n.title, desc: n.message, time: new Date(n.createdAt).toLocaleDateString(),
      read: n.isRead, tag: 'All',
    })), ...NOTIF_DATA];
    setList(merged);
  }, [liveNotifs]);

  const filtered = list.filter(n => tag === 'All' || n.tag === tag);
  const unread   = list.filter(n => !n.read).length;
  const markRead = (id) => setList(p => p.map(n => n.id === id ? { ...n, read: true } : n));
  const markAll  = () => setList(p => p.map(n => ({ ...n, read: true })));

  return (
    <div className="space-y-gutter">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-bold text-accent">Notifications & Alerts</h2>
          <p className="text-text-muted text-sm mt-0.5">Policy renewals, tax deadlines, EMI reminders, investment updates</p>
        </div>
        {unread > 0 && <button onClick={markAll} className="btn-ghost text-sm px-4 py-2.5">Mark All Read</button>}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter">
        {[
          { label:'Policy Renewals', icon:'health_and_safety', tag:'Policy',     color:'text-green-400',  bg:'bg-green-500/10' },
          { label:'Tax Deadlines',   icon:'receipt_long',      tag:'Tax',        color:'text-amber-400',  bg:'bg-amber-500/10' },
          { label:'EMI Reminders',   icon:'payments',          tag:'EMI',        color:'text-blue-400',   bg:'bg-blue-500/10' },
          { label:'Investments',     icon:'trending_up',       tag:'Investment', color:'text-purple-400', bg:'bg-purple-500/10' },
        ].map(k => (
          <button key={k.tag} onClick={() => setTag(tag === k.tag ? 'All' : k.tag)}
            className={`card p-5 text-left transition-all hover:shadow-md ${tag === k.tag ? 'ring-2 ring-accent' : ''}`}>
            <div className={`p-2.5 rounded-xl w-fit mb-3 ${k.bg}`}>
              <span className={`material-symbols-outlined ${k.color}`}>{k.icon}</span>
            </div>
            <p className="text-text-muted text-xs font-semibold">{k.label}</p>
            <p className={`text-2xl font-bold mt-1 ${k.color}`}>{list.filter(n=>n.tag===k.tag).length}</p>
            <p className="text-xs text-text-muted mt-1">{list.filter(n=>n.tag===k.tag&&!n.read).length} unread</p>
          </button>
        ))}
      </div>

      <div className="flex gap-2 flex-wrap items-center">
        {NOTIF_TAGS.map(t => (
          <button key={t} onClick={() => setTag(t)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${tag===t ? 'bg-accent text-white' : 'bg-surface border border-border text-text-muted hover:text-text'}`}>
            {t}{t!=='All'&&` (${list.filter(n=>n.tag===t).length})`}
          </button>
        ))}
        {unread > 0 && <span className="ml-auto px-3 py-1.5 rounded-xl text-xs font-semibold bg-red-500/20 text-red-400">{unread} unread</span>}
      </div>

      <div className="card overflow-hidden">
        <div className="divide-y divide-border">
          {filtered.length === 0
            ? <div className="py-12 text-center text-text-muted text-sm">No notifications.</div>
            : filtered.map(n => (
              <div key={n.id} className={`px-6 py-5 flex items-start gap-4 hover:bg-surface/50 transition-colors ${!n.read ? 'bg-accent/[0.02]' : 'opacity-75'}`}>
                <div className={`p-2.5 rounded-xl shrink-0 ${n.color.split(' ')[1]}`}>
                  <span className={`material-symbols-outlined ${n.color.split(' ')[0]}`}>{n.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-accent text-sm">{n.title}</p>
                        {!n.read && <span className="w-2 h-2 rounded-full bg-secondary shrink-0" />}
                      </div>
                      <p className="text-sm text-text-muted mt-1 leading-relaxed">{n.desc}</p>
                      <p className="text-xs text-text-muted mt-2">{n.time}</p>
                    </div>
                    {!n.read && (
                      <button onClick={() => markRead(n.id)} className="text-xs text-secondary hover:underline font-semibold shrink-0">
                        Mark read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
}

// ── MAIN DASHBOARD ────────────────────────────────────────────────────────────
const TABS = [
  { key: 'overview',      label: 'Overview',      icon: 'dashboard' },
  { key: 'services',      label: 'Services',      icon: 'hub' },
  { key: 'proposals',     label: 'Proposals & Pay', icon: 'payments' },
  { key: 'appointments',  label: 'Consultations', icon: 'video_call' },
  { key: 'documents',     label: 'Documents',     icon: 'folder_open' },
  { key: 'notifications', label: 'Notifications', icon: 'notifications' },
];

export default function ClientDashboard() {
  const { user } = useAuth();

  const [activeTab,     setActiveTab]     = useState('overview');
  const [profile,       setProfile]       = useState(null);
  const [summary,       setSummary]       = useState(null);
  const [loans,         setLoans]         = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [proposals,     setProposals]     = useState([]);
  const [invoices,      setInvoices]      = useState([]);
  const [payments,      setPayments]      = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState('');

  const pendingPayments = invoices.filter(i => i.status === 'sent').length;
  const pendingProposals = proposals.filter(p => p.status === 'sent').length;
  const pendingAppts    = consultations.filter(c => c.status === 'pending').length;
  const unreadNotifs    = NOTIF_DATA.filter(n => !n.read).length;

  const fetchAll = async () => {
    try {
      setLoading(true); setError('');
      const profileRes = await api.get('/financial-profile');
      if (profileRes.data?.status === 'success') {
        setProfile(profileRes.data.data);
        const results = await Promise.allSettled([
          api.get('/investments/summary'),
          api.get('/loans'),
          api.get('/consultations'),
          api.get('/proposals'),
          api.get('/invoices'),
          api.get('/payments'),
          api.get('/notifications'),
        ]);
        const [sumR, lnR, conR, propR, invR, payR, notifR] = results;
        if (sumR.status==='fulfilled')   setSummary(sumR.value.data?.data);
        if (lnR.status==='fulfilled')    setLoans(lnR.value.data?.data || []);
        if (conR.status==='fulfilled')   setConsultations(conR.value.data?.data || []);
        if (propR.status==='fulfilled')  setProposals(propR.value.data?.proposals || []);
        if (invR.status==='fulfilled')   setInvoices(invR.value.data?.invoices || []);
        if (payR.status==='fulfilled')   setPayments(payR.value.data?.payments || []);
        if (notifR.status==='fulfilled') setNotifications(notifR.value.data?.notifications || []);
      }
    } catch (err) {
      if (err.response?.status === 404) setProfile(null);
      else setError(err.response?.data?.message || 'Failed to load dashboard');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  if (loading) return (
    <ClientLayout>
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
        <p className="text-text-muted mt-4 font-semibold">Loading your dashboard...</p>
      </div>
    </ClientLayout>
  );

  if (error) return (
    <ClientLayout>
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
        <span className="material-symbols-outlined text-5xl text-red-400 mb-4">error</span>
        <h3 className="text-xl font-bold text-accent">Failed to Load Dashboard</h3>
        <p className="text-text-muted mt-2">{error}</p>
        <button onClick={fetchAll} className="btn-primary mt-6 px-6 py-3">Retry</button>
      </div>
    </ClientLayout>
  );

  if (!profile) return (
    <ClientLayout>
      <div className="max-w-xl mx-auto text-center py-16 space-y-6">
        <div className="w-20 h-20 bg-amber-500/10 border border-amber-500/25 text-amber-400 rounded-full flex items-center justify-center mx-auto">
          <span className="material-symbols-outlined text-4xl">warning</span>
        </div>
        <h1 className="text-2xl font-bold text-accent">Complete Your Financial Profile</h1>
        <p className="text-text-muted">Set up your financial assessment to unlock all dashboard features, get your health score, and start your advisor journey.</p>
        <Link to="/client/financial-profile">
          <button className="btn-primary mt-4 py-3 px-8 text-lg font-bold">Begin Financial Assessment</button>
        </Link>
      </div>
    </ClientLayout>
  );

  const metrics = getHealthMetrics(profile, summary);

  return (
    <ClientLayout>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-headline-lg font-bold text-accent">
            Welcome back, <span className="text-secondary">{user?.name?.split(' ')[0] || 'Client'}</span>
          </h1>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            <p className="text-text-muted text-sm">
              Health Score: <span className={`font-bold ${metrics.score >= 85 ? 'text-green-400' : metrics.score >= 70 ? 'text-accent' : 'text-amber-400'}`}>{metrics.score}/100</span>
              {' '}· {metrics.overallStanding}
            </p>
            {pendingProposals > 0 && <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-xs font-semibold">{pendingProposals} proposal{pendingProposals > 1 ? 's' : ''} to review</span>}
            {pendingPayments > 0  && <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold">{pendingPayments} payment{pendingPayments > 1 ? 's' : ''} due</span>}
            {unreadNotifs > 0     && <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-xs font-semibold">{unreadNotifs} alerts</span>}
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={() => downloadPDFReport(profile, summary, loans, user)}
            className="btn-ghost text-sm px-4 py-2.5 flex items-center gap-2">
            <span className="material-symbols-outlined text-base">download</span> PDF Report
          </button>
          <Link to="/client/financial-profile">
            <button className="btn-primary text-sm px-4 py-2.5 flex items-center gap-2">
              <span className="material-symbols-outlined text-base">edit</span> Update Profile
            </button>
          </Link>
        </div>
      </div>

      {/* Tab Nav */}
      <div className="flex flex-wrap gap-1 border-b border-border">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-t-xl text-sm font-semibold border-b-2 transition-all relative ${
              activeTab === t.key ? 'border-secondary text-accent bg-secondary/5' : 'border-transparent text-text-muted hover:text-text hover:bg-surface/50'
            }`}>
            <span className="material-symbols-outlined text-base">{t.icon}</span>
            {t.label}
            {t.key === 'proposals'     && (pendingProposals > 0 || pendingPayments > 0) && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-blue-500 text-white text-[10px] font-bold leading-none">
                {pendingProposals + pendingPayments}
              </span>
            )}
            {t.key === 'appointments'  && pendingAppts > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-bold leading-none">{pendingAppts}</span>
            )}
            {t.key === 'notifications' && unreadNotifs > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-bold leading-none">{unreadNotifs}</span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <OverviewTab user={user} profile={profile} summary={summary} loans={loans}
          consultations={consultations} proposals={proposals} invoices={invoices}
          payments={payments} onTabSwitch={setActiveTab} />
      )}
      {activeTab === 'services' && (
        <ServicesTab profile={profile} summary={summary} loans={loans} />
      )}
      {activeTab === 'proposals' && (
        <ProposalsPaymentsTab proposals={proposals} invoices={invoices} payments={payments} onRefetch={fetchAll} />
      )}
      {activeTab === 'appointments' && (
        <AppointmentsTab consultations={consultations} onRefetch={fetchAll} />
      )}
      {activeTab === 'documents' && (
        <DocumentsTab profile={profile} summary={summary} loans={loans} user={user} />
      )}
      {activeTab === 'notifications' && (
        <NotificationsTab liveNotifs={notifications} />
      )}
    </ClientLayout>
  );
}
