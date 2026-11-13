import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApi } from '../useApi.js';
import { STATUS_LABELS } from '../format.js';
import RequestTable from '../components/RequestTable.jsx';
import { ErrorMessage, LoadingRows } from '../components/Feedback.jsx';
import { Field } from '../components/Field.jsx';

export default function MyRequests() {
  const [status, setStatus] = useState('');
  const { data, error, loading, reload } = useApi(`/requests?view=mine${status ? `&status=${status}` : ''}`);
  const open = data?.requests.filter((r) => ['pending_manager', 'pending_it', 'in_progress', 'installed'].includes(r.status)).length;

  return (
    <>
      <div className="page-head">
        <div>
          <h1>My requests</h1>
          {data && !status && data.requests.length > 0 && (
            <p>{open === 0 ? 'Nothing is open right now.' : `${open} open, waiting on someone else.`}</p>
          )}
        </div>
        {data && data.requests.length > 0 && <Link to="/requests/new" className="btn btn--primary btn--go">Request software</Link>}
      </div>

      <div className="toolbar">
        <Field id="status-filter" label="Status">
          <select className="select" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All</option>
            {Object.entries(STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </Field>
      </div>

      <ErrorMessage error={error} onRetry={reload} />
      {loading && !data && <LoadingRows />}
      {data && data.requests.length === 0 && (
        <div className="empty">
          {status ? (
            <p>None of your requests are {STATUS_LABELS[status].toLowerCase()}.</p>
          ) : (
            <>
              <p>You haven’t asked for any software yet.</p>
              <p><Link to="/requests/new" className="btn btn--primary btn--go">Request software</Link></p>
            </>
          )}
        </div>
      )}
      {data && data.requests.length > 0 && <RequestTable requests={data.requests} show={{ updated: true }} />}
    </>
  );
}
