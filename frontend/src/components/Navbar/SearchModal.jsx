import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ArrowRight, Sparkles } from 'lucide-react';

const SearchModal = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const filters = [
    { label: "All", value: "All" },
    { label: "Search Services", value: "Services" },
    { label: "Search Insights", value: "Insights" },
    { label: "Search Industries", value: "Industries" },
    { label: "Search Reports", value: "Reports" }
  ];

  const quickLinks = [
    { name: "Risk Compliance Advisory", category: "Services", url: "/services" },
    { name: "Global Wealth Allocation", category: "Services", url: "/services" },
    { name: "Economic Outlook 2026", category: "Insights", url: "/insights" },
    { name: "FinTech Innovation Insights", category: "Reports", url: "/insights" }
  ];

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 bg-[#020813FA] backdrop-blur-2xl z-[9999] flex flex-col justify-start px-6 md:px-24 pt-24"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-8 right-8 md:top-12 md:right-12 text-white/50 hover:text-white transition-colors w-12 h-12 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center border border-white/10"
            aria-label="Close search"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="max-w-4xl mx-auto w-full flex flex-col gap-8">
            {/* Header/Title */}
            <div className="flex items-center gap-3">
              <span className="p-2 bg-[#D4AF37]/10 rounded-xl border border-[#D4AF37]/20 text-[#D4AF37]">
                <Sparkles className="w-4 h-4" />
              </span>
              <span className="text-[10px] tracking-[0.3em] font-mono text-gray-400 uppercase">Universal Intelligent Search</span>
            </div>

            {/* Search Input Area */}
            <div className="relative border-b border-[#D4AF37]/30 pb-4">
              <input
                type="text"
                autoFocus
                placeholder="What can we help you find?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-white text-3xl md:text-5xl font-light font-serif outline-none border-none placeholder-white/20 pr-16 leading-relaxed"
              />
              <div className="absolute right-2 bottom-6 text-[#D4AF37]">
                <Search className="w-8 h-8 md:w-10 md:h-10 opacity-70" />
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2 md:gap-3 py-2">
              {filters.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setActiveFilter(filter.value)}
                  className={`px-4 py-2 text-xs md:text-sm rounded-full transition-all duration-300 font-medium ${
                    activeFilter === filter.value
                      ? 'bg-[#D4AF37] text-[#0A192F] shadow-lg shadow-[#D4AF37]/20'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/5'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            {/* Search Results / Suggestions */}
            <div className="mt-8">
              <h5 className="text-[11px] uppercase tracking-[0.2em] text-[#D4AF37] font-semibold mb-4">
                Recommended Queries
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quickLinks
                  .filter(item => activeFilter === 'All' || item.category === activeFilter)
                  .map((item, idx) => (
                    <a
                      key={idx}
                      href={item.url}
                      onClick={onClose}
                      className="group flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/5 hover:border-[#D4AF37]/20 transition-all duration-300"
                    >
                      <div className="flex flex-col">
                        <span className="text-xs text-[#D4AF37]/70 font-mono tracking-wider mb-1 uppercase text-[9px]">{item.category}</span>
                        <span className="text-sm font-semibold text-white group-hover:text-[#D4AF37] transition-colors">{item.name}</span>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-white/5 group-hover:bg-[#D4AF37] text-white group-hover:text-[#0A192F] flex items-center justify-center transition-all">
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </a>
                  ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SearchModal;
