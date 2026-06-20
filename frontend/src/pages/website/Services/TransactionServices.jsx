// src/pages/TransactionServices.jsx
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Handshake, BarChart3, Shield, Zap } from 'lucide-react';

const TransactionServices = () => {
  const benefits = [
    {
      icon: <Handshake className="w-8 h-8" />,
      title: "End-to-End M&A Support",
      desc: "From target identification to post-merger integration"
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Due Diligence Excellence",
      desc: "Financial, operational and commercial due diligence"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Risk Mitigation",
      desc: "Comprehensive transaction risk assessment"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Accelerated Execution",
      desc: "Streamlined processes for faster deal closure"
    }
  ];

  const process = [
    { step: "01", title: "Strategic Assessment", desc: "Define transaction objectives and identify optimal targets" },
    { step: "02", title: "Due Diligence", desc: "Rigorous multi-dimensional due diligence" },
    { step: "03", title: "Transaction Structuring", desc: "Optimal deal structuring and negotiation support" },
    { step: "04", title: "Closing & Integration", desc: "Seamless transaction closing and post-deal integration" },
    { step: "05", title: "Achieving Results", desc: "Track performance gains and monitor post-transaction outcomes" }
  ];

  const caseStudies = [
    {
      company: "GlobalLogix",
      industry: "Logistics Technology",
      value: "$420M",
      result: "Successful acquisition by industry leader"
    },
    {
      company: "HealthVista",
      industry: "Digital Health",
      value: "$165M",
      result: "Series B funding round led by top-tier VCs"
    }
  ];

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
              TRANSACTION SERVICES
            </div>
            <h1 className="text-6xl md:text-7xl font-bold leading-tight tracking-tighter mb-8">
              Executing Strategic<br />
              <span className="text-[#D4AF37]">Transactions Flawlessly</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl">
              Expert advisory for mergers, acquisitions, divestitures, and capital raises with proven execution excellence
            </p>
          </motion.div>

          {/* Right Column: Premium Visual Graphic */}
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
                  <span className="text-[10px] font-mono tracking-widest text-[#D4AF37] uppercase font-bold">Deal Lifecycle</span>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-success/10 text-success font-bold font-mono">14 Completed</span>
                </div>
                
                <div className="space-y-4">
                  <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                    <p className="text-[10px] text-gray-400 font-mono">TOTAL TRANSACTION VALUE</p>
                    <p className="text-3xl font-bold text-white mt-1">₹5,400+ Cr</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                      <p className="text-[10px] text-gray-400 font-mono">AVG MULTIPLE</p>
                      <p className="text-lg font-bold text-[#D4AF37] mt-1">11.8x EBITDA</p>
                    </div>
                    <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                      <p className="text-[10px] text-gray-400 font-mono">SUCCESS RATE</p>
                      <p className="text-lg font-bold text-success mt-1">94.2%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 1. Investor Connect */}
      <section id="connect" className="py-28 bg-[#0D1B3E] border-t border-white/10 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-[#D4AF37] text-xs font-mono tracking-[0.2em] font-semibold uppercase block mb-3">GLOBAL ALLIANCES</span>
            <h2 className="text-5xl font-bold tracking-tight text-white mb-6">Investor Connect</h2>
            <p className="text-gray-300 text-lg leading-relaxed font-light mb-6">
              We facilitate direct introductions to leading venture capital funds, angel groups, institutional allocators, and family offices globally to accelerate your capital raising needs
            </p>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37]">
                <Handshake className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-white">VC & Angel Network</h4>
                <p className="text-sm text-gray-400">Match with capital partners that match your industry focus.</p>
              </div>
            </div>
          </div>
          <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/10 text-center">
            <div className="text-6xl mb-4">🤝</div>
            <div className="text-[#D4AF37] text-lg font-medium">Global Network Introductions</div>
          </div>
        </div>
      </section>

      {/* 2. Funding Assistance */}
      <section id="assistance" className="py-28 bg-[#0A192F] border-t border-white/10 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1 p-8 rounded-3xl bg-white/[0.02] border border-white/10 text-center">
            <div className="text-6xl mb-4">📝</div>
            <div className="text-[#D4AF37] text-lg font-medium">Decks, Modeling & Cap Tables</div>
          </div>
          <div className="order-1 md:order-2">
            <span className="text-[#D4AF37] text-xs font-mono tracking-[0.2em] font-semibold uppercase block mb-3">PITCH PREPARATION</span>
            <h2 className="text-5xl font-bold tracking-tight text-white mb-6">Funding Assistance</h2>
            <p className="text-gray-300 text-lg leading-relaxed font-light mb-6">
              Prepare high-caliber fundraising materials, including defensible financial forecasts, capitalization tables, and compelling pitch decks designed to withstand rigorous VC due diligence
            </p>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37]">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-white">Due Diligence Preparedness</h4>
                <p className="text-sm text-gray-400">Ensure financial models and business metrics conform to expectations.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Growth Capital */}
      <section id="capital" className="py-28 bg-black/45 border-t border-white/10 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-[#D4AF37] text-xs font-mono tracking-[0.2em] font-semibold uppercase block mb-3">SCALING SOLUTIONS</span>
            <h2 className="text-5xl font-bold tracking-tight text-white mb-6">Growth Capital</h2>
            <p className="text-gray-300 text-lg leading-relaxed font-light mb-6">
              Structure debt, growth equity, or hybrid financing options tailored to your startup's phase. We ensure minimal dilution while securing the runway necessary to execute your objectives
            </p>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37]">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-white">Structured Debt & Equity</h4>
                <p className="text-sm text-gray-400">Minimize cost of capital and maximize runway flexibility.</p>
              </div>
            </div>
          </div>
          <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/10 text-center">
            <div className="text-6xl mb-4">⚡</div>
            <div className="text-[#D4AF37] text-lg font-medium">Optimal Valuation & Capital Structuring</div>
          </div>
        </div>
      </section>

      {/* 4. Business Planning */}
      <section id="planning-startup" className="py-28 bg-[#0D1B3E] border-t border-white/10 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1 p-8 rounded-3xl bg-white/[0.02] border border-white/10 text-center">
            <div className="text-6xl mb-4">🛡️</div>
            <div className="text-[#D4AF37] text-lg font-medium">Go-To-Market Plans & Scale Models</div>
          </div>
          <div className="order-1 md:order-2">
            <span className="text-[#D4AF37] text-xs font-mono tracking-[0.2em] font-semibold uppercase block mb-3">ROADMAP DEVELOPMENT</span>
            <h2 className="text-5xl font-bold tracking-tight text-white mb-6">Business Planning</h2>
            <p className="text-gray-300 text-lg leading-relaxed font-light mb-6">
              Develop actionable go-to-market plans, unit economics models, and operational scale roadmaps. We align your product milestones with financial forecasts to guide your executive decisions
            </p>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37]">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-white">Unit Economics & Modeling</h4>
                <p className="text-sm text-gray-400">Demonstrate a clear pathway to profitability for capital allocators.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-br from-[#0A192F] via-[#0A192F] to-black border-t border-[#D4AF37]/20">
        <div className="max-w-3xl mx-auto text-center px-6">
          <h2 className="text-5xl font-semibold tracking-tight mb-6">Ready to execute your next transaction?</h2>
          <p className="text-xl text-gray-400 mb-10">Partner with FinBridge for seamless execution and the best possible business outcomes.</p>
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

export default TransactionServices;