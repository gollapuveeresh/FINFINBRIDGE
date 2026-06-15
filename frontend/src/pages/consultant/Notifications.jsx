import { useState, useEffect } from 'react';
import ConsultantLayout from '../../layouts/ConsultantLayout';
import api from '../../services/api';

export default function ConsultantNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/notifications');
      if (res.data && res.data.status === 'success') {
        setNotifications(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      setError(err.response?.data?.message || 'Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  };

  const markAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const markRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (loading) {
    return (
      <ConsultantLayout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center">
          <div className="w-12 h-12 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-body-md text-text-muted mt-4 font-semibold">Loading notifications...</p>
        </div>
      </ConsultantLayout>
    );
  }

  return (
    <ConsultantLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-headline-lg font-bold text-accent">Notifications</h1>
          <p className="text-body-md text-text-muted mt-1">Updates on client bookings, profile revisions, and platform activities.</p>
        </div>
        {unreadCount > 0 && (
          <div className="flex gap-3">
            <button onClick={markAllRead} className="btn-ghost text-label-sm py-2 px-4">Mark All as Read</button>
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-error/10 border border-error/30 text-error text-body-sm font-bold">
          {error}
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="px-8 py-4 border-b border-border flex justify-between items-center bg-surface-hover-lowest">
          <h3 className="text-headline-md font-bold text-accent">System Ledger</h3>
          <span className="text-xs px-2.5 py-1 bg-accent/10 text-accent rounded-full font-bold">
            {unreadCount} unread alerts
          </span>
        </div>

        <div className="divide-y divide-outline-variant/35">
          {notifications.map((n) => {
            const timeStr = new Date(n.createdAt).toLocaleString();
            return (
              <div key={n._id} className={`px-8 py-5 flex items-start gap-4 hover:bg-surface/20 transition-colors ${!n.isRead ? 'bg-accent/[0.02]' : 'opacity-75'}`}>
                <div className={`p-2.5 rounded-xl shrink-0 ${!n.isRead ? 'text-secondary bg-secondary/10' : 'text-text-muted bg-surface-hover-high'}`}>
                  <span className="material-symbols-outlined">{n.type === 'consultation' ? 'event' : 'notifications'}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-accent">{n.title}</h3>
                        {!n.isRead && <span className="w-2 h-2 rounded-full bg-secondary"></span>}
                      </div>
                      <p className="text-body-sm text-text-muted mt-1">{n.message}</p>
                      <p className="text-xs text-text-muted mt-2 flex items-center gap-1 font-mono">
                        <span className="material-symbols-outlined text-xs">schedule</span>{timeStr}
                      </p>
                    </div>
                    {!n.isRead && (
                      <button 
                        onClick={() => markRead(n._id)}
                        className="text-secondary hover:text-accent font-bold text-xs hover:underline shrink-0"
                      >
                        Mark read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          {notifications.length === 0 && (
            <div className="p-12 text-center flex flex-col items-center justify-center max-w-xl mx-auto space-y-4">
              <div className="w-16 h-16 bg-surface-hover rounded-2xl flex items-center justify-center border border-border text-text-muted shadow-sm">
                <span className="material-symbols-outlined text-3xl">notifications_off</span>
              </div>
              <div>
                <h3 className="text-headline-md font-bold text-accent">All Caught Up!</h3>
                <p className="text-body-md text-text-muted mt-2">
                  You have no notifications or advisory bookings to show.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </ConsultantLayout>
  );
}
