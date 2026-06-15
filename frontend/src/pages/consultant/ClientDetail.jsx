import ConsultantLayout from '../../layouts/ConsultantLayout';
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

const PRIORITY_COLOR = {
  hot:  'bg-error/15 text-error',
  warm: 'bg-warning/15 text-warning',
  cold: 'bg-secondary/15 text-secondary',
};

// Fallback profile view for leads from the pipeline that haven't been converted to clients yet.
function LeadDetail({ id }) {
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchLead = () => {
    api.get(`/leads/${id}`).then(r => setLead(r.data.lead)).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetchLead(); }, [id]);

  const addNote = async () => {
    if (!note.trim()) return;
    try {
      setSaving(true);
      await api.post(`/leads/${id}/note`, { text: note });
      setNote('');
      fetchLead();
    } catch { toast.error('Failed to add note'); }
    finally { setSaving(false); }
  };

  if (loading) {
    return <ConsultantLayout><div className="py-24 text-center text-text-muted">Loading lead...</div></ConsultantLayout>;
  }
  if (!lead) {
    return <ConsultantLayout><div className="py-24 text-center text-text-muted">Lead not found.</div></ConsultantLayout>;
  }

  return (
    <ConsultantLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-label-lg text-text-muted">
            <Link to="/consultant/clients" className="hover:text-accent transition-colors">My Clients</Link>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            <span className="text-accent font-bold">Lead Profile</span>
          </div>
          <h1 className="text-headline-lg font-bold text-accent mt-2">{lead.name}</h1>
          <p className="text-body-md text-text-muted mt-1 capitalize">{lead.serviceType || lead.department || 'General Inquiry'} • Lead #{lead.leadId}</p>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-gutter">
        <div className="col-span-12 lg:col-span-4 space-y-gutter">
          <div className="card p-8 flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full bg-accent-container flex items-center justify-center text-on-primary font-black text-4xl shadow-md border-4 border-surface mb-4">
              {lead.name[0]}
            </div>
            <h2 className="text-headline-md font-bold text-accent">{lead.name}</h2>
            <span className={`status-badge mt-3 capitalize ${PRIORITY_COLOR[lead.priority] || 'status-info'}`}>{lead.priority} priority</span>

            <div className="w-full mt-6 pt-6 border-t border-border/40 space-y-3 text-left">
              <div className="flex items-center gap-3 text-body-sm text-text-muted">
                <span className="material-symbols-outlined text-text-faint text-base">mail</span>
                <span>{lead.email}</span>
              </div>
              <div className="flex items-center gap-3 text-body-sm text-text-muted">
                <span className="material-symbols-outlined text-text-faint text-base">call</span>
                <span>{lead.phone || '—'}</span>
              </div>
              <div className="flex items-center gap-3 text-body-sm text-text-muted">
                <span className="material-symbols-outlined text-text-faint text-base">category</span>
                <span>Service: <strong className="capitalize">{lead.serviceType || lead.department || '—'}</strong></span>
              </div>
              <div className="flex items-center gap-3 text-body-sm text-text-muted">
                <span className="material-symbols-outlined text-text-faint text-base">payments</span>
                <span>Budget: <strong>{lead.budget ? `₹${Number(lead.budget).toLocaleString('en-IN')}` : '—'}</strong></span>
              </div>
              <div className="flex items-center gap-3 text-body-sm text-text-muted">
                <span className="material-symbols-outlined text-text-faint text-base">flag</span>
                <span>Status: <strong className="capitalize">{lead.status}</strong></span>
              </div>
              {lead.assignedConsultant && (
                <div className="flex items-center gap-3 text-body-sm text-text-muted">
                  <span className="material-symbols-outlined text-text-faint text-base">support_agent</span>
                  <span>Advisor: <strong>{lead.assignedConsultant.name}</strong></span>
                </div>
              )}
            </div>
          </div>

          <div className="card p-8 flex flex-col items-center">
            <h3 className="text-label-lg font-bold text-text-muted uppercase tracking-wider mb-6">Lead Score</h3>
            <div className="relative w-40 h-40 flex items-center justify-center shrink-0">
              <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" fill="none" r="15.915" stroke="#e6e8ec" strokeWidth="4" />
                <circle
                  cx="18"
                  cy="18"
                  fill="none"
                  r="15.915"
                  stroke={lead.score >= 65 ? '#1F9D6B' : '#785a02'}
                  strokeDasharray={`${lead.score} ${100 - lead.score}`}
                  strokeWidth="4"
                />
              </svg>
              <div className="absolute inset-3 bg-surface rounded-full flex flex-col items-center justify-center shadow-inner">
                <span className="text-4xl font-black text-accent">{lead.score}</span>
                <span className="text-label-xs text-text-muted font-bold uppercase mt-1">Score</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-8 space-y-gutter">
          <div className="card p-8 space-y-4">
            <h3 className="text-headline-md font-bold text-accent">Requirement</h3>
            <p className="text-body-md text-text-muted">{lead.requirement || 'No requirement details provided.'}</p>
          </div>

          <div className="card p-8 space-y-4">
            <h3 className="text-headline-md font-bold text-accent">Notes</h3>
            <div className="divide-y divide-outline-variant/30">
              {(lead.notes || []).length === 0 && <p className="text-body-sm text-text-muted">No notes yet.</p>}
              {(lead.notes || []).map((n, i) => (
                <div key={i} className="py-3">
                  <p className="text-body-sm text-text">{n.text}</p>
                  <p className="text-xs text-text-muted mt-1">— {n.addedBy} · {new Date(n.addedAt).toLocaleString()}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={note} onChange={e => setNote(e.target.value)} onKeyDown={e => e.key === 'Enter' && addNote()}
                placeholder="Add a note..." className="form-input flex-1" />
              <button onClick={addNote} disabled={saving} className="btn-primary px-4">Add</button>
            </div>
          </div>
        </div>
      </div>
    </ConsultantLayout>
  );
}

const clientsMockData = {
  vance: {
    name: 'Alexander Vance',
    company: 'Vance Corporation Ltd.',
    email: 'a.vance@corporation.com',
    tel: '+1 (555) 123-4567',
    tier: 'Platinum',
    since: 'Jan 2021',
    aum: '$1.28M',
    healthScore: 82,
    riskProfile: 'Moderate-Aggressive',
    notes: 'Prioritize commercial real estate mortgage refinancing. Client is highly receptive to portfolio asset-backed credit options to secure working capital. Review tax deductions for business vehicle write-offs in Q4.',
    loans: [
      { id: 'LN-20241001', type: 'Business Term Loan', amount: '$250,000', balance: '$182,500', rate: '7.5%', due: 'Nov 01, 2024', status: 'Active', statusClass: 'status-success' },
      { id: 'LN-20240815', type: 'Commercial Mortgage', amount: '$1,200,000', balance: '$1,080,000', rate: '6.2%', due: 'Nov 15, 2024', status: 'Active', statusClass: 'status-success' },
      { id: 'LN-20231201', type: 'Equipment Financing', amount: '$85,000', balance: '$12,400', rate: '8.1%', due: 'Jan 01, 2025', status: 'Closing Soon', statusClass: 'status-warning' },
    ],
    assets: [
      { label: 'US Equities', val: '$665,600', pct: 52 },
      { label: 'Intl. Equities', val: '$192,000', pct: 15 },
      { label: 'Fixed Income Bonds', val: '$230,400', pct: 18 },
      { label: 'Cash Alternatives', val: '$192,000', pct: 15 },
    ],
    taxes: {
      grossIncome: '$514,200',
      deductions: '$106,750',
      taxableIncome: '$407,450',
      liability: '$124,104',
      effectiveRate: '24.1%',
    },
    meetings: [
      { name: 'Tax Strategy Session', advisor: 'Sarah Jenkins', date: 'Oct 24, 2024', status: 'Completed', statusClass: 'status-success' },
      { name: 'Portfolio Diversification', advisor: 'Michael Aris', date: 'Oct 12, 2024', status: 'Upcoming', statusClass: 'status-warning' },
      { name: 'Quarterly Loan Review', advisor: 'Elena Rossi', date: 'Oct 08, 2024', status: 'Completed', statusClass: 'status-success' },
    ]
  },
  harrington: {
    name: 'James Harrington',
    company: 'Harrington Innovations LLC',
    email: 'j.harrington@harrington.com',
    tel: '+1 (555) 345-6789',
    tier: 'Platinum',
    since: 'Jan 2021',
    aum: '$4.2M',
    healthScore: 92,
    riskProfile: 'Growth-Focused',
    notes: 'James has significant liquidity reserves. Strong health rating. Recommend transferring standard treasury funds into High-Yield Corporate Bonds to boost returns. Client is considering estate transition planning next fiscal year.',
    loans: [
      { id: 'LN-20230510', type: 'Commercial Real Estate', amount: '$2,500,000', balance: '$1,950,000', rate: '5.8%', due: 'Dec 10, 2024', status: 'Active', statusClass: 'status-success' },
    ],
    assets: [
      { label: 'US Equities', val: '$2,520,000', pct: 60 },
      { label: 'Intl. Equities', val: '$840,000', pct: 20 },
      { label: 'Fixed Income Bonds', val: '$420,000', pct: 10 },
      { label: 'Cash Alternatives', val: '$420,000', pct: 10 },
    ],
    taxes: {
      grossIncome: '$1,450,000',
      deductions: '$280,000',
      taxableIncome: '$1,170,000',
      liability: '$390,000',
      effectiveRate: '33.3%',
    },
    meetings: [
      { name: 'Advisory Review H2', advisor: 'Michael Aris', date: 'Nov 12, 2024', status: 'Upcoming', statusClass: 'status-warning' },
      { name: 'Tax Compliance Review', advisor: 'Sarah Jenkins', date: 'Sep 02, 2024', status: 'Completed', statusClass: 'status-success' },
    ]
  },
  mitchell: {
    name: 'Sarah Mitchell',
    company: 'Meridian Capital Group',
    email: 's.mitchell@meridian.com',
    tel: '+1 (555) 765-4321',
    tier: 'Platinum',
    since: 'Mar 2020',
    aum: '$8.7M',
    healthScore: 87,
    riskProfile: 'Conservative-Moderate',
    notes: 'Focus on municipal bond allocations. Sarah desires tax-free income streams. Keep cash reserves high to support potential real estate acquisitions. Reviewing S-Corp tax structure in Q3 filings.',
    loans: [],
    assets: [
      { label: 'US Equities', val: '$3,480,000', pct: 40 },
      { label: 'Intl. Equities', val: '$1,740,000', pct: 20 },
      { label: 'Fixed Income Bonds', val: '$2,610,000', pct: 30 },
      { label: 'Cash Alternatives', val: '$870,000', pct: 10 },
    ],
    taxes: {
      grossIncome: '$2,200,000',
      deductions: '$480,000',
      taxableIncome: '$1,720,000',
      liability: '$550,400',
      effectiveRate: '32.0%',
    },
    meetings: [
      { name: 'Estates & Trusts Briefing', advisor: 'James Vance', date: 'Dec 05, 2024', status: 'Upcoming', statusClass: 'status-warning' },
      { name: 'Advisory Review H1', advisor: 'Michael Aris', date: 'Jul 15, 2024', status: 'Completed', statusClass: 'status-success' },
    ]
  }
};

export default function ClientDetail() {
  const { id } = useParams();

  // Mongo ObjectIds (leads / real clients) get their own profile view
  const isMockClient = id && !!clientsMockData[id.toLowerCase()];
  if (id && !isMockClient && /^[a-f0-9]{24}$/i.test(id)) {
    return <LeadDetail id={id} />;
  }

  // Default to vance if param is not matched
  const clientKey = isMockClient ? id.toLowerCase() : 'vance';
  const client = clientsMockData[clientKey];

  const [activeTab, setActiveTab] = useState('overview');
  const [notesText, setNotesText] = useState(client.notes);
  const [saveStatus, setSaveStatus] = useState('Save Changes');

  const handleSaveNotes = () => {
    setSaveStatus('Saving...');
    setTimeout(() => {
      client.notes = notesText;
      setSaveStatus('Changes Saved!');
      setTimeout(() => setSaveStatus('Save Changes'), 1500);
    }, 1000);
  };

  return (
    <ConsultantLayout>
      {/* Breadcrumb Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-label-lg text-text-muted">
            <Link to="/consultant/clients" className="hover:text-accent transition-colors">My Clients</Link>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            <span className="text-accent font-bold">Client 360° Profile</span>
          </div>
          <h1 className="text-headline-lg font-bold text-accent mt-2">{client.name}</h1>
          <p className="text-body-md text-text-muted mt-1">{client.company} • Joined {client.since}</p>
        </div>
        <div className="flex gap-3">
          <button className="btn-primary flex items-center gap-2">
            <span className="material-symbols-outlined text-base">video_call</span>
            Start Consultation
          </button>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-12 gap-gutter">
        {/* Left Column: Client Summary & Health Ring */}
        <div className="col-span-12 lg:col-span-4 space-y-gutter">
          {/* Profile Card */}
          <div className="card p-8 flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full bg-accent-container flex items-center justify-center text-on-primary font-black text-4xl shadow-md border-4 border-surface mb-4">
              {client.name[0]}
            </div>
            <h2 className="text-headline-md font-bold text-accent">{client.name}</h2>
            <p className="text-body-sm text-text-muted mt-1">{client.tier} Account Tier</p>
            <span className="status-badge status-success mt-3">Active Relationship</span>

            <div className="w-full mt-6 pt-6 border-t border-border/40 space-y-3 text-left">
              <div className="flex items-center gap-3 text-body-sm text-text-muted">
                <span className="material-symbols-outlined text-text-faint text-base">mail</span>
                <span>{client.email}</span>
              </div>
              <div className="flex items-center gap-3 text-body-sm text-text-muted">
                <span className="material-symbols-outlined text-text-faint text-base">call</span>
                <span>{client.tel}</span>
              </div>
              <div className="flex items-center gap-3 text-body-sm text-text-muted">
                <span className="material-symbols-outlined text-text-faint text-base">pie_chart</span>
                <span>Advisory AUM: <strong>{client.aum}</strong></span>
              </div>
              <div className="flex items-center gap-3 text-body-sm text-text-muted">
                <span className="material-symbols-outlined text-text-faint text-base">tune</span>
                <span>Risk tolerance: <strong>{client.riskProfile}</strong></span>
              </div>
            </div>
          </div>

          {/* Health Score Card */}
          <div className="card p-8 flex flex-col items-center">
            <h3 className="text-label-lg font-bold text-text-muted uppercase tracking-wider mb-6">Financial Health Score</h3>
            
            <div className="relative w-40 h-40 flex items-center justify-center shrink-0">
              <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" fill="none" r="15.915" stroke="#e6e8ec" strokeWidth="4" />
                <circle 
                  cx="18" 
                  cy="18" 
                  fill="none" 
                  r="15.915" 
                  stroke={client.healthScore >= 90 ? '#1F9D6B' : '#785a02'} 
                  strokeDasharray={`${client.healthScore} ${100 - client.healthScore}`} 
                  strokeWidth="4" 
                />
              </svg>
              <div className="absolute inset-3 bg-surface rounded-full flex flex-col items-center justify-center shadow-inner">
                <span className="text-4xl font-black text-accent">{client.healthScore}</span>
                <span className="text-label-xs text-text-muted font-bold uppercase mt-1">Health Score</span>
              </div>
            </div>

            <p className="text-xs text-text-muted mt-6 text-center font-medium">
              Score is computed based on assets, liquidity indexes, debt levels, and tax status.
            </p>
          </div>
        </div>

        {/* Right Column: Tabbed Workspace */}
        <div className="col-span-12 lg:col-span-8 space-y-gutter">
          {/* Tabs Navigation */}
          <div className="card overflow-hidden">
            <div className="flex border-b border-border/40 overflow-x-auto bg-surface-hover-lowest">
              {[
                { id: 'overview', label: 'Overview', icon: 'visibility' },
                { id: 'loans', label: 'Loans & Credit', icon: 'payments' },
                { id: 'investments', label: 'Investments', icon: 'trending_up' },
                { id: 'taxes', label: 'Tax Position', icon: 'receipt_long' },
                { id: 'notes', label: 'Advisor Notes & History', icon: 'sticky_note_2' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-4 text-label-lg font-semibold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-secondary text-accent font-bold bg-surface'
                      : 'border-transparent text-text-muted hover:text-accent'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-8">
              {/* TAB: Overview */}
              {activeTab === 'overview' && (
                <div className="space-y-6 fade-in">
                  <h3 className="text-headline-md font-bold text-accent">Relationship Financial Summary</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-5 rounded-xl border border-border/40 space-y-4">
                      <h4 className="font-bold text-accent">Balance Sheet Overview</h4>
                      <div className="flex justify-between items-center text-body-sm">
                        <span className="text-text-muted">Asset Class Valuation</span>
                        <span className="font-semibold text-accent">{client.aum}</span>
                      </div>
                      <div className="flex justify-between items-center text-body-sm border-t border-border pt-2">
                        <span className="text-text-muted">Active Loans Outstanding</span>
                        <span className="font-semibold text-accent">
                          ${client.loans.reduce((sum, item) => sum + parseInt(item.balance.replace(/[^0-9]/g, '')), 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-body-sm border-t border-border pt-2">
                        <span className="text-text-muted">Risk Suitability Rank</span>
                        <span className="font-bold text-secondary">{client.riskProfile}</span>
                      </div>
                    </div>

                    <div className="p-5 rounded-xl border border-border/40 space-y-4">
                      <h4 className="font-bold text-accent">Tax Position Summary</h4>
                      <div className="flex justify-between items-center text-body-sm">
                        <span className="text-text-muted">Gross Income Estimate</span>
                        <span className="font-semibold text-accent">{client.taxes.grossIncome}</span>
                      </div>
                      <div className="flex justify-between items-center text-body-sm border-t border-border pt-2">
                        <span className="text-text-muted">Applied Write-offs</span>
                        <span className="font-semibold text-accent">{client.taxes.deductions}</span>
                      </div>
                      <div className="flex justify-between items-center text-body-sm border-t border-border pt-2">
                        <span className="text-text-muted">Effective Tax Rate</span>
                        <span className="font-bold text-error">{client.taxes.effectiveRate}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 rounded-xl border border-primary/20 bg-accent/5">
                    <h4 className="font-bold text-accent mb-2">Private Advisor Digest</h4>
                    <p className="text-body-sm text-accent-container leading-relaxed">{notesText}</p>
                  </div>
                </div>
              )}

              {/* TAB: Loans */}
              {activeTab === 'loans' && (
                <div className="space-y-6 fade-in">
                  <h3 className="text-headline-md font-bold text-accent">Active Debt & Liabilities</h3>
                  {client.loans.length === 0 ? (
                    <p className="text-body-md text-text-muted">Client has no active loan accounts on the platform.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-surface text-label-lg text-text-muted uppercase tracking-wider">
                            <th className="px-4 py-3 text-left">Loan ID</th>
                            <th className="px-4 py-3 text-left">Category</th>
                            <th className="px-4 py-3 text-right">Principal</th>
                            <th className="px-4 py-3 text-right">Balance</th>
                            <th className="px-4 py-3 text-right">Rate</th>
                            <th className="px-4 py-3 text-left">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant/35 text-body-sm text-text">
                          {client.loans.map((loan) => (
                            <tr key={loan.id} className="hover:bg-surface/20 transition-colors">
                              <td className="px-4 py-3 font-mono font-bold text-accent">{loan.id}</td>
                              <td className="px-4 py-3">{loan.type}</td>
                              <td className="px-4 py-3 text-right font-semibold">{loan.amount}</td>
                              <td className="px-4 py-3 text-right">{loan.balance}</td>
                              <td className="px-4 py-3 text-right">{loan.rate}</td>
                              <td className="px-4 py-3">
                                <span className={`status-badge ${loan.statusClass}`}>{loan.status}</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* TAB: Investments */}
              {activeTab === 'investments' && (
                <div className="space-y-6 fade-in">
                  <h3 className="text-headline-md font-bold text-accent">Asset Allocation & Weights</h3>
                  <div className="space-y-4">
                    {client.assets.map((ast) => (
                      <div key={ast.label}>
                        <div className="flex justify-between items-center text-body-sm mb-1">
                          <span className="font-semibold text-accent">{ast.label}</span>
                          <span className="font-bold text-accent">{ast.val} <span className="text-xs text-text-muted font-normal">({ast.pct}%)</span></span>
                        </div>
                        <div className="h-2 bg-surface-hover-high rounded-full overflow-hidden">
                          <div className="h-full bg-accent rounded-full" style={{ width: `${ast.pct}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB: Taxes */}
              {activeTab === 'taxes' && (
                <div className="space-y-6 fade-in">
                  <h3 className="text-headline-md font-bold text-accent">Tax Position Breakdown</h3>
                  <div className="space-y-4 bg-surface p-6 rounded-xl border border-border/40">
                    {[
                      { label: 'Gross Annual Earnings', val: client.taxes.grossIncome },
                      { label: 'Deductions Applied', val: client.taxes.deductions },
                      { label: 'Net Taxable Income', val: client.taxes.taxableIncome },
                      { label: 'Estimated Tax Liability', val: client.taxes.liability },
                      { label: 'Effective Rate', val: client.taxes.effectiveRate },
                    ].map((row, i) => (
                      <div key={i} className="flex justify-between items-center text-body-md py-2 border-b border-border last:border-0 last:pb-0">
                        <span className="text-text-muted font-medium">{row.label}</span>
                        <span className="font-bold text-accent">{row.val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB: Notes & History */}
              {activeTab === 'notes' && (
                <div className="space-y-6 fade-in">
                  {/* Private Notes Editor */}
                  <div className="space-y-3">
                    <label className="text-label-lg font-bold text-accent block">Private Case Notes</label>
                    <textarea
                      value={notesText}
                      onChange={(e) => setNotesText(e.target.value)}
                      className="form-input min-h-[150px] resize-none leading-relaxed text-body-md text-accent font-medium"
                      placeholder="Enter specific advisor notes, targets, actions..."
                    />
                    <div className="flex justify-end">
                      <button 
                        onClick={handleSaveNotes}
                        className="btn-primary"
                      >
                        {saveStatus}
                      </button>
                    </div>
                  </div>

                  {/* Consultation History */}
                  <div className="space-y-4 pt-6 border-t border-border/40">
                    <label className="text-label-lg font-bold text-accent block">Consultation History Log</label>
                    <div className="divide-y divide-outline-variant/30">
                      {client.meetings.map((meeting, i) => (
                        <div key={i} className="py-3.5 flex justify-between items-center">
                          <div>
                            <h4 className="font-bold text-accent text-body-md">{meeting.name}</h4>
                            <p className="text-xs text-text-muted">with {meeting.advisor} • {meeting.date}</p>
                          </div>
                          <span className={`status-badge ${meeting.statusClass}`}>{meeting.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ConsultantLayout>
  );
}
