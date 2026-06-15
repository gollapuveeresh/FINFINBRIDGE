import React from 'react';

export default function DataTable({ title, headers, actions, children }) {
  return (
    <div className="card overflow-hidden">
      {(title || actions) && (
        <div className="px-8 py-5 border-b border-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          {title && <h2 className="text-headline-md font-bold text-accent">{title}</h2>}
          {actions && <div className="flex flex-wrap gap-3 w-full sm:w-auto">{actions}</div>}
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-surface text-label-lg text-text-muted uppercase tracking-wider border-b border-border">
              {headers.map((h, index) => {
                const label = typeof h === 'string' ? h : h.label;
                const align = typeof h === 'object' && h.align ? h.align : 'left';
                const className = align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left';
                return (
                  <th key={index} className={`px-6 py-4 ${className} font-bold`}>
                    {label}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {children}
          </tbody>
        </table>
      </div>
    </div>
  );
}
