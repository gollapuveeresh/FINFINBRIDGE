import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const ThreeWays = () => {
  return (
    <section className="py-20 bg-[#0A192F] text-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        
        {/* Header */}
        <div className="max-w-5xl mb-10">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-white leading-tight mb-3">
            Three Ways To Transform Your Financial Future
          </h2>
          <p className="text-sm md:text-base text-gray-400 leading-relaxed font-sans font-light max-w-3xl">
            Strategic consulting, intelligent financial planning, and growth-focused solutions that help businesses scale with confidence.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1 */}
          <Link 
            to="/financial-transformation" 
            className="group flex flex-col justify-between p-6 bg-transparent border border-white/10 hover:border-white/20 rounded-2xl transition-all duration-300 min-h-[180px] shadow-sm hover:shadow-md hover:-translate-y-0.5"
          >
            <div>
              <h3 className="text-lg font-bold text-white mb-2 transition-colors duration-300">
                Strengthen Your Financial Foundation
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed font-sans font-light line-clamp-2">
                Improve profitability through financial planning and cash-flow optimization.
              </p>
            </div>
            {/* Kept minimal, no icon to prioritize center card */}
          </Link>

          {/* Card 2 (Featured Card) */}
          <Link 
            to="/transaction-services" 
            className="group flex flex-col justify-between p-6 bg-white/[0.04] border border-[#D4AF37]/30 hover:border-[#D4AF37]/80 rounded-2xl transition-all duration-300 min-h-[180px] shadow-lg shadow-[#D4AF37]/2 hover:shadow-[#D4AF37]/10 hover:-translate-y-1 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#D4AF37]/40 to-transparent" />
            
            <div>
              <h3 className="text-lg font-bold text-[#D4AF37] mb-2 transition-colors duration-300">
                Accelerate Business Growth
              </h3>
              <p className="text-xs text-gray-300 leading-relaxed font-sans font-light line-clamp-2">
                Scale confidently with business consulting and growth strategies.
              </p>
            </div>
            
            <div className="mt-4 flex items-center justify-start text-[#D4AF37]">
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" />
            </div>
          </Link>

          {/* Card 3 */}
          <Link 
            to="/corporate-finance" 
            className="group flex flex-col justify-between p-6 bg-transparent border border-white/10 hover:border-white/20 rounded-2xl transition-all duration-300 min-h-[180px] shadow-sm hover:shadow-md hover:-translate-y-0.5"
          >
            <div>
              <h3 className="text-lg font-bold text-white mb-2 transition-colors duration-300">
                Unlock Funding & Investment Opportunities
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed font-sans font-light line-clamp-2">
                Connect growth ambitions with funding and investment solutions.
              </p>
            </div>
            {/* Kept minimal, no icon to prioritize center card */}
          </Link>

        </div>
      </div>
    </section>
  );
};

export default ThreeWays;
