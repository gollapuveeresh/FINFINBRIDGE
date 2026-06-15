import React from 'react';

export default function StatusBadge({ status, type }) {
  // Map raw status strings to their css classes if type is not provided
  let badgeClass = 'status-info';
  
  if (type) {
    if (type === 'success') badgeClass = 'status-success';
    else if (type === 'warning') badgeClass = 'status-warning';
    else if (type === 'error') badgeClass = 'status-error';
    else if (type === 'info') badgeClass = 'status-info';
  } else {
    const s = String(status).toLowerCase();
    if (['active', 'approved', 'completed', 'paid', 'success', 'verified', 'high', 'yes', 'on'].includes(s)) {
      badgeClass = 'status-success';
    } else if (['pending', 'closing soon', 'warning', 'in progress', 'review', 'medium', 'rescheduled'].includes(s)) {
      badgeClass = 'status-warning';
    } else if (['closed', 'inactive', 'off', 'low', 'processing', 'scheduled'].includes(s)) {
      badgeClass = 'status-info';
    } else if (['overdue', 'rejected', 'failed', 'error', 'cancelled', 'critical'].includes(s)) {
      badgeClass = 'status-error';
    }
  }

  return (
    <span className={`status-badge ${badgeClass} inline-block whitespace-nowrap`}>
      {status}
    </span>
  );
}
