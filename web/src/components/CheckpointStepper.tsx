import React from 'react';

const STEPS = [
  'REQUESTED',
  'MANAGER',
  'IT',
  'INSTALL',
  'CLEARED'
];

const getStepIndex = (status: string): number => {
  switch (status) {
    case 'Requested': return 0;
    case 'Manager Approval': return 1;
    case 'IT Approval': return 2;
    case 'In Progress': return 3;
    case 'Installed':
    case 'Closed': return 4;
    case 'Rejected': return -1;
    default: return 0;
  }
};

export const CheckpointStepper: React.FC<{ currentStatus: string, isRestricted?: boolean }> = ({ currentStatus }) => {
  const currentIndex = getStepIndex(currentStatus);
  const isDenied = currentIndex === -1;

  return (
    <div className="flex items-center w-full my-6 overflow-x-auto relative">
      <div className="absolute top-1/2 left-0 right-0 h-[1.5px] bg-line -z-10 translate-y-[-50%]"></div>
      
      {STEPS.map((label, idx) => {
        const isPast = idx < currentIndex;
        const isCurrent = idx === currentIndex && !isDenied;
        
        let nodeClass = "w-3 h-3 bg-surface border-[1.5px] border-line rounded-none z-10 transition-colors duration-400 ease-out";
        if (isPast || (idx === currentIndex && currentStatus === 'Closed')) {
          nodeClass = "w-3 h-3 bg-brand border-[1.5px] border-brand rounded-none z-10 transition-colors duration-400 ease-out";
        } else if (isCurrent) {
          nodeClass = "w-3 h-3 bg-surface border-[2px] border-held rounded-none z-10 ring-2 ring-held transition-colors duration-400 ease-out";
        }

        return (
          <div key={label} className="flex-1 flex flex-col items-center gap-2 group">
            <div className={nodeClass}></div>
            <div className={`mono-label text-[10px] ${isPast || isCurrent ? 'text-ink' : 'text-muted'}`}>{label}</div>
          </div>
        );
      })}
    </div>
  );
};
