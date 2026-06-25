import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Topbar({ role, onMenuClick }) {
  const { user } = useAuth();
  const activeRole = role || user?.role || 'client';

  const settingsPath = activeRole === 'admin' ? '/admin/settings' : activeRole === 'department-admin' ? '/department-admin/clients' : '/client/settings';
  const notificationsPath = activeRole === 'admin' ? '/admin/dashboard' : activeRole === 'department-admin' ? '/department-admin/dashboard' : '/client/notifications';
  const settingsTitle = activeRole === 'department-admin' ? 'Department Controls' : activeRole === 'admin' ? 'System Settings' : 'Settings';

  const title =
    activeRole === 'admin' ? 'FinBridge Control' :
    activeRole === 'consultant' ? 'Advisor Dashboard' :
    activeRole === 'department-admin' ? 'Department Operations' :
    activeRole === 'crm-admin' ? 'CRM Operations' :
    'FinBridge Solutions';
  const subtitle =
    activeRole === 'admin' ? 'Administrator' :
    activeRole === 'consultant' ? 'Certified Consultant' :
    activeRole === 'department-admin' ? 'Department Admin' :
    activeRole === 'crm-admin' ? 'CRM Administrator' :
    'Premium Financial Client';

  const initial = (user?.name?.charAt(0) || 'U').toUpperCase();

  const iconBtn = 'w-10 h-10 flex items-center justify-center rounded-xl text-text-muted hover:text-accent hover:bg-surface-hover transition-colors active:scale-95';

  return (
    <header className="fixed top-0 right-0 w-full lg:w-[calc(100%-280px)] h-[72px] bg-surface border-b border-border flex justify-between lg:justify-end items-center px-4 lg:px-margin-desktop z-40 shadow-sm">
      {/* Mobile Hamburger (left side) */}
      <div className="flex items-center lg:hidden">
        <button 
          onClick={onMenuClick}
          className="p-1.5 text-text-muted hover:text-text hover:bg-surface-hover rounded-lg transition-colors flex items-center justify-center"
          title="Open Menu"
        >
          <span className="material-symbols-outlined text-[24px]">menu</span>
        </button>
      </div>

      <div className="flex items-center gap-1">
        {activeRole === 'client' && (
          <Link to={notificationsPath} className={`relative ${iconBtn}`} title="Notifications">
            <span className="material-symbols-outlined text-[22px]">notifications</span>
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-error rounded-full ring-2 ring-surface"></span>
          </Link>
        )}
        {(activeRole === 'client' || activeRole === 'admin' || activeRole === 'department-admin') && (
          <Link to={settingsPath} className={iconBtn} title={settingsTitle}>
            <span className="material-symbols-outlined text-[22px]">settings</span>
          </Link>
        )}
      </div>

      {/* Divider */}
      <div className="h-9 w-px bg-border mx-4"></div>

      {/* Identity */}
      <div className="flex items-center gap-3">
        <div className="flex flex-col items-end leading-tight">
          <span className="text-sm font-bold text-accent">{title}</span>
          <span className="text-[10px] text-text-muted uppercase tracking-[0.14em] font-semibold mt-0.5">{subtitle}</span>
        </div>
        <div className="w-9 h-9 rounded-full bg-accent/15 flex items-center justify-center text-accent font-bold text-sm shrink-0">
          {initial}
        </div>
      </div>
    </header>
  );
}
