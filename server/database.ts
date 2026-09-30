import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'studio.db');
const JSON_MIRROR = path.join(DATA_DIR, 'studio_database.json');

// Ensure data folder exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

let dbInstance: DatabaseSync | null = null;

export function getDatabase(): DatabaseSync {
  if (dbInstance) return dbInstance;

  try {
    dbInstance = new DatabaseSync(DB_FILE);
  } catch (err) {
    console.warn('[Database] Falling back to memory database:', err);
    dbInstance = new DatabaseSync(':memory:');
  }

  // Initialize schema
  dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      plan TEXT DEFAULT 'Starter',
      role TEXT DEFAULT 'user',
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS submissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      page_slug TEXT NOT NULL,
      form_type TEXT DEFAULT 'signup',
      name TEXT,
      email TEXT,
      data_json TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      data_json TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Seed default demo records if empty
  const countUsers = (dbInstance.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number }).count;
  if (countUsers === 0) {
    const insertUser = dbInstance.prepare(`
      INSERT INTO users (name, email, plan, role, status) VALUES (?, ?, ?, ?, ?)
    `);
    insertUser.run('Alex Morgan', 'alex@craftstudio.dev', 'Pro Plan', 'admin', 'active');
    insertUser.run('Elena Rostova', 'elena@visioncraft.ai', 'Starter', 'user', 'active');
    insertUser.run('Marcus Brody', 'marcus@hypergrowth.co', 'Enterprise', 'user', 'active');

    const insertSub = dbInstance.prepare(`
      INSERT INTO submissions (page_slug, form_type, name, email, data_json) VALUES (?, ?, ?, ?, ?)
    `);
    insertSub.run('/signup', 'signup', 'Marcus Brody', 'marcus@hypergrowth.co', JSON.stringify({ company: 'Hypergrowth', teamSize: '15-50' }));
    insertSub.run('/about', 'contact', 'Elena Rostova', 'elena@visioncraft.ai', JSON.stringify({ message: 'Interested in API visual integration' }));

    syncJsonMirror();
  }

  return dbInstance;
}

export function syncJsonMirror() {
  try {
    const db = getDatabase();
    const users = db.prepare('SELECT * FROM users ORDER BY id DESC').all();
    const submissions = db.prepare('SELECT * FROM submissions ORDER BY id DESC').all();
    const stats = {
      engine: 'SQLite (node:sqlite)',
      dbPath: DB_FILE,
      lastSynced: new Date().toISOString(),
      userCount: users.length,
      submissionCount: submissions.length,
    };

    fs.writeFileSync(
      JSON_MIRROR,
      JSON.stringify({ stats, users, submissions }, null, 2),
      'utf-8'
    );
  } catch (err) {
    console.error('[Database] Failed to write JSON mirror:', err);
  }
}

export function getAllUsers() {
  const db = getDatabase();
  return db.prepare('SELECT * FROM users ORDER BY id DESC').all();
}

export function createUser(data: { name: string; email: string; plan?: string }) {
  const db = getDatabase();
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(data.email);
  if (existing) {
    throw new Error(`Email ${data.email} is already registered.`);
  }

  const stmt = db.prepare(`
    INSERT INTO users (name, email, plan, role, status)
    VALUES (?, ?, ?, 'user', 'active')
  `);
  stmt.run(data.name.trim(), data.email.trim().toLowerCase(), data.plan || 'Free Trial');

  const created = db.prepare('SELECT * FROM users WHERE email = ?').get(data.email.trim().toLowerCase());

  // Also log into submissions
  try {
    const subStmt = db.prepare(`
      INSERT INTO submissions (page_slug, form_type, name, email, data_json)
      VALUES ('/signup', 'signup', ?, ?, ?)
    `);
    subStmt.run(data.name.trim(), data.email.trim().toLowerCase(), JSON.stringify({ plan: data.plan || 'Free Trial' }));
  } catch (e) {
    // Non-fatal
  }

  syncJsonMirror();
  return created;
}

export function deleteUser(id: number | string) {
  const db = getDatabase();
  db.prepare('DELETE FROM users WHERE id = ?').run(Number(id));
  syncJsonMirror();
  return { success: true };
}

export function getAllSubmissions() {
  const db = getDatabase();
  return db.prepare('SELECT * FROM submissions ORDER BY id DESC').all();
}

export function createSubmission(data: { page_slug: string; form_type?: string; name?: string; email?: string; payload?: Record<string, unknown> }) {
  const db = getDatabase();
  const stmt = db.prepare(`
    INSERT INTO submissions (page_slug, form_type, name, email, data_json)
    VALUES (?, ?, ?, ?, ?)
  `);
  stmt.run(
    data.page_slug || '/landing',
    data.form_type || 'lead',
    data.name || 'Anonymous',
    data.email || 'unknown@domain.com',
    JSON.stringify(data.payload || {})
  );

  syncJsonMirror();
  return { success: true };
}

export function getDatabaseStats() {
  const db = getDatabase();
  const userCount = (db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number }).count;
  const subCount = (db.prepare('SELECT COUNT(*) as count FROM submissions').get() as { count: number }).count;
  return {
    engine: 'SQLite (node:sqlite)',
    dbFile: DB_FILE,
    jsonMirror: JSON_MIRROR,
    userCount,
    submissionCount: subCount,
  };
}
