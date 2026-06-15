// import AdminLayout from '../../layouts/AdminLayout';
// import { useState } from 'react';

// const tabs = [
//   { id: 'general', label: 'General', icon: 'settings' },
//   { id: 'company', label: 'Company Info', icon: 'business' },
//   { id: 'email', label: 'Email SMTP', icon: 'mail' },
//   { id: 'notifications', label: 'Notifications', icon: 'notifications' },
//   { id: 'security', label: 'Security', icon: 'security' },
//   { id: 'api', label: 'API & Integrations', icon: 'api' },
//   { id: 'backup', label: 'Backups', icon: 'backup' }
// ];

// export default function SystemSettings() {
//   const [activeTab, setActiveTab] = useState('general');
//   const [success, setSuccess] = useState('');

//   // Settings State Variables
//   const [companyName, setCompanyName] = useState('FinBridge Solutions');
//   const [timezone, setTimezone] = useState('UTC-5 (EST)');
//   const [smtpHost, setSmtpHost] = useState('smtp.finbridge.com');
//   const [plaidFrequency, setPlaidFrequency] = useState('15');
//   const [sessionTimeout, setSessionTimeout] = useState('30');
//   const [backupSchedule, setBackupSchedule] = useState('Daily (2:00 AM UTC)');
//   const [twoFaEnforced, setTwoFaEnforced] = useState(true);

//   const handleSaveSettings = (e) => {
//     e.preventDefault();
//     setSuccess('System configuration parameters synced to registry!');
//     setTimeout(() => setSuccess(''), 3000);
//   };

//   return (
//     <AdminLayout>
//       {/* Header */}
//       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
//         <div>
//           <h1 className="text-headline-lg font-bold text-accent">System Settings</h1>
//           <p className="text-body-md text-text-muted mt-1">Configure practice parameters, secure SMTP keys, token lifespans, and automated backups.</p>
//         </div>
//       </div>

//       {/* Settings Tab Layout */}
//       <div className="grid grid-cols-12 gap-gutter">
//         {/* Left Side: Vertical Tabs */}
//         <div className="col-span-12 lg:col-span-3 card flex flex-col overflow-hidden h-fit">
//           <div className="flex flex-col p-2 bg-surface-hover-lowest divide-y divide-outline-variant/30">
//             {tabs.map((tab) => (
//               <button
//                 key={tab.id}
//                 onClick={() => { setActiveTab(tab.id); setSuccess(''); }}
//                 className={`w-full px-6 py-4 text-label-lg font-semibold flex items-center gap-3 transition-colors text-left border-r-4 ${
//                   activeTab === tab.id
//                     ? 'bg-surface-hover text-accent border-secondary font-bold'
//                     : 'border-transparent text-text-muted hover:text-accent hover:bg-surface/20'
//                 }`}
//               >
//                 <span className="material-symbols-outlined text-base flex items-center">{tab.icon}</span>
//                 <span>{tab.label}</span>
//               </button>
//             ))}
//           </div>
//         </div>

//         {/* Right Side: Tab Workspace Panel */}
//         <div className="col-span-12 lg:col-span-9 card p-8 min-h-[500px] flex flex-col justify-between">
//           <form onSubmit={handleSaveSettings} className="space-y-6 flex-1 flex flex-col justify-between">
//             <div className="space-y-6">
//               {success && (
//                 <div className="p-4 rounded-xl bg-success/15 border border-success/35 text-success text-body-sm font-bold flex items-center gap-2">
//                   <span className="material-symbols-outlined text-base">check_circle</span>
//                   {success}
//                 </div>
//               )}

