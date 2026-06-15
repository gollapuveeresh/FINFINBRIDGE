import AdminLayout from '../../layouts/AdminLayout';
import { useState } from 'react';

const initialConsultants = [
  { id: 1, name: 'Sarah Jenkins', email: 's.jenkins@finbridge.com', specialty: 'Tax Strategy', clients: ['Alexander Vance', 'Emma Williams'], status: 'Active', rating: '4.95' },
  { id: 2, name: 'Michael Aris', email: 'm.aris@finbridge.com', specialty: 'Investment Advisory', clients: ['James Harrington', 'Sarah Mitchell'], status: 'Active', rating: '4.90' },
  { id: 3, name: 'Elena Rossi', email: 'e.rossi@finbridge.com', specialty: 'Loans & Credit', clients: ['David Chen'], status: 'Active', rating: '4.85' },
  { id: 4, name: 'Robert Vance', email: 'r.vance@finbridge.com', specialty: 'Wealth Preservation', clients: [], status: 'Inactive', rating: '4.78' },
];

export default function ConsultantManagement() {
  const [consultants, setConsultants] = useState(initialConsultants);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [selectedConsultant, setSelectedConsultant] = useState(null);
  const [newClientName, setNewClientName] = useState('');

  const handleToggleStatus = (id) => {
    setConsultants(prev => prev.map(c => {
      if (c.id === id) {
        const nextStatus = c.status === 'Active' ? 'Inactive' : 'Active';
        return { ...c, status: nextStatus };
      }
      return c;
    }));
  };

  const handleAssignClient = (e) => {
    e.preventDefault();
    if (!newClientName || !selectedConsultant) return;

    setConsultants(prev => prev.map(c => {
      if (c.id === selectedConsultant.id) {
        const updatedClients = [...c.clients, newClientName];
        setSelectedConsultant(prevC => ({ ...prevC, clients: updatedClients }));
        return { ...c, clients: updatedClients };
      }
      return c;
    }));
    setNewClientName('');
  };

  const handleUnassignClient = (clientName) => {
    if (!selectedConsultant) return;

    setConsultants(prev => prev.map(c => {
      if (c.id === selectedConsultant.id) {
        const updatedClients = c.clients.filter(name => name !== clientName);
        setSelectedConsultant(prevC => ({ ...prevC, clients: updatedClients }));
        return { ...c, clients: updatedClients };
      }
      return c;
    }));
  };

  const filteredConsultants = consultants.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.specialty.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-headline-lg font-bold text-accent">Consultant Management</h1>
          <p className="text-body-md text-text-muted mt-1">Manage consulting staff, specialties, client allocations, and performance standings.</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter">
        {[
          { label: 'Total Advisors', value: consultants.length, icon: 'badge', color: 'text-accent bg-accent/10' },
          { label: 'Active Status', value: consultants.filter(c => c.status === 'Active').length, icon: 'check_circle', color: 'text-success bg-success/10' },
          { label: 'Inactive Status', value: consultants.filter(c => c.status === 'Inactive').length, icon: 'block', color: 'text-error bg-error/10' },
          { label: 'Practice Average Rating', value: '4.92 / 5.00', icon: 'star', color: 'text-secondary bg-secondary/10' },
        ].map((s, i) => (
          <div key={i} className="card p-6 flex items-center gap-4">
            <div className={`p-3 rounded-xl ${s.color.split(' ')[1]}`}>
              <span className={`material-symbols-outlined ${s.color.split(' ')[0]}`}>{s.icon}</span>
            </div>
            <div>
              <p className="text-text-muted text-label-lg">{s.label}</p>
              <p className="text-headline-md font-bold text-accent mt-1">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Table card */}
      <div className="card overflow-hidden">
        <div className="px-8 py-5 border-b border-border flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="text-headline-md font-bold text-accent">Advisory Roster</h2>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">search</span>
            <input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-lg border border-border text-body-sm bg-surface focus:outline-none focus:border-secondary w-64" 
              placeholder="Search by advisor or specialty..." 
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-surface text-label-lg text-text-muted uppercase tracking-wider">
                <th className="px-6 py-4 text-left">Consultant</th>
                <th className="px-6 py-4 text-left">Specialty</th>
                <th className="px-6 py-4 text-right">Clients Managed</th>
                <th className="px-6 py-4 text-right">Rating</th>
                <th className="px-6 py-4 text-left">Status</th>
                <th className="px-6 py-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/40 text-body-md text-text">
              {filteredConsultants.map((con) => (
                <tr key={con.id} className="hover:bg-surface/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-accent-container flex items-center justify-center text-on-primary font-bold shrink-0">
                        {con.name[0]}
                      </div>
                      <div>
                        <p className="font-bold text-accent">{con.name}</p>
                        <p className="text-xs text-text-muted">{con.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="status-badge bg-accent/10 text-accent font-bold">{con.specialty}</span>
                  </td>
                  <td className="px-6 py-4 text-right font-semibold">{con.clients.length}</td>
                  <td className="px-6 py-4 text-right font-bold text-secondary">{con.rating} / 5.0</td>
                  <td className="px-6 py-4">
                    <span className={`status-badge ${con.status === 'Active' ? 'status-success' : 'status-error'}`}>
                      {con.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setSelectedConsultant(con)}
                        className="text-secondary hover:text-accent transition-colors p-1"
                        title="View & Edit Assignments"
                      >
                        <span className="material-symbols-outlined text-base">assignment_ind</span>
                      </button>
                      <button 
                        onClick={() => handleToggleStatus(con.id)}
                        className={`p-1 transition-colors ${con.status === 'Active' ? 'text-error hover:opacity-85' : 'text-success hover:opacity-85'}`}
                        title={con.status === 'Active' ? 'Deactivate' : 'Activate'}
                      >
                        <span className="material-symbols-outlined text-base">
                          {con.status === 'Active' ? 'block' : 'check_circle'}
                        </span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredConsultants.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-text-muted">No consultants match query "{searchQuery}".</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assignment details Modal */}
      {selectedConsultant && (
        <div className="fixed inset-0 bg-accent/45 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="card w-full max-w-lg p-8 relative shadow-2xl space-y-6 fade-in">
            <button 
              onClick={() => setSelectedConsultant(null)}
              className="absolute top-4 right-4 text-text-muted hover:text-accent"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            <div>
              <span className="text-xs text-text-muted font-bold uppercase tracking-widest">Client Allocations</span>
              <h3 className="text-headline-md font-bold text-accent mt-1">{selectedConsultant.name}</h3>
              <p className="text-body-sm text-text-muted mt-0.5">{selectedConsultant.specialty} Specialist</p>
            </div>

            {/* List of currently assigned clients */}
            <div className="space-y-3">
              <h4 className="text-label-lg font-bold text-accent">Assigned Portfolio</h4>
              {selectedConsultant.clients.length === 0 ? (
                <p className="text-body-sm text-text-muted">No active clients assigned.</p>
              ) : (
                <div className="divide-y divide-outline-variant/30 max-h-[200px] overflow-y-auto pr-2">
                  {selectedConsultant.clients.map((client, i) => (
                    <div key={i} className="py-2.5 flex justify-between items-center">
                      <span className="font-semibold text-accent text-body-md">{client}</span>
                      <button 
                        onClick={() => handleUnassignClient(client)}
                        className="text-xs text-error hover:underline"
                      >
                        Unassign
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Form to assign a new client */}
            <form onSubmit={handleAssignClient} className="pt-4 border-t border-border/35 space-y-3">
              <label className="text-label-lg font-bold text-accent block">Allocate New Relationship</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  placeholder="e.g. NextGen Fintech Solutions"
                  className="form-input flex-1"
                  required
                />
                <button type="submit" className="btn-primary py-2 px-4 text-body-sm">
                  Assign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
