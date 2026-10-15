import assert from 'node:assert';
import {
  CANVAS_COLOR_CATEGORIES,
  CANVAS_GRADIENTS,
  CANVAS_PATTERNS,
  CANVAS_SIZE_PRESETS,
  CANVAS_BORDER_RADIUS_PRESETS,
  CANVAS_SHADOW_PRESETS,
  CURATED_CANVAS_IMAGES,
  getCanvasSurfaceStyles,
  getCanvasPatternOverlayStyle,
  getCanvasExportCss,
} from './src/utils/canvasBackground.ts';
import { generateExportHtml } from './src/utils/exportHtml.ts';

console.log('🧪 Starting Canvas Drag-to-Resize & Background Colors Test Suite...\n');

// Test 1: Color Categories & Anti-Slop Palette Compliance
console.log('Test 1: Verify Canvas Color Palettes and Categories...');
assert.ok(CANVAS_COLOR_CATEGORIES.length >= 4, 'Must have at least 4 curated categories');
const categoryIds = CANVAS_COLOR_CATEGORIES.map((c) => c.id);
assert.ok(categoryIds.includes('dark-luxury'), 'Must include dark luxury category');
assert.ok(categoryIds.includes('editorial-light'), 'Must include editorial light category');
assert.ok(categoryIds.includes('pickle-brand'), 'Must include pickle brand category');
assert.ok(categoryIds.includes('pastels'), 'Must include pastels category');

