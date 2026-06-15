import React from 'react';

export default function KPICard({ label, value, sub, icon, change, positive, color, bg }) {
  // Extract or default colors
  const finalColor = color || 'text-accent';
  const finalBg = bg || 'bg-accent/10';

  return (
    <div className="card p-6 flex items-center gap-5">
      <div className={`p-3 rounded-xl ${finalBg}`}>
        <span className={`material-symbols-outlined ${finalColor}`}>{icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-text-muted text-label-lg truncate">{label}</p>
        <div className="flex items-baseline gap-2 mt-0.5">
          <p className="text-headline-md font-serif font-bold text-accent truncate">{value}</p>
          {change !== undefined && (
            <span className={`text-label-md font-bold flex items-center shrink-0 ${positive ? 'text-success' : 'text-error'}`}>
              <span className="material-symbols-outlined text-[14px]">
                {positive ? 'arrow_upward' : 'arrow_downward'}
              </span>
              {change}
            </span>
          )}
        </div>
        {sub && <p className="text-body-sm text-text-muted/80 mt-1 truncate">{sub}</p>}
      </div>
    </div>
  );
}
