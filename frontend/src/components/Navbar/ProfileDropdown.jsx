import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, Key } from 'lucide-react';

const ProfileDropdown = ({ isOpen, onClose }) => {
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={dropdownRef}
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.95 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="absolute right-0 top-full mt-3 w-80 bg-[#0A192F] border border-[#D4AF37]/20 shadow-2xl rounded-2xl p-5 text-white z-[9999]"
        >
          {/* Accent border strip */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[85%] h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37]/50 to-transparent" />

          {/* User Sign In Prompt */}
          <div className="pb-2">
            <h4 className="text-[10px] uppercase tracking-[0.2em] text-[#D4AF37] font-bold font-mono">My Account</h4>
            <div className="flex flex-col gap-4 mt-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 text-[#D4AF37]">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-light">Access your dashboard</p>
                  <p className="text-sm font-semibold text-white">Sign In or Register</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2.5">
                <Link
                  to="/b2b/login"
                  onClick={onClose}
                  className="bg-transparent hover:bg-white/5 border border-[#D4AF37]/30 hover:border-[#D4AF37] text-white hover:text-[#D4AF37] font-semibold text-xs py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all duration-300"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Login
                </Link>
                <Link
                  to="/b2b/register"
                  onClick={onClose}
                  className="bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-[#0A192F] font-bold text-xs py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all duration-300 shadow-md shadow-[#D4AF37]/10"
                >
                  Sign Up
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProfileDropdown;

