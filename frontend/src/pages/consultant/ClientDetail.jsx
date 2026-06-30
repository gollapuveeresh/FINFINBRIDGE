import ConsultantLayout from '../../layouts/ConsultantLayout';
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

const PRIORITY_COLOR = {
  hot: 'bg-error/15 text-error',
  warm: 'bg-warning/15 text-warning',
  cold: 'bg-secondary/15 text-secondary',
};

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
    ],
    assets: [
      { label: 'US Equities', val: '$665,600', pct: 52 },
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
    assets: [],
    taxes: {
      grossIncome: '$1,450,000',
      deductions: '$280,000',
      taxableIncome: '$1,170,000',
      liability: '$390,000',
      effectiveRate: '33.3%',
    },
    meetings: []
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
    assets: [],
    taxes: {
      grossIncome: '$2,200,000',
      deductions: '$480,000',
      taxableIncome: '$1,720,000',
      liability: '$550,400',
      effectiveRate: '32.0%',
    },
    meetings: []
  }
};

export default function ClientDetail() {
  const { id } = useParams();

  const isMockClient = id && !!clientsMockData[id.toLowerCase()];
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  const fetchLead = () => {
    if (isMockClient) {
      setClient(clientsMockData[id.toLowerCase()]);
      setLoading(false);
    } else {
      setLoading(true);
      api.get(`/leads/${id}`)
        .then(r => {
          const lead = r.data;
          if (lead) {
            const budgetVal = lead.budget || 0;
            const tierName = budgetVal >= 5000000 ? 'Platinum' : budgetVal >= 2000000 ? 'Gold' : 'Standard';
            setClient({
              id: lead.id || lead._id,
              name: lead.name,
              company: lead.name,
              email: lead.email,
              tel: lead.phone || '—',
              tier: tierName,
              since: new Date(lead.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }),
              aum: budgetVal ? `₹${Number(budgetVal).toLocaleString('en-IN')}` : '—',
              healthScore: lead.score || 70,
              riskProfile: lead.priority === 'hot' ? 'Aggressive' : lead.priority === 'warm' ? 'Moderate' : 'Conservative',
              notes: lead.requirement || 'No requirement details provided.',
              loans: [],
              assets: [],
              taxes: {
                grossIncome: lead.income ? `₹${Number(lead.income).toLocaleString('en-IN')}` : '—',
                deductions: lead.income ? `₹${Number(lead.income * 0.2).toLocaleString('en-IN')}` : '—',
                effectiveRate: lead.priority === 'hot' ? '25.0%' : '15.0%',
              },
              isDbClient: true,
              leadSource: lead.source,
              leadStatus: lead.status,
              dbNotes: lead.notes || [],
              convertedClientId: lead.convertedClientId,
              department: lead.department,
              selectedPackage: lead.selectedPackage,
              customRequirement: lead.customRequirement
            });
          }
        })
        .catch(() => {
          toast.error('Failed to load client profile');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  const [activeConsultation, setActiveConsultation] = useState(null);
  const [loadingConsultation, setLoadingConsultation] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [inputDate, setInputDate] = useState('');
  const [inputTime, setInputTime] = useState('');
  const [inputLink, setInputLink] = useState('');
  const [recordMeeting, setRecordMeeting] = useState(false);
  const [submittingSchedule, setSubmittingSchedule] = useState(false);
  const [submittingAction, setSubmittingAction] = useState(false);

  const fetchConsultation = (clientId, dept) => {
    if (!clientId) return;
    setLoadingConsultation(true);
    api.get('/consultations')
      .then(res => {
        const list = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        const found = list.find(c =>
          c.clientId &&
          c.clientId.id === clientId &&
          c.department?.toLowerCase() === dept?.toLowerCase()
        );
        setActiveConsultation(found || null);
        if (found) {
          setInputDate(found.confirmedDate || '');
          setInputTime(found.confirmedTime || '');
          setInputLink(found.meetingLink || '');
        }
      })
      .catch(err => {
        console.error('Failed to load consultation for client detail page:', err);
      })
      .finally(() => {
        setLoadingConsultation(false);
      });
  };

  useEffect(() => {
    if (client?.isDbClient && client?.convertedClientId) {
      fetchConsultation(client.convertedClientId, client.department);
    }
  }, [client?.convertedClientId, client?.department]);

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    if (!activeConsultation) return;
    if (!inputDate || !inputTime) {
      toast.error('Date and Time are required');
      return;
    }
    // Validation: No past dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(inputDate);
    selectedDate.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      toast.error('Cannot schedule a meeting for a past date.');
      return;
    }
    // Validation: Between 10:00 AM and 10:00 PM
    if (inputTime < '10:00' || inputTime > '22:00') {
      toast.error('Meetings can only be scheduled between 10:00 AM and 10:00 PM.');
      return;
    }
    setSubmittingSchedule(true);
    try {
      await api.patch(`/consultations/${activeConsultation.id}/schedule`, {
        confirmedDate: inputDate,
        confirmedTime: inputTime,
        meetingLink: inputLink || undefined,
        recordingEnabled: recordMeeting
      });
      toast.success('Consultation scheduled successfully!');
      setShowScheduleModal(false);
      fetchConsultation(client.convertedClientId, client.department);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to schedule consultation');
    } finally {
      setSubmittingSchedule(false);
    }
  };

  const handleSendToClient = async () => {
    if (!activeConsultation) return;
    setSubmittingAction(true);
    try {
      await api.patch(`/consultations/${activeConsultation.id}/send-to-client`);
      toast.success('Consultation details sent to client!');
      fetchConsultation(client.convertedClientId, client.department);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send details to client');
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleMarkCompleted = async () => {
    if (!activeConsultation) return;
    setSubmittingAction(true);
    try {
      await api.patch(`/consultations/${activeConsultation.id}/complete`);
      toast.success('Consultation marked as completed!');
      fetchConsultation(client.convertedClientId, client.department);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to complete consultation');
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleInitializeConsultation = async () => {
    if (!client?.convertedClientId) return;
    setSubmittingAction(true);
    try {
      await api.post('/consultations', {
        client: { id: client.convertedClientId },
        department: client.department,
        category: (client.department || 'loans').toUpperCase() + ' Consultation',
        status: 'pending'
      });
      toast.success('Consultation started successfully!');
      fetchConsultation(client.convertedClientId, client.department);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to start consultation');
    } finally {
      setSubmittingAction(false);
    }
  };

  useEffect(() => {
    fetchLead();
  }, [id, isMockClient]);

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    setSavingNote(true);
    try {
      if (client.isDbClient) {
        await api.post(`/leads/${id}/note`, { text: newNote });
        setNewNote('');
        toast.success('Note added successfully');
        // Refresh notes list dynamically
        const r = await api.get(`/leads/${id}`);
        const lead = r.data;
        if (lead) {
          setClient(prev => ({
            ...prev,
            dbNotes: lead.notes || []
          }));
        }
      } else {
        toast.success('Mock notes updated');
        setNewNote('');
      }
    } catch {
      toast.error('Failed to add note');
    } finally {
      setSavingNote(false);
    }
  };

  if (loading) {
    return (
      <ConsultantLayout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center">
          <div className="w-12 h-12 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-body-md text-text-muted mt-4 font-semibold">Loading client profile...</p>
        </div>
      </ConsultantLayout>
    );
  }

  if (!client) {
    return (
      <ConsultantLayout>
        <div className="py-24 text-center text-text-muted">Client profile not found.</div>
      </ConsultantLayout>
    );
  }

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
        <div className="flex flex-wrap items-center gap-3">
          {loadingConsultation ? (
            <p className="text-body-sm text-text-muted">Loading consultation...</p>
          ) : activeConsultation ? (
            <>
              {/* If pending or scheduled */}
              {(activeConsultation.status === 'pending' || activeConsultation.status === 'scheduled') && (
                <button
                  onClick={() => {
                    if (!inputLink) {
                      setInputLink(activeConsultation.meetingLink || `https://zoom.us/j/${Math.floor(1000000000 + Math.random() * 9000000000)}`);
                    }
                    setRecordMeeting(activeConsultation.recordingEnabled || false);
                    setShowScheduleModal(true);
                  }}
                  className="btn-primary flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-base">calendar_today</span>
                  {activeConsultation.status === 'scheduled' ? 'Reschedule Meeting' : 'Schedule Meeting'}
                </button>
              )}

              {/* If scheduled but not sent yet, show Send to Client */}
              {activeConsultation.status === 'scheduled' && (
                <button
                  onClick={handleSendToClient}
                  disabled={submittingAction}
                  className="btn-secondary flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-base">send</span>
                  {submittingAction ? 'Sending...' : 'Send to Client'}
                </button>
              )}

              {/* If accepted (sent to client) but not completed */}
              {activeConsultation.status === 'accepted' && (
                <button
                  onClick={handleMarkCompleted}
                  disabled={submittingAction}
                  className="btn-primary flex items-center gap-2 bg-success text-white"
                  style={{ backgroundColor: 'var(--color-status-success)' }}
                >
                  <span className="material-symbols-outlined text-base">check_circle</span>
                  {submittingAction ? 'Completing...' : 'Mark as Completed'}
                </button>
              )}

              {/* If completed_by_consultant */}
              {activeConsultation.status === 'completed_by_consultant' && (
                <span className="status-badge status-warning flex items-center gap-1">
                  <span className="material-symbols-outlined text-base">hourglass_empty</span>
                  Awaiting Verification
                </span>
              )}

              {/* If completed */}
              {activeConsultation.status === 'completed' && (
                <span className="status-badge status-success flex items-center gap-1">
                  <span className="material-symbols-outlined text-base">check_circle</span>
                  Completed & Verified
                </span>
              )}
            </>
          ) : client?.isDbClient && client?.convertedClientId ? (
            <button
              onClick={handleInitializeConsultation}
              disabled={submittingAction}
              className="btn-primary flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-base">video_call</span>
              {submittingAction ? 'Starting...' : 'Start Consultation'}
            </button>
          ) : (
            <span className="text-body-sm text-text-muted italic bg-surface-hover/30 px-3 py-1.5 rounded-lg border border-border">
              Convert lead to client to enable consultation
            </span>
          )}
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-12 gap-gutter mt-6">
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
              {client.selectedPackage && (
                <div className="flex items-center gap-3 text-body-sm text-[#D4AF37] font-semibold">
                  <span className="material-symbols-outlined text-[#D4AF37] text-base">workspace_premium</span>
                  <span>Package: <strong>{client.selectedPackage}</strong></span>
                </div>
              )}
              {client.selectedPackage === 'Custom Consultation Request' && client.customRequirement && (
                <div className="mt-1 p-3 rounded-xl border border-[#D4AF37]/20 bg-[#D4AF37]/5 text-body-sm text-[#D4AF37]">
                  <p className="font-semibold text-xs uppercase tracking-wider mb-1">Requirement Details:</p>
                  <p className="italic text-text-muted leading-relaxed font-normal">"{client.customRequirement}"</p>
                </div>
              )}
              {client.department && (
                <div className="flex items-center gap-3 text-body-sm text-text-muted">
                  <span className="material-symbols-outlined text-text-faint text-base">schema</span>
                  <span>Department: <strong className="capitalize">{client.department}</strong></span>
                </div>
              )}
            </div>
          </div>

          {/* Consultation Details Card */}
          {activeConsultation && (
            <div className="card p-8 space-y-4">
              <h3 className="text-label-lg font-bold text-text-muted uppercase tracking-wider">Consultation Details</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-accent mt-0.5">calendar_month</span>
                  <div>
                    <h4 className="text-body-sm font-bold text-accent">Date & Time</h4>
                    <p className="text-body-sm text-text mt-0.5">
                      {activeConsultation.confirmedDate && activeConsultation.confirmedTime ? (
                        `${activeConsultation.confirmedDate} @ ${activeConsultation.confirmedTime}`
                      ) : (
                        <span className="text-text-muted italic">Not scheduled yet</span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 border-t border-border/40 pt-3">
                  <span className="material-symbols-outlined text-accent mt-0.5">video_call</span>
                  <div>
                    <h4 className="text-body-sm font-bold text-accent">Zoom Link</h4>
                    {activeConsultation.meetingLink ? (
                      <a
                        href={activeConsultation.meetingLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-body-sm text-secondary hover:underline break-all block mt-0.5"
                      >
                        {activeConsultation.meetingLink}
                      </a>
                    ) : (
                      <p className="text-body-sm text-text-muted italic mt-0.5">Not available yet</p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3 border-t border-border/40 pt-3">
                  <span className="material-symbols-outlined text-accent mt-0.5">info</span>
                  <div>
                    <h4 className="text-body-sm font-bold text-accent">Status</h4>
                    <div className="mt-1">
                      <span className={`status-badge ${activeConsultation.status === 'pending' ? 'status-warning' :
                        activeConsultation.status === 'scheduled' ? 'status-info' :
                          activeConsultation.status === 'accepted' ? 'status-success' :
                            activeConsultation.status === 'completed_by_consultant' ? 'status-warning' :
                              'status-success'
                        }`}>
                        {activeConsultation.status === 'pending' && 'Pending Schedule'}
                        {activeConsultation.status === 'scheduled' && 'Scheduled (Draft)'}
                        {activeConsultation.status === 'accepted' && 'Confirmed (Sent)'}
                        {activeConsultation.status === 'completed_by_consultant' && 'Completed (Awaiting Admin)'}
                        {activeConsultation.status === 'completed' && 'Completed & Verified'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

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

        {/* Right Column: Overview Workspace */}
        <div className="col-span-12 lg:col-span-8 space-y-gutter">
          <div className="card p-8 space-y-6">
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
                    {client.isDbClient ? '—' : `$${client.loans.reduce((sum, item) => sum + parseInt(item.balance.replace(/[^0-9]/g, '')), 0).toLocaleString()}`}
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
                  <span className="text-text-muted">Applied Write-offs (Est.)</span>
                  <span className="font-semibold text-accent">{client.taxes.deductions}</span>
                </div>
                <div className="flex justify-between items-center text-body-sm border-t border-border pt-2">
                  <span className="text-text-muted">Effective Tax Rate (Est.)</span>
                  <span className="font-bold text-error">{client.taxes.effectiveRate}</span>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-xl border border-primary/20 bg-accent/5">
              <h4 className="font-bold text-accent mb-2">Private Advisor Digest (Requirement)</h4>
              <p className="text-body-sm text-accent-container leading-relaxed">{client.notes}</p>
            </div>
          </div>

          {/* Notes Section */}
          <div className="card p-8 space-y-6">
            <h3 className="text-headline-md font-bold text-accent">Advisor Notes & Timeline</h3>

            {/* Add Note Form */}
            <div className="space-y-3">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                rows={3}
                className="w-full p-3 rounded-xl border border-border bg-bg text-sm resize-none focus:outline-none focus:border-secondary"
                placeholder="Type a new advisor note or update timeline details..."
              />
              <div className="flex justify-end">
                <button
                  onClick={handleAddNote}
                  disabled={savingNote}
                  className="btn-primary px-5 py-2.5 text-xs font-bold"
                >
                  {savingNote ? 'Adding...' : 'Add Note'}
                </button>
              </div>
            </div>

            {/* Past Notes List */}
            <div className="divide-y divide-border/40 pt-4 border-t border-border/40">
              {client.isDbClient ? (
                client.dbNotes.length === 0 ? (
                  <p className="text-body-sm text-text-muted py-2">No notes added to this client yet.</p>
                ) : (
                  client.dbNotes.map((n, i) => (
                    <div key={i} className="py-4">
                      <p className="text-body-sm text-text font-medium">{n.text}</p>
                      <p className="text-xs text-text-muted mt-1.5 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">person</span>
                        {n.addedBy} · {new Date(n.addedAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                      </p>
                    </div>
                  ))
                )
              ) : (
                <div className="py-2">
                  <p className="text-body-sm text-text font-medium">{client.notes}</p>
                  <p className="text-xs text-text-muted mt-1.5 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">person</span>
                    Sarah Jenkins · Joined {client.since}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Schedule Modal */}
      {showScheduleModal && activeConsultation && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4">
          <div className="card w-full max-w-md p-8 bg-surface border border-border rounded-xl space-y-4 shadow-soft">
            <div className="flex justify-between items-center pb-2 border-b border-border">
              <h4 className="text-headline-md font-bold text-accent">Schedule Consultation</h4>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="text-text-muted hover:text-text cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleScheduleSubmit} className="space-y-4 pt-2">
              <div>
                <label className="text-xs font-bold text-text-muted block mb-1">Meeting Date</label>
                <input
                  type="date"
                  min={(() => {
                    const today = new Date();
                    const year = today.getFullYear();
                    const month = String(today.getMonth() + 1).padStart(2, '0');
                    const day = String(today.getDate()).padStart(2, '0');
                    return `${year}-${month}-${day}`;
                  })()}
                  value={inputDate}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (!val) {
                      setInputDate('');
                      return;
                    }
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const selected = new Date(val);
                    selected.setHours(0, 0, 0, 0);
                    if (selected < today) {
                      toast.error('Cannot select a past date.');
                      const year = today.getFullYear();
                      const month = String(today.getMonth() + 1).padStart(2, '0');
                      const day = String(today.getDate()).padStart(2, '0');
                      setInputDate(`${year}-${month}-${day}`);
                    } else {
                      setInputDate(val);
                    }
                  }}
                  className="form-input"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-text-muted block mb-1">Time Slot (10:00 AM - 10:00 PM)</label>
                <input
                  type="time"
                  min="10:00"
                  max="22:00"
                  value={inputTime}
                  onChange={(e) => setInputTime(e.target.value)}
                  className="form-input"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-text-muted block mb-1">Zoom Meeting Link</label>
                <input
                  type="url"
                  placeholder="e.g. https://zoom.us/j/1234567890"
                  value={inputLink}
                  onChange={(e) => setInputLink(e.target.value)}
                  className="form-input"
                />
                <p className="text-[11px] text-text-faint mt-1">Leave empty to auto-generate a random Zoom link on save.</p>
              </div>

              <div className="flex items-center gap-2 py-1">
                <input
                  type="checkbox"
                  id="recordMeetingDetail"
                  checked={recordMeeting}
                  onChange={(e) => setRecordMeeting(e.target.checked)}
                  className="w-4 h-4 rounded border-border text-secondary focus:ring-secondary bg-surface"
                />
                <label htmlFor="recordMeetingDetail" className="text-xs font-bold text-text-muted cursor-pointer select-none">
                  Enable Meeting Recording (Record this meeting)
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => { setShowScheduleModal(false); setRecordMeeting(false); }}
                  className="btn-ghost py-2 px-4 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingSchedule}
                  className="btn-primary py-2 px-5 text-xs font-bold"
                >
                  {submittingSchedule ? 'Saving...' : 'Save & Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </ConsultantLayout>
  );
}
