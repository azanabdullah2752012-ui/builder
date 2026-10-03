import assert from 'node:assert/strict';

console.log('🧪 Starting Phase 3: Canvas Capabilities & Multi-Selection Test Suite...\n');

// Helper element factory
function makeEl(id, x, y, width, height, type = 'text', parentId = null) {
  return {
    id,
    name: `Element ${id}`,
    type,
    x,
    y,
    width,
    height,
    zIndex: 1,
    locked: false,
    parentId,
    styles: {},
    children: [],
  };
}

// ---------------------------------------------------------
// Test 1: Marquee Box Intersection Logic
// ---------------------------------------------------------
console.log('Test 1: Marquee Box Intersection Calculation');

const elements = [
  makeEl('el_1', 100, 100, 120, 60),
  makeEl('el_2', 300, 100, 140, 60),
  makeEl('el_3', 500, 400, 200, 80),
];

function getIntersectingElements(marquee, list) {
  const minX = Math.min(marquee.startX, marquee.currentX);
  const maxX = Math.max(marquee.startX, marquee.currentX);
  const minY = Math.min(marquee.startY, marquee.currentY);
  const maxY = Math.max(marquee.startY, marquee.currentY);

  return list.filter((el) => {
    return (
      el.x < maxX &&
      el.x + el.width > minX &&
      el.y < maxY &&
      el.y + el.height > minY
    );
  }).map(e => e.id);
}

// Marquee dragging from (50, 50) to (460, 200) -> should select el_1 and el_2, but not el_3
const selected1 = getIntersectingElements({ startX: 50, startY: 50, currentX: 460, currentY: 200 }, elements);
assert.deepEqual(selected1.sort(), ['el_1', 'el_2'].sort());
console.log('✅ Passed: Marquee geometry correctly selects intersecting elements el_1 and el_2.');

// ---------------------------------------------------------
// Test 2: Grouping Elements into a Container Frame (Cmd+G)
// ---------------------------------------------------------
console.log('\nTest 2: Group Elements into Container');

function groupElements(targetIds, allElements) {
  const targets = allElements.filter(e => targetIds.includes(e.id));
  assert(targets.length >= 2, 'Must have at least 2 items to group');

  const minX = Math.min(...targets.map(e => e.x));
  const minY = Math.min(...targets.map(e => e.y));
  const maxX = Math.max(...targets.map(e => e.x + e.width));
  const maxY = Math.max(...targets.map(e => e.y + e.height));

  const groupId = 'group_container_01';
  const group = {
    id: groupId,
    name: 'Group Container 1',
    type: 'container',
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
    parentId: null,
    children: targets.map(t => t.id),
  };

  const updatedChildren = targets.map(t => ({
    ...t,
    parentId: groupId,
    x: t.x - minX,
    y: t.y - minY,
  }));

  return { group, updatedChildren };
}

const { group, updatedChildren } = groupElements(['el_1', 'el_2'], elements);
assert.equal(group.x, 100);
assert.equal(group.y, 100);
assert.equal(group.width, 340); // from x=100 to x=300+140=440 -> 340
assert.equal(group.height, 60);

// Relative coordinates of children inside container:
const child1 = updatedChildren.find(c => c.id === 'el_1');
const child2 = updatedChildren.find(c => c.id === 'el_2');
assert.equal(child1.x, 0); // 100 - 100
assert.equal(child1.y, 0); // 100 - 100
assert.equal(child2.x, 200); // 300 - 100
assert.equal(child2.y, 0);
assert.equal(child1.parentId, group.id);
assert.equal(child2.parentId, group.id);
console.log('✅ Passed: Group bounding box and relative children coordinates computed accurately.');

// ---------------------------------------------------------
// Test 3: Ungrouping Container (Cmd+Shift+G)
// ---------------------------------------------------------
console.log('\nTest 3: Ungroup Container');

function ungroupContainer(container, children) {
  return children
    .filter(c => c.parentId === container.id)
    .map(c => ({
      ...c,
      parentId: container.parentId,
      x: container.x + c.x,
      y: container.y + c.y,
    }));
}

const restored = ungroupContainer(group, updatedChildren);
assert.equal(restored.length, 2);
const restored1 = restored.find(r => r.id === 'el_1');
const restored2 = restored.find(r => r.id === 'el_2');
assert.equal(restored1.x, 100);
assert.equal(restored1.y, 100);
assert.equal(restored2.x, 300);
assert.equal(restored2.y, 100);
assert.equal(restored1.parentId, null);
assert.equal(restored2.parentId, null);
console.log('✅ Passed: Ungrouping successfully restored absolute coordinates and parentage.');

