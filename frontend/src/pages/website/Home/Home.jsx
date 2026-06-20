// src/pages/Home.jsx
import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Award, Users, TrendingUp, Play, Pause, X, PieChart, Target, Briefcase, Phone, Mail, MapPin, Clock } from 'lucide-react';
import AnimatedCounter from '../../../components/AnimatedCounter';
import Timeline from '../../../components/Timeline';
import CaseStudyCard from '../../../components/CaseStudyCard';
import ThreeWays from '../Services/ThreeWays';
import ServicesWeOffer from '../Services/ServicesWeOffer';
import LeadCaptureForm from '../../../components/LeadCaptureForm';
const departmentsData = [
  { 
    icon: '📋', 
    color: '#f59e0b', 
    glowColor: 'rgba(245, 158, 11, 0.15)',
    lightColor: 'rgba(245, 158, 11, 0.08)',
    label: 'Tax Management', 
    items: ['ITR Filing', 'GST Returns', 'Tax Planning', 'Tax Saving Advisory', 'Business Tax'] 
  },
  { 
    icon: '📈', 
    color: '#8b5cf6', 
    glowColor: 'rgba(139, 92, 246, 0.15)',
    lightColor: 'rgba(139, 92, 246, 0.08)',
    label: 'Investment Management', 
    items: ['Mutual Funds', 'SIP Planning', 'Equity & Stocks', 'Portfolio Management', 'Retirement Planning'] 
  },
  { 
    icon: '🏦', 
    color: '#3b82f6', 
    glowColor: 'rgba(59, 130, 246, 0.15)',
    lightColor: 'rgba(59, 130, 246, 0.08)',
    label: 'Loan Management', 
    items: ['Home Loans', 'Personal Loans', 'Business Loans', 'Vehicle Loans', 'Eligibility Check'] 
  },
  { 
    icon: '💎', 
    color: '#f43f5e', 
    glowColor: 'rgba(244, 63, 94, 0.15)',
    lightColor: 'rgba(244, 63, 94, 0.08)',
    label: 'Wealth Management', 
    items: ['Goal-Based Planning', 'Estate Planning', 'HNI Advisory', 'Asset Allocation', 'Quarterly Reviews'] 
  },
];

