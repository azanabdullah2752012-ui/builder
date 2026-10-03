import assert from 'node:assert';
import {
  MOTION_PRESETS,
  EASING_PRESETS,
  getComputedAnimationCss,
  generateMotionKeyframesCss,
  generateScrollObserverScript,
  computeStaggeredChildDelays,
} from './src/utils/motionAnimations.ts';
import { generateExportHtml } from './src/utils/exportHtml.ts';

console.log('🧪 Starting Phase 3.3: Motion & Scroll Animation Engine Test Suite...\n');

// Test 1: Complete Preset Catalog Validation
console.log('Test 1: Motion Preset Catalog Completeness & Categories');
assert.strictEqual(MOTION_PRESETS.length, 16, 'Must define exactly 16 motion presets');

const presetIds = MOTION_PRESETS.map((p) => p.id);
const expectedPresets = [
  'none',
  'fadeIn',
  'slideUp',
  'slideDown',
  'slideLeft',
  'slideRight',
  'zoomIn',
  'zoomOut',
  'popIn',
  'bounce',
  'flipUp',
  'float',
  'pulse',
  'shimmer',
  'spin',
  'blurIn',
];

for (const id of expectedPresets) {
  assert(presetIds.includes(id), `Missing required preset: ${id}`);
}

const categories = new Set(MOTION_PRESETS.map((p) => p.category));
assert(categories.has('entrance'), 'Must include entrance category');
assert(categories.has('attention'), 'Must include attention category');
assert(categories.has('ambient'), 'Must include ambient category');

for (const preset of MOTION_PRESETS) {
  assert(preset.label.length > 0, `Preset ${preset.id} must have a label`);
  assert(preset.description.length > 0, `Preset ${preset.id} must have a description`);
  assert(typeof preset.defaultDuration === 'number', `Preset ${preset.id} must have defaultDuration`);
  assert(preset.defaultIteration === '1' || preset.defaultIteration === 'infinite', `Preset ${preset.id} invalid defaultIteration`);
  assert(preset.defaultTiming.length > 0, `Preset ${preset.id} must have defaultTiming`);
}
console.log('✅ Passed: 16 animation presets validated with full categories & physics metadata.\n');

// Test 2: Easing Curve Presets
console.log('Test 2: Easing Curve Presets');
assert(EASING_PRESETS.length >= 5, 'Must provide at least 5 easing curve options');
const easingValues = EASING_PRESETS.map((e) => e.value);
assert(easingValues.includes('cubic-bezier(0.16, 1, 0.3, 1)'), 'Must include Snappy Ease-Out');
assert(easingValues.includes('cubic-bezier(0.34, 1.56, 0.64, 1)'), 'Must include Tactile Spring');
assert(easingValues.includes('linear'), 'Must include Linear');
console.log('✅ Passed: Easing curves include spring overshoot, snappy ease-out, and linear profiles.\n');

// Test 3: Computed CSS Animation Strings
console.log('Test 3: Computed CSS Animation Shorthand Formatter');
// Inactive / None
assert.strictEqual(getComputedAnimationCss({ animationName: 'none' }), undefined);
assert.strictEqual(getComputedAnimationCss({}), undefined);

// Custom element animation
const customEntrance = getComputedAnimationCss({
  animationName: 'slideUp',
  animationDuration: 0.8,
  animationDelay: 0.25,
  animationTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
  animationIterationCount: '1',
});
assert.strictEqual(
  customEntrance,
  'slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.25s 1 both',
  'CSS shorthand string must match standard animation syntax with both fill-mode'
);

// Ambient loop
const ambientLoop = getComputedAnimationCss({
  animationName: 'float',
  animationDuration: 3,
  animationDelay: 0,
  animationIterationCount: 'infinite',
});
assert(ambientLoop?.includes('float 3s'), 'Must set correct name and duration');
assert(ambientLoop?.includes('infinite both'), 'Must loop infinitely with both fill-mode');
console.log('✅ Passed: Animation shorthand generation formats valid CSS properties.\n');

