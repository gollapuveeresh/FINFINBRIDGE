import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bg text-on-background">
      {/* Top Navigation */}
      <nav className="fixed top-0 left-0 right-0 h-[72px] bg-surface/90 backdrop-blur-md z-50 flex justify-between items-center px-margin-desktop border-b border-border shadow-sm">
        <div className="flex items-center gap-4">
          <span className="text-headline-md font-bold text-accent">FinBridge</span>
          <div className="hidden md:flex gap-6 ml-10">
            <a className="text-label-lg text-accent border-b-2 border-secondary pb-1" href="#">Dashboard</a>
            <a className="text-label-lg text-text-muted hover:text-secondary transition-colors" href="#">Services</a>
            <a className="text-label-lg text-text-muted hover:text-secondary transition-colors" href="#">Solutions</a>
            <a className="text-label-lg text-text-muted hover:text-secondary transition-colors" href="#">Industries</a>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center bg-surface px-4 py-2 rounded-full border border-border">
            <span className="material-symbols-outlined text-text-muted text-sm mr-2">search</span>
            <input className="bg-transparent border-none outline-none text-sm w-48 text-body-sm" placeholder="Search insights..." type="text" />
            <span className="text-xs text-text-faint ml-2">⌘K</span>
          </div>
          <Link to="/login" className="btn-primary py-2 px-5">Login</Link>
        </div>
      </nav>

      <main className="pt-[72px]">
        {/* Hero Section */}
        <section className="hero-gradient relative min-h-[800px] flex items-center overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_#ffd578_0%,_transparent_70%)]"></div>
          </div>
          <div className="container mx-auto px-margin-desktop relative z-10 grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <span className="inline-block px-4 py-1 rounded-full bg-accent/20/20 text-secondary-fixed text-label-lg border border-secondary/30">
                Institutional Agility. Modern Precision
              </span>
              <h1 className="text-display-lg text-white max-w-xl leading-tight">
                Smart Finance, <span className="text-secondary-fixed">Strong Future</span>
              </h1>
              <p className="text-body-lg text-on-primary-container max-w-lg">
                Navigating complex financial landscapes with Tier-1 consultancy expertise. We bridge the gap between startup ambition and corporate stability
              </p>
              <div className="flex gap-4 flex-wrap">
                <Link to="/login">
                  <button className="bg-secondary-fixed text-accent px-8 py-4 rounded-lg font-bold hover:opacity-90 transition-opacity flex items-center gap-2">
                    Get Started
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </button>
                </Link>
                <button className="border border-border text-white px-8 py-4 rounded-lg font-bold hover:bg-white/5 transition-colors">
                  View Case Studies
                </button>
              </div>
            </div>
            <div className="hidden md:block relative">
              <div className="relative w-full aspect-square max-w-[480px] rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-accent-container/50">
                <div className="w-full h-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-[200px] text-white/20">account_balance</span>
                </div>
              </div>
              {/* Floating Stat Card */}
              <div className="absolute -bottom-8 -left-8 glass-panel p-6 rounded-xl shadow-xl border border-border max-w-[240px]">
                <p className="text-text-muted text-label-sm uppercase tracking-wider">Managed Assets</p>
                <p className="text-accent text-headline-md font-bold mt-1">$4.2B+</p>
                <div className="mt-2 flex items-center text-success gap-1">
                  <span className="material-symbols-outlined text-sm">trending_up</span>
                  <span className="text-xs font-bold">+12.4% YoY</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Services Row */}
        <section className="py-24 bg-surface">
          <div className="container mx-auto px-margin-desktop">
            <div className="mb-16">
              <h2 className="text-headline-lg font-bold text-accent mb-4">Strategic Advisory Services</h2>
              <div className="h-1 w-20 bg-secondary rounded-full"></div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
              {[
                { icon: 'account_balance_wallet', label: 'Tax Planning', desc: 'Strategic optimization for maximum efficiency.' },
                { icon: 'trending_up', label: 'Investment Advisory', desc: 'Data-driven wealth management strategies.' },
                { icon: 'rocket_launch', label: 'Startup Consulting', desc: 'Scaling from seed to Series C and beyond.' },
                { icon: 'fact_check', label: 'Financial Audits', desc: 'Uncompromising rigor in financial reporting.' },
                { icon: 'business', label: 'Corporate Finance', desc: 'M&A, restructuring, and capital raising.' },
                { icon: 'payments', label: 'Business Loans', desc: 'Custom debt financing for sustainable growth.' },
              ].map((service, i) => (
                <div key={i} className="group cursor-pointer">
                  <div className="w-16 h-16 bg-surface-hover rounded-2xl flex items-center justify-center mb-6 group-hover:bg-accent-container transition-colors duration-300">
                    <span className="material-symbols-outlined text-accent group-hover:text-white">{service.icon}</span>
                  </div>
                  <h3 className="text-label-lg font-semibold text-accent mb-2">{service.label}</h3>
                  <p className="text-body-sm text-text-muted">{service.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Product Cards */}
        <section className="py-24 bg-bg">
          <div className="container mx-auto px-margin-desktop">
            <div className="text-center mb-16 max-w-2xl mx-auto">
              <h2 className="text-headline-lg font-bold text-accent mb-4">Precision Solutions</h2>
              <p className="text-body-md text-text-muted">Tailored financial packages designed to solve specific organizational challenges.</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { icon: 'new_releases', label: 'Startup Launch Package', desc: 'Full-spectrum financial infrastructure for new enterprises.', price: '$2,499', period: '/one-time', highlight: 'Popular', dark: false },
                { icon: 'hub', label: 'Investor Connect', desc: 'Access to our private network of Tier-1 institutional investors.', price: '$499', period: '/mo', highlight: null, dark: false },
                { icon: 'shield', label: 'Tax Shield Pro', desc: 'Advanced mitigation strategies for high-net-worth entities.', price: '$1,250', period: '/quarterly', highlight: null, dark: false },
                { icon: 'insights', label: 'Growth Capital Program', desc: 'Strategic capital infusion for mature market expansion.', price: 'Custom', period: ' Pricing', highlight: null, dark: true },
              ].map((card, i) => (
                <div key={i} className={`${card.dark ? 'bg-accent text-white' : 'bg-surface border border-border'} p-8 rounded-2xl shadow-sm flex flex-col hover:shadow-md hover:scale-[1.01] transition-all`}>
                  <div className="mb-6 flex justify-between items-start">
                    <div className={`${card.dark ? 'bg-secondary-fixed/20 text-secondary-fixed' : 'bg-accent/5 text-accent'} p-3 rounded-lg`}>
                      <span className="material-symbols-outlined">{card.icon}</span>
                    </div>
                    {card.highlight && <span className="bg-success/10 text-success text-[10px] font-bold px-2 py-1 rounded-full uppercase">{card.highlight}</span>}
                  </div>
                  <h3 className={`text-headline-md font-bold mb-2 ${card.dark ? 'text-white' : 'text-accent'}`}>{card.label}</h3>
                  <p className={`text-body-sm flex-grow mb-8 ${card.dark ? 'text-on-primary-container' : 'text-text-muted'}`}>{card.desc}</p>
                  <div className="mb-8">
                    <span className={`text-3xl font-bold ${card.dark ? 'text-white' : 'text-accent'}`}>{card.price}</span>
                    <span className={`text-sm ${card.dark ? 'text-on-primary-container' : 'text-text-muted'}`}>{card.period}</span>
                  </div>
                  <button className={`w-full py-3 rounded-lg font-bold transition-colors ${card.dark ? 'bg-secondary-fixed text-accent hover:opacity-90' : 'bg-accent text-white hover:bg-accent/90'}`}>Subscribe</button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Industries */}
        <section className="py-24 bg-surface">
          <div className="container mx-auto px-margin-desktop">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-4">
              <div className="max-w-xl">
                <h2 className="text-headline-lg font-bold text-accent mb-4">Industries Served</h2>
                <p className="text-body-md text-text-muted">Our expertise spans across critical global sectors, delivering industry-specific insights that drive value.</p>
              </div>
              <a className="text-secondary font-bold flex items-center gap-2 hover:underline" href="#">
                View Sector Performance <span className="material-symbols-outlined">arrow_outward</span>
              </a>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { icon: 'factory', label: 'Manufacturing' },
                { icon: 'storefront', label: 'Retail' },
                { icon: 'health_and_safety', label: 'Healthcare' },
                { icon: 'school', label: 'Education' },
                { icon: 'memory', label: 'Technology' },
              ].map((ind, i) => (
                <div key={i} className="bg-bg p-8 rounded-xl border border-border flex flex-col items-center text-center group hover:bg-accent transition-all duration-300 cursor-pointer">
                  <span className="material-symbols-outlined text-4xl text-accent mb-4 group-hover:text-secondary-fixed">{ind.icon}</span>
                  <span className="text-label-lg text-accent group-hover:text-white">{ind.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-accent-container text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-1/3 h-full opacity-10 flex items-center justify-end pr-8">
            <span className="material-symbols-outlined" style={{ fontSize: '300px' }}>account_balance</span>
          </div>
          <div className="container mx-auto px-margin-desktop relative z-10 text-center">
            <h2 className="text-display-lg font-bold mb-6">Ready to fortify your financial future?</h2>
            <p className="text-body-lg text-on-primary-container mb-10 max-w-2xl mx-auto">
              Schedule a confidential consultation with our senior partners today
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button className="bg-secondary text-white px-10 py-4 rounded-lg font-bold hover:opacity-90">Book Consultation</button>
              <button className="bg-white/10 text-white px-10 py-4 rounded-lg font-bold hover:bg-white/20">Download Brochure</button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-surface-hover-lowest border-t border-border">
        <div className="container mx-auto px-margin-desktop py-16 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-1">
            <span className="text-headline-md font-bold text-accent block mb-6">FinBridge</span>
            <p className="text-body-sm text-text-muted">Premium financial solutions for modern enterprises. Bridging ambition with stability through data-driven advisory.</p>
          </div>
          <div className="space-y-4">
            <h4 className="text-label-lg text-accent uppercase tracking-wider">Contact Details</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-text-muted"><span className="material-symbols-outlined text-secondary text-sm">mail</span><a href="mailto:contact@finbridge.com" className="text-body-sm hover:text-secondary hover:underline transition-all">contact@finbridge.com</a></div>
              <div className="flex items-center gap-3 text-text-muted"><span className="material-symbols-outlined text-secondary text-sm">call</span><span className="text-body-sm">+880 1719 765432</span></div>
              <div className="flex items-start gap-3 text-text-muted"><span className="material-symbols-outlined text-secondary text-sm">location_on</span><span className="text-body-sm">FinBridge Tower, Agrabad, Chittagong.</span></div>
            </div>
          </div>
          <div className="space-y-4">
            <h4 className="text-label-lg text-accent uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-2">
              {['Privacy Policy', 'Terms of Service', 'Contact Support', 'Partner Network'].map((link) => (
                <li key={link}><a className="text-body-sm text-text-muted hover:text-secondary hover:underline transition-all" href="#">{link}</a></li>
              ))}
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="text-label-lg text-accent uppercase tracking-wider">Follow Us</h4>
            <div className="flex gap-4">
              {['public', 'share', 'group'].map((icon) => (
                <a key={icon} className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-text-muted hover:bg-accent hover:text-white transition-all" href="#">
                  <span className="material-symbols-outlined text-sm">{icon}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="container mx-auto px-margin-desktop py-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-body-sm text-text-muted">© 2024 FinBridge Solutions. All rights reserved.</p>
          <div className="flex gap-6">
            <span className="text-text-muted text-label-sm">System Status: <span className="text-success font-bold">Operational</span></span>
            <span className="text-text-muted text-label-sm">Region: <span className="font-bold text-accent">SEA</span></span>
          </div>
        </div>
      </footer>
    </div>
  );
}
