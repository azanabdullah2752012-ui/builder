import assert from 'node:assert';
import { slugify, generateQrCodeSvg, generateEmbedCode, generateOpenGraphMetaTags } from './src/utils/publishUtils.ts';
import { databaseService } from './src/services/databaseService.ts';

console.log('🧪 Starting Phase 5: One-Click Publishing & Live Previews Test Suite...\n');

// Test 1: Slug sanitization
console.log('Test 1: Slugify Sanitization & URL Normalization');
assert.strictEqual(slugify('My SaaS Launch 2026!'), 'my-saas-launch-2026');
assert.strictEqual(slugify('  --Cool Project & Agency--  '), 'cool-project-agency');
assert.strictEqual(slugify('E-commerce Store #1'), 'e-commerce-store-1');
console.log('✅ Passed: Slugs accurately normalized to lowercase hyphenated URL tokens.\n');

// Test 2: QR Code Vector SVG Generation
console.log('Test 2: Vector SVG QR Code Generation');
const liveUrl = 'https://craftstudio.dev/?p=my-saas-launch-2026';
const qrSvg = generateQrCodeSvg(liveUrl, 200);
assert(qrSvg.includes('<svg'), 'QR output must contain <svg> root element');
assert(qrSvg.includes('viewBox="0 0 200 200"'), 'QR viewBox must match requested size');
assert(qrSvg.includes('<rect'), 'QR output must contain matrix rects');
assert(qrSvg.includes('fill="#0f1117"'), 'QR must have dark sleek backdrop');
console.log('✅ Passed: Valid deterministic SVG QR code matrix generated cleanly without external dependencies.\n');

// Test 3: OpenGraph & Social Meta Tag Generation
console.log('Test 3: OpenGraph & Social Sharing Meta Tags');
const mockProject = {
  version: 1,
  id: 'proj_publish_test_01',
  name: 'Acme AI Copilot',
  slug: 'acme-ai-copilot',
  isPublic: true,
  activePageId: 'page_home',
  pages: [
    {
      id: 'page_home',
      name: 'Landing Page',
      slug: '/',
      elements: [],
      canvasWidth: 1200,
      canvasHeight: 800,
      backgroundColor: '#0a0d14',
    },
  ],
  publishConfig: {
    seoTitle: 'Acme AI - Next Gen Copilot',
    seoDescription: 'Supercharge your daily coding with Acme AI.',
  },
  updatedAt: new Date().toISOString(),
};

const ogTags = generateOpenGraphMetaTags(mockProject, mockProject.pages[0], liveUrl);
assert(ogTags.includes('Acme AI - Next Gen Copilot'), 'OG tags must contain custom SEO title');
assert(ogTags.includes('Supercharge your daily coding with Acme AI.'), 'OG tags must contain custom description');
assert(ogTags.includes('<meta property="og:type" content="website">'), 'Must contain og:type');
assert(ogTags.includes('<meta property="twitter:card" content="summary_large_image">'), 'Must contain twitter card');
console.log('✅ Passed: High-fidelity OpenGraph and Twitter card meta tags generated.\n');

// Test 4: Responsive iFrame Embed Code Snippet
console.log('Test 4: Responsive Embed Snippet');
const embedHtml = generateEmbedCode(liveUrl, 'Acme AI Preview');
assert(embedHtml.includes('<iframe'), 'Embed snippet must contain <iframe>');
assert(embedHtml.includes(`src="${liveUrl}"`), 'Embed iframe must target live URL');
assert(embedHtml.includes('padding-bottom: 56.25%'), 'Embed snippet must use 16:9 responsive ratio');
console.log('✅ Passed: Responsive embed snippet correctly generated.\n');

// Test 5: Slug Availability Validator
console.log('Test 5: Slug Availability Validator');
const shortSlugCheck = await databaseService.isSlugAvailable('ab', 'proj_publish_test_01');
assert.strictEqual(shortSlugCheck.available, false, 'Slugs shorter than 3 characters must be rejected');
assert(shortSlugCheck.error?.includes('at least 3 characters'), 'Should return length error message');

const validSlugCheck = await databaseService.isSlugAvailable('valid-new-slug-2026', 'proj_publish_test_01');
assert.strictEqual(validSlugCheck.available, true, 'Valid new slug should be available');
console.log('✅ Passed: Slug availability and format validations enforce production constraints.\n');

// Test 6: Publishing Workflow & Version History Snapshot
console.log('Test 6: Publish Project Workflow');
const publishRes = await databaseService.publishProject(mockProject, {
  seoTitle: 'Acme AI - Published Version',
  seoDescription: 'Official launch release of Acme AI.',
});
assert.strictEqual(publishRes.success, true, 'Publish must succeed');
assert(publishRes.url.includes('/?p=acme-ai-copilot'), 'Publish URL must contain slug');
assert(publishRes.publishedAt, 'PublishedAt timestamp must be recorded');

// Check that a revision was created
const revisions = await databaseService.getRevisions(mockProject.id);
assert(revisions.length > 0, 'Publishing must create a release snapshot revision in history');
console.log(`✅ Passed: Project published with live URL: ${publishRes.url} and revision recorded.\n`);

// Test 7: Unpublish Workflow
console.log('Test 7: Unpublish (Take Offline) Workflow');
const unpublishRes = await databaseService.unpublishProject(mockProject);
assert.strictEqual(unpublishRes.success, true, 'Unpublish must succeed');
console.log('✅ Passed: Project took offline cleanly.\n');

// Cleanup
await databaseService.deleteProject(mockProject.id);

console.log('🎉 ALL 7 ONE-CLICK PUBLISHING & LIVE PREVIEW TESTS PASSED WITH 100% SUCCESS!\n');
