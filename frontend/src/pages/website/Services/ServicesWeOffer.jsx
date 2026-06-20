import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const FloatingCard = ({ to, className, children }) => {
  const cardRef = React.useRef(null);
  const [transformStyle, setTransformStyle] = React.useState('');
  const [shadowStyle, setShadowStyle] = React.useState('');

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = ((centerY - y) / centerY) * 8;
    const rotateY = ((x - centerX) / centerX) * 8;
    
    setTransformStyle(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02) translateY(-4px)`);
    setShadowStyle(`${-rotateY * 2}px ${rotateX * 2}px 25px rgba(212, 175, 55, 0.15)`);
  };

  const handleMouseLeave = () => {
    setTransformStyle('');
    setShadowStyle('');
  };

  return (
    <Link 
      to={to} 
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ 
        transform: transformStyle, 
        boxShadow: shadowStyle,
        transition: 'transform 0.15s cubic-bezier(0.25, 1, 0.5, 1), border-color 0.3s ease, box-shadow 0.3s ease' 
      }}
      className={className}
    >
      {children}
    </Link>
  );
};

const CanvasBackground = () => {
  const canvasRef = React.useRef(null);
  
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    
    // Auto-resizing variables
    const parent = canvas.parentElement;
    let width = (canvas.width = parent ? parent.clientWidth : window.innerWidth);
    let height = (canvas.height = parent ? parent.clientHeight : 500);
    
    const handleResize = () => {
      if (!canvas) return;
      const p = canvas.parentElement;
      width = canvas.width = p ? p.clientWidth : window.innerWidth;
      height = canvas.height = p ? p.clientHeight : 500;
    };
    window.addEventListener('resize', handleResize);
    
    // Interactive mouse coordinates
    const mouse = { x: null, y: null };
    
    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };
    
    const handleMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    
    // Grid parameters
    const rows = 15;
    const cols = 20;
    const fov = 1800;
    
    // Drifting gold particles setup
    const particles = [];
    const particleCount = 70;
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2.6 + 0.8,
        speedX: (Math.random() - 0.5) * 0.4,
        speedY: -Math.random() * 0.5 - 0.15, // Drift upwards slowly
        color: `rgba(212, 175, 55, ${Math.random() * 0.45 + 0.25})`
      });
    }
    
    const animate = () => {
      // Robust client size sync on every frame to prevent blurriness and layout shift stretching
      const p = canvas.parentElement;
      const currentWidth = p ? p.clientWidth : window.innerWidth;
      const currentHeight = p ? p.clientHeight : 500;
      if (canvas.width !== currentWidth || canvas.height !== currentHeight) {
        width = canvas.width = currentWidth;
        height = canvas.height = currentHeight;
      }
      
      ctx.clearRect(0, 0, width, height);
      
      // Semi-transparent background clear for smooth trails
      ctx.fillStyle = 'rgba(10, 25, 47, 0.02)';
      ctx.fillRect(0, 0, width, height);
      
      // 1. Draw drifting dust particles across the entire height/width
      particles.forEach(p => {
        p.x += p.speedX;
        p.y += p.speedY;
        
        // Wrap around borders
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) {
          p.y = height;
          p.x = Math.random() * width;
        }
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      });
      
      const time = Date.now() * 0.0016;
      
      // Rotate grid slowly over time + mouse interaction
      const rotY = 0.2 + time * 0.045 + (mouse.x !== null ? (mouse.x - width / 2) * 0.00015 : 0);
      const rotX = -0.38 + (mouse.y !== null ? (mouse.y - height / 2) * 0.00015 : 0);
      
      const gridWidth = width * 1.35;
      const gridDepth = Math.min(height * 0.85, 1100);
      const spacingX = gridWidth / (cols - 1);
      const spacingZ = gridDepth / (rows - 1);
      
      const projectedGrid = [];
      
      // Calculate 3D waving coordinates
      for (let r = 0; r < rows; r++) {
        projectedGrid[r] = [];
        for (let c = 0; c < cols; c++) {
          const posX = (c - cols / 2) * spacingX;
          const posZ = (r - rows / 2) * spacingZ;
          
          // Double sine wave
          const wave1 = Math.sin(time * 0.85 + c * 0.35 + r * 0.25) * 28;
          const wave2 = Math.cos(time * 0.45 + c * 0.18 - r * 0.15) * 14;
          let posY = wave1 + wave2;
          
          // Mouse interaction (Ripple effect)
          if (mouse.x !== null && mouse.y !== null) {
            // Rough projection to estimate 2D distance for mouse ripple
            const x1_raw = posX * Math.cos(rotY) - posZ * Math.sin(rotY);
            const z1_raw = posX * Math.sin(rotY) + posZ * Math.cos(rotY);
            const y2_raw = - z1_raw * Math.sin(rotX);
            const z2_raw = z1_raw * Math.cos(rotX);
            const scale_raw = fov / (fov + z2_raw);
            const projX_raw = (x1_raw * scale_raw) + (width * 0.5);
            const projY_raw = (y2_raw * scale_raw) + (height * 0.5);
            
            const dx = projX_raw - mouse.x;
            const dy = projY_raw - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 280) {
              const factor = 1 - dist / 280;
              posY += Math.sin(dist * 0.04 - time * 5.5) * 45 * factor;
            }
          }
          
          // Rotate coordinates around Y and X axes
          const x1 = posX * Math.cos(rotY) - posZ * Math.sin(rotY);
          const z1 = posX * Math.sin(rotY) + posZ * Math.cos(rotY);
          
          const y2 = posY * Math.cos(rotX) - z1 * Math.sin(rotX);
          const z2 = posY * Math.sin(rotX) + z1 * Math.cos(rotX);
          
          // Perspective projection centered vertically
          const scale = fov / (fov + z2);
          const projX = (x1 * scale) + (width * 0.5);
          const projY = (y2 * scale) + (height * 0.5);
          
          projectedGrid[r][c] = { x: projX, y: projY, z: z2, scale };
        }
      }
      
      // Helper function to draw connections
      const drawLine = (p1, p2) => {
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        const maxDist = 165;
        
        if (dist < maxDist) {
          const depthAvg = (p1.z + p2.z) / 2;
          const depthRatio = Math.max(0.1, 1 - (depthAvg + 550) / 1100);
          const opacity = (1 - dist / maxDist) * 0.55 * depthRatio;
          
          ctx.strokeStyle = `rgba(212, 175, 55, ${opacity})`;
          ctx.lineWidth = 0.95 * ((p1.scale + p2.scale) / 2);
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      };
      
      // Connect points (rows and columns)
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const p1 = projectedGrid[r][c];
          
          if (c < cols - 1) {
            drawLine(p1, projectedGrid[r][c + 1]);
          }
          if (r < rows - 1) {
            drawLine(p1, projectedGrid[r + 1][c]);
          }
        }
      }
      
      // 3. Draw energy pulses along lines
      const pulseSpeed = time * 0.65;
      for (let r = 0; r < rows; r += 2) {
        for (let c = 0; c < cols - 1; c += 3) {
          const p1 = projectedGrid[r][c];
          const p2 = projectedGrid[r][c + 1];
          if (p1 && p2) {
            const dx = p1.x - p2.x;
            const dy = p1.y - p2.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            if (dist < 140) {
              const t = (pulseSpeed + (r * 0.12) + (c * 0.07)) % 1;
              const px = p1.x + (p2.x - p1.x) * t;
              const py = p1.y + (p2.y - p1.y) * t;
              const pScale = p1.scale * (1 - t) + p2.scale * t;
              const pSize = Math.max(2, pScale * 3.8);
              
              ctx.beginPath();
              ctx.arc(px, py, pSize, 0, Math.PI * 2);
              ctx.fillStyle = '#ffffff';
              ctx.shadowBlur = 10;
              ctx.shadowColor = 'rgba(212, 175, 55, 0.95)';
              ctx.fill();
              ctx.shadowBlur = 0;
            }
          }
        }
      }
      
      for (let c = 1; c < cols; c += 3) {
        for (let r = 0; r < rows - 1; r += 4) {
          const p1 = projectedGrid[r][c];
          const p2 = projectedGrid[r + 1][c];
          if (p1 && p2) {
            const dx = p1.x - p2.x;
            const dy = p1.y - p2.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            if (dist < 140) {
              const t = (pulseSpeed * 0.8 + (r * 0.08) + (c * 0.15)) % 1;
              const px = p1.x + (p2.x - p1.x) * t;
              const py = p1.y + (p2.y - p1.y) * t;
              const pScale = p1.scale * (1 - t) + p2.scale * t;
              const pSize = Math.max(1.8, pScale * 3.2);
              
              ctx.beginPath();
              ctx.arc(px, py, pSize, 0, Math.PI * 2);
              ctx.fillStyle = '#ffffff';
              ctx.shadowBlur = 8;
              ctx.shadowColor = 'rgba(212, 175, 55, 0.9)';
              ctx.fill();
              ctx.shadowBlur = 0;
            }
          }
        }
      }
      
      // 4. Draw grid nodes
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const p = projectedGrid[r][c];
          const size = Math.max(1.5, p.scale * 3.2);
          const depthRatio = Math.max(0.1, 1 - (p.z + 550) / 1100);
          const opacity = 0.5 + depthRatio * 0.5;
          
          ctx.beginPath();
          ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(212, 175, 55, ${opacity})`;
          ctx.shadowBlur = p.scale * 8;
          ctx.shadowColor = 'rgba(212, 175, 55, 0.9)';
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }
      
      animationFrameId = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      if (canvas) {
        canvas.removeEventListener('mouseleave', handleMouseLeave);
      }
      cancelAnimationFrame(animationFrameId);
    };
  }, []);
  
  return <canvas ref={canvasRef} style={{ filter: 'drop-shadow(0 0 10px rgba(255, 215, 0, 0.45))' }} className="absolute inset-0 w-full h-full z-0 pointer-events-none opacity-95" />;
};

