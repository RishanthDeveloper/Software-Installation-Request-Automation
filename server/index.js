import { config } from './config.js';
import { openDatabase } from './db.js';
import { createApp } from './app.js';
import { seedDatabase } from './seedData.js';

const db = openDatabase(config.databasePath);

// On a brand-new database, create departments, the catalog and starter accounts
// if SEED_PASSWORD is provided. Existing databases are never touched.
const hasUsers = db.prepare('SELECT COUNT(*) AS n FROM users').get().n > 0;
if (!hasUsers && process.env.SEED_PASSWORD) {
  seedDatabase(db, process.env.SEED_PASSWORD);
  console.log('Empty database found: created starter data and accounts.');
}

const app = createApp(db);

const server = app.listen(config.port, () => {
  console.log(`Server listening on http://localhost:${config.port}`);
});

function shutdown() {
  server.close(() => {
    db.close();
    process.exit(0);
  });
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
