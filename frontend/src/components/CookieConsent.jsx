import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Info, X } from 'lucide-react';

export default function CookieConsent() {
  const [showConsent, setShowConsent] = useState(false);
  const [showManageModal, setShowManageModal] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true,
    performance: true,
    marketing: false,
  });

  useEffect(() => {
    const consent = localStorage.getItem('finbridge_cookie_consent');
    if (!consent) {
      // Small delay for natural appearance
      const timer = setTimeout(() => setShowConsent(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem('finbridge_cookie_consent', JSON.stringify({
      necessary: true,
      performance: true,
      marketing: true,
    }));
    setShowConsent(false);
  };

  const handleRejectAll = () => {
    localStorage.setItem('finbridge_cookie_consent', JSON.stringify({
      necessary: true,
      performance: false,
      marketing: false,
    }));
    setShowConsent(false);
  };

  const handleSavePreferences = () => {
    localStorage.setItem('finbridge_cookie_consent', JSON.stringify(preferences));
    setShowManageModal(false);
    setShowConsent(false);
  };

  if (!showConsent) return null;

  return (
    <>
      {/* PwC-style Bottom Cookie Consent Banner */}
      <div className="fixed bottom-0 left-0 w-full bg-[#0a1424] border-t border-[#D4AF37]/30 shadow-2xl z-[9999] px-6 py-6 md:py-8 text-white transition-all duration-500 transform translate-y-0">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="flex items-start gap-4 flex-1">
            <div className="p-3 bg-[#D4AF37]/10 rounded-2xl hidden md:block border border-[#D4AF37]/20 shrink-0">
              <ShieldCheck className="w-6 h-6 text-[#D4AF37]" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-[#D4AF37] mb-1.5 flex items-center gap-2">
                Cookie Consent Notice
              </h4>
              <p className="text-sm text-gray-300 leading-relaxed max-w-4xl">
                We use cookies to optimize website performance, analyze site traffic, and support personalized marketing efforts. 
                By using our platform, you acknowledge and agree to our {' '}
                <Link to="/privacy-policy" className="text-[#D4AF37] hover:underline font-semibold">Privacy Policy</Link> and {' '}
                <Link to="/terms-of-service" className="text-[#D4AF37] hover:underline font-semibold">Terms of Service</Link>.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-end">
            <button
              onClick={() => setShowManageModal(true)}
              className="px-5 py-3 border border-white/20 hover:border-[#D4AF37]/60 rounded-xl text-sm font-semibold transition-colors bg-white/[0.02] hover:bg-white/[0.05]"
            >
              Manage Preferences
            </button>
            <button
              onClick={handleRejectAll}
              className="px-5 py-3 border border-white/20 hover:border-[#D4AF37]/60 rounded-xl text-sm font-semibold transition-colors bg-white/[0.02] hover:bg-white/[0.05]"
            >
              Reject All
            </button>
            <button
              onClick={handleAcceptAll}
              className="px-6 py-3 bg-[#D4AF37] hover:bg-white text-[#0A192F] rounded-xl text-sm font-bold shadow-md transition-colors"
            >
              Accept All
            </button>
          </div>
        </div>
      </div>

      {/* PwC-style Cookie Preferences Management Modal */}
      {showManageModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[10000] backdrop-blur-sm">
          <div className="bg-[#0c1a30] border border-white/10 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <div className="p-8 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Info className="w-6 h-6 text-[#D4AF37]" />
                <h3 className="text-2xl font-bold text-white">Manage Cookies</h3>
              </div>
              <button 
                onClick={() => setShowManageModal(false)}
                className="p-1.5 hover:bg-white/10 rounded-xl transition-colors text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-8 space-y-6">
              <p className="text-sm text-gray-300 leading-relaxed">
                Customize your cookie preferences. Toggling performance or marketing cookies will influence the personalized tools and advisory features available on our platform.
              </p>

              {/* Necessary */}
              <div className="flex items-start justify-between gap-6 p-5 bg-white/[0.02] border border-white/5 rounded-2xl">
                <div>
                  <h5 className="font-semibold text-white mb-1">Strictly Necessary Cookies</h5>
                  <p className="text-xs text-gray-400">Essential for page navigation, secure areas, and core functions (such as maintaining your secure, reload-cleared session).</p>
                </div>
                <span className="text-xs px-3 py-1.5 bg-[#D4AF37]/20 text-[#D4AF37] font-semibold rounded-lg shrink-0">Always Active</span>
              </div>

              {/* Performance */}
              <div className="flex items-start justify-between gap-6 p-5 bg-white/[0.02] border border-white/5 rounded-2xl">
                <div>
                  <h5 className="font-semibold text-white mb-1">Performance & Analytical Cookies</h5>
                  <p className="text-xs text-gray-400">Allows us to analyze site visits and traffic sources so we can measure and improve the capabilities of our advisory panels.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                  <input
                    type="checkbox"
                    checked={preferences.performance}
                    onChange={(e) => setPreferences({ ...preferences, performance: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D4AF37]"></div>
                </label>
              </div>

              {/* Marketing */}
              <div className="flex items-start justify-between gap-6 p-5 bg-white/[0.02] border border-white/5 rounded-2xl">
                <div>
                  <h5 className="font-semibold text-white mb-1">Marketing & Targeting Cookies</h5>
                  <p className="text-xs text-gray-400">Used by financial advertising services to track visits across websites to present relevant ads tailored to your interest profile.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                  <input
                    type="checkbox"
                    checked={preferences.marketing}
                    onChange={(e) => setPreferences({ ...preferences, marketing: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D4AF37]"></div>
                </label>
              </div>
            </div>

            <div className="p-8 border-t border-white/10 flex justify-end gap-3">
              <button
                onClick={() => setShowManageModal(false)}
                className="px-5 py-3 border border-white/20 hover:border-[#D4AF37]/60 rounded-xl text-sm font-semibold transition-colors hover:bg-white/[0.02]"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePreferences}
                className="px-6 py-3 bg-[#D4AF37] hover:bg-white text-[#0A192F] rounded-xl text-sm font-bold shadow-md transition-colors"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
