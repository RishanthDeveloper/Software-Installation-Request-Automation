import { Router } from 'express';
import { z } from 'zod';
import { parse, HttpError } from '../errors.js';
import { now } from '../db.js';
import {
  OPEN_STATUSES,
  allowedActions,
  findVisibleRequest,
  performAction,
  visibilityClause,
} from '../workflow.js';

const STATUSES = ['pending_manager', 'pending_it', 'in_progress', 'installed', 'closed', 'rejected', 'cancelled'];

const createSchema = z.object({
  softwareId: z.coerce.number({ invalid_type_error: 'Choose the software you need.' }).int().positive('Choose the software you need.'),
  version: z.string().trim().max(40, 'Version is too long.').optional().default(''),
  deviceTag: z.string().trim().min(2, 'Enter the asset tag of your computer.').max(40, 'Asset tag is too long.'),
  justification: z
    .string()
    .trim()
    .min(10, 'Explain why you need this software (at least 10 characters).')
    .max(1000, 'Keep the reason under 1000 characters.'),
  urgency: z.enum(['low', 'normal', 'high'], { errorMap: () => ({ message: 'Choose how urgent this is.' }) }),
  neededBy: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Enter the date as YYYY-MM-DD.')
    .optional()
    .or(z.literal('')),
});

const listSchema = z.object({
  view: z.enum(['mine', 'approvals', 'queue', 'all']).default('all'),
  status: z.enum(STATUSES).optional(),
  q: z.string().trim().max(80).optional(),
});

const actionSchema = z.object({
  action: z.string(),
  note: z.string().max(1000, 'Keep the note under 1000 characters.').optional(),
  assigneeId: z.coerce.number().int().positive().optional(),
});

const RESTRICTED_MIN_REASON = 30;

const LIST_SQL = `
  SELECT r.id, r.status, r.urgency, r.version, r.needed_by, r.created_at, r.updated_at,
         r.installed_at, r.user_id, r.assigned_to,
         s.name AS software_name, u.name AS requester_name, d.name AS department_name,
         a.name AS assignee_name, t.hours AS sla_hours
  FROM requests r
  JOIN software s ON s.id = r.software_id
  JOIN users u ON u.id = r.user_id
  JOIN departments d ON d.id = r.department_id
  LEFT JOIN users a ON a.id = r.assigned_to
  JOIN sla_targets t ON t.urgency = r.urgency`;

// Due time is submission time plus the SLA target. Rejected and cancelled requests have no due time.
function slaInfo(row) {
  if (row.status === 'rejected' || row.status === 'cancelled') return { dueAt: null, overdue: false };
  const due = new Date(new Date(row.created_at).getTime() + row.sla_hours * 3600 * 1000);
  const finished = row.installed_at ? new Date(row.installed_at) : new Date();
  return { dueAt: due.toISOString(), overdue: finished > due };
}

const listItem = (row) => ({
  id: row.id,
  status: row.status,
  urgency: row.urgency,
  version: row.version,
  neededBy: row.needed_by,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  softwareName: row.software_name,
  requesterName: row.requester_name,
  departmentName: row.department_name,
  assignedTo: row.assigned_to,
  assigneeName: row.assignee_name,
  ...slaInfo(row),
});

