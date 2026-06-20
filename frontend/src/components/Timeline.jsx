// src/components/Timeline.jsx
import { motion } from 'framer-motion';

const Timeline = ({ steps }) => {
  return (
    <div className="max-w-4xl mx-auto">
      <style>{`
        @keyframes timeline-flow {
          0% { background-position: 0% -100%; }
          100% { background-position: 0% 100%; }
        }
      `}</style>
      {steps.map((item, index) => (
        <motion.div 
          key={index}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="flex gap-8 mb-12 last:mb-0 relative group"
        >
          {index !== steps.length - 1 && (
            <div className="absolute left-[27px] top-12 bottom-0 w-[2px] bg-white/5 overflow-hidden">
              <div 
                className="w-full h-full bg-gradient-to-b from-transparent via-[#D4AF37] to-transparent" 
                style={{
                  backgroundSize: '100% 200%',
                  animation: 'timeline-flow 4s linear infinite'
                }}
              />
            </div>
          )}
          <div className="w-14 h-14 rounded-2xl bg-[#D4AF37] text-[#0A192F] flex items-center justify-center font-bold text-xl flex-shrink-0 z-10 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-[#D4AF37]/20 shadow-md">
            {item.step}
          </div>
          <div className="pt-2 text-left">
            <h3 className="text-2xl font-semibold mb-3 group-hover:text-[#D4AF37] transition-colors duration-300">{item.title}</h3>
            <p className="text-gray-400 text-lg leading-relaxed font-sans font-light">{item.desc}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default Timeline;