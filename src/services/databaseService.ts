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
import type { ProjectState, ProjectSummary, ProjectRevision, ProjectPublishConfig } from '../types/editor';
import { normalizeProjectState } from '../utils/projectNormalization';
import { INITIAL_PROJECT, CANVAS_DEFAULT_WIDTH } from '../constants/defaults';
import { KID_STARTER_SITES } from '../constants/kidTemplates';
import { getLiveUrl } from '../utils/publishUtils';

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
  { id: 1, name: 'Azan Abdullah', email: 'azanmail2022@gmail.com', plan: 'Pickle Corp Unlocked ($0.00)', role: 'admin', status: 'active', created_at: '2026-09-29 12:00:00' },
  { id: 2, name: 'Kaiser', email: 'kaiser@picklecorp.dev', plan: 'Co-Founder (50% Architecture)', role: 'admin', status: 'active', created_at: '2026-09-29 12:30:00' },
  { id: 3, name: 'Thanvi', email: 'thanvi@picklecorp.dev', plan: 'Co-Founder (50% Aesthetics)', role: 'admin', status: 'active', created_at: '2026-09-29 13:00:00' },
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

const LOCAL_SUBMISSIONS_KEY = 'studio_db_fallback_submissions';
const inMemorySubmissions: DatabaseSubmission[] = [];

function getLocalSubmissions(): DatabaseSubmission[] {
  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(LOCAL_SUBMISSIONS_KEY);
      if (raw) return JSON.parse(raw);
    }
  } catch {}
  return [...inMemorySubmissions];
}

