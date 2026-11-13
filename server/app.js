import express from 'express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from './config.js';
import { requireAuth } from './auth.js';
import { errorHandler, HttpError } from './errors.js';
import { authRoutes } from './routes/auth.js';
import { softwareRoutes } from './routes/software.js';
import { requestRoutes } from './routes/requests.js';
import { adminRoutes } from './routes/admin.js';
import { statsRoutes } from './routes/stats.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const clientDist = path.join(here, '..', 'client', 'dist');

export function createApp(db, options = {}) {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', 1);

  app.use(helmet());
  app.use(express.json({ limit: '50kb' }));
  app.use(cookieParser());

  // Changes must be sent as JSON. Together with SameSite cookies this blocks
  // other websites from submitting forms to the API on a user's behalf.
  app.use('/api', (req, res, next) => {
    if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method) && !req.is('application/json')) {
      return next(new HttpError(415, 'Send the request body as JSON.'));
    }
    next();
  });

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: options.authRateLimit ?? config.authRateLimit,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { error: 'Too many attempts. Wait a few minutes and try again.' },
  });

  app.get('/api/health', (req, res) => res.json({ ok: true }));

  // Public: the registration form needs the department list.
  app.get('/api/departments', (req, res) => {
    res.json({ departments: db.prepare('SELECT id, name FROM departments ORDER BY name').all() });
  });

  app.use('/api/auth', authRoutes(db, { limiter: authLimiter }));

  const signedIn = requireAuth(db);
  app.use('/api/software', signedIn, softwareRoutes(db));
  app.use('/api/requests', signedIn, requestRoutes(db));
  app.use('/api/stats', signedIn, statsRoutes(db));
  app.use('/api/admin', signedIn, adminRoutes(db));

  app.use('/api', (req, res) => res.status(404).json({ error: 'Not found.' }));

  // In production the built React app is served by the same server.
  if (fs.existsSync(clientDist)) {
    app.use(express.static(clientDist, { index: false, maxAge: '1h' }));
    app.get('*', (req, res) => res.sendFile(path.join(clientDist, 'index.html')));
  }

  app.use(errorHandler);
  return app;
}
