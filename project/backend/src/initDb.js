import { initDatabase } from './db.js';

console.log('Initializing Mazad database...');
try {
  initDatabase();
  console.log('Done. database.sqlite is ready.');
  process.exit(0);
} catch (err) {
  console.error('Failed to initialize database:', err.message);
  process.exit(1);
}
