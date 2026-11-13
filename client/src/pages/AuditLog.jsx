import { useApi } from '../useApi.js';
import { formatDateTime } from '../format.js';
import { ErrorMessage, LoadingRows } from '../components/Feedback.jsx';

const ACTION_TEXT = {
  'user.registered': 'Account created',
  'user.updated': 'User changed',
  'software.created': 'Software added',
  'software.updated': 'Software changed',
};

function describe(details) {
  if (!details) return '';
  const changes = details.changes ?? details;
  return Object.entries(changes).map(([key, value]) => `${key}: ${value === null ? 'none' : value}`).join(', ');
}

export default function AuditLog() {
  const { data, error, loading, reload } = useApi('/admin/audit');

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Audit log</h1>
          <p>Account and catalog changes. Decisions on requests are kept in each request’s history.</p>
        </div>
      </div>
      <ErrorMessage error={error} onRetry={reload} />
      {loading && !data && <LoadingRows />}
      {data && data.entries.length === 0 && <div className="empty"><p>No changes yet.</p></div>}
      {data && data.entries.length > 0 && (
        <div className="table-card">
          <div className="table-scroll">
            <table className="table table--stack">
              <thead><tr><th scope="col">When</th><th scope="col">Who</th><th scope="col">What</th><th scope="col">Record</th><th scope="col">Details</th></tr></thead>
              <tbody>
                {data.entries.map((e) => (
                  <tr key={e.id}>
                    <td data-label="When" className="mono">{formatDateTime(e.createdAt)}</td>
                    <td data-label="Who">{e.actorName ?? 'System'}</td>
                    <td data-label="What">{ACTION_TEXT[e.action] ?? e.action}</td>
                    <td data-label="Record" className="mono">{e.target}</td>
                    <td data-label="Details" className="muted">{describe(e.details)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
