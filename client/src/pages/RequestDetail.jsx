import { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api.js';
import { useApi } from '../useApi.js';
import { useAuth } from '../auth.jsx';
import { ROLE_LABELS, STATUS_LABELS, URGENCY_LABELS, formatDate, formatDateTime, requestNumber } from '../format.js';
import StatusBadge from '../components/StatusBadge.jsx';
import StageTrack from '../components/StageTrack.jsx';
import { ErrorMessage, LoadingRows, Notice } from '../components/Feedback.jsx';
import { Field } from '../components/Field.jsx';

const EVENT_TEXT = {
  submit: 'sent the request',
  manager_approve: 'approved as manager',
  manager_reject: 'rejected as manager',
  it_approve: 'approved it for installation',
  it_reject: 'rejected it at the IT check',
  assign: 'handed the installation over',
  mark_installed: 'marked it installed',
  close: 'closed the request',
  cancel: 'cancelled the request',
};

const DONE_TEXT = {
  manager_approve: 'Approved. It now waits for IT.',
  manager_reject: 'Rejected. The requester can see your reason.',
  it_approve: 'Approved. The installation is in the queue.',
  it_reject: 'Rejected. The requester can see your reason.',
  assign: 'Installation handed over.',
  mark_installed: 'Marked installed. The requester can now close it.',
  close: 'Request closed.',
  cancel: 'Request cancelled.',
};

function ActionCard({ data, onDone }) {
  const { allowedActions: actions, technicians } = data;
  const { user } = useAuth();
  const [note, setNote] = useState('');
  const [assigneeId, setAssigneeId] = useState(String(user.id));
  const [rejecting, setRejecting] = useState(false);
  const [noteError, setNoteError] = useState('');
  const [failure, setFailure] = useState(null);
  const [busy, setBusy] = useState(false);

  if (actions.length === 0) return null;

  const can = (a) => actions.includes(a);
  const approveAction = can('manager_approve') ? 'manager_approve' : can('it_approve') ? 'it_approve' : null;
  const rejectAction = can('manager_reject') ? 'manager_reject' : can('it_reject') ? 'it_reject' : null;

  async function run(action, extra = {}, needsNote = '') {
    if (needsNote && !note.trim()) {
      setNoteError(needsNote);
      document.getElementById('note')?.focus();
      return;
    }
    if (action === 'cancel' && !window.confirm('Cancel this request? You can send a new one later.')) return;
    setBusy(true);
    setFailure(null);
    setNoteError('');
    try {
      await api(`/requests/${data.request.id}/actions`, { method: 'POST', body: { action, note, ...extra } });
      setNote('');
      setRejecting(false);
      onDone(DONE_TEXT[action]);
    } catch (err) {
      setFailure(err);
    } finally {
      setBusy(false);
    }
  }

  const technicianSelect = (id, label) => (
    <Field id={id} label={label}>
      <select className="select" value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)}>
        {technicians.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
      </select>
    </Field>
  );

  const noteField = (label, hint) => (
    <Field id="note" label={label} hint={hint} error={noteError}>
      <textarea className="textarea" rows={3} maxLength={1000} value={note} onChange={(e) => setNote(e.target.value)} />
    </Field>
  );

  return (
    <section className="card action-card" aria-labelledby="action-h">
      <h2 id="action-h">Your step</h2>
      {failure && <Notice tone="error">{failure.message}</Notice>}
      <div className="form">
        {approveAction && !rejecting && (
          <>
            {noteField(<>Comment <span className="optional">(optional)</span></>)}
            {approveAction === 'it_approve' && technicianSelect('assignee', 'Who installs it')}
            <div className="btn-row">
              <button type="button" className="btn btn--primary" disabled={busy}
                onClick={() => run(approveAction, approveAction === 'it_approve' ? { assigneeId: Number(assigneeId) } : {})}>
                Approve
              </button>
              <button type="button" className="btn btn--secondary" disabled={busy}
                onClick={() => { setRejecting(true); setNoteError(''); }}>
                Reject
              </button>
            </div>
          </>
        )}

        {rejectAction && rejecting && (
          <>
            {noteField('Reason for rejecting', 'The requester sees this, so say what they can do instead.')}
            <div className="btn-row">
              <button type="button" className="btn btn--primary" disabled={busy}
                onClick={() => run(rejectAction, {}, 'Write the reason before rejecting.')}>
                Reject request
              </button>
              <button type="button" className="btn btn--secondary" onClick={() => setRejecting(false)}>Don’t reject</button>
            </div>
          </>
        )}

        {can('mark_installed') && (
          <>
            {noteField('Installation notes', 'The version installed, how, and the license reference.')}
            <div className="btn-row">
              <button type="button" className="btn btn--primary" disabled={busy}
                onClick={() => run('mark_installed', {}, 'Add installation notes first.')}>
                Mark installed
              </button>
            </div>
          </>
        )}

        {can('assign') && technicians.length > 1 && (
          <div className="split form">
            {technicianSelect('reassign', 'Hand over to')}
            <div className="btn-row">
              <button type="button" className="btn btn--secondary" disabled={busy}
                onClick={() => run('assign', { assigneeId: Number(assigneeId) })}>
                Hand over
              </button>
            </div>
          </div>
        )}

        {can('close') && (
          <>
            <p>If the software works on your computer, close the request.</p>
            <div className="btn-row">
              <button type="button" className="btn btn--primary" disabled={busy} onClick={() => run('close')}>Close request</button>
            </div>
          </>
        )}

        {can('cancel') && (
          <div className={approveAction || can('close') ? 'split' : undefined}>
            <button type="button" className="btn btn--secondary" disabled={busy} onClick={() => run('cancel')}>
              Cancel request
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

export default function RequestDetail() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { data, error, loading, reload } = useApi(`/requests/${id}`);
  const [message, setMessage] = useState(
    location.state?.justCreated ? 'Request sent. Your manager has been asked to approve it.' : '',
  );

  if (loading && !data) return <LoadingRows rows={6} />;
  if (error) {
    return (
      <>
        <button type="button" className="back text-button" onClick={() => navigate(-1)}>Back</button>
        <ErrorMessage error={error} onRetry={error.status === 404 ? undefined : reload} />
      </>
    );
  }

  const r = data.request;

  return (
    <>
      <button type="button" className="back text-button" onClick={() => navigate(-1)}>Back</button>
      <div className="detail-head">
        <div>
          <span className="mono muted">{requestNumber(r.id)}</span>
          <h1>{r.softwareName}{r.version ? <span className="muted"> {r.version}</span> : null}</h1>
          <p className="muted">Sent by {r.requesterName}, {formatDateTime(r.createdAt)}</p>
        </div>
        <StatusBadge status={r.status} large />
      </div>

      {message && <Notice tone="success">{message}</Notice>}
      {r.status === 'rejected' && <Notice tone="error">Rejected: {r.rejectionReason}</Notice>}

      <StageTrack request={r} />

      <div className="detail-grid">
        <section className="card" aria-labelledby="details-h">
          <h2 id="details-h">Details</h2>
          <dl className="rows">
            <div><dt>Requested by</dt><dd>{r.requesterName}<span className="muted">, {r.requesterEmail}</span></dd></div>
            <div><dt>Department</dt><dd>{r.departmentName}</dd></div>
            <div><dt>Software</dt><dd>{r.softwareName} by {r.softwareVendor}{r.requiresLicense ? ', paid license' : ''}</dd></div>
            <div><dt>Computer</dt><dd className="mono">{r.deviceTag}</dd></div>
            <div><dt>Urgency</dt><dd>{URGENCY_LABELS[r.urgency]}, target {r.slaHours} hours</dd></div>
            {r.neededBy && <div><dt>Needed by</dt><dd>{formatDate(r.neededBy)}</dd></div>}
            {r.dueAt && (
              <div><dt>Due</dt><dd className={r.overdue ? 'late' : undefined}>{formatDateTime(r.dueAt)}{r.overdue ? ', missed' : ''}</dd></div>
            )}
            {r.assigneeName && <div><dt>{r.installedAt ? 'Installed by' : 'Assigned to'}</dt><dd>{r.assigneeName}</dd></div>}
            {r.installNotes && <div><dt>Installation notes</dt><dd className="prewrap">{r.installNotes}</dd></div>}
          </dl>
          <div className="reason">
            <h3>What it is for</h3>
            <p className="prewrap">{r.justification}</p>
          </div>
        </section>

        <div>
          <ActionCard data={data} onDone={(text) => { setMessage(text); reload(); }} />
          <section className="card" aria-labelledby="history-h">
            <h2 id="history-h">History</h2>
            <ol className="history">
              {data.events.map((e) => (
                <li key={e.id}>
                  <span>
                    <strong>{e.actorName}</strong>
                    <span className="muted"> ({ROLE_LABELS[e.actorRole]})</span> {EVENT_TEXT[e.action] ?? e.action}
                  </span>
                  {e.note && <p className="note prewrap">{e.note}</p>}
                  <time dateTime={e.createdAt}>
                    {formatDateTime(e.createdAt)}
                    {e.toStatus !== e.fromStatus && `. ${STATUS_LABELS[e.toStatus]}`}
                  </time>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </div>
    </>
  );
}
