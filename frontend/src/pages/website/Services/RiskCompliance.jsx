// src/pages/RiskCompliance.jsx
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, AlertTriangle, Scale, Eye } from 'lucide-react';

const RiskCompliance = () => {
  const benefits = [
    {
      icon: <ShieldCheck className="w-8 h-8" />,
      title: "Regulatory Mastery",
      desc: "Deep expertise across SOX, GDPR, IFRS, and local compliance frameworks"
    },
    {
      icon: <AlertTriangle className="w-8 h-8" />,
      title: "Risk Intelligence",
      desc: "Proactive identification and mitigation of enterprise risks"
    },
    {
      icon: <Scale className="w-8 h-8" />,
      title: "Governance Excellence",
      desc: "Strengthened internal controls and board-level governance"
    },
    {
      icon: <Eye className="w-8 h-8" />,
      title: "Continuous Monitoring",
      desc: "Real-time compliance dashboards and risk analytics"
    }
  ];

  const process = [
    { step: "01", title: "Risk Assessment", desc: "Comprehensive enterprise-wide risk identification and prioritization" },
    { step: "02", title: "Compliance Framework", desc: "Design and implementation of robust compliance programs" },
    { step: "03", title: "Control Implementation", desc: "Deployment of internal controls and monitoring systems" },
    { step: "04", title: "Testing & Validation", desc: "Independent testing and effectiveness evaluation" },
    { step: "05", title: "Ongoing Assurance", desc: "Continuous monitoring and regulatory reporting" }
  ];

  const caseStudies = [
    {
      company: "FinSecure Bank",
      industry: "Banking",
      value: "98%",
      result: "Compliance score achieved with zero major findings"
    },
    {
      company: "DataForge Inc.",
      industry: "Technology",
      value: "Global",
      result: "Successfully implemented GDPR and CCPA compliance program"
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
              RISK & COMPLIANCE
            </div>
            <h1 className="text-6xl md:text-7xl font-bold leading-tight tracking-tighter mb-8">
              Protect. Comply.<br />
              <span className="text-[#D4AF37]">Thrive.</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl">
              Integrated risk management and compliance solutions that safeguard your business while enabling sustainable growth.
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
                  <span className="text-[10px] font-mono tracking-widest text-[#D4AF37] uppercase font-bold">Risk Scorecard</span>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-success/10 text-success font-bold font-mono">100% Compliant</span>
                </div>
                
                <div className="space-y-4">
                  <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-gray-400 font-mono">REGULATORY ALIGNMENT</p>
                      <p className="text-xl font-bold text-white mt-1">SOX, GDPR, ISO27001</p>
                    </div>
                  </div>

                  <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-gray-400 font-mono">MITIGATED ISSUES</p>
                      <p className="text-xl font-bold text-[#D4AF37] mt-1">28 Potential Flags</p>
                    </div>
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
              <h2 className="text-5xl font-semibold tracking-tight mb-8">Enterprise Risk & Compliance Services</h2>
              <div className="space-y-8 text-lg text-gray-300">
                <p>Our risk and compliance practice helps organizations navigate complex regulatory landscapes while building resilient risk management frameworks that support strategic objectives.</p>
                <ul className="space-y-4">
                  <li className="flex items-start gap-4"><span className="text-[#D4AF37] mt-1">•</span> Enterprise Risk Management (ERM)</li>
                  <li className="flex items-start gap-4"><span className="text-[#D4AF37] mt-1">•</span> Regulatory Compliance Programs</li>
                  <li className="flex items-start gap-4"><span className="text-[#D4AF37] mt-1">•</span> Internal Audit & Controls</li>
                  <li className="flex items-start gap-4"><span className="text-[#D4AF37] mt-1">•</span> Cybersecurity Risk Advisory</li>
                </ul>
              </div>
            </motion.div>
            
            <div className="bg-white/5 border border-white/10 p-12 rounded-3xl">
              <h3 className="text-3xl font-semibold mb-10">Why Organizations Trust Us</h3>
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
            <h2 className="text-5xl font-semibold tracking-tight">Our Risk & Compliance Framework</h2>
            <p className="mt-4 text-gray-400 max-w-md mx-auto">A systematic methodology designed for long-term resilience</p>
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
            <h2 className="text-5xl font-semibold tracking-tight">Proven Risk & Compliance Outcomes</h2>
            <Link to="/contact" className="text-[#D4AF37] flex items-center gap-2 hover:gap-3 transition-all group">
              View Full Portfolio <ArrowRight className="group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {caseStudies.map((study, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -10 }}
                className="bg-white/5 border border-white/10 rounded-3xl p-10 group hover:border-[#D4AF37]/50 transition-all"
              >
                <div className="text-[#D4AF37] text-sm font-medium tracking-widest mb-6">CLIENT SUCCESS</div>
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
          <h2 className="text-5xl font-semibold tracking-tight mb-6">Strengthen your risk posture today</h2>
          <p className="text-xl text-gray-400 mb-10">Let our experts build a resilient compliance and risk management program tailored to your business.</p>
        </div>
      </section>
    </div>
  );
};

export default RiskCompliance;