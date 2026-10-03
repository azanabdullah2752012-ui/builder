import assert from 'node:assert';
import { auditProjectSeo, autoFixSeoIssues } from './src/utils/seoAuditEngine.ts';
import {
  trackAnalyticsEvent,
  getAnalyticsSummary,
  clearAnalyticsData,
  getStoredEvents,
} from './src/utils/analyticsEngine.ts';

console.log('🧪 Starting Studio Analytics & Real-Time SEO Command Center Test Suite...\n');

// -------------------------------------------------------------
// 1. Test SEO Audit Engine on unoptimized page
// -------------------------------------------------------------
console.log('1. Testing auditProjectSeo on unoptimized page...');

const rawPage = {
  id: 'page_test_1',
  name: 'Home',
  slug: 'home',
  elements: [
    {
      id: 'img_1',
      name: 'Hero Image',
      type: 'image',
      x: 0,
      y: 0,
      width: 400,
      height: 300,
      styles: {}, // missing alt
    },
    {
      id: 'text_1',
      name: 'Headline',
      type: 'text',
      content: 'Welcome to our studio',
      x: 0,
      y: 320,
      width: 300,
      height: 50,
      role: 'body', // missing H1
    },
  ],
};

const initialReport = auditProjectSeo(rawPage, {}, { name: 'Demo Project' });
assert.ok(typeof initialReport.score === 'number', 'Report must have numeric score');
assert.ok(initialReport.score >= 0 && initialReport.score <= 100, 'Score must be between 0 and 100');
assert.ok(['A+', 'A', 'B', 'C', 'D'].includes(initialReport.grade), 'Grade must be valid letter grade');
assert.ok(initialReport.checks.length >= 6, 'Must produce at least 6 distinct audit checks');

const missingTitleCheck = initialReport.checks.find((c) => c.id === 'title-length');
assert.ok(missingTitleCheck, 'Must include title length check');

const missingAltCheck = initialReport.checks.find((c) => c.id === 'image-alt');
assert.ok(missingAltCheck, 'Must include image alt check');
assert.strictEqual(missingAltCheck.status, 'warning', 'Image without alt must trigger warning');

const missingH1Check = initialReport.checks.find((c) => c.id === 'h1-count');
assert.ok(missingH1Check, 'Must include H1 count check');
assert.strictEqual(missingH1Check.status, 'fail', 'Page with no H1 must fail H1 check');

console.log(`   ✓ Raw page audited: Score = ${initialReport.score}, Grade = ${initialReport.grade}`);

// -------------------------------------------------------------
// 2. Test 1-Click SEO Auto-Fixer
// -------------------------------------------------------------
console.log('2. Testing autoFixSeoIssues...');

const { updatedPage, updatedPublishConfig, fixedCount } = autoFixSeoIssues(
  rawPage,
  {},
  { name: 'Apex Design' }
);

assert.ok(fixedCount > 0, `Auto-fix must fix issues (fixed: ${fixedCount})`);
assert.ok(updatedPublishConfig.seoTitle && updatedPublishConfig.seoTitle.length >= 10, 'SEO Title must be set');
assert.ok(updatedPublishConfig.seoDescription && updatedPublishConfig.seoDescription.length >= 30, 'Meta Description must be set');
assert.ok(updatedPublishConfig.ogImage, 'OpenGraph social image must be populated');

// Image alt should now be set
const fixedImage = updatedPage.elements.find((el) => el.id === 'img_1');
assert.ok(fixedImage?.styles?.alt, 'Image must now have descriptive alt text');

// Text role should now be promoted to heading-h1
const fixedHeading = updatedPage.elements.find((el) => el.id === 'text_1');
assert.strictEqual(fixedHeading?.role, 'heading-h1', 'Text element must be promoted to heading-h1');

// Re-audit the fixed page
const fixedReport = auditProjectSeo(updatedPage, updatedPublishConfig, { name: 'Apex Design' });
assert.ok(
  fixedReport.score > initialReport.score,
  `Fixed score (${fixedReport.score}) must exceed initial score (${initialReport.score})`
);
assert.ok(
  fixedReport.score >= 80,
  `Fixed score must be at least 80 (was ${fixedReport.score})`
);
console.log(`   ✓ Auto-fix successful: Score jumped from ${initialReport.score} to ${fixedReport.score} (Grade: ${fixedReport.grade})`);

// -------------------------------------------------------------
// 3. Test Analytics Engine & Event Tracking
// -------------------------------------------------------------
console.log('3. Testing Analytics Engine & Event Tracking...');

clearAnalyticsData();

const ev1 = trackAnalyticsEvent({
  type: 'pageview',
  pageSlug: 'home',
  device: 'desktop',
});
assert.ok(ev1.id.startsWith('ev_'), 'Event must have generated unique ID');
assert.strictEqual(ev1.type, 'pageview');
assert.strictEqual(ev1.device, 'desktop');

const ev2 = trackAnalyticsEvent({
  type: 'click',
  targetName: 'Get Started Now',
  pageSlug: 'home',
  device: 'mobile',
});
assert.strictEqual(ev2.targetName, 'Get Started Now');

const ev3 = trackAnalyticsEvent({
  type: 'checkout',
  targetName: 'Studio Pro Tier',
  pageSlug: 'pricing',
  device: 'desktop',
  revenue: 199,
});
assert.strictEqual(ev3.revenue, 199);

const summary = getAnalyticsSummary('7d', 'all', 5);
assert.ok(summary.totalViews >= 1, 'Total views must be tracked');
assert.ok(summary.uniqueVisitors >= 1, 'Unique visitors must be tracked');
assert.strictEqual(summary.leadsCount, 5, 'Leads count must incorporate database submissions');
assert.ok(typeof summary.conversionRate === 'number', 'Conversion rate must be calculated');
assert.ok(summary.deviceBreakdown.desktop > 0, 'Desktop device percentage must be recorded');
assert.ok(summary.topElements.length > 0, 'Must record top clicked elements');
assert.ok(summary.sources.length >= 3, 'Must report acquisition channels');

console.log(`   ✓ Analytics summary verified: Views=${summary.totalViews}, Visitors=${summary.uniqueVisitors}, Leads=${summary.leadsCount}, GMV=$${summary.totalGmv}`);

console.log('\n🎉 ALL STUDIO ANALYTICS & SEO COMMAND CENTER TESTS PASSED WITH 100% SUCCESS!\n');
