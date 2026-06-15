import { motion } from 'framer-motion';

const MainLayout = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="pt-20"
    >
      {children}
    </motion.div>
  );
};

export default MainLayout;