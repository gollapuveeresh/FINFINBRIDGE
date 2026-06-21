import { useState, useEffect } from 'react';
import CRMAdminLayout from '../../layouts/CRMAdminLayout';
import api from '../../services/api';
import toast from 'react-hot-toast';

const STEPS = [
  { title: 'B2B Registration', desc: 'Company registered portal account and initial inquiry.' },
  { title: 'CRM Qualification', desc: 'CRM team qualified the lead requirements and scores.' },
  { title: 'Department Routing', desc: 'Routed to specialized department for service onboarding.' },
  { title: 'Account Conversion', desc: 'CRM Admin converted the lead to an active B2B Client.' },
  { title: 'Consultant Assignment', desc: 'Department Admin assigned a dedicated consultant.' },
];

export default function CRMAdminPipeline() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchWonLeads();
  }, []);

  const fetchWonLeads = async () => {
    try {
      setLoading(true);
      const res = await api.get('/leads');
      const won = (res.data.leads || []).filter(l => l.status === 'won' || l.source === 'b2b_registration');
      setClients(won);
      if (won.length > 0) {
        setSelected(won[0]);
      }
    } catch {
      toast.error('Failed to load pipeline data');
    } finally {
      setLoading(false);
    }
  };

  const filtered = clients.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

  const getStepStatus = (client, index) => {
    if (!client) return 'pending';
    
    // Step 0: B2B Registration (Always completed)
    if (index === 0) return 'completed';
    
    // Step 1: CRM Qualification (Completed if score >= 35)
    const isStep1Completed = client.score >= 35;
    if (index === 1) {
      return isStep1Completed ? 'completed' : 'current';
    }
    
    // Step 2: Department Routing (Completed if department is set)
    const isStep2Completed = !!client.department;
    if (index === 2) {
      if (!isStep1Completed) return 'pending';
      return isStep2Completed ? 'completed' : 'current';
    }
    
    // Step 3: Account Conversion (Completed if status is 'won')
    const isStep3Completed = client.status === 'won';
    if (index === 3) {
      if (!isStep2Completed) return 'pending';
      return isStep3Completed ? 'completed' : 'current';
    }
    
    // Step 4: Consultant Assignment (Completed if assignedConsultantName is set)
    const isStep4Completed = !!client.assignedConsultantName;
    if (index === 4) {
      if (!isStep3Completed) return 'pending';
      return isStep4Completed ? 'completed' : 'current';
    }
    
    return 'pending';
  };

  const getStepDetail = (client, index) => {
    if (!client) return '';
    
    // Step 0: Registration
    if (index === 0) {
      return `Registered on ${new Date(client.createdAt).toLocaleDateString('en-IN')}`;
    }
    
    // Step 1: CRM Qualification
    if (index === 1) {
      return `Qualified with priority: ${client.priority?.toUpperCase()} (Score: ${client.score}/100)`;
    }
    
    // Step 2: Department Routing
    if (index === 2) {
      return client.department 
        ? `Routed to: ${client.department.toUpperCase()} department` 
        : 'Awaiting routing by CRM team';
    }
    
    // Step 3: Account Conversion
    if (index === 3) {
      if (client.status === 'won') {
        return 'Account activated. Sent login credentials.';
      }
      return client.department 
        ? 'Awaiting account conversion/activation by CRM Admin' 
        : 'Awaiting department routing';
    }
    
    // Step 4: Consultant Assignment
    if (index === 4) {
      if (client.assignedConsultantName) {
        return `Assigned Consultant: ${client.assignedConsultantName}`;
      }
      return client.status === 'won' 
        ? 'Awaiting consultant assignment by department admin' 
        : 'Awaiting account conversion';
    }
    
    return '';
  };

  return (
    <CRMAdminLayout>
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-headline-lg font-bold text-accent">Client Journey Pipeline</h1>
          <p className="text-text-muted mt-1">
            Monitor client progress visual pipeline (Read-Only). No actions allowed.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-gutter">
        {/* Left Side: Client Selector */}
        <div className="col-span-12 md:col-span-5 space-y-4">
          <div className="card p-4">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search clients..."
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-bg text-sm text-text focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="card overflow-hidden max-h-[600px] overflow-y-auto divide-y divide-border">
            {loading ? (
              <div className="py-12 text-center text-text-muted">Loading clients...</div>
            ) : filtered.length === 0 ? (
              <div className="py-12 text-center text-text-muted">No clients found</div>
            ) : filtered.map(c => (
              <button
                key={c._id}
                onClick={() => setSelected(c)}
                className={`w-full text-left p-4 flex items-center justify-between transition-colors hover:bg-surface-hover-lowest
                  ${selected?._id === c._id ? 'bg-purple-600/10 border-l-4 border-purple-600' : 'bg-surface'}`}
              >
                <div>
                  <p className="font-semibold text-text text-sm">{c.name}</p>
                  <p className="text-xs text-text-muted mt-0.5">{c.email}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full
                    ${c.status === 'won' ? 'text-purple-400 bg-purple-600/15' : 'text-amber-400 bg-amber-600/15'}`}>
                    {c.status === 'won' ? 'Client' : 'Registered'}
                  </span>
                  {c.department && (
                    <span className="text-[10px] text-text-muted capitalize">
                      {c.department}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right Side: Stepper Journey Viewer */}
        <div className="col-span-12 md:col-span-7">
          {selected ? (
            <div className="card p-6 space-y-6">
              <div className="border-b border-border pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-purple-600/10 flex items-center justify-center text-purple-400 font-bold text-lg">
                    {selected.name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-accent">{selected.name}</h2>
                    <p className="text-sm text-text-muted">{selected.email} · {selected.phone || 'No phone'}</p>
                  </div>
                </div>
              </div>

              {/* Stepper Timeline */}
              <div className="flow-root pl-4">
                <ul className="-mb-8">
                  {STEPS.map((step, idx) => {
                    const status = getStepStatus(selected, idx);
                    const detail = getStepDetail(selected, idx);
                    return (
                      <li key={idx}>
                        <div className="relative pb-8">
                          {idx !== STEPS.length - 1 ? (
                            <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-border" aria-hidden="true" />
                          ) : null}
                          <div className="relative flex space-x-3">
                            <div>
                              <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-surface
                                ${status === 'completed' ? 'bg-green-500 text-white' :
                                  status === 'current' ? 'bg-amber-500 text-white' : 'bg-surface border-2 border-border text-text-muted'}`}>
                                {status === 'completed' ? (
                                  <span className="material-symbols-outlined text-sm">check</span>
                                ) : status === 'current' ? (
                                  <span className="material-symbols-outlined text-sm animate-pulse">hourglass_empty</span>
                                ) : (
                                  <span className="text-xs font-bold">{idx + 1}</span>
                                )}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0 pt-0.5">
                              <p className="text-sm font-bold text-text">{step.title}</p>
                              <p className="text-xs text-text-muted mt-0.5">{step.desc}</p>
                              {detail && (
                                <p className={`text-xs font-semibold mt-1.5 px-3 py-1.5 rounded-lg w-fit
                                  ${status === 'completed' ? 'bg-green-500/10 text-green-400' :
                                    status === 'current' ? 'bg-amber-500/10 text-amber-400' : 'bg-bg text-text-muted'}`}>
                                  {detail}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* CRM Notes & History */}
              {selected.notes && selected.notes.length > 0 && (
                <div className="border-t border-border pt-5 mt-8">
                  <h3 className="font-bold text-accent mb-3 text-sm flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base">history</span>
                    CRM Notes & Activity Log
                  </h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {selected.notes.map((n, i) => (
                      <div key={i} className="p-3 bg-bg rounded-xl border border-border/40 text-xs">
                        <p className="text-text font-medium">{n.text}</p>
                        <p className="text-text-muted mt-1 font-mono text-[10px]">
                          Added by {n.addedBy} on {new Date(n.addedAt).toLocaleString('en-IN')}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="card p-12 text-center text-text-muted">
              <span className="material-symbols-outlined text-4xl block mb-2 opacity-30">route</span>
              Select a client to view their lifecycle progress timeline.
            </div>
          )}
        </div>
      </div>
    </CRMAdminLayout>
  );
}
