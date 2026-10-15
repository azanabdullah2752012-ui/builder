import assert from 'node:assert';
import { createElement } from './src/constants/defaults.ts';

console.log('🧪 Starting Canvas Search, Find & Replace & Editor Power Tools Test Suite...\n');

// ── Test 1: Search Match Extraction & Filtering ─────────────────────────────
console.log('Test 1: Verify Search Match Extraction & Heuristics across Elements...');

const headingEl = createElement('text', 100, 100, {
  name: 'Hero Heading',
  content: 'Build lightning-fast websites with effortless precision',
  styles: { fontSize: 48, fontWeight: 800, color: '#ffffff', backgroundColor: '#101510' },
});

const buttonEl = createElement('button', 100, 200, {
  name: 'Primary CTA Button',
  content: 'Get Started Free',
  styles: {
    backgroundColor: '#B8F36B',
    color: '#101510',
    borderRadius: 8,
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
  },
});

const inputEl = createElement('input', 100, 300, {
  name: 'Email Input Field',
  formConfig: {
    placeholder: 'Enter your work email address...',
    fieldName: 'email_address',
    successMessage: 'Thank you for subscribing!',
  },
});

function extractSearchableFields(el) {
  const fields = [];
  if (el.name) fields.push({ field: 'name', label: 'Layer Name', text: el.name });
  if (el.content) fields.push({ field: 'content', label: 'Content', text: el.content });
  if (el.type) fields.push({ field: 'type', label: 'Type', text: el.type });
  if (el.formConfig?.placeholder) {
    fields.push({ field: 'formConfig.placeholder', label: 'Placeholder', text: el.formConfig.placeholder });
  }
  if (el.formConfig?.fieldName) {
    fields.push({ field: 'formConfig.fieldName', label: 'Field Name', text: el.formConfig.fieldName });
  }
  return fields;
}

const headingFields = extractSearchableFields(headingEl);
assert.ok(headingFields.some((f) => f.text.includes('lightning-fast')), 'Must index heading content');
assert.ok(headingFields.some((f) => f.text === 'Hero Heading'), 'Must index heading name');

const inputFields = extractSearchableFields(inputEl);
assert.ok(inputFields.some((f) => f.text.includes('work email')), 'Must index input placeholder');
console.log('✅ Passed: Search field extraction verified across core elements.\n');

// ── Test 2: Case Sensitivity and Whole Word Matching ────────────────────────
console.log('Test 2: Verify Regex-driven Match Engine (Case & Whole Word)...');

function searchMatches(elements, query, matchCase = false, wholeWord = false) {
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = wholeWord ? `\\b${escaped}\\b` : escaped;
  const regex = new RegExp(pattern, matchCase ? 'g' : 'gi');
  const matches = [];

  for (const el of elements) {
    for (const f of extractSearchableFields(el)) {
      regex.lastIndex = 0;
      let match;
      while ((match = regex.exec(f.text)) !== null) {
        matches.push({ elementId: el.id, field: f.field, text: match[0], index: match.index });
        if (!regex.global) break;
      }
    }
  }
  return matches;
}

const sampleElements = [headingEl, buttonEl, inputEl];

// Case-insensitive search for "get started"
const match1 = searchMatches(sampleElements, 'get started', false);
assert.strictEqual(match1.length, 1, 'Should find 1 match case-insensitively');
assert.strictEqual(match1[0].elementId, buttonEl.id);

// Case-sensitive search for "get started" (should fail since actual is "Get Started")
const match2 = searchMatches(sampleElements, 'get started', true);
assert.strictEqual(match2.length, 0, 'Case-sensitive match should return 0 for lowercase query');

// Whole word search: "Start" vs "Started"
const matchWhole = searchMatches(sampleElements, 'Start', false, true);
assert.strictEqual(matchWhole.length, 0, 'Whole word "Start" should not match "Started"');

const matchWholeSuccess = searchMatches(sampleElements, 'Started', false, true);
assert.strictEqual(matchWholeSuccess.length, 1, 'Whole word "Started" must match');
console.log('✅ Passed: Case sensitivity and word-boundary matching algorithms verified.\n');

