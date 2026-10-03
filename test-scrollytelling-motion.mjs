import assert from 'node:assert';
import { createElement } from './src/constants/defaults.ts';
import { generateExportHtml } from './src/utils/exportHtml.ts';

console.log('🧪 Starting Cinematic Scrollytelling & Sticky Pinned Sections Test Suite...');

// -------------------------------------------------------------
// Test 1: Lottie Animation Element Creation & Defaults
// -------------------------------------------------------------
console.log('  Test 1: Verify lottie element factory defaults...');
const lottieEl = createElement('lottie', 120, 200);

assert.strictEqual(lottieEl.type, 'lottie', 'Type should be lottie');
assert.ok(lottieEl.lottieConfig, 'Should have lottieConfig');
assert.ok(lottieEl.lottieConfig.url.includes('.json'), 'Default URL should point to a Lottie JSON file');
assert.strictEqual(lottieEl.lottieConfig.autoplay, true, 'Default autoplay should be true');
assert.strictEqual(lottieEl.lottieConfig.loop, true, 'Default loop should be true');
assert.strictEqual(lottieEl.lottieConfig.speed, 1, 'Default speed should be 1');
console.log('  ✅ Lottie element defaults verified.');

// -------------------------------------------------------------
// Test 2: Sticky Pinned Section & Container Configuration
// -------------------------------------------------------------
console.log('  Test 2: Verify Sticky Pinning (Scrollytelling) styles...');
const stickyNavbar = createElement('container', 0, 0);
stickyNavbar.name = 'Sticky Glass Navbar';
stickyNavbar.styles = {
  ...stickyNavbar.styles,
  isSticky: true,
  stickyTop: 24,
  backgroundColor: 'rgba(15, 23, 42, 0.85)',
};

assert.strictEqual(stickyNavbar.styles.isSticky, true, 'isSticky should be true');
assert.strictEqual(stickyNavbar.styles.stickyTop, 24, 'stickyTop should be 24px');
console.log('  ✅ Sticky Pinning configuration verified.');

// -------------------------------------------------------------
// Test 3: Standalone HTML Export Parity for Scrollytelling
// -------------------------------------------------------------
console.log('  Test 3: Testing HTML export serialization for Scrollytelling & Lottie...');
const testPage = {
  id: 'page_scrolly',
  name: 'Scrollytelling Showcase',
  elements: [stickyNavbar, lottieEl],
  canvasWidth: 1200,
  canvasHeight: 2400,
  backgroundColor: '#0c0e14',
  showScrollProgress: true,
  scrollProgressColor: 'linear-gradient(90deg, #3b82f6, #ec4899)',
};

const mockProject = {
  id: 'proj_scrolly',
  name: 'Scrollytelling Engine',
  pages: [testPage],
  activePageId: 'page_scrolly',
};

const exportedHtml = generateExportHtml(mockProject, testPage);

// 1. Assert Sticky Positioning in CSS
assert.ok(
  exportedHtml.includes('position: sticky;'),
  'Exported CSS must generate position: sticky for pinned element'
);
assert.ok(
  exportedHtml.includes('top: 24px;'),
  'Exported CSS must set top offset to 24px for pinned element'
);
assert.ok(
  exportedHtml.includes('z-index: 40;'),
  'Exported CSS must elevate z-index to 40 for sticky element'
);

// 2. Assert Reading Progress Bar
assert.ok(
  exportedHtml.includes('id="studio-scroll-progress"'),
  'Exported HTML must include studio-scroll-progress container'
);
assert.ok(
  exportedHtml.includes('id="studio-scroll-bar"'),
  'Exported HTML must include studio-scroll-bar indicator'
);
assert.ok(
  exportedHtml.includes('linear-gradient(90deg, #3b82f6, #ec4899)'),
  'Exported HTML must apply configured gradient color to progress bar'
);
assert.ok(
  exportedHtml.includes('window.addEventListener(\'scroll\''),
  'Exported HTML must include scroll event listener for progress bar'
);

// 3. Assert Lottie Vector Motion
assert.ok(
  exportedHtml.includes('class="el-' + lottieEl.id + ' studio-lottie"'),
  'Exported HTML must render studio-lottie wrapper'
);
assert.ok(
  exportedHtml.includes('<lottie-player'),
  'Exported HTML must render <lottie-player> web component'
);
assert.ok(
  exportedHtml.includes('unpkg.com/@lottiefiles/lottie-player'),
  'Exported HTML head must load official lottie-player runtime'
);

console.log('  ✅ Standalone HTML export parity for Scrollytelling verified.');
console.log('🎉 Cinematic Scrollytelling & Sticky Pinned Sections: ALL TESTS PASSED WITH 100% SUCCESS!');
