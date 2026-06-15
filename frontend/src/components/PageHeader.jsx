import React from 'react';
import { Link } from 'react-router-dom';

export default function PageHeader({ title, subtitle, breadcrumbs, actions }) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
      <div>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="flex items-center gap-2 text-body-sm text-text-muted mb-2">
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={index}>
                {crumb.path ? (
                  <Link to={crumb.path} className="hover:text-accent transition-colors hover:underline">
                    {crumb.label}
                  </Link>
                ) : (
                  <span>{crumb.label}</span>
                )}
                {index < breadcrumbs.length - 1 && (
                  <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}
        <h1 className="text-headline-lg font-bold text-accent">{title}</h1>
        {subtitle && <p className="text-body-md text-text-muted mt-1">{subtitle}</p>}
      </div>
      {actions && (
        <div className="flex flex-wrap gap-3 mt-2 md:mt-0">
          {actions}
        </div>
      )}
    </div>
  );
}
