import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const requireModule = createRequire(import.meta.url);
let DatabaseSyncClass: any = null;
try {
  const sqlite = requireModule('node:sqlite');
  DatabaseSyncClass = sqlite?.DatabaseSync || null;
} catch {
  // node:sqlite is available in Node >= 22.5.0; fallback to JSON storage if unavailable
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'studio.db');
const JSON_MIRROR = path.join(DATA_DIR, 'studio_database.json');

// Ensure data folder exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

let dbInstance: any = null;

function createJsonMockDb() {
  const readData = () => {
    try {
      if (fs.existsSync(JSON_MIRROR)) {
        return JSON.parse(fs.readFileSync(JSON_MIRROR, 'utf-8'));
      }
    } catch {}
    return { users: [], submissions: [], projects: [], project_revisions: [] };
  };

  const writeData = (data: any) => {
    try {
      fs.writeFileSync(JSON_MIRROR, JSON.stringify(data, null, 2), 'utf-8');
    } catch {}
  };

  return {
    exec() {},
    prepare(sql: string) {
      return {
        get(...params: any[]) {
          const data = readData();
          if (sql.includes('COUNT(*)')) {
            if (sql.includes('users')) return { count: data.users?.length || 0 };
            if (sql.includes('submissions')) return { count: data.submissions?.length || 0 };
            if (sql.includes('projects')) return { count: data.projects?.length || 0 };
            return { count: 0 };
          }
          if (sql.includes('FROM projects WHERE id = ?')) {
            return (data.projects || []).find((p: any) => p.id === params[0]) || null;
          }
          if (sql.includes('FROM users WHERE email = ?')) {
            return (data.users || []).find((u: any) => u.email === params[0]) || null;
          }
          return null;
        },
        all(...params: any[]) {
          const data = readData();
          if (sql.includes('users')) return data.users || [];
          if (sql.includes('submissions')) return data.submissions || [];
          if (sql.includes('project_revisions')) {
            return (data.project_revisions || []).filter((r: any) => !params[0] || r.project_id === params[0]);
          }
          if (sql.includes('projects')) {
            if (params[0]) {
              return (data.projects || []).filter((p: any) => p.user_id === params[0] || !p.user_id || p.is_public);
            }
            return data.projects || [];
          }
          return [];
        },
        run(...params: any[]) {
          const data = readData();
          data.projects = data.projects || [];
          data.project_revisions = data.project_revisions || [];
          data.users = data.users || [];
          data.submissions = data.submissions || [];

          if (sql.includes('INSERT INTO projects') || sql.includes('INSERT OR REPLACE INTO projects')) {
            const [id, user_id, name, slug, data_json, thumbnail_url, is_public] = params;
            const existingIdx = data.projects.findIndex((p: any) => p.id === id);
            const item = {
              id,
              user_id: user_id || null,
              name: name || 'Untitled Project',
              slug: slug || null,
              data_json: data_json || '{}',
              thumbnail_url: thumbnail_url || null,
              is_public: is_public ? 1 : 0,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };
            if (existingIdx >= 0) {
              data.projects[existingIdx] = { ...data.projects[existingIdx], ...item };
            } else {
              data.projects.unshift(item);
            }
            writeData(data);
          } else if (sql.includes('DELETE FROM projects WHERE id = ?')) {
            data.projects = data.projects.filter((p: any) => p.id !== params[0]);
            writeData(data);
          }
        },
      };
    },
  };
}

