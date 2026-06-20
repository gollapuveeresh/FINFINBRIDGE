// src/components/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const FooterCanvasBackground = () => {
  const canvasRef = React.useRef(null);
  
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    
    const parent = canvas.parentElement;
    let width = (canvas.width = parent ? parent.clientWidth : window.innerWidth);
    let height = (canvas.height = parent ? parent.clientHeight : 400);
    
    const handleResize = () => {
      if (!canvas) return;
      const p = canvas.parentElement;
      width = canvas.width = p ? p.clientWidth : window.innerWidth;
      height = canvas.height = p ? p.clientHeight : 400;
    };
    window.addEventListener('resize', handleResize);
    
    // Create slow drifting stars
    const particles = [];
    const particleCount = 30;
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.5 + 0.6,
        vx: (Math.random() - 0.5) * 0.1,
        vy: (Math.random() - 0.5) * 0.1,
        alpha: Math.random() * 0.4 + 0.1,
        alphaSpeed: Math.random() * 0.005 + 0.002
      });
    }
    
    const animate = () => {
      const p = canvas.parentElement;
      const currentWidth = p ? p.clientWidth : window.innerWidth;
      const currentHeight = p ? p.clientHeight : 400;
      if (canvas.width !== currentWidth || canvas.height !== currentHeight) {
        width = canvas.width = currentWidth;
        height = canvas.height = currentHeight;
      }
      
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = 'rgba(10, 25, 47, 0.01)';
      ctx.fillRect(0, 0, width, height);
      
      // Update and draw stars
      particles.forEach(pt => {
        pt.x += pt.vx;
        pt.y += pt.vy;
        
        if (pt.x < 0 || pt.x > width) pt.vx *= -1;
        if (pt.y < 0 || pt.y > height) pt.vy *= -1;
        
        // Pulse alpha
        pt.alpha += pt.alphaSpeed;
        if (pt.alpha > 0.65 || pt.alpha < 0.1) {
          pt.alphaSpeed *= -1;
        }
        
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(212, 175, 55, ${pt.alpha})`;
        ctx.fill();
      });
      
      // Draw very soft slow waving horizontal lines at the bottom of the footer
      const time = Date.now() * 0.0006;
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.04)';
      ctx.lineWidth = 1.0;
      for (let x = 0; x < width; x += 10) {
        const y = Math.sin(x * 0.0025 + time) * 12 + height - 25;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      
      animationFrameId = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);
  
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-0 pointer-events-none opacity-80" />;
};

const Footer = () => {
  return (
    <footer className="bg-[#0A192F] border-t border-white/10 pt-20 pb-12 relative overflow-hidden">
      {/* Subtle animated background */}
      <FooterCanvasBackground />
      
      {/* Ambient bottom-left gold glow */}
      <div className="absolute bottom-[-100px] left-[-100px] w-[300px] h-[300px] bg-[#D4AF37]/5 rounded-full blur-[80px] pointer-events-none z-0" />
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid md:grid-cols-12 gap-y-16">
          {/* Brand */}
          <div className="md:col-span-5">
            <div className="text-3xl font-bold tracking-tighter text-white mb-6">FINBRIDGE</div>
            <p className="text-gray-400 max-w-md text-lg leading-relaxed">
              Smart Finance. Strong Future. Empowering startups, SMEs, and enterprises through strategic consulting, taxation planning, funding assistance, and investment advisory.
            </p>
            
            <div className="mt-10 flex items-center gap-6">
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">LinkedIn</a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">Twitter</a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">Instagram</a>
            </div>
          </div>

          {/* Services */}
          <div className="md:col-span-2">
            <div className="uppercase text-xs tracking-widest text-[#D4AF37] mb-8">SERVICES</div>
            <div className="space-y-4 text-sm">
              <Link to="/valuation-advisory" className="block text-gray-300 hover:text-white transition-colors">Valuation Advisory</Link>
              <Link to="/transaction-services" className="block text-gray-300 hover:text-white transition-colors">Transaction Services</Link>
              <Link to="/risk-compliance" className="block text-gray-300 hover:text-white transition-colors">Risk & Compliance</Link>
              <Link to="/financial-transformation" className="block text-gray-300 hover:text-white transition-colors">Financial Improvement</Link>
              <Link to="/wealth-management" className="block text-gray-300 hover:text-white transition-colors">Wealth Management</Link>
            </div>
          </div>

          {/* Solutions */}
          <div className="md:col-span-2">
            <div className="uppercase text-xs tracking-widest text-[#D4AF37] mb-8">SOLUTIONS</div>
            <div className="space-y-4 text-sm">
              <Link to="/corporate-finance" className="block text-gray-300 hover:text-white transition-colors">Corporate Finance</Link>
              <Link to="/market-intelligence" className="block text-gray-300 hover:text-white transition-colors">Market Intelligence</Link>
              <Link to="/digital-finance" className="block text-gray-300 hover:text-white transition-colors">Digital Finance</Link>
              <Link to="/about" className="block text-gray-300 hover:text-white transition-colors">About Us</Link>
            </div>
          </div>

          {/* Contact */}
          <div className="md:col-span-3">
            <div className="uppercase text-xs tracking-widest text-[#D4AF37] mb-8">CONTACT</div>
            
            <div className="space-y-6">
              <div>
                <div className="text-white font-medium">Headquarters</div>
                <div className="text-gray-400 text-sm mt-1">FinBridge Tower, Agrabad Commercial Area, Chittagong, Bangladesh</div>
              </div>

              <a href="mailto:contact@finbridge.com" className="block text-[#D4AF37] hover:underline">contact@finbridge.com</a>
              <a href="tel:+8801719765432" className="block text-[#D4AF37] hover:underline">+880 1719 765432</a>
            </div>

            <Link 
              to="/contact"
              className="mt-12 inline-flex items-center gap-3 group text-sm font-medium border border-[#D4AF37]/70 hover:border-[#D4AF37] px-8 py-4 rounded-2xl transition-all"
            >
              SCHEDULE A CONSULTATION
              <ArrowRight className="group-hover:translate-x-1 transition" />
            </Link>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-20 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-gray-500">
          <div>© 2026 FinBridge Solutions. All Rights Reserved.</div>
          <div className="flex gap-8">
            <Link to="/privacy-policy" className="hover:text-gray-300 transition-colors">Privacy Policy</Link>
            <Link to="/terms-of-service" className="hover:text-gray-300 transition-colors">Terms of Service</Link>
            <Link to="/regulatory-disclosures" className="hover:text-gray-300 transition-colors">Regulatory Disclosures</Link>
          </div>
          <div>Built for Professional Standards</div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;