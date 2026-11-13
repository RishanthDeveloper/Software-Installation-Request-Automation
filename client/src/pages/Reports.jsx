import { useApi } from '../useApi.js';
import { formatHours } from '../format.js';
import { ErrorMessage, LoadingRows } from '../components/Feedback.jsx';

const monthName = new Intl.DateTimeFormat('en-IN', { month: 'short', year: 'numeric' });

function Bars({ rows, labelKey = 'name' }) {
  const max = Math.max(1, ...rows.map((r) => r.requests));
  return (
    <ul className="bars">
      {rows.map((row) => (
        <li key={row[labelKey]}>
          <span className="name">{row.displayLabel ?? row[labelKey]}</span>
          <span className="track-bar"><span className="fill" style={{ width: `${(row.requests / max) * 100}%` }} /></span>
          <span className="val">{row.requests}</span>
        </li>
      ))}
    </ul>
  );
}

export default function Reports() {
  const { data, error, loading, reload } = useApi('/stats');

  if (loading && !data) return <><h1>Reports</h1><LoadingRows rows={6} /></>;
  if (error) return <><h1>Reports</h1><ErrorMessage error={error} onRetry={reload} /></>;

  const { totals, averageHours, sla, topSoftware, byMonth, byDepartment } = data;
  const months = byMonth.map((m) => ({ ...m, displayLabel: monthName.format(new Date(`${m.month}-01T00:00:00`)) }));
  const figures = [
    ['All requests', totals.all],
    ['With managers', totals.waitingForManager],
    ['With IT', totals.waitingForIT],
    ['Installing', totals.installing],
    ['Installed', totals.completed],
    ['Rejected', totals.rejected],
  ];

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Reports <span className="muted">for {data.scope.toLowerCase() === 'all departments' ? 'all departments' : data.scope}</span></h1>
          <p>Worked out from each request’s timestamps every time this page loads.</p>
        </div>
        <button type="button" className="btn btn--secondary" onClick={reload}>Refresh</button>
      </div>

      <dl className="figures">
        {figures.map(([label, value]) => (
          <div className="figure" key={label}>
            <dt className="label">{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>

      {totals.all === 0 ? (
        <div className="empty"><p>No requests yet. These reports fill in as people send and approve them.</p></div>
      ) : (
        <div className="report-grid">
          <section className="card" aria-labelledby="sla-h">
            <h2 id="sla-h">Installed on time</h2>
            <p className="big">{sla.compliancePercent === null ? 'No installs yet' : `${sla.compliancePercent}%`}</p>
            <p>
              {sla.finished > 0
                ? `${sla.met} of ${sla.finished} installs finished inside their target.`
                : 'This appears once the first install is done.'}
              {' '}
              <span className={sla.overdueOpen ? 'late' : undefined}>
                {sla.overdueOpen === 0 ? 'No open request is late.' : `${sla.overdueOpen} open ${sla.overdueOpen === 1 ? 'request is' : 'requests are'} late now.`}
              </span>
            </p>
            <p className="field__hint" style={{ marginTop: 'var(--s-3)' }}>
              Targets from sending to installed: {sla.targets.map((t) => `${t.urgency} ${t.hours} hours`).join(', ')}.
            </p>
          </section>

          <section className="card" aria-labelledby="avg-h">
            <h2 id="avg-h">Average time per step</h2>
            <dl className="rows">
              <div><dt>Manager decision</dt><dd>{formatHours(averageHours.managerDecision)}</dd></div>
              <div><dt>IT decision</dt><dd>{formatHours(averageHours.itDecision)}</dd></div>
              <div><dt>Installation</dt><dd>{formatHours(averageHours.installation)}</dd></div>
              <div><dt>Sent to installed</dt><dd>{formatHours(averageHours.submitToInstalled)}</dd></div>
            </dl>
          </section>

          <section className="card" aria-labelledby="top-h">
            <h2 id="top-h">Most requested</h2>
            <Bars rows={topSoftware} />
          </section>

          <section className="card" aria-labelledby="month-h">
            <h2 id="month-h">Requests per month</h2>
            <Bars rows={months} labelKey="month" />
          </section>

          {byDepartment.length > 1 && (
            <section className="card" aria-labelledby="dept-h">
              <h2 id="dept-h">By department</h2>
              <Bars rows={byDepartment} />
            </section>
          )}
        </div>
      )}
    </>
  );
}
