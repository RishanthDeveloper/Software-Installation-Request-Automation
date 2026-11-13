import { useEffect, useState } from 'react';
import { useApi } from '../useApi.js';
import { STATUS_LABELS } from '../format.js';
import RequestTable from '../components/RequestTable.jsx';
import { ErrorMessage, LoadingRows } from '../components/Feedback.jsx';
import { Field } from '../components/Field.jsx';

export default function AllRequests() {
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');

  // search once typing pauses
  useEffect(() => {
    const t = setTimeout(() => setQuery(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  const params = new URLSearchParams({ view: 'all' });
  if (status) params.set('status', status);
  if (query) params.set('q', query);
  const { data, error, loading, reload } = useApi(`/requests?${params}`);

  return (
    <>
      <div className="page-head">
        <div>
          <h1>All requests</h1>
          <p>Every department. Search by software or by the person who asked.</p>
        </div>
      </div>
      <div className="toolbar">
        <Field id="search" label="Search">
          <input className="input" type="search" value={search} onChange={(e) => setSearch(e.target.value)} />
        </Field>
        <Field id="status" label="Status">
          <select className="select" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All</option>
            {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </Field>
      </div>

      <ErrorMessage error={error} onRetry={reload} />
      {loading && !data && <LoadingRows />}
      {data && data.requests.length === 0 && <div className="empty"><p>No requests match.</p></div>}
      {data && data.requests.length > 0 && (
        <>
          <p className="count">{data.requests.length} {data.requests.length === 1 ? 'request' : 'requests'}</p>
          <RequestTable requests={data.requests} show={{ requester: true, department: true, assignee: true, updated: true }} />
        </>
      )}
    </>
  );
}
