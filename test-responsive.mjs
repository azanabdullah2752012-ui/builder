import assert from 'assert';
import { computeResponsiveLayout } from './src/utils/responsiveLayout.ts';
import { INITIAL_PROJECT } from './src/constants/defaults.ts';

console.log('🧪 Starting Automatic Responsive Layout Test Suite...\n');

const homePage = INITIAL_PROJECT.pages[0];
const elements = homePage.elements;

console.log(`Original elements count: ${elements.length}`);
console.log(`Original desktop canvas: ${homePage.canvasWidth}x${homePage.canvasHeight}\n`);

// Test 1: Desktop Viewport (1200px)
console.log('Test 1: Verify Desktop Layout (1200px)');
const desktopResult = computeResponsiveLayout(elements, 'desktop', 1200, 820);
assert.strictEqual(desktopResult.canvasWidth, 1200);
assert.strictEqual(desktopResult.elements.length, elements.length);
console.log('✅ Passed: Desktop layout preserved.');

// Test 2: Laptop Viewport (1024px)
console.log('\nTest 2: Verify Laptop Layout (1024px)');
const laptopResult = computeResponsiveLayout(elements, 'laptop', 1200, 820);
assert.strictEqual(laptopResult.canvasWidth, 1024);
// Verify no elements overflow 1024px
for (const el of laptopResult.elements) {
  assert(
    el.x + el.width <= 1024 + 10,
    `Element ${el.name} (${el.x} + ${el.width} = ${el.x + el.width}) overflows 1024px laptop boundary`
  );
}
console.log('✅ Passed: All elements fit within 1024px laptop boundary.');

// Test 3: Tablet Viewport (768px)
console.log('\nTest 3: Verify Tablet Layout (768px)');
const tabletResult = computeResponsiveLayout(elements, 'tablet', 1200, 820);
assert.strictEqual(tabletResult.canvasWidth, 768);
for (const el of tabletResult.elements) {
  assert(
    el.x + el.width <= 768 + 10,
    `Element ${el.name} (${el.x} + ${el.width} = ${el.x + el.width}) overflows 768px tablet boundary`
  );
}
console.log('✅ Passed: All elements fit within 768px tablet boundary.');

// Test 4: Mobile Phone Viewport (390px)
console.log('\nTest 4: Verify Phone / Mobile Layout (390px)');
const mobileResult = computeResponsiveLayout(elements, 'mobile', 1200, 820);
assert.strictEqual(mobileResult.canvasWidth, 390);

// Check that cards are stacked vertically on mobile
const card1 = mobileResult.elements.find((e) => e.id === 'el_card_1');
const card2 = mobileResult.elements.find((e) => e.id === 'el_card_2');
const card3 = mobileResult.elements.find((e) => e.id === 'el_card_3');

assert(card1 && card2 && card3, 'Cards should exist');
assert(
  card2.y > card1.y,
  `Card 2 (y=${card2.y}) should be stacked below Card 1 (y=${card1.y}) on mobile`
);
assert(
  card3.y > card2.y,
  `Card 3 (y=${card3.y}) should be stacked below Card 2 (y=${card2.y}) on mobile`
);

// Check that cards fit within 390px phone width
assert(card1.width <= 390 - 32, `Card 1 width (${card1.width}) fits within phone margins`);
assert(card2.width <= 390 - 32, `Card 2 width (${card2.width}) fits within phone margins`);

// Check that heading font scaled down for phone readability
const heroHeading = mobileResult.elements.find((e) => e.id === 'el_hero_heading');
assert(heroHeading, 'Hero heading should exist');
assert(
  heroHeading.styles.fontSize < 42,
  `Heading font size (${heroHeading.styles.fontSize}px) scaled down from 42px for phone display`
);

// Check dynamic canvas height expansion
assert(
  mobileResult.canvasHeight > 820,
  `Canvas height expanded dynamically to ${mobileResult.canvasHeight}px to fit stacked mobile flow`
);

console.log(`✅ Passed: Mobile auto-reflow verified:`);
console.log(`   - Cards stacked vertically: Card 1 (y=${card1.y}) -> Card 2 (y=${card2.y}) -> Card 3 (y=${card3.y})`);
console.log(`   - Heading font scaled: 42px -> ${heroHeading.styles.fontSize}px`);
console.log(`   - Canvas height dynamically expanded: 820px -> ${mobileResult.canvasHeight}px`);

console.log('\n🎉 ALL RESPONSIVE ADAPTATION TESTS PASSED CLEANLY!');
