import 'dotenv/config';

const isProduction = process.env.NODE_ENV === 'production';

let jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  if (isProduction) {
    throw new Error('JWT_SECRET must be set in production.');
  }
  jwtSecret = 'local-development-secret';
  console.warn('JWT_SECRET is not set. Using an insecure development secret.');
}

export const config = {
  isProduction,
  port: Number(process.env.PORT) || 4000,
  jwtSecret,
  databasePath: process.env.DATABASE_PATH || 'data/app.db',
  authRateLimit: Number(process.env.AUTH_RATE_LIMIT) || 20,
};