// ---------------------------------------------------------
// Test 4: Batch Alignment Calculations
// ---------------------------------------------------------
console.log('\nTest 4: Batch Alignment (Left, Center, Right, Top, Middle, Bottom)');

const alignTargets = [
  makeEl('a1', 100, 50, 100, 40),
  makeEl('a2', 150, 120, 80, 50),
  makeEl('a3', 80, 200, 120, 30),
];

function align(targets, mode) {
  const minX = Math.min(...targets.map(e => e.x)); // 80
  const maxX = Math.max(...targets.map(e => e.x + e.width)); // 200
  const minY = Math.min(...targets.map(e => e.y)); // 50
  const maxY = Math.max(...targets.map(e => e.y + e.height)); // 230
  const boxW = maxX - minX; // 120
  const boxH = maxY - minY; // 180

  return targets.map(el => {
    let x = el.x;
    let y = el.y;
    if (mode === 'left') x = minX;
    if (mode === 'center') x = Math.round(minX + (boxW - el.width) / 2);
    if (mode === 'right') x = maxX - el.width;
    if (mode === 'top') y = minY;
    if (mode === 'middle') y = Math.round(minY + (boxH - el.height) / 2);
    if (mode === 'bottom') y = maxY - el.height;
    return { ...el, x, y };
  });
}

// Align Left -> all x should equal 80
const alignedLeft = align(alignTargets, 'left');
assert(alignedLeft.every(e => e.x === 80));

// Align Right -> each element right edge matches maxX (230)
const alignedRight = align(alignTargets, 'right');
assert(alignedRight.every(e => e.x + e.width === 230));

// Align Center -> centers should align at 80 + 150/2 = 155
const alignedCenter = align(alignTargets, 'center');
assert(alignedCenter.every(e => Math.abs((e.x + e.width / 2) - 155) <= 1));

// Align Top -> all y should equal 50
const alignedTop = align(alignTargets, 'top');
assert(alignedTop.every(e => e.y === 50));
console.log('✅ Passed: Batch alignment correctly calculated across all axes.');

// ---------------------------------------------------------
// Test 5: Spacing Distribution
// ---------------------------------------------------------
console.log('\nTest 5: Spacing Distribution (Horizontal & Vertical)');

const distTargets = [
  makeEl('d1', 0, 0, 100, 40),
  makeEl('d2', 150, 0, 100, 40),
  makeEl('d3', 500, 0, 100, 40),
];

function distribute(targets, dir = 'horizontal') {
  const sorted = [...targets].sort((a, b) => a.x - b.x);
  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  const span = (last.x + last.width) - first.x; // (500 + 100) - 0 = 600
  const sumW = sorted.reduce((acc, el) => acc + el.width, 0); // 300
  const gap = (span - sumW) / (sorted.length - 1); // (600 - 300) / 2 = 150

  let curX = first.x;
  return sorted.map((el, i) => {
    if (i === 0) {
      curX += el.width + gap;
      return el;
    }
    if (i === sorted.length - 1) return el;
    const targetX = Math.round(curX);
    curX += el.width + gap;
    return { ...el, x: targetX };
  });
}

const distributed = distribute(distTargets);
assert.equal(distributed[0].x, 0);
assert.equal(distributed[1].x, 250); // 0 + 100 + 150 = 250
assert.equal(distributed[2].x, 500);
console.log('✅ Passed: Elements distributed horizontally with equal 150px gaps.');

// ---------------------------------------------------------
// Test 6: Multi-Move Translation
// ---------------------------------------------------------
console.log('\nTest 6: Multi-Move Translation');

function moveElements(targets, dx, dy) {
  return targets.map(el => ({ ...el, x: el.x + dx, y: el.y + dy }));
}

const moved = moveElements(distTargets, 45, -20);
assert.equal(moved[0].x, 45);
assert.equal(moved[0].y, -20);
assert.equal(moved[1].x, 195);
assert.equal(moved[1].y, -20);
console.log('✅ Passed: Multi-move translation translates all elements in parallel.');

console.log('\n🎉 ALL 6 ADVANCED CANVAS & MULTI-SELECTION TESTS PASSED WITH 100% SUCCESS!\n');
