import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { parse, HttpError } from '../errors.js';
import { requireAuth, setSessionCookie, clearSessionCookie, publicUser } from '../auth.js';
import { writeAudit } from '../db.js';

const registerSchema = z.object({
  name: z.string().trim().min(2, 'Enter your full name.').max(80, 'Name is too long.'),
  email: z.string().trim().toLowerCase().email('Enter a valid email address.').max(120),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters.')
    .max(100, 'Password is too long.')
    .regex(/[A-Za-z]/, 'Password must contain a letter.')
    .regex(/[0-9]/, 'Password must contain a number.'),
  departmentId: z.coerce.number({ invalid_type_error: 'Choose your department.' }).int().positive('Choose your department.'),
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email address.'),
  password: z.string().min(1, 'Enter your password.').max(100),
});

// Used when the email does not exist, so a failed login takes about the same time either way.
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', 10);

export function authRoutes(db, { limiter }) {
  const router = Router();
  const findByEmail = db.prepare(`
    SELECT u.*, d.name AS department_name
    FROM users u LEFT JOIN departments d ON d.id = u.department_id
    WHERE u.email = ?`);

  router.post('/register', limiter, (req, res) => {
    const data = parse(registerSchema, req.body);

    const department = db.prepare('SELECT id FROM departments WHERE id = ?').get(data.departmentId);
    if (!department) throw new HttpError(400, 'Choose your department from the list.');

    if (findByEmail.get(data.email)) {
      throw new HttpError(409, 'An account with this email already exists. Sign in instead.');
    }

    // New accounts are always employees. Only an admin can change a role.
    const hash = bcrypt.hashSync(data.password, 10);
    db.prepare('INSERT INTO users (name, email, password_hash, role, department_id) VALUES (?, ?, ?, ?, ?)')
      .run(data.name, data.email, hash, 'employee', data.departmentId);

    const user = findByEmail.get(data.email);
    writeAudit(db, user.id, 'user.registered', `user:${user.id}`);
    setSessionCookie(res, user.id);
    res.status(201).json({ user: publicUser(user) });
  });

  router.post('/login', limiter, (req, res) => {
    const data = parse(loginSchema, req.body);
    const user = findByEmail.get(data.email);
    const passwordOk = bcrypt.compareSync(data.password, user ? user.password_hash : DUMMY_HASH);

    if (!user || !passwordOk) throw new HttpError(401, 'Email or password is incorrect.');
    if (!user.is_active) throw new HttpError(403, 'This account has been deactivated. Contact your IT admin.');

    setSessionCookie(res, user.id);
    res.json({ user: publicUser(user) });
  });

  router.post('/logout', (req, res) => {
    clearSessionCookie(res);
    res.json({ ok: true });
  });

  router.get('/me', requireAuth(db), (req, res) => {
    res.json({ user: publicUser(req.user) });
  });

  return router;
}
