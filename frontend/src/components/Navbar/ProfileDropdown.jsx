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
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10 text-[#D4AF37]">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-light">Have an account?</p>
                  <p className="text-sm font-semibold text-white">Sign In</p>
                </div>
              </div>
              <Link
                to="/login"
                onClick={onClose}
                className="bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-[#0A192F] font-bold text-xs px-3.5 py-1.5 rounded-lg flex items-center gap-1 transition-all duration-300 shadow-md shadow-[#D4AF37]/10"
              >
                <LogIn className="w-3.5 h-3.5" />
                Login
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProfileDropdown;

