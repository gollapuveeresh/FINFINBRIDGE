import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Menu, X, ChevronDown, Globe, LogIn, ArrowRight } from 'lucide-react';
import WhatWeAre from './MegaMenus/WhatWeAre';
import WhatWeDo from './MegaMenus/WhatWeDo';
import OurThinking from './MegaMenus/OurThinking';
import ProfileDropdown from './ProfileDropdown';
import './Navbar.css';

const Navbar = () => {
  const [activeMenu, setActiveMenu] = useState(null); // 'whatWeAre' | 'whatWeDo' | 'ourThinking' | null
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  // Accordion state for mobile menu
  const [mobileAccordion, setMobileAccordion] = useState(null); // 'whatWeAre' | 'whatWeDo' | 'ourThinking' | null

  const closeTimeout = useRef(null);
  const location = useLocation();

  // Listen to scroll to apply style modifications
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close everything on page navigation
  useEffect(() => {
    setActiveMenu(null);
    setIsProfileOpen(false);
    setIsMobileOpen(false);
    setMobileAccordion(null);
  }, [location.pathname]);

  const handleMouseEnter = (menuName) => {
    if (closeTimeout.current) clearTimeout(closeTimeout.current);
    setActiveMenu(menuName);
    setIsProfileOpen(false); // Close profile if hovering nav links
  };

  const handleMouseLeave = () => {
    closeTimeout.current = setTimeout(() => {
      setActiveMenu(null);
    }, 250);
  };

  const handleToggleMenu = (menuName) => {
    if (activeMenu === menuName) {
      setActiveMenu(null);
    } else {
      setActiveMenu(menuName);
      setIsProfileOpen(false);
    }
  };

  const toggleMobileAccordion = (menuName) => {
    if (mobileAccordion === menuName) {
      setMobileAccordion(null);
    } else {
      setMobileAccordion(menuName);
    }
  };

  // Helper links data for mobile accordion
  const whatWeAreLinks = [
    { name: "About FinBridge", path: "/about" },
    { name: "Mission & Vision", path: "/mission-vision" },
    { name: "Leadership Team", path: "/leadership-team" },
    { name: "Why FinBridge", path: "/why-finbridge" },
    { name: "Technology", path: "/industry-technology" },
    { name: "Healthcare", path: "/industry-healthcare" },
    { name: "Manufacturing", path: "/industry-manufacturing" },
    { name: "Retail", path: "/industry-retail" },
    { name: "Education", path: "/industry-education" },
    { name: "Financial Services", path: "/industry-financial-services" },
    { name: "Partners", path: "/network-partners" },
    { name: "Business Ecosystem", path: "/network-ecosystem" },
    { name: "Investor Network", path: "/network-investors" }
  ];

  const whatWeDoLinks = [
    { name: "Financial Planning", path: "/financial-planning" },
    { name: "Business Valuation", path: "/valuation-advisory" },
    { name: "Corporate Finance", path: "/corporate-finance" },
    { name: "Risk Assessment", path: "/risk-compliance" },
    { name: "Tax Planning", path: "/tax-planning" },
    { name: "Tax Optimization", path: "/tax-optimization" },
    { name: "Compliance Management", path: "/compliance-management" },
    { name: "Tax Reporting", path: "/tax-reporting" },
    { name: "Portfolio Analysis", path: "/portfolio-analysis" },
    { name: "Wealth Planning", path: "/wealth-planning" },
    { name: "Investment Strategy", path: "/investment-strategy" },
    { name: "Risk Analysis", path: "/risk-analysis" },
    { name: "Investor Connect", path: "/investor-connect" },
    { name: "Funding Assistance", path: "/funding-assistance" },
    { name: "Growth Capital", path: "/growth-capital" },
    { name: "Business Planning", path: "/business-planning" }
  ];

  const ourThinkingLinks = [
    { name: "Market Insights", path: "/market-insights" },
    { name: "Economic Outlook", path: "/economic-outlook" },
    { name: "Financial Trends", path: "/financial-trends" },
    { name: "Industry Reports", path: "/industry-reports" },
    { name: "Business Guides", path: "/business-guides" },
    { name: "Tax Strategies", path: "/tax-strategies" },
    { name: "Investment Resources", path: "/investment-resources" },
    { name: "Financial Planning", path: "/financial-planning-guide" },
    { name: "Startup Success Stories", path: "/startup-success-stories" },
    { name: "Funding Case Studies", path: "/funding-case-studies" },
    { name: "Client Improvements", path: "/client-transformations" },
    { name: "Business Growth Stories", path: "/business-growth-stories" },
    { name: "AI in Finance", path: "/ai-in-finance" },
    { name: "FinTech Trends", path: "/fintech-trends" },
    { name: "Future of Finance", path: "/future-of-finance" },
    { name: "Digital Upgrade", path: "/digital-transformation-guide" }
  ];

  return (
    <>
      <header 
        className={`fixed top-0 left-0 right-0 z-[999] h-20 border-b border-white/10 flex items-center justify-between px-6 md:px-16 navbar-container ${scrolled ? 'scrolled' : ''}`}
      >
        {/* Left: Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#AA7C11] flex items-center justify-center text-[#0A192F] font-bold text-xl shadow-lg shadow-[#D4AF37]/10 group-hover:scale-105 transition-transform duration-300">
            F
          </div>
          <div className="text-xl md:text-2xl font-bold tracking-tighter text-white font-serif group-hover:text-[#D4AF37] transition-colors duration-300">
            FinBridge
          </div>
        </Link>

        {/* Center: Desktop Nav Links */}
        <nav className="hidden lg:flex items-center gap-10 h-full">

          {/* Home */}
          <Link to="/" className="nav-link-btn text-sm font-semibold tracking-wider uppercase text-white hover:text-[#D4AF37] transition-colors">
            Home
          </Link>

          {/* Link 1: What We Are */}
          <div 
            className="h-full flex items-center"
            onMouseEnter={() => handleMouseEnter('whatWeAre')}
            onMouseLeave={handleMouseLeave}
          >
            <button
              onClick={() => handleToggleMenu('whatWeAre')}
              className={`nav-link-btn flex items-center gap-1 text-sm font-semibold tracking-wider uppercase h-full transition-colors ${
                activeMenu === 'whatWeAre' ? 'text-[#D4AF37] active' : 'text-white hover:text-[#D4AF37]/90'
              }`}
            >
              What We Are
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${activeMenu === 'whatWeAre' ? 'rotate-180 text-[#D4AF37]' : ''}`} />
            </button>
          </div>

          {/* Link 2: What We Do */}
          <div 
            className="h-full flex items-center"
            onMouseEnter={() => handleMouseEnter('whatWeDo')}
            onMouseLeave={handleMouseLeave}
          >
            <button
              onClick={() => handleToggleMenu('whatWeDo')}
              className={`nav-link-btn flex items-center gap-1 text-sm font-semibold tracking-wider uppercase h-full transition-colors ${
                activeMenu === 'whatWeDo' ? 'text-[#D4AF37] active' : 'text-white hover:text-[#D4AF37]/90'
              }`}
            >
              What We Do
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${activeMenu === 'whatWeDo' ? 'rotate-180 text-[#D4AF37]' : ''}`} />
            </button>
          </div>

          {/* Link 3: Our Thinking */}
          <div 
            className="h-full flex items-center"
            onMouseEnter={() => handleMouseEnter('ourThinking')}
            onMouseLeave={handleMouseLeave}
          >
            <button
              onClick={() => handleToggleMenu('ourThinking')}
              className={`nav-link-btn flex items-center gap-1 text-sm font-semibold tracking-wider uppercase h-full transition-colors ${
                activeMenu === 'ourThinking' ? 'text-[#D4AF37] active' : 'text-white hover:text-[#D4AF37]/90'
              }`}
            >
              Our Thinking
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${activeMenu === 'ourThinking' ? 'rotate-180 text-[#D4AF37]' : ''}`} />
            </button>
          </div>

          {/* Contact (last) */}
          <Link to="/contact" className="nav-link-btn text-sm font-semibold tracking-wider uppercase text-white hover:text-[#D4AF37] transition-colors">
            Contact
          </Link>
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-3 md:gap-6">
          {/* Profile Trigger */}
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className={`action-icon-btn flex items-center gap-2 px-3.5 py-2 rounded-xl text-gray-300 hover:text-white ${
                isProfileOpen ? 'text-[#D4AF37] bg-white/5 border-b border-[#D4AF37]' : ''
              }`}
              aria-label="Toggle login menu"
            >
              <LogIn className="w-[18px] h-[18px] text-[#D4AF37]" />
              <span className="hidden md:inline text-xs font-semibold uppercase tracking-wider">Login / Sign Up</span>
            </button>
            
            {/* Desktop Profile Dropdown */}
            <ProfileDropdown isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
          </div>

          {/* Mobile Hamburger menu */}
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="lg:hidden w-10 h-10 flex items-center justify-center bg-white/5 border border-white/10 rounded-xl text-white hover:text-[#D4AF37] transition-all"
            aria-label="Toggle mobile menu"
          >
            {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mega Menus Overlay Layer (Desktop) */}
        <AnimatePresence>
          {activeMenu === 'whatWeAre' && (
            <div 
              className="absolute top-full left-0 w-full hidden lg:block"
              onMouseEnter={() => handleMouseEnter('whatWeAre')}
              onMouseLeave={handleMouseLeave}
            >
              <WhatWeAre closeMenu={() => setActiveMenu(null)} />
            </div>
          )}
          {activeMenu === 'whatWeDo' && (
            <div 
              className="absolute top-full left-0 w-full hidden lg:block"
              onMouseEnter={() => handleMouseEnter('whatWeDo')}
              onMouseLeave={handleMouseLeave}
            >
              <WhatWeDo closeMenu={() => setActiveMenu(null)} />
            </div>
          )}
          {activeMenu === 'ourThinking' && (
            <div 
              className="absolute top-full left-0 w-full hidden lg:block"
              onMouseEnter={() => handleMouseEnter('ourThinking')}
              onMouseLeave={handleMouseLeave}
            >
              <OurThinking closeMenu={() => setActiveMenu(null)} />
            </div>
          )}
        </AnimatePresence>
      </header>

      {/* Mobile Drawer (Sidebar) */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            {/* Backdrop blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-[998] lg:hidden"
            />

            {/* Slide-out drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-[85%] sm:w-[420px] mobile-drawer z-[999] lg:hidden flex flex-col p-6 overflow-y-auto"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-6 border-b border-white/10">
                <Link to="/" onClick={() => setIsMobileOpen(false)} className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#D4AF37] flex items-center justify-center text-[#0A192F] font-bold text-base">F</div>
                  <span className="text-lg font-bold font-serif text-white">FinBridge</span>
                </Link>
                <button
                  onClick={() => setIsMobileOpen(false)}
                  className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center border border-white/10 text-white/70 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Drawer Navigation (Accordion List) */}
              <div className="py-6 flex-1 space-y-4">
                
                {/* Accordion 1: What We Are */}
                <div className="border-b border-white/5 pb-3">
                  <button
                    onClick={() => toggleMobileAccordion('whatWeAre')}
                    className="w-full flex items-center justify-between text-sm font-semibold uppercase tracking-wider py-2 text-white hover:text-[#D4AF37]"
                  >
                    <span>What We Are</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${mobileAccordion === 'whatWeAre' ? 'rotate-180 text-[#D4AF37]' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {mobileAccordion === 'whatWeAre' && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden pl-4 pr-2 mt-2 space-y-2.5"
                      >
                        {whatWeAreLinks.map((sublink) => (
                          <Link
                            key={sublink.name}
                            to={sublink.path}
                            onClick={() => setIsMobileOpen(false)}
                            className="block text-xs text-gray-400 hover:text-[#D4AF37] py-1 transition-colors"
                          >
                            {sublink.name}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Accordion 2: What We Do */}
                <div className="border-b border-white/5 pb-3">
                  <button
                    onClick={() => toggleMobileAccordion('whatWeDo')}
                    className="w-full flex items-center justify-between text-sm font-semibold uppercase tracking-wider py-2 text-white hover:text-[#D4AF37]"
                  >
                    <span>What We Do</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${mobileAccordion === 'whatWeDo' ? 'rotate-180 text-[#D4AF37]' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {mobileAccordion === 'whatWeDo' && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden pl-4 pr-2 mt-2 space-y-2.5"
                      >
                        {whatWeDoLinks.map((sublink) => (
                          <Link
                            key={sublink.name}
                            to={sublink.path}
                            onClick={() => setIsMobileOpen(false)}
                            className="block text-xs text-gray-400 hover:text-[#D4AF37] py-1 transition-colors"
                          >
                            {sublink.name}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Accordion 3: Our Thinking */}
                <div className="border-b border-white/5 pb-3">
                  <button
                    onClick={() => toggleMobileAccordion('ourThinking')}
                    className="w-full flex items-center justify-between text-sm font-semibold uppercase tracking-wider py-2 text-white hover:text-[#D4AF37]"
                  >
                    <span>Our Thinking</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${mobileAccordion === 'ourThinking' ? 'rotate-180 text-[#D4AF37]' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {mobileAccordion === 'ourThinking' && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden pl-4 pr-2 mt-2 space-y-2.5"
                      >
                        {ourThinkingLinks.map((sublink) => (
                          <Link
                            key={sublink.name}
                            to={sublink.path}
                            onClick={() => setIsMobileOpen(false)}
                            className="block text-xs text-gray-400 hover:text-[#D4AF37] py-1 transition-colors"
                          >
                            {sublink.name}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

              </div>

              {/* Drawer Footer: Portals Quick Links */}
              <div className="pt-6 border-t border-white/10 space-y-3">


                <span className="text-[9px] uppercase tracking-[0.25em] text-gray-400 font-bold font-mono block mb-2">Portal Access</span>
                
                <Link
                  to="/client/dashboard"
                  onClick={() => setIsMobileOpen(false)}
                  className="flex items-center gap-3 p-2 bg-white/5 rounded-xl hover:bg-white/10 border border-white/5 text-xs text-white"
                >
                  <div className="w-7 h-7 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37]">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <span>Client Portal</span>
                </Link>

                <Link
                  to="/consultant"
                  onClick={() => setIsMobileOpen(false)}
                  className="flex items-center gap-3 p-2 bg-white/5 rounded-xl hover:bg-white/10 border border-white/5 text-xs text-white"
                >
                  <div className="w-7 h-7 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37]">
                    <Globe className="w-3.5 h-3.5" />
                  </div>
                  <span>Consultant Portal</span>
                </Link>

                <Link
                  to="/admin"
                  onClick={() => setIsMobileOpen(false)}
                  className="flex items-center gap-3 p-2 bg-white/5 rounded-xl hover:bg-white/10 border border-white/5 text-xs text-white"
                >
                  <div className="w-7 h-7 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400">
                    <LogIn className="w-3.5 h-3.5" />
                  </div>
                  <span>Admin Portal</span>
                </Link>
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
