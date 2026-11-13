import { formatDateTime } from '../format.js';

// Where a request is in the approval process, with the time each step finished.
export function stagesFor(request) {
  const { status } = request;
  const rejectedAtManager = status === 'rejected' && !request.itDecidedAt;
  const rejectedAtIT = status === 'rejected' && Boolean(request.itDecidedAt);
  const stopped = status === 'rejected' || status === 'cancelled';

  const stages = [
    { key: 'submitted', label: 'Submitted', at: request.createdAt, done: true },
    {
      key: 'manager', label: rejectedAtManager ? 'Rejected by manager' : 'Manager',
      at: request.managerDecidedAt, done: Boolean(request.managerDecidedAt) && !rejectedAtManager,
      failed: rejectedAtManager, current: status === 'pending_manager',
    },
    {
      key: 'it', label: rejectedAtIT ? 'Rejected by IT' : 'IT approval',
      at: request.itDecidedAt, done: Boolean(request.itDecidedAt) && !rejectedAtIT,
      failed: rejectedAtIT, current: status === 'pending_it',
    },
    { key: 'installed', label: 'Installed', at: request.installedAt, done: Boolean(request.installedAt), current: status === 'in_progress' },
    { key: 'closed', label: 'Closed', at: request.closedAt, done: Boolean(request.closedAt), current: status === 'installed' },
  ];

  return stages.map((stage) => {
    let state = 'upcoming';
    if (stage.failed) state = 'failed';
    else if (stage.done) state = 'done';
    else if (stage.current) state = status === 'cancelled' ? 'stopped' : 'current';
    else if (stopped) state = 'skipped';
    return { ...stage, state };
  });
}

export default function StageTrack({ request }) {
  return (
    <ol className="track" aria-label="Progress">
      {stagesFor(request).map((stage) => (
        <li key={stage.key} className={`track__step is-${stage.state}`}>
          <span className="track__dot" aria-hidden="true" />
          <span className="track__name">{stage.label}</span>
          <span className="track__time">
            {stage.at
              ? formatDateTime(stage.at)
              : stage.state === 'current' ? 'Now' : stage.state === 'stopped' ? 'Cancelled' : ''}
          </span>
        </li>
      ))}
    </ol>
  );
}