export function requestRoutes(db) {
  const router = Router();

  router.get('/', (req, res) => {
    const query = parse(listSchema, req.query);
    const user = req.user;
    const vis = visibilityClause(user);
    const where = [vis.sql];
    const params = [...vis.params];

    if (query.view === 'mine') {
      where.push('r.user_id = ?');
      params.push(user.id);
    } else if (query.view === 'approvals') {
      if (!['manager', 'admin'].includes(user.role)) throw new HttpError(403, 'You do not have permission to do that.');
      where.push("r.status = 'pending_manager' AND r.user_id != ?");
      params.push(user.id);
    } else if (query.view === 'queue') {
      if (!['it_support', 'admin'].includes(user.role)) throw new HttpError(403, 'You do not have permission to do that.');
      where.push("r.status IN ('pending_it', 'in_progress', 'installed')");
    }

    if (query.status) {
      where.push('r.status = ?');
      params.push(query.status);
    }
    if (query.q) {
      where.push('(s.name LIKE ? OR u.name LIKE ?)');
      const like = `%${query.q.replace(/[%_]/g, '')}%`;
      params.push(like, like);
    }

    const rows = db
      .prepare(`${LIST_SQL} WHERE ${where.join(' AND ')} ORDER BY r.created_at DESC LIMIT 500`)
      .all(...params);
    res.json({ requests: rows.map(listItem) });
  });

  router.get('/:id', (req, res) => {
    const id = Number(req.params.id);
    const visible = Number.isInteger(id) && findVisibleRequest(db, req.user, id);
    if (!visible) throw new HttpError(404, 'Request not found.');

    const row = db
      .prepare(
        `SELECT r.*, s.name AS software_name, s.vendor AS software_vendor, s.requires_license,
                u.name AS requester_name, u.email AS requester_email, d.name AS department_name,
                m.name AS manager_name, i.name AS it_approver_name, a.name AS assignee_name,
                t.hours AS sla_hours
         FROM requests r
         JOIN software s ON s.id = r.software_id
         JOIN users u ON u.id = r.user_id
         JOIN departments d ON d.id = r.department_id
         LEFT JOIN users m ON m.id = r.manager_id
         LEFT JOIN users i ON i.id = r.it_approver_id
         LEFT JOIN users a ON a.id = r.assigned_to
         JOIN sla_targets t ON t.urgency = r.urgency
         WHERE r.id = ?`,
      )
      .get(id);

    const events = db
      .prepare(
        `SELECT e.id, e.action, e.from_status AS fromStatus, e.to_status AS toStatus, e.note,
                e.created_at AS createdAt, u.name AS actorName, u.role AS actorRole
         FROM request_events e JOIN users u ON u.id = e.actor_id
         WHERE e.request_id = ? ORDER BY e.created_at, e.id`,
      )
      .all(id);

    const actions = allowedActions(req.user, row);
    const needsTechnicians = actions.includes('it_approve') || actions.includes('assign');
    const technicians = needsTechnicians
      ? db.prepare("SELECT id, name FROM users WHERE is_active = 1 AND role IN ('it_support', 'admin') ORDER BY name").all()
      : [];

    res.json({
      request: {
        id: row.id,
        status: row.status,
        urgency: row.urgency,
        version: row.version,
        deviceTag: row.device_tag,
        justification: row.justification,
        neededBy: row.needed_by,
        softwareName: row.software_name,
        softwareVendor: row.software_vendor,
        requiresLicense: Boolean(row.requires_license),
        requesterName: row.requester_name,
        requesterEmail: row.requester_email,
        departmentName: row.department_name,
        managerName: row.manager_name,
        managerDecidedAt: row.manager_decided_at,
        itApproverName: row.it_approver_name,
        itDecidedAt: row.it_decided_at,
        assigneeName: row.assignee_name,
        installedAt: row.installed_at,
        installNotes: row.install_notes,
        closedAt: row.closed_at,
        rejectionReason: row.rejection_reason,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        slaHours: row.sla_hours,
        ...slaInfo(row),
      },
      events,
      allowedActions: actions,
      technicians,
    });
  });

  router.post('/', (req, res) => {
    const data = parse(createSchema, req.body);
    const user = req.user;

    if (!user.department_id) {
      throw new HttpError(400, 'Your account has no department yet. Ask an admin to set one.');
    }

    const software = db.prepare('SELECT * FROM software WHERE id = ? AND is_active = 1').get(data.softwareId);
    if (!software) throw new HttpError(400, 'That software is not in the catalog.');

    if (software.requires_license && data.justification.length < RESTRICTED_MIN_REASON) {
      throw new HttpError(
        400,
        `${software.name} needs a paid license. Explain the business need in at least ${RESTRICTED_MIN_REASON} characters.`,
      );
    }

    if (data.neededBy) {
      const today = new Date().toISOString().slice(0, 10);
      if (data.neededBy < today) throw new HttpError(400, 'The needed-by date cannot be in the past.');
    }

    const open = db
      .prepare(
        `SELECT id FROM requests WHERE user_id = ? AND software_id = ?
         AND status IN (${OPEN_STATUSES.map(() => '?').join(', ')})`,
      )
      .get(user.id, software.id, ...OPEN_STATUSES);
    if (open) {
      throw new HttpError(409, `You already have an open request for ${software.name}.`, { existingId: open.id });
    }

    const time = now();
    const create = db.transaction(() => {
      const info = db
        .prepare(
          `INSERT INTO requests (user_id, software_id, department_id, version, device_tag, justification,
                                 urgency, needed_by, status, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending_manager', ?, ?)`,
        )
        .run(user.id, software.id, user.department_id, data.version, data.deviceTag, data.justification,
          data.urgency, data.neededBy || null, time, time);
      db.prepare(
        `INSERT INTO request_events (request_id, actor_id, action, from_status, to_status, note, created_at)
         VALUES (?, ?, 'submit', NULL, 'pending_manager', NULL, ?)`,
      ).run(info.lastInsertRowid, user.id, time);
      return info.lastInsertRowid;
    });

    let id;
    try {
      id = create();
    } catch (err) {
      // The unique index catches a duplicate submitted at the same moment as another.
      if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        throw new HttpError(409, `You already have an open request for ${software.name}.`);
      }
      throw err;
    }
    res.status(201).json({ id: Number(id) });
  });

  router.post('/:id/actions', (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) throw new HttpError(404, 'Request not found.');
    const data = parse(actionSchema, req.body);
    performAction(db, req.user, id, data);
    const updated = db.prepare('SELECT status FROM requests WHERE id = ?').get(id);
    res.json({ id, status: updated.status });
  });

  return router;
}
