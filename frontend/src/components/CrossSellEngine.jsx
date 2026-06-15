import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

// Map existing services to cross-sell suggestions
const CROSS_SELL_MAP = {
  loans: [
    { icon: 'health_and_safety', title: 'Home Insurance', desc: 'Protect your property with comprehensive cover.', path: '/client/consultations', dept: 'insurance' },
    { icon: 'calculate', title: 'Tax Planning', desc: 'Optimize home loan deductions under Section 80C.', path: '/client/tax-planning', dept: 'tax' },
    { icon: 'trending_up', title: 'SIP Investment', desc: 'Build wealth alongside your EMI commitment.', path: '/client/investments', dept: 'investment' },
  ],
  investment: [
    { icon: 'account_balance', title: 'Wealth Management', desc: 'Graduate to a full portfolio strategy.', path: '/client/consultations', dept: 'wealth' },
    { icon: 'calculate', title: 'Tax-Saving Funds', desc: 'ELSS funds for 80C deductions.', path: '/client/tax-planning', dept: 'tax' },
    { icon: 'health_and_safety', title: 'Life Insurance', desc: 'Secure your investment legacy.', path: '/client/consultations', dept: 'insurance' },
  ],
  tax: [
    { icon: 'trending_up', title: 'Tax-Saving SIP', desc: 'Invest in ELSS to reduce your tax burden.', path: '/client/investments', dept: 'investment' },
    { icon: 'account_balance', title: 'Retirement Planning', desc: 'NPS contributions for additional deductions.', path: '/client/consultations', dept: 'wealth' },
  ],
  insurance: [
    { icon: 'trending_up', title: 'Investment Advisory', desc: 'Grow surplus premium savings.', path: '/client/investments', dept: 'investment' },
    { icon: 'calculate', title: 'Tax on Premiums', desc: 'Claim Section 80D deductions.', path: '/client/tax-planning', dept: 'tax' },
  ],
  wealth: [
    { icon: 'health_and_safety', title: 'Estate Protection', desc: 'Life cover to protect your estate.', path: '/client/consultations', dept: 'insurance' },
    { icon: 'calculate', title: 'HNI Tax Planning', desc: 'Advanced tax strategies for high income.', path: '/client/tax-planning', dept: 'tax' },
  ],
};

export default function CrossSellEngine() {
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    // Determine suggestions based on client's active services
    const detectServices = async () => {
      const found = new Set();
      try {
        const loans = await api.get('/loans');
        if (loans.data?.loans?.length > 0) found.add('loans');
      } catch {}
      try {
        const inv = await api.get('/investments');
        if (inv.data?.investments?.length > 0) found.add('investment');
      } catch {}

      const all = [];
      found.forEach(svc => {
        (CROSS_SELL_MAP[svc] || []).forEach(s => {
          if (!found.has(s.dept) && !all.find(a => a.title === s.title)) {
            all.push(s);
          }
        });
      });

      // Default suggestions if no services detected
      if (all.length === 0) {
        all.push(...CROSS_SELL_MAP.loans);
      }

      setSuggestions(all.slice(0, 3));
    };
    detectServices();
  }, []);

  if (suggestions.length === 0) return null;

  return (
    <div className="card p-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="material-symbols-outlined text-secondary">auto_awesome</span>
        <h3 className="font-bold text-accent">Recommended for You</h3>
        <span className="text-xs px-2 py-0.5 rounded-full bg-secondary/10 text-secondary font-semibold">Cross-Sell</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {suggestions.map((s, i) => (
          <Link key={i} to={s.path}
            className="p-4 rounded-2xl border border-border hover:border-secondary/40 bg-surface/50 hover:bg-surface transition-all group">
            <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center mb-3 group-hover:bg-secondary/20 transition-colors">
              <span className="material-symbols-outlined text-secondary">{s.icon}</span>
            </div>
            <p className="font-semibold text-accent text-sm">{s.title}</p>
            <p className="text-xs text-text-muted mt-1">{s.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
