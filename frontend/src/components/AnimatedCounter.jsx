// src/components/AnimatedCounter.jsx
import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';

const AnimatedCounter = ({ end, suffix = "", decimals = 0, duration = 2000 }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;

    let startTime;
    const startValue = 0;
    const endValue = parseFloat(end);

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      const currentValue = startValue + (endValue - startValue) * progress;
      setCount(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCount(endValue);
      }
    };

    requestAnimationFrame(animate);
  }, [end, duration, isInView]);

  const formattedCount = count.toFixed(decimals);

  return (
    <motion.span 
      ref={ref}
      className="font-bold text-[#D4AF37]"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
    >
      {formattedCount}{suffix}
    </motion.span>
  );
};

export default AnimatedCounter;