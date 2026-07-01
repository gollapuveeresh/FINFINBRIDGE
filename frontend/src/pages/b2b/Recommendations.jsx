import { useEffect, useState } from 'react';
import B2BLayout from '../../layouts/B2BLayout';
import { useB2BAuth } from '../../context/B2BAuthContext';
import b2bApi from '../../services/b2bApi';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  pending: 'bg-blue-500/15 text-blue-400 border border-blue-500/20',
  approved: 'bg-green-500/15 text-green-400 border border-green-500/20',
  changes_requested: 'bg-amber-500/15 text-amber-400 border border-amber-500/20',
  rejected: 'bg-red-500/15 text-red-400 border border-red-500/20',
};

export default function B2BRecommendations() {
  const { company } = useB2BAuth();
  const orgId = company?.organizationId;
  
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [decidingId, setDecidingId] = useState(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  const fetchRecs = async () => {
    if (!orgId) return;
    try {
      setLoading(true);
      const res = await b2bApi.get(`/b2b/organizations/${orgId}/recommendations`);
      setRecommendations(res.data || []);
    } catch {
      toast.error('Failed to load recommendations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecs();
  }, [orgId]);

  const handleDecision = async (id, decision, feedback = '') => {
    try {
      await b2bApi.patch(`/b2b/recommendations/${id}/decision`, {
        decision,
        feedback
      });
      toast.success(`Recommendation ${decision === 'Approved' ? 'Approved!' : 'Changes Requested'}`);
      setShowFeedbackModal(false);
      setFeedbackText('');
      setDecidingId(null);
      fetchRecs();
    } catch {
      toast.error('Failed to save decision');
    }
  };

  const parseRecData = (dataStr) => {
    try {
      return JSON.parse(dataStr);
    } catch {
      return [];
    }
  };

  return (
    <B2BLayout>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold text-accent">Personalized Recommendations</h1>
          <p className="text-text-muted text-sm mt-1">Review and approve customized financial plans tailored to your profile</p>
        </div>

        {loading ? (
          <div className="py-24 text-center text-text-muted flex flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-full border-4 border-accent/20 border-t-accent animate-spin" />
            <p className="text-sm font-semibold">Loading recommendations...</p>
          </div>
        ) : recommendations.length === 0 ? (
          <div className="card py-20 text-center flex flex-col items-center justify-center">
            <span className="material-symbols-outlined text-5xl text-text-muted opacity-30">recommend</span>
            <h3 className="font-bold text-accent mt-4 text-lg">No recommendations generated yet</h3>
            <p className="text-text-muted max-w-sm mt-2 text-sm">
              Your advisor will generate personalized recommendations once your documents and eligibility are verified.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {recommendations.map((rec) => {
              const items = parseRecData(rec.recommendationData);
              return (
                <div key={rec.id} className="card p-6 border border-border/40 hover:border-accent/40 bg-surface/50 transition-all duration-300">
                  {/* Header Row */}
                  <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border/30 pb-4 mb-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider bg-[#D4AF37]/10 px-2 py-0.5 rounded border border-[#D4AF37]/20">
                          {rec.department} department
                        </span>
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full capitalize ${STATUS_COLORS[rec.status] || ''}`}>
                          {rec.status?.replace('_', ' ')}
                        </span>
                      </div>
                      <h2 className="text-lg font-bold text-accent mt-2">Case Advisory Plan</h2>
                      <p className="text-text-muted text-xs font-mono mt-0.5">Reference ID: {rec.caseId}</p>
                    </div>

                    {rec.status === 'pending' && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setDecidingId(rec.id);
                            setShowFeedbackModal(true);
                          }}
                          className="px-4 py-2 text-xs font-bold border border-amber-500/30 text-amber-400 hover:bg-amber-500/10 transition-all rounded-xl"
                        >
                          Request Changes
                        </button>
                        <button
                          onClick={() => handleDecision(rec.id, 'Approved')}
                          className="px-4 py-2 text-xs font-bold btn-primary rounded-xl"
                        >
                          Accept Plan
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Recommendation Details */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2.5">Suggested Products</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {items.map((item, idx) => (
                          <div key={item.id || idx} className="p-4 rounded-2xl bg-bg/50 border border-border/40 flex flex-col justify-between min-h-[140px]">
                            <div>
                              <p className="font-bold text-text text-sm truncate">{item.title}</p>
                              <p className="text-[10px] text-text-muted mt-0.5">{item.provider}</p>
                              <p className="text-xs text-text-muted leading-relaxed mt-2 line-clamp-3 italic">"{item.description}"</p>
                            </div>
                            <div className="mt-3 pt-3 border-t border-border/20 flex justify-between items-end">
                              <div>
                                <p className="text-[9px] text-text-muted uppercase font-bold tracking-wider">{item.metricName}</p>
                                <p className="text-sm font-bold text-secondary">{item.metricValue}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-[8px] text-text-muted truncate">{item.detail1}</p>
                                <p className="text-[8px] text-text-muted truncate mt-0.5">{item.detail2}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Notes Box */}
                    {rec.recommendationNotes && (
                      <div className="p-4 rounded-2xl bg-[#D4AF37]/5 border border-[#D4AF37]/15">
                        <h4 className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-sm">sticky_note_2</span>
                          Advisor Notes
                        </h4>
                        <p className="text-sm text-text-muted leading-relaxed whitespace-pre-wrap">{rec.recommendationNotes}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Request Changes feedback modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center px-4">
          <div className="bg-surface border border-border/40 rounded-3xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-bold text-accent mb-1">Request Changes</h3>
            <p className="text-xs text-text-muted mb-4">Provide details on what you would like your advisor to modify in this recommendation.</p>
            
            <textarea
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              rows={4}
              className="w-full p-3 rounded-xl border border-border bg-bg text-sm text-text resize-none focus:outline-none focus:border-accent"
              placeholder="e.g. I prefer lower interest rates or longer tenure / higher amount..."
            />

            <div className="flex gap-3 mt-5">
              <button
                onClick={() => {
                  setShowFeedbackModal(false);
                  setFeedbackText('');
                  setDecidingId(null);
                }}
                className="flex-1 py-2.5 text-xs btn-ghost"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDecision(decidingId, 'Changes Requested', feedbackText)}
                disabled={!feedbackText.trim()}
                className="flex-1 py-2.5 text-xs font-bold border border-amber-500/40 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-all rounded-xl disabled:opacity-40"
              >
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}
    </B2BLayout>
  );
}
