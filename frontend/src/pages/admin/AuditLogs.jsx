// import AdminLayout from '../../layouts/AdminLayout';
// import { useState } from 'react';

// const initialLogs = [
//   { id: 1, time: '2026-06-07 07:12:15', category: 'Admin Actions', user: 'admin@finbridge.com', ip: '198.162.1.45', desc: 'Registered new Loan Product: Commercial Mortgage Refinance (5.4%)' },
//   { id: 2, time: '2026-06-07 06:58:32', category: 'User Activity', user: 'a.vance@corporation.com', ip: '172.56.23.109', desc: 'Updated asset class valuation parameters for Commercial Headquarters' },
//   { id: 3, time: '2026-06-07 06:45:00', category: 'Security Events', user: 'System-wide', ip: 'N/A', desc: 'Automated Plaid access token rotations triggered successfully for 41 clients' },
//   { id: 4, time: '2026-06-07 05:22:11', category: 'Login History', user: 's.jenkins@finbridge.com', ip: '198.162.1.84', desc: 'Successful login (Session ID: sess-80942) - Two-Factor verified' },
//   { id: 5, time: '2026-06-07 04:12:00', category: 'Data Changes', user: 'm.aris@finbridge.com', ip: '198.162.1.20', desc: 'Modified client assignment for Priya Sharma (assigned to Sarah Jenkins)' },
//   { id: 6, time: '2026-06-06 23:45:12', category: 'Security Events', user: 'unknown@hack.com', ip: '82.44.112.5', desc: 'Security Alert: 3 failed login attempts recorded' },
//   { id: 7, time: '2026-06-06 18:22:10', category: 'Login History', user: 'j.harrington@harrington.com', ip: '74.12.85.62', desc: 'Successful login via client portal' },
// ];

// export default function AuditLogs() {
//   const [logs, setLogs] = useState(initialLogs);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [selectedCategory, setSelectedCategory] = useState('All');
//   const [exportSuccess, setExportSuccess] = useState('');

//   const handleExport = (format) => {
//     setExportSuccess(`Logs successfully compiled and downloaded as audit-trail.${format.toLowerCase()}`);
//     setTimeout(() => setExportSuccess(''), 3000);
//   };

//   const filteredLogs = logs.filter(log => {
//     const matchesSearch = 
//       log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       log.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       log.ip.toLowerCase().includes(searchQuery.toLowerCase());
    
//     if (selectedCategory === 'All') return matchesSearch;
//     return matchesSearch && log.category === selectedCategory;
//   });

//   return (
//     <AdminLayout>
//       {/* Header */}
//       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
//         <div>
//           <h1 className="text-headline-lg font-bold text-accent">System Audit Logs</h1>
//           <p className="text-body-md text-text-muted mt-1">Immutable administrative audit trails, security logging registers, and database mutation flows.</p>
//         </div>
//         <div className="flex gap-2">
//           <button 
//             onClick={() => handleExport('CSV')}
//             className="btn-ghost flex items-center gap-2 py-2 px-4 text-body-sm"
//           >
//             <span className="material-symbols-outlined text-sm">download</span>
//             Export CSV
//           </button>
//           <button 
//             onClick={() => handleExport('JSON')}
//             className="btn-primary flex items-center gap-2 py-2 px-4 text-body-sm"
//           >
//             <span className="material-symbols-outlined text-sm">code</span>
//             Export JSON
//           </button>
//         </div>
//       </div>

//       {/* Main filter toolbar */}
//       <div className="card overflow-hidden">
//         <div className="px-8 py-5 border-b border-border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-surface-hover-lowest">
//           <div className="flex flex-wrap gap-2">
//             {['All', 'User Activity', 'Admin Actions', 'Login History', 'Security Events', 'Data Changes'].map((cat) => (
//               <button
//                 key={cat}
//                 onClick={() => setSelectedCategory(cat)}
//                 className={`px-3.5 py-1.5 rounded-lg text-label-sm font-bold transition-all ${
//                   selectedCategory === cat 
//                     ? 'bg-accent text-on-primary shadow-sm' 
//                     : 'text-text-muted hover:bg-surface hover:text-accent'
//                 }`}
//               >
//                 {cat}
//               </button>
//             ))}
//           </div>

//           <div className="relative">
//             <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">search</span>
//             <input 
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               className="pl-9 pr-4 py-2 rounded-lg border border-border text-body-sm bg-surface focus:outline-none focus:border-secondary w-64" 
//               placeholder="Search by operator, action, IP..." 
//             />
//           </div>
//         </div>

//         {exportSuccess && (
//           <div className="m-6 p-4 rounded-xl bg-success/15 border border-success/35 text-success text-body-sm font-bold flex items-center gap-2">
//             <span className="material-symbols-outlined text-base">check_circle</span>
//             {exportSuccess}
//           </div>
//         )}