const DepartmentCard = ({ dept, i }) => {
  const cardRef = React.useRef(null);
  const [transformStyle, setTransformStyle] = React.useState('');
  const [shadowStyle, setShadowStyle] = React.useState('');
  const [mousePos, setMousePos] = React.useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setMousePos({ x, y });
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = ((centerY - y) / centerY) * 8;
    const rotateY = ((x - centerX) / centerX) * 8;
    
    setTransformStyle(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02) translateY(-6px)`);
    setShadowStyle(`${-rotateY * 1.5}px ${rotateX * 1.5}px 25px ${dept.glowColor}`);
  };

  const handleMouseLeave = () => {
    setTransformStyle('');
    setShadowStyle('');
  };

  return (
    <div className="h-full">
      <Link 
        to="/client/login" 
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
        className="group relative flex flex-col justify-between p-5 md:p-6 bg-[#0c1a30]/85 border border-white/10 hover:border-[#D4AF37]/45 rounded-2xl min-h-[250px] shadow-lg backdrop-blur-md hover:bg-[#0e223f]/95 overflow-hidden h-full text-left"
      >
        {/* Radial Hover Spotlight Glow */}
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{
            background: `radial-gradient(350px circle at var(--mouse-x) var(--mouse-y), ${dept.lightColor}, transparent 60%)`
          }}
        />

        {/* Top Border Highlight Glow */}
        <div 
          className="absolute top-0 left-0 w-full h-[2px] transition-all duration-300 opacity-30 group-hover:opacity-100"
          style={{
            background: `linear-gradient(90deg, transparent, ${dept.color}, transparent)`
          }}
        />

        <div>
          {/* Pulsing Icon Wrapper */}
          <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-xl mb-4 group-hover:scale-110 group-hover:border-[#D4AF37]/30 group-hover:bg-[#D4AF37]/10 transition-all duration-300 relative shadow-sm">
            <span className="relative z-10">{dept.icon}</span>
            <div className="absolute inset-0 rounded-xl bg-[#D4AF37]/20 blur-md opacity-0 group-hover:opacity-40 transition-opacity duration-300" />
          </div>

          <h3 className="text-lg md:text-xl font-bold text-white mb-3 group-hover:text-[#D4AF37] transition-colors duration-300">
            {dept.label}
          </h3>

          <ul className="space-y-1.5">
            {dept.items.map((item, idx) => (
              <li 
                key={idx} 
                className="flex items-center gap-2 text-sm text-gray-300 group-hover:text-white transition-colors duration-200"
              >
                <div 
                  className="w-1.5 h-1.5 rounded-full shrink-0 group-hover:scale-125 transition-transform duration-300" 
                  style={{ 
                    background: dept.color,
                    boxShadow: `0 0 6px ${dept.color}`
                  }} 
                />
                <span className="group-hover:text-gray-200 transition-colors duration-200">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-between text-gray-500 group-hover:text-[#D4AF37] transition-colors">
          <span className="text-xs font-semibold tracking-wider uppercase">
            Get Started
          </span>
          <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1.5 transition-transform duration-300" />
        </div>
      </Link>
    </div>
  );
};

const DeptCanvasBackground = () => {
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
    
    // Geometry generator helper
    const getShapeData = (type) => {
      if (type === 'octahedron') {
        return {
          vertices: [
            {x: 0, y: 1.2, z: 0}, {x: 0, y: -1.2, z: 0},
            {x: 1, y: 0, z: 0}, {x: -1, y: 0, z: 0},
            {x: 0, y: 0, z: 1}, {x: 0, y: 0, z: -1}
          ],
          edges: [
            [0, 2], [0, 3], [0, 4], [0, 5],
            [1, 2], [1, 3], [1, 4], [1, 5],
            [2, 4], [4, 3], [3, 5], [5, 2]
          ],
          faces: [
            [0, 2, 4], [0, 4, 3], [0, 3, 5], [0, 5, 2],
            [1, 2, 4], [1, 4, 3], [1, 3, 5], [1, 5, 2]
          ]
        };
      } else if (type === 'cube') {
        return {
          vertices: [
            {x: -0.8, y: -0.8, z: -0.8}, {x: 0.8, y: -0.8, z: -0.8}, {x: 0.8, y: 0.8, z: -0.8}, {x: -0.8, y: 0.8, z: -0.8},
            {x: -0.8, y: -0.8, z: 0.8}, {x: 0.8, y: -0.8, z: 0.8}, {x: 0.8, y: 0.8, z: 0.8}, {x: -0.8, y: 0.8, z: 0.8}
          ],
          edges: [
            [0, 1], [1, 2], [2, 3], [3, 0],
            [4, 5], [5, 6], [6, 7], [7, 4],
            [0, 4], [1, 5], [2, 6], [3, 7]
          ],
          faces: [
            [0, 1, 2, 3], [4, 5, 6, 7], [0, 1, 5, 4],
            [2, 3, 7, 6], [0, 3, 7, 4], [1, 2, 6, 5]
          ]
        };
      } else {
        // Tetrahedron
        return {
          vertices: [
            {x: 1, y: 1, z: 1}, {x: -1, y: -1, z: 1},
            {x: -1, y: 1, z: -1}, {x: 1, y: -1, z: -1}
          ],
          edges: [
            [0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]
          ],
          faces: [
            [0, 1, 2], [0, 1, 3], [0, 2, 3], [1, 2, 3]
          ]
        };
      }
    };
    
    // Create floating shapes
    const shapes = [];
    const shapeCount = 7;
    
    const colors = [
      'rgba(245, 158, 11, 0.35)',  // Orange (Tax)
      'rgba(139, 92, 246, 0.35)', // Purple (Investments)
      'rgba(59, 130, 246, 0.35)',  // Blue (Loans)
      'rgba(244, 63, 94, 0.35)',   // Red/Pink (Wealth)
      'rgba(212, 175, 55, 0.35)',  // Gold
      'rgba(212, 175, 55, 0.25)',  // Gold
    ];
    
    const faceColors = [
      'rgba(245, 158, 11, 0.015)',
      'rgba(139, 92, 246, 0.015)',
      'rgba(59, 130, 246, 0.015)',
      'rgba(244, 63, 94, 0.015)',
      'rgba(212, 175, 55, 0.01)',
      'rgba(212, 175, 55, 0.01)',
    ];
    
    const shapeTypes = ['octahedron', 'cube', 'tetrahedron'];
    
    for (let i = 0; i < shapeCount; i++) {
      const type = shapeTypes[i % shapeTypes.length];
      shapes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        z: (Math.random() - 0.5) * 400, // Depth
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        vz: (Math.random() - 0.5) * 0.25,
        rotX: Math.random() * Math.PI * 2,
        rotY: Math.random() * Math.PI * 2,
        rotZ: Math.random() * Math.PI * 2,
        vRotX: (Math.random() - 0.5) * 0.008 + 0.003,
        vRotY: (Math.random() - 0.5) * 0.008 + 0.003,
        vRotZ: (Math.random() - 0.5) * 0.008 + 0.003,
        size: Math.random() * 15 + 20,
        color: colors[i % colors.length],
        faceColor: faceColors[i % faceColors.length],
        data: getShapeData(type)
      });
    }
    
    // Drifting particles (stars/dust) setup
    const particles = [];
    const particleCount = 25;
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 1.6 + 0.6,
        speedX: (Math.random() - 0.5) * 0.25,
        speedY: (Math.random() - 0.5) * 0.25,
        color: `rgba(212, 175, 55, ${Math.random() * 0.3 + 0.1})`
      });
    }
    
    // 3D rotation functions
    const rotateX = (v, angle) => {
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      return { x: v.x, y: v.y * cos - v.z * sin, z: v.y * sin + v.z * cos };
    };
    
    const rotateY = (v, angle) => {
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      return { x: v.x * cos - v.z * sin, y: v.y, z: v.x * sin + v.z * cos };
    };
    
    const rotateZ = (v, angle) => {
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      return { x: v.x * cos - v.y * sin, y: v.x * sin + v.y * cos, z: v.z };
    };
    
    const fov = 650;
    
    const animate = () => {
      // Auto-resizing check to prevent rendering mismatch
      const p = canvas.parentElement;
      const currentWidth = p ? p.clientWidth : window.innerWidth;
      const currentHeight = p ? p.clientHeight : 500;
      if (canvas.width !== currentWidth || canvas.height !== currentHeight) {
        width = canvas.width = currentWidth;
        height = canvas.height = currentHeight;
      }
      
      ctx.clearRect(0, 0, width, height);
      
      ctx.fillStyle = 'rgba(10, 25, 47, 0.02)';
      ctx.fillRect(0, 0, width, height);
      
      // 1. Draw background particles
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
      
      // 2. Sort shapes by depth (Painter's algorithm)
      shapes.sort((a, b) => b.z - a.z);
      
      shapes.forEach(shape => {
        // Move shape in 3D
        shape.x += shape.vx;
        shape.y += shape.vy;
        shape.z += shape.vz;
        
        // Bounce off bounds
        const boundaryOffset = 80;
        if (shape.x < -boundaryOffset) { shape.x = width + boundaryOffset; }
        if (shape.x > width + boundaryOffset) { shape.x = -boundaryOffset; }
        if (shape.y < -boundaryOffset) { shape.y = height + boundaryOffset; }
        if (shape.y > height + boundaryOffset) { shape.y = -boundaryOffset; }
        if (shape.z < -250 || shape.z > 250) { shape.vz *= -1; }
        
        // Base rotation speed
        let currentRotSpeedX = shape.vRotX;
        let currentRotSpeedY = shape.vRotY;
        let scaleMultiplier = 1;
        
        // Mouse interaction: attract shapes and spin them if mouse is close
        if (mouse.x !== null && mouse.y !== null) {
          const dx = shape.x - mouse.x;
          const dy = shape.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 300) {
            const factor = 1 - dist / 300;
            currentRotSpeedX += factor * 0.03;
            currentRotSpeedY += factor * 0.03;
            shape.x -= (dx / dist) * factor * 1.5;
            shape.y -= (dy / dist) * factor * 1.5;
            scaleMultiplier += factor * 0.15;
          }
        }
        
        // Update rotation angles
        shape.rotX += currentRotSpeedX;
        shape.rotY += currentRotSpeedY;
        shape.rotZ += shape.vRotZ;
        
        const size = shape.size * scaleMultiplier;
        
        // Rotate and project all vertices
        const projectedVertices = [];
        shape.data.vertices.forEach(v => {
          let rv = rotateX(v, shape.rotX);
          rv = rotateY(rv, shape.rotY);
          rv = rotateZ(rv, shape.rotZ);
          
          const finalX = rv.x * size + shape.x;
          const finalY = rv.y * size + shape.y;
          const finalZ = rv.z * size + shape.z;
          
          const scale = fov / (fov + finalZ);
          const projX = finalX * scale;
          const projY = finalY * scale;
          
          projectedVertices.push({ x: projX, y: projY, z: finalZ, scale });
        });
        
        // Depth-dependent styles
        const depthRatio = Math.max(0.1, 1 - (shape.z + 250) / 500);
        const opacity = (0.15 + depthRatio * 0.4);
        
        // Draw Faces (Filled polygons)
        if (shape.data.faces) {
          ctx.fillStyle = shape.faceColor;
          shape.data.faces.forEach(face => {
            ctx.beginPath();
            ctx.moveTo(projectedVertices[face[0]].x, projectedVertices[face[0]].y);
            for (let k = 1; k < face.length; k++) {
              ctx.lineTo(projectedVertices[face[k]].x, projectedVertices[face[k]].y);
            }
            ctx.closePath();
            ctx.fill();
          });
        }
        
        // Draw Edges (Wireframe)
        ctx.strokeStyle = shape.color.replace('0.35', (0.35 * opacity).toFixed(2));
        ctx.lineWidth = 0.55 * ((projectedVertices[0]?.scale || 1) + (projectedVertices[1]?.scale || 1)) / 2;
        shape.data.edges.forEach(edge => {
          const p1 = projectedVertices[edge[0]];
          const p2 = projectedVertices[edge[1]];
          if (p1 && p2) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        });
        
        // Draw Vertices (Glow nodes)
        projectedVertices.forEach(p => {
          ctx.beginPath();
          ctx.arc(p.x, p.y, Math.max(0.6, p.scale * 1.3), 0, Math.PI * 2);
          ctx.fillStyle = shape.color.replace('0.35', (0.65 * opacity).toFixed(2));
          ctx.shadowBlur = p.scale * 2.5;
          ctx.shadowColor = shape.color;
          ctx.fill();
          ctx.shadowBlur = 0;
        });
      });
      
      // Draw dynamic web lines connecting shapes that are close
      for (let i = 0; i < shapes.length; i++) {
        for (let j = i + 1; j < shapes.length; j++) {
          const dx = shapes[i].x - shapes[j].x;
          const dy = shapes[i].y - shapes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxConnectDist = 240;
          
          if (dist < maxConnectDist) {
            const opacity = (1 - dist / maxConnectDist) * 0.22;
            ctx.strokeStyle = `rgba(212, 175, 55, ${opacity})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(shapes[i].x, shapes[i].y);
            ctx.lineTo(shapes[j].x, shapes[j].y);
            ctx.stroke();
          }
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
  
  return <canvas ref={canvasRef} style={{ filter: 'drop-shadow(0 0 10px rgba(212, 175, 55, 0.15))' }} className="absolute inset-0 w-full h-full z-0 pointer-events-none opacity-85" />;
};

