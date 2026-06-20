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
    
    // Max 8 degrees of rotation
    const rotateX = ((centerY - y) / centerY) * 8;
    const rotateY = ((x - centerX) / centerX) * 8;
    
    setTransformStyle(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02) translateY(-4px)`);
    // Dynamic shadow based on movement
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
    
    // 3D Sphere particles setup - reduced points for elegance
    const spherePoints = [];
    const pointCount = 75; 
    
    // Generate spherical point vectors
    for (let i = 0; i < pointCount; i++) {
      const theta = Math.acos(1 - 2 * (i + 0.5) / pointCount);
      const phi = Math.PI * (1 + Math.sqrt(5)) * i;
      
      const x = Math.sin(theta) * Math.cos(phi);
      const y = Math.sin(theta) * Math.sin(phi);
      const z = Math.cos(theta);
      
      spherePoints.push({ x, y, z });
    }
    
    // Drifting particles (stars/dust) setup - reduced count
    const particles = [];
    const particleCount = 35;
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2.0 + 0.6, 
        speedX: (Math.random() - 0.5) * 0.3,
        speedY: (Math.random() - 0.5) * 0.3,
        color: `rgba(255, 215, 0, ${Math.random() * 0.3 + 0.15})`
      });
    }
    
    let angleX = 0.0016; 
    let angleY = 0.0022;
    
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
    
    const animate = () => {
      // Robust client size sync on every frame to prevent stretching
      const p = canvas.parentElement;
      const currentWidth = p ? p.clientWidth : window.innerWidth;
      const currentHeight = p ? p.clientHeight : 500;
      if (canvas.width !== currentWidth || canvas.height !== currentHeight) {
        width = canvas.width = currentWidth;
        height = canvas.height = currentHeight;
      }

      ctx.clearRect(0, 0, width, height);
      
      // Draw background ambient dark overlay
      ctx.fillStyle = 'rgba(10, 25, 47, 0.02)';
      ctx.fillRect(0, 0, width, height);
      
      // 1. Draw drifting dust particles
      particles.forEach(p => {
        p.x += p.speedX;
        p.y += p.speedY;
        
        if (p.x < 0 || p.x > width) p.speedX *= -1;
        if (p.y < 0 || p.y > height) p.speedY *= -1;
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      });
      
      // 2. Rotate and project 3D sphere points
      let currentAngleX = angleX;
      let currentAngleY = angleY;
      
      if (mouse.x !== null && mouse.y !== null) {
        currentAngleX += (mouse.y - height / 2) * 0.000010; 
        currentAngleY += (mouse.x - width / 2) * 0.000010;
      }
      
      const projected = [];
      const dynamicRadius = Math.min(width, height) * 0.35; 
      
      spherePoints.forEach(p => {
        // Rotate Y
        let x1 = p.x * Math.cos(currentAngleY) - p.z * Math.sin(currentAngleY);
        let z1 = p.x * Math.sin(currentAngleY) + p.z * Math.cos(currentAngleY);
        // Rotate X
        let y2 = p.y * Math.cos(currentAngleX) - z1 * Math.sin(currentAngleX);
        let z2 = p.y * Math.sin(currentAngleX) + z1 * Math.cos(currentAngleX);
        
        // Save back for rotation persistence
        p.x = x1;
        p.y = y2;
        p.z = z2;
        
        // Scale vectors by radius
        const scaleX = x1 * dynamicRadius;
        const scaleY = y2 * dynamicRadius;
        const scaleZ = z2 * dynamicRadius;
        
        // Perspective calculation
        const fov = 400;
        const scale = fov / (fov + scaleZ);
        // Position sphere center relative to screen size (shift further right to avoid text overlap)
        const centerX = width > 768 ? width * 0.78 : width * 0.5; 
        const centerY = height * 0.5;
        
        const projX = (scaleX * scale) + centerX;
        const projY = (scaleY * scale) + centerY;
        
        projected.push({ x: projX, y: projY, z: scaleZ, scale });
      });
      
      // 3. Connect close projected points (Wireframe sphere connection lines) - softer and thinner
      const maxConnectDist = width > 768 ? 82 : 60; 
      for (let i = 0; i < projected.length; i++) {
        for (let j = i + 1; j < projected.length; j++) {
          const dx = projected[i].x - projected[j].x;
          const dy = projected[i].y - projected[j].y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          
          if (dist < maxConnectDist) {
            const depthVal = (projected[i].z + projected[j].z + 2 * dynamicRadius) / (4 * dynamicRadius); 
            const opacity = (1 - dist / maxConnectDist) * 0.20 * (0.2 + depthVal * 0.8); 
            
            ctx.strokeStyle = `rgba(255, 215, 0, ${opacity})`; 
            ctx.lineWidth = 0.45 * ((projected[i].scale + projected[j].scale) / 2); 
            ctx.beginPath();
            ctx.moveTo(projected[i].x, projected[i].y);
            ctx.lineTo(projected[j].x, projected[j].y);
            ctx.stroke();
          }
        }
      }
      
      // 4. Draw sphere nodes - smaller and softer
      projected.forEach(p => {
        const size = Math.max(0.8, p.scale * 1.8); 
        const depthVal = (p.z + dynamicRadius) / (2 * dynamicRadius); 
        const opacity = 0.18 + depthVal * 0.45; 
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 215, 0, ${opacity})`; 
        ctx.shadowBlur = p.scale * 3.5; 
        ctx.shadowColor = 'rgba(255, 215, 0, 0.8)';
        ctx.fill();
        ctx.shadowBlur = 0;
      });
      
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
  
  return <canvas ref={canvasRef} style={{ filter: 'drop-shadow(0 0 8px rgba(255, 215, 0, 0.25))' }} className="absolute inset-0 w-full h-full z-0 pointer-events-none opacity-95" />;
};

