import { Router } from 'express';
import { requireRole } from '../auth.js';
import { visibilityClause } from '../workflow.js';

const hours = (value) => (value === null || value === undefined ? null : Math.round(value * 10) / 10);

// All numbers are calculated from the stored timestamps. Managers see their department,
// IT support sees what has reached IT, admins see everything.
export function statsRoutes(db) {
  const router = Router();

  router.get('/', requireRole('manager', 'it_support', 'admin'), (req, res) => {
    const vis = visibilityClause(req.user);
    const scoped = (sql) => db.prepare(sql.replace('{{vis}}', vis.sql));

    const byStatus = Object.fromEntries(
      scoped('SELECT r.status, COUNT(*) AS n FROM requests r WHERE {{vis}} GROUP BY r.status')
        .all(...vis.params)
        .map((row) => [row.status, row.n]),
    );
    const count = (...statuses) => statuses.reduce((sum, s) => sum + (byStatus[s] || 0), 0);

    const averages = scoped(`
      SELECT
        AVG(CASE WHEN r.manager_decided_at IS NOT NULL
            THEN (julianday(r.manager_decided_at) - julianday(r.created_at)) * 24 END) AS manager_hours,
        AVG(CASE WHEN r.it_decided_at IS NOT NULL AND r.manager_decided_at IS NOT NULL
            THEN (julianday(r.it_decided_at) - julianday(r.manager_decided_at)) * 24 END) AS it_hours,
        AVG(CASE WHEN r.installed_at IS NOT NULL
            THEN (julianday(r.installed_at) - julianday(r.it_decided_at)) * 24 END) AS install_hours,
        AVG(CASE WHEN r.installed_at IS NOT NULL
            THEN (julianday(r.installed_at) - julianday(r.created_at)) * 24 END) AS total_hours
      FROM requests r WHERE {{vis}}`).get(...vis.params);

    const sla = scoped(`
      SELECT COUNT(*) AS finished,
             SUM(CASE WHEN (julianday(r.installed_at) - julianday(r.created_at)) * 24 <= t.hours THEN 1 ELSE 0 END) AS met
      FROM requests r JOIN sla_targets t ON t.urgency = r.urgency
      WHERE {{vis}} AND r.installed_at IS NOT NULL`).get(...vis.params);

    const overdueOpen = scoped(`
      SELECT COUNT(*) AS n FROM requests r JOIN sla_targets t ON t.urgency = r.urgency
      WHERE {{vis}} AND r.status IN ('pending_manager', 'pending_it', 'in_progress')
        AND (julianday('now') - julianday(r.created_at)) * 24 > t.hours`).get(...vis.params).n;

    const topSoftware = scoped(`
      SELECT s.name, COUNT(*) AS requests FROM requests r JOIN software s ON s.id = r.software_id
      WHERE {{vis}} GROUP BY s.id ORDER BY requests DESC, s.name LIMIT 6`).all(...vis.params);

    const byMonth = scoped(`
      SELECT strftime('%Y-%m', r.created_at) AS month, COUNT(*) AS requests FROM requests r
      WHERE {{vis}} AND r.created_at >= date('now', 'start of month', '-5 months')
      GROUP BY month ORDER BY month`).all(...vis.params);

    const byDepartment = scoped(`
      SELECT d.name, COUNT(*) AS requests FROM requests r JOIN departments d ON d.id = r.department_id
      WHERE {{vis}} GROUP BY d.id ORDER BY requests DESC`).all(...vis.params);

    res.json({
      scope: req.user.role === 'manager' ? req.user.department_name : 'All departments',
      totals: {
        all: count('pending_manager', 'pending_it', 'in_progress', 'installed', 'closed', 'rejected', 'cancelled'),
        waitingForManager: count('pending_manager'),
        waitingForIT: count('pending_it'),
        installing: count('in_progress'),
        completed: count('installed', 'closed'),
        rejected: count('rejected'),
        cancelled: count('cancelled'),
      },
      averageHours: {
        managerDecision: hours(averages.manager_hours),
        itDecision: hours(averages.it_hours),
        installation: hours(averages.install_hours),
        submitToInstalled: hours(averages.total_hours),
      },
      sla: {
        finished: sla.finished,
        met: sla.met || 0,
        compliancePercent: sla.finished ? Math.round(((sla.met || 0) / sla.finished) * 1000) / 10 : null,
        overdueOpen,
        targets: db.prepare('SELECT urgency, hours FROM sla_targets').all(),
      },
      topSoftware,
      byMonth,
      byDepartment,
    });
  });

  return router;
}
