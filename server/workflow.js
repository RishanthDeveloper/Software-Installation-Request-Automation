import { HttpError } from './errors.js';
import { now } from './db.js';

// Statuses in which a request still counts as "open" (used for duplicate checks).
export const OPEN_STATUSES = ['pending_manager', 'pending_it', 'in_progress', 'installed'];

// Statuses in which a license seat is considered used.
export const LICENSE_STATUSES = ['in_progress', 'installed', 'closed'];

export const STATUS_LABELS = {
  pending_manager: 'waiting for manager approval',
  pending_it: 'waiting for IT approval',
  in_progress: 'being installed',
  installed: 'installed',
  closed: 'closed',
  rejected: 'rejected',
  cancelled: 'cancelled',
};

const isOwner = (user, request) => user.id === request.user_id;
const isIT = (user) => user.role === 'it_support' || user.role === 'admin';

// Managers approve requests from their own department. Admins can step in for any department.
// Nobody approves their own request.
const canManagerDecide = (user, request) =>
  !isOwner(user, request) &&
  ((user.role === 'manager' && user.department_id === request.department_id) || user.role === 'admin');

const canITDecide = (user, request) => isIT(user) && !isOwner(user, request);

export const ACTIONS = {
  cancel: {
    from: ['pending_manager', 'pending_it'],
    to: 'cancelled',
    allowed: isOwner,
  },
  manager_approve: {
    from: ['pending_manager'],
    to: 'pending_it',
    allowed: canManagerDecide,
  },
  manager_reject: {
    from: ['pending_manager'],
    to: 'rejected',
    allowed: canManagerDecide,
    noteRequired: 'Give a reason for rejecting this request.',
  },
  it_approve: {
    from: ['pending_it'],
    to: 'in_progress',
    allowed: canITDecide,
  },
  it_reject: {
    from: ['pending_it'],
    to: 'rejected',
    allowed: canITDecide,
    noteRequired: 'Give a reason for rejecting this request.',
  },
  assign: {
    from: ['in_progress'],
    to: 'in_progress',
    allowed: (user) => isIT(user),
  },
  mark_installed: {
    from: ['in_progress'],
    to: 'installed',
    allowed: (user) => isIT(user),
    noteRequired: 'Add installation notes, for example the version installed.',
  },
  close: {
    from: ['installed'],
    to: 'closed',
    allowed: (user, request) => isOwner(user, request) || isIT(user),
  },
};

export function allowedActions(user, request) {
  return Object.entries(ACTIONS)
    .filter(([, rule]) => rule.from.includes(request.status) && rule.allowed(user, request))
    .map(([name]) => name);
}

// SQL condition limiting which requests a user can see. The table must be aliased as "r".
export function visibilityClause(user) {
  switch (user.role) {
    case 'admin':
      return { sql: '1 = 1', params: [] };
    case 'manager':
      return { sql: '(r.user_id = ? OR r.department_id = ?)', params: [user.id, user.department_id] };
    case 'it_support':
      return {
        sql: `(r.user_id = ? OR r.status IN ('pending_it', 'in_progress', 'installed', 'closed')
               OR r.it_decided_at IS NOT NULL)`,
        params: [user.id],
      };
    default:
      return { sql: 'r.user_id = ?', params: [user.id] };
  }
}

export function findVisibleRequest(db, user, id) {
  const vis = visibilityClause(user);
  return db.prepare(`SELECT r.* FROM requests r WHERE r.id = ? AND ${vis.sql}`).get(id, ...vis.params);
}

function checkLicenseAvailable(db, softwareId) {
  const row = db
    .prepare(
      `SELECT s.name, s.license_count,
              (SELECT COUNT(*) FROM requests x
               WHERE x.software_id = s.id AND x.status IN (${LICENSE_STATUSES.map(() => '?').join(', ')})) AS in_use
       FROM software s WHERE s.id = ?`,
    )
    .get(...LICENSE_STATUSES, softwareId);

  if (row.license_count !== null && row.in_use >= row.license_count) {
    throw new HttpError(
      409,
      `No ${row.name} licenses are free (${row.in_use} of ${row.license_count} in use). ` +
        'Reject the request or ask an admin to add licenses.',
    );
  }
}

function checkAssignee(db, assigneeId) {
  const assignee = db
    .prepare("SELECT id FROM users WHERE id = ? AND is_active = 1 AND role IN ('it_support', 'admin')")
    .get(assigneeId);
  if (!assignee) throw new HttpError(400, 'Choose an active IT support member to assign.');
}

// Applies one workflow action inside a transaction. The UPDATE only succeeds if the
// status is still what we read, so two people acting at the same time cannot both win.
export function performAction(db, user, requestId, { action, note, assigneeId }) {
  const rule = ACTIONS[action];
  if (!rule) throw new HttpError(400, 'Unknown action.');

  const run = db.transaction(() => {
    const request = findVisibleRequest(db, user, requestId);
    if (!request) throw new HttpError(404, 'Request not found.');

    if (!rule.from.includes(request.status)) {
      throw new HttpError(409, `This request is ${STATUS_LABELS[request.status]}, so that action is not available.`);
    }
    if (!rule.allowed(user, request)) {
      throw new HttpError(403, 'You do not have permission to do that.');
    }

    const text = note?.trim() || null;
    if (rule.noteRequired && !text) throw new HttpError(400, rule.noteRequired);

    const time = now();
    const changes = { status: rule.to, updated_at: time };

    switch (action) {
      case 'manager_approve':
      case 'manager_reject':
        changes.manager_id = user.id;
        changes.manager_decided_at = time;
        break;
      case 'it_approve':
        checkLicenseAvailable(db, request.software_id);
        changes.it_approver_id = user.id;
        changes.it_decided_at = time;
        if (assigneeId) checkAssignee(db, assigneeId);
        changes.assigned_to = assigneeId || user.id;
        break;
      case 'it_reject':
        changes.it_approver_id = user.id;
        changes.it_decided_at = time;
        break;
      case 'assign':
        if (!assigneeId) throw new HttpError(400, 'Choose who to assign.');
        checkAssignee(db, assigneeId);
        changes.assigned_to = assigneeId;
        break;
      case 'mark_installed':
        changes.installed_at = time;
        changes.install_notes = text;
        break;
      case 'close':
        changes.closed_at = time;
        break;
    }
    if (action.endsWith('_reject')) changes.rejection_reason = text;

    // Column names come from the fixed keys above, never from user input.
    const setClause = Object.keys(changes).map((col) => `${col} = @${col}`).join(', ');
    const result = db
      .prepare(`UPDATE requests SET ${setClause} WHERE id = @id AND status = @expected`)
      .run({ ...changes, id: request.id, expected: request.status });

    if (result.changes !== 1) {
      throw new HttpError(409, 'Someone else updated this request. Reload the page and try again.');
    }

    db.prepare(
      `INSERT INTO request_events (request_id, actor_id, action, from_status, to_status, note, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ).run(request.id, user.id, action, request.status, rule.to, text, time);
  });

  run();
}
