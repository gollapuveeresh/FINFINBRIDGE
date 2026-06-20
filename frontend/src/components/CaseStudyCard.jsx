// src/components/CaseStudyCard.jsx
import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const CaseStudyCard = ({ study }) => {
  const cardRef = useRef(null);
  const [transformStyle, setTransformStyle] = useState('');
  const [shadowStyle, setShadowStyle] = useState('');
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setMousePos({ x, y });
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = ((centerY - y) / centerY) * 6;
    const rotateY = ((x - centerX) / centerX) * 6;
    
    setTransformStyle(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02) translateY(-4px)`);
    setShadowStyle(`${-rotateY * 2}px ${rotateX * 2}px 30px rgba(212, 175, 55, 0.1)`);
  };

  const handleMouseLeave = () => {
    setTransformStyle('');
    setShadowStyle('');
  };

  return (
    <Link to={study.path || "/startup-success-stories"} className="block h-full">
      <div 
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ 
          transform: transformStyle, 
          boxShadow: shadowStyle,
          transition: 'transform 0.15s cubic-bezier(0.25, 1, 0.5, 1), border-color 0.3s ease, box-shadow 0.3s ease',
          '--mouse-x': `${mousePos.x}px`,
          '--mouse-y': `${mousePos.y}px`
        }}
        className="relative bg-[#0c1a30]/85 border border-white/10 hover:border-[#D4AF37]/50 rounded-3xl p-10 group transition-all duration-300 h-full flex flex-col cursor-pointer overflow-hidden backdrop-blur-md hover:bg-[#0e223f]/95 text-left"
      >
        {/* Radial Hover Spotlight Glow */}
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-0"
          style={{
            background: `radial-gradient(350px circle at var(--mouse-x) var(--mouse-y), rgba(212, 175, 55, 0.05), transparent 60%)`
          }}
        />

        <div className="relative z-10 flex flex-col h-full">
          <div className="text-[#D4AF37] text-xs font-mono tracking-[0.2em] font-semibold mb-6 uppercase">CASE STUDY</div>
          <h3 className="text-3xl font-bold mb-2 text-white group-hover:text-[#D4AF37] transition-colors duration-300">{study.company}</h3>
          <p className="text-gray-400 mb-8 font-sans font-light text-base">{study.industry}</p>
          
          <div className="border-t border-white/5 pt-8 mt-auto">
            <div className="text-5xl font-extrabold text-[#D4AF37] mb-1">{study.value}</div>
            <div className="text-lg text-gray-300 leading-tight font-sans font-light">{study.result}</div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span className="text-[#D4AF37] text-sm font-semibold flex items-center gap-2 transform group-hover:translate-x-1 transition-all duration-300">
              Read Full Case <ArrowRight className="w-4 h-4" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CaseStudyCard;