// src/pages/TaxAdvisory.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Calculator, FileText, ShieldCheck, Scale } from 'lucide-react';

const TaxAdvisory = () => {
  return (
    <div className="bg-[#0A192F] text-white">
      {/* Hero Section */}
      <section className="pt-32 pb-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(at_top_right,#D4AF37_0%,transparent_50%)] opacity-10"></div>
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-7"
          >
            <div className="inline-flex items-center gap-2 bg-white/10 text-[#D4AF37] text-sm font-medium px-6 py-2 rounded-full mb-6 border border-[#D4AF37]/30">
              TAX ADVISORY & COMPLIANCE
            </div>
            <h1 className="text-6xl md:text-7xl font-bold leading-tight tracking-tighter mb-8">
              Better Tax Planning.<br />
              <span className="text-[#D4AF37]">Total Compliance.</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl">
              Practical tax strategies, planning frameworks, and regulatory compliance that protect your business and improve after-tax returns
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-5 hidden lg:block"
          >
            <div className="relative p-8 rounded-3xl bg-white/[0.03] border border-white/10 shadow-2xl overflow-hidden group hover:border-[#D4AF37]/30 transition-all duration-500">
              <div className="absolute -top-12 -right-12 w-40 h-40 bg-[#D4AF37]/10 rounded-full blur-2xl group-hover:bg-[#D4AF37]/20 transition-all" />
              <div className="space-y-6">
                <div className="flex justify-between items-center pb-4 border-b border-white/10">
                  <span className="text-[10px] font-mono tracking-widest text-[#D4AF37] uppercase font-bold">Tax Savings</span>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-success/10 text-success font-bold font-mono">Compliant</span>
                </div>
                <div className="space-y-4">
                  <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                    <p className="text-[10px] text-gray-400 font-mono">ANNUAL TAX SAVINGS EFFECT</p>
                    <p className="text-2xl font-bold text-white mt-1">18% - 32% Average</p>
                  </div>
                  <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                    <p className="text-[10px] text-gray-400 font-mono">AUDIT SUCCESS RATE</p>
                    <p className="text-2xl font-bold text-[#D4AF37] mt-1">100% Defensible</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 1. Tax Planning */}
      <section id="planning" className="py-28 bg-[#0D1B3E] border-t border-white/10 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-[#D4AF37] text-xs font-mono tracking-[0.2em] font-semibold uppercase block mb-3">CORPORATE STRATEGY</span>
            <h2 className="text-5xl font-bold tracking-tight text-white mb-6">Tax Planning</h2>
            <p className="text-gray-300 text-lg leading-relaxed font-light mb-6">
              We design proactive, legal tax planning strategies tailored to minimize your corporate and personal liabilities. By evaluating transactions, investments, and structures in advance, we ensure optimal capital preservation
            </p>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37]">
                <Calculator className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-white">Pre-Transaction Structuring</h4>
                <p className="text-sm text-gray-400">Optimize deal parameters before execution to preserve cash.</p>
              </div>
            </div>
          </div>
          <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/10 text-center">
            <div className="text-6xl mb-4">📊</div>
            <div className="text-[#D4AF37] text-lg font-medium">Preemptive Corporate Planning</div>
          </div>
        </div>
      </section>

      {/* 2. Tax Optimization */}
      <section id="optimization" className="py-28 bg-[#0A192F] border-t border-white/10 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1 p-8 rounded-3xl bg-white/[0.02] border border-white/10 text-center">
            <div className="text-6xl mb-4">⚡</div>
            <div className="text-[#D4AF37] text-lg font-medium">Tax Planning Frameworks & IP Location</div>
          </div>
          <div className="order-1 md:order-2">
            <span className="text-[#D4AF37] text-xs font-mono tracking-[0.2em] font-semibold uppercase block mb-3">GLOBAL TAX PLANNING</span>
            <h2 className="text-5xl font-bold tracking-tight text-white mb-6">Tax Optimization</h2>
            <p className="text-gray-300 text-lg leading-relaxed font-light mb-6">
              Improve your tax position using practical planning frameworks aligned with local and international guidelines. We evaluate IP placement, capital deployment, and regional deduction programs to reduce your tax burden
            </p>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37]">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-white">Incentives & Credits</h4>
                <p className="text-sm text-gray-400">Access government subsidies, R&D tax credits, and regional incentives.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Compliance Management */}
      <section id="compliance" className="py-28 bg-black/45 border-t border-white/10 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-[#D4AF37] text-xs font-mono tracking-[0.2em] font-semibold uppercase block mb-3">RISK MITIGATION</span>
            <h2 className="text-5xl font-bold tracking-tight text-white mb-6">Compliance Management</h2>
            <p className="text-gray-300 text-lg leading-relaxed font-light mb-6">
              Stay fully audit-prepared with comprehensive filing assistance, double-taxation safeguards, and end-to-end corporate tax compliance filings. We handle international transfer pricing documents, state tax reports, and local audits
            </p>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37]">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-white">Audit Shield & Representation</h4>
                <p className="text-sm text-gray-400">Experienced representation during tax authority queries and reviews.</p>
              </div>
            </div>
          </div>
          <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/10 text-center">
            <div className="text-6xl mb-4">🛡️</div>
            <div className="text-[#D4AF37] text-lg font-medium">100% Defensible Regulatory Shield</div>
          </div>
        </div>
      </section>

      {/* 4. Tax Reporting */}
      <section id="reporting" className="py-28 bg-[#0D1B3E] border-t border-white/10 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1 p-8 rounded-3xl bg-white/[0.02] border border-white/10 text-center">
            <div className="text-6xl mb-4">📝</div>
            <div className="text-[#D4AF37] text-lg font-medium">Financial Accounting & Disclosure</div>
          </div>
          <div className="order-1 md:order-2">
            <span className="text-[#D4AF37] text-xs font-mono tracking-[0.2em] font-semibold uppercase block mb-3">TRANSPARENT REPORTING</span>
            <h2 className="text-5xl font-bold tracking-tight text-white mb-6">Tax Reporting</h2>
            <p className="text-gray-300 text-lg leading-relaxed font-light mb-6">
              Deploy accurate, streamlined tax provisions, accounting disclosures, and financial reporting systems. We ensure flawless integration between operational ERP ledgers and tax reporting outputs, fully conforming to GAAP and IFRS
            </p>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37]">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-white">GAAP/IFRS Provisioning</h4>
                <p className="text-sm text-gray-400">Flawless computation of deferred taxes, temporary differences, and footnotes</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-28 bg-gradient-to-br from-[#0A192F] via-[#0A192F] to-black border-t border-[#D4AF37]/20">
        <div className="max-w-3xl mx-auto text-center px-6">
          <h2 className="text-5xl font-semibold tracking-tight mb-6">Ready to establish a compliant, optimized tax strategy?</h2>
          <p className="text-xl text-gray-400 mb-12">Connect with our senior tax consultants today to evaluate your financial structures</p>
          <Link 
            to="/contact"
            className="inline-flex items-center gap-4 bg-[#D4AF37] hover:bg-white text-[#0A192F] px-12 py-5 rounded-2xl font-semibold text-lg transition-all group"
          >
            Schedule Consultation
            <ArrowRight className="group-hover:translate-x-2 transition" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default TaxAdvisory;
