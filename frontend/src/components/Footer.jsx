// src/components/Footer.jsx
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[#0A192F] border-t border-white/10 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid md:grid-cols-12 gap-y-16">
          {/* Brand */}
          <div className="md:col-span-5">
            <div className="text-3xl font-bold tracking-tighter text-white mb-6">FINBRIDGE</div>
            <p className="text-gray-400 max-w-md text-lg leading-relaxed">
              Enterprise financial advisory delivering strategic clarity, execution excellence, and lasting value.
            </p>
            
            <div className="mt-10 flex items-center gap-6">
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">LinkedIn</a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">Twitter</a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">Instagram</a>
            </div>
          </div>

          {/* Services */}
          <div className="md:col-span-2">
            <div className="uppercase text-xs tracking-widest text-[#D4AF37] mb-8">SERVICES</div>
            <div className="space-y-4 text-sm">
              <Link to="/valuation-advisory" className="block text-gray-300 hover:text-white transition-colors">Valuation Advisory</Link>
              <Link to="/transaction-services" className="block text-gray-300 hover:text-white transition-colors">Transaction Services</Link>
              <Link to="/risk-compliance" className="block text-gray-300 hover:text-white transition-colors">Risk & Compliance</Link>
              <Link to="/financial-transformation" className="block text-gray-300 hover:text-white transition-colors">Financial Transformation</Link>
              <Link to="/wealth-management" className="block text-gray-300 hover:text-white transition-colors">Wealth Management</Link>
            </div>
          </div>

          {/* Solutions */}
          <div className="md:col-span-2">
            <div className="uppercase text-xs tracking-widest text-[#D4AF37] mb-8">SOLUTIONS</div>
            <div className="space-y-4 text-sm">
              <Link to="/corporate-finance" className="block text-gray-300 hover:text-white transition-colors">Corporate Finance</Link>
              <Link to="/market-intelligence" className="block text-gray-300 hover:text-white transition-colors">Market Intelligence</Link>
              <Link to="/digital-finance" className="block text-gray-300 hover:text-white transition-colors">Digital Finance</Link>
              <Link to="/about" className="block text-gray-300 hover:text-white transition-colors">About Us</Link>
            </div>
          </div>

          {/* Contact */}
          <div className="md:col-span-3">
            <div className="uppercase text-xs tracking-widest text-[#D4AF37] mb-8">CONTACT</div>
            
            <div className="space-y-6">
              <div>
                <div className="text-white font-medium">Global Headquarters</div>
                <div className="text-gray-400 text-sm mt-1">New York • London • Singapore</div>
              </div>
              
              <a href="mailto:advisory@finbridge.com" className="block text-[#D4AF37] hover:underline">advisory@finbridge.com</a>
              <a href="tel:+12125550189" className="block text-[#D4AF37] hover:underline">+1 (212) 555-0189</a>
            </div>

            <Link 
              to="/contact"
              className="mt-12 inline-flex items-center gap-3 group text-sm font-medium border border-[#D4AF37]/70 hover:border-[#D4AF37] px-8 py-4 rounded-2xl transition-all"
            >
              SCHEDULE A CONSULTATION
              <ArrowRight className="group-hover:translate-x-1 transition" />
            </Link>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-20 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-gray-500">
          <div>© 2026 FinBridge Solutions. All Rights Reserved.</div>
          <div className="flex gap-8">
            <Link to="/about" className="hover:text-gray-300 transition-colors">Privacy Policy</Link>
            <Link to="/about" className="hover:text-gray-300 transition-colors">Terms of Service</Link>
            <Link to="/about" className="hover:text-gray-300 transition-colors">Regulatory Disclosures</Link>
          </div>
          <div>Designed for Executive Excellence</div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;