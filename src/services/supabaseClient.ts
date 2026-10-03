import { createClient, SupabaseClient } from '@supabase/supabase-js';

const env: Record<string, any> =
  typeof import.meta !== 'undefined' && import.meta.env
    ? import.meta.env
    : (globalThis as any)?.process?.env || {};

export const SUPABASE_URL =
  env.VITE_SUPABASE_URL || 'https://jyliqmshfkszdxlndvdb.supabase.co';

export const SUPABASE_ANON_KEY =
  env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_g4_LPJtO6ocfBKPj34JM6A_edgJKr2Q';

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!client && SUPABASE_URL && SUPABASE_ANON_KEY) {
    try {
      client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      });
    } catch (e) {
      console.error('Failed to initialize Supabase client:', e);
    }
  }
  return client;
}

export function isSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY && SUPABASE_URL.includes('supabase.co'));
}

export function getSupabaseProjectRef(): string {
  try {
    const url = new URL(SUPABASE_URL);
    return url.hostname.split('.')[0] || 'jyliqmshfkszdxlndvdb';
  } catch {
    return 'jyliqmshfkszdxlndvdb';
  }
}

export interface SupabaseAuthResult {
  success: boolean;
  user?: any;
  session?: any;
  error?: string;
  isCloudSupabase: boolean;
}

export interface SupabaseTablesStatus {
  profilesExists: boolean;
  submissionsExists: boolean;
  projectsExists: boolean;
  projectRevisionsExists: boolean;
  checkedAt: string;
}

/**
 * Register a user via Supabase Auth
 */
export async function supabaseSignUp(
  email: string,
  password?: string,
  metadata?: { name?: string; plan?: string }
): Promise<SupabaseAuthResult> {
  const sb = getSupabase();
  if (!sb) {
    return { success: false, error: 'Supabase client not initialized', isCloudSupabase: false };
  }

  try {
    // Generate secure default password if not provided by user in simple name+email form
    const pwd = password && password.length >= 6 ? password : `Studio_${Math.random().toString(36).substring(2, 10)}!`;
    const { data, error } = await sb.auth.signUp({
      email,
      password: pwd,
      options: {
        data: {
          full_name: metadata?.name || '',
          plan: metadata?.plan || 'Free Trial',
          role: 'user',
        },
      },
    });

    if (error) {
      return { success: false, error: error.message, isCloudSupabase: true };
    }

    return {
      success: true,
      user: data.user,
      session: data.session,
      isCloudSupabase: true,
    };
  } catch (err: any) {
    return { success: false, error: err.message || 'Supabase request failed', isCloudSupabase: true };
  }
}

/**
 * Sign in existing user via Supabase Auth
 */
export async function supabaseSignInWithPassword(
  email: string,
  password: string
): Promise<SupabaseAuthResult> {
  const sb = getSupabase();
  if (!sb) {
    return { success: false, error: 'Supabase client not initialized', isCloudSupabase: false };
  }

  try {
    const { data, error } = await sb.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { success: false, error: error.message, isCloudSupabase: true };
    }

    return {
      success: true,
      user: data.user,
      session: data.session,
      isCloudSupabase: true,
    };
  } catch (err: any) {
    return { success: false, error: err.message || 'Supabase login failed', isCloudSupabase: true };
  }
}

/**
 * Trigger Google OAuth sign-in flow via Supabase
 */
export async function supabaseSignInWithGoogle(redirectTo?: string): Promise<{ success: boolean; url?: string; error?: string }> {
  const sb = getSupabase();
  if (!sb) {
    return { success: false, error: 'Supabase client not initialized' };
  }

  try {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
    const targetRedirect = redirectTo || (origin ? `${origin}${pathname}` : undefined);

    const { data, error } = await sb.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: targetRedirect,
        queryParams: {
          access_type: 'offline',
          prompt: 'select_account',
        },
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, url: data?.url };
  } catch (err: any) {
    return { success: false, error: err.message || 'Google authentication failed' };
  }
}

/**
 * Get current authenticated session from Supabase
 */
export async function supabaseGetSession() {
  const sb = getSupabase();
  if (!sb) return null;
  try {
    const { data } = await sb.auth.getSession();
    return data.session;
  } catch {
    return null;
  }
}

/**
 * Listen to auth state transitions (e.g. user returns from Google OAuth)
 */
export function supabaseOnAuthStateChange(callback: (event: string, session: any) => void) {
  const sb = getSupabase();
  if (!sb) return { data: { subscription: { unsubscribe: () => {} } } };
  return sb.auth.onAuthStateChange(callback);
}

/**
 * Sign out current session
 */
export async function supabaseSignOut() {
  const sb = getSupabase();
  if (sb) {
    try {
      await sb.auth.signOut();
    } catch {}
  }
}

/**
 * Ping Supabase Auth endpoint to verify live connectivity
 */
export async function checkSupabaseConnection(): Promise<{ connected: boolean; latencyMs: number; error?: string }> {
  const startTime = Date.now();
  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/health`, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
      },
    });
    const latency = Date.now() - startTime;
    if (res.ok) {
      return { connected: true, latencyMs: latency };
    }
    return { connected: false, latencyMs: latency, error: `HTTP ${res.status}` };
  } catch (err: any) {
    return { connected: false, latencyMs: Date.now() - startTime, error: err.message || 'Network error' };
  }
}

/**
 * Check if the SQL tables (public.profiles and public.submissions) have been created in Supabase
 */
export async function checkSupabaseTables(): Promise<SupabaseTablesStatus> {
  const checkTable = async (tableName: string): Promise<boolean> => {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/${tableName}?select=*&limit=1`, {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
      });
      if (res.ok) return true;
      const json = await res.json().catch(() => null);
      if (json?.code === 'PGRST205') return false; // Table does not exist in schema cache
      return false;
    } catch {
      return false;
    }
  };

  const [profilesExists, submissionsExists, projectsExists, projectRevisionsExists] = await Promise.all([
    checkTable('profiles'),
    checkTable('submissions'),
    checkTable('projects'),
    checkTable('project_revisions'),
  ]);

  return {
    profilesExists,
    submissionsExists,
    projectsExists,
    projectRevisionsExists,
    checkedAt: new Date().toISOString(),
  };
}
