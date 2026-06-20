import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Landmark, Percent, Rocket, LineChart } from 'lucide-react';

const WhatWeDo = ({ closeMenu }) => {
  const defaultPreview = {
    title: "Helping Businesses Make Smarter Financial Decisions",
    desc: "Connect with our advisors to build specialized growth plans and improve your business value.",
    tag: "FINBRIDGE SOLUTIONS",
    link: "/valuation-advisory",
    btnText: "Explore Services"
  };

  const [activePreview, setActivePreview] = useState(defaultPreview);

  const financialConsulting = [
    { name: "Financial Planning", path: "/financial-planning", desc: "Financial projections and capital planning to support long-term business growth" },
    { name: "Business Valuation", path: "/valuation-advisory", desc: "Accurate business and asset valuation reports backed by global standards" },
    { name: "Corporate Finance", path: "/corporate-finance", desc: "Capital structures, funding optimization, and comprehensive M&A advisory" },
    { name: "Risk Assessment", path: "/risk-compliance", desc: "Identify, control, and mitigate business vulnerabilities and operational risks" }
  ];

  const taxAdvisory = [
    { name: "Tax Planning", path: "/tax-planning", desc: "Proactive strategies to legally minimize corporate tax liabilities" },
    { name: "Tax Optimization", path: "/tax-optimization", desc: "Efficiency frameworks aligned with international and local regulations" },
    { name: "Compliance Management", path: "/compliance-management", desc: "Regulatory audit preparedness and compliance filings support" },
    { name: "Tax Reporting", path: "/tax-reporting", desc: "Accurate preparation of financial reporting structures" }
  ];

  const investmentAdvisory = [
    { name: "Portfolio Analysis", path: "/portfolio-analysis", desc: "Evaluate returns, risk tolerance, and asset allocation strategies" },
    { name: "Wealth Planning", path: "/wealth-planning", desc: "Custom plans to grow, secure, and preserve multi-generational wealth" },
    { name: "Investment Strategy", path: "/investment-strategy", desc: "Market-driven growth and hedging strategies for capital gains" },
    { name: "Risk Analysis", path: "/risk-analysis", desc: "Stress-testing asset classes, equity holdings, and investment groups" }
  ];

  const startupSolutions = [
    { name: "Investor Connect", path: "/investor-connect", desc: "Introductions to institutional venture capitals, angels, and family offices" },
    { name: "Funding Assistance", path: "/funding-assistance", desc: "Preparation of pitch decks, financial metrics, and cap-table structuring" },
    { name: "Growth Capital", path: "/growth-capital", desc: "Structuring debt and equity financing for business scaling" },
    { name: "Business Planning", path: "/business-planning", desc: "Developing GTM plans, financial models, and operational roadmaps" }
  ];

  const handleHover = (name, desc, path, tag) => {
    setActivePreview({
      title: name,
      desc: desc || "Explore our specialized services and institutional solutions.",
      tag: tag || "SERVICE DETAIL",
      link: path,
      btnText: "Explore Now"
    });
  };

  const handleMouseLeave = () => {
    setActivePreview(defaultPreview);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="absolute top-full left-0 w-full bg-[#0A192F] border-b border-[#D4AF37]/20 shadow-2xl text-white py-12 z-50 px-8 md:px-16"
      onMouseLeave={handleMouseLeave}
    >
      <div className="max-w-7xl mx-auto grid grid-cols-12 gap-8">
        
        {/* Column 1: Financial Consulting */}
        <div className="col-span-12 md:col-span-2 border-r border-white/5 pr-4">
          <h4 className="text-[11px] font-bold tracking-[0.2em] text-[#D4AF37] uppercase mb-6 flex items-center gap-2">
            <Landmark className="w-3.5 h-3.5" /> Consulting
          </h4>
          <div className="space-y-3">
            {financialConsulting.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={closeMenu}
                onMouseEnter={() => handleHover(link.name, link.desc, link.path, "FINANCIAL ADVISORY")}
                className="group block hover:bg-white/5 p-2 rounded-lg transition-all duration-300"
              >
                <div className="text-sm font-semibold group-hover:text-[#D4AF37] transition-colors">
                  {link.name}
                </div>
                <p className="text-[10px] text-gray-400 mt-0.5 font-light leading-snug line-clamp-2">{link.desc}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Column 2: Tax Advisory */}
        <div className="col-span-12 md:col-span-2 border-r border-white/5 pr-4">
          <h4 className="text-[11px] font-bold tracking-[0.2em] text-[#D4AF37] uppercase mb-6 flex items-center gap-2">
            <Percent className="w-3.5 h-3.5" /> Tax
          </h4>
          <div className="space-y-3">
            {taxAdvisory.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={closeMenu}
                onMouseEnter={() => handleHover(link.name, link.desc, link.path, "TAX ADVISORY & COMPLIANCE")}
                className="group block hover:bg-white/5 p-2 rounded-lg transition-all duration-300"
              >
                <div className="text-sm font-semibold group-hover:text-[#D4AF37] transition-colors">
                  {link.name}
                </div>
                <p className="text-[10px] text-gray-400 mt-0.5 font-light leading-snug line-clamp-2">{link.desc}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Column 3: Investment Advisory */}
        <div className="col-span-12 md:col-span-2 border-r border-white/5 pr-4">
          <h4 className="text-[11px] font-bold tracking-[0.2em] text-[#D4AF37] uppercase mb-6 flex items-center gap-2">
            <LineChart className="w-3.5 h-3.5" /> Investments
          </h4>
          <div className="space-y-3">
            {investmentAdvisory.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={closeMenu}
                onMouseEnter={() => handleHover(link.name, link.desc, link.path, "WEALTH MANAGEMENT")}
                className="group block hover:bg-white/5 p-2 rounded-lg transition-all duration-300"
              >
                <div className="text-sm font-semibold group-hover:text-[#D4AF37] transition-colors">
                  {link.name}
                </div>
                <p className="text-[10px] text-gray-400 mt-0.5 font-light leading-snug line-clamp-2">{link.desc}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Column 4: Startup Solutions */}
        <div className="col-span-12 md:col-span-2 border-r border-white/5 pr-4">
          <h4 className="text-[11px] font-bold tracking-[0.2em] text-[#D4AF37] uppercase mb-6 flex items-center gap-2">
            <Rocket className="w-3.5 h-3.5" /> Startups
          </h4>
          <div className="space-y-3">
            {startupSolutions.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={closeMenu}
                onMouseEnter={() => handleHover(link.name, link.desc, link.path, "STARTUP STRATEGY & FUNDING")}
                className="group block hover:bg-white/5 p-2 rounded-lg transition-all duration-300"
              >
                <div className="text-sm font-semibold group-hover:text-[#D4AF37] transition-colors">
                  {link.name}
                </div>
                <p className="text-[10px] text-gray-400 mt-0.5 font-light leading-snug line-clamp-2">{link.desc}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Column 5: Right Dynamic Banner */}
        <div className="col-span-12 md:col-span-4 flex flex-col justify-between">
          <div className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-3xl p-6 h-full flex flex-col justify-between relative overflow-hidden group hover:border-[#D4AF37]/30 transition-all duration-300">
            {/* Ambient gold glow */}
            <div className="absolute -top-10 -right-10 w-24 h-24 bg-[#D4AF37]/10 rounded-full blur-xl group-hover:bg-[#D4AF37]/20 transition-all" />
            
            <AnimatePresence mode="wait">
              <motion.div
                key={activePreview.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <span className="text-[9px] uppercase tracking-[0.25em] text-[#D4AF37]/70 font-mono font-bold">{activePreview.tag}</span>
                <h5 className="text-xl font-bold text-white leading-snug mt-3 font-serif">
                  {activePreview.title}
                </h5>
                <p className="text-xs text-gray-400 mt-2 font-light leading-relaxed">
                  {activePreview.desc}
                </p>
              </motion.div>
            </AnimatePresence>
            
            <Link
              to={activePreview.btnText === "Explore Now" ? "/client/login?register=true" : activePreview.link}
              onClick={closeMenu}
              className="mt-6 inline-flex items-center justify-center gap-2 border border-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#0A192F] text-[#D4AF37] font-semibold text-xs tracking-wider uppercase py-3 px-5 transition-all duration-300 rounded-sm font-mono"
            >
              {activePreview.btnText}
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

      </div>
    </motion.div>
  );
};

export default WhatWeDo;
