import ClientLayout from '../../layouts/ClientLayout';
import { useState } from 'react';

const tabs = ['Personal Info', 'Security', 'Notifications', 'Integrations', 'Preferences'];

export default function ProfileAccountSettings() {
  const [activeTab, setActiveTab] = useState(0);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);

  const handleSaveChanges = () => {
    setShowSuccessAlert(true);
    setTimeout(() => {
      setShowSuccessAlert(false);
    }, 4000);
  };

  return (
    <ClientLayout>
      <div>
        <h1 className="text-headline-lg font-bold text-accent">Profile & Account Settings</h1>
        <p className="text-body-md text-text-muted mt-1">Manage your personal information, security, and preferences.</p>
      </div>

      <div className="grid grid-cols-12 gap-gutter">
        {/* Profile Card */}
        <div className="col-span-12 lg:col-span-3 card p-8 flex flex-col items-center text-center h-fit">
          <div className="relative mb-4">
            <div className="w-24 h-24 rounded-full bg-accent-container flex items-center justify-center text-on-primary font-bold text-3xl border-4 border-surface shadow-lg">A</div>
            <button className="absolute bottom-0 right-0 w-8 h-8 bg-accent text-on-primary rounded-full flex items-center justify-center hover:bg-accent/90 transition-colors">
              <span className="material-symbols-outlined text-sm">edit</span>
            </button>
          </div>
          <h2 className="text-headline-md font-bold text-accent">Alexander Vance</h2>
          <p className="text-body-sm text-text-muted mt-1">Premium Enterprise Client</p>
          <div className="flex items-center gap-1 mt-2 text-success">
            <span className="material-symbols-outlined text-sm">verified</span>
            <span className="text-label-sm font-bold">Verified Account</span>
          </div>
          <div className="w-full mt-6 pt-6 border-t border-border space-y-3 text-left">
            {[
              { icon: 'mail', label: 'a.vance@corporation.com' },
              { icon: 'call', label: '+1 (555) 123-4567' },
              { icon: 'location_on', label: 'New York, USA' },
              { icon: 'calendar_today', label: 'Member since Jan 2021' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-body-sm text-text-muted">
                <span className="material-symbols-outlined text-text-faint text-base">{item.icon}</span>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Settings Panels */}
        <div className="col-span-12 lg:col-span-9 space-y-gutter">
          {showSuccessAlert && (
            <div className="p-4 bg-success/10 border border-success/25 rounded-xl text-success text-body-sm flex items-center gap-3 fade-in">
              <span className="material-symbols-outlined text-lg shrink-0">check_circle</span>
              <span>Settings successfully updated.</span>
            </div>
          )}

          {/* Tabs */}
          <div className="card overflow-hidden">
            <div className="flex border-b border-border overflow-x-auto">
              {tabs.map((tab, i) => (
                <button
                  key={tab}
                  onClick={() => { setActiveTab(i); setShowSuccessAlert(false); }}
                  className={`px-6 py-4 text-label-lg font-semibold transition-all whitespace-nowrap border-b-2 ${activeTab === i ? 'border-secondary text-accent' : 'border-transparent text-text-muted hover:text-accent'}`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="p-8">
              {activeTab === 0 && (
                <div className="space-y-6 fade-in">
                  <h3 className="text-headline-md font-bold text-accent">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      { label: 'First Name', value: 'Alexander', type: 'text' },
                      { label: 'Last Name', value: 'Vance', type: 'text' },
                      { label: 'Email Address', value: 'a.vance@corporation.com', type: 'email' },
                      { label: 'Phone Number', value: '+1 (555) 123-4567', type: 'tel' },
                      { label: 'Job Title', value: 'Chief Financial Officer', type: 'text' },
                      { label: 'Company', value: 'Vance Corporation Ltd.', type: 'text' },
                    ].map((field, i) => (
                      <div key={i} className="space-y-2">
                        <label className="text-label-lg text-text">{field.label}</label>
                        <input className="form-input" defaultValue={field.value} type={field.type} />
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <label className="text-label-lg text-text">Bio</label>
                    <textarea className="form-input min-h-[120px] resize-none" defaultValue="CFO and financial strategist with 20+ years in institutional investment management. Focused on long-term value creation and portfolio optimization." />
                  </div>
                  <div className="flex justify-end gap-3">
                    <button className="btn-ghost">Cancel</button>
                    <button onClick={handleSaveChanges} className="btn-primary cursor-pointer font-sans">Save Changes</button>
                  </div>
                </div>
              )}

              {activeTab === 1 && (
                <div className="space-y-6 fade-in">
                  <h3 className="text-headline-md font-bold text-accent">Security Settings</h3>
                  {/* Change Password */}
                  <div className="p-6 rounded-xl border border-border">
                    <h4 className="font-bold text-text mb-4">Change Password</h4>
                    <div className="space-y-4">
                      {['Current Password', 'New Password', 'Confirm New Password'].map((label) => (
                        <div key={label} className="space-y-2">
                          <label className="text-label-lg text-text">{label}</label>
                          <input className="form-input" type="password" placeholder="••••••••" />
                        </div>
                      ))}
                      <button onClick={handleSaveChanges} className="btn-primary cursor-pointer font-sans">Update Password</button>
                    </div>
                  </div>
                  {/* 2FA */}
                  <div className="p-6 rounded-xl border border-success/30 bg-success/5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <span className="material-symbols-outlined text-success mt-1">verified_user</span>
                        <div>
                          <p className="font-bold text-text">Two-Factor Authentication</p>
                          <p className="text-body-sm text-text-muted mt-1">Your account is protected with 2FA via authenticator app.</p>
                        </div>
                      </div>
                      <span className="status-badge status-success">Enabled</span>
                    </div>
                  </div>
                  {/* Sessions */}
                  <div className="p-6 rounded-xl border border-border">
                    <h4 className="font-bold text-text mb-4">Active Sessions</h4>
                    {[
                      { device: 'MacBook Pro', location: 'New York, USA', current: true, time: 'Now' },
                      { device: 'iPhone 15 Pro', location: 'New York, USA', current: false, time: '2 hours ago' },
                    ].map((session, i) => (
                      <div key={i} className="flex items-center justify-between py-3 border-b last:border-0 border-border/50">
                        <div className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-accent">{session.device.includes('Mac') ? 'laptop_mac' : 'smartphone'}</span>
                          <div>
                            <p className="font-semibold text-text">{session.device} {session.current && <span className="text-xs text-success font-bold">(Current)</span>}</p>
                            <p className="text-xs text-text-muted">{session.location} • {session.time}</p>
                          </div>
                        </div>
                        {!session.current && <button className="text-error text-label-sm font-bold hover:underline">Revoke</button>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab !== 0 && activeTab !== 1 && (
                <div className="text-center py-16">
                  <span className="material-symbols-outlined text-5xl text-text-faint-variant">construction</span>
                  <p className="text-headline-md font-bold text-accent mt-4">Coming Soon</p>
                  <p className="text-body-md text-text-muted mt-2">This settings section is under development.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ClientLayout>
  );
}
