import jwt from 'jsonwebtoken';
import { config } from './config.js';
import { HttpError } from './errors.js';

const COOKIE_NAME = 'sra_session';
const SESSION_HOURS = 8;

export function setSessionCookie(res, userId) {
  const token = jwt.sign({ sub: String(userId) }, config.jwtSecret, { expiresIn: `${SESSION_HOURS}h` });
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: config.isProduction,
    maxAge: SESSION_HOURS * 60 * 60 * 1000,
    path: '/',
  });
}

export function clearSessionCookie(res) {
  res.clearCookie(COOKIE_NAME, { path: '/' });
}

// Reads the session cookie and loads the user from the database on every request,
// so role changes and deactivations apply immediately. The browser never supplies the role.
export function requireAuth(db) {
  const findUser = db.prepare(`
    SELECT u.*, d.name AS department_name
    FROM users u LEFT JOIN departments d ON d.id = u.department_id
    WHERE u.id = ?`);

  return (req, res, next) => {
    const token = req.cookies?.[COOKIE_NAME];
    if (!token) return next(new HttpError(401, 'Please sign in.'));

    let payload;
    try {
      payload = jwt.verify(token, config.jwtSecret);
    } catch {
      return next(new HttpError(401, 'Your session has expired. Please sign in again.'));
    }

    const user = findUser.get(Number(payload.sub));
    if (!user || !user.is_active) return next(new HttpError(401, 'Please sign in.'));

    req.user = user;
    next();
  };
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new HttpError(403, 'You do not have permission to do that.'));
    }
    next();
  };
}

export function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    departmentId: user.department_id,
    departmentName: user.department_name ?? null,
    isActive: Boolean(user.is_active),
  };
}
