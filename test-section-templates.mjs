import assert from 'assert';
import {
  SECTION_TEMPLATES,
  getSmartSectionOffsetY,
  createHeroSection,
  createHeroSplitSection,
  createNavbarSection,
  createFeatureGridSection,
  createPricingSection,
  createTestimonialsSection,
  createFaqSection,
  createCtaBannerSection,
  createFooterSection,
  createSignUpSection,
} from './src/constants/templates.ts';

console.log('🧪 Starting Pre-Built Section Templates Test Suite...\n');

// Test 1: Verify all 10 templates exist in the registry
console.log('Test 1: Verify all 10 templates exist in SECTION_TEMPLATES registry');
assert.strictEqual(SECTION_TEMPLATES.length, 10, 'Registry must contain 10 section templates');
const templateIds = SECTION_TEMPLATES.map((t) => t.id);
assert.deepStrictEqual(templateIds, [
  'hero-centered',
  'hero-split',
  'navbar-glass',
  'features-3col',
  'pricing-3tier',
  'testimonials-grid',
  'faq-accordion',
  'cta-banner',
  'footer-multi',
  'signup-card',
]);
console.log('✅ Passed: All 10 templates registered with unique IDs and categories.');

// Test 2: Verify smart offset calculation
console.log('\nTest 2: Verify getSmartSectionOffsetY calculation');
const emptyOffset = getSmartSectionOffsetY([]);
assert.strictEqual(emptyOffset, 40, 'Empty canvas should place section at default 40px');

const mockElements = [
  { id: '1', x: 0, y: 100, width: 800, height: 300 },
  { id: '2', x: 0, y: 400, width: 800, height: 250 },
];
// Max bottom = 400 + 250 = 650. Next section should be at 650 + 40 = 690.
const calculatedOffset = getSmartSectionOffsetY(mockElements);
assert.strictEqual(calculatedOffset, 690, 'Next section should be placed 40px below the lowest element');
console.log(`✅ Passed: Smart offset correctly calculated (690px below lowest element).`);

// Test 3: Generate each template and verify exact name equality & structure
console.log('\nTest 3: Generate each template and verify structure & exact matching names');
for (const tmpl of SECTION_TEMPLATES) {
  const elements = tmpl.create(150);
  assert(elements.length > 0, `Template ${tmpl.name} produced empty elements list`);
  
  // Root must be a section with name matching template name EXACTLY
  const root = elements[0];
  assert.strictEqual(root.type, 'section', `${tmpl.name} root element must be a section`);
  assert.strictEqual(root.name, tmpl.name, `Inserted section.name "${root.name}" must match template.name "${tmpl.name}" exactly`);
  assert.strictEqual(root.y, 150, `${tmpl.name} root element y must match provided offset`);
  assert(root.width >= 1000, `${tmpl.name} root section should be full-width responsive`);
  assert(root.layout && root.layout.layoutType === 'flex', `${tmpl.name} should use flex layout`);

  // Verify all elements have valid IDs and names
  const ids = new Set();
  for (const el of elements) {
    assert(el.id, `Element in ${tmpl.name} missing id`);
    assert(!ids.has(el.id), `Duplicate id ${el.id} found in ${tmpl.name}`);
    ids.add(el.id);
    assert(el.name, `Element ${el.id} in ${tmpl.name} missing name`);
  }

  // Children must reference the root section or subcontainers correctly
  for (let i = 1; i < elements.length; i++) {
    const child = elements[i];
    assert(child.parentId, `Child element ${child.name} in ${tmpl.name} should have parentId`);
    assert(ids.has(child.parentId), `Parent ID ${child.parentId} not found in template elements`);
  }

  console.log(`   - Verified ${tmpl.name}: ${elements.length} elements generated with exact name match.`);
}
console.log('✅ Passed: All 10 templates generate valid hierarchical element structures with 100% exact names.');

// Test 4: Verify dual CTAs, sign-up card, roles, and luxury styling
console.log('\nTest 4: Verify dual CTAs, sign-up form, roles, and luxury styling');
const heroElements = createHeroSection(100);
const heroPrimary = heroElements.find((el) => el.name === 'Primary CTA Button');
const heroSecondary = heroElements.find((el) => el.name === 'Secondary CTA Button');
assert(heroPrimary, 'SaaS Hero must have Primary CTA Button');
assert(heroSecondary, 'SaaS Hero must have Secondary CTA Button for dual CTAs');

const signUpElements = createSignUpSection(150);
const submitBtn = signUpElements.find((el) => el.name.includes('Account Button'));
assert(submitBtn, 'Sign-Up template must include submit button');
const emailField = signUpElements.find((el) => el.name.includes('Email'));
assert(emailField, 'Sign-Up template must include Email input field');

const ctaElements = createCtaBannerSection(200);
const ctaBtn = ctaElements.find((el) => el.type === 'button');
assert(ctaBtn, 'CTA template should include an interactive button');
assert.strictEqual(ctaBtn.role, 'button');
assert(ctaBtn.behavior?.hoverStyles, 'Button should have hoverStyles configured');

const pricingElements = createPricingSection(0);
const proCard = pricingElements.find((el) => el.name.includes('Pro Plan'));
assert(proCard, 'Pricing section should highlight Pro Plan');
assert(proCard.styles.borderColor, 'Pro card should have distinctive border styling');

console.log('✅ Passed: Dual CTAs, sign-up form, and luxury styling verified.');
console.log('\n🎉 ALL 4 PRE-BUILT SECTION TEMPLATES & SIGN-UP TESTS PASSED WITH 100% SUCCESS!');