const ThreeWays = () => {
  return (
    <section className="py-20 bg-[#0A192F] text-white relative overflow-hidden">
      {/* Floating Card Animations in CSS (separated from JS mouse-tilt to prevent conflicts) */}
      <style>{`
        @keyframes card-float-1 {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-7px); }
        }
        @keyframes card-float-2 {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes card-float-3 {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .animate-card-1 {
          animation: card-float-1 6s ease-in-out infinite;
        }
        .animate-card-2 {
          animation: card-float-2 7s ease-in-out infinite;
        }
        .animate-card-3 {
          animation: card-float-3 5s ease-in-out infinite;
        }
      `}</style>

      {/* Dynamic 3D Constellation Sphere & Particle Background */}
      <CanvasBackground />

      {/* Background Animated Gradient Blobs */}
      <div className="absolute top-[-100px] left-[-100px] w-[450px] h-[450px] bg-gradient-to-tr from-[#D4AF37]/18 to-transparent rounded-full blur-[90px] pointer-events-none z-0 animate-pulse" />
      <div className="absolute bottom-[-150px] right-[-100px] w-[550px] h-[550px] bg-[#0A1230]/90 rounded-full blur-[130px] pointer-events-none z-0" />
      
      {/* Glowing grid mesh pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.012)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:40px_40px] opacity-35 z-0 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        
        {/* Header */}
        <div className="max-w-5xl mb-10">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-white leading-tight mb-3">
            Three Ways To Transform Your Financial Future
          </h2>
          <p className="text-sm md:text-base text-gray-400 leading-relaxed font-sans font-light max-w-3xl">
            Strategic consulting, intelligent financial planning, and growth-focused solutions that help businesses scale with confidence
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
          
          {/* Card 1 */}
          <div className="animate-card-1 h-full">
            <FloatingCard 
              to="/financial-transformation" 
              className="group flex flex-col justify-between p-6 bg-[#0c1a30]/85 border border-white/10 hover:border-white/20 rounded-2xl transition-all duration-300 min-h-[180px] shadow-sm hover:shadow-md hover:bg-[#0e223f]/90 backdrop-blur-md h-full"
            >
              <div>
                <h3 className="text-xl font-bold text-white mb-3 transition-colors duration-300 group-hover:text-[#D4AF37]">
                  Strengthen Your Financial Foundation
                </h3>
                <p className="text-[15px] text-gray-300 leading-relaxed font-sans font-light line-clamp-2">
                  Improve profitability through financial planning and cash-flow optimization
                </p>
              </div>
              <div className="mt-4 flex items-center justify-start text-[#D4AF37] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" />
              </div>
            </FloatingCard>
          </div>
 
          {/* Card 2 (Featured Card) */}
          <div className="animate-card-2 h-full">
            <FloatingCard 
              to="/transaction-services" 
              className="group flex flex-col justify-between p-6 bg-[#112540]/90 border border-[#D4AF37]/35 hover:border-[#D4AF37] rounded-2xl transition-all duration-300 min-h-[180px] shadow-lg shadow-[#D4AF37]/2 hover:shadow-[#D4AF37]/10 relative overflow-hidden backdrop-blur-md hover:bg-[#163052]/95 h-full"
            >
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#D4AF37]/40 to-transparent" />
              
              <div>
                <h3 className="text-xl font-bold text-[#D4AF37] mb-3 transition-colors duration-300">
                  Accelerate Business Growth
                </h3>
                <p className="text-[15px] text-gray-200 leading-relaxed font-sans font-light line-clamp-2">
                  Scale confidently with business consulting and growth strategies
                </p>
              </div>
              
              <div className="mt-4 flex items-center justify-start text-[#D4AF37]">
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" />
              </div>
            </FloatingCard>
          </div>
 
          {/* Card 3 */}
          <div className="animate-card-3 h-full">
            <FloatingCard 
              to="/corporate-finance" 
              className="group flex flex-col justify-between p-6 bg-[#0c1a30]/85 border border-white/10 hover:border-white/20 rounded-2xl transition-all duration-300 min-h-[180px] shadow-sm hover:shadow-md hover:bg-[#0e223f]/90 backdrop-blur-md h-full"
            >
              <div>
                <h3 className="text-xl font-bold text-white mb-3 transition-colors duration-300 group-hover:text-[#D4AF37]">
                  Unlock Funding & Investment Opportunities
                </h3>
                <p className="text-[15px] text-gray-300 leading-relaxed font-sans font-light line-clamp-2">
                  Connect growth ambitions with funding and investment solutions
                </p>
              </div>
              <div className="mt-4 flex items-center justify-start text-[#D4AF37] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" />
              </div>
            </FloatingCard>
          </div>

        </div>
      </div>
    </section>
  );
};

export default ThreeWays;
