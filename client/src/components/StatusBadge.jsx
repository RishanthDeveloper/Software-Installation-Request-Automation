import { STATUS_LABELS } from '../format.js';

export default function StatusBadge({ status, large }) {
  return (
    <span className={`status status--${status}${large ? ' status--lg' : ''}`}>
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}
