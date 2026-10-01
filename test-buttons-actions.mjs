import assert from 'node:assert';
import { generateExportHtml } from './src/utils/exportHtml.ts';
import { createElement } from './src/constants/defaults.ts';
import { ACTION_DEFINITIONS, executeElementAction } from './src/utils/actionExecutor.ts';
import { BUTTON_VARIANTS, BUTTON_ICONS, getComputedButtonStyles, getButtonIconSvg } from './src/utils/buttonStyles.tsx';

console.log('🧪 Starting Button Features & Extended Actions Test Suite...\n');

// Test 1: Verify all 8 Button Variants exist
console.log('Test 1: Verify all 8 Button Variants metadata');
const expectedVariants = ['filled', 'gradient', 'outline', 'ghost', 'glow', '3d-push', 'glass', 'pill'];
assert.strictEqual(BUTTON_VARIANTS.length, 8, `Expected 8 variants, got ${BUTTON_VARIANTS.length}`);
for (const v of expectedVariants) {
  const found = BUTTON_VARIANTS.find((item) => item.value === v);
  assert(found, `Variant ${v} must be present in BUTTON_VARIANTS`);
  console.log(`   - Verified variant preset: ${found.label} (${found.value})`);
}
console.log('✅ Passed: All 8 Button Variants verified.\n');

// Test 2: Verify Computed Styles for each variant
console.log('Test 2: Verify Computed Styles generation for Button Variants');
for (const variant of expectedVariants) {
  const computed = getComputedButtonStyles({ actionType: 'none', buttonVariant: variant }, {});
  assert(computed, `Styles for variant ${variant} must not be null/undefined`);
  if (variant === 'gradient') {
    assert(computed.background?.includes('gradient'), 'Gradient variant must generate gradient background');
  } else if (variant === 'outline') {
    assert.strictEqual(computed.borderStyle, 'solid', 'Outline variant must have solid border');
  } else if (variant === 'pill') {
    assert.strictEqual(computed.borderRadius, '9999px', 'Pill variant must have 9999px radius');
  } else if (variant === 'glow') {
    assert(computed.boxShadow?.includes('rgba'), 'Glow variant must have radiant box shadow');
  }
}
console.log('✅ Passed: Style engine computes valid CSS rules for all variants.\n');

// Test 3: Verify Button Icons & SVG generation
console.log('Test 3: Verify 22+ Button Icons and SVG exports');
assert(BUTTON_ICONS.length >= 22, `Expected at least 22 icons, got ${BUTTON_ICONS.length}`);
for (const icon of BUTTON_ICONS) {
  if (icon.value !== 'none') {
    const svg = getButtonIconSvg(icon.value);
    assert(svg.includes('<svg') && svg.includes('</svg>'), `Icon ${icon.value} must generate valid SVG markup`);
  }
}
console.log(`✅ Passed: Verified ${BUTTON_ICONS.length} button icons with SVG vector generation.\n`);

// Test 4: Verify All 28 Action Types in ACTION_DEFINITIONS
console.log('Test 4: Verify 28 Action Types in ACTION_DEFINITIONS registry');
const expectedActions = [
  'none',
  'navigate-url',
  'navigate-page',
  'scroll-section',
  'scroll-top',
  'scroll-bottom',
  'back-to-previous',
  'copy-text',
  'open-modal',
  'toggle-visibility',
  'alert',
  'email-mailto',
  'tel-call',
  'open-sms',
  'download-file',
  'custom-js',
  'confetti',
  'play-sound',
  'toggle-dark-mode',
  'whatsapp',
  'share-page',
  'print-page',
  'launch-fullscreen',
  'vibrate-device',
  'reload-page',
  'discount-reveal',
  'submit-form',
  'accordion-toggle',
];
assert.strictEqual(ACTION_DEFINITIONS.length, 28, `Expected 28 action definitions, got ${ACTION_DEFINITIONS.length}`);
for (const act of expectedActions) {
  const found = ACTION_DEFINITIONS.find((a) => a.value === act);
  assert(found, `Action ${act} must be defined in ACTION_DEFINITIONS`);
}
console.log('✅ Passed: All 28 Action Types registered with metadata, icons, and categories.\n');

// Test 5: Verify Unified Action Execution
console.log('Test 5: Verify executeElementAction dispatcher');
let toastMessage = '';
let toastType = '';
const mockContext = {
  project: {
    id: 'proj_1',
    name: 'Test Project',
    version: 1,
    activePageId: 'page_1',
    pages: [{ id: 'page_1', name: 'Home', slug: 'home', elements: [], canvasWidth: 1200, canvasHeight: 800, backgroundColor: '#ffffff' }],
    updatedAt: new Date().toISOString(),
  },
  activePage: { id: 'page_1', name: 'Home', slug: 'home', elements: [], canvasWidth: 1200, canvasHeight: 800, backgroundColor: '#ffffff' },
  setActivePage: () => {},
  updatePageSettings: () => {},
  showToast: (msg, type) => {
    toastMessage = msg;
    toastType = type || 'info';
  },
};

// Test alert action
const alertBtn = createElement('button', 10, 10);
alertBtn.behavior = { actionType: 'alert', actionPayload: 'Test alert fired!' };
executeElementAction(alertBtn, mockContext);
assert.strictEqual(toastMessage, 'Test alert fired!');
assert.strictEqual(toastType, 'success');

// Test discount reveal action
const discountBtn = createElement('button', 10, 10);
discountBtn.behavior = { actionType: 'discount-reveal', actionPayload: 'SUPERDEAL' };
executeElementAction(discountBtn, mockContext);
assert(toastMessage.includes('SUPERDEAL'), 'Discount reveal action must mention code in toast');

// Test submit-form action
const submitBtn = createElement('button', 10, 10);
submitBtn.behavior = { actionType: 'submit-form', actionPayload: 'Sign up verified!' };
executeElementAction(submitBtn, mockContext);
assert.strictEqual(toastMessage, 'Sign up verified!');

console.log('✅ Passed: Action execution dispatcher verified across interactive actions.\n');

// Test 6: Verify HTML Export with Button Icons & Handlers
console.log('Test 6: Verify HTML export generation with Button Icons, Variants & Click Handlers');
const testBtn = createElement('button', 50, 50);
testBtn.content = 'Start Free Trial';
testBtn.behavior = {
  actionType: 'open-sms',
  actionPayload: '+1234567890?body=Hello',
  buttonVariant: 'gradient',
  buttonIcon: 'arrow-right',
  buttonIconPosition: 'right',
};

const mockProject = {
  name: 'Export Test',
  pages: [
    {
      name: 'Home',
      canvasWidth: 1200,
      canvasHeight: 800,
      elements: [testBtn],
    },
  ],
};

const html = generateExportHtml(mockProject, mockProject.pages[0]);
assert(html.includes('<button class="el-' + testBtn.id + '" id="' + testBtn.id + '" role="button"'), 'Button HTML must render proper button tag with id');
assert(html.includes('Start Free Trial'), 'Button HTML must contain button text');
assert(html.includes('<svg'), 'Button HTML must contain embedded SVG icon');
assert(html.includes('window.location.href=\'sms:+1234567890?body=Hello\''), 'Button HTML must contain open-sms onclick handler');
console.log('✅ Passed: HTML Export generates valid semantic <button> with inline SVG and onclick trigger.\n');

console.log('🎉 ALL BUTTON AND ACTION TESTS PASSED WITH 100% SUCCESS!');
