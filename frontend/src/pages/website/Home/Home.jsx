// src/pages/Home.jsx
import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Award, Users, TrendingUp, Play, Pause, X, PieChart, Target, Briefcase, Phone, Mail, MapPin, Clock } from 'lucide-react';
import AnimatedCounter from '../../../components/AnimatedCounter';
import Timeline from '../../../components/Timeline';
import CaseStudyCard from '../../../components/CaseStudyCard';
import ThreeWays from '../Services/ThreeWays';
import ServicesWeOffer from '../Services/ServicesWeOffer';
import LeadCaptureForm from '../../../components/LeadCaptureForm';


const Home = () => {
  const videoRef = useRef(null);
  const [isLooping, setIsLooping] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleLoop = () => {
    if (videoRef.current) {
      if (isLooping) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(err => console.log("Video play failed:", err));
      }
      setIsLooping(!isLooping);
    }
  };

  const openWatchFilmModal = () => {
    setIsModalOpen(true);
    if (videoRef.current && isLooping) {
      videoRef.current.pause();
    }
  };

  const closeWatchFilmModal = () => {
    setIsModalOpen(false);
    if (videoRef.current && isLooping) {
      videoRef.current.play().catch(err => console.log("Video play failed:", err));
    }
  };

  const scrollToNextSection = () => {
    const nextSection = document.getElementById('threeways-section');
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const industries = [
    {
      name: "Manufacturing",
      image: "/assets/images/manufacturing.png",
      desc: "Capital allocation and supply chain optimization for industrial enterprises."
    },
    {
      name: "Retail",
      image: "/assets/images/retail.png",
      desc: "Omnichannel strategy and growth advisory for high-end consumer brands."
    },
    {
      name: "Healthcare",
      image: "/assets/images/healthcare.png",
      desc: "Valuation, regulatory compliance, and M&A advisory for clinical systems."
    },
    {
      name: "Technology",
      image: "/assets/images/technology.png",
      desc: "Strategic scale-up, IP valuation, and capital raising for SaaS and deeptech."
    }
  ];

  const timelineSteps = [
    { step: "01", title: "Discovery", desc: "Deep understanding of your business objectives" },
    { step: "02", title: "Strategy", desc: "Customized solution architecture" },
    { step: "03", title: "Execution", desc: "Flawless implementation by specialists" },
    { step: "04", title: "Value Delivery", desc: "Measurable results and continuous support" }
  ];

  const caseStudies = [
    {
      company: "TechNova Solutions",
      industry: "SaaS",
      value: "$245M",
      result: "Successfully raised Series C at premium valuation"
    },
    {
      company: "MediCore Health",
      industry: "Healthcare",
      value: "$87M",
      result: "Strategic acquisition completed"
    }
  ];

  const offices = [
    {
      city: "New York",
      address: "1271 Avenue of the Americas, 42nd Floor",
      phone: "+1 (212) 555-0189",
      email: "nyc@finbridge.com"
    },
    {
      city: "London",
      address: "25 Bank Street, Canary Wharf",
      phone: "+44 20 7946 0958",
      email: "london@finbridge.com"
    },
    {
      city: "Singapore",
      address: "1 Raffles Place, #32-01",
      phone: "+65 6808 4123",
      email: "singapore@finbridge.com"
    }
  ];


  return (
    <div className="bg-[#0A192F] text-white">
      {/* Hero Section */}
      <section className="min-h-[100dvh] pt-20 flex items-center relative overflow-hidden">
        {/* Background Video */}
        <video
          ref={videoRef}
          src="/assets/videos/hero-video.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0"
        />
        
        {/* Video Overlays */}
        <div className="absolute inset-0 bg-black/15 z-0"></div>
        <div className="absolute inset-0 bg-[radial-gradient(at_center,#D4AF37_0%,transparent_70%)] opacity-10 z-0"></div>
        
        {/* Pause/Play Loop Toggle */}
        <button 
          onClick={toggleLoop}
          className="absolute top-28 right-6 md:right-12 z-20 flex items-center gap-2 text-white/60 hover:text-white text-[11px] font-medium tracking-widest bg-black/15 hover:bg-black/40 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10 opacity-70 hover:opacity-100 transition-all cursor-pointer uppercase shadow-md"
        >
          <span>{isLooping ? 'Pause loop' : 'Play loop'}</span>
          {isLooping ? (
            <Pause className="w-3 h-3 fill-current" />
          ) : (
            <Play className="w-3 h-3 fill-current" />
          )}
        </button>

        {/* Watch Film Button */}
        <div className="absolute bottom-12 right-6 md:right-12 z-20 flex flex-col items-end gap-1.5 opacity-70 hover:opacity-100 transition-all">
          <button 
            onClick={openWatchFilmModal}
            className="border border-white/20 hover:border-white text-white/70 hover:text-white px-5 py-2.5 rounded-none flex items-center gap-3 transition-all tracking-wider text-[11px] font-semibold group cursor-pointer bg-black/15 hover:bg-black/35 backdrop-blur-md shadow-md uppercase"
          >
            <span>Watch film</span>
            <Play className="w-3.5 h-3.5 fill-current group-hover:scale-105 transition" />
          </button>
          <span className="text-white/40 text-[10px] tracking-wider font-mono mr-1">(00:30)</span>
        </div>

        {/* Make It Happen Scroll-down Indicator */}
        <div 
          onClick={scrollToNextSection}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2.5 cursor-pointer group"
        >
          <span className="text-xs font-semibold tracking-widest text-white/80 group-hover:text-white transition uppercase">
            Make it happen with Finbridge
          </span>
          <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center group-hover:border-[#D4AF37] group-hover:bg-[#D4AF37]/10 transition-all duration-300">
            <ArrowRight className="w-4 h-4 text-[#D4AF37] rotate-90 group-hover:translate-y-0.5 transition-transform" />
          </div>
        </div>

        {/* Portal Quick Access Buttons */}
        <div className="absolute top-28 left-6 md:left-12 z-20 flex flex-col gap-2">
          <Link to="/client/login"
            className="bg-[#D4AF37]/20 border-[#D4AF37]/40 hover:bg-[#D4AF37]/30 backdrop-blur-md border text-white text-[11px] font-semibold tracking-wider px-4 py-2 rounded-full transition-all uppercase shadow-md flex items-center gap-2">
            Client Portal
            <ArrowRight className="w-3 h-3" />
          </Link>
          <button
            onClick={() => {
              const el = document.getElementById('contact-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="bg-white/10 border-white/20 hover:bg-white/20 backdrop-blur-md border text-white text-[11px] font-semibold tracking-wider px-4 py-2 rounded-full transition-all uppercase shadow-md flex items-center gap-2 cursor-pointer">
            Book Consultation
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </section>

      {/* Watch Film Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 md:p-12">
          {/* Close button */}
          <button 
            onClick={closeWatchFilmModal}
            className="absolute top-6 right-6 text-white/80 hover:text-white hover:scale-110 transition cursor-pointer p-3 bg-white/10 hover:bg-white/20 rounded-full z-10"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="relative w-full max-w-5xl aspect-video rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-black">
            <video 
              src="/assets/videos/hero-video.mp4"
              controls
              autoPlay
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      )}
      {/* Transform Financial Future Section */}
      <div id="threeways-section" className="scroll-mt-20">
        <ThreeWays />
      </div>

      {/* Services We Offer Section */}
      <ServicesWeOffer />

      {/* Department Services Section */}
      <section className="py-20 bg-black/20 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center mb-12">
            <span className="text-[#D4AF37] text-xs tracking-[0.2em] font-semibold uppercase">What We Offer</span>
            <h2 className="text-5xl font-semibold tracking-tight mt-2.5">Our Service Departments</h2>
            <p className="text-gray-400 mt-4 max-w-2xl mx-auto text-base">End-to-end financial advisory across four core departments, each with dedicated consultants, workflows, and reporting.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: '📋', color: '#f59e0b', label: 'Tax Management', items: ['ITR Filing', 'GST Returns', 'Tax Planning', 'Tax Saving Advisory', 'Business Tax'] },
              { icon: '📈', color: '#8b5cf6', label: 'Investment Management', items: ['Mutual Funds', 'SIP Planning', 'Equity & Stocks', 'Portfolio Management', 'Retirement Planning'] },
              { icon: '🏦', color: '#3b82f6', label: 'Loan Management', items: ['Home Loans', 'Personal Loans', 'Business Loans', 'Vehicle Loans', 'Eligibility Check'] },
              { icon: '💎', color: '#f43f5e', label: 'Wealth Management', items: ['Goal-Based Planning', 'Estate Planning', 'HNI Advisory', 'Asset Allocation', 'Quarterly Reviews'] },
            ].map((dept, i) => (
              <motion.div key={i} whileHover={{ y: -4 }} transition={{ duration: 0.3 }}
                className="bg-white/5 border border-white/10 hover:border-[#D4AF37]/40 p-6 rounded-2xl transition-all group">
                <div className="text-3xl mb-4">{dept.icon}</div>
                <h3 className="text-lg font-bold text-white mb-3 group-hover:text-[#D4AF37] transition-colors">{dept.label}</h3>
                <ul className="space-y-1.5">
                  {dept.items.map(item => (
                    <li key={item} className="flex items-center gap-2 text-sm text-gray-400">
                      <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: dept.color }} />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link to="/client/login"
                  className="mt-5 flex items-center gap-2 text-xs font-semibold tracking-wider uppercase group-hover:text-[#D4AF37] text-gray-500 transition-colors">
                  Get Started <ArrowRight className="w-3 h-3" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Timeline */}
      <section className="py-28">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
            <h2 className="text-6xl font-semibold tracking-tight">How We Work</h2>
          </div>
          <Timeline steps={timelineSteps} />
        </div>
      </section>

      {/* Why FinBridge Section */}
      <section className="py-20 bg-black/20 border-t border-b border-white/10 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16">
            {/* Left Column */}
            <div className="lg:col-span-5 flex flex-col justify-center items-start">
              <span className="text-[#D4AF37] text-xs font-mono tracking-[0.2em] font-semibold uppercase block mb-3">
                WHY FINBRIDGE
              </span>
              <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-white leading-tight mb-4">
                Why Businesses Choose FinBridge
              </h2>
              <p className="text-gray-400 text-base leading-relaxed font-sans font-light mb-8">
                Empowering startups, SMEs, and growing enterprises with strategic financial guidance, intelligent insights, and growth-focused solutions.
              </p>
              <Link 
                to="/about" 
                className="inline-flex items-center gap-2 border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#0A192F] font-semibold text-xs tracking-wider uppercase py-3.5 px-6 transition-all duration-300 rounded-lg group"
              >
                Learn More
                <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Right Column */}
            <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Point 1 */}
              <div className="bg-white/5 border border-white/10 hover:border-[#D4AF37]/50 p-6 rounded-2xl transition-all duration-300 group hover:-translate-y-0.5 shadow-md">
                <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] mb-4 group-hover:bg-[#D4AF37]/20 transition-colors">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#D4AF37] transition-colors">
                  Financial Expertise
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed font-sans font-light">
                  Leverage professional financial analysis and strategic planning to make informed business decisions.
                </p>
              </div>

              {/* Point 2 */}
              <div className="bg-white/5 border border-white/10 hover:border-[#D4AF37]/50 p-6 rounded-2xl transition-all duration-300 group hover:-translate-y-0.5 shadow-md">
                <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] mb-4 group-hover:bg-[#D4AF37]/20 transition-colors">
                  <PieChart className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#D4AF37] transition-colors">
                  Data-Driven Insights
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed font-sans font-light">
                  Transform financial data into actionable insights through analytics, reporting, and performance tracking.
                </p>
              </div>

              {/* Point 3 */}
              <div className="bg-white/5 border border-white/10 hover:border-[#D4AF37]/50 p-6 rounded-2xl transition-all duration-300 group hover:-translate-y-0.5 shadow-md">
                <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] mb-4 group-hover:bg-[#D4AF37]/20 transition-colors">
                  <Target className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#D4AF37] transition-colors">
                  Personalized Recommendations
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed font-sans font-light">
                  Receive tailored recommendations aligned with your business goals, financial position, and growth objectives.
                </p>
              </div>

              {/* Point 4 */}
              <div className="bg-white/5 border border-white/10 hover:border-[#D4AF37]/50 p-6 rounded-2xl transition-all duration-300 group hover:-translate-y-0.5 shadow-md">
                <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] mb-4 group-hover:bg-[#D4AF37]/20 transition-colors">
                  <Briefcase className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#D4AF37] transition-colors">
                  End-to-End Support
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed font-sans font-light">
                  From financial assessment to implementation planning, access guidance throughout your business journey.
                </p>
              </div>
            </div>
          </div>

          {/* Separator */}
          <div className="border-t border-white/10 my-12" />

          {/* Bottom Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-[#D4AF37] mb-2">
                <AnimatedCounter end={1200} />+
              </div>
              <div className="text-xs text-gray-400 uppercase tracking-wider font-sans font-medium">
                Clients Served
              </div>
            </div>
            <div>
              <div className="text-4xl font-bold text-[#D4AF37] mb-2">
                <AnimatedCounter end={98} />%
              </div>
              <div className="text-xs text-gray-400 uppercase tracking-wider font-sans font-medium">
                Client Satisfaction
              </div>
            </div>
            <div>
              <div className="text-4xl font-bold text-[#D4AF37] mb-2">
                ₹<AnimatedCounter end={500} /> Cr+
              </div>
              <div className="text-xs text-gray-400 uppercase tracking-wider font-sans font-medium">
                Assets Under Advisory
              </div>
            </div>
            <div>
              <div className="text-4xl font-bold text-[#D4AF37] mb-2">
                4
              </div>
              <div className="text-xs text-gray-400 uppercase tracking-wider font-sans font-medium">
                Service Departments
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Industries */}
      <section className="py-20 bg-black/35 relative">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center mb-12">
            <span className="text-[#D4AF37] text-xs tracking-[0.2em] font-semibold uppercase">Sectors We Empower</span>
            <h2 className="text-5xl font-semibold tracking-tight mt-2.5">Industries We Serve</h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {industries.map((industry, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -6 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="group relative h-[300px] rounded-3xl overflow-hidden border border-white/10 hover:border-[#D4AF37]/50 transition-all duration-500 cursor-pointer shadow-2xl"
              >
                {/* Background Image with Zoom on Hover */}
                <motion.div 
                  className="absolute inset-0 bg-cover bg-center z-0"
                  style={{ backgroundImage: `url(${industry.image})` }}
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                />
                
                {/* Dark Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A192F] via-[#0A192F]/65 to-black/30 z-10 transition-opacity group-hover:opacity-90 duration-500" />
                
                {/* Content Container */}
                <div className="absolute inset-0 z-20 p-6 flex flex-col justify-end">
                  {/* Accent Line */}
                  <div className="w-10 h-0.5 bg-[#D4AF37] mb-4 group-hover:w-16 transition-all duration-300"></div>
                  
                  <h3 className="text-xl font-bold tracking-tight text-white mb-2 group-hover:text-[#D4AF37] transition-colors duration-300">
                    {industry.name}
                  </h3>
                  
                  <p className="text-gray-300/95 text-[13px] leading-relaxed group-hover:text-white transition-colors duration-300">
                    {industry.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Case Studies */}
      <section className="py-28">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex justify-between mb-12">
            <h2 className="text-6xl font-semibold tracking-tight">Client Success</h2>
            <Link to="/contact" className="flex items-center gap-3 text-[#D4AF37]">All Success Stories <ArrowRight /></Link>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {caseStudies.map((study, i) => (
              <CaseStudyCard study={study} index={i} key={i} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-28 bg-gradient-to-br from-[#0A192F] to-black border-t border-[#D4AF37]/20">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-6xl font-semibold tracking-tight mb-8">Begin Your Strategic Journey</h2>
          <p className="text-2xl text-gray-400 mb-10">Connect with our senior advisors today.</p>
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <button
              onClick={() => {
                const contactSection = document.getElementById('contact-section');
                if (contactSection) contactSection.scrollIntoView({ behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-4 bg-[#D4AF37] hover:bg-white text-[#0A192F] px-12 py-5 rounded-3xl font-semibold text-xl transition-all group cursor-pointer"
            >
              SCHEDULE CONSULTATION
              <ArrowRight className="group-hover:translate-x-2 transition" />
            </button>
            <Link to="/client/login"
              className="inline-flex items-center gap-3 border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#0A192F] px-10 py-5 rounded-3xl font-semibold text-xl transition-all group">
              CLIENT PORTAL
              <ArrowRight className="group-hover:translate-x-2 transition" />
            </Link>
          </div>
          {/* Portal links row */}
          <div className="flex flex-wrap justify-center gap-3 pt-4 border-t border-white/10">
            {[
              { label: 'Consultant Login', path: '/consultant/login' },
              { label: 'Department Admin', path: '/department-admin/login' },
              { label: 'CRM Admin', path: '/crm-admin/login' },
              { label: 'Super Admin', path: '/admin/login' },
            ].map(p => (
              <Link key={p.label} to={p.path}
                className="text-xs text-gray-500 hover:text-[#D4AF37] transition-colors font-semibold tracking-wider uppercase border border-white/10 hover:border-[#D4AF37]/30 px-4 py-2 rounded-full">
                {p.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact-section" className="py-24 bg-[#0A192F] border-t border-white/10 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid lg:grid-cols-12 gap-12">
            {/* Contact Form — now captures real leads */}
            <div className="lg:col-span-7">
              <div className="bg-white/5 border border-white/10 rounded-3xl p-8 md:p-12">
                <h2 className="text-4xl font-semibold mb-10">Request a Free Consultation</h2>
                <LeadCaptureForm />
              </div>
            </div>

            {/* Contact Information */}
            <div className="lg:col-span-5 space-y-10">
              <div>
                <h3 className="text-2xl font-semibold mb-8 flex items-center gap-3">
                  <Mail className="text-[#D4AF37] w-6 h-6" /> Get In Touch
                </h3>
                <div className="space-y-6">
                  <a href="mailto:advisory@finbridge.com" className="block group">
                    <div className="flex items-center gap-4 text-lg">
                      <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center group-hover:bg-[#D4AF37] group-hover:text-[#0A192F] transition-all">
                        ✉️
                      </div>
                      <div>
                        <div className="text-gray-400 text-sm">Primary Email</div>
                        <div className="text-white group-hover:text-[#D4AF37] transition-colors">advisory@finbridge.com</div>
                      </div>
                    </div>
                  </a>

                  <a href="tel:+12125550189" className="block group">
                    <div className="flex items-center gap-4 text-lg">
                      <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center group-hover:bg-[#D4AF37] group-hover:text-[#0A192F] transition-all">
                        📞
                      </div>
                      <div>
                        <div className="text-gray-400 text-sm">Global Helpline</div>
                        <div className="text-white group-hover:text-[#D4AF37] transition-colors">+1 (212) 555-0189</div>
                      </div>
                    </div>
                  </a>
                </div>
              </div>

              {/* Global Offices */}
              <div>
                <h3 className="text-2xl font-semibold mb-8 flex items-center gap-3">
                  <MapPin className="text-[#D4AF37] w-6 h-6" /> Our Offices
                </h3>
                <div className="space-y-8">
                  {offices.map((office, index) => (
                    <motion.div 
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      viewport={{ once: true }}
                      className="border-l-4 border-[#D4AF37] pl-8"
                    >
                      <div className="font-semibold text-xl mb-3">{office.city}</div>
                      <div className="text-gray-400 text-sm leading-relaxed mb-4">{office.address}</div>
                      <div className="flex flex-col gap-2 text-sm">
                        <a href={`tel:${office.phone}`} className="hover:text-[#D4AF37] transition-colors flex items-center gap-2">
                          <Phone className="w-4 h-4" /> {office.phone}
                        </a>
                        <a href={`mailto:${office.email}`} className="hover:text-[#D4AF37] transition-colors flex items-center gap-2">
                          <Mail className="w-4 h-4" /> {office.email}
                        </a>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="pt-8 border-t border-white/10">
                <div className="flex items-center gap-3 text-sm text-gray-400">
                  <Clock className="w-5 h-5" />
                  <span>Response within 4 business hours</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;