//               {/* PANEL: General */}
//               {activeTab === 'general' && (
//                 <div className="space-y-4 fade-in">
//                   <h3 className="text-headline-md font-bold text-accent pb-3 border-b border-border">General Configuration</h3>
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                     <div className="space-y-2">
//                       <label className="text-label-lg text-accent font-bold">Default Timezone</label>
//                       <select 
//                         value={timezone} 
//                         onChange={(e) => setTimezone(e.target.value)}
//                         className="form-input font-medium text-accent"
//                       >
//                         <option value="UTC-5 (EST)">UTC-5 (EST - Eastern Standard Time)</option>
//                         <option value="UTC-8 (PST)">UTC-8 (PST - Pacific Standard Time)</option>
//                         <option value="UTC+0 (GMT)">UTC+0 (GMT - Greenwich Mean Time)</option>
//                         <option value="UTC+5:30 (IST)">UTC+5:30 (IST - Indian Standard Time)</option>
//                       </select>
//                     </div>
//                     <div className="space-y-2">
//                       <label className="text-label-lg text-accent font-bold">Standard Practice Currency</label>
//                       <select className="form-input font-medium text-accent">
//                         <option>USD ($) — United States Dollar</option>
//                         <option>EUR (€) — Euro</option>
//                         <option>GBP (£) — British Pound</option>
//                       </select>
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {/* PANEL: Company */}
//               {activeTab === 'company' && (
//                 <div className="space-y-4 fade-in">
//                   <h3 className="text-headline-md font-bold text-accent pb-3 border-b border-border">Company Information</h3>
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                     <div className="space-y-2">
//                       <label className="text-label-lg text-accent font-bold">Legal Corporate Name</label>
//                       <input 
//                         type="text" 
//                         value={companyName}
//                         onChange={(e) => setCompanyName(e.target.value)}
//                         className="form-input" 
//                       />
//                     </div>
//                     <div className="space-y-2">
//                       <label className="text-label-lg text-accent font-bold">Support Gateway Email</label>
//                       <input type="email" defaultValue="support@finbridge.com" className="form-input" />
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {/* PANEL: Email */}
//               {activeTab === 'email' && (
//                 <div className="space-y-4 fade-in">
//                   <h3 className="text-headline-md font-bold text-accent pb-3 border-b border-border">SMTP Server Keys</h3>
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                     <div className="space-y-2">
//                       <label className="text-label-lg text-accent font-bold">SMTP Relay Host</label>
//                       <input 
//                         type="text" 
//                         value={smtpHost}
//                         onChange={(e) => setSmtpHost(e.target.value)}
//                         className="form-input" 
//                       />
//                     </div>
//                     <div className="space-y-2">
//                       <label className="text-label-lg text-accent font-bold">Relay Connection Port</label>
//                       <input type="number" defaultValue="465" className="form-input" />
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {/* PANEL: Notifications */}
//               {activeTab === 'notifications' && (
//                 <div className="space-y-4 fade-in">
//                   <h3 className="text-headline-md font-bold text-accent pb-3 border-b border-border">System Digests & Alerts</h3>
//                   <div className="space-y-3">
//                     <div className="flex justify-between items-center py-2.5">
//                       <div>
//                         <p className="text-body-sm font-bold text-accent">Daily Activity digest</p>
//                         <p className="text-xs text-text-muted">Send combined user event reports at end of day</p>
//                       </div>
//                       <button type="button" className="w-12 h-6 rounded-full bg-success relative">
//                         <div className="w-4 h-4 rounded-full bg-white absolute top-1 right-1"></div>
//                       </button>
//                     </div>
//                     <div className="flex justify-between items-center py-2.5 border-t border-border/35">
//                       <div>
//                         <p className="text-body-sm font-bold text-accent">System Uptime warning triggers</p>
//                         <p className="text-xs text-text-muted">Immediate SMTP alerts when node response exceeds 500ms</p>
//                       </div>
//                       <button type="button" className="w-12 h-6 rounded-full bg-success relative">
//                         <div className="w-4 h-4 rounded-full bg-white absolute top-1 right-1"></div>
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {/* PANEL: Security */}
//               {activeTab === 'security' && (
//                 <div className="space-y-4 fade-in">
//                   <h3 className="text-headline-md font-bold text-accent pb-3 border-b border-border">Access Control & Sessions</h3>
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
//                     <div className="space-y-2">
//                       <label className="text-label-lg text-accent font-bold">Session Idle Timeout (Mins)</label>
//                       <input 
//                         type="number" 
//                         value={sessionTimeout}
//                         onChange={(e) => setSessionTimeout(e.target.value)}
//                         className="form-input" 
//                       />
//                     </div>
//                     <div className="space-y-2">
//                       <label className="text-label-lg text-accent font-bold">Password Expiry Lifespan</label>
//                       <select className="form-input font-medium text-accent">
//                         <option>90 Days (Recommended)</option>
//                         <option>180 Days</option>
//                         <option>Never Expire</option>
//                       </select>
//                     </div>
//                   </div>
                  
//                   <div className="flex justify-between items-center py-4 border-t border-border/35">
//                     <div>
//                       <p className="text-body-sm font-bold text-accent">Enforce Multi-Factor Authentication (MFA)</p>
//                       <p className="text-xs text-text-muted">Block login if active 2FA parameters are not configured</p>
//                     </div>
//                     <button 
//                       type="button" 
//                       onClick={() => setTwoFaEnforced(!twoFaEnforced)}
//                       className={`w-12 h-6 rounded-full relative transition-all ${twoFaEnforced ? 'bg-success' : 'bg-outline-variant'}`}
//                     >
//                       <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${twoFaEnforced ? 'right-1' : 'left-1'}`}></div>
//                     </button>
//                   </div>
//                 </div>
//               )}

