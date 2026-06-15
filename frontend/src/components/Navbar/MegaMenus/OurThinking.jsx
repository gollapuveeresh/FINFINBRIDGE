import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, BookOpen, Lightbulb, Compass, Award } from 'lucide-react';

const OurThinking = ({ closeMenu }) => {
  const defaultPreview = {
    title: "Latest Research & Financial Insights",
    desc: "Stay updated with regulatory developments, micro-cap valuation models, and technology stacks shaping the future of global commerce.",
    tag: "LATEST RESEARCH",
    link: "/market-intelligence",
    btnText: "View Insights"
  };

  const [activePreview, setActivePreview] = useState(defaultPreview);

  const insights = [
    { name: "Market Insights", path: "/market-intelligence", desc: "Weekly perspectives on global public & private markets valuations" },
    { name: "Economic Outlook", path: "/market-intelligence", desc: "Macroeconomic forecasts, interest rates updates, and regulatory assessments" },
    { name: "Financial Trends", path: "/wealth-management", desc: "Emerging asset class patterns, portfolio risk indices, and return summaries" },
    { name: "Industry Reports", path: "/valuation-advisory", desc: "In-depth equity research and industry valuation multiple reviews" }
  ];

  const knowledgeCenter = [
    { name: "Business Guides", path: "/corporate-finance", desc: "Essential financial playbooks for entrepreneurs, executives, and owners" },
    { name: "Tax Strategies", path: "/corporate-finance", desc: "Proactive structuring approaches to optimize company tax returns" },
    { name: "Investment Resources", path: "/wealth-management", desc: "Formulas, models, worksheets, and strategic valuation guidelines" },
    { name: "Financial Planning", path: "/financial-transformation", desc: "Step-by-step guides to capital budget allocation and reporting setup" }
  ];

  const caseStudies = [
    { name: "Startup Success Stories", path: "/transaction-services", desc: "How client ventures successfully closed Seed & Series A funding rounds" },
    { name: "Funding Case Studies", path: "/transaction-services", desc: "M&A, corporate restructuring, and transaction advisory project briefs" },
    { name: "Client Transformations", path: "/financial-transformation", desc: "Scale reports and profit optimizations for mid-market clients" },
    { name: "Business Growth Stories", path: "/corporate-finance", desc: "Case studies detailing successful enterprise scaling initiatives" }
  ];

  const innovation = [
    { name: "AI in Finance", path: "/digital-finance", desc: "Predictive algorithms, machine learning financial models, and automated reporting" },
    { name: "FinTech Trends", path: "/digital-finance", desc: "DeFi protocols, digital ledgers, API-driven banking, and payment systems" },
    { name: "Future of Finance", path: "/digital-finance", desc: "Next-gen banking tools, compliance integrations, and enterprise accounting stack plans" },
    { name: "Digital Transformation", path: "/digital-finance", desc: "Migrating legacy models, spreadsheets, and ledgers to modern secure clouds" }
  ];

  const handleHover = (name, desc, path, tag) => {
    setActivePreview({
      title: name,
      desc: desc || "Explore our specialized insights and industry case studies.",
      tag: tag || "LATEST THINKING",
      link: path,
      btnText: "Read Insights"
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
        
        {/* Column 1: Insights */}
        <div className="col-span-12 md:col-span-2 border-r border-white/5 pr-4">
          <h4 className="text-[11px] font-bold tracking-[0.2em] text-[#D4AF37] uppercase mb-6 flex items-center gap-2">
            <Compass className="w-3.5 h-3.5" /> Insights
          </h4>
          <div className="space-y-3">
            {insights.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={closeMenu}
                onMouseEnter={() => handleHover(link.name, link.desc, link.path, "MARKET OUTLOOK")}
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

        {/* Column 2: Knowledge Center */}
        <div className="col-span-12 md:col-span-2 border-r border-white/5 pr-4">
          <h4 className="text-[11px] font-bold tracking-[0.2em] text-[#D4AF37] uppercase mb-6 flex items-center gap-2">
            <BookOpen className="w-3.5 h-3.5" /> Knowledge
          </h4>
          <div className="space-y-3">
            {knowledgeCenter.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={closeMenu}
                onMouseEnter={() => handleHover(link.name, link.desc, link.path, "RESOURCES & GUIDES")}
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

        {/* Column 3: Case Studies */}
        <div className="col-span-12 md:col-span-2 border-r border-white/5 pr-4">
          <h4 className="text-[11px] font-bold tracking-[0.2em] text-[#D4AF37] uppercase mb-6 flex items-center gap-2">
            <Award className="w-3.5 h-3.5" /> Cases
          </h4>
          <div className="space-y-3">
            {caseStudies.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={closeMenu}
                onMouseEnter={() => handleHover(link.name, link.desc, link.path, "CLIENT CASE STUDIES")}
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

        {/* Column 4: Innovation */}
        <div className="col-span-12 md:col-span-2 border-r border-white/5 pr-4">
          <h4 className="text-[11px] font-bold tracking-[0.2em] text-[#D4AF37] uppercase mb-6 flex items-center gap-2">
            <Lightbulb className="w-3.5 h-3.5" /> Innovation
          </h4>
          <div className="space-y-3">
            {innovation.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={closeMenu}
                onMouseEnter={() => handleHover(link.name, link.desc, link.path, "FINTECH & AI")}
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
              to={activePreview.link}
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

export default OurThinking;