export function getDatabase(): any {
  if (dbInstance) return dbInstance;

  if (!DatabaseSyncClass) {
    dbInstance = createJsonMockDb();
    return dbInstance;
  }

  try {
    dbInstance = new DatabaseSyncClass(DB_FILE);
  } catch (err) {
    console.warn('[Database] Falling back to memory database:', err);
    try {
      dbInstance = new DatabaseSyncClass(':memory:');
    } catch {
      dbInstance = createJsonMockDb();
      return dbInstance;
    }
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
      user_id TEXT,
      name TEXT NOT NULL,
      slug TEXT,
      data_json TEXT NOT NULL,
      thumbnail_url TEXT,
      is_public INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS project_revisions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id TEXT NOT NULL,
      name TEXT DEFAULT 'Auto-save revision',
      data_json TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Safe migration: check for missing columns in existing projects table
  try {
    const tableInfo: any[] = dbInstance.prepare("PRAGMA table_info(projects)").all();
    const cols = new Set(tableInfo.map((c: any) => c.name));
    if (!cols.has('user_id')) dbInstance.exec("ALTER TABLE projects ADD COLUMN user_id TEXT");
    if (!cols.has('slug')) dbInstance.exec("ALTER TABLE projects ADD COLUMN slug TEXT");
    if (!cols.has('thumbnail_url')) dbInstance.exec("ALTER TABLE projects ADD COLUMN thumbnail_url TEXT");
    if (!cols.has('is_public')) dbInstance.exec("ALTER TABLE projects ADD COLUMN is_public INTEGER DEFAULT 0");
    if (!cols.has('created_at')) dbInstance.exec("ALTER TABLE projects ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP");
  } catch {}

  // Seed default demo records if empty
  const countUsers = (dbInstance.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number }).count;
  if (countUsers === 0) {
    const insertUser = dbInstance.prepare(`
      INSERT INTO users (name, email, plan, role, status) VALUES (?, ?, ?, ?, ?)
    `);
    insertUser.run('Azan Abdullah', 'azan@craftstudio.dev', 'Pro Studio', 'admin', 'active');
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
    let projects: any[] = [];
    let revisions: any[] = [];
    try {
      projects = db.prepare('SELECT * FROM projects ORDER BY updated_at DESC').all();
      revisions = db.prepare('SELECT * FROM project_revisions ORDER BY id DESC LIMIT 50').all();
    } catch {}

    const stats = {
      engine: 'SQLite (node:sqlite)',
      dbPath: DB_FILE,
      lastSynced: new Date().toISOString(),
      userCount: users.length,
      submissionCount: submissions.length,
      projectCount: projects.length,
    };

    fs.writeFileSync(
      JSON_MIRROR,
      JSON.stringify({ stats, users, submissions, projects, project_revisions: revisions }, null, 2),
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

// -------------------------------------------------------------
// Cloud Projects & Revision Management
// -------------------------------------------------------------

export interface DbProjectRecord {
  id: string;
  user_id?: string | null;
  name: string;
  slug?: string | null;
  data_json: string;
  thumbnail_url?: string | null;
  is_public?: number | boolean;
  created_at?: string;
  updated_at?: string;
}

export function getAllProjects(userId?: string) {
  const db = getDatabase();
  if (userId) {
    return db.prepare(`
      SELECT id, user_id, name, slug, thumbnail_url, is_public, created_at, updated_at
      FROM projects 
      WHERE user_id = ? OR user_id IS NULL OR is_public = 1
      ORDER BY updated_at DESC
    `).all(userId);
  }
  return db.prepare(`
    SELECT id, user_id, name, slug, thumbnail_url, is_public, created_at, updated_at
    FROM projects 
    ORDER BY updated_at DESC
  `).all();
}

export function getProjectById(idOrSlug: string) {
  const db = getDatabase();
  return db.prepare('SELECT * FROM projects WHERE id = ? OR slug = ?').get(idOrSlug, idOrSlug);
}

export function saveProject(project: {
  id: string;
  user_id?: string | null;
  name: string;
  slug?: string | null;
  data_json: string;
  thumbnail_url?: string | null;
  is_public?: boolean | number;
}) {
  const db = getDatabase();
  const now = new Date().toISOString();
  const isPub = project.is_public ? 1 : 0;

  const existing = db.prepare('SELECT id FROM projects WHERE id = ?').get(project.id);
  if (existing) {
    db.prepare(`
      UPDATE projects 
      SET name = ?, user_id = COALESCE(?, user_id), slug = ?, data_json = ?, thumbnail_url = ?, is_public = ?, updated_at = ?
      WHERE id = ?
    `).run(
      project.name,
      project.user_id || null,
      project.slug || null,
      project.data_json,
      project.thumbnail_url || null,
      isPub,
      now,
      project.id
    );
  } else {
    db.prepare(`
      INSERT INTO projects (id, user_id, name, slug, data_json, thumbnail_url, is_public, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      project.id,
      project.user_id || null,
      project.name,
      project.slug || null,
      project.data_json,
      project.thumbnail_url || null,
      isPub,
      now,
      now
    );
  }

  syncJsonMirror();
  return { success: true, id: project.id, updatedAt: now };
}

export function deleteProject(id: string) {
  const db = getDatabase();
  db.prepare('DELETE FROM projects WHERE id = ?').run(id);
  try {
    db.prepare('DELETE FROM project_revisions WHERE project_id = ?').run(id);
  } catch {}
  syncJsonMirror();
  return { success: true };
}

export function createProjectRevision(projectId: string, name?: string, data_json?: string) {
  const db = getDatabase();
  let jsonToSave = data_json;
  if (!jsonToSave) {
    const proj: any = db.prepare('SELECT data_json FROM projects WHERE id = ?').get(projectId);
    if (!proj) throw new Error('Project not found');
    jsonToSave = proj.data_json;
  }

  db.prepare(`
    INSERT INTO project_revisions (project_id, name, data_json)
    VALUES (?, ?, ?)
  `).run(projectId, name || `Snapshot ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`, jsonToSave);

  syncJsonMirror();
  return { success: true };
}

export function getProjectRevisions(projectId: string) {
  const db = getDatabase();
  return db.prepare(`
    SELECT id, project_id, name, created_at
    FROM project_revisions
    WHERE project_id = ?
    ORDER BY id DESC
    LIMIT 30
  `).all(projectId);
}

export function getRevisionById(revisionId: number | string) {
  const db = getDatabase();
  return db.prepare('SELECT * FROM project_revisions WHERE id = ?').get(Number(revisionId));
}

export function getDatabaseStats() {
  const db = getDatabase();
  const userCount = (db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number }).count;
  const subCount = (db.prepare('SELECT COUNT(*) as count FROM submissions').get() as { count: number }).count;
  let projCount = 0;
  try {
    projCount = (db.prepare('SELECT COUNT(*) as count FROM projects').get() as { count: number }).count;
  } catch {}

  return {
    engine: 'SQLite (node:sqlite)',
    dbFile: DB_FILE,
    jsonMirror: JSON_MIRROR,
    userCount,
    submissionCount: subCount,
    projectCount: projCount,
  };
}