//               {/* PANEL: API */}
//               {activeTab === 'api' && (
//                 <div className="space-y-4 fade-in">
//                   <h3 className="text-headline-md font-bold text-accent pb-3 border-b border-border">API Integrations</h3>
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                     <div className="space-y-2">
//                       <label className="text-label-lg text-accent font-bold">Plaid Sync Interval (Hours)</label>
//                       <input 
//                         type="number" 
//                         value={plaidFrequency}
//                         onChange={(e) => setPlaidFrequency(e.target.value)}
//                         className="form-input" 
//                       />
//                     </div>
//                     <div className="space-y-2">
//                       <label className="text-label-lg text-accent font-bold">Regulatory Log webhook endpoint</label>
//                       <input type="text" defaultValue="https://sec-logs.finbridge.com/v1/event" className="form-input font-mono text-xs" />
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {/* PANEL: Backup */}
//               {activeTab === 'backup' && (
//                 <div className="space-y-4 fade-in">
//                   <h3 className="text-headline-md font-bold text-accent pb-3 border-b border-border">System Backups</h3>
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
//                     <div className="space-y-2">
//                       <label className="text-label-lg text-accent font-bold">Backup Schedule Interval</label>
//                       <select 
//                         value={backupSchedule}
//                         onChange={(e) => setBackupSchedule(e.target.value)}
//                         className="form-input font-bold"
//                       >
//                         <option value="Daily (2:00 AM UTC)">Daily (2:00 AM UTC)</option>
//                         <option value="Weekly (Sunday)">Weekly (Sunday)</option>
//                         <option value="Manual Only">Manual Only</option>
//                       </select>
//                     </div>
//                     <div className="space-y-2">
//                       <label className="text-label-lg text-accent font-bold">Backup Destination</label>
//                       <select className="form-input font-bold">
//                         <option>AWS S3 Bucket (Finbridge-Backups)</option>
//                         <option>Google Cloud Storage Node</option>
//                       </select>
//                     </div>
//                   </div>

//                   <div className="p-5 rounded-xl border border-secondary/20 bg-secondary/5 flex justify-between items-center">
//                     <div>
//                       <p className="text-body-sm font-bold text-accent">Immediate Practice Export</p>
//                       <p className="text-xs text-text-muted">Generate immediate secure ZIP archive database export.</p>
//                     </div>
//                     <button type="button" className="btn-secondary py-2 px-4 text-body-sm">
//                       Run Backup Now
//                     </button>
//                   </div>
//                 </div>
//               )}
//             </div>

//             <div className="pt-8 border-t border-border/40 flex justify-between items-center shrink-0">
//               <span className="text-xs text-text-muted font-bold">FinBridge System Configuration Panel</span>
//               <button type="submit" className="btn-primary py-3 px-6 text-label-lg">
//                 Save Settings
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>
//     </AdminLayout>
//   );
// }

// Key changes in SystemSettings.jsx or Notifications tab:
import React, { useState } from 'react';
import AdminLayout from '../../layouts/AdminLayout';   // ✅ Correct import

export default function SystemSettings() {
  const [activeTab, setActiveTab] = useState('general');
  const [currency, setCurrency] = useState('USD');
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    smsAlerts: true,
    pushNotifications: true,
    weeklyReports: false,
    securityAlerts: true,
  });

  const toggleNotification = (key) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-headline-lg font-bold text-accent">System Settings</h1>
        <p className="text-text-muted">Configure platform preferences and global settings</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border mb-8">
        {['general', 'notifications'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-8 py-4 font-semibold capitalize border-b-2 transition-all ${
              activeTab === tab 
                ? 'border-accent text-accent' 
                : 'border-transparent text-text-muted hover:text-text'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* GENERAL TAB */}
      {activeTab === 'general' && (
        <div className="card p-8 max-w-2xl">
          <h2 className="text-headline-md font-bold mb-6">General Configuration</h2>
          
          <div className="space-y-8">
            <div>
              <label className="block text-sm font-medium mb-2">Standard Practice Currency</label>
              <select 
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full p-4 border border-border rounded-2xl bg-surface text-lg"
              >
                <option value="USD">USD - United States Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound Sterling</option>
                <option value="INR">INR - Indian Rupee</option>
                <option value="BDT">BDT - Bangladeshi Taka</option>
                <option value="SGD">SGD - Singapore Dollar</option>
              </select>
            </div>

            {/* Other general settings can go here */}
          </div>
        </div>
      )}

      {/* NOTIFICATIONS TAB */}
      {activeTab === 'notifications' && (
        <div className="card p-8">
          <h2 className="text-headline-md font-bold mb-6">Notification Preferences</h2>
          
          <div className="space-y-6">
            {Object.entries(notifications).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between py-4 border-b border-border last:border-0">
                <div>
                  <p className="font-semibold capitalize">
                    {key.replace(/([A-Z])/g, ' $1')}
                  </p>
                  <p className="text-sm text-text-muted">Enable {key.toLowerCase().replace(/([A-Z])/g, ' $1')}</p>
                </div>
                <button
                  onClick={() => toggleNotification(key)}
                  className={`relative w-14 h-7 rounded-full transition-colors ${value ? 'bg-accent' : 'bg-surface-hover-high'}`}
                >
                  <div 
                    className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all duration-200 ${value ? 'left-8' : 'left-1'}`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </AdminLayout>
  );
}