import assert from 'node:assert';
import {
  saveProject,
  getAllProjects,
  getProjectById,
  deleteProject,
  createProjectRevision,
  getProjectRevisions,
  getRevisionById,
  getDatabaseStats,
} from './server/database.ts';
import { normalizeProjectState } from './src/utils/projectNormalization.ts';
import { INITIAL_PROJECT } from './src/constants/defaults.ts';

console.log('🧪 Starting Cloud Projects, Persistence & Revisions Test Suite...\n');

// Test 1: Project State Normalization with guaranteed ID
console.log('Test 1: Normalize project state & verify guaranteed ID');
const normalized = normalizeProjectState(INITIAL_PROJECT);
assert(normalized.id, 'Project must have an id');
assert(Array.isArray(normalized.pages), 'Project must have pages array');
assert(normalized.pages.length > 0, 'Project must have at least one page');
console.log(`✅ Passed: Project normalized with ID "${normalized.id}" and ${normalized.pages.length} page(s).`);

// Test 2: Save project to SQLite persistence layer
console.log('\nTest 2: Save project to SQLite backend');
const testProjectId = 'proj_test_' + Date.now().toString(36);
const saveResult = saveProject({
  id: testProjectId,
  user_id: 'user_test_123',
  name: 'Autonomous AI Cloud Landing',
  slug: 'autonomous-ai-cloud',
  data_json: JSON.stringify(normalized),
  thumbnail_url: null,
  is_public: 1,
});

assert(saveResult.success, 'saveProject should succeed');
assert.strictEqual(saveResult.id, testProjectId);
console.log(`✅ Passed: Project "${testProjectId}" saved successfully.`);

// Test 3: Retrieve project by ID and verify data fidelity
console.log('\nTest 3: Retrieve project by ID and verify data fidelity');
const fetched = getProjectById(testProjectId);
assert(fetched, 'getProjectById should return project record');
assert.strictEqual(fetched.name, 'Autonomous AI Cloud Landing');
const parsedData = JSON.parse(fetched.data_json);
assert.strictEqual(parsedData.id, normalized.id);
assert.strictEqual(parsedData.pages.length, normalized.pages.length);
console.log(`✅ Passed: Retrieved project matches saved data fidelity 100%.`);

// Test 4: List all projects and filter by user
console.log('\nTest 4: List all projects and filter by user');
const allProjects = getAllProjects();
assert(allProjects.length > 0, 'getAllProjects should return non-empty list');
const userProjects = getAllProjects('user_test_123');
assert(userProjects.some((p) => p.id === testProjectId), 'User projects must contain the newly created project');
console.log(`✅ Passed: Project listing works cleanly (${allProjects.length} total projects, user match verified).`);

// Test 5: Create project revisions (snapshots)
console.log('\nTest 5: Create project revision snapshot');
const snapName = 'V1 Before Hero Redesign';
const revResult = createProjectRevision(testProjectId, snapName, JSON.stringify(normalized));
assert(revResult.success, 'createProjectRevision should succeed');

const revisions = getProjectRevisions(testProjectId);
assert(revisions.length >= 1, 'Project revisions should contain at least 1 snapshot');
assert.strictEqual(revisions[0].name, snapName);
console.log(`✅ Passed: Snapshot "${snapName}" created and retrieved from revisions timeline.`);

// Test 6: Retrieve revision by ID and verify rollback data
console.log('\nTest 6: Retrieve revision by ID for point-in-time rollback');
const revDetail = getRevisionById(revisions[0].id);
assert(revDetail, 'Revision detail should exist');
const revParsed = JSON.parse(revDetail.data_json);
assert.strictEqual(revParsed.name, normalized.name);
console.log(`✅ Passed: Point-in-time rollback payload verified successfully.`);

// Test 7: Verify database stats count projects
console.log('\nTest 7: Verify database stats include projects');
const stats = getDatabaseStats();
assert(stats.projectCount >= 1, 'Database stats should count projects');
console.log(`✅ Passed: Database stats reflect ${stats.projectCount} stored project(s).`);

// Test 8: Clean up test project
console.log('\nTest 8: Delete test project');
const delResult = deleteProject(testProjectId);
assert(delResult.success, 'deleteProject should succeed');
const afterDel = getProjectById(testProjectId);
assert(!afterDel, 'Deleted project should no longer exist');
console.log(`✅ Passed: Test project clean up completed.`);

console.log('\n🎉 ALL CLOUD PROJECTS & PERSISTENCE TESTS PASSED WITH 100% SUCCESS!\n');
