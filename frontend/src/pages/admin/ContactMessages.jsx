// import AdminLayout from '../../layouts/AdminLayout';
// import { useState } from 'react';

// const initialMessages = [
//   { id: 'm-1', name: 'Robert Gable', email: 'r.gable@gableindustries.com', subject: 'Corporate Asset Refinancing Query', message: 'Hi FinBridge team, we are currently reviewing refinancing terms for our $3.5M factory equipment debt. We noticed your interest margins. Who can we sync with to draft a custom quote?', date: '2 hours ago', status: 'Unread' },
//   { id: 'm-2', name: 'Priya Patel', email: 'priya.patel@horizonholdings.com', subject: 'ESG Portfolio Inclusion Request', message: 'Hello! I registered an account and completed onboarding. I want to allocate 30% of my advisory portfolio to ESG carbon-offset index funds. Can my advisor call me?', date: '4 hours ago', status: 'Unread' },
//   { id: 'm-3', name: 'Jonathan Vance', email: 'j.vance@vanceholdings.com', subject: 'Plaid Sync Issues Chase Checking', message: 'Greetings, I have synced Chase Bank checking via Plaid but the assets ledger does not show the sub-balance of the corporate drawings account. Please help.', date: '1 day ago', status: 'Read' },
//   { id: 'm-4', name: 'Linda Miller', email: 'linda.miller@outlook.com', subject: 'HNW Succession Planning Consultation', message: 'Hello, I would like to schedule a session with James Vance regarding wealth succession rules for our family trust. Let me know your slots.', date: '3 days ago', status: 'Read' },
// ];

// export default function ContactMessages() {
//   const [messages, setMessages] = useState(initialMessages);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [filterType, setFilterType] = useState('All'); // 'All', 'Unread', 'Read'
  
//   // Drawer modal state
//   const [selectedMessage, setSelectedMessage] = useState(null);
//   const [replyText, setReplyText] = useState('');
//   const [replySuccess, setReplySuccess] = useState('');

//   const handleMarkRead = (id) => {
//     setMessages(prev => prev.map(m => m.id === id ? { ...m, status: 'Read' } : m));
//     if (selectedMessage && selectedMessage.id === id) {
//       setSelectedMessage(prevM => ({ ...prevM, status: 'Read' }));
//     }
//   };

//   const handleToggleStatus = (id) => {
//     setMessages(prev => prev.map(m => {
//       if (m.id === id) {
//         const nextStatus = m.status === 'Read' ? 'Unread' : 'Read';
//         return { ...m, status: nextStatus };
//       }
//       return m;
//     }));
//   };

//   const handleDelete = (id) => {
//     setMessages(prev => prev.filter(m => m.id !== id));
//     if (selectedMessage && selectedMessage.id === id) {
//       setSelectedMessage(null);
//     }
//   };

//   const handleReplySubmit = (e) => {
//     e.preventDefault();
//     if (!replyText || !selectedMessage) return;

//     setReplySuccess('Reply transmitted to client successfully!');
//     setReplyText('');
    
//     // Mark as read when replied
//     handleMarkRead(selectedMessage.id);

//     setTimeout(() => {
//       setReplySuccess('');
//       setSelectedMessage(null);
//     }, 2000);
//   };

//   const filteredMessages = messages.filter(m => {
//     const matchesSearch = 
//       m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       m.subject.toLowerCase().includes(searchQuery.toLowerCase());
    
//     if (filterType === 'All') return matchesSearch;
//     return matchesSearch && m.status === filterType;
//   });

//   return (
//     <AdminLayout>
//       {/* Header */}
//       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
//         <div>
//           <h1 className="text-headline-lg font-bold text-accent">Inquiries & Support Messages</h1>
//           <p className="text-body-md text-text-muted mt-1">Review contact inquiries, client support queries, and regulatory communication logs.</p>
//         </div>
//       </div>

