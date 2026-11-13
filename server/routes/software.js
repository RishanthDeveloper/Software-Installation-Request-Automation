import { Router } from 'express';
import { z } from 'zod';
import { parse, HttpError } from '../errors.js';
import { requireRole } from '../auth.js';
import { now, writeAudit } from '../db.js';
import { LICENSE_STATUSES } from '../workflow.js';

const softwareSchema = z.object({
  name: z.string().trim().min(2, 'Enter the software name.').max(80),
  vendor: z.string().trim().min(2, 'Enter the vendor.').max(80),
  category: z.string().trim().min(2, 'Enter a category.').max(40),
  requiresLicense: z.boolean().default(false),
  licenseCount: z.number().int().min(0).max(100000).nullable().default(null),
  isActive: z.boolean().default(true),
});

const toApi = (row) => ({
  id: row.id,
  name: row.name,
  vendor: row.vendor,
  category: row.category,
  requiresLicense: Boolean(row.requires_license),
  licenseCount: row.license_count,
  licensesInUse: row.in_use,
  isActive: Boolean(row.is_active),
});

export function softwareRoutes(db) {
  const router = Router();
  const placeholders = LICENSE_STATUSES.map(() => '?').join(', ');
  const selectSql = `
    SELECT s.*,
      (SELECT COUNT(*) FROM requests x WHERE x.software_id = s.id AND x.status IN (${placeholders})) AS in_use
    FROM software s`;

  router.get('/', (req, res) => {
    const includeInactive = req.user.role === 'admin' && req.query.all === '1';
    const rows = db
      .prepare(`${selectSql} ${includeInactive ? '' : 'WHERE s.is_active = 1'} ORDER BY s.category, s.name`)
      .all(...LICENSE_STATUSES);
    res.json({ software: rows.map(toApi) });
  });

  router.post('/', requireRole('admin'), (req, res) => {
    const data = parse(softwareSchema, req.body);
    if (db.prepare('SELECT id FROM software WHERE name = ?').get(data.name)) {
      throw new HttpError(409, `${data.name} is already in the catalog.`);
    }
    const info = db
      .prepare(`INSERT INTO software (name, vendor, category, requires_license, license_count, is_active)
                VALUES (?, ?, ?, ?, ?, ?)`)
      .run(data.name, data.vendor, data.category, data.requiresLicense ? 1 : 0, data.licenseCount, data.isActive ? 1 : 0);
    writeAudit(db, req.user.id, 'software.created', `software:${info.lastInsertRowid}`, data);
    const row = db.prepare(`${selectSql} WHERE s.id = ?`).get(...LICENSE_STATUSES, info.lastInsertRowid);
    res.status(201).json({ software: toApi(row) });
  });

  router.patch('/:id', requireRole('admin'), (req, res) => {
    const id = Number(req.params.id);
    const existing = db.prepare('SELECT * FROM software WHERE id = ?').get(id);
    if (!existing) throw new HttpError(404, 'Software not found.');

    const data = parse(softwareSchema.partial(), req.body);
    const merged = {
      name: data.name ?? existing.name,
      vendor: data.vendor ?? existing.vendor,
      category: data.category ?? existing.category,
      requires_license: data.requiresLicense === undefined ? existing.requires_license : Number(data.requiresLicense),
      license_count: data.licenseCount === undefined ? existing.license_count : data.licenseCount,
      is_active: data.isActive === undefined ? existing.is_active : Number(data.isActive),
    };

    const clash = db.prepare('SELECT id FROM software WHERE name = ? AND id != ?').get(merged.name, id);
    if (clash) throw new HttpError(409, `${merged.name} is already in the catalog.`);

    db.prepare(`UPDATE software SET name = @name, vendor = @vendor, category = @category,
                requires_license = @requires_license, license_count = @license_count,
                is_active = @is_active, updated_at = @updated_at WHERE id = @id`)
      .run({ ...merged, updated_at: now(), id });
    writeAudit(db, req.user.id, 'software.updated', `software:${id}`, data);
    const row = db.prepare(`${selectSql} WHERE s.id = ?`).get(...LICENSE_STATUSES, id);
    res.json({ software: toApi(row) });
  });

  return router;
}
