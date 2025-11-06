import sqlite3 from 'sqlite3';
import { join } from 'path';

const db = new sqlite3.Database(join(process.cwd(), 'data.db'));

// Create the projects table if it doesn't exist
db.run(`
  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    valor REAL NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('entrada', 'saida'))
  )
`);

export default db;