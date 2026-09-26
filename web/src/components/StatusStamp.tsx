import React from 'react';

type StatusType = 'Requested' | 'Manager Approval' | 'IT Approval' | 'In Progress' | 'Installed' | 'Closed' | 'Rejected';

export const StatusStamp: React.FC<{ status: StatusType | string, className?: string }> = ({ status, className = '' }) => {
  let label = 'HOLD';
  let colorClass = 'held';

  switch (status) {
    case 'Installed':
    case 'Closed':
      label = 'CLEARED';
      colorClass = 'cleared';
      break;
    case 'In Progress':
      label = 'IN TRANSIT';
      colorClass = 'transit'; // Actually it says brand color for transit? "IN TRANSIT (= in progress)... keep underlying state same". I'll use brand color.
      break;
    case 'Rejected':
      label = 'DENIED';
      colorClass = 'denied';
      break;
    case 'Requested':
    case 'Manager Approval':
    case 'IT Approval':
    default:
      label = 'HOLD';
      colorClass = 'held';
      break;
  }

  return (
    <span className={`status-stamp ${colorClass} ${className}`}>
      {label}
    </span>
  );
};
