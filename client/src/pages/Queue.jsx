import { useState } from 'react';
import { useApi } from '../useApi.js';
import { useAuth } from '../auth.jsx';
import RequestTable from '../components/RequestTable.jsx';
import Tabs from '../components/Tabs.jsx';
import { ErrorMessage, LoadingRows } from '../components/Feedback.jsx';

const STAGES = [
  { value: 'pending_it', label: 'To approve', empty: 'No requests are waiting for the IT check.' },
  { value: 'in_progress', label: 'To install', empty: 'Nothing to install right now.' },
  { value: 'installed', label: 'Installed', empty: 'No installs are waiting for the requester to close them.' },
];

export default function Queue() {
  const { user } = useAuth();
  const [stage, setStage] = useState('pending_it');
  const [mineOnly, setMineOnly] = useState(false);
  const { data, error, loading, reload } = useApi('/requests?view=queue');

  const all = (data?.requests ?? []).filter((r) => !mineOnly || r.assignedTo === user.id);
  const rows = all.filter((r) => r.status === stage);
  const late = all.filter((r) => r.overdue && r.status !== 'installed').length;
  const current = STAGES.find((s) => s.value === stage);

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Install queue</h1>
          <p>
            Approved by managers and waiting on IT.
            {late > 0 && <span className="late"> {late} past their target time.</span>}
          </p>
        </div>
        <button type="button" className="btn btn--secondary" onClick={reload}>Refresh</button>
      </div>

      <div className="toolbar">
        <Tabs
          label="Queue stage"
          value={stage}
          onChange={setStage}
          tabs={STAGES.map((s) => ({ ...s, count: data ? all.filter((r) => r.status === s.value).length : undefined }))}
        />
        <label className="check" style={{ marginBottom: 'var(--s-5)' }}>
          <input type="checkbox" checked={mineOnly} onChange={(e) => setMineOnly(e.target.checked)} />
          Only mine
        </label>
      </div>

      <ErrorMessage error={error} onRetry={reload} />
      {loading && !data && <LoadingRows />}
      {data && rows.length === 0 && <div className="empty"><p>{current.empty}</p></div>}
      {rows.length > 0 && (
        <RequestTable requests={rows} show={{ requester: true, department: true, assignee: stage !== 'pending_it', due: true }} />
      )}
    </>
  );
}
