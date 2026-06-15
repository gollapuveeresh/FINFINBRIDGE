import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserDepartment } from '../utils/departmentAccess';

const clientItems = [
  { icon: 'dashboard', label: 'Dashboard', path: '/client/dashboard' },
  { icon: 'monitoring', label: 'Financial Health', path: '/client/health-score' },
  { icon: 'account_balance_wallet', label: 'Financial Profile', path: '/client/financial-profile' },
  { icon: 'payments', label: 'Loans', path: '/client/loans' },
  { icon: 'account_balance_wallet', label: 'Tax Planning', path: '/client/tax-planning' },
  { icon: 'trending_up', label: 'Investments', path: '/client/investments' },
  { icon: 'chat_bubble', label: 'Consultations', path: '/client/consultations' },
  { icon: 'description', label: 'Proposals', path: '/client/proposals' },
  { icon: 'payment', label: 'Payments', path: '/client/payments' },
  { icon: 'analytics', label: 'Reports', path: '/client/reports' },
  { icon: 'receipt_long', label: 'Billing', path: '/client/billing' },
  { icon: 'contact_mail', label: 'Contact Us', path: '/client/contact' },
  { icon: 'support_agent', label: 'Help & Support', path: '/client/help' },
];

const consultantItems = [
  { icon: 'payments',         label: 'Loan Dashboard',       path: '/department-consultant/loans/dashboard' },
  { icon: 'health_and_safety',label: 'Insurance Dashboard',  path: '/department-consultant/insurance/dashboard' },
  { icon: 'trending_up',      label: 'Investment Dashboard', path: '/department-consultant/investments/dashboard' },
  { icon: 'calculate',        label: 'Tax Dashboard',        path: '/department-consultant/tax/dashboard' },
  { icon: 'account_balance',  label: 'Wealth Dashboard',     path: '/department-consultant/wealth/dashboard' },
  { icon: 'schema',           label: 'Loan Workflow',        path: '/consultant/loan-workflow',        dept: 'loans' },
  { icon: 'calculate',        label: 'Tax Workflow',         path: '/consultant/tax-workflow',         dept: 'tax' },
  { icon: 'trending_up',      label: 'Investment Workflow',  path: '/consultant/investment-workflow',  dept: 'investments' },
  { icon: 'health_and_safety',label: 'Insurance Workflow',   path: '/consultant/insurance-workflow',   dept: 'insurance' },
  { icon: 'account_balance',  label: 'Wealth Workflow',      path: '/consultant/wealth-workflow',      dept: 'wealth' },
  { icon: 'description',      label: 'Proposals',            path: '/consultant/proposals' },
  { icon: 'people',           label: 'My Clients',           path: '/consultant/clients' },
  { icon: 'folder_open',      label: 'Client Documents',     path: '/consultant/reports' },
  { icon: 'calendar_month',   label: 'Meetings Schedule',    path: '/consultant/schedule' },
  { icon: 'receipt',           label: 'Invoices',             path: '/consultant/invoices' },
];

const adminItems = [
  { icon: 'admin_panel_settings', label: 'Admin Dashboard', path: '/admin/dashboard' },
  { icon: 'contacts', label: 'Lead Management', path: '/admin/leads' },
  { icon: 'leaderboard', label: 'CRM Pipeline', path: '/admin/crm' },
  { icon: 'support_agent', label: 'CRM Management', path: '/admin/crm-management' },
  { icon: 'corporate_fare', label: 'Department Management', path: '/admin/departments' },
  { icon: 'manage_accounts', label: 'User Management', path: '/admin/users' },
  { icon: 'badge', label: 'Consultant Management', path: '/admin/consultants' },
  { icon: 'inventory_2', label: 'Product Management', path: '/admin/products' },
  { icon: 'mail', label: 'Contact Messages', path: '/admin/messages' },
  { icon: 'analytics', label: 'Analytics Dashboard', path: '/admin/analytics' },
  { icon: 'bar_chart', label: 'Revenue Analytics', path: '/admin/revenue' },
  { icon: 'receipt_long', label: 'Audit Logs', path: '/admin/audit-logs' },
  { icon: 'settings', label: 'System Settings', path: '/admin/settings' },
];

const departmentAdminItems = [
  { icon: 'payments', label: 'Loans Dashboard', path: '/department-admin/loans/dashboard' },
  { icon: 'health_and_safety', label: 'Insurance Dashboard', path: '/department-admin/insurance/dashboard' },
  { icon: 'trending_up', label: 'Investments Dashboard', path: '/department-admin/investments/dashboard' },
  { icon: 'calculate', label: 'Tax Dashboard', path: '/department-admin/tax/dashboard' },
  { icon: 'account_balance', label: 'Wealth Dashboard', path: '/department-admin/wealth/dashboard' },
  { icon: 'inbox', label: 'Lead Queue', path: '/department-admin/lead-queue' },
  { icon: 'support_agent', label: 'Consultation Requests', path: '/department-admin/consultations' },
  { icon: 'groups', label: 'Client Queue', path: '/department-admin/clients' },
  { icon: 'assignment_ind', label: 'Assignments', path: '/department-admin/assignments' },
  { icon: 'folder_open', label: 'Client Documents', path: '/department-admin/documents' },
];