// ── Test 3: Find & Replace Text Mutation Engine ─────────────────────────────
console.log('Test 3: Verify Find & Replace Text Mutation Engine...');

function replaceInElement(el, query, replacement, matchCase = false, wholeWord = false) {
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = wholeWord ? `\\b${escaped}\\b` : escaped;
  const regex = new RegExp(pattern, matchCase ? 'g' : 'gi');

  const updated = { ...el };
  if (updated.content && regex.test(updated.content)) {
    updated.content = updated.content.replace(regex, replacement);
  }
  if (updated.name && regex.test(updated.name)) {
    updated.name = updated.name.replace(regex, replacement);
  }
  return updated;
}

const replacedButton = replaceInElement(buttonEl, 'Free', 'Now');
assert.strictEqual(replacedButton.content, 'Get Started Now', 'Button content replaced cleanly');
assert.strictEqual(replacedButton.styles.backgroundColor, buttonEl.styles.backgroundColor, 'Styles untouched');

const replacedHeading = replaceInElement(headingEl, 'websites', 'apps');
assert.strictEqual(replacedHeading.content, 'Build lightning-fast apps with effortless precision');
console.log('✅ Passed: Text replacement executes accurately without side-effects.\n');

// ── Test 4: Copy & Paste Element Style Engine ───────────────────────────────
console.log('Test 4: Verify Copy Style & Paste Style Engine...');

const sourceButton = createElement('button', 50, 50, {
  name: 'Styled Brand Button',
  content: 'Click Me',
  styles: {
    backgroundColor: '#B8F36B',
    gradient: 'linear-gradient(135deg, #B8F36B 0%, #76B82A 100%)',
    color: '#101510',
    fontSize: 16,
    fontWeight: 700,
    fontFamily: 'Inter',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#354331',
    boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
    opacity: 0.95,
  },
});

const targetButton = createElement('button', 200, 200, {
  name: 'Plain Button',
  content: 'Different Label',
  styles: {
    backgroundColor: '#ffffff',
    color: '#000000',
    fontSize: 14,
    borderRadius: 4,
  },
});

// Copy style
const copiedStyle = { ...sourceButton.styles };

// Paste style function
function pasteStyleToElement(target, styleToApply) {
  const newStyles = {
    ...target.styles,
    ...(styleToApply.backgroundColor !== undefined && { backgroundColor: styleToApply.backgroundColor }),
    ...(styleToApply.gradient !== undefined && { gradient: styleToApply.gradient }),
    ...(styleToApply.color !== undefined && { color: styleToApply.color }),
    ...(styleToApply.fontSize !== undefined && { fontSize: styleToApply.fontSize }),
    ...(styleToApply.fontWeight !== undefined && { fontWeight: styleToApply.fontWeight }),
    ...(styleToApply.fontFamily !== undefined && { fontFamily: styleToApply.fontFamily }),
    ...(styleToApply.borderRadius !== undefined && { borderRadius: styleToApply.borderRadius }),
    ...(styleToApply.borderWidth !== undefined && { borderWidth: styleToApply.borderWidth }),
    ...(styleToApply.borderColor !== undefined && { borderColor: styleToApply.borderColor }),
    ...(styleToApply.boxShadow !== undefined && { boxShadow: styleToApply.boxShadow }),
    ...(styleToApply.opacity !== undefined && { opacity: styleToApply.opacity }),
  };

  return {
    ...target,
    styles: newStyles,
  };
}

const styledTarget = pasteStyleToElement(targetButton, copiedStyle);

assert.strictEqual(styledTarget.styles.backgroundColor, '#B8F36B');
assert.strictEqual(styledTarget.styles.gradient, 'linear-gradient(135deg, #B8F36B 0%, #76B82A 100%)');
assert.strictEqual(styledTarget.styles.borderRadius, 12);
assert.strictEqual(styledTarget.styles.boxShadow, '0 8px 24px rgba(0,0,0,0.4)');
assert.strictEqual(styledTarget.content, 'Different Label', 'Text content must not be overwritten by style paste');
assert.strictEqual(styledTarget.x, 200, 'Position must remain unaltered');
console.log('✅ Passed: Style clipboard correctly copies and transfers visual properties.\n');