//       {/* Stats KPI overview */}
//       <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter">
//         {[
//           { label: 'Total Inquiries Recieved', value: messages.length, icon: 'mail', color: 'text-accent bg-accent/10' },
//           { label: 'Pending Response (Unread)', value: messages.filter(m => m.status === 'Unread').length, icon: 'mark_email_unread', color: 'text-warning bg-warning/10' },
//           { label: 'Replied / Read Log', value: messages.filter(m => m.status === 'Read').length, icon: 'mark_email_read', color: 'text-success bg-success/10' },
//           { label: 'Avg Support Response time', value: '45 mins', icon: 'speed', color: 'text-secondary bg-secondary/10' },
//         ].map((s, i) => (
//           <div key={i} className="card p-6 flex items-center gap-4">
//             <div className={`p-3 rounded-xl ${s.color.split(' ')[1]}`}>
//               <span className={`material-symbols-outlined ${s.color.split(' ')[0]}`}>{s.icon}</span>
//             </div>
//             <div>
//               <p className="text-text-muted text-label-lg">{s.label}</p>
//               <p className="text-headline-md font-bold text-accent mt-1">{s.value}</p>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Main Inbox table and Filters */}
//       <div className="card overflow-hidden">
//         <div className="px-8 py-5 border-b border-border flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
//           {/* Filter tabs */}
//           <div className="flex gap-2">
//             {['All', 'Unread', 'Read'].map((type) => (
//               <button
//                 key={type}
//                 onClick={() => setFilterType(type)}
//                 className={`px-4 py-2 rounded-lg text-label-sm font-bold transition-all ${
//                   filterType === type 
//                     ? 'bg-accent text-on-primary shadow' 
//                     : 'text-text-muted hover:bg-surface'
//                 }`}
//               >
//                 {type} Messages
//               </button>
//             ))}
//           </div>

//           <div className="relative">
//             <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">search</span>
//             <input 
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               className="pl-9 pr-4 py-2 rounded-lg border border-border text-body-sm bg-surface focus:outline-none focus:border-secondary w-64" 
//               placeholder="Search sender, email, subject..." 
//             />
//           </div>
//         </div>

//         {/* Message Table list */}
//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead>
//               <tr className="bg-surface text-label-lg text-text-muted uppercase tracking-wider">
//                 <th className="px-6 py-4 text-left">Sender</th>
//                 <th className="px-6 py-4 text-left">Subject</th>
//                 <th className="px-6 py-4 text-left">Date</th>
//                 <th className="px-6 py-4 text-left">Status</th>
//                 <th className="px-6 py-4 text-left">Actions</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-outline-variant/40 text-body-md text-text">
//               {filteredMessages.map((msg) => (
//                 <tr 
//                   key={msg.id} 
//                   className={`hover:bg-surface/30 transition-colors cursor-pointer ${
//                     msg.status === 'Unread' ? 'bg-accent/5 font-semibold' : ''
//                   }`}
//                   onClick={() => { setSelectedMessage(msg); handleMarkRead(msg.id); }}
//                 >
//                   <td className="px-6 py-4">
//                     <div>
//                       <p className="font-bold text-accent">{msg.name}</p>
//                       <p className="text-xs text-text-muted">{msg.email}</p>
//                     </div>
//                   </td>
//                   <td className="px-6 py-4">
//                     <p className="text-accent max-w-[280px] truncate">{msg.subject}</p>
//                     <p className="text-xs text-text-muted max-w-[280px] truncate mt-0.5">{msg.message}</p>
//                   </td>
//                   <td className="px-6 py-4 text-body-sm text-text-muted whitespace-nowrap">{msg.date}</td>
//                   <td className="px-6 py-4">
//                     <span className={`status-badge ${msg.status === 'Unread' ? 'status-warning' : 'status-success'}`}>
//                       {msg.status}
//                     </span>
//                   </td>
//                   <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
//                     <div className="flex gap-2">
//                       <button onClick={() => { setSelectedMessage(msg); handleMarkRead(msg.id); }} className="text-secondary hover:text-accent transition-colors p-1" title="Read"><span className="material-symbols-outlined text-base">visibility</span></button>
//                       <button onClick={() => handleToggleStatus(msg.id)} className="text-secondary hover:text-accent transition-colors p-1" title="Toggle status"><span className="material-symbols-outlined text-base">sync</span></button>
//                       <button onClick={() => handleDelete(msg.id)} className="text-error hover:underline transition-colors p-1" title="Delete"><span className="material-symbols-outlined text-base">delete</span></button>
//                     </div>
//                   </td>
//                 </tr>
//               ))}
//               {filteredMessages.length === 0 && (
//                 <tr>
//                   <td colSpan={5} className="py-8 text-center text-text-muted">Inbox folder is empty.</td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* Message Viewer Drawer */}
//       {selectedMessage && (
//         <div className="fixed inset-0 bg-accent/45 backdrop-blur-sm z-[9999] flex items-center justify-end">
//           <div className="card w-full max-w-lg h-full p-8 relative shadow-2xl flex flex-col justify-between rounded-r-none fade-in">
//             {/* Drawer Header */}
//             <div>
//               <button 
//                 onClick={() => setSelectedMessage(null)}
//                 className="absolute top-4 left-4 text-text-muted hover:text-accent"
//               >
//                 <span className="material-symbols-outlined">close</span>
//               </button>

