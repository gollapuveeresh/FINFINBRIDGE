// src/pages/About.jsx
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Users, Award, Target, Globe } from 'lucide-react';

const About = () => {
  const stats = [
    { number: "5", label: "Years of Excellence" },
    { number: "450", label: "Clients Worldwide" },
    { number: "92", label: "% Client Retention" },
    { number: "240", label: "Consulting Professionals" }
  ];

  const values = [
    {
      icon: <Target className="w-10 h-10" />,
      title: "Excellence",
      desc: "We set the highest standards in everything we do"
    },
    {
      icon: <Users className="w-10 h-10" />,
      title: "Partnership",
      desc: "True collaboration with our clients as trusted advisors"
    },
    {
      icon: <Globe className="w-10 h-10" />,
      title: "Integrity",
      desc: "Uncompromising ethical standards and transparency"
    },
    {
      icon: <Award className="w-10 h-10" />,
      title: "Innovation",
      desc: "Pushing boundaries with forward-thinking solutions"
    }
  ];

  const leadership = [
    {
      name: "Ms. Sarah Hossain",
      role: "Founder & CEO",
      bio: "Founder and Managing Director of FinBridge Solutions, leading the firm's strategic consulting, funding, and investment advisory practice.",
      image: "/assets/images/dr_victoria_chen.png"
    },
    {
      name: "Alexander Moreau",
      role: "Chief Investment Officer",
      bio: "Ex-BlackRock Portfolio Manager specializing in alternative investments.",
      image: "/assets/images/alexander_moreau.png"
    },
    {
      name: "Priya Sharma",
      role: "Head of Tax",
      bio: "International tax expert with Big 4 background, leading taxation planning and Tax Shield Pro.",
      image: "/assets/images/priya_sharma.png"
    }
  ];

  return (
    <div className="bg-[#0A192F] text-white">
      {/* Hero Section */}
      <section className="pt-32 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(at_top_right,#D4AF37_0%,transparent_60%)] opacity-10"></div>
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-7"
          >
            <div className="inline-flex items-center gap-2 bg-white/10 text-[#D4AF37] text-sm font-medium px-6 py-2 rounded-full mb-6 border border-[#D4AF37]/30">
              ABOUT FINBRIDGE
            </div>
            <h1 className="text-6xl md:text-7xl font-bold leading-tight tracking-tighter mb-8">
              Smart Finance.<br />
              <span className="text-[#D4AF37]">Strong Future.</span>
            </h1>
            <p className="text-2xl text-gray-300">
              FinBridge Solutions empowers startups, SMEs, and enterprises to achieve financial growth through strategic consulting, taxation planning, funding assistance, and investment advisory services
            </p>
          </motion.div>

          {/* Right Column: Premium Global Network Stats */}
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
                  <span className="text-[10px] font-mono tracking-widest text-[#D4AF37] uppercase font-bold">Global Presence</span>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-success/10 text-success font-bold font-mono">4 Continents</span>
                </div>
                
                <div className="space-y-4">
                  <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                    <p className="text-[10px] text-gray-400 font-mono">TOTAL TRANSACTIONS ADVISED</p>
                    <p className="text-3xl font-bold text-white mt-1">₹12,400+ Cr</p>
                  </div>

                  <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                    <p className="text-[10px] text-gray-400 font-mono">ACTIVE INSTITUTIONS PARTNERED</p>
                    <p className="text-2xl font-bold text-[#D4AF37] mt-1">450+ Worldwide</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 border-t border-white/10 bg-black/30">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-7xl font-bold text-[#D4AF37] mb-2">{stat.number}</div>
                <div className="text-gray-400 text-lg">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section id="why" className="py-24">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid md:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-5xl font-semibold tracking-tight mb-10">Our Story</h2>
              <div className="space-y-8 text-lg text-gray-300">
                <p>Founded in 2021 by Ms. Sarah Hossain, FinBridge Solutions Ltd was built on a simple principle: help businesses navigate complex financial landscapes through strategic consulting, taxation planning, funding assistance, and investment advisory.</p>
                <p>Today, we serve startups, SMEs, and enterprises, supporting their financial growth across business loan consulting, tax management, investment advisory, insurance, and wealth management. Our success is measured by the lasting impact we create for our clients.</p>
              </div>
            </motion.div>
            
            <div className="relative">
              <div className="aspect-video bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
                <div className="w-full h-full bg-gradient-to-br from-[#D4AF37]/10 to-transparent flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-8xl mb-4">📍</div>
                    <div className="text-[#D4AF37] text-xl font-medium">Headquarters • Chittagong, Bangladesh</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section id="vision" className="py-24 bg-black/40">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-semibold tracking-tight">Our Guiding Values</h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -8 }}
                className="bg-white/5 border border-white/10 hover:border-[#D4AF37]/50 p-10 rounded-3xl transition-all group"
              >
                <div className="text-[#D4AF37] mb-8 group-hover:scale-110 transition-transform">{value.icon}</div>
                <h3 className="text-2xl font-semibold mb-4">{value.title}</h3>
                <p className="text-gray-400 leading-relaxed">{value.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership */}
      <section id="leadership" className="py-24">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex justify-between items-end mb-12">
            <h2 className="text-5xl font-semibold tracking-tight">Leadership Team</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {leadership.map((leader, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden group"
              >
                <div className="h-80 bg-gradient-to-br from-[#1A2A4C] to-[#0A192F] flex items-center justify-center border-b border-white/10 overflow-hidden relative">
                  <img 
                    src={leader.image} 
                    alt={leader.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-10">
                  <h3 className="text-2xl font-semibold mb-1">{leader.name}</h3>
                  <p className="text-[#D4AF37] mb-6">{leader.role}</p>
                  <p className="text-gray-400 leading-relaxed">{leader.bio}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Network Sections */}
      {/* 1. Partners */}
      <section id="partners" className="py-28 bg-[#0D1B3E] border-t border-white/10 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-[#D4AF37] text-xs font-mono tracking-[0.2em] font-semibold uppercase block mb-3">GLOBAL ALLIANCES</span>
            <h2 className="text-5xl font-bold tracking-tight text-white mb-6">Strategic Partners</h2>
            <p className="text-gray-300 text-lg leading-relaxed font-light">
              We collaborate with premier global financial networks, banking institutions, and joint venture partners to assist our clients in transnational capital management, cross-border M&A, and international compliance
            </p>
          </div>
          <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/10 text-center">
            <div className="text-6xl mb-4">🤝</div>
            <div className="text-[#D4AF37] text-lg font-medium">Institutional Alliances & Joint Ventures</div>
          </div>
        </div>
      </section>

      {/* 2. Business Ecosystem */}
      <section id="ecosystem" className="py-28 bg-[#0A192F] border-t border-white/10 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1 p-8 rounded-3xl bg-white/[0.02] border border-white/10 text-center">
            <div className="text-6xl mb-4">🌐</div>
            <div className="text-[#D4AF37] text-lg font-medium">Collaborative Professional Network</div>
          </div>
          <div className="order-1 md:order-2">
            <span className="text-[#D4AF37] text-xs font-mono tracking-[0.2em] font-semibold uppercase block mb-3">PROFESSIONAL ECOSYSTEM</span>
            <h2 className="text-5xl font-bold tracking-tight text-white mb-6">Business Ecosystem</h2>
            <p className="text-gray-300 text-lg leading-relaxed font-light">
              Our collaborative ecosystem brings together certified financial advisors, CFAs, legal experts, and senior tax consultants. This interdisciplinary approach ensures every aspect of your enterprise's financial health is handled in unison by industry-leading specialists
            </p>
          </div>
        </div>
      </section>

      {/* 3. Investor Network */}
      <section id="investors" className="py-28 bg-black/45 border-t border-white/10 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-[#D4AF37] text-xs font-mono tracking-[0.2em] font-semibold uppercase block mb-3">CAPITAL ACCELERATION</span>
            <h2 className="text-5xl font-bold tracking-tight text-white mb-6">Investor Network</h2>
            <p className="text-gray-300 text-lg leading-relaxed font-light">
              We maintain direct, trusted relationships with top-tier venture capital funds, angel networks, institutional allocators, and private family offices. We bridge the gap between high-growth enterprises and strategic capital partners looking for high-value placement opportunities
            </p>
          </div>
          <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/10 text-center">
            <div className="text-6xl mb-4">💰</div>
            <div className="text-[#D4AF37] text-lg font-medium">VC, Angel & Family Office Connections</div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-28 bg-gradient-to-br from-[#0A192F] via-[#0A192F] to-black border-t border-[#D4AF37]/20">
        <div className="max-w-3xl mx-auto text-center px-6">
          <h2 className="text-5xl font-semibold tracking-tight mb-6">Ready to work with the best?</h2>
          <p className="text-xl text-gray-400 mb-12">Join the growing list of organizations that trust FinBridge with their most important financial decisions.</p>
          <Link 
            to="/contact"
            className="inline-flex items-center gap-4 bg-[#D4AF37] hover:bg-white text-[#0A192F] px-12 py-5 rounded-2xl font-semibold text-lg transition-all group"
          >
            Start a Conversation
            <ArrowRight className="group-hover:translate-x-2 transition" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default About;