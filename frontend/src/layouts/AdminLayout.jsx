import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function AdminLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-bg">
      <Sidebar role="admin" isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Mobile topbar/header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-surface border-b border-border flex items-center justify-between px-6 z-40">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-1.5 text-text-muted hover:text-text hover:bg-surface-hover rounded-lg transition-colors flex items-center justify-center"
            title="Open Menu"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
          <span className="font-bold text-accent">FinBridge Admin Portal</span>
        </div>
      </div>

      <main className="ml-0 lg:ml-[280px] pt-14 lg:pt-8 min-h-screen p-4 lg:p-margin-desktop">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="max-w-[1440px] mx-auto space-y-gutter"
        >
          {children}
        </motion.div>
      </main>
      <footer className="ml-0 lg:ml-[280px] py-6 px-4 lg:px-margin-desktop bg-surface-hover-lowest flex flex-col md:flex-row justify-between items-center border-t border-border text-text-muted text-body-sm">
        <p>© 2026 FinBridge Solutions. All rights reserved.</p>
        <div className="flex gap-8 mt-3 md:mt-0">
          <Link to="/admin/settings" className="hover:underline decoration-secondary transition-opacity">Privacy Policy</Link>
          <Link to="/admin/settings" className="hover:underline decoration-secondary transition-opacity">Terms of Service</Link>
          <Link to="/admin/settings" className="hover:underline decoration-secondary transition-opacity">System Status</Link>
        </div>
      </footer>
    </div>
  );
}