const WhyFinBridgeCanvas = () => {
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
    
    // Setup flowing particles
    const particles = [];
    const particleCount = 40;
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2.0 + 0.6,
        speedX: (Math.random() - 0.5) * 0.3,
        speedY: (Math.random() - 0.5) * 0.3,
        color: `rgba(212, 175, 55, ${Math.random() * 0.25 + 0.1})`
      });
    }
    
    const animate = () => {
      const p = canvas.parentElement;
      const currentWidth = p ? p.clientWidth : window.innerWidth;
      const currentHeight = p ? p.clientHeight : 500;
      if (canvas.width !== currentWidth || canvas.height !== currentHeight) {
        width = canvas.width = currentWidth;
        height = canvas.height = currentHeight;
      }
      
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = 'rgba(10, 25, 47, 0.02)';
      ctx.fillRect(0, 0, width, height);
      
      // 1. Draw drifting particles
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
      
      const time = Date.now() * 0.0012;
      
      // 2. Draw flowing sine ribbons
      const ribbonCount = 4;
      const step = 8;
      const colors = [
        'rgba(212, 175, 55, 0.35)', // Gold
        'rgba(139, 92, 246, 0.25)', // Purple
        'rgba(59, 130, 246, 0.28)',  // Blue
        'rgba(212, 175, 55, 0.20)'   // Faint gold
      ];
      
      for (let r = 0; r < ribbonCount; r++) {
        ctx.beginPath();
        ctx.strokeStyle = colors[r];
        ctx.lineWidth = r === 0 ? 1.5 : 1.0;
        
        const offsetPhase = r * Math.PI * 0.35;
        const speedCoeff = 0.8 + r * 0.2;
        
        for (let x = 0; x < width; x += step) {
          const baseAngle = (x * 0.0035) + (time * speedCoeff) + offsetPhase;
          let y = Math.sin(baseAngle) * 60 * Math.cos(baseAngle * 0.5);
          
          let finalY = height * 0.5 + y;
          
          // Mouse interaction (repel/pull ribbon)
          if (mouse.x !== null && mouse.y !== null) {
            const dx = x - mouse.x;
            const dy = finalY - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 250) {
              const factor = 1 - dist / 250;
              finalY += Math.sin(dist * 0.04 - time * 6) * 25 * factor;
            }
          }
          
          if (x === 0) {
            ctx.moveTo(x, finalY);
          } else {
            ctx.lineTo(x, finalY);
          }
        }
        ctx.stroke();
      }
      
      // 3. Draw flowing nodes on the ribbons
      const nodeCount = 5;
      for (let i = 0; i < nodeCount; i++) {
        const speed = 0.12 + i * 0.05;
        const progress = ((time * speed) % 1) * width;
        const rIndex = i % ribbonCount;
        
        const offsetPhase = rIndex * Math.PI * 0.35;
        const speedCoeff = 0.8 + rIndex * 0.2;
        const baseAngle = (progress * 0.0035) + (time * speedCoeff) + offsetPhase;
        
        let y = Math.sin(baseAngle) * 60 * Math.cos(baseAngle * 0.5);
        let finalY = height * 0.5 + y;
        
        // Mouse warp
        if (mouse.x !== null && mouse.y !== null) {
          const dx = progress - mouse.x;
          const dy = finalY - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 250) {
            const factor = 1 - dist / 250;
            finalY += Math.sin(dist * 0.04 - time * 6) * 25 * factor;
          }
        }
        
        ctx.beginPath();
        ctx.arc(progress, finalY, 4.5, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = 15;
        ctx.shadowColor = 'rgba(212, 175, 55, 0.95)';
        ctx.fill();
        ctx.shadowBlur = 0;
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
  
  return <canvas ref={canvasRef} style={{ filter: 'drop-shadow(0 0 8px rgba(212, 175, 55, 0.15))' }} className="absolute inset-0 w-full h-full z-0 pointer-events-none opacity-90" />;
};

