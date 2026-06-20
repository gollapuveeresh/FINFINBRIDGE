import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-6">
      <div className="text-center max-w-xl">
        {/* Large 404 */}
        <div className="relative mb-8">
          <p className="text-[200px] font-bold text-accent/5 leading-none select-none">404</p>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="p-6 bg-surface rounded-2xl shadow-card border border-border">
              <span className="material-symbols-outlined text-5xl text-accent">search_off</span>
            </div>
          </div>
        </div>

        <h1 className="text-headline-lg font-bold text-accent mb-4">Page Not Found</h1>
        <p className="text-body-lg text-text-muted mb-8">
          The page you're looking for doesn't exist or has been moved. Please check the URL or navigate back to your dashboard
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/dashboard">
            <button className="btn-primary flex items-center gap-2">
              <span className="material-symbols-outlined">dashboard</span>Go to Dashboard
            </button>
          </Link>
          <Link to="/">
            <button className="btn-ghost flex items-center gap-2">
              <span className="material-symbols-outlined">home</span>Back to Home
            </button>
          </Link>
        </div>

        {/* Quick Links */}
        <div className="mt-12">
          <p className="text-label-lg text-text-muted mb-4">Or navigate to a section directly:</p>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { label: 'Loans', to: '/loans' },
              { label: 'Tax Planning', to: '/tax-planning' },
              { label: 'Investments', to: '/investment-advisory' },
              { label: 'Reports', to: '/reports' },
              { label: 'Help', to: '/help' },
            ].map((link) => (
              <Link key={link.label} to={link.to}>
                <span className="px-4 py-2 border border-border rounded-full text-body-sm text-text-muted hover:border-secondary hover:text-secondary transition-colors cursor-pointer">
                  {link.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
