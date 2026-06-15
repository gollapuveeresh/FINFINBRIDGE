import React from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function DepartmentAdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-bg">
      <Sidebar role="department-admin" />
      <Topbar role="department-admin" />
      <main className="ml-[280px] pt-[112px] min-h-screen p-margin-desktop">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="max-w-[1440px] mx-auto space-y-gutter"
        >
          {children}
        </motion.div>
      </main>
      <footer className="ml-[280px] py-6 px-margin-desktop bg-surface-hover-lowest flex flex-col md:flex-row justify-between items-center border-t border-border text-text-muted text-body-sm">
        <p>© 2026 FinBridge Solutions. All rights reserved.</p>
        <div className="flex gap-8 mt-3 md:mt-0">
          <Link to="/department-admin/dashboard" className="hover:underline decoration-secondary transition-opacity">Department Overview</Link>
          <Link to="/department-admin/clients" className="hover:underline decoration-secondary transition-opacity">Client Queue</Link>
        </div>
      </footer>
    </div>
  );
}
