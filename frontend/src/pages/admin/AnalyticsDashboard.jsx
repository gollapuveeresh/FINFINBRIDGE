import { useState, useEffect } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import api from '../../services/api';

const staticKpis = [
  { label: 'Total Platform Users', value: '2,847', sub: '+12% MoM growth', icon: 'people', color: 'text-accent bg-accent/10' },
  { label: 'Active Advisory Clients', value: '47', sub: 'High Net Worth focus', icon: 'groups', color: 'text-secondary bg-secondary/10' },
  { label: 'Total Consultants Managed', value: '42', sub: 'Active practice roster', icon: 'badge', color: 'text-accent bg-accent/10' },
  { label: 'ARR Fee Revenue', value: '$782,500', sub: '+12.4% MoM rise', icon: 'payments', color: 'text-success bg-success/10' },
  { label: 'Active Loan Volume', value: '$1,274,900', sub: 'Commercial & working capital', icon: 'account_balance', color: 'text-secondary bg-secondary/10' },
  { label: 'Managed Assets (AUM)', value: '$1,280,000', sub: 'Synced brokerage portfolios', icon: 'pie_chart', color: 'text-success bg-success/10' },
];

export default function AnalyticsDashboard() {
  const [leadStats, setLeadStats] = useState(null);

  useEffect(() => {
    api.get('/leads/stats').then(r => setLeadStats(r.data)).catch(() => {});
  }, []);

  const totalLeads = leadStats?.pipeline?.reduce((s, p) => s + p.count, 0) || 0;
  const wonLeads = leadStats?.pipeline?.find(p => p.status === 'won')?.count || 0;
  const hotLeads = leadStats?.byPriority?.find(p => p._id === 'hot')?.count || 0;
  const convRate = totalLeads ? ((wonLeads / totalLeads) * 100).toFixed(1) : '0';

  const kpiMetrics = [
    ...staticKpis,
    { label: 'Total Leads', value: String(totalLeads), sub: `${hotLeads} hot leads`, icon: 'contacts', color: 'text-accent bg-accent/10' },
    { label: 'Conversion Rate', value: `${convRate}%`, sub: `${wonLeads} converted`, icon: 'trending_up', color: 'text-success bg-success/10' },
  ];
  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-headline-lg font-bold text-accent">Practice Analytics Dashboard</h1>
          <p className="text-body-md text-text-muted mt-1">System-wide performance indexes, asset growth, and client distributions.</p>
        </div>
      </div>

      {/* KPI Roster Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-gutter">
        {kpiMetrics.map((kpi, i) => (
          <div key={i} className="card p-5 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-3">
                <div className={`p-2.5 rounded-xl ${kpi.color.split(' ')[1]}`}>
                  <span className={`material-symbols-outlined ${kpi.color.split(' ')[0]}`}>{kpi.icon}</span>
                </div>
              </div>
              <p className="text-text-muted text-label-lg leading-tight">{kpi.label}</p>
              <p className="text-headline-sm font-bold text-accent mt-2">{kpi.value}</p>
            </div>
            <p className="text-[10px] text-text-muted mt-2 font-bold">{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts Bento Layout */}
      <div className="grid grid-cols-12 gap-gutter">
        {/* User Growth & Revenue Trends double line chart */}
        <div className="col-span-12 lg:col-span-8 card p-8 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-headline-md font-bold text-accent">Growth & Billings Trend</h3>
              <p className="text-body-sm text-text-muted">Year-to-date monthly registrations and advisory billings performance.</p>
            </div>
            <div className="flex gap-2">
              <div className="flex items-center gap-2 px-3 py-1 bg-surface rounded-lg text-xs font-bold">
                <div className="w-2.5 h-2.5 rounded-full bg-accent"></div> Users (thousands)
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-surface rounded-lg text-xs font-bold">
                <div className="w-2.5 h-2.5 rounded-full bg-secondary"></div> Revenue ($k)
              </div>
            </div>
          </div>

          {/* SVG Line Graph */}
          <div className="h-[220px] w-full relative">
            <svg className="w-full h-full" viewBox="0 0 600 220" preserveAspectRatio="none">
              {[50, 110, 170].map((y) => (
                <line key={y} stroke="#E2E8F0" strokeDasharray="3" strokeWidth="1" x1="0" x2="600" y1={y} y2={y} />
              ))}
              
              {/* Shaded Area for User Series */}
              <path d="M 0,220 L 100,190 L 200,170 L 300,165 L 400,135 L 500,100 L 600,60 L 600,220 Z" fill="rgba(15, 27, 51, 0.04)" />
              {/* Shaded Area for Revenue Series */}
              <path d="M 0,220 L 100,205 L 200,195 L 300,185 L 400,155 L 500,135 L 600,110 L 600,220 Z" fill="rgba(120, 90, 2, 0.04)" />
              
              {/* User Curve */}
              <path d="M 0,190 C 100,180 150,175 200,170 C 250,165 300,155 350,135 C 400,115 450,105 500,100 C 550,95 600,60" fill="none" stroke="#000000" strokeWidth="3" />
              {/* Revenue Curve */}
              <path d="M 0,205 C 100,200 150,198 200,195 C 250,190 300,180 350,155 C 400,140 450,138 500,135 C 550,130 600,110" fill="none" stroke="#785a02" strokeWidth="2.5" strokeDasharray="5 3" />
              
              <circle cx="600" cy="60" r="5" fill="#000000" />
              <circle cx="600" cy="110" r="4" fill="#785a02" />
            </svg>
            <div className="flex justify-between mt-4 text-xs font-bold text-text-muted uppercase tracking-wider">
              {['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'].map((m) => (
                <span key={m}>{m}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Most Popular Services distribution */}
        <div className="col-span-12 lg:col-span-4 card p-8 flex flex-col justify-between">
          <div>
            <h3 className="text-headline-md font-bold text-accent mb-6">Service Allocation</h3>
            <div className="space-y-4">
              {[
                { name: 'Loan Refinancing Products', weight: 45, volume: '$1.27M', color: 'bg-accent' },
                { name: 'Portfolio Management Advisory', weight: 30, volume: '$1.28M', color: 'bg-secondary' },
                { name: 'Tax Optimizations & Filings', weight: 15, volume: '$106k write-offs', color: 'bg-accent-fixed-dim' },
                { name: 'Onboarding & Intake Reviews', weight: 10, volume: '47 HNW synced', color: 'bg-surface-hover-high' },
              ].map((serv, i) => (
                <div key={i} className="p-3.5 rounded-xl border border-border/35 hover:bg-surface/20 transition-colors">
                  <div className="flex justify-between items-center text-body-sm mb-1.5">
                    <span className="font-bold text-accent">{serv.name}</span>
                    <span className="font-black text-accent">{serv.weight}%</span>
                  </div>
                  <div className="h-1.5 bg-surface-hover-high rounded-full overflow-hidden mb-1">
                    <div className={`h-full ${serv.color} rounded-full`} style={{ width: `${serv.weight}%` }}></div>
                  </div>
                  <span className="text-[10px] text-text-muted font-bold">Vol: {serv.volume}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Lead Pipeline Funnel */}
      {leadStats && (
        <div className="card p-8">
          <h3 className="text-headline-md font-bold text-accent mb-6">Lead Pipeline Funnel</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {leadStats.pipeline?.filter(p => ['new','contacted','qualified','proposal','won'].includes(p.status)).map((p, i) => (
              <div key={p.status} className="text-center">
                <div className="mx-auto rounded-2xl bg-secondary/10 border border-secondary/20 py-6 px-3 mb-2">
                  <p className="text-3xl font-bold text-accent">{p.count}</p>
                </div>
                <p className="text-xs font-semibold text-text-muted capitalize">{p.status}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            {leadStats.byDepartment?.map(d => (
              <div key={d._id} className="px-4 py-2 rounded-xl bg-surface border border-border text-sm">
                <span className="text-text-muted capitalize">{d._id}</span>
                <span className="ml-2 font-bold text-accent">{d.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Platform Activity & Client Health Score brackets */}
      <div className="grid grid-cols-12 gap-gutter">
        {/* Practice client health index */}
        <div className="col-span-12 lg:col-span-6 card p-8">
          <h3 className="text-headline-md font-bold text-accent mb-6">Global Portfolio Health Index</h3>
          <div className="space-y-4">
            {[
              { score: 'Excellent (90+)', range: 'Score 90 – 100', clients: 15, pct: 32, color: 'bg-success' },
              { score: 'Strong (80-89)', range: 'Score 80 – 89', clients: 20, pct: 43, color: 'bg-accent' },
              { score: 'Moderate (70-79)', range: 'Score 70 – 79', clients: 8, pct: 17, color: 'bg-secondary' },
              { score: 'Needs Attention (<70)', range: 'Score 0 – 69', clients: 4, pct: 8, color: 'bg-error' },
            ].map((b, i) => (
              <div key={i}>
                <div className="flex justify-between items-center mb-1 text-body-sm">
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${b.color}`}></div>
                    <span className="font-semibold text-accent">{b.score}</span>
                  </div>
                  <span className="text-xs text-text-muted font-bold">{b.clients} Clients ({b.pct}%)</span>
                </div>
                <div className="h-2 bg-surface-hover-high rounded-full overflow-hidden">
                  <div className={`h-full ${b.color} rounded-full`} style={{ width: `${b.pct}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Platform Uptime & Load health */}
        <div className="col-span-12 lg:col-span-6 card p-8 flex flex-col justify-between">
          <div>
            <h3 className="text-headline-md font-bold text-accent mb-6">Security & Node Latency</h3>
            <div className="space-y-4">
              {[
                { name: 'Core API latency', val: '142ms', pct: 85, standing: 'Healthy' },
                { name: 'Custody bank broker exchange Sync', val: '99.98% uptime', pct: 98, standing: 'Excellent' },
                { name: 'Plaid Token security checks', val: 'No anomalies', pct: 100, standing: 'Secure' },
                { name: 'Encryption keys rotation buffer', val: '32 days left', pct: 64, standing: 'Safe' },
              ].map((log, i) => (
                <div key={i}>
                  <div className="flex justify-between mb-1.5 text-body-sm">
                    <span className="text-text-muted font-medium">{log.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-accent">{log.val}</span>
                      <span className="text-xs text-success font-bold">({log.standing})</span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-surface-hover-high rounded-full overflow-hidden">
                    <div className="h-full bg-success rounded-full" style={{ width: `${log.pct}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
