import React from 'react';
import Sidebar from '../components/Sidebar';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function ConsultantLayout({ children }) {
  return (
    <div className="min-h-screen bg-bg">
      <Sidebar role="consultant" />
      <main className="ml-[280px] min-h-screen p-margin-desktop">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="max-w-[1440px] mx-auto space-y-gutter"
        >
          {children}
        </motion.div>
      </main>
      <footer className="ml-[280px] py-6 px-margin-desktop bg-surface-hover-lowest flex flex-col md:flex-row justify-between items-center border-t border-border text-text-muted text-body-sm">
        <p>© 2026 FinBridge Solutions. All rights reserved.</p>
        <div className="flex gap-8 mt-3 md:mt-0">
          <Link to="/consultant/dashboard" className="hover:underline decoration-secondary transition-opacity">Privacy Policy</Link>
          <Link to="/consultant/dashboard" className="hover:underline decoration-secondary transition-opacity">Terms of Service</Link>
          <Link to="/consultant/schedule" className="hover:underline decoration-secondary transition-opacity">Advisor Support</Link>
        </div>
      </footer>
    </div>
  );
}