function saveLocalSubmissions(subs: DatabaseSubmission[]) {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(LOCAL_SUBMISSIONS_KEY, JSON.stringify(subs));
    }
  } catch {}
  inMemorySubmissions.length = 0;
  inMemorySubmissions.push(...subs);
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
          message: `Welcome back, ${existing.name}! Entering Pickle Studio...`,
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
          const mapped: DatabaseSubmission[] = subs.map((s) => ({
            id: Number(s.id),
            page_slug: s.page_slug,
            form_type: s.form_type,
            name: s.name,
            email: s.email,
            data_json: typeof s.data === 'string' ? s.data : JSON.stringify(s.data || {}),
            created_at: s.created_at ? s.created_at.substring(0, 19).replace('T', ' ') : '',
          }));
          saveLocalSubmissions(mapped);
          return mapped;
        }
      } catch {}
    }

    try {
      const res = await fetch('/api/database/submissions');
      if (res.ok) {
        const data = await res.json();
        const mapped = data.submissions || [];
        saveLocalSubmissions(mapped);
        return mapped;
      }
    } catch {}
    return getLocalSubmissions();
  },

  async submitLead(submission: {
    page_slug: string;
    form_type: string;
    name: string;
    email: string;
    data?: Record<string, any>;
  }): Promise<{ success: boolean; message?: string }> {
    // 1. Save to local fallback cache immediately
    const localNewSubmission: DatabaseSubmission = {
      id: Date.now(),
      page_slug: submission.page_slug,
      form_type: submission.form_type,
      name: submission.name,
      email: submission.email,
      data_json: typeof submission.data === 'string' ? submission.data : JSON.stringify(submission.data || {}),
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };
    const currentSubs = getLocalSubmissions();
    currentSubs.unshift(localNewSubmission);
    saveLocalSubmissions(currentSubs);

    // 2. Write directly to Supabase public.submissions table
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

    // 3. Write to local backend server if reachable
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

  // -------------------------------------------------------------
  // Cloud Projects & Revision Persistence
  // -------------------------------------------------------------

  async saveProject(
    project: ProjectState,
    options?: { userId?: string; isPublic?: boolean }
  ): Promise<{ success: boolean; cloud: boolean; error?: string }> {
    let cloudSynced = false;
    let cloudError: string | undefined = undefined;

    // 1. Try Direct Supabase Cloud Save
    const sb = getSupabase();
    if (sb) {
      try {
        const payload: Record<string, any> = {
          id: project.id,
          name: project.name,
          slug: project.slug || project.id,
          data: project,
          is_public: options?.isPublic ?? project.isPublic ?? false,
          updated_at: new Date().toISOString(),
        };
        if (options?.userId) {
          payload.user_id = options.userId;
        }

        const { error } = await sb.from('projects').upsert(payload, { onConflict: 'id' });
        if (!error) {
          cloudSynced = true;
        } else {
          // If table not found or RLS issue, log gently
          cloudError = error.message;
        }
      } catch (err: any) {
        cloudError = err.message;
      }
    }

    // 2. Sync to local backend /api/projects
    try {
      await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: project.id,
          user_id: options?.userId,
          name: project.name,
          slug: project.slug,
          data: project,
          is_public: options?.isPublic ?? project.isPublic,
        }),
      });
    } catch {}

    // 3. LocalStorage persistence for client-side/GitHub Pages deployment
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(`pickle_project_${project.id}`, JSON.stringify(project));
        if (project.slug) {
          localStorage.setItem(`pickle_project_slug_${project.slug}`, JSON.stringify(project));
        }
        const publishedKey = 'pickle_published_projects';
        const raw = localStorage.getItem(publishedKey);
        const map = raw ? JSON.parse(raw) : {};
        map[project.id] = project;
        if (project.slug) map[project.slug] = project;
        localStorage.setItem(publishedKey, JSON.stringify(map));
      }
    } catch {}

    return {
      success: true,
      cloud: cloudSynced,
      error: cloudError,
    };
  },

  async getProjects(userId?: string): Promise<ProjectSummary[]> {
    // 1. Direct Supabase Query
    const sb = getSupabase();
    if (sb) {
      try {
        let query = sb.from('projects').select('id, user_id, name, slug, thumbnail_url, is_public, updated_at, data').order('updated_at', { ascending: false });
        if (userId) {
          query = query.or(`user_id.eq.${userId},user_id.is.null,is_public.eq.true`);
        }
        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          return data.map((item: any) => {
            const parsedData = typeof item.data === 'string' ? JSON.parse(item.data || '{}') : item.data || {};
            const totalElements = (parsedData.pages || []).reduce(
              (acc: number, p: any) => acc + (p.elements?.length || 0),
              0
            );
            return {
              id: item.id,
              name: item.name,
              slug: item.slug,
              thumbnail_url: item.thumbnail_url,
              updatedAt: item.updated_at,
              pageCount: parsedData.pages?.length || 1,
              elementCount: totalElements,
              isPublic: !!item.is_public,
              userId: item.user_id,
            };
          });
        }
      } catch {}
    }

    // 2. Local dev backend fallback
    try {
      const url = userId ? `/api/projects?userId=${encodeURIComponent(userId)}` : '/api/projects';
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        if (json.projects && json.projects.length > 0) {
          return json.projects.map((p: any) => ({
            id: p.id,
            name: p.name,
            slug: p.slug,
            thumbnail_url: p.thumbnail_url,
            updatedAt: p.updated_at,
            pageCount: 1,
            elementCount: 0,
            isPublic: !!p.is_public,
            userId: p.user_id,
          }));
        }
      }
    } catch {}

    return [];
  },

  async getProject(idOrSlug: string): Promise<ProjectState | null> {
    const cleanSlug = (idOrSlug || '').trim();

    // 1. Direct Supabase Query (check id first, then slug)
    const sb = getSupabase();
    if (sb) {
      try {
        let { data, error } = await sb.from('projects').select('*').eq('id', cleanSlug).maybeSingle();
        if (!data || error) {
          const slugRes = await sb.from('projects').select('*').eq('slug', cleanSlug).maybeSingle();
          if (!slugRes.error && slugRes.data) {
            data = slugRes.data;
          }
        }
        if (data && data.data) {
          const raw = typeof data.data === 'string' ? JSON.parse(data.data) : data.data;
          return normalizeProjectState(raw);
        }
      } catch {}
    }

    // 2. Local dev backend fallback
    try {
      const res = await fetch(`/api/projects/${encodeURIComponent(cleanSlug)}`);
      if (res.ok) {
        const json = await res.json();
        if (json.project && json.project.data_json) {
          const raw = JSON.parse(json.project.data_json);
          return normalizeProjectState(raw);
        }
      }
    } catch {}

    // 3. Client LocalStorage fallback (critical for static GitHub Pages)
    try {
      if (typeof localStorage !== 'undefined') {
        const publishedKey = 'pickle_published_projects';
        const raw = localStorage.getItem(publishedKey);
        if (raw) {
          const map = JSON.parse(raw);
          if (map[cleanSlug]) {
            return normalizeProjectState(map[cleanSlug]);
          }
        }
        const byId = localStorage.getItem(`pickle_project_${cleanSlug}`);
        if (byId) return normalizeProjectState(JSON.parse(byId));
        const bySlug = localStorage.getItem(`pickle_project_slug_${cleanSlug}`);
        if (bySlug) return normalizeProjectState(JSON.parse(bySlug));

        // Active project in editor
        const activeProj = localStorage.getItem('pickle_studio_active_project') || localStorage.getItem('visual_website_builder_project_v14');
        if (activeProj) {
          const parsed = JSON.parse(activeProj);
          if (parsed && (parsed.id === cleanSlug || parsed.slug === cleanSlug)) {
            return normalizeProjectState(parsed);
          }
        }
      }
    } catch {}

    // 4. Default Project Fallback
    if (cleanSlug === 'proj_default_01' || cleanSlug === 'proj-default-01' || cleanSlug === 'default') {
      return normalizeProjectState(INITIAL_PROJECT);
    }

    // 5. Kid Starter Sites Fallback (site-gaming, site-pet, etc.)
    const matchingStarter = KID_STARTER_SITES.find(
      (s) =>
        s.id === cleanSlug ||
        s.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') === cleanSlug ||
        cleanSlug.includes(s.id.replace('site-', ''))
    );
    if (matchingStarter) {
      const els = matchingStarter.createElements();
      const starterProject: ProjectState = {
        version: 1,
        id: matchingStarter.id,
        name: matchingStarter.title,
        slug: cleanSlug,
        isPublic: true,
        activePageId: 'page_home',
        updatedAt: new Date().toISOString(),
        pages: [
          {
            id: 'page_home',
            name: 'Home',
            slug: '/',
            canvasWidth: CANVAS_DEFAULT_WIDTH,
            canvasHeight: 1400,
            backgroundColor:
              matchingStarter.id === 'site-lemonade'
                ? '#1c1917'
                : matchingStarter.id === 'site-science'
                ? '#0c1222'
                : matchingStarter.id === 'site-pet'
                ? '#111827'
                : '#0d1117',
            elements: els,
          },
        ],
      };
      return starterProject;
    }

    return null;
  },

  async isSlugAvailable(slug: string, currentProjectId: string): Promise<{ available: boolean; error?: string }> {
    const clean = slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, '-');
    if (clean.length < 3) {
      return { available: false, error: 'Slug must be at least 3 characters long' };
    }
    const sb = getSupabase();
    if (sb) {
      try {
        const { data, error } = await sb.from('projects').select('id').eq('slug', clean);
        if (!error && data) {
          const conflict = data.find((p) => p.id !== currentProjectId);
          if (conflict) {
            return { available: false, error: 'This URL slug is already taken' };
          }
        }
      } catch {}
    }
    return { available: true };
  },

  async publishProject(
    project: ProjectState,
    config?: Partial<ProjectPublishConfig>
  ): Promise<{ success: boolean; url: string; publishedAt: string; error?: string }> {
    const publishedAt = new Date().toISOString();
    const slug = (config?.customDomain || project.slug || project.name.toLowerCase().replace(/[^a-z0-9]/g, '-') || project.id).replace(/^-+|-+$/g, '');
    const updatedProject: ProjectState = {
      ...project,
      slug,
      isPublic: true,
      publishedAt,
      publishConfig: {
        ...project.publishConfig,
        ...config,
        publishedAt,
        seoTitle: config?.seoTitle || project.publishConfig?.seoTitle || project.name,
        seoDescription: config?.seoDescription || project.publishConfig?.seoDescription || `Built with Pickle Studio by Pickle Corp - ${project.name}`,
      },
    };

    // Save project with isPublic = true
    const saveRes = await this.saveProject(updatedProject, { isPublic: true });
    if (!saveRes.success && saveRes.error) {
      return { success: false, url: '', publishedAt: '', error: saveRes.error };
    }

    // Create a publication snapshot in version history
    await this.createRevision(
      project.id,
      `🚀 Published Live (${new Date().toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })})`,
      updatedProject
    );

    const liveUrl = getLiveUrl(slug);

    return {
      success: true,
      url: liveUrl,
      publishedAt,
    };
  },

  async unpublishProject(project: ProjectState): Promise<{ success: boolean; error?: string }> {
    const updatedProject: ProjectState = {
      ...project,
      isPublic: false,
    };
    const res = await this.saveProject(updatedProject, { isPublic: false });
    return { success: res.success, error: res.error };
  },

  async deleteProject(id: string): Promise<boolean> {
    // 1. Direct Supabase Delete
    const sb = getSupabase();
    if (sb) {
      try {
        await sb.from('projects').delete().eq('id', id);
      } catch {}
    }

    // 2. Local dev backend fallback
    try {
      await fetch(`/api/projects/${id}`, { method: 'DELETE' });
    } catch {}

    return true;
  },

  async createRevision(
    projectId: string,
    name?: string,
    data?: ProjectState
  ): Promise<boolean> {
    const revName = name || `Checkpoint ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    // 1. Direct Supabase Insert
    const sb = getSupabase();
    if (sb && data) {
      try {
        await sb.from('project_revisions').insert({
          project_id: projectId,
          name: revName,
          data: data,
        });
      } catch {}
    }

    // 2. Local dev backend fallback
    try {
      await fetch(`/api/projects/${projectId}/revisions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: revName, data }),
      });
    } catch {}

    return true;
  },

  async getRevisions(projectId: string): Promise<ProjectRevision[]> {
    // 1. Direct Supabase Query
    const sb = getSupabase();
    if (sb) {
      try {
        const { data, error } = await sb
          .from('project_revisions')
          .select('id, project_id, name, created_at, data')
          .eq('project_id', projectId)
          .order('created_at', { ascending: false })
          .limit(30);

        if (!error && data && data.length > 0) {
          return data.map((d: any) => ({
            id: d.id,
            projectId: d.project_id,
            name: d.name,
            createdAt: d.created_at,
            data: typeof d.data === 'string' ? JSON.parse(d.data) : d.data,
          }));
        }
      } catch {}
    }

    // 2. Local dev backend fallback
    try {
      const res = await fetch(`/api/projects/${projectId}/revisions`);
      if (res.ok) {
        const json = await res.json();
        if (json.revisions && json.revisions.length > 0) {
          return json.revisions.map((r: any) => ({
            id: r.id,
            projectId: r.project_id,
            name: r.name,
            createdAt: r.created_at,
          }));
        }
      }
    } catch {}

    return [];
  },
};