//         {/* Logs table list */}
//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead>
//               <tr className="bg-surface text-label-lg text-text-muted uppercase tracking-wider">
//                 <th className="px-6 py-4 text-left">Timestamp</th>
//                 <th className="px-6 py-4 text-left">Category</th>
//                 <th className="px-6 py-4 text-left">Operator</th>
//                 <th className="px-6 py-4 text-left">Client IP</th>
//                 <th className="px-6 py-4 text-left">Description</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-outline-variant/40 text-body-sm text-text font-medium">
//               {filteredLogs.map((log) => (
//                 <tr key={log.id} className="hover:bg-surface/35 transition-colors">
//                   <td className="px-6 py-4 text-text-muted font-mono whitespace-nowrap">{log.time}</td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <span className={`status-badge ${
//                       log.category === 'Security Events' ? 'status-error' :
//                       log.category === 'Admin Actions' ? 'status-info' :
//                       log.category === 'Login History' ? 'bg-secondary/15 text-secondary' :
//                       'bg-surface-hover-high text-text-muted'
//                     }`}>{log.category}</span>
//                   </td>
//                   <td className="px-6 py-4 font-bold text-accent">{log.user}</td>
//                   <td className="px-6 py-4 text-text-muted font-mono">{log.ip}</td>
//                   <td className="px-6 py-4 text-accent font-normal leading-relaxed">{log.desc}</td>
//                 </tr>
//               ))}
//               {filteredLogs.length === 0 && (
//                 <tr>
//                   <td colSpan={5} className="py-8 text-center text-text-muted">No audit logs found matching selected criteria.</td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </AdminLayout>
//   );
// }
// Replace the entire AuditLogs.jsx with this updated version:

import React, { useState } from 'react';
import AdminLayout from '../../layouts/AdminLayout';

const initialLogs = [
  { id: 1, time: '2025-06-09 14:32', category: 'Auth', user: 'admin@finbridge.com', ip: '182.45.67.12', desc: 'Successful login from New York' },
  { id: 2, time: '2025-06-09 13:55', category: 'User', user: 'sarah.jenkins@finbridge.com', ip: '103.45.12.89', desc: 'Updated client financial profile' },
  { id: 3, time: '2025-06-09 12:10', category: 'Loan', user: 'system', ip: '127.0.0.1', desc: 'New loan recommendation generated for client ID #4782' },
  { id: 4, time: '2025-06-09 11:45', category: 'Security', user: 'admin@finbridge.com', ip: '182.45.67.12', desc: 'Password changed successfully' },
  { id: 5, time: '2025-06-09 10:22', category: 'System', user: 'system', ip: 'internal', desc: 'Daily backup completed - 2.4 GB' },
  { id: 6, time: '2025-06-09 09:15', category: 'User', user: 'michael.aris@finbridge.com', ip: '45.67.89.12', desc: 'Created new consultant account' },
];

export default function AuditLogs() {
  const [logs] = useState(initialLogs);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         log.desc.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || log.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const exportToCSV = () => {
    const csv = [
      ['Timestamp', 'Category', 'User', 'IP Address', 'Description'],
      ...filteredLogs.map(log => [log.time, log.category, log.user, log.ip, log.desc])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportToJSON = () => {
    const json = JSON.stringify(filteredLogs, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-headline-lg font-bold text-accent">Audit Logs</h1>
          <p className="text-text-muted">Complete immutable activity trail</p>
        </div>
        <div className="flex gap-3">
          <button onClick={exportToCSV} className="btn-ghost flex items-center gap-2">
            📥 Export CSV
          </button>
          <button onClick={exportToJSON} className="btn-primary flex items-center gap-2">
            📤 Export JSON
          </button>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="p-6 border-b border-border flex flex-col md:flex-row gap-4 justify-between">
          <input
            type="text"
            placeholder="Search logs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 p-3 border border-border rounded-2xl bg-surface"
          />
          <select 
            value={categoryFilter} 
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="p-3 border border-border rounded-2xl bg-surface"
          >
            <option value="All">All Categories</option>
            <option value="Auth">Authentication</option>
            <option value="User">User Management</option>
            <option value="Loan">Loan Engine</option>
            <option value="Security">Security</option>
            <option value="System">System</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-surface text-text-muted uppercase text-sm tracking-wider">
                <th className="px-6 py-4 text-left">Timestamp</th>
                <th className="px-6 py-4 text-left">Category</th>
                <th className="px-6 py-4 text-left">User</th>
                <th className="px-6 py-4 text-left">IP Address</th>
                <th className="px-6 py-4 text-left">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredLogs.map(log => (
                <tr key={log.id} className="hover:bg-surface-hover-high">
                  <td className="px-6 py-4 font-mono text-sm">{log.time}</td>
                  <td className="px-6 py-4"><span className="status-badge status-info">{log.category}</span></td>
                  <td className="px-6 py-4 font-medium">{log.user}</td>
                  <td className="px-6 py-4 font-mono text-text-muted">{log.ip}</td>
                  <td className="px-6 py-4 text-text">{log.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}