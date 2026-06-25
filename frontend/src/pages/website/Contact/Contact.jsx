// src/pages/Contact.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Phone, Mail, MapPin, Clock } from 'lucide-react';
import LeadCaptureForm from '../../../components/LeadCaptureForm';

const ContactCanvasBackground = () => {
  const canvasRef = React.useRef(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const parent = canvas.parentElement;
    let width = (canvas.width = parent ? parent.clientWidth : window.innerWidth);
    let height = (canvas.height = parent ? parent.clientHeight : 800);

    const handleResize = () => {
      if (!canvas) return;
      const p = canvas.parentElement;
      width = canvas.width = p ? p.clientWidth : window.innerWidth;
      height = canvas.height = p ? p.clientHeight : 800;
    };
    window.addEventListener('resize', handleResize);

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

    // Create random floating data points
    const points = [];
    const pointCount = 18;
    for (let i = 0; i < pointCount; i++) {
      points.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
        radius: Math.random() * 1.2 + 0.6,
        color: `rgba(212, 175, 55, ${Math.random() * 0.2 + 0.15})`
      });
    }

    const animate = () => {
      const p = canvas.parentElement;
      const currentWidth = p ? p.clientWidth : window.innerWidth;
      const currentHeight = p ? p.clientHeight : 800;
      if (canvas.width !== currentWidth || canvas.height !== currentHeight) {
        width = canvas.width = currentWidth;
        height = canvas.height = currentHeight;
      }

      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = 'rgba(10, 25, 47, 0.02)';
      ctx.fillRect(0, 0, width, height);

      // Update and draw points
      points.forEach(pt => {
        pt.x += pt.vx;
        pt.y += pt.vy;

        if (pt.x < 0 || pt.x > width) pt.vx *= -1;
        if (pt.y < 0 || pt.y > height) pt.vy *= -1;

        // Mouse interact
        if (mouse.x !== null && mouse.y !== null) {
          const dx = pt.x - mouse.x;
          const dy = pt.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            const force = (150 - dist) / 150;
            pt.x += (dx / dist) * force * 0.8;
            pt.y += (dy / dist) * force * 0.8;
          }
        }

        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.radius, 0, Math.PI * 2);
        ctx.fillStyle = pt.color;
        ctx.fill();
      });

      // Draw intersecting bezier curves connecting points to create a "communication grid"
      for (let i = 0; i < points.length; i += 2) {
        const pt1 = points[i];
        const pt2 = points[(i + 1) % points.length];
        const pt3 = points[(i + 2) % points.length];

        if (pt1 && pt2 && pt3) {
          ctx.beginPath();
          ctx.moveTo(pt1.x, pt1.y);
          ctx.quadraticCurveTo(pt2.x, pt2.y, pt3.x, pt3.y);
          ctx.strokeStyle = 'rgba(212, 175, 55, 0.06)';
          ctx.lineWidth = 0.55;
          ctx.stroke();
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

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-0 pointer-events-none opacity-80" />;
};

const Contact = () => {
  const offices = [
    {
      city: "Chittagong, Bangladesh",
      address: "FinBridge Tower, Agrabad Commercial Area",
      phone: "+880 1719 765432",
      email: "contact@finbridge.com"
    }
  ];

  return (
    <div className="bg-[#0A192F] text-white relative overflow-hidden">
      {/* Curved communication grid background */}
      <ContactCanvasBackground />
      {/* Hero Section */}
      <section className="pt-32 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(at_top_right,#D4AF37_0%,transparent_60%)] opacity-10"></div>
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 bg-white/10 text-[#D4AF37] text-sm font-medium px-6 py-2 rounded-full mb-6 border border-[#D4AF37]/30">
              GET IN TOUCH
            </div>
            <h1 className="text-6xl md:text-7xl font-bold leading-tight tracking-tighter mb-8">
              Let's Build Your<br />
              <span className="text-[#D4AF37]">Financial Future</span>
            </h1>
            <p className="text-2xl text-gray-300 max-w-xl">
              Speak with our senior advisors. Every inquiry receives a response within 4 business hours.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 md:px-12 pb-24">
        <div className="grid lg:grid-cols-12 gap-12">
          {/* Get In Touch Redirect & Office Info */}
          <div className="lg:col-span-7">
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 md:p-12 flex flex-col justify-between h-full relative overflow-hidden group">
              <div className="absolute top-[-100px] right-[-100px] w-[300px] h-[300px] bg-accent/5 rounded-full blur-[80px] pointer-events-none" />
              <div className="relative z-10 space-y-8">
                <div>
                  <span className="text-[#D4AF37] text-xs font-mono tracking-[0.2em] font-semibold uppercase block mb-3">
                    Start Your Journey
                  </span>
                  <h2 className="text-4xl md:text-5xl font-semibold tracking-tight leading-tight text-white mb-6">
                    Get in Contact with Our Advisory Team
                  </h2>
                  <p className="text-gray-400 text-lg leading-relaxed font-light mb-8">
                    Register your organization today on the FinBridge B2B Portal. Gain access to dedicated consultants, customize advisory service requests, track proposals, and coordinate meetings securely in one place.
                  </p>
                </div>
                
                <div>
                  <Link
                    to="/b2b/register"
                    className="inline-flex items-center gap-4 bg-[#D4AF37] hover:bg-white text-[#0A192F] hover:text-[#0A192F] font-bold text-lg tracking-wider uppercase py-5 px-10 rounded-2xl transition-all duration-300 shadow-lg group cursor-pointer"
                  >
                    GET IN CONTACT
                    <ArrowRight className="w-5 h-5 transform group-hover:translate-x-1.5 transition-transform" />
                  </Link>
                </div>
              </div>

              <div className="border-t border-white/10 mt-12 pt-8 relative z-10">
                <div className="flex flex-col md:flex-row gap-6 justify-between text-sm text-gray-400">
                  <div>
                    <div className="text-white font-semibold text-base mb-1">Corporate Headquarters</div>
                    <div className="font-light">FinBridge Tower, Agrabad Commercial Area</div>
                    <div className="font-light">Chittagong, Bangladesh</div>
                  </div>
                  <div className="flex flex-col gap-1 justify-end md:items-end">
                    <div className="text-white font-semibold">Contact Info</div>
                    <a href="tel:+8801719765432" className="hover:text-[#D4AF37] transition-colors">+880 1719 765432</a>
                    <a href="mailto:contact@finbridge.com" className="hover:text-[#D4AF37] transition-colors">contact@finbridge.com</a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="lg:col-span-5 space-y-10">
            <div>
              <h3 className="text-2xl font-semibold mb-8 flex items-center gap-3">
                <Mail className="text-[#D4AF37]" /> Get In Touch
              </h3>
              <div className="space-y-6">
                <a href="mailto:contact@finbridge.com" className="block group">
                  <div className="flex items-center gap-4 text-lg">
                    <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center group-hover:bg-[#D4AF37] group-hover:text-[#0A192F] transition-all">
                      ✉️
                    </div>
                    <div>
                      <div className="text-gray-400 text-sm">Primary Email</div>
                      <div className="text-white group-hover:text-[#D4AF37] transition-colors">contact@finbridge.com</div>
                    </div>
                  </div>
                </a>

                <a href="tel:+8801719765432" className="block group">
                  <div className="flex items-center gap-4 text-lg">
                    <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center group-hover:bg-[#D4AF37] group-hover:text-[#0A192F] transition-all">
                      📞
                    </div>
                    <div>
                      <div className="text-gray-400 text-sm">Helpline</div>
                      <div className="text-white group-hover:text-[#D4AF37] transition-colors">+880 1719 765432</div>
                    </div>
                  </div>
                </a>
              </div>
            </div>

            {/* Global Offices */}
            <div>
              <h3 className="text-2xl font-semibold mb-8 flex items-center gap-3">
                <MapPin className="text-[#D4AF37]" /> Our Offices
              </h3>
              <div className="space-y-8">
                {offices.map((office, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border-l-4 border-[#D4AF37] pl-6 space-y-4"
                  >
                    <div className="font-semibold text-xl text-white">{office.city}</div>
                    
                    <div className="space-y-3 text-sm">
                      <div className="flex items-start gap-3 text-gray-400">
                        <MapPin className="w-4 h-4 text-[#D4AF37]/80 shrink-0 mt-0.5" />
                        <span>{office.address}</span>
                      </div>
                      
                      <a 
                        href={`tel:${office.phone}`} 
                        className="flex items-center gap-3 text-gray-300 hover:text-[#D4AF37] transition-colors"
                      >
                        <Phone className="w-4 h-4 text-[#D4AF37]/80 shrink-0" />
                        <span>{office.phone}</span>
                      </a>
                      
                      <a 
                        href={`mailto:${office.email}`} 
                        className="flex items-center gap-3 text-gray-300 hover:text-[#D4AF37] transition-colors"
                      >
                        <Mail className="w-4 h-4 text-[#D4AF37]/80 shrink-0" />
                        <span>{office.email}</span>
                      </a>
                    </div>

                    {/* Office Map */}
                    <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 hover:border-[#D4AF37]/30 transition-all duration-300 shadow-md">
                      <iframe 
                        title="Office Map"
                        src="https://maps.google.com/maps?q=Chittagong,%20Bangladesh&t=&z=14&ie=UTF8&iwloc=&output=embed" 
                        className="w-full h-44 border-0 filter grayscale-[0.6] contrast-[1.15] hover:grayscale-0 transition-all duration-500"
                        allowFullScreen="" 
                        loading="lazy"
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="pt-8 border-t border-white/10">
              {/* <div className="flex items-center gap-3 text-sm text-gray-400">
                <Clock className="w-5 h-5" />
                <span>Response within 4 business hours</span>
              </div> */}
            </div>
          </div>
        </div>
      </div>

      {/* CTA Footer */}
      <section className="py-20 bg-black/60 border-t border-white/10">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-4xl font-semibold mb-6">Not sure where to start?</h2>
          <p className="text-gray-400 text-lg mb-10">Our Client Success team will match you with the right expert based on your industry and objectives.</p>
          <Link
            to="/"
            className="inline-flex items-center gap-4 border border-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#0A192F] text-[#D4AF37] px-10 py-4 rounded-2xl font-medium transition-all"
          >
            Return to Homepage
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Contact;