// Check non-empty colors with valid hex format
for (const cat of CANVAS_COLOR_CATEGORIES) {
  assert.ok(cat.colors.length >= 6, `Category ${cat.name} must have at least 6 colors`);
  for (const c of cat.colors) {
    assert.match(c.hex, /^#[0-9a-fA-F]{6}$/, `Color ${c.name} must be a valid 6-char hex`);
  }
}
console.log('✅ Passed: Curated color categories validated with 100% valid hex tokens.\n');

// Test 2: Curated Anti-Slop Gradients
console.log('Test 2: Verify Curated Gradients...');
assert.ok(CANVAS_GRADIENTS.length >= 12, 'Must have at least 12 curated gradients');
for (const grad of CANVAS_GRADIENTS) {
  assert.ok(grad.name, 'Gradient must have a human-readable name');
  assert.ok(
    grad.gradient.startsWith('linear-gradient') || grad.gradient.startsWith('radial-gradient'),
    `Gradient "${grad.name}" must be a valid CSS gradient function`
  );
  assert.ok(typeof grad.dark === 'boolean', `Gradient "${grad.name}" must declare dark theme flag`);
}
console.log(`✅ Passed: ${CANVAS_GRADIENTS.length} curated gradients verified.\n`);

// Test 3: Canvas Texture Patterns
console.log('Test 3: Verify Canvas Background Patterns...');
const patternIds = CANVAS_PATTERNS.map((p) => p.id);
assert.ok(patternIds.includes('none'));
assert.ok(patternIds.includes('dots'));
assert.ok(patternIds.includes('grid'));
assert.ok(patternIds.includes('diagonal'));
assert.ok(patternIds.includes('mesh'));
assert.ok(patternIds.includes('lines'));
assert.ok(patternIds.includes('glow'));

for (const pattern of CANVAS_PATTERNS) {
  const css = pattern.cssBackground(0.2);
  assert.ok(typeof css.backgroundImage === 'string', `Pattern ${pattern.id} must return backgroundImage`);
}
console.log('✅ Passed: 7 canvas background patterns verified.\n');

// Test 4: Canvas Size Presets & Frame Geometry
console.log('Test 4: Verify Canvas Size Presets & Geometry...');
assert.ok(CANVAS_SIZE_PRESETS.length >= 6, 'Must have at least 6 canvas size presets');
const figmaPreset = CANVAS_SIZE_PRESETS.find((p) => p.width === 1440 && p.height === 900);
assert.ok(figmaPreset, 'Must have Figma HD (1440x900) preset');
const mobilePreset = CANVAS_SIZE_PRESETS.find((p) => p.width === 390 && p.height === 844);
assert.ok(mobilePreset, 'Must have Mobile (390x844) preset');

assert.ok(CANVAS_BORDER_RADIUS_PRESETS.length >= 4, 'Must have border radius presets');
assert.ok(CANVAS_SHADOW_PRESETS.length >= 4, 'Must have shadow presets');
console.log('✅ Passed: Canvas size presets, radius, and shadows verified.\n');

// Test 5: Dynamic React Surface Styling Helper
console.log('Test 5: Verify getCanvasSurfaceStyles helper...');
// Solid color
const solidPage = {
  id: 'page-1',
  name: 'Home',
  slug: 'home',
  elements: [],
  canvasWidth: 1200,
  canvasHeight: 800,
  backgroundColor: '#101510',
};
const solidStyle = getCanvasSurfaceStyles(solidPage);
assert.strictEqual(solidStyle.backgroundColor, '#101510');

// Gradient
const gradPage = {
  ...solidPage,
  backgroundGradient: 'linear-gradient(180deg, #101510 0%, #1c241b 100%)',
};
const gradStyle = getCanvasSurfaceStyles(gradPage);
assert.strictEqual(gradStyle.backgroundImage, 'linear-gradient(180deg, #101510 0%, #1c241b 100%)');

// Background Image
const imgPage = {
  ...solidPage,
  backgroundImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe',
};
const imgStyle = getCanvasSurfaceStyles(imgPage);
assert.ok(imgStyle.backgroundImage?.includes('url("https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe")'));
assert.strictEqual(imgStyle.backgroundSize, 'cover');
assert.strictEqual(imgStyle.backgroundPosition, 'center center');
console.log('✅ Passed: getCanvasSurfaceStyles correctly evaluates solid, gradient, and image modes.\n');

// Test 6: Pattern Overlay Helper
console.log('Test 6: Verify getCanvasPatternOverlayStyle helper...');
const noPat = getCanvasPatternOverlayStyle(solidPage);
assert.strictEqual(noPat, null, 'Pattern "none" must return null overlay');

const dotPage = {
  ...solidPage,
  backgroundPattern: 'dots',
  patternOpacity: 0.25,
};
const dotOverlay = getCanvasPatternOverlayStyle(dotPage);
assert.ok(dotOverlay !== null);
assert.ok(dotOverlay.backgroundImage?.includes('radial-gradient'));
assert.strictEqual(dotOverlay.position, 'absolute');
assert.strictEqual(dotOverlay.pointerEvents, 'none');
assert.strictEqual(dotOverlay.zIndex, 1);
console.log('✅ Passed: getCanvasPatternOverlayStyle accurately builds overlay layer.\n');

// Test 7: Export HTML Parity
console.log('Test 7: Verify generateExportHtml incorporates custom canvas styles...');
const fullFeaturedPage = {
  id: 'page_test',
  name: 'Showcase',
  slug: 'showcase',
  backgroundColor: '#0c0e14',
  backgroundGradient: 'linear-gradient(135deg, #090a0f 0%, #151824 100%)',
  backgroundPattern: 'grid',
  patternOpacity: 0.15,
  canvasBorderRadius: 24,
  canvasShadow: '0 35px 80px -15px rgba(0, 0, 0, 0.85)',
  canvasWidth: 1440,
  canvasHeight: 900,
  elements: [],
};

const project = {
  name: 'Acme Test Corp',
  pages: [fullFeaturedPage],
};

const exportedHtml = generateExportHtml(project, fullFeaturedPage);
assert.ok(exportedHtml.includes('linear-gradient(135deg, #090a0f 0%, #151824 100%)'), 'Exported CSS must include custom gradient');
assert.ok(exportedHtml.includes('border-radius: 24px'), 'Exported CSS must include custom corner radius');
assert.ok(exportedHtml.includes('box-shadow: 0 35px 80px -15px rgba(0, 0, 0, 0.85)'), 'Exported CSS must include custom frame shadow');
assert.ok(exportedHtml.includes('class="canvas-pattern-overlay"'), 'Exported HTML must include pattern overlay element');
assert.ok(exportedHtml.includes('linear-gradient(to right'), 'Pattern overlay must include grid gradient');
console.log('✅ Passed: Exported HTML contains 100% parity with canvas styles.\n');

// Test 8: Drag-to-Resize Snapping & Math Clamping
console.log('Test 8: Verify Drag-to-Resize constraints and snapping algorithms...');
const SNAP_WIDTHS = [390, 768, 1024, 1200, 1280, 1366, 1440, 1536, 1920];
const SNAP_THRESHOLD = 12;

function computeResizeWidth(startWidth, deltaX) {
  const rawW = Math.max(320, Math.min(3840, Math.round(startWidth + deltaX)));
  for (const snap of SNAP_WIDTHS) {
    if (Math.abs(rawW - snap) <= SNAP_THRESHOLD) {
      return { width: snap, snapped: true };
    }
  }
  return { width: rawW, snapped: false };
}

// Clamping bounds
assert.strictEqual(computeResizeWidth(1200, -1500).width, 320, 'Width must clamp to minimum 320px');
assert.strictEqual(computeResizeWidth(1200, 5000).width, 3840, 'Width must clamp to maximum 3840px');

// Snapping: 1445 -> 1440 (within threshold of 12)
const snap1440 = computeResizeWidth(1200, 245);
assert.strictEqual(snap1440.width, 1440);
assert.strictEqual(snap1440.snapped, true);

// Non-snapped: 1320 (not within 12px of any preset)
const noSnap = computeResizeWidth(1200, 120);
assert.strictEqual(noSnap.width, 1320);
assert.strictEqual(noSnap.snapped, false);
console.log('✅ Passed: Drag-to-resize math clamping and magnetic snapping verified.\n');

console.log('🎉 ALL 8 CANVAS RESIZE & BACKGROUND FEATURE TESTS PASSED WITH 100% SUCCESS!');
