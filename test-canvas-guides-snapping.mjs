import assert from 'node:assert';
import {
  computeSmartSnapping,
  computeDistanceMeasurements,
} from './src/utils/snappingEngine.ts';

console.log('🧪 Starting Figma-Style Canvas Guides & Snapping Engine Test Suite...\n');

// Test 1: Sibling Edge & Center Smart Snapping
console.log('Test 1: Sibling Object Edge & Center Snapping');
const mockSibling = {
  id: 'card_1',
  name: 'Feature Card 1',
  type: 'container',
  x: 100,
  y: 100,
  width: 200,
  height: 100,
  zIndex: 1,
  styles: {},
};

const movingEl = { id: 'card_2', width: 150, height: 80 };

// Left-to-Left alignment
const snapLeft = computeSmartSnapping(
  movingEl,
  103, // 3px off 100
  300,
  [mockSibling],
  [],
  1200,
  800
);
assert.strictEqual(snapLeft.snappedX, 100, 'Must snap to sibling left edge (100px)');
assert(snapLeft.snapLines.some((l) => l.type === 'vertical' && l.position === 100));
console.log('  ✓ Left-to-Left edge snap verified');

// Center-to-Center alignment
// Sibling center = 100 + 100 = 200. Moving element center at proposedX = 200 - 75 = 125.
const snapCenter = computeSmartSnapping(
  movingEl,
  123, // 2px off 125
  300,
  [mockSibling],
  [],
  1200,
  800
);
assert.strictEqual(snapCenter.snappedX, 125, 'Must snap to sibling center (125px)');
assert(snapCenter.snapLines.some((l) => l.type === 'vertical' && l.position === 200));
console.log('  ✓ Center-to-Center alignment snap verified');

// Adjacent edge snapping (Right to Left edge)
// Sibling right edge is 300. Moving element left at 298 should snap to 300.
const snapAdjacent = computeSmartSnapping(
  movingEl,
  298,
  300,
  [mockSibling],
  [],
  1200,
  800
);
assert.strictEqual(snapAdjacent.snappedX, 300, 'Must snap to sibling outer right edge (300px)');
console.log('  ✓ Adjacent outer edge snap verified\n');

// Test 2: Canvas Center & Middle Snapping
console.log('Test 2: Canvas Artboard Center & Middle Snapping');
const centerTester = { id: 'hero_box', width: 200, height: 100 };
// Canvas width 1200 -> center is 600. Element width 200 -> x = 500
// Canvas height 800 -> center is 400. Element height 100 -> y = 350
const snapCanvas = computeSmartSnapping(
  centerTester,
  497, // 3px off 500
  348, // 2px off 350
  [],
  [],
  1200,
  800,
  { snapToCanvasCenter: true }
);

assert.strictEqual(snapCanvas.snappedX, 500, 'Must snap element center to canvas center X (600px)');
assert.strictEqual(snapCanvas.snappedY, 350, 'Must snap element middle to canvas middle Y (400px)');
assert(snapCanvas.snapLines.some((l) => l.position === 600 && l.label?.includes('Canvas Center')));
assert(snapCanvas.snapLines.some((l) => l.position === 400 && l.label?.includes('Canvas Middle')));
console.log('✅ Passed: Element cleanly snaps to Canvas Center X and Middle Y with line badges.\n');

// Test 3: User Custom Guides Snapping (from Rulers)
console.log('Test 3: User Custom Guides Snapping');
const mockGuides = [
  { id: 'guide_v1', orientation: 'vertical', position: 350 },
  { id: 'guide_h1', orientation: 'horizontal', position: 220 },
];

const snapGuide = computeSmartSnapping(
  movingEl,
  352, // 2px off vertical guide 350
  218, // 2px off horizontal guide 220
  [],
  mockGuides,
  1200,
  800,
  { snapToGuides: true }
);

assert.strictEqual(snapGuide.snappedX, 350, 'Must snap left edge to vertical user guide at 350px');
assert.strictEqual(snapGuide.snappedY, 220, 'Must snap top edge to horizontal user guide at 220px');
assert(snapGuide.snapLines.some((l) => l.label?.includes('Guide 350px')));
assert(snapGuide.snapLines.some((l) => l.label?.includes('Guide 220px')));
console.log('✅ Passed: Custom ruler guidelines snap elements with millimeter precision.\n');

// Test 4: Equal Spacing Distribution Snapping
console.log('Test 4: Equal Spacing Distribution Snapping (Row/Grid)');
const cardA = { id: 'c1', name: 'Card 1', type: 'container', x: 100, y: 100, width: 100, height: 100, zIndex: 1, styles: {} };
const cardC = { id: 'c3', name: 'Card 3', type: 'container', x: 400, y: 100, width: 100, height: 100, zIndex: 1, styles: {} };
const cardB = { id: 'c2', width: 100, height: 100 };

// Card A right = 200. Card C left = 400.
// Available gap = 400 - 200 - 100 = 100.
// Equal target gap = 50px each side.
// Snapped X should be 200 + 50 = 250px.
const snapEqual = computeSmartSnapping(
  cardB,
  247, // 3px off 250
  100,
  [cardA, cardC],
  [],
  1200,
  800,
  { snapToEqualSpacing: true }
);

assert.strictEqual(snapEqual.snappedX, 250, 'Must snap card between siblings for equal 50px distribution');
assert.strictEqual(snapEqual.equalSpacings.length, 1, 'Must emit equal spacing distribution indicator');
assert.strictEqual(snapEqual.equalSpacings[0].gap, 50);
assert.strictEqual(snapEqual.equalSpacings[0].label, '50px');
console.log('✅ Passed: Equal spacing distribution detects row gap balance and creates smart marker.\n');

// Test 5: Figma Distance Measurement - Object to Object
console.log('Test 5: Figma Alt-Key Distance Measurement (Object to Object)');
const selectedObj = { id: 'btn_hero', x: 100, y: 100, width: 100, height: 50 };
const targetObj = { id: 'card_hero', x: 250, y: 200, width: 120, height: 60 };

const distObject = computeDistanceMeasurements(selectedObj, targetObj, 1200, 800);
assert.strictEqual(distObject.isCanvasBounds, false, 'Must identify object-to-object measurement');
assert.strictEqual(distObject.rightGap, 50, 'Distance between selected right (200) and target left (250) must be 50px');
assert.strictEqual(distObject.bottomGap, 50, 'Distance between selected bottom (150) and target top (200) must be 50px');
console.log('✅ Passed: Element-to-element gap dimensions accurately computed.\n');

// Test 6: Figma Distance Measurement - Object to Canvas Artboard Edges
console.log('Test 6: Figma Alt-Key Distance Measurement (Object to Canvas Bounds)');
const distCanvas = computeDistanceMeasurements(selectedObj, null, 1200, 800);
assert.strictEqual(distCanvas.isCanvasBounds, true, 'Must identify canvas artboard bounds measurement');
assert.strictEqual(distCanvas.topGap, 100, 'Top gap to artboard boundary must be 100px');
assert.strictEqual(distCanvas.leftGap, 100, 'Left gap to artboard boundary must be 100px');
assert.strictEqual(distCanvas.rightGap, 1000, 'Right gap: 1200 - (100+100) = 1000px');
assert.strictEqual(distCanvas.bottomGap, 650, 'Bottom gap: 800 - (100+50) = 650px');
console.log('✅ Passed: Canvas artboard 4-directional perimeter distances accurately computed.\n');

console.log('🎉 ALL 6 FIGMA-STYLE CANVAS GUIDES & SNAPPING TESTS PASSED WITH 100% SUCCESS!\n');
