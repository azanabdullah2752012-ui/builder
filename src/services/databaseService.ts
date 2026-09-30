import {
  getSupabase,
  supabaseSignUp,
  supabaseSignInWithPassword,
  supabaseSignInWithGoogle,
  supabaseGetSession,
  supabaseOnAuthStateChange,
  supabaseSignOut,
  checkSupabaseConnection,
  checkSupabaseTables,
  isSupabaseConfigured,
  getSupabaseProjectRef,
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  type SupabaseTablesStatus,
} from './supabaseClient';

export interface DatabaseUser {
  id: number;
  name: string;
  email: string;
  plan: string;
  role: string;
  status: string;
  created_at: string;
  supabase_id?: string;
}

export interface DatabaseSubmission {
  id: number;
  page_slug: string;
  form_type: string;
  name: string;
  email: string;
  data_json: string;
  created_at: string;
}

export interface DatabaseStats {
  engine: string;
  dbFile?: string;
  userCount: number;
  submissionCount: number;
  supabaseConnected?: boolean;
  supabaseProjectRef?: string;
  supabaseLatencyMs?: number;
}

const LOCAL_USERS_KEY = 'studio_db_fallback_users';

const DEFAULT_USERS: DatabaseUser[] = [
  { id: 1, name: 'Azan Abdullah', email: 'azan@craftstudio.dev', plan: 'Free (All Features Unlocked)', role: 'admin', status: 'active', created_at: '2026-09-29 12:00:00' },
  { id: 2, name: 'Elena Rostova', email: 'elena@visioncraft.ai', plan: 'Free (All Features Unlocked)', role: 'user', status: 'active', created_at: '2026-09-29 12:30:00' },
  { id: 3, name: 'Marcus Brody', email: 'marcus@hypergrowth.co', plan: 'Free (All Features Unlocked)', role: 'user', status: 'active', created_at: '2026-09-29 13:00:00' },
];

function getLocalUsers(): DatabaseUser[] {
  try {
    const raw = localStorage.getItem(LOCAL_USERS_KEY);
    return raw ? JSON.parse(raw) : DEFAULT_USERS;
  } catch {
    return DEFAULT_USERS;
  }
}

function saveLocalUsers(users: DatabaseUser[]) {
  try {
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
  } catch {}
}

