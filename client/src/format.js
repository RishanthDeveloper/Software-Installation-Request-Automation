export const STATUS_LABELS = {
  pending_manager: 'Waiting for manager',
  pending_it: 'Waiting for IT',
  in_progress: 'Installing',
  installed: 'Installed',
  closed: 'Closed',
  rejected: 'Rejected',
  cancelled: 'Cancelled',
};

export const URGENCY_LABELS = { low: 'Low', normal: 'Normal', high: 'High' };

export const ROLE_LABELS = {
  employee: 'Employee',
  manager: 'Manager',
  it_support: 'IT support',
  admin: 'Admin',
};

export const requestNumber = (id) => `SR-${String(id).padStart(5, '0')}`;

const dateFormat = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
const dateTimeFormat = new Intl.DateTimeFormat('en-IN', {
  day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit',
});

export const formatDate = (value) => (value ? dateFormat.format(new Date(value)) : '');
export const formatDateTime = (value) => (value ? dateTimeFormat.format(new Date(value)) : '');

export function formatHours(hours) {
  if (hours === null || hours === undefined) return 'No data yet';
  if (hours < 1 / 60) return 'Under 1 min';
  if (hours < 1) return `${Math.round(hours * 60)} min`;
  if (hours < 48) return `${hours.toFixed(1)} h`;
  return `${(hours / 24).toFixed(1)} days`;
}

export function timeAgo(value) {
  const minutes = Math.round((Date.now() - new Date(value).getTime()) / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
}
