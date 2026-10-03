import { normalizeProjectState } from './src/utils/projectNormalization.ts';
import { getComputedButtonStyles } from './src/utils/buttonStyles.tsx';
import { executeElementAction } from './src/utils/actionExecutor.ts';

console.log('🧪 Running Test: Legacy State Normalization & Zero Crash on Click...');

// 1. Simulating an old/corrupt localStorage state from a user's previous session
const legacyProject = {
  version: 1,
  id: 'legacy_user_project',
  name: 'Old Saved Project',
  activePageId: 'page_1',
  pages: [
    {
      id: 'page_1',
      name: 'Home',
      slug: '/',
      canvasWidth: 1200,
      canvasHeight: 800,
      elements: [
        {
          id: 'el_legacy_text',
          name: 'Old Heading',
          type: 'text',
          x: 50,
          y: 50,
          width: 200,
          height: 40,
          content: 'Hello World',
          // NOTICE: NO behavior, NO styles!
        },
        {
          id: 'el_legacy_btn',
          name: 'Old Button',
          type: 'button',
          x: 50,
          y: 120,
          width: 140,
          height: 40,
          content: 'Click Me',
          styles: { color: '#ffffff' },
          // NOTICE: NO behavior!
        },
        {
          id: 'el_legacy_container',
          name: 'Old Container',
          type: 'container',
          x: 50,
          y: 200,
          width: 400,
          height: 300,
          // Missing layout, responsive, children, behavior, styles!
        }
      ]
    }
  ]
};

// Test 1: Normalize legacy project
const normalized = normalizeProjectState(legacyProject);
console.log('Test 1: Normalize legacy project state');
if (!normalized || normalized.pages.length === 0) {
  throw new Error('Normalization failed: no pages returned');
}
for (const el of normalized.pages[0].elements) {
  if (!el.behavior || typeof el.behavior !== 'object') {
    throw new Error(`Element ${el.id} missing safe behavior object!`);
  }
  if (!el.styles || typeof el.styles !== 'object') {
    throw new Error(`Element ${el.id} missing safe styles object!`);
  }
  if (!el.behavior.actionType) {
    throw new Error(`Element ${el.id} missing default actionType!`);
  }
}
console.log('✅ Passed: All legacy elements normalized with guaranteed safe behavior & styles');

// Test 2: Verify getComputedButtonStyles does not throw with undefined behavior or baseStyles
console.log('Test 2: getComputedButtonStyles safety');
const btn1 = getComputedButtonStyles(undefined, undefined);
if (!btn1 || typeof btn1 !== 'object') {
  throw new Error('getComputedButtonStyles failed with undefined params');
}
const btn2 = getComputedButtonStyles({ actionType: 'none' }, undefined);
if (!btn2 || typeof btn2 !== 'object') {
  throw new Error('getComputedButtonStyles failed with undefined styles');
}
console.log('✅ Passed: getComputedButtonStyles works cleanly with undefined inputs');

// Test 3: Verify executeElementAction does not throw on element without behavior
console.log('Test 3: executeElementAction safety');
const mockContext = {
  showToast: (msg) => console.log('Toast:', msg),
  setActivePage: () => {},
  pages: [],
};
executeElementAction({ id: 'raw_el', name: 'Raw', type: 'button', x: 0, y: 0, width: 100, height: 40 }, mockContext);
console.log('✅ Passed: executeElementAction handled element without behavior safely');

// Test 4: Verify PropertiesPanel complies with React Rules of Hooks (no hooks after early returns)
console.log('Test 4: PropertiesPanel Rules of Hooks validation');
import fs from 'node:fs';
const propertiesPanelCode = fs.readFileSync('./src/components/SidebarRight/PropertiesPanel.tsx', 'utf-8');
const lines = propertiesPanelCode.split('\n');

let inMultiSelectReturn = false;
let firstEarlyReturnLine = -1;
let hookViolationFound = false;
let violationDetails = '';

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (line.includes('if (selectedElementIds.length > 1)') || line.includes('if (!selectedElement)')) {
    if (firstEarlyReturnLine === -1) {
      firstEarlyReturnLine = i + 1;
    }
  }
  if (firstEarlyReturnLine !== -1 && i > firstEarlyReturnLine) {
    if (/\b(useMemo|useState|useEffect|useCallback|useRef)\s*\(/.test(line)) {
      hookViolationFound = true;
      violationDetails = `Found hook call at line ${i + 1} after early return at line ${firstEarlyReturnLine}: ${line.trim()}`;
      break;
    }
  }
}

if (hookViolationFound) {
  throw new Error(`Rules of Hooks violation: ${violationDetails}`);
}
console.log('✅ Passed: PropertiesPanel adheres strictly to React Rules of Hooks with 0 post-return hook calls');

console.log('\n🎉 ALL CRASH-PREVENTION TESTS PASSED CLEANLY!');
