// src/pages/WealthManagement.jsx
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, PieChart, TrendingUp, Users, Shield } from 'lucide-react';

const WealthManagement = () => {
  const benefits = [
    {
      icon: <PieChart className="w-8 h-8" />,
      title: "Portfolio Optimization",
      desc: "Sophisticated asset allocation strategies tailored to your objectives"
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Risk-Adjusted Returns",
      desc: "Consistent alpha generation with disciplined risk management"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Family Office Services",
      desc: "Comprehensive wealth structuring and succession planning"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Legacy Protection",
      desc: "Reliable estate and tax-efficient wealth protection strategies"
    }
  ];

  const process = [
    { step: "01", title: "Wealth Assessment", desc: "Deep dive into current financial position and long-term goals" },
    { step: "02", title: "Strategy Development", desc: "Customized investment policy and wealth management plan" },
    { step: "03", title: "Portfolio Construction", desc: "Implementation of diversified, optimized investment portfolio" },
    { step: "04", title: "Ongoing Management", desc: "Continuous monitoring, rebalancing and performance reporting" },
    { step: "05", title: "Legacy Planning", desc: "Succession, estate and philanthropic strategy execution" }
  ];

  const caseStudies = [
    {
      company: "The Harrington Family",
      industry: "Family Office",
      value: "$280M",
      result: "15% annualized return with 40% volatility reduction"
    },
    {
      company: "Summit Partners",
      industry: "Private Equity",
      value: "Global",
      result: "Multi-generational wealth transfer successfully executed"
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
              WEALTH MANAGEMENT
            </div>
            <h1 className="text-6xl md:text-7xl font-bold leading-tight tracking-tighter mb-8">
              Preserve<br />
              <span className="text-[#D4AF37]">Grow Transfer</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl">
              Sophisticated wealth management solutions for high-net-worth individuals, families, and institutions
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
                  <span className="text-[10px] font-mono tracking-widest text-[#D4AF37] uppercase font-bold">FinBridge Wealth Index</span>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-success/10 text-success font-bold font-mono">+12.4% YTD</span>
                </div>
                
                <div className="flex justify-between items-end h-32 gap-3 pt-4">
                  {[35, 48, 42, 60, 55, 78, 85].map((val, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                      <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: `${val}%` }}
                        transition={{ duration: 1, delay: i * 0.1 }}
                        className="w-full rounded-t-md bg-gradient-to-t from-[#AA7C11] to-[#D4AF37] opacity-80 group-hover:opacity-100 transition-opacity" 
                      />
                      <span className="text-[9px] text-gray-500 font-mono">Q{i+1}</span>
                    </div>
                  ))}
                </div>
                
                <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-gray-400 font-mono">ESTIMATED ASSET GROWTH</p>
                    <p className="text-lg font-bold text-white mt-1">₹14.2 Cr</p>
                  </div>
                  <PieChart className="w-8 h-8 text-[#D4AF37] opacity-80 group-hover:scale-105 transition-transform" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 1. Portfolio Analysis */}
      <section id="portfolio" className="py-28 bg-[#0D1B3E] border-t border-white/10 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-[#D4AF37] text-xs font-mono tracking-[0.2em] font-semibold uppercase block mb-3">PORTFOLIO OPTIMIZATION</span>
            <h2 className="text-5xl font-bold tracking-tight text-white mb-6">Portfolio Analysis</h2>
            <p className="text-gray-300 text-lg leading-relaxed font-light mb-6">
              We evaluate asset allocation patterns, past performance benchmarks, and return indices to structure a highly optimized investment portfolio aligning with your volatility tolerance and growth targets
            </p>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37]">
                <PieChart className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-white">Asset Allocation Review</h4>
                <p className="text-sm text-gray-400">Regular rebalancing suggestions for diversified equities, bonds, and cash</p>
              </div>
            </div>
          </div>
          <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/10 text-center">
            <div className="text-6xl mb-4">📈</div>
            <div className="text-[#D4AF37] text-lg font-medium">Dynamic Asset Allocation & Allocation Targets</div>
          </div>
        </div>
      </section>

      {/* 2. Wealth Planning */}
      <section id="wealth" className="py-28 bg-[#0A192F] border-t border-white/10 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1 p-8 rounded-3xl bg-white/[0.02] border border-white/10 text-center">
            <div className="text-6xl mb-4">💎</div>
            <div className="text-[#D4AF37] text-lg font-medium">Legacy Preservation & Family Office Structures</div>
          </div>
          <div className="order-1 md:order-2">
            <span className="text-[#D4AF37] text-xs font-mono tracking-[0.2em] font-semibold uppercase block mb-3">MULTI-GENERATIONAL WEALTH</span>
            <h2 className="text-5xl font-bold tracking-tight text-white mb-6">Wealth Planning</h2>
            <p className="text-gray-300 text-lg leading-relaxed font-light mb-6">
              Establish multi-generational wealth preservation strategies using trust structures, estate blueprints, and tax-efficient structures. We secure your family office requirements with legal safeguards
            </p>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37]">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-white">Legacy Planning & Succession</h4>
                <p className="text-sm text-gray-400">Secure seamless wealth transfer structures across generational heirs</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Investment Strategy */}
      <section id="strategy" className="py-28 bg-black/45 border-t border-white/10 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-[#D4AF37] text-xs font-mono tracking-[0.2em] font-semibold uppercase block mb-3">MARKET DYNAMICS</span>
            <h2 className="text-5xl font-bold tracking-tight text-white mb-6">Investment Strategy</h2>
            <p className="text-gray-300 text-lg leading-relaxed font-light mb-6">
              Our market-driven growth models identify high-value public equity strategies, alternative assets placements, and yield-optimization targets. We provide tailored advisory based on active research
            </p>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37]">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-white">Alternative Investment Access</h4>
                <p className="text-sm text-gray-400">Structured access to private equity, real estate funds, and hedge assets.</p>
              </div>
            </div>
          </div>
          <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/10 text-center">
            <div className="text-6xl mb-4">🚀</div>
            <div className="text-[#D4AF37] text-lg font-medium">Alpha Generation & Tactical Adjustments</div>
          </div>
        </div>
      </section>

      {/* 4. Risk Analysis */}
      <section id="risk" className="py-28 bg-[#0D1B3E] border-t border-white/10 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1 p-8 rounded-3xl bg-white/[0.02] border border-white/10 text-center">
            <div className="text-6xl mb-4">🛡️</div>
            <div className="text-[#D4AF37] text-lg font-medium">Hedging Models & Stress Testing</div>
          </div>
          <div className="order-1 md:order-2">
            <span className="text-[#D4AF37] text-xs font-mono tracking-[0.2em] font-semibold uppercase block mb-3">VOLATILITY MITIGATION</span>
            <h2 className="text-5xl font-bold tracking-tight text-white mb-6">Risk Analysis</h2>
            <p className="text-gray-300 text-lg leading-relaxed font-light mb-6">
              Protect your wealth from extreme market fluctuations through systematic portfolio stress-testing, hedging mechanisms, and liability audits. We ensure your assets remain safe in any market climate
            </p>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37]">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-white">Systemic Risk Mitigation</h4>
                <p className="text-sm text-gray-400">Identify hidden correlations and exposures across asset groups</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-br from-[#0A192F] via-[#0A192F] to-black border-t border-[#D4AF37]/20">
        <div className="max-w-3xl mx-auto text-center px-6">
          <h2 className="text-5xl font-semibold tracking-tight mb-6">Secure your financial legacy</h2>
          <p className="text-xl text-gray-400 mb-10">Partner with FinBridge for expert wealth management that aligns with your vision across generations</p>
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

export default WealthManagement;