const WhyCard = ({ title, desc, icon }) => {
  const cardRef = React.useRef(null);
  const [transformStyle, setTransformStyle] = React.useState('');
  const [shadowStyle, setShadowStyle] = React.useState('');
  const [mousePos, setMousePos] = React.useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setMousePos({ x, y });
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = ((centerY - y) / centerY) * 7;
    const rotateY = ((x - centerX) / centerX) * 7;
    
    setTransformStyle(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02) translateY(-4px)`);
    setShadowStyle(`${-rotateY * 1.5}px ${rotateX * 1.5}px 20px rgba(212, 175, 55, 0.1)`);
  };

  const handleMouseLeave = () => {
    setTransformStyle('');
    setShadowStyle('');
  };

  return (
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
      className="group relative bg-[#0c1a30]/85 border border-white/10 hover:border-[#D4AF37]/45 p-6 rounded-2xl min-h-[180px] transition-all duration-300 shadow-md backdrop-blur-md hover:bg-[#0e223f]/95 overflow-hidden text-left"
    >
      {/* Radial Hover Spotlight Glow */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          background: `radial-gradient(250px circle at var(--mouse-x) var(--mouse-y), rgba(212, 175, 55, 0.05), transparent 60%)`
        }}
      />

      <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] mb-4 group-hover:bg-[#D4AF37]/20 group-hover:scale-105 transition-all duration-300 relative">
        {icon}
      </div>
      
      <h3 className="text-xl font-bold text-white mb-3 group-hover:text-[#D4AF37] transition-colors duration-300">
        {title}
      </h3>
      
      <p className="text-[15px] text-gray-300 leading-relaxed font-sans font-light">
        {desc}
      </p>
    </div>
  );
};

const IndustriesCanvasBackground = () => {
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
    
    // Create network nodes
    const nodes = [];
    const nodeCount = 75;
    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        radius: Math.random() * 2.2 + 1.4,
        color: `rgba(212, 175, 55, ${Math.random() * 0.5 + 0.35})`
      });
    }
    
    const animate = () => {
      const p = canvas.parentElement;
      const currentWidth = p ? p.clientWidth : window.innerWidth;
      const currentHeight = p ? p.clientHeight : 500;
      if (canvas.width !== currentWidth || canvas.height !== currentHeight) {
        width = canvas.width = currentWidth;
        height = canvas.height = currentHeight;
      }
      
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = 'rgba(10, 25, 47, 0.02)';
      ctx.fillRect(0, 0, width, height);
      
      const time = Date.now() * 0.0016;

      // Update and draw nodes
      nodes.forEach(node => {
        node.x += node.vx;
        node.y += node.vy;
        
        // Bounce off edges
        if (node.x < 0 || node.x > width) node.vx *= -1;
        if (node.y < 0 || node.y > height) node.vy *= -1;
        
        // Mouse interact
        if (mouse.x !== null && mouse.y !== null) {
          const dx = node.x - mouse.x;
          const dy = node.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 185) {
            const force = (185 - dist) / 185;
            // Gently attract nodes to mouse
            node.x -= (dx / dist) * force * 1.0;
            node.y -= (dy / dist) * force * 1.0;
          }
        }
        
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.shadowBlur = node.radius * 3.0;
        ctx.shadowColor = 'rgba(212, 175, 55, 0.75)';
        ctx.fill();
        ctx.shadowBlur = 0;
      });
      
      // Draw connection lines and flowing pulses
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = 175;
          
          if (dist < maxDist) {
            let opacity = (1 - dist / maxDist) * 0.42;
            
            // Highlight connections near the mouse
            if (mouse.x !== null && mouse.y !== null) {
              const midX = (nodes[i].x + nodes[j].x) / 2;
              const midY = (nodes[i].y + nodes[j].y) / 2;
              const mdx = midX - mouse.x;
              const mdy = midY - mouse.y;
              const mDist = Math.sqrt(mdx * mdx + mdy * mdy);
              if (mDist < 160) {
                opacity += (1 - mDist / 160) * 0.25;
              }
            }
            
            ctx.strokeStyle = `rgba(212, 175, 55, ${opacity})`;
            ctx.lineWidth = (1 - dist / maxDist) * 1.1;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
            
            // Draw flowing data packet pulses along the network lines
            const pulsePeriod = (i + j) % 6;
            if (pulsePeriod === 0) {
              const t = (time * 0.55 + (i * 0.08) + (j * 0.04)) % 1.0;
              const px = nodes[i].x + (nodes[j].x - nodes[i].x) * t;
              const py = nodes[i].y + (nodes[j].y - nodes[i].y) * t;
              
              ctx.beginPath();
              ctx.arc(px, py, 2.6, 0, Math.PI * 2);
              ctx.fillStyle = '#ffffff';
              ctx.shadowBlur = 10;
              ctx.shadowColor = 'rgba(212, 175, 55, 0.95)';
              ctx.fill();
              ctx.shadowBlur = 0;
            }
          }
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
  
  return <canvas ref={canvasRef} style={{ filter: 'drop-shadow(0 0 8px rgba(212, 175, 55, 0.15))' }} className="absolute inset-0 w-full h-full z-0 pointer-events-none opacity-80" />;
};

const IndustryCard = ({ industry }) => {
  const cardRef = React.useRef(null);
  const [transformStyle, setTransformStyle] = React.useState('');
  const [shadowStyle, setShadowStyle] = React.useState('');
  const [mousePos, setMousePos] = React.useState({ x: 0, y: 0 });

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
    setShadowStyle(`${-rotateY * 1.5}px ${rotateX * 1.5}px 25px rgba(212, 175, 55, 0.08)`);
  };

  const handleMouseLeave = () => {
    setTransformStyle('');
    setShadowStyle('');
  };

  return (
    <Link 
      to={industry.path} 
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
      className="group relative block h-[300px] rounded-3xl overflow-hidden border border-white/10 hover:border-[#D4AF37]/50 transition-all duration-300 cursor-pointer shadow-2xl backdrop-blur-sm"
    >
      {/* Background Image with Zoom on Hover */}
      <div
        className="absolute inset-0 bg-cover bg-center z-0 transition-transform duration-700 ease-out group-hover:scale-110"
        style={{ backgroundImage: `url(${industry.image})` }}
      />

      {/* Dark Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0A192F] via-[#0A192F]/65 to-black/30 z-10 transition-opacity group-hover:opacity-90 duration-500" />

      {/* Radial Hover Spotlight Glow */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-15"
        style={{
          background: `radial-gradient(280px circle at var(--mouse-x) var(--mouse-y), rgba(212, 175, 55, 0.12), transparent 60%)`
        }}
      />

      {/* Content Container */}
      <div className="absolute inset-0 z-20 p-6 flex flex-col justify-end text-left">
        {/* Accent Line */}
        <div className="w-10 h-0.5 bg-[#D4AF37] mb-4 group-hover:w-16 transition-all duration-300"></div>

        <h3 className="text-2xl font-bold tracking-tight text-white mb-3 group-hover:text-[#D4AF37] transition-colors duration-300">
          {industry.name}
        </h3>

        <p className="text-[15px] text-gray-200 leading-relaxed group-hover:text-white transition-colors duration-300 font-sans font-light">
          {industry.desc}
        </p>
      </div>
    </Link>
  );
};

const TimelineCanvasBackground = () => {
  const canvasRef = React.useRef(null);
  
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    
    const parent = canvas.parentElement;
    let width = (canvas.width = parent ? parent.clientWidth : window.innerWidth);
    let height = (canvas.height = parent ? parent.clientHeight : 600);
    
    const handleResize = () => {
      if (!canvas) return;
      const p = canvas.parentElement;
      width = canvas.width = p ? p.clientWidth : window.innerWidth;
      height = canvas.height = p ? p.clientHeight : 600;
    };
    window.addEventListener('resize', handleResize);
    
    // Create particles that flow downward
    const particles = [];
    const particleCount = 25;
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 2.0 + 0.8,
        vy: Math.random() * 0.4 + 0.15, // float down
        vx: (Math.random() - 0.5) * 0.15,
        color: `rgba(212, 175, 55, ${Math.random() * 0.3 + 0.1})`
      });
    }
    
    const animate = () => {
      const p = canvas.parentElement;
      const currentWidth = p ? p.clientWidth : window.innerWidth;
      const currentHeight = p ? p.clientHeight : 600;
      if (canvas.width !== currentWidth || canvas.height !== currentHeight) {
        width = canvas.width = currentWidth;
        height = canvas.height = currentHeight;
      }
      
      ctx.clearRect(0, 0, width, height);
      
      particles.forEach(p => {
        p.y += p.vy;
        p.x += p.vx;
        
        if (p.y > height) {
          p.y = 0;
          p.x = Math.random() * width;
        }
        if (p.x < 0 || p.x > width) p.vx *= -1;
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      });
      
      animationFrameId = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);
  
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-0 pointer-events-none opacity-70" />;
};

const CTACanvasBackground = () => {
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
    
    // Setup stars/particles
    const particles = [];
    const particleCount = 60;
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.5 + 0.6,
        vx: (Math.random() - 0.5) * 0.2,
        vy: -Math.random() * 0.4 - 0.1, // slowly drift up
        color: `rgba(212, 175, 55, ${Math.random() * 0.4 + 0.15})`
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
      ctx.fillStyle = 'rgba(10, 25, 47, 0.02)';
      ctx.fillRect(0, 0, width, height);
      
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        
        // Wrap around
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) {
          p.y = height;
          p.x = Math.random() * width;
        }
        
        // Mouse push
        if (mouse.x !== null && mouse.y !== null) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            const force = (120 - dist) / 120;
            p.x += (dx / dist) * force * 1.2;
            p.y += (dy / dist) * force * 1.2;
          }
        }
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
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
  
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-0 pointer-events-none opacity-75" />;
};

const ContactCanvasBackground = () => {
  const canvasRef = React.useRef(null);
  
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    
    const parent = canvas.parentElement;
    let width = (canvas.width = parent ? parent.clientWidth : window.innerWidth);
    let height = (canvas.height = parent ? parent.clientHeight : 600);
    
    const handleResize = () => {
      if (!canvas) return;
      const p = canvas.parentElement;
      width = canvas.width = p ? p.clientWidth : window.innerWidth;
      height = canvas.height = p ? p.clientHeight : 600;
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
      const currentHeight = p ? p.clientHeight : 600;
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

const Home = () => {
  const videoRef = useRef(null);
  const [isLooping, setIsLooping] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleLoop = () => {
    if (videoRef.current) {
      if (isLooping) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(err => console.log("Video play failed:", err));
      }
      setIsLooping(!isLooping);
    }
  };

  const openWatchFilmModal = () => {
    setIsModalOpen(true);
    if (videoRef.current && isLooping) {
      videoRef.current.pause();
    }
  };

  const closeWatchFilmModal = () => {
    setIsModalOpen(false);
    if (videoRef.current && isLooping) {
      videoRef.current.play().catch(err => console.log("Video play failed:", err));
    }
  };

  const scrollToNextSection = () => {
    const nextSection = document.getElementById('threeways-section');
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const industries = [
    {
      name: "Manufacturing",
      image: "/assets/images/manufacturing.png",
      desc: "Capital planning and supply chain support for industrial businesses",
      path: "/industry-manufacturing"
    },
    {
      name: "Retail",
      image: "/assets/images/retail.png",
      desc: "Growth planning and financial advisory for consumer brands",
      path: "/industry-retail"
    },
    {
      name: "Healthcare",
      image: "/assets/images/healthcare.png",
      desc: "Valuation, regulatory compliance, and M&A advisory for clinical systems",
      path: "/industry-healthcare"
    },
    {
      name: "Technology",
      image: "/assets/images/technology.png",
      desc: "Business scaling, IP valuation, and capital raising for SaaS and technology firms",
      path: "/industry-technology"
    }
  ];

  const timelineSteps = [
    { step: "01", title: "Discovery", desc: "Deep understanding of your business objectives" },
    { step: "02", title: "Strategy", desc: "Customized solution architecture" },
    { step: "03", title: "Execution", desc: "Flawless implementation by specialists" },
    { step: "04", title: "Results Delivery", desc: "Measurable results and continuous support" }
  ];

  const caseStudies = [
    {
      company: "TechNova Solutions",
      industry: "SaaS",
      value: "$245M",
      result: "Successfully raised Series C at premium valuation",
      path: "/technova-solutions"
    },
    {
      company: "MediCore Health",
      industry: "Healthcare",
      value: "$87M",
      result: "Strategic acquisition completed",
      path: "/medicore-health"
    }
  ];

  const offices = [
    {
      city: "Chittagong, Bangladesh",
      address: "FinBridge Tower, Agrabad Commercial Area",
      phone: "+880 1719 765432",
      email: "contact@finbridge.com"
    }
  ];


  return (
    <div className="bg-[#0A192F] text-white">
      {/* Hero Section */}
      <section className="min-h-[100dvh] pt-20 flex items-center justify-center relative overflow-hidden">
        {/* Background Video */}
        <video
          ref={videoRef}
          src="/assets/videos/hero-video.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0 filter brightness-[1.25] contrast-[1.08] saturate-[1.05]"
        />

        {/* Minimal ambient overlays to keep the video bright and crisp */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A192F]/35 via-transparent to-[#0A192F]/40 pointer-events-none z-0" />

        {/* Pause/Play Loop Toggle */}
        <button
          onClick={toggleLoop}
          className="absolute top-28 right-6 md:right-12 z-20 flex items-center gap-2 text-white/60 hover:text-white text-[11px] font-medium tracking-widest bg-black/15 hover:bg-black/40 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10 opacity-70 hover:opacity-100 transition-all cursor-pointer uppercase shadow-md"
        >
          <span>{isLooping ? 'Pause loop' : 'Play loop'}</span>
          {isLooping ? (
            <Pause className="w-3 h-3 fill-current" />
          ) : (
            <Play className="w-3 h-3 fill-current" />
          )}
        </button>

        {/* Main Hero Container (Empty to allow background video text to be fully visible without overlap) */}
        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 flex flex-col items-center text-center h-[20vh] pointer-events-none" />

        {/* Scroll Hint */}
        <div
          onClick={scrollToNextSection}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 cursor-pointer group opacity-60 hover:opacity-100 transition-opacity"
        >
          <span className="text-[10px] md:text-xs font-semibold tracking-widest text-white/80 group-hover:text-white uppercase">
            Scroll to explore
          </span>
          <div className="w-7 h-7 rounded-full border border-white/20 flex items-center justify-center group-hover:border-[#D4AF37] group-hover:bg-[#D4AF37]/10 transition-all duration-300">
            <ArrowRight className="w-3.5 h-3.5 text-[#D4AF37] rotate-90 group-hover:translate-y-0.5 transition-transform" />
          </div>
        </div>

        {/* Watch Film Button (Kept but integrated cleanly in the bottom right corner) */}
        <div className="absolute bottom-8 right-6 md:right-12 z-20 flex flex-col items-end gap-1 opacity-50 hover:opacity-100 transition-all">
          <button
            onClick={openWatchFilmModal}
            className="border border-white/20 hover:border-white text-white/70 hover:text-white px-4 py-2 rounded-full flex items-center gap-2 transition-all tracking-wider text-[9px] font-semibold group cursor-pointer bg-black/20 hover:bg-black/40 backdrop-blur-sm shadow-md uppercase"
          >
            <span>Watch film</span>
            <Play className="w-2.5 h-2.5 fill-current group-hover:scale-105 transition" />
          </button>
        </div>
      </section>

      {/* Watch Film Modal */}
      {isModalOpen && (
        <div className="fixed top-20 left-0 right-0 bottom-0 z-[990] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 md:p-12">
          <div className="relative w-[90%] md:w-[80%] max-w-4xl aspect-video rounded-sm overflow-hidden shadow-2xl border border-white/10 bg-black">
            {/* Close button - white square box with thick black X */}
            <button
              onClick={closeWatchFilmModal}
              className="absolute top-0 right-0 bg-white hover:bg-gray-200 text-black hover:text-gray-800 transition cursor-pointer w-10 h-10 flex items-center justify-center z-50 shadow-md"
              aria-label="Close video"
            >
              <X className="w-5 h-5 stroke-[3.5]" />
            </button>
            <video
              src="/assets/videos/finbridge-solutions-1.mp4"
              controls
              autoPlay
              playsInline
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      )}
      {/* Transform Financial Future Section */}
      <div id="threeways-section" className="scroll-mt-20">
        <ThreeWays />
      </div>

      {/* Services We Offer Section */}
      <ServicesWeOffer />

      {/* Department Services Section */}
      <section className="pt-10 pb-10 bg-[#0A192F] border-t border-white/10 relative overflow-hidden">
        {/* 3D Geometric Floating Shapes Background */}
        <DeptCanvasBackground />

        {/* Ambient Gradient Blobs */}
        <div className="absolute top-[-100px] left-[-50px] w-[400px] h-[400px] bg-gradient-to-tr from-[#D4AF37]/10 to-transparent rounded-full blur-[90px] pointer-events-none z-0 animate-pulse" />
        <div className="absolute bottom-[-150px] right-[-50px] w-[450px] h-[450px] bg-[#0A1230]/90 rounded-full blur-[110px] pointer-events-none z-0" />
        
        {/* Card bobbing styling */}
        <style>{`
          @keyframes card-float-d1 {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-7px); }
          }
          @keyframes card-float-d2 {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-9px); }
          }
          @keyframes card-float-d3 {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-5px); }
          }
          @keyframes card-float-d4 {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-8px); }
          }
          .animate-dept-card-1 { animation: card-float-d1 6s ease-in-out infinite; }
          .animate-dept-card-2 { animation: card-float-d2 7s ease-in-out infinite; }
          .animate-dept-card-3 { animation: card-float-d3 5.5s ease-in-out infinite; }
          .animate-dept-card-4 { animation: card-float-d4 6.5s ease-in-out infinite; }
        `}</style>
        
        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
          <div className="text-center mb-12">
            <span className="text-[#D4AF37] text-xs tracking-[0.2em] font-semibold uppercase">What We Offer</span>
            <h2 className="text-5xl font-semibold tracking-tight mt-2.5 text-white">Our Service Departments</h2>
            <p className="text-gray-400 mt-4 max-w-2xl mx-auto text-base">End-to-end financial advisory across four core departments, each with dedicated consultants, workflows, and reporting</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
            {departmentsData.map((dept, i) => {
              const animClass = i === 0 ? 'animate-dept-card-1' : i === 1 ? 'animate-dept-card-2' : i === 2 ? 'animate-dept-card-3' : 'animate-dept-card-4';
              return (
                <div key={i} className={`${animClass} h-full`}>
                  <DepartmentCard dept={dept} i={i} />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Process Timeline */}
      <section className="pt-10 pb-20 relative overflow-hidden bg-black/10 border-t border-white/5">
        {/* Dynamic drifting background particles */}
        <TimelineCanvasBackground />

        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 35 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-6xl font-semibold tracking-tight">How We Work</h2>
          </motion.div>
          <Timeline steps={timelineSteps} />
        </div>
      </section>

      {/* Why FinBridge Section */}
      <section className="py-14 bg-[#0A192F] border-t border-b border-white/10 relative overflow-hidden">
        {/* Flowing Sine Wave Ribbon Background */}
        <WhyFinBridgeCanvas />
        
        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16 relative z-10">
            {/* Left Column */}
            <div className="lg:col-span-5 flex flex-col justify-center items-start">
              <span className="text-[#D4AF37] text-xs font-mono tracking-[0.2em] font-semibold uppercase block mb-3">
                WHY FINBRIDGE
              </span>
              <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-white leading-tight mb-4">
                Why Businesses Choose FinBridge
              </h2>
              <p className="text-gray-400 text-base leading-relaxed font-sans font-light mb-8">
                Helping startups, SMEs, and growing businesses with financial guidance, clear insights, and growth-focused solutions
              </p>
              <Link
                to="/about"
                className="inline-flex items-center gap-2 border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#0A192F] font-semibold text-xs tracking-wider uppercase py-3.5 px-6 transition-all duration-300 rounded-lg group"
              >
                Learn More
                <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Right Column */}
            <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
              <WhyCard 
                title="Financial Expertise"
                desc="Use professional financial analysis and sound planning to make informed business decisions"
                icon={<TrendingUp className="w-5 h-5" />} 
              />
              <WhyCard 
                title="Data-Driven Insights"
                desc="Convert financial data into useful insights through analytics, reporting, and performance tracking"
                icon={<PieChart className="w-5 h-5" />} 
              />
              <WhyCard 
                title="Personalized Recommendations" 
                desc="Receive tailored recommendations aligned with your business goals, financial position, and growth objectives" 
                icon={<Target className="w-5 h-5" />} 
              />
              <WhyCard 
                title="End-to-End Support" 
                desc="From financial assessment to implementation planning, access guidance throughout your business journey" 
                icon={<Briefcase className="w-5 h-5" />} 
              />
            </div>
          </div>

          {/* Separator */}
          <div className="border-t border-white/10 my-12" />

          {/* Bottom Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-[#D4AF37] mb-2">
                <AnimatedCounter end={1200} />+
              </div>
              <div className="text-xs text-gray-400 uppercase tracking-wider font-sans font-medium">
                Clients Served
              </div>
            </div>
            <div>
              <div className="text-4xl font-bold text-[#D4AF37] mb-2">
                <AnimatedCounter end={98} />%
              </div>
              <div className="text-xs text-gray-400 uppercase tracking-wider font-sans font-medium">
                Client Satisfaction
              </div>
            </div>
            <div>
              <div className="text-4xl font-bold text-[#D4AF37] mb-2">
                ₹<AnimatedCounter end={500} /> Cr+
              </div>
              <div className="text-xs text-gray-400 uppercase tracking-wider font-sans font-medium">
                Assets Under Advisory
              </div>
            </div>
            <div>
              <div className="text-4xl font-bold text-[#D4AF37] mb-2">
                4
              </div>
              <div className="text-xs text-gray-400 uppercase tracking-wider font-sans font-medium">
                Service Departments
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Industries */}
      <section className="py-16 bg-[#0A192F] border-t border-b border-white/10 relative overflow-hidden">
        {/* Dynamic Connected Network background */}
        <IndustriesCanvasBackground />

        {/* Ambient Gradient Blobs */}
        <div className="absolute top-[-100px] left-[-50px] w-[400px] h-[400px] bg-gradient-to-tr from-[#D4AF37]/8 to-transparent rounded-full blur-[100px] pointer-events-none z-0 animate-pulse" />
        <div className="absolute bottom-[-150px] right-[-50px] w-[450px] h-[450px] bg-[#0A1230]/90 rounded-full blur-[120px] pointer-events-none z-0" />

        {/* Floating Card Animations in CSS */}
        <style>{`
          @keyframes card-float-i1 {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-6px); }
          }
          @keyframes card-float-i2 {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-8px); }
          }
          @keyframes card-float-i3 {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-5px); }
          }
          @keyframes card-float-i4 {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-7px); }
          }
          .animate-industry-card-1 { animation: card-float-i1 5.5s ease-in-out infinite; }
          .animate-industry-card-2 { animation: card-float-i2 6.5s ease-in-out infinite; }
          .animate-industry-card-3 { animation: card-float-i3 5s ease-in-out infinite; }
          .animate-industry-card-4 { animation: card-float-i4 6s ease-in-out infinite; }
        `}</style>

        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <span className="text-[#D4AF37] text-xs tracking-[0.2em] font-semibold uppercase">Sectors We Serve</span>
            <h2 className="text-5xl font-semibold tracking-tight mt-2.5">Industries We Serve</h2>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {industries.map((industry, i) => {
              const animClass = i === 0 ? 'animate-industry-card-1' : i === 1 ? 'animate-industry-card-2' : i === 2 ? 'animate-industry-card-3' : 'animate-industry-card-4';
              return (
                <div key={i} className={`${animClass} h-full`}>
                  <IndustryCard industry={industry} />
                </div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Case Studies */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex justify-between mb-12">
            <h2 className="text-6xl font-semibold tracking-tight">Client Success</h2>
            <Link to="/success-stories" className="flex items-center gap-3 text-[#D4AF37]">All Success Stories <ArrowRight /></Link>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {caseStudies.map((study, i) => (
              <CaseStudyCard study={study} index={i} key={i} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-28 bg-gradient-to-br from-[#0A192F] to-black border-t border-[#D4AF37]/20 relative overflow-hidden">
        {/* Animated Gold Space Dust background */}
        <CTACanvasBackground />

        {/* Ambient Gradient Radial overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.05),transparent_65%)] pointer-events-none z-0" />

        <motion.div 
          initial={{ opacity: 0, scale: 0.96, y: 30 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="max-w-4xl mx-auto text-center px-6 relative z-10"
        >
          <h2 className="text-6xl font-semibold tracking-tight mb-8">Start Working with Us</h2>
          <p className="text-2xl text-gray-400 mb-10">Connect with our senior advisors today</p>
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <button
              onClick={() => {
                const contactSection = document.getElementById('contact-section');
                if (contactSection) contactSection.scrollIntoView({ behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-4 bg-[#D4AF37] hover:bg-white text-[#0A192F] px-12 py-5 rounded-3xl font-semibold text-xl transition-all group cursor-pointer"
            >
              SCHEDULE CONSULTATION
              <ArrowRight className="group-hover:translate-x-2 transition" />
            </button>
            <Link to="/client/login"
              className="inline-flex items-center gap-3 border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#0A192F] px-10 py-5 rounded-3xl font-semibold text-xl transition-all group">
              CLIENT PORTAL
              <ArrowRight className="group-hover:translate-x-2 transition" />
            </Link>
          </div>

        </motion.div>
      </section>

      {/* Contact Section */}
      <section id="contact-section" className="py-24 bg-[#0A192F] border-t border-white/10 scroll-mt-20 relative overflow-hidden">
        {/* Curved communication grid background */}
        <ContactCanvasBackground />
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid lg:grid-cols-12 gap-12">
            {/* Contact Form — now captures real leads */}
            <div className="lg:col-span-7">
              <div className="bg-white/5 border border-white/10 rounded-3xl p-8 md:p-12">
                <h2 className="text-4xl font-semibold mb-10">Request a Free Consultation</h2>
                <LeadCaptureForm />
              </div>
            </div>

            {/* Contact Information */}
            <div className="lg:col-span-5 space-y-10">
              <div>
                <h3 className="text-2xl font-semibold mb-8 flex items-center gap-3">
                  <Mail className="text-[#D4AF37] w-6 h-6" /> Get In Touch
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
                  <MapPin className="text-[#D4AF37] w-6 h-6" /> Our Offices
                </h3>
                <div className="space-y-8">
                  {offices.map((office, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      viewport={{ once: true }}
                      className="border-l-4 border-[#D4AF37] pl-8"
                    >
                      <div className="font-semibold text-xl mb-3">{office.city}</div>
                      <div className="text-gray-400 text-sm leading-relaxed mb-4">{office.address}</div>
                      <div className="flex flex-col gap-2 text-sm">
                        <a href={`tel:${office.phone}`} className="hover:text-[#D4AF37] transition-colors flex items-center gap-2">
                          <Phone className="w-4 h-4" /> {office.phone}
                        </a>
                        <a href={`mailto:${office.email}`} className="hover:text-[#D4AF37] transition-colors flex items-center gap-2">
                          <Mail className="w-4 h-4" /> {office.email}
                        </a>
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
      </section>

    </div>
  );
};

export default Home;