import { Router } from 'express';
import { z } from 'zod';
import { parse, HttpError } from '../errors.js';
import { requireRole, publicUser } from '../auth.js';
import { now, writeAudit } from '../db.js';

const updateUserSchema = z.object({
  role: z.enum(['employee', 'manager', 'it_support', 'admin']).optional(),
  departmentId: z.number().int().positive().nullable().optional(),
  isActive: z.boolean().optional(),
});

export function adminRoutes(db) {
  const router = Router();

  // IT staff need this list to assign installations.
  router.get('/technicians', requireRole('it_support', 'admin'), (req, res) => {
    const rows = db
      .prepare("SELECT id, name FROM users WHERE is_active = 1 AND role IN ('it_support', 'admin') ORDER BY name")
      .all();
    res.json({ technicians: rows });
  });

  router.get('/users', requireRole('admin'), (req, res) => {
    const rows = db
      .prepare(`SELECT u.*, d.name AS department_name FROM users u
                LEFT JOIN departments d ON d.id = u.department_id ORDER BY u.name`)
      .all();
    res.json({ users: rows.map((u) => ({ ...publicUser(u), createdAt: u.created_at })) });
  });

  router.patch('/users/:id', requireRole('admin'), (req, res) => {
    const id = Number(req.params.id);
    const target = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    if (!target) throw new HttpError(404, 'User not found.');

    const data = parse(updateUserSchema, req.body);
    if (id === req.user.id && ((data.role && data.role !== 'admin') || data.isActive === false)) {
      throw new HttpError(400, 'You cannot remove your own admin access.');
    }
    if (data.departmentId) {
      const dept = db.prepare('SELECT id FROM departments WHERE id = ?').get(data.departmentId);
      if (!dept) throw new HttpError(400, 'Department not found.');
    }

    db.prepare(`UPDATE users SET role = ?, department_id = ?, is_active = ?, updated_at = ? WHERE id = ?`).run(
      data.role ?? target.role,
      data.departmentId === undefined ? target.department_id : data.departmentId,
      data.isActive === undefined ? target.is_active : Number(data.isActive),
      now(),
      id,
    );

    const before = { role: target.role, departmentId: target.department_id, isActive: Boolean(target.is_active) };
    writeAudit(db, req.user.id, 'user.updated', `user:${id}`, { before, changes: data });

    const updated = db
      .prepare('SELECT u.*, d.name AS department_name FROM users u LEFT JOIN departments d ON d.id = u.department_id WHERE u.id = ?')
      .get(id);
    res.json({ user: publicUser(updated) });
  });

  router.get('/audit', requireRole('admin'), (req, res) => {
    const rows = db
      .prepare(`SELECT a.id, a.action, a.target, a.details, a.created_at AS createdAt, u.name AS actorName
                FROM audit_log a LEFT JOIN users u ON u.id = a.actor_id
                ORDER BY a.created_at DESC, a.id DESC LIMIT 300`)
      .all();
    res.json({ entries: rows.map((r) => ({ ...r, details: r.details ? JSON.parse(r.details) : null })) });
  });

  return router;
}
