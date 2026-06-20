import { motion } from 'framer-motion';
import { Shield, Lock, Eye, FileText, CheckCircle } from 'lucide-react';

export default function PrivacyPolicy() {
  const sections = [
    {
      icon: <Eye className="w-6 h-6 text-[#D4AF37]" />,
      title: "1. Information We Collect",
      content: "We collect information you provide directly to us when requesting a consultation, registering for an account, or completing your financial profile. This includes: identification data (full name, email, phone number), financial information (annual income, budget/loan requirements), and details regarding the services you require."
    },
    {
      icon: <Shield className="w-6 h-6 text-[#D4AF37]" />,
      title: "2. How We Use Your Information",
      content: "Your data is used to provide premium financial advisory services, match you with certified consultants, improve our wealth management algorithms, and comply with regulatory disclosure requirements. We do not sell or share your personal data with third-party marketers."
    },
    {
      icon: <Lock className="w-6 h-6 text-[#D4AF37]" />,
      title: "3. Data Security and Isolation",
      content: "We implement rigorous security measures, including AES-256 encryption, network isolation, and multi-factor authentication. Client sessions are isolated and configured to automatically log out on website reload or inactivity to prevent unauthorized access on shared devices."
    },
    {
      icon: <FileText className="w-6 h-6 text-[#D4AF37]" />,
      title: "4. Data Retention Policy",
      content: "We retain your personal and financial profile data only as long as necessary to provide our services and satisfy legal, accounting, or reporting obligations. Captured lead data is automatically routed to the corresponding department and archived securely."
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
            Privacy <span className="text-[#D4AF37]">Policy</span>
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Our commitment to protecting your personal and financial data is paramount. Learn how we handle your information securely.
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
              <CheckCircle className="w-5 h-5" /> Your Consent
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              By using our portal and submitting consultation requests, you consent to our collection, processing, and storage of your information as outlined in this policy. For any privacy-related inquiries, contact us at <a href="mailto:contact@finbridge.com" className="text-[#D4AF37] underline">contact@finbridge.com</a>.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