//               <div className="pt-6 pb-4 border-b border-border/40">
//                 <span className="text-xs text-text-muted font-bold uppercase tracking-widest">{selectedMessage.date}</span>
//                 <h3 className="text-headline-md font-bold text-accent mt-2">{selectedMessage.subject}</h3>
//                 <p className="text-body-sm text-text-muted mt-1">From: <strong>{selectedMessage.name}</strong> ({selectedMessage.email})</p>
//               </div>

//               {/* Message Content */}
//               <div className="py-6 space-y-4">
//                 <label className="text-label-lg font-bold text-accent block">Inquiry Content</label>
//                 <p className="p-4 rounded-xl bg-surface border border-border/35 text-body-md text-accent leading-relaxed">
//                   {selectedMessage.message}
//                 </p>
//               </div>
//             </div>

//             {/* Reply Input Form */}
//             <form onSubmit={handleReplySubmit} className="pt-6 border-t border-border/45 space-y-4 shrink-0">
//               <label className="text-label-lg font-bold text-accent block">Transmit Email Response</label>
              
//               {replySuccess && (
//                 <div className="p-4 rounded-xl bg-success/15 border border-success/35 text-success text-body-sm font-bold flex items-center gap-2">
//                   <span className="material-symbols-outlined text-base">check_circle</span>
//                   {replySuccess}
//                 </div>
//               )}

//               <textarea 
//                 value={replyText}
//                 onChange={(e) => setReplyText(e.target.value)}
//                 placeholder="Compose secure SMTP draft reply..."
//                 className="form-input min-h-[120px] resize-none text-body-sm"
//                 required
//               />

//               <div className="flex gap-2">
//                 <button 
//                   type="button" 
//                   onClick={() => setSelectedMessage(null)}
//                   className="btn-ghost flex-1 py-3"
//                 >
//                   Close Inquiry
//                 </button>
//                 <button 
//                   type="submit" 
//                   className="btn-primary flex-1 py-3 flex justify-center items-center gap-2"
//                 >
//                   <span className="material-symbols-outlined text-sm">send</span>
//                   Send Email
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </AdminLayout>
//   );
// }
// Replace the entire ContactMessages.jsx with this:

import AdminLayout from '../../layouts/AdminLayout';
import { useState } from 'react';

const initialMessages = [
  { id: 'm-1', name: 'Robert Gable', email: 'r.gable@gableindustries.com', subject: 'Corporate Asset Refinancing Query', message: 'Hi FinBridge team, we are currently reviewing refinancing terms for our $3.5M factory equipment debt. We noticed your interest margins. Who can we sync with to draft a custom quote?', date: '2 hours ago', status: 'Unread' },
  { id: 'm-2', name: 'Priya Patel', email: 'priya.patel@horizonholdings.com', subject: 'ESG Portfolio Inclusion Request', message: 'Hello! I registered an account and completed onboarding. I want to allocate 30% of my advisory portfolio to ESG carbon-offset index funds. Can my advisor call me?', date: '4 hours ago', status: 'Unread' },
  { id: 'm-3', name: 'Jonathan Vance', email: 'j.vance@vanceholdings.com', subject: 'Plaid Sync Issues Chase Checking', message: 'Greetings, I have synced Chase Bank checking via Plaid but the assets ledger does not show the sub-balance of the corporate drawings account. Please help.', date: '1 day ago', status: 'Read' },
  { id: 'm-4', name: 'Linda Miller', email: 'linda.miller@outlook.com', subject: 'HNW Succession Planning Consultation', message: 'Hello, I would like to schedule a session with James Vance regarding wealth succession rules for our family trust. Let me know your slots.', date: '3 days ago', status: 'Read' },
];

