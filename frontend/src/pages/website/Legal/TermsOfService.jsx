import { motion } from 'framer-motion';
import { FileCheck, Users, HelpCircle, AlertTriangle, Scale } from 'lucide-react';

export default function TermsOfService() {
  const sections = [
    {
      icon: <Scale className="w-6 h-6 text-[#D4AF37]" />,
      title: "1. Acceptance of Terms",
      content: "By accessing and using FinBridge Solutions' website, portals, and services, you agree to comply with and be bound by these Terms of Service. If you do not agree, you must immediately terminate use of our services."
    },
    {
      icon: <Users className="w-6 h-6 text-[#D4AF37]" />,
      title: "2. Client Accounts & Eligibility",
      content: "You must provide accurate, current, and complete information during registration and form submission. You are responsible for keeping your credentials confidential. Client sessions are automatically logged out upon reloading or tab closure for security purposes."
    },
    {
      icon: <FileCheck className="w-6 h-6 text-[#D4AF37]" />,
      title: "3. Service Provision and Scope",
      content: "FinBridge provides corporate finance, valuation advisory, tax planning, and wealth consulting. Our digital platform serves to connect you with professional consultants. All advisory services are subject to separate formal engagement letters."
    },
    {
      icon: <AlertTriangle className="w-6 h-6 text-[#D4AF37]" />,
      title: "4. Limitations of Liability",
      content: "FinBridge Solutions and its licensed advisors are not liable for any indirect, incidental, or consequential losses resulting from decisions made using recommendations on our digital tools. Past performance does not guarantee future financial yields."
    }
  ];

  return (
    <div className="bg-[#0A192F] text-white min-h-screen pt-32 pb-20 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(at_top_right,#D4AF37_0%,transparent_60%)] opacity-10 pointer-events-none"></div>

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-white/10 text-[#D4AF37] text-xs font-mono tracking-[0.2em] font-semibold px-6 py-2 rounded-full mb-6 border border-[#D4AF37]/30">
            LEGAL DOCUMENTATION
          </div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
            Terms of <span className="text-[#D4AF37]">Service</span>
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Please read these terms carefully before accessing our dashboard, submitting forms, or engaging with our advisory professionals.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="space-y-8"
        >
          {sections.map((section, idx) => (
            <div key={idx} className="bg-white/[0.03] border border-white/10 p-8 rounded-3xl hover:border-[#D4AF37]/30 transition-all duration-300">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-white/[0.05] rounded-2xl">
                  {section.icon}
                </div>
                <h2 className="text-2xl font-semibold text-white">{section.title}</h2>
              </div>
              <p className="text-gray-300 leading-relaxed pl-16">{section.content}</p>
            </div>
          ))}

          <div className="bg-[#D4AF37]/10 border border-[#D4AF37]/30 p-8 rounded-3xl mt-12">
            <h3 className="text-xl font-bold text-[#D4AF37] mb-2 flex items-center gap-2">
              <HelpCircle className="w-5 h-5" /> Need Assistance?
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              If you have any questions or require clarification regarding these terms, please contact our support department at <a href="mailto:support@finbridge.com" className="text-[#D4AF37] underline">support@finbridge.com</a>.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