const ServicesWeOffer = () => {
  const servicesData = [
    {
      title: "Financial Consulting",
      desc: "Business financial planning, cash flow management, profitability analysis, and strategic decision-making support",
      path: "/financial-transformation"
    },
    {
      title: "Tax Advisory & Compliance",
      desc: "Tax planning, compliance management, tax optimization, and regulatory guidance",
      path: "/risk-compliance"
    },
    {
      title: "Investment Advisory",
      desc: "Portfolio analysis, investment planning, risk assessment, and wealth creation strategies",
      path: "/wealth-management"
    },
    {
      title: "Startup Consulting",
      desc: "Business planning, investor readiness, market strategy, and startup growth guidance",
      path: "/transaction-services"
    },
    {
      title: "Corporate Finance",
      desc: "Capital raising, financial restructuring, mergers support, and growth financing solutions",
      path: "/corporate-finance"
    },
    {
      title: "Business Valuation",
      desc: "Comprehensive business assessment, valuation reports, and investment readiness evaluation",
      path: "/valuation-advisory"
    }
  ];

  return (
    <section className="pt-20 pb-10 bg-black/20 text-white relative overflow-hidden">
      {/* Floating Card Animations in CSS (separated from JS mouse-tilt to prevent conflicts) */}
      <style>{`
        @keyframes card-float-a {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes card-float-b {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes card-float-c {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        .animate-card-a {
          animation: card-float-a 7s ease-in-out infinite;
        }
        .animate-card-b {
          animation: card-float-b 6s ease-in-out infinite;
        }
        .animate-card-c {
          animation: card-float-c 8s ease-in-out infinite;
        }
      `}</style>

      {/* Dynamic 3D Topological Waving Grid Background */}
      <CanvasBackground />

      {/* Ambient Gradient Blobs */}
      <div className="absolute top-[-200px] right-[-100px] w-[500px] h-[500px] bg-gradient-to-br from-[#D4AF37]/15 to-transparent rounded-full blur-[110px] pointer-events-none z-0 animate-pulse" />
      <div className="absolute bottom-[-200px] left-[-100px] w-[500px] h-[500px] bg-[#0A1230]/90 rounded-full blur-[130px] pointer-events-none z-0" />

      {/* Glowing grid mesh pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:40px_40px] opacity-25 z-0 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-white leading-tight">
            Services We Offer
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
          {servicesData.map((service, i) => {
            // Apply staggered bobbing wrappers based on column index
            const animClass = i % 3 === 0 ? 'animate-card-a' : i % 3 === 1 ? 'animate-card-b' : 'animate-card-c';
            
            return (
              <div key={i} className={`${animClass} h-full`}>
                <FloatingCard 
                  to={service.path} 
                  className="group flex flex-col justify-between p-8 bg-[#0c1a30]/85 border border-white/10 hover:border-[#D4AF37] rounded-3xl transition-all duration-300 min-h-[240px] shadow-lg hover:shadow-[#D4AF37]/10 relative overflow-hidden backdrop-blur-md hover:bg-[#0e223f]/95 h-full"
                >
                  <div>
                    <span className="text-xs font-mono text-[#D4AF37]/75 group-hover:text-[#D4AF37] transition-colors mb-4 block font-semibold">0{i+1}</span>
                    <h3 className="text-xl md:text-2xl font-bold text-white mb-4 group-hover:text-[#D4AF37] transition-colors duration-300">
                      {service.title}
                    </h3>
                    <p className="text-[15px] text-gray-300 leading-relaxed font-sans font-light">
                      {service.desc}
                    </p>
                  </div>
                  <div className="mt-6 flex items-center justify-start text-[#D4AF37]">
                    <ArrowRight className="w-5 h-5 transform group-hover:translate-x-1.5 transition-transform duration-300" />
                  </div>
                </FloatingCard>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ServicesWeOffer;
