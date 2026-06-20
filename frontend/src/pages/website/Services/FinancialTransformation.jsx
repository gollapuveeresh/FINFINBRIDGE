// src/pages/FinancialTransformation.jsx
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, TrendingUp, RefreshCw, Target, BarChart } from 'lucide-react';

const FinancialTransformation = () => {
  const benefits = [
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Performance Uplift",
      desc: "Average 28% improvement in key financial metrics"
    },
    {
      icon: <RefreshCw className="w-8 h-8" />,
      title: "Process Optimization",
      desc: "End-to-end finance function improvement"
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "Strategic Alignment",
      desc: "Finance as a true strategic business partner"
    },
    {
      icon: <BarChart className="w-8 h-8" />,
      title: "Technology Enablement",
      desc: "Modern finance systems and automation"
    }
  ];

  const process = [
    { step: "01", title: "Diagnostic Assessment", desc: "Current state analysis and opportunity identification" },
    { step: "02", title: "Improvement Roadmap", desc: "Prioritised initiatives with clear ROI projections" },
    { step: "03", title: "Capability Building", desc: "People, process, and technology improvements" },
    { step: "04", title: "Implementation", desc: "Structured execution with continuous results delivery" },
    { step: "05", title: "Ongoing Performance", desc: "Performance tracking and continuous improvement" }
  ];

  const caseStudies = [
    {
      company: "Aether Manufacturing",
      industry: "Industrial",
      value: "42%",
      result: "Reduction in month-end close cycle"
    },
    {
      company: "VitaRetail Group",
      industry: "Retail",
      value: "$18M",
      result: "Annual cost savings through improvement"
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
              FINANCIAL IMPROVEMENT
            </div>
            <h1 className="text-6xl md:text-7xl font-bold leading-tight tracking-tighter mb-8">
              Improve Financial Management<br />
              <span className="text-[#D4AF37]">Increase Business Value</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl">
              End-to-end finance improvement programs that modernize operations and deliver lasting business results.
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
                  <span className="text-[10px] font-mono tracking-widest text-[#D4AF37] uppercase font-bold">Finance Operations</span>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-success/10 text-success font-bold font-mono">+28% ROI</span>
                </div>
                
                <div className="space-y-4">
                  <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                    <p className="text-[10px] text-gray-400 font-mono">ESTIMATED CYCLE SAVINGS</p>
                    <p className="text-2xl font-bold text-white mt-1">4.2 Days Avg Close</p>
                  </div>

                  <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                    <p className="text-[10px] text-gray-400 font-mono">AUTOMATED WORKFLOWS</p>
                    <p className="text-2xl font-bold text-[#D4AF37] mt-1">85% Process Coverage</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Service Overview */}
      <section className="py-24 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid md:grid-cols-2 gap-20">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-5xl font-semibold tracking-tight mb-8">Finance Function Improvement</h2>
              <div className="space-y-8 text-lg text-gray-300">
                <p>We partner with CFOs to improve finance teams into effective business partners through digital tools, process efficiency, and talent development</p>
                <ul className="space-y-4">
                  <li className="flex items-start gap-4"><span className="text-[#D4AF37] mt-1">•</span> Finance Operating Model Design</li>
                  <li className="flex items-start gap-4"><span className="text-[#D4AF37] mt-1">•</span> Digital Finance Upgrade</li>
                  <li className="flex items-start gap-4"><span className="text-[#D4AF37] mt-1">•</span> FP&A Evolution</li>
                  <li className="flex items-start gap-4"><span className="text-[#D4AF37] mt-1">•</span> Shared Services Optimization</li>
                </ul>
              </div>
            </motion.div>
            
            <div className="bg-white/5 border border-white/10 p-12 rounded-3xl">
              <h3 className="text-3xl font-semibold mb-10">Key Improvement Results</h3>
              <div className="space-y-10">
                {benefits.map((benefit, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex gap-6"
                  >
                    <div className="text-[#D4AF37]">{benefit.icon}</div>
                    <div>
                      <h4 className="text-xl font-semibold mb-2">{benefit.title}</h4>
                      <p className="text-gray-400">{benefit.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Process Timeline */}
      <section id="process-section" className="py-24 bg-black/40">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-semibold tracking-tight">Our Improvement Process</h2>
            <p className="mt-4 text-gray-400 max-w-md mx-auto">A phased approach that delivers measurable results at every stage</p>
          </div>

          <div className="max-w-4xl mx-auto">
            {process.map((item, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex gap-8 mb-12 last:mb-0 relative"
              >
                {index !== process.length - 1 && (
                  <div className="absolute left-[27px] top-12 bottom-0 w-0.5 bg-gradient-to-b from-[#D4AF37] to-transparent"></div>
                )}
                <div className="w-14 h-14 rounded-2xl bg-[#D4AF37] text-[#0A192F] flex items-center justify-center font-bold text-xl flex-shrink-0 z-10">
                  {item.step}
                </div>
                <div className="pt-2">
                  <h3 className="text-2xl font-semibold mb-3">{item.title}</h3>
                  <p className="text-gray-400 text-lg">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Case Studies */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex justify-between items-end mb-12">
            <h2 className="text-5xl font-semibold tracking-tight">Client Success Stories</h2>
            <Link to="/success-stories" className="text-[#D4AF37] flex items-center gap-2 hover:gap-3 transition-all group">
              See More Results <ArrowRight className="group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {caseStudies.map((study, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -10 }}
                className="bg-white/5 border border-white/10 rounded-3xl p-10 group hover:border-[#D4AF37]/50 transition-all"
              >
                <div className="text-[#D4AF37] text-sm font-medium tracking-widest mb-6">IMPROVEMENT CASE</div>
                <h3 className="text-3xl font-semibold mb-2">{study.company}</h3>
                <p className="text-gray-400 mb-8">{study.industry}</p>
                
                <div className="border-t border-white/10 pt-8 mt-auto">
                  <div className="text-5xl font-bold text-[#D4AF37] mb-1">{study.value}</div>
                  <div className="text-lg text-gray-300">{study.result}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-br from-[#0A192F] via-[#0A192F] to-black border-t border-[#D4AF37]/20">
        <div className="max-w-3xl mx-auto text-center px-6">
          <h2 className="text-5xl font-semibold tracking-tight mb-6">Improve your finance function</h2>
          <p className="text-xl text-gray-400 mb-10">Build a well-prepared finance team that supports your business goals and long-term growth</p>
        </div>
      </section>
    </div>
  );
};

export default FinancialTransformation;