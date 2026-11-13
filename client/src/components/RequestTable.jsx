import { Link, useNavigate } from 'react-router-dom';
import StatusBadge from './StatusBadge.jsx';
import { URGENCY_LABELS, formatDate, requestNumber, timeAgo } from '../format.js';

// One table for every request list. Columns are switched on per page. On a phone each
// row becomes a stacked block with its labels.
export default function RequestTable({ requests, show = {} }) {
  const navigate = useNavigate();

  return (
    <div className="table-card">
      <div className="table-scroll">
        <table className="table table--stack">
          <thead>
            <tr>
              <th scope="col">Request</th>
              <th scope="col">Software</th>
              {show.requester && <th scope="col">Requested by</th>}
              <th scope="col">Status</th>
              <th scope="col">Urgency</th>
              {show.assignee && <th scope="col">Assigned to</th>}
              <th scope="col">Submitted</th>
              {show.due && <th scope="col">Due</th>}
              {show.updated && <th scope="col">Last update</th>}
            </tr>
          </thead>
          <tbody>
            {requests.map((r) => {
              const late = r.overdue && !['installed', 'closed'].includes(r.status);
              return (
                <tr key={r.id} className="is-linked" onClick={(e) => {
                  if (!e.target.closest('a')) navigate(`/requests/${r.id}`);
                }}>
                  <td className="id" data-label="Request">
                    <Link to={`/requests/${r.id}`}>{requestNumber(r.id)}</Link>
                  </td>
                  <td data-label="Software">
                    <span>
                      {r.softwareName}
                      {r.version && <span className="muted"> {r.version}</span>}
                    </span>
                  </td>
                  {show.requester && (
                    <td data-label="Requested by">
                      <span>{r.requesterName}{show.department && <span className="sub">{r.departmentName}</span>}</span>
                    </td>
                  )}
                  <td data-label="Status"><StatusBadge status={r.status} /></td>
                  <td data-label="Urgency" className={r.urgency === 'high' ? 'high' : undefined}>{URGENCY_LABELS[r.urgency]}</td>
                  {show.assignee && (
                    <td data-label="Assigned to">{r.assigneeName || <span className="muted">Nobody yet</span>}</td>
                  )}
                  <td data-label="Submitted">{formatDate(r.createdAt)}</td>
                  {show.due && (
                    <td data-label="Due" className={late ? 'late' : undefined}>
                      {r.dueAt ? formatDate(r.dueAt) : ''}{late ? ', late' : ''}
                    </td>
                  )}
                  {show.updated && <td data-label="Last update">{timeAgo(r.updatedAt)}</td>}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
