import { useState } from 'react';
import B2BLayout from '../../layouts/B2BLayout';
import { useB2BAuth } from '../../context/B2BAuthContext';
import toast from 'react-hot-toast';

export default function B2BSettings() {
  const { company } = useB2BAuth();
  const [tab, setTab] = useState('profile');

  // Password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Notification preferences state
  const [notifications, setNotifications] = useState({
    serviceRequestStatus: true,
    newProposalReceived: true,
    meetingReminders: true,
    invoicePaymentAlerts: true,
    kycVerificationUpdates: true,
    supportTicketUpdates: true,
  });
  const [notificationsChanged, setNotificationsChanged] = useState(false);

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('All password fields are required');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters');
      return;
    }
    if (newPassword === currentPassword) {
      toast.error('New password must be different from current password');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New password and confirm password do not match');
      return;
    }
    toast.success('Password updated (demo)');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleNotificationToggle = (key) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
    setNotificationsChanged(true);
  };

  const handleSaveNotifications = () => {
    setNotificationsChanged(false);
    toast.success('Preferences saved');
  };

  return (
    <B2BLayout>
      <div>
        <h1 className="text-xl font-bold text-accent">Settings</h1>
        <p className="text-text-muted text-sm mt-0.5">Manage your company account settings</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {['profile', 'security', 'notifications'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2.5 text-sm font-semibold capitalize transition-colors border-b-2 -mb-px
              ${tab === t ? 'border-accent text-accent' : 'border-transparent text-text-muted hover:text-text'}`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'profile' && (
        <div className="card p-6 max-w-2xl space-y-5">
          <h2 className="font-bold text-accent">Company Profile</h2>

          {/* Read-only info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: 'Company Name', value: company?.companyName },
              { label: 'Industry', value: company?.industry },
              { label: 'VAT Number (BIN)', value: company?.gstin },
              { label: 'KYC Status', value: company?.kycVerified ? 'Verified' : 'Pending' },
              { label: 'Account Status', value: company?.status },
              { label: 'Your Role', value: company?.role?.replace(/_/g, ' ') },
            ].map((f) => (
              <div key={f.label}>
                <label className="text-xs text-text-muted block mb-1">{f.label}</label>
                <div className="w-full p-2.5 rounded-xl border border-border bg-bg text-sm text-text-muted">{f.value || '—'}</div>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-border">
            <p className="text-xs text-text-muted">
              To update company details or VAT Number (BIN), please raise a support ticket or contact your assigned consultant.
            </p>
          </div>
        </div>
      )}

      {tab === 'security' && (
        <div className="card p-6 max-w-lg">
          <h2 className="font-bold text-accent mb-5">Change Password</h2>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            {['Current Password', 'New Password', 'Confirm New Password'].map((label, idx) => {
              const value = [currentPassword, newPassword, confirmPassword][idx];
              const setValue = [setCurrentPassword, setNewPassword, setConfirmPassword][idx];
              return (
                <div key={label}>
                  <label className="text-xs text-text-muted block mb-1">{label}</label>
                  <input
                    type="password"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-border bg-bg text-sm"
                    placeholder="••••••••"
                  />
                </div>
              );
            })}
            <button type="submit" className="btn-primary px-6 py-2.5">Update Password</button>
          </form>
        </div>
      )}

      {tab === 'notifications' && (
        <div className="card p-6 max-w-lg">
          <h2 className="font-bold text-accent mb-5">Notification Preferences</h2>
          <div className="space-y-4">
            {[
              { key: 'serviceRequestStatus', label: 'Service request status updates' },
              { key: 'newProposalReceived', label: 'New proposal received' },
              { key: 'meetingReminders', label: 'Meeting reminders' },
              { key: 'invoicePaymentAlerts', label: 'Invoice and payment alerts' },
              { key: 'kycVerificationUpdates', label: 'KYC verification updates' },
              { key: 'supportTicketUpdates', label: 'Support ticket updates' },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center justify-between cursor-pointer p-3 rounded-xl hover:bg-surface-hover transition-colors">
                <span className="text-sm text-text">{label}</span>
                <input
                  type="checkbox"
                  checked={notifications[key]}
                  onChange={() => handleNotificationToggle(key)}
                  className="w-4 h-4 accent-[var(--color-accent)]"
                />
              </label>
            ))}
          </div>
          <button
            onClick={handleSaveNotifications}
            disabled={!notificationsChanged}
            className="btn-primary mt-5 px-6 py-2.5 disabled:opacity-60"
          >
            Save Preferences
          </button>
        </div>
      )}
    </B2BLayout>
  );
}