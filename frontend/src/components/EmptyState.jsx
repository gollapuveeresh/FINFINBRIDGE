import React from 'react';

export default function EmptyState({ icon = 'folder_open', title = 'No Data Found', description = 'There are no records to display at this moment.', action }) {
  return (
    <div className="card p-16 flex flex-col items-center text-center">
      <div className="relative mb-6">
        <div className="w-24 h-24 bg-surface rounded-3xl flex items-center justify-center border border-border/50 shadow-sm">
          <span className="material-symbols-outlined text-5xl text-text-faint-variant">{icon}</span>
        </div>
      </div>
      <h3 className="text-headline-md font-bold text-accent mb-2">{title}</h3>
      <p className="text-body-md text-text-muted max-w-md mb-6">{description}</p>
      {action && (
        <div className="flex justify-center mt-2">
          {action}
        </div>
      )}
    </div>
  );
}
