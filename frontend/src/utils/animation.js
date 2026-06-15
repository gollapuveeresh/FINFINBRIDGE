// src/utils/animations.js
export const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, ease: "easeOut" }
};

export const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

export const staggerItem = {
  hidden: { opacity: 0, y: 30 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

export const hoverLift = {
  whileHover: { 
    y: -12, 
    transition: { duration: 0.3, ease: "easeOut" } 
  }
};

export const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.5, ease: "easeInOut" }
};

export const goldButtonHover = {
  whileHover: { 
    scale: 1.03, 
    boxShadow: "0 20px 25px -5px rgb(212 175 55 / 0.3)" 
  },
  whileTap: { scale: 0.98 }
};