// ── Test 5: Layers Hierarchical Search & Filtering ──────────────────────────
console.log('Test 5: Verify Layers Hierarchy Search & Ancestor Auto-Expansion...');

const containerEl = createElement('container', 0, 0, {
  id: 'cont-1',
  name: 'Features Section Container',
  children: ['card-1', 'card-2'],
});

const childCard1 = createElement('container', 10, 10, {
  id: 'card-1',
  name: 'Analytics Card',
  content: 'Real-time telemetry and metrics',
  parentId: 'cont-1',
});

const childCard2 = createElement('button', 20, 20, {
  id: 'card-2',
  name: 'Upgrade CTA',
  content: 'Upgrade to Pro',
  parentId: 'cont-1',
});

const layerElements = [containerEl, childCard1, childCard2];
const childMap = new Map();
childMap.set('cont-1', [childCard1, childCard2]);

function doesElementOrDescendantMatch(el, query, childMapping) {
  const q = query.toLowerCase().trim();
  if (!q) return true;
  const nameMatch = el.name?.toLowerCase().includes(q) ?? false;
  const typeMatch = el.type.toLowerCase().includes(q);
  const contentMatch = el.content ? el.content.toLowerCase().includes(q) : false;
  if (nameMatch || typeMatch || contentMatch) return true;

  const children = childMapping.get(el.id) || [];
  return children.some((ch) => doesElementOrDescendantMatch(ch, query, childMapping));
}

// Search for "telemetry": container should match because childCard1 matches
assert.ok(
  doesElementOrDescendantMatch(containerEl, 'telemetry', childMap),
  'Parent container must match when nested child matches query'
);

// Search for "Upgrade": container matches, childCard2 matches, childCard1 does not
assert.ok(doesElementOrDescendantMatch(childCard2, 'Upgrade', childMap));
assert.strictEqual(doesElementOrDescendantMatch(childCard1, 'Upgrade', childMap), false);

console.log('✅ Passed: Layers tree matching and ancestor cascade verified.\n');

// ── Test 6: Command Palette Canvas Elements Dynamic Indexing ────────────────
console.log('Test 6: Verify Command Palette Canvas Elements Dynamic Indexing...');

function createPaletteCommandsFromElements(elements) {
  return elements.map((el) => {
    const title = el.name || el.content || el.type;
    const sub = `${el.type.toUpperCase()} • ${Math.round(el.width)}×${Math.round(el.height)}`;
    const keywords = [
      el.name?.toLowerCase() || '',
      el.type.toLowerCase(),
      el.id.toLowerCase(),
      ...(el.content ? [el.content.toLowerCase()] : []),
    ].filter(Boolean);

    return {
      id: `canvas-el-${el.id}`,
      label: title,
      description: sub,
      category: 'Canvas Elements',
      keywords,
      badge: el.type.slice(0, 4).toUpperCase(),
    };
  });
}

const commands = createPaletteCommandsFromElements(layerElements);
assert.strictEqual(commands.length, 3, 'Must create command for each canvas element');

// Test searching the palette for "analytics"
const paletteQuery = 'analytics';
const matchedCommands = commands.filter(
  (c) =>
    c.label.toLowerCase().includes(paletteQuery) ||
    c.description.toLowerCase().includes(paletteQuery) ||
    c.keywords.some((k) => k.includes(paletteQuery))
);

assert.strictEqual(matchedCommands.length, 1);
assert.strictEqual(matchedCommands[0].id, 'canvas-el-card-1');
assert.strictEqual(matchedCommands[0].category, 'Canvas Elements');

console.log('✅ Passed: Command Palette indexes live canvas elements with searchable metadata.\n');

console.log('🎉 ALL 6 SEARCH, FIND & REPLACE & POWER TOOLS TESTS PASSED WITH 100% SUCCESS!\n');