export default function ContactMessages() {
  const [messages, setMessages] = useState(initialMessages);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [selectedMessage, setSelectedMessage] = useState(null);

  const handleMarkRead = (id) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, status: 'Read' } : m));
    if (selectedMessage && selectedMessage.id === id) {
      setSelectedMessage(prevM => ({ ...prevM, status: 'Read' }));
    }
  };

  const handleDelete = (id) => {
    setMessages(prev => prev.filter(m => m.id !== id));
    if (selectedMessage && selectedMessage.id === id) setSelectedMessage(null);
  };

  const filteredMessages = messages.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         m.subject.toLowerCase().includes(searchQuery.toLowerCase());
    if (filterType === 'All') return matchesSearch;
    return matchesSearch && m.status === filterType;
  });

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-headline-lg font-bold text-accent">Inquiries & Support Messages</h1>
          <p className="text-body-md text-text-muted">Review contact inquiries and client support queries.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter mb-8">
        {[
          { label: 'Total Inquiries', value: messages.length, icon: 'mail' },
          { label: 'Unread', value: messages.filter(m => m.status === 'Unread').length, icon: 'mark_email_unread' },
          { label: 'Read', value: messages.filter(m => m.status === 'Read').length, icon: 'mark_email_read' },
        ].map((s, i) => (
          <div key={i} className="card p-6">
            <span className="material-symbols-outlined text-3xl text-accent mb-2">{s.icon}</span>
            <p className="text-headline-md font-bold text-accent">{s.value}</p>
            <p className="text-text-muted">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="px-8 py-5 border-b border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex gap-2">
            {['All', 'Unread', 'Read'].map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-4 py-2 rounded-lg text-sm font-bold ${filterType === type ? 'bg-accent text-white' : 'text-text-muted hover:bg-surface'}`}
              >
                {type}
              </button>
            ))}
          </div>
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search messages..."
            className="pl-9 pr-4 py-2 border border-border rounded-xl w-80 bg-surface"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-surface text-text-muted uppercase text-sm tracking-wider">
                <th className="px-6 py-4 text-left">Sender</th>
                <th className="px-6 py-4 text-left">Subject</th>
                <th className="px-6 py-4 text-left">Date</th>
                <th className="px-6 py-4 text-left">Status</th>
                <th className="px-6 py-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMessages.map(msg => (
                <tr key={msg.id} className="border-t border-border hover:bg-surface/50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-semibold">{msg.name}</p>
                      <p className="text-sm text-text-muted">{msg.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium">{msg.subject}</p>
                  </td>
                  <td className="px-6 py-4 text-text-muted">{msg.date}</td>
                  <td className="px-6 py-4">
                    <span className={`status-badge ${msg.status === 'Unread' ? 'status-warning' : 'status-success'}`}>{msg.status}</span>
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => { setSelectedMessage(msg); handleMarkRead(msg.id); }}
                      className="text-accent hover:text-white p-2"
                    >
                      <span className="material-symbols-outlined">visibility</span>
                    </button>
                    <button onClick={() => handleDelete(msg.id)} className="text-error p-2">
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Clean Message Viewer */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-black/70 z-[9999] flex items-center justify-center">
          <div className="bg-surface rounded-3xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-auto">
            <button onClick={() => setSelectedMessage(null)} className="float-right text-text-muted hover:text-accent">
              ✕
            </button>
            
            <div className="pt-8">
              <p className="text-xs uppercase tracking-widest text-text-muted">{selectedMessage.date}</p>
              <h2 className="text-2xl font-bold text-accent mt-2">{selectedMessage.subject}</h2>
              <p className="text-text-muted mt-1">From: <strong>{selectedMessage.name}</strong> • {selectedMessage.email}</p>

              <div className="mt-8 p-6 bg-bg rounded-2xl border border-border">
                <p className="text-body-md leading-relaxed text-accent">
                  {selectedMessage.message}
                </p>
              </div>
            </div>

            <button 
              onClick={() => setSelectedMessage(null)}
              className="mt-8 w-full btn-primary py-3"
            >
              Close Message
            </button>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}