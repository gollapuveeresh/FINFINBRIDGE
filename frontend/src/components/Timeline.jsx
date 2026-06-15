// src/components/Timeline.jsx
import { motion } from 'framer-motion';

const Timeline = ({ steps }) => {
  return (
    <div className="max-w-4xl mx-auto">
      {steps.map((item, index) => (
        <motion.div 
          key={index}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="flex gap-8 mb-12 last:mb-0 relative"
        >
          {index !== steps.length - 1 && (
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
  );
};

export default Timeline;