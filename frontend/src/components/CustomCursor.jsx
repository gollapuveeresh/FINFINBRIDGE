import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const CustomCursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isInputHovered, setIsInputHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);

    const moveCursor = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseOver = (e) => {
      const interactive = e.target.closest('a, button, [role="button"], [class*="cursor-pointer"]');
      setIsHovering(!!interactive);

      const isInputField = e.target.closest('input, textarea, select, [contenteditable="true"]');
      setIsInputHovered(!!isInputField);
    };

    document.addEventListener('mousemove', moveCursor);
    document.addEventListener('mouseover', handleMouseOver);

    return () => {
      document.removeEventListener('mousemove', moveCursor);
      document.removeEventListener('mouseover', handleMouseOver);
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  if (isMobile || isInputHovered) return null;

  return (
    <div
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
        pointerEvents: 'none',
        zIndex: 99999,
      }}
      className="hidden md:block"
    >
      {/* Outer Ring */}
      <motion.div
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          border: '1.5px solid #D4AF37',
          position: 'absolute',
          left: '-16px',
          top: '-16px',
          pointerEvents: 'none',
        }}
        animate={{
          scale: isHovering ? 1.4 : 1,
          backgroundColor: isHovering ? 'rgba(212, 175, 55, 0.15)' : 'rgba(212, 175, 55, 0)',
        }}
        transition={{ type: "spring", stiffness: 450, damping: 25 }}
      />
      {/* Inner Dot */}
      <div 
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: '#D4AF37',
          position: 'absolute',
          left: '-3px',
          top: '-3px',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
};

export default CustomCursor;