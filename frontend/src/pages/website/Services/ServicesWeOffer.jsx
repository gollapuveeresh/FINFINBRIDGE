import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const ServicesWeOffer = () => {
  const servicesData = [
    {
      title: "Financial Consulting",
      desc: "Business financial planning, cash flow management, profitability analysis, and strategic decision-making support.",
      path: "/financial-transformation"
    },
    {
      title: "Tax Advisory & Compliance",
      desc: "Tax planning, compliance management, tax optimization, and regulatory guidance.",
      path: "/risk-compliance"
    },
    {
      title: "Investment Advisory",
      desc: "Portfolio analysis, investment planning, risk assessment, and wealth creation strategies.",
      path: "/wealth-management"
    },
    {
      title: "Startup Consulting",
      desc: "Business planning, investor readiness, market strategy, and startup growth guidance.",
      path: "/transaction-services"
    },
    {
      title: "Corporate Finance",
      desc: "Capital raising, financial restructuring, mergers support, and growth financing solutions.",
      path: "/corporate-finance"
    },
    {
      title: "Business Valuation",
      desc: "Comprehensive business assessment, valuation reports, and investment readiness evaluation.",
      path: "/valuation-advisory"
    }
  ];

  return (
    <section className="py-16 bg-black/40">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-white">Services We Offer</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {servicesData.map((service, i) => (
            <Link 
              key={i} 
              to={service.path} 
              className="group flex flex-col justify-between p-8 bg-white/5 border border-white/10 hover:border-[#D4AF37]/60 rounded-3xl transition-all duration-300 min-h-[240px] shadow-lg hover:shadow-[#D4AF37]/5 hover:-translate-y-1"
            >
              <div>
                <span className="text-xs font-mono text-[#D4AF37]/70 group-hover:text-[#D4AF37] transition-colors mb-4 block">0{i+1}</span>
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-[#D4AF37] transition-colors duration-300">
                  {service.title}
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed font-sans font-light">
                  {service.desc}
                </p>
              </div>
              <div className="mt-6 flex items-center justify-start text-[#D4AF37]">
                <ArrowRight className="w-5 h-5 transform group-hover:translate-x-1.5 transition-transform duration-300" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesWeOffer;
