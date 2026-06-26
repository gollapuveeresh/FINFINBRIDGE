import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function RecommendationsModal({ department, onClose }) {
  const [step, setStep] = useState('select'); // 'select' or 'results'
  const [loadingContext, setLoadingContext] = useState(true);
  const [loadingRecs, setLoadingRecs] = useState(false);
  
  const [clients, setClients] = useState([]);
  const [leads, setLeads] = useState([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [selectedLead, setSelectedLead] = useState('');

  const [data, setData] = useState({ source: '', isLive: false, recommendations: [] });

  useEffect(() => {
    fetchContext();
  }, []);

  const fetchContext = async () => {
    try {
      setLoadingContext(true);
      const [clientsRes, leadsRes] = await Promise.all([
        api.get('/auth/consultant/clients').catch(() => ({ data: { clients: [] } })),
        api.get('/leads', { params: { status: 'assigned' } }).catch(() => ({ data: { leads: [] } }))
      ]);
      setClients(clientsRes.data.clients || []);
      setLeads(leadsRes.data.leads || []);
    } catch {
      toast.error('Failed to load clients or leads context');
    } finally {
      setLoadingContext(false);
    }
  };

  const handleGetRecommendations = async () => {
    if (!selectedClient && !selectedLead) {
      toast.error('Please select a client or lead first');
      return;
    }
    try {
      setLoadingRecs(true);
      setStep('results');
      const params = {
        department,
        clientId: selectedClient || undefined,
        leadId: selectedLead || undefined
      };
      const res = await api.get('/recommendations', { params });
      setData(res.data);
    } catch {
      toast.error('Failed to fetch recommendations');
      setStep('select');
    } finally {
      setLoadingRecs(false);
    }
  };

  const handleCopy = (rec) => {
    const text = `${rec.title}\n${rec.metricName}: ${rec.metricValue}\n${rec.detail1}\n${rec.detail2}\nDescription: ${rec.description}\nSource: ${rec.provider}`;
    navigator.clipboard.writeText(text);
    toast.success('Recommendation details copied to clipboard!');
  };

  const getDeptTitle = () => {
    const titles = {
      loans: 'Loan Recommendations (PaisaBazaar)',
      tax: 'Tax-Saving Product Recommendations',
      investments: 'Investment Recommendations (Moneycontrol)',
      insurance: 'LIC Insurance Recommendations',
      wealth: 'HDFC Life Wealth Recommendations'
    };
    return titles[department] || 'Recommendations';
  };

  const unconvertedLeads = leads.filter(l => !l.convertedClientId);

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center px-4 transition-all duration-300">
      <div className="bg-surface border border-border/40 rounded-3xl p-8 w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl flex flex-col gap-6">
        
        {/* Header */}
        <div className="flex justify-between items-start border-b border-border/40 pb-4">
          <div>
            <h3 className="text-xl font-bold text-accent">
              {step === 'select' ? 'Select Target Account' : getDeptTitle()}
            </h3>
            <p className="text-xs text-text-muted mt-1">
              {step === 'select' 
                ? 'Choose a client or lead to analyze and fetch recommendations' 
                : 'Recommended products and rates for case planning'
              }
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-xl hover:bg-surface-hover text-text-muted transition-colors"
            title="Close Modal"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* STEP 1: Select context */}
        {step === 'select' && (
          loadingContext ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <div className="w-12 h-12 rounded-full border-4 border-accent/20 border-t-accent animate-spin" />
              <p className="text-sm text-text-muted font-medium">Loading target list...</p>
            </div>
          ) : (
            <div className="space-y-5 py-2">
              <div>
                <label className="text-xs text-text-muted font-semibold block mb-1.5 uppercase tracking-wider">Client *</label>
                <select 
                  value={selectedClient} 
                  onChange={e => { setSelectedClient(e.target.value); setSelectedLead(''); }}
                  className="w-full p-3.5 rounded-xl border border-border bg-bg text-sm text-text focus:outline-none focus:border-accent"
                >
                  <option value="">Select existing client...</option>
                  {clients.map(c => (
                    <option key={c._id} value={c._id}>{c.name} ({c.email})</option>
                  ))}
                </select>
              </div>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-border/40"></div>
                <span className="flex-shrink mx-4 text-text-muted text-xs font-mono">OR</span>
                <div className="flex-grow border-t border-border/40"></div>
              </div>

              <div>
                <label className="text-xs text-text-muted font-semibold block mb-1.5 uppercase tracking-wider">Or Link Lead (not yet a client)</label>
                <select 
                  value={selectedLead} 
                  onChange={e => { setSelectedLead(e.target.value); setSelectedClient(''); }}
                  className="w-full p-3.5 rounded-xl border border-border bg-bg text-sm text-text focus:outline-none focus:border-accent"
                >
                  <option value="">Select assigned lead...</option>
                  {unconvertedLeads.map(l => (
                    <option key={l._id} value={l._id}>
                      {l.name} — {l.serviceType || l.department || 'General'} ({l.email})
                    </option>
                  ))}
                </select>
              </div>

              <button 
                onClick={handleGetRecommendations}
                disabled={!selectedClient && !selectedLead}
                className="w-full btn-primary py-4 rounded-xl shadow-lg mt-6 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 font-bold"
              >
                <span className="material-symbols-outlined text-base font-bold">recommend</span>
                VIEW RECOMMENDATIONS
              </button>
            </div>
          )
        )}

        {/* STEP 2: Show results */}
        {step === 'results' && (
          loadingRecs ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <div className="w-12 h-12 rounded-full border-4 border-accent/20 border-t-accent animate-spin" />
              <p className="text-sm text-text-muted font-medium animate-pulse font-semibold">Querying API and generating recommendations...</p>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Info Badge */}
              <div className="flex items-center justify-between p-3.5 bg-accent/5 rounded-2xl border border-accent/10">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-accent text-lg">info</span>
                  <span className="text-xs font-semibold text-text">Data Source:</span>
                  <span className="text-xs font-medium text-accent font-mono">{data.source}</span>
                </div>
                <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                  data.isLive ? 'bg-green-500/20 text-green-400 border border-green-500/20' : 'bg-amber-500/20 text-amber-400 border border-amber-500/20'
                }`}>
                  {data.isLive ? 'Live API' : 'Static Fallback'}
                </span>
              </div>

              {/* Recommendations List */}
              <div className="space-y-4">
                {data.recommendations && data.recommendations.length > 0 ? (
                  data.recommendations.map((rec) => (
                    <div 
                      key={rec.id} 
                      className="card p-5 border border-border/60 hover:border-accent/40 bg-surface-hover/30 hover:bg-surface-hover/50 transition-all duration-200 group flex flex-col md:flex-row justify-between gap-4"
                    >
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-accent text-base">{rec.title}</h4>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-surface border border-border text-text-muted font-medium">
                            {rec.provider}
                          </span>
                        </div>
                        <p className="text-sm text-text-muted leading-relaxed pr-2">
                          {rec.description}
                        </p>
                        <div className="flex gap-4 text-xs text-text-muted pt-1">
                          <span className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                            {rec.detail1}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                            {rec.detail2}
                          </span>
                        </div>
                      </div>

                      {/* Metric Panel & Actions */}
                      <div className="flex flex-col justify-between items-end min-w-[140px] gap-3 text-right">
                        <div>
                          <p className="text-[10px] text-text-muted font-semibold uppercase tracking-wider">{rec.metricName}</p>
                          <p className="text-xl font-extrabold text-secondary mt-0.5">{rec.metricValue}</p>
                        </div>
                        <button 
                          onClick={() => handleCopy(rec)}
                          className="btn-ghost text-xs px-3.5 py-2 flex items-center gap-1.5 hover:bg-accent/10 hover:text-accent font-semibold transition-all rounded-xl"
                        >
                          <span className="material-symbols-outlined text-sm">content_copy</span> Copy Details
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-text-muted">
                    No recommendations found for this department.
                  </div>
                )}
              </div>
            </div>
          )
        )}

        {/* Footer */}
        <div className="flex justify-between items-center pt-2 border-t border-border/40">
          {step === 'results' ? (
            <button 
              onClick={() => setStep('select')}
              className="btn-ghost text-xs px-4 py-2.5 flex items-center gap-1.5 hover:bg-accent/10 hover:text-accent font-bold transition-all rounded-xl"
            >
              <span className="material-symbols-outlined text-base">arrow_back</span>
              Back
            </button>
          ) : <div />}
          <button onClick={onClose} className="btn-primary px-6 py-2.5">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
