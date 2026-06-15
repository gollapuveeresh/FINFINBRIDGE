import { useState } from 'react';
import ClientLayout from '../../layouts/ClientLayout';

const notifications = [
  { type: 'payment', icon: 'payments', color: 'text-success bg-success/10', title: 'Payment Processed', desc: 'Your October subscription payment of $1,499.00 was successfully processed.', time: '2 hours ago', read: false },
  { type: 'consultation', icon: 'event', color: 'text-secondary bg-secondary/10', title: 'Consultation Reminder', desc: 'You have an upcoming session with Sarah Jenkins tomorrow at 10:00 AM.', time: '5 hours ago', read: false },
  { type: 'report', icon: 'analytics', color: 'text-accent bg-accent/10', title: 'New Report Available', desc: 'Your Q3 2024 Financial Performance Review is ready to download.', time: '1 day ago', read: false },
  { type: 'alert', icon: 'security', color: 'text-warning bg-warning/10', title: 'Security Alert', desc: 'A new device logged into your account from Chicago, IL. Please verify if this was you.', time: '2 days ago', read: true },
  { type: 'loan', icon: 'account_balance', color: 'text-accent bg-accent/10', title: 'Loan Payment Due Soon', desc: 'Your loan payment of $4,250 is due in 7 days (November 01, 2024).', time: '3 days ago', read: true },
  { type: 'market', icon: 'trending_up', color: 'text-success bg-success/10', title: 'Portfolio Milestone', desc: 'Your investment portfolio has crossed the $1.2M mark!', time: '4 days ago', read: true },
  { type: 'tax', icon: 'receipt_long', color: 'text-secondary bg-secondary/10', title: 'Tax Optimization Tip', desc: 'Contributing $6,500 to your IRA before Dec 31 could save you $2,275 in taxes.', time: '5 days ago', read: true },
  { type: 'system', icon: 'system_update', color: 'text-text-muted bg-surface-hover-high', title: 'Platform Update', desc: 'FinBridge has been updated to v3.4.0 with new CRM features and improved reporting.', time: '1 week ago', read: true },
];

export default function Notifications() {
  const [list, setList] = useState(notifications);
  const [activeTab, setActiveTab] = useState('All');

  const handleMarkAllRead = () => {
    setList(list.map(n => ({ ...n, read: true })));
  };

  const getFilterType = (tab) => {
    if (tab === 'All') return 'all';
    if (tab.startsWith('Unread')) return 'unread';
    if (tab === 'Payments') return 'payment';
    if (tab === 'Security') return 'alert';
    if (tab === 'Reports') return 'report';
    return 'all';
  };

  const unreadCount = list.filter(n => !n.read).length;
  const tabs = ['All', `Unread (${unreadCount})`, 'Payments', 'Security', 'Reports'];

  const filteredNotifications = list.filter(n => {
    const filter = getFilterType(activeTab);
    if (filter === 'all') return true;
    if (filter === 'unread') return !n.read;
    return n.type === filter;
  });

  const todayNotifications = filteredNotifications.filter(n => n.time.includes('hours'));
  const earlierNotifications = filteredNotifications.filter(n => !n.time.includes('hours'));

  return (
    <ClientLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-headline-lg font-bold text-accent">Notifications</h1>
          <p className="text-body-md text-text-muted mt-1">Stay updated on your financial activity and platform events.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleMarkAllRead}
            className="btn-ghost text-label-sm py-2 px-4 cursor-pointer font-sans"
          >
            Mark All as Read
          </button>
          <button className="btn-ghost text-label-sm py-2 px-4 flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">tune</span>Settings
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-border pb-0 my-4">
        {tabs.map((tab) => (
          <button 
            key={tab} 
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 text-label-lg font-semibold transition-all border-b-2 cursor-pointer font-sans ${
              (activeTab === tab || (activeTab.startsWith('Unread') && tab.startsWith('Unread')))
                ? 'border-secondary text-accent' 
                : 'border-transparent text-text-muted hover:text-accent'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Notification Groups */}
      <div className="card overflow-hidden">
        {todayNotifications.length > 0 && (
          <>
            {/* Today */}
            <div className="px-8 py-3 bg-surface border-b border-border">
              <span className="text-label-sm text-text-muted font-bold uppercase tracking-wider">Today</span>
            </div>
            <div className="divide-y divide-outline-variant/50">
              {todayNotifications.map((n, i) => (
                <div key={i} className={`px-8 py-5 flex items-start gap-4 hover:bg-surface/50 transition-colors ${!n.read ? 'bg-accent/[0.02]' : ''}`}>
                  <div className={`p-2.5 rounded-xl shrink-0 ${n.color.split(' ')[1]}`}>
                    <span className={`material-symbols-outlined ${n.color.split(' ')[0]}`}>{n.icon}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-accent">{n.title}</h3>
                          {!n.read && <div className="w-2 h-2 rounded-full bg-secondary"></div>}
                        </div>
                        <p className="text-body-sm text-text-muted mt-1">{n.desc}</p>
                        <p className="text-xs text-text-muted mt-2 flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">schedule</span>{n.time}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {earlierNotifications.length > 0 && (
          <>
            {/* Earlier */}
            <div className="px-8 py-3 bg-surface border-y border-border">
              <span className="text-label-sm text-text-muted font-bold uppercase tracking-wider">Earlier This Week</span>
            </div>
            <div className="divide-y divide-outline-variant/50">
              {earlierNotifications.map((n, i) => (
                <div key={i} className={`px-8 py-5 flex items-start gap-4 hover:bg-surface/50 transition-colors opacity-75`}>
                  <div className={`p-2.5 rounded-xl shrink-0 ${n.color.split(' ')[1]}`}>
                    <span className={`material-symbols-outlined ${n.color.split(' ')[0]}`}>{n.icon}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h3 className="font-bold text-text">{n.title}</h3>
                        <p className="text-body-sm text-text-muted mt-1">{n.desc}</p>
                        <p className="text-xs text-text-muted mt-2 flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">schedule</span>{n.time}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {filteredNotifications.length === 0 && (
          <div className="p-12 text-center text-text-muted font-medium">
            No notifications match the active filter.
          </div>
        )}
      </div>
    </ClientLayout>
  );
}