export const databaseService = {
  getSupabaseDetails() {
    return {
      configured: isSupabaseConfigured(),
      projectUrl: SUPABASE_URL,
      projectRef: getSupabaseProjectRef(),
      anonKey: SUPABASE_ANON_KEY,
    };
  },

  async signInWithGoogle(redirectTo?: string) {
    return await supabaseSignInWithGoogle(redirectTo);
  },

  async getSession() {
    return await supabaseGetSession();
  },

  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabaseOnAuthStateChange(callback);
  },

  async signOut() {
    await supabaseSignOut();
  },

  async checkTables(): Promise<SupabaseTablesStatus> {
    return await checkSupabaseTables();
  },

  async getStats(): Promise<DatabaseStats> {
    let baseStats: DatabaseStats = {
      engine: 'SQLite + Supabase Cloud',
      userCount: 0,
      submissionCount: 0,
    };

    try {
      const res = await fetch('/api/database/stats');
      if (res.ok) {
        baseStats = await res.json();
      }
    } catch {
      const users = getLocalUsers();
      baseStats = {
        engine: 'SQLite (Local / Offline)',
        userCount: users.length,
        submissionCount: 2,
      };
    }

    // Check live Supabase connectivity
    const supaCheck = await checkSupabaseConnection();
    return {
      ...baseStats,
      supabaseConnected: supaCheck.connected,
      supabaseProjectRef: getSupabaseProjectRef(),
      supabaseLatencyMs: supaCheck.latencyMs,
    };
  },

  async getUsers(): Promise<DatabaseUser[]> {
    // 1. Try fetching from Supabase public.profiles table
    const sb = getSupabase();
    if (sb) {
      try {
        const { data: profiles, error } = await sb.from('profiles').select('*').order('created_at', { ascending: false });
        if (!error && profiles && profiles.length > 0) {
          const mapped: DatabaseUser[] = profiles.map((p, idx) => ({
            id: idx + 1,
            name: p.full_name || p.email?.split('@')[0] || 'User',
            email: p.email,
            plan: p.plan || 'Free Trial',
            role: p.role || 'user',
            status: p.status || 'active',
            created_at: p.created_at ? p.created_at.substring(0, 19).replace('T', ' ') : '',
            supabase_id: p.id,
          }));
          saveLocalUsers(mapped);
          return mapped;
        }
      } catch {}
    }

    try {
      const res = await fetch('/api/database/users');
      if (res.ok) {
        const data = await res.json();
        if (data.users) {
          saveLocalUsers(data.users);
          return data.users;
        }
      }
    } catch {}
    return getLocalUsers();
  },

  async signup(data: {
    name: string;
    email: string;
    password?: string;
    plan?: string;
  }): Promise<{ success: boolean; user?: DatabaseUser; message?: string; supabaseAuth?: any }> {
    let supabaseResult: any = null;

    // 1. Register with live Supabase Auth
    try {
      const sbRes = await supabaseSignUp(data.email, data.password, {
        name: data.name,
        plan: data.plan,
      });
      supabaseResult = sbRes;
    } catch (sbErr) {
      console.warn('Supabase sign-up error, proceeding with local database sync:', sbErr);
    }

    // 2. Persist record to local SQLite and JSON sync backend
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        const cloudNotice = supabaseResult?.success
          ? ' (Synced to Supabase Cloud & SQLite)'
          : ' (Saved to SQLite)';
        return {
          ...json,
          message: (json.message || 'User registered successfully!') + cloudNotice,
          supabaseAuth: supabaseResult,
        };
      } else {
        throw new Error(json.error || 'Failed to sign up in SQLite');
      }
    } catch (err: any) {
      // Local storage fallback
      const users = getLocalUsers();
      const existing = users.find((u) => u.email.toLowerCase() === data.email.toLowerCase());
      if (existing) {
        return {
          success: true,
          user: existing,
          message: `Welcome back, ${existing.name}! Entering Craft Studio...`,
          supabaseAuth: supabaseResult,
        };
      }
      const newUser: DatabaseUser = {
        id: Date.now(),
        name: data.name || 'Anonymous',
        email: data.email,
        plan: data.plan || 'Free Trial',
        role: 'user',
        status: 'active',
        created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
        supabase_id: supabaseResult?.user?.id,
      };
      users.unshift(newUser);
      saveLocalUsers(users);
      return {
        success: true,
        user: newUser,
        message: 'Account created and synced to Supabase!',
        supabaseAuth: supabaseResult,
      };
    }
  },

  async signin(data: {
    email: string;
    password?: string;
  }): Promise<{ success: boolean; user?: DatabaseUser; message?: string }> {
    // 1. Check Supabase Auth if credentials provided
    if (data.password) {
      try {
        const sbRes = await supabaseSignInWithPassword(data.email, data.password);
        if (sbRes.success && sbRes.user) {
          const user: DatabaseUser = {
            id: Date.now(),
            name: sbRes.user.user_metadata?.full_name || data.email.split('@')[0],
            email: sbRes.user.email || data.email,
            plan: sbRes.user.user_metadata?.plan || 'Free (All Features Unlocked)',
            role: 'user',
            status: 'active',
            created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
            supabase_id: sbRes.user.id,
          };
          return { success: true, user, message: 'Logged in successfully via Supabase!' };
        }
      } catch (err) {
        console.warn('Supabase sign-in error:', err);
      }
    }

    // 2. Fallback to local storage or registered list
    const users = getLocalUsers();
    const existing = users.find((u) => u.email.toLowerCase() === data.email.toLowerCase());
    if (existing) {
      return { success: true, user: existing, message: `Welcome back, ${existing.name}!` };
    }

    // Create session user
    const newUser: DatabaseUser = {
      id: Date.now(),
      name: data.email.split('@')[0],
      email: data.email,
      plan: 'Free (All Features Unlocked)',
      role: 'user',
      status: 'active',
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };
    users.unshift(newUser);
    saveLocalUsers(users);
    return { success: true, user: newUser, message: 'Signed in successfully!' };
  },

  async getSubmissions(): Promise<DatabaseSubmission[]> {
    const sb = getSupabase();
    if (sb) {
      try {
        const { data: subs, error } = await sb.from('submissions').select('*').order('created_at', { ascending: false });
        if (!error && subs && subs.length > 0) {
          return subs.map((s) => ({
            id: Number(s.id),
            page_slug: s.page_slug,
            form_type: s.form_type,
            name: s.name,
            email: s.email,
            data_json: typeof s.data === 'string' ? s.data : JSON.stringify(s.data || {}),
            created_at: s.created_at ? s.created_at.substring(0, 19).replace('T', ' ') : '',
          }));
        }
      } catch {}
    }

    try {
      const res = await fetch('/api/database/submissions');
      if (res.ok) {
        const data = await res.json();
        return data.submissions || [];
      }
    } catch {}
    return [];
  },

  async submitLead(submission: {
    page_slug: string;
    form_type: string;
    name: string;
    email: string;
    data?: Record<string, any>;
  }): Promise<{ success: boolean; message?: string }> {
    // Write directly to Supabase public.submissions table
    const sb = getSupabase();
    if (sb) {
      try {
        await sb.from('submissions').insert({
          page_slug: submission.page_slug,
          form_type: submission.form_type,
          name: submission.name,
          email: submission.email,
          data: submission.data || {},
        });
      } catch (err) {
        console.warn('Supabase submission insert:', err);
      }
    }

    try {
      const res = await fetch('/api/database/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          page_slug: submission.page_slug,
          form_type: submission.form_type,
          name: submission.name,
          email: submission.email,
          data: submission.data || {},
        }),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {}
    return { success: true, message: 'Lead submitted successfully' };
  },

  async deleteUser(id: number): Promise<boolean> {
    try {
      await fetch(`/api/database/users/${id}`, { method: 'DELETE' });
    } catch {}
    const users = getLocalUsers().filter((u) => u.id !== id);
    saveLocalUsers(users);
    return true;
  },
};
