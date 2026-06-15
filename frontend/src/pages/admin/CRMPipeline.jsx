import React, { useState, useEffect } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import api from '../../services/api';
import toast from 'react-hot-toast';

const PIPELINE_STAGES = ['new','contacted','interested','qualified','assigned','consultation','proposal','won'];
const STAGE_COLORS = {
  new: 'border-blue-500/40 bg-blue-500/5',
  contacted: 'border-cyan-500/40 bg-cyan-500/5',
  interested: 'border-yellow-500/40 bg-yellow-500/5',
  qualified: 'border-purple-500/40 bg-purple-500/5',
  assigned: 'border-indigo-500/40 bg-indigo-500/5',
  consultation: 'border-orange-500/40 bg-orange-500/5',
  proposal: 'border-pink-500/40 bg-pink-500/5',
  won: 'border-green-500/40 bg-green-500/5',
};
const DOT_COLORS = {
  new: 'bg-blue-500', contacted: 'bg-cyan-500', interested: 'bg-yellow-500',
  qualified: 'bg-purple-500', assigned: 'bg-indigo-500', consultation: 'bg-orange-500',
  proposal: 'bg-pink-500', won: 'bg-green-500'
};
const PRIORITY_DOT = { hot: 'bg-red-500', warm: 'bg-amber-400', cold: 'bg-blue-400' };

export default function CRMPipeline() {
  const [pipeline, setPipeline] = useState({});
  const [stats, setStats] = useState({ pipeline: [], bySource: [], byPriority: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [leadsRes, statsRes] = await Promise.all([
        api.get('/leads', { params: { } }),
        api.get('/leads/stats')
      ]);
      const leads = leadsRes.data.leads || [];
      const grouped = {};
      PIPELINE_STAGES.forEach(s => { grouped[s] = []; });
      leads.forEach(l => { if (grouped[l.status]) grouped[l.status].push(l); });
      setPipeline(grouped);
      setStats(statsRes.data);
    } catch { toast.error('Failed to load pipeline'); }
    finally { setLoading(false); }
  };

  const moveStage = async (lead, newStatus) => {
    try {
      await api.patch(`/leads/${lead._id}`, { status: newStatus });
      toast.success(`Moved to ${newStatus}`);
      fetchAll();
    } catch { toast.error('Failed to move lead'); }
  };

  const totalWon = stats.pipeline?.find(p => p.status === 'won')?.count || 0;
  const total = stats.pipeline?.reduce((s, p) => s + p.count, 0) || 0;

  return (
    <AdminLayout>
      <div className="flex justify-between items-start mb-2">
        <div>
          <h1 className="text-headline-lg font-bold text-accent">CRM Pipeline</h1>
          <p className="text-text-muted">Full lead-to-client conversion funnel</p>
        </div>
        <div className="flex gap-4 text-sm">
          <div className="card px-5 py-3 text-center">
            <p className="text-text-muted text-xs">Total Leads</p>
            <p className="font-bold text-accent text-xl">{total}</p>
          </div>
          <div className="card px-5 py-3 text-center">
            <p className="text-text-muted text-xs">Converted</p>
            <p className="font-bold text-green-400 text-xl">{totalWon}</p>
          </div>
          <div className="card px-5 py-3 text-center">
            <p className="text-text-muted text-xs">Conversion</p>
            <p className="font-bold text-secondary text-xl">{total ? ((totalWon/total)*100).toFixed(1) : 0}%</p>
          </div>
        </div>
      </div>

      {/* Source breakdown */}
      {stats.bySource?.length > 0 && (
        <div className="card p-5">
          <p className="font-semibold text-text mb-3 text-sm">Leads by Source</p>
          <div className="flex flex-wrap gap-2">
            {stats.bySource.map(s => (
              <div key={s._id} className="px-3 py-1.5 rounded-full bg-surface border border-border text-xs">
                <span className="text-text-muted capitalize">{s._id?.replace(/_/g, ' ')}</span>
                <span className="ml-2 font-bold text-accent">{s.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Kanban */}
      {loading ? (
        <div className="text-center py-20 text-text-muted">Loading pipeline...</div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-6 snap-x">
          {PIPELINE_STAGES.map(stage => (
            <div key={stage} className="min-w-[260px] snap-start flex-shrink-0">
              <div className={`rounded-2xl border p-1 ${STAGE_COLORS[stage]}`}>
                <div className="flex items-center justify-between px-3 py-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${DOT_COLORS[stage]}`} />
                    <h3 className="font-bold text-sm capitalize">{stage}</h3>
                    <span className="text-xs bg-surface-hover-high px-2 py-0.5 rounded-full font-mono">{pipeline[stage]?.length || 0}</span>
                  </div>
                </div>

                <div className="space-y-2 min-h-[200px] px-1 pb-2">
                  {pipeline[stage]?.length === 0 ? (
                    <div className="h-20 flex items-center justify-center text-text-muted text-xs border border-dashed border-border/50 rounded-xl">Empty</div>
                  ) : pipeline[stage].map(lead => (
                    <div key={lead._id} className="card p-4 rounded-xl shadow-sm">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <p className="font-semibold text-text text-sm leading-tight">{lead.name}</p>
                        <div className={`w-2 h-2 rounded-full shrink-0 mt-1.5 ${PRIORITY_DOT[lead.priority]}`} title={lead.priority} />
                      </div>
                      <p className="text-xs text-text-muted mb-1">{lead.email}</p>
                      {lead.department && <p className="text-xs text-secondary capitalize mb-2">{lead.department}</p>}
                      <div className="flex items-center gap-1 mt-2">
                        <div className="h-1 flex-1 bg-surface-hover-high rounded-full overflow-hidden">
                          <div className="h-full bg-secondary rounded-full" style={{ width: `${lead.score}%` }} />
                        </div>
                        <span className="text-xs font-bold text-text-muted">{lead.score}</span>
                      </div>
                      {/* Move buttons */}
                      <div className="mt-3 flex gap-1 flex-wrap">
                        {PIPELINE_STAGES.filter(s => s !== stage).slice(0, 3).map(s => (
                          <button key={s} onClick={() => moveStage(lead, s)}
                            className="text-[10px] px-2 py-0.5 rounded-full bg-surface-hover border border-border hover:border-secondary text-text-muted hover:text-secondary transition-colors capitalize">
                            → {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
