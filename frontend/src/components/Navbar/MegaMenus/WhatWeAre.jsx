import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Building, Target, Users, Landmark, Cpu, HeartPulse, Factory, ShoppingBag, GraduationCap, DollarSign, Briefcase } from 'lucide-react';

const WhatWeAre = ({ closeMenu }) => {
  const defaultPreview = {
    title: "Building Trust Through Quality Financial Service",
    desc: "Our reputation is built on client growth, careful risk management, and transparency.",
    tag: "FINBRIDGE TRUST",
    link: "/about",
    btnText: "Learn More"
  };

  const [activePreview, setActivePreview] = useState(defaultPreview);

  const companyLinks = [
    { name: "About FinBridge", path: "/about", desc: "Our history, founders, and global presence since 2007" },
    { name: "Mission & Vision", path: "/mission-vision", desc: "What drives us toward quality service and transparency" },
    { name: "Leadership Team", path: "/leadership-team", desc: "Meet our senior advisors, CFAs, and global partners" },
    { name: "Why FinBridge", path: "/why-finbridge", desc: "Our commitment to quality service standards and compliance" }
  ];

  const industryLinks = [
    { name: "Technology", path: "/industry-technology", icon: <Cpu className="w-4 h-4 text-[#D4AF37]" />, desc: "IP valuation and capital scaling for high-tech SaaS ventures" },
    { name: "Healthcare", path: "/industry-healthcare", icon: <HeartPulse className="w-4 h-4 text-[#D4AF37]" />, desc: "Compliance, risk controls, and valuations for clinics" },
    { name: "Manufacturing", path: "/industry-manufacturing", icon: <Factory className="w-4 h-4 text-[#D4AF37]" />, desc: "Capital restructuring and modeling for industrial firms" },
    { name: "Retail", path: "/industry-retail", icon: <ShoppingBag className="w-4 h-4 text-[#D4AF37]" />, desc: "Growth strategies and M&A for high-end consumer brands" },
    { name: "Education", path: "/industry-education", icon: <GraduationCap className="w-4 h-4 text-[#D4AF37]" />, desc: "Capital budget planning and improvement for universities" },
    { name: "Financial Services", path: "/industry-financial-services", icon: <Landmark className="w-4 h-4 text-[#D4AF37]" />, desc: "Trust structures, capital advisory, and asset management" }
  ];

  const networkLinks = [
    { name: "Partners", path: "/network-partners", icon: <Briefcase className="w-4 h-4" />, desc: "Global financial networks and joint venture partners" },
    { name: "Business Ecosystem", path: "/network-ecosystem", icon: <Users className="w-4 h-4" />, desc: "Our collaborative group of financial advisors and legal experts" },
    { name: "Investor Network", path: "/network-investors", icon: <DollarSign className="w-4 h-4" />, desc: "Introductions to VCs, angel networks, and family offices" }
  ];

  const handleHover = (name, desc, path, tag) => {
    setActivePreview({
      title: name,
      desc: desc || "Explore our specialized services and institutional solutions.",
      tag: tag || "OVERVIEW",
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
        
        {/* Column 1: Company */}
        <div className="col-span-12 md:col-span-4 border-r border-white/5 pr-6">
          <h4 className="text-[11px] font-bold tracking-[0.2em] text-[#D4AF37] uppercase mb-6 flex items-center gap-2">
            <Building className="w-3.5 h-3.5" /> Company
          </h4>
          <div className="space-y-4">
            {companyLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={closeMenu}
                onMouseEnter={() => handleHover(link.name, link.desc, link.path, "COMPANY DETAIL")}
                className="group block hover:bg-white/5 p-3 rounded-xl transition-all duration-300"
              >
                <div className="text-sm font-semibold group-hover:text-[#D4AF37] transition-colors flex items-center gap-1.5">
                  {link.name}
                  <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                </div>
                <p className="text-xs text-gray-400 mt-1 font-light leading-relaxed">{link.desc}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Column 2: Industries */}
        <div className="col-span-12 md:col-span-3 border-r border-white/5 pr-6">
          <h4 className="text-[11px] font-bold tracking-[0.2em] text-[#D4AF37] uppercase mb-6 flex items-center gap-2">
            <Target className="w-3.5 h-3.5" /> Industries
          </h4>
          <div className="grid grid-cols-1 gap-3">
            {industryLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={closeMenu}
                onMouseEnter={() => handleHover(link.name, link.desc, link.path, "INDUSTRY SECTOR")}
                className="flex items-center gap-3 text-sm text-gray-300 hover:text-white group p-2 rounded-lg hover:bg-white/5 transition-all"
              >
                <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-[#D4AF37]/50 transition-colors">
                  {link.icon}
                </div>
                <span className="font-medium group-hover:text-[#D4AF37] transition-colors">{link.name}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Column 3: Network */}
        <div className="col-span-12 md:col-span-2 border-r border-white/5 pr-6">
          <h4 className="text-[11px] font-bold tracking-[0.2em] text-[#D4AF37] uppercase mb-6 flex items-center gap-2">
            <Users className="w-3.5 h-3.5" /> Network
          </h4>
          <div className="space-y-3">
            {networkLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={closeMenu}
                onMouseEnter={() => handleHover(link.name, link.desc, link.path, "NETWORK ECOSYSTEM")}
                className="flex items-center gap-3 text-sm text-gray-300 hover:text-[#D4AF37] group p-2 rounded-lg hover:bg-white/5 transition-all"
              >
                <div className="text-gray-400 group-hover:text-[#D4AF37] transition-colors">
                  {link.icon}
                </div>
                <span className="font-medium">{link.name}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Column 4: Right Dynamic Banner */}
        <div className="col-span-12 md:col-span-3 flex flex-col justify-between">
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
                <h5 className="text-lg font-bold text-white leading-snug mt-3 font-serif">
                  {activePreview.title}
                </h5>
                <p className="text-[11px] text-gray-400 mt-2 font-light leading-relaxed">
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

export default WhatWeAre;
