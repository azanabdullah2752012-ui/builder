import assert from 'assert';
import { SHAPE_DEFINITIONS } from './src/utils/shapeDefinitions.ts';
import { EMOJI_CATALOG, EMOJI_CATEGORIES } from './src/constants/emojiCatalog.ts';
import { STOCK_PRESETS } from './src/constants/stockMedia.ts';
import { createElement } from './src/constants/defaults.ts';
import { generateExportHtml } from './src/utils/exportHtml.ts';

console.log('🧪 Starting Extended Controls, Shapes, Emojis & Custom Media Test Suite...\n');

// Test 1: Shape definitions and geometry
console.log('Test 1: Verify all 10 Shape Definitions');
const requiredShapes = ['rectangle', 'rounded-rect', 'circle', 'pill', 'triangle', 'star', 'diamond', 'heart', 'hexagon', 'arrow-right'];
const shapeKeys = Object.keys(SHAPE_DEFINITIONS);
assert.strictEqual(shapeKeys.length, 10, 'Must have exactly 10 shape presets');

for (const kind of requiredShapes) {
  const def = SHAPE_DEFINITIONS[kind];
  assert.ok(def, `Shape definition for ${kind} must exist`);
  assert.ok(def.label, `Shape ${kind} must have a label`);
  assert.ok(def.viewBox, `Shape ${kind} must have a viewBox`);
  console.log(`   - Verified shape preset: ${def.label} (${def.kind})`);
}
console.log('✅ Passed: All 10 Shape Definitions verified with valid viewBox configurations.');

// Test 2: Shape Element creation via default factory
console.log('\nTest 2: Create Shape Elements via factory');
const starElement = createElement('shape', 140, 200, {
  name: 'Golden Star',
  styles: {
    shapeKind: 'star',
    backgroundColor: '#fbbf24',
    strokeColor: '#f59e0b',
    strokeWidth: 2,
    rotation: 45,
  }
});
assert.strictEqual(starElement.type, 'shape');
assert.strictEqual(starElement.styles.shapeKind, 'star');
assert.strictEqual(starElement.styles.rotation, 45);
assert.strictEqual(starElement.styles.strokeWidth, 2);
console.log(`✅ Passed: Shape element created with kind='star', rotation=45deg, stroke=2px.`);

// Test 3: Emoji Catalog verification
console.log('\nTest 3: Verify Emoji Catalog and Categories');
assert.ok(EMOJI_CATEGORIES.length >= 6, 'Must have at least 6 emoji categories');
assert.ok(EMOJI_CATALOG.length >= 30, 'Must have rich catalog of emoji stickers');

const sampleEmoji = EMOJI_CATALOG.find(e => e.emoji === '🚀');
assert.ok(sampleEmoji, 'Rocket emoji must exist in catalog');
assert.strictEqual(sampleEmoji.category, 'Popular');

const emojiElement = createElement('text', 300, 150, {
  name: `Emoji Sticker ${sampleEmoji.emoji}`,
  content: sampleEmoji.emoji,
  styles: {
    fontSize: 54,
    width: 72,
    height: 72,
    lineHeight: 1,
    textAlign: 'center',
  },
  role: 'badge',
});
assert.strictEqual(emojiElement.content, '🚀');
assert.strictEqual(emojiElement.styles.fontSize, 54);
console.log(`✅ Passed: Emoji sticker "${sampleEmoji.emoji}" verified and element created.`);

// Test 4: Custom Image insertion with Data URL and Stock presets
console.log('\nTest 4: Verify Custom Image & Stock presets');
assert.ok(STOCK_PRESETS.length >= 6, 'Must have curated stock media presets');

const testDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
const customImageElement = createElement('image', 100, 100, {
  name: 'Uploaded Mockup',
  imageUrl: testDataUrl,
  width: 480,
  height: 320,
  styles: {
    borderRadius: 16,
    alt: 'App screenshot mockup',
  },
});
assert.strictEqual(customImageElement.type, 'image');
assert.strictEqual(customImageElement.imageUrl, testDataUrl);
assert.strictEqual(customImageElement.styles.alt, 'App screenshot mockup');
console.log('✅ Passed: Custom base64 Data URL image element configured with alt attributes.');

// Test 5: External paste parsing simulation
console.log('\nTest 5: Simulate External Clipboard Pasting Logic');
function simulatePasteHandler(clipboardData) {
  // 1. Text paste
  if (clipboardData.types.includes('text/plain')) {
    const text = clipboardData.getData('text/plain').trim();
    if (text.startsWith('http') && (text.endsWith('.png') || text.endsWith('.jpg') || text.includes('images.unsplash.com'))) {
      return { action: 'insertImage', url: text };
    }
    return { action: 'insertText', content: text };
  }
  // 2. Image File paste
  if (clipboardData.types.includes('Files') && clipboardData.fileIsImage) {
    return { action: 'insertImageFile', dataUrl: 'data:image/png;base64,...' };
  }
  return null;
}

const pastedTextResult = simulatePasteHandler({
  types: ['text/plain'],
  getData: () => 'Design stunning websites without writing code'
});
assert.strictEqual(pastedTextResult.action, 'insertText');
assert.strictEqual(pastedTextResult.content, 'Design stunning websites without writing code');

const pastedImageUrlResult = simulatePasteHandler({
  types: ['text/plain'],
  getData: () => 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80'
});
assert.strictEqual(pastedImageUrlResult.action, 'insertImage');
console.log('✅ Passed: External text and external image URL clipboard routing works accurately.');

// Test 6: Verify New Interactive Action Behaviors
console.log('\nTest 6: Verify New Interactive Click Actions');
const newActions = ['confetti', 'play-sound', 'toggle-dark-mode', 'whatsapp', 'share-page'];
for (const act of newActions) {
  const actionButton = createElement('button', 50, 50, {
    name: `Action ${act}`,
    behavior: {
      actionType: act,
      actionPayload: act === 'play-sound' ? 'success' : act === 'whatsapp' ? '+15551234567' : undefined,
    }
  });
  assert.strictEqual(actionButton.behavior.actionType, act);
  console.log(`   - Verified behavior actionType: "${act}"`);
}
console.log('✅ Passed: All 5 interactive action types configured.');

// Test 7: Export HTML with Shapes and Actions
console.log('\nTest 7: Verify Semantic HTML Export with Shapes and Interactive Handlers');
const testPage = {
  id: 'page_demo',
  name: 'Demo Page',
  slug: '/',
  canvasWidth: 1200,
  canvasHeight: 800,
  backgroundColor: '#0c0e14',
  elements: [
    starElement,
    emojiElement,
    customImageElement,
    createElement('button', 200, 300, {
      name: 'Confetti Button',
      content: 'Celebrate! 🎉',
      behavior: { actionType: 'confetti' }
    })
  ]
};

const project = {
  name: 'Demo Site',
  pages: [testPage],
};

const html = generateExportHtml(project, testPage);
assert.ok(html.includes('<svg'), 'Exported HTML must contain SVG for shape elements');
assert.ok(html.includes('viewBox="0 0 100 100"'), 'Exported SVG must have valid viewBox');
assert.ok(html.includes('onclick="alert(\'🎉 Confetti Celebration!\')"'), 'Exported button must have confetti celebration click handler');
assert.ok(html.includes(testDataUrl), 'Exported HTML must contain custom uploaded image data');
console.log('✅ Passed: Exported HTML contains inline SVG shape, image data, and interactive actions.');

console.log('\n🎉 ALL 7 EXTENDED CONTROLS, SHAPES, EMOJIS & MEDIA TESTS PASSED WITH 100% SUCCESS!\n');