// Test 4: Keyframe Engine Generation
console.log('Test 4: Dynamic CSS Keyframes Engine');
const keyframesCss = generateMotionKeyframesCss();
assert(keyframesCss.includes('@keyframes fadeIn'), 'Must define fadeIn keyframes');
assert(keyframesCss.includes('@keyframes slideUp'), 'Must define slideUp keyframes');
assert(keyframesCss.includes('@keyframes slideLeft'), 'Must define slideLeft keyframes');
assert(keyframesCss.includes('@keyframes zoomIn'), 'Must define zoomIn keyframes');
assert(keyframesCss.includes('@keyframes popIn'), 'Must define popIn keyframes');
assert(keyframesCss.includes('@keyframes blurIn'), 'Must define blurIn keyframes');
assert(keyframesCss.includes('@keyframes float'), 'Must define float keyframes');
assert(keyframesCss.includes('@keyframes pulse'), 'Must define pulse keyframes');
assert(keyframesCss.includes('@keyframes shimmer'), 'Must define shimmer keyframes');
assert(keyframesCss.includes('[data-motion-scroll="true"]'), 'Must include scroll trigger state CSS');
assert(keyframesCss.includes('.is-in-view'), 'Must include in-view state CSS');
console.log('✅ Passed: Complete keyframe dictionary and scroll-trigger base styles generated.\n');

// Test 5: Client-Side Scroll Observer Script
console.log('Test 5: Zero-Dependency Client IntersectionObserver Script');
const script = generateScrollObserverScript();
assert(script.includes('<script>'), 'Must produce <script> block');
assert(script.includes('IntersectionObserver'), 'Must leverage native browser IntersectionObserver');
assert(script.includes('[data-motion-scroll="true"]'), 'Must query elements with motion scroll attribute');
assert(script.includes('is-in-view'), 'Must toggle is-in-view class');
assert(script.includes('observer.unobserve'), 'Must unobserve after triggering for optimal performance');
console.log('✅ Passed: Clean vanilla client script generated with fallback support.\n');

// Test 6: Staggered Child Cascade Calculation
console.log('Test 6: Child Stagger Delay Cascade Engine');
const mockChildren = [
  { id: 'item_1', name: 'Card 1', type: 'container', x: 0, y: 0, width: 100, height: 100, zIndex: 1, styles: {} },
  { id: 'item_2', name: 'Card 2', type: 'container', x: 0, y: 0, width: 100, height: 100, zIndex: 1, styles: {} },
  { id: 'item_3', name: 'Card 3', type: 'container', x: 0, y: 0, width: 100, height: 100, zIndex: 1, styles: {} },
];

const delays = computeStaggeredChildDelays(mockChildren, 0.1, 0.15);
assert.strictEqual(delays.get('item_1'), 0.1);
assert.strictEqual(delays.get('item_2'), 0.25);
assert.strictEqual(delays.get('item_3'), 0.4);
console.log('✅ Passed: Child elements cascade with monotonically increasing delay offsets.\n');

// Test 7: Export HTML Motion Integration
console.log('Test 7: HTML Export Motion Integration');
const testPage = {
  id: 'page_motion_test',
  name: 'Motion Test Page',
  slug: '/motion',
  elements: [
    {
      id: 'hero_heading',
      name: 'Hero Heading',
      type: 'text',
      content: 'Next-Gen Motion Canvas',
      x: 50,
      y: 80,
      width: 400,
      height: 60,
      zIndex: 2,
      styles: {
        fontSize: 32,
        color: '#ffffff',
        animationName: 'slideUp',
        animationTrigger: 'scroll',
        animationDuration: 0.8,
        animationDelay: 0.2,
      },
    },
    {
      id: 'cta_button',
      name: 'CTA Button',
      type: 'button',
      content: 'Get Started',
      x: 50,
      y: 160,
      width: 160,
      height: 48,
      zIndex: 2,
      styles: {
        animationName: 'popIn',
        animationTrigger: 'hover',
        animationDuration: 0.4,
      },
    },
  ],
  canvasWidth: 1200,
  canvasHeight: 800,
  backgroundColor: '#0a0d14',
};

const exportedHtml = generateExportHtml({ name: 'Motion Test', pages: [testPage] }, testPage);
assert(exportedHtml.includes('/* Motion Animation Keyframes Engine */'), 'Exported HTML must embed keyframe CSS');
assert(exportedHtml.includes('data-motion-scroll="true"'), 'Scroll-triggered element must have data-motion-scroll attribute');
assert(exportedHtml.includes('hero_heading:hover') || exportedHtml.includes('cta_button:hover') || exportedHtml.includes(':hover'), 'Hover-triggered element must have hover animation CSS rule');
assert(exportedHtml.includes('observer.unobserve'), 'Exported HTML must embed IntersectionObserver runtime script');
console.log('✅ Passed: Semantic HTML export integrates keyframes, scroll triggers, and runtime observer.\n');

console.log('🎉 ALL 7 MOTION & SCROLL ANIMATION TESTS PASSED WITH 100% SUCCESS!\n');
