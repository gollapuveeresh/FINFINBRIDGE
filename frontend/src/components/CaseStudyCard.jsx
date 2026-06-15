// src/components/CaseStudyCard.jsx
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const CaseStudyCard = ({ study, index }) => {
  return (
    <motion.div 
      key={index}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -10 }}
      className="bg-white/5 border border-white/10 rounded-3xl p-10 group hover:border-[#D4AF37]/50 transition-all duration-300"
    >
      <div className="text-[#D4AF37] text-sm font-medium tracking-widest mb-6">CASE STUDY</div>
      <h3 className="text-3xl font-semibold mb-2">{study.company}</h3>
      <p className="text-gray-400 mb-8">{study.industry}</p>
      
      <div className="border-t border-white/10 pt-8 mt-auto">
        <div className="text-5xl font-bold text-[#D4AF37] mb-1">{study.value}</div>
        <div className="text-lg text-gray-300 leading-tight">{study.result}</div>
      </div>

      <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-end opacity-0 group-hover:opacity-100 transition-all">
        <a href="#" className="text-[#D4AF37] text-sm font-medium flex items-center gap-2 hover:gap-3 transition-all">
          Read Full Case <ArrowRight className="w-4 h-4" />
        </a>
      </div>
    </motion.div>
  );
};

export default CaseStudyCard;