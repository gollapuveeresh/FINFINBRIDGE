import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { Link } from 'react-router-dom';

export default function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-bg">
      <Sidebar />
      <Topbar />
      <main className="ml-[280px] pt-[112px] min-h-screen p-margin-desktop">
        <div className="max-w-[1440px] mx-auto space-y-gutter fade-in">
          {children}
        </div>
      </main>
      <footer className="ml-[280px] py-6 px-margin-desktop bg-surface-hover-lowest flex flex-col md:flex-row justify-between items-center border-t border-border text-text-muted text-body-sm">
        <p>© 2024 FinBridge Solutions. All rights reserved.</p>
        <div className="flex gap-8 mt-3 md:mt-0">
          <Link to="/" className="hover:underline decoration-secondary transition-opacity">Privacy Policy</Link>
          <Link to="/" className="hover:underline decoration-secondary transition-opacity">Terms of Service</Link>
          <Link to="/help" className="hover:underline decoration-secondary transition-opacity">Contact Support</Link>
        </div>
      </footer>
    </div>
  );
}
