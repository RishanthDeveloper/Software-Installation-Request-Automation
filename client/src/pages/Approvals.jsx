import { useApi } from '../useApi.js';
import { useAuth } from '../auth.jsx';
import RequestTable from '../components/RequestTable.jsx';
import { ErrorMessage, LoadingRows } from '../components/Feedback.jsx';

export default function Approvals() {
  const { user } = useAuth();
  const { data, error, loading, reload } = useApi('/requests?view=approvals');
  const count = data?.requests.length ?? 0;
  const scope = user.role === 'admin' ? 'every department' : user.departmentName;

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Approvals <span className="muted">for {scope}</span></h1>
          <p>Requests waiting for a manager. Open one to approve it, or reject it with a reason.</p>
        </div>
      </div>

      <ErrorMessage error={error} onRetry={reload} />
      {loading && !data && <LoadingRows />}
      {data && count === 0 && <div className="empty"><p>Nothing is waiting for you.</p></div>}
      {count > 0 && (
        <>
          <p className="count">{count} waiting</p>
          <RequestTable requests={data.requests} show={{ requester: true, department: user.role === 'admin', due: true }} />
        </>
      )}
    </>
  );
}
