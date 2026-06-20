import { motion } from 'framer-motion';
import { Landmark, ShieldAlert, Award, FileText, CheckCircle } from 'lucide-react';

export default function RegulatoryDisclosures() {
  const disclosures = [
    {
      icon: <Landmark className="w-6 h-6 text-[#D4AF37]" />,
      title: "1. Corporate Structure and Licensing",
      content: "FinBridge Solutions is a registered financial consulting and wealth management firm. Advisory services are provided by certified financial advisors, CFAs, and legal consultants licensed under applicable regional regulations. Registration does not imply a certain level of skill or training."
    },
    {
      icon: <ShieldAlert className="w-6 h-6 text-[#D4AF37]" />,
      title: "2. Investment and Market Risks",
      content: "All investment advisory and capital allocation services carry inherent market risk, including the possible loss of principal amount. Alternative investments, private placements, and venture capital allocations are suitable only for qualified institutional or accredited investors."
    },
    {
      icon: <Award className="w-6 h-6 text-[#D4AF37]" />,
      title: "3. Professional Standards & Fiduciary Duty",
      content: "We adhere to strict fiduciary principles, placing our clients' interests above our own. We continuously review potential conflicts of interest, referral relationships, and transactional compensation models to maintain transparency and regulatory compliance."
    },
    {
      icon: <FileText className="w-6 h-6 text-[#D4AF37]" />,
      title: "4. Regulatory Disclosures and Filings",
      content: "FinBridge complies with all national security, corporate, and regional data protection regulations (including DPDP compliance protocols). Our regular disclosure documents, transaction histories, and audit records are available to regulatory authorities upon request."
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
            COMPLIANCE DOCUMENTATION
          </div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
            Regulatory <span className="text-[#D4AF37]">Disclosures</span>
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            FinBridge Solutions operates under the highest standards of professional ethics, transparency, and regional compliance.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="space-y-8"
        >
          {disclosures.map((disc, idx) => (
            <div key={idx} className="bg-white/[0.03] border border-white/10 p-8 rounded-3xl hover:border-[#D4AF37]/30 transition-all duration-300">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-white/[0.05] rounded-2xl">
                  {disc.icon}
                </div>
                <h2 className="text-2xl font-semibold text-white">{disc.title}</h2>
              </div>
              <p className="text-gray-300 leading-relaxed pl-16">{disc.content}</p>
            </div>
          ))}

          <div className="bg-[#D4AF37]/10 border border-[#D4AF37]/30 p-8 rounded-3xl mt-12">
            <h3 className="text-xl font-bold text-[#D4AF37] mb-2 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" /> Fiduciary Assurance
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              For additional regulatory filings, ADV forms, or general compliance documentation requests, please contact our chief compliance officer at <a href="mailto:contact@finbridge.com" className="text-[#D4AF37] underline">contact@finbridge.com</a>.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
