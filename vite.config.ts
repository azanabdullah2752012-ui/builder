import react from '@vitejs/plugin-react';
import { defineConfig, type Plugin } from 'vite';
import {
  getAllUsers,
  createUser,
  deleteUser,
  getAllSubmissions,
  createSubmission,
  getDatabaseStats,
  getAllProjects,
  getProjectById,
  saveProject,
  deleteProject,
  createProjectRevision,
  getProjectRevisions,
  getRevisionById,
} from './server/database.ts';

function databaseApiPlugin(): Plugin {
  return {
    name: 'studio-database-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/')) {
          return next();
        }

        const url = new URL(req.url, 'http://localhost');
        const pathname = url.pathname;

        res.setHeader('Content-Type', 'application/json');

        // Helper to read JSON body
        const readBody = async (): Promise<Record<string, any>> => {
          return new Promise((resolve) => {
            let body = '';
            req.on('data', (chunk) => (body += chunk));
            req.on('end', () => {
              try {
                resolve(body ? JSON.parse(body) : {});
              } catch {
                resolve({});
              }
            });
          });
        };

        try {
          if (pathname === '/api/database/stats' && req.method === 'GET') {
            res.end(JSON.stringify(getDatabaseStats()));
            return;
          }

          if (pathname === '/api/database/users' && req.method === 'GET') {
            res.end(JSON.stringify({ users: getAllUsers() }));
            return;
          }

          if (pathname === '/api/auth/signup' && req.method === 'POST') {
            const body = await readBody();
            if (!body.email) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'Email is required' }));
              return;
            }
            const user = createUser({
              name: body.name || 'Anonymous User',
              email: body.email,
              plan: body.plan || 'Free Trial',
            });
            res.statusCode = 201;
            res.end(JSON.stringify({ success: true, user, message: 'Account registered to database!' }));
            return;
          }

          if (pathname === '/api/database/submissions' && req.method === 'GET') {
            res.end(JSON.stringify({ submissions: getAllSubmissions() }));
            return;
          }

          if (pathname === '/api/database/submissions' && req.method === 'POST') {
            const body = await readBody();
            createSubmission({
              page_slug: body.page_slug || '/signup',
              form_type: body.form_type || 'signup',
              name: body.name,
              email: body.email,
              payload: body.payload || body,
            });
            res.statusCode = 201;
            res.end(JSON.stringify({ success: true, message: 'Submission saved to database!' }));
            return;
          }

          if (pathname.startsWith('/api/database/users/') && req.method === 'DELETE') {
            const id = pathname.split('/').pop();
            if (id) {
              deleteUser(id);
              res.end(JSON.stringify({ success: true }));
              return;
            }
          }

          // Projects API
          if (pathname === '/api/projects' && req.method === 'GET') {
            const userId = url.searchParams.get('userId') || undefined;
            res.end(JSON.stringify({ projects: getAllProjects(userId) }));
            return;
          }

          if (pathname === '/api/projects' && req.method === 'POST') {
            const body = await readBody();
            if (!body.id || !body.name) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'Project id and name are required' }));
              return;
            }
            const result = saveProject({
              id: body.id,
              user_id: body.user_id,
              name: body.name,
              slug: body.slug,
              data_json: typeof body.data === 'string' ? body.data : JSON.stringify(body.data || {}),
              thumbnail_url: body.thumbnail_url,
              is_public: body.is_public,
            });
            res.end(JSON.stringify(result));
            return;
          }

          if (pathname.startsWith('/api/projects/') && !pathname.includes('/revisions')) {
            const id = pathname.replace('/api/projects/', '');
            if (req.method === 'GET') {
              const proj = getProjectById(id);
              if (!proj) {
                res.statusCode = 404;
                res.end(JSON.stringify({ error: 'Project not found' }));
                return;
              }
              res.end(JSON.stringify({ project: proj }));
              return;
            }
            if (req.method === 'DELETE') {
              deleteProject(id);
              res.end(JSON.stringify({ success: true }));
              return;
            }
          }

          // Project Revisions API
          if (pathname.includes('/revisions')) {
            const parts = pathname.split('/');
            const projectId = parts[3]; // /api/projects/:id/revisions
            if (req.method === 'GET' && parts.length === 5) {
              const rev = getRevisionById(parts[4]);
              res.end(JSON.stringify({ revision: rev }));
              return;
            }
            if (req.method === 'GET') {
              res.end(JSON.stringify({ revisions: getProjectRevisions(projectId) }));
              return;
            }
            if (req.method === 'POST') {
              const body = await readBody();
              createProjectRevision(projectId, body.name, body.data ? JSON.stringify(body.data) : undefined);
              res.end(JSON.stringify({ success: true }));
              return;
            }
          }

          res.statusCode = 404;
          res.end(JSON.stringify({ error: 'Endpoint not found' }));
        } catch (err: any) {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: err.message || 'Internal server error' }));
        }
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [react(), databaseApiPlugin()],
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        entryFileNames: 'assets/app.js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith('.css')) {
            return 'assets/app.css';
          }
          return 'assets/[name].[ext]';
        },
      },
    },
  },
});