export default function Sidebar({ role }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  // Use passed role prop or fallback to current logged-in user's role
  const activeRole = role || user?.role || 'client';
  const activeDepartment = getUserDepartment(user);
  
  let menuItems = clientItems;
  let sectionTitle = 'Client Portal';
  
  if (activeRole === 'consultant') {
    menuItems = consultantItems.filter((item) => {
      if (item.dept) return activeDepartment === item.dept || (item.dept === 'investments' && activeDepartment === 'investments');
      if (!item.path.startsWith('/department-consultant/')) return true;
      return activeDepartment && item.path.includes(`/department-consultant/${activeDepartment}/`);
    });
    sectionTitle = 'Consultant Desk';
  } else if (activeRole === 'admin') {
    menuItems = adminItems;
    sectionTitle = 'Admin Portal';
  } else if (activeRole === 'department-admin') {
    menuItems = departmentAdminItems.filter((item) => {
      if (!item.path.startsWith('/department-admin/') ||
        ['/department-admin/clients', '/department-admin/lead-queue', '/department-admin/consultations', '/department-admin/assignments', '/department-admin/documents'].includes(item.path)
      ) return true;
      return activeDepartment && item.path.includes(`/department-admin/${activeDepartment}/`);
    });
    sectionTitle = 'Department Admin Portal';
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getAvatarLetter = () => {
    if (user?.name) return user.name.charAt(0);
    return 'U';
  };

  return (
    <aside className="fixed left-0 top-0 h-full w-[280px] bg-surface border-r border-border shadow-sm flex flex-col py-base-unit px-4 z-50">
      {/* Brand */}
      <Link 
        to={activeRole === 'admin' ? '/admin/dashboard' : activeRole === 'consultant' ? `/department-consultant/${activeDepartment || 'loans'}/dashboard` : activeRole === 'department-admin' ? `/department-admin/${activeDepartment || 'loans'}/dashboard` : '/client/dashboard'}
        className="flex items-center gap-3 px-2 py-6 mb-4 hover:opacity-95 group transition-opacity"
      >
        <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center text-on-primary group-hover:scale-105 transition-transform duration-200">
          <span className="material-symbols-filled text-xl">account_balance</span>
        </div>
        <div>
          <h1 className="text-headline-md font-bold text-accent leading-tight">FinBridge</h1>
          <p className="text-body-sm text-text-muted opacity-70">Premium Solutions</p>
        </div>
      </Link>

      {/* Main Nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto pr-1">
        <p className="text-label-sm text-text-muted uppercase tracking-widest px-4 mb-3 font-bold">{sectionTitle}</p>
        {menuItems.map((item) => {
          // Highlight active link if it matches current path exactly or matches the prefix
          const isActive = location.pathname === item.path || 
            (item.path !== '/client/dashboard' && item.path !== '/consultant/dashboard' && item.path !== '/admin/dashboard' && item.path !== '/department-admin/dashboard' && location.pathname.startsWith(item.path));
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-link ${isActive ? 'active' : ''}`}
            >
              <span className="material-symbols-outlined text-xl">{item.icon}</span>
              <span className="text-body-md font-semibold">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom User section */}
      <div className="mt-auto border-t border-border pt-4 pb-2">
        {activeRole === 'client' && (
          <>
            <Link to="/client/settings" className={`sidebar-link ${location.pathname === '/client/settings' ? 'active' : ''}`}>
              <span className="material-symbols-outlined">settings</span>
              <span className="text-body-md font-semibold">Settings</span>
            </Link>
            <Link to="/client/notifications" className={`sidebar-link ${location.pathname === '/client/notifications' ? 'active' : ''}`}>
              <span className="material-symbols-outlined">notifications</span>
              <span className="text-body-md font-semibold">Notifications</span>
            </Link>
          </>
        )}
        {activeRole === 'consultant' && (
          <>
            <Link to="/consultant/notifications" className={`sidebar-link ${location.pathname === '/consultant/notifications' ? 'active' : ''}`}>
              <span className="material-symbols-outlined">notifications</span>
              <span className="text-body-md font-semibold">Notifications</span>
            </Link>
          </>
        )}
        
        <div className="flex items-center justify-between gap-2 p-2.5 mt-3 rounded-xl bg-surface border border-border">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-9 h-9 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold text-base shrink-0">
              {getAvatarLetter()}
            </div>
            <div className="overflow-hidden">
              <p className="text-label-lg font-bold truncate text-accent leading-tight">{user?.name || 'Alexander Vance'}</p>
              <p className="text-[10px] text-text-muted truncate font-semibold uppercase tracking-wider">{user?.tier || user?.role || 'Premium'} Account</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            title="Log Out"
            className="p-1.5 text-text-muted hover:text-error hover:bg-error/10 rounded-lg transition-colors shrink-0 flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-xl">logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
