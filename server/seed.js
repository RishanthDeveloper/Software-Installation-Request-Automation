import { config } from './config.js';
import { openDatabase } from './db.js';
import { seedDatabase, USERS } from './seedData.js';

const password = process.env.SEED_PASSWORD;
if (!password || password.length < 8) {
  console.error('Set SEED_PASSWORD in your .env file (at least 8 characters) before seeding.');
  process.exit(1);
}

const db = openDatabase(config.databasePath);
seedDatabase(db, password);
db.close();

console.log(`Database ready at ${config.databasePath}`);
console.log('Starter accounts (password is your SEED_PASSWORD):');
USERS.forEach((u) => console.log(`  ${u.role.padEnd(11)} ${u.email}`));
