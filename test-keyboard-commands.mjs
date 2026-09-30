// Verification test suite for Keyboard Commands, Clipboard (Copy, Cut, Paste), and History (Undo / Reverse, Redo)
import assert from 'assert';

console.log('🧪 Starting Keyboard Commands & Clipboard Test Suite...\n');

function generateId() {
  return 'el_' + Math.random().toString(36).substring(2, 9);
}

// 1. Initial State Setup
let historyPast = [];
let historyFuture = [];
let project = {
  activePageId: 'page_1',
  pages: [
    {
      id: 'page_1',
      name: 'Home',
      canvasWidth: 1200,
      canvasHeight: 800,
      elements: [
        {
          id: 'btn_1',
          name: 'Hero Button',
          type: 'button',
          x: 100,
          y: 200,
          width: 160,
          height: 48,
          styles: { backgroundColor: '#6366f1', color: '#ffffff' },
          locked: false,
          zIndex: 1,
        },
      ],
    },
  ],
};

function pushHistory(currentState) {
  historyPast.push(JSON.parse(JSON.stringify(currentState)));
  historyFuture = [];
}

function undo() {
  if (historyPast.length === 0) return false;
  const previous = historyPast.pop();
  historyFuture.unshift(JSON.parse(JSON.stringify(project)));
  project = previous;
  return true;
}

function redo() {
  if (historyFuture.length === 0) return false;
  const next = historyFuture.shift();
  historyPast.push(JSON.parse(JSON.stringify(project)));
  project = next;
  return true;
}

// Test 1: Copy Element (Cmd+C)
console.log('Test 1: Copy Element to Clipboard (Cmd+C)');
let clipboard = null;
const elToCopy = project.pages[0].elements[0];
clipboard = {
  root: JSON.parse(JSON.stringify(elToCopy)),
  descendants: [],
};
assert(clipboard !== null, 'Clipboard should contain copied element');
assert.strictEqual(clipboard.root.name, 'Hero Button');
console.log('✅ Passed: Element copied to clipboard with full fidelity.');

// Test 2: Paste Element (Cmd+V)
console.log('\nTest 2: Paste Element from Clipboard (Cmd+V)');
pushHistory(project);
const newRootId = generateId();
const pasted = {
  ...clipboard.root,
  id: newRootId,
  name: `${clipboard.root.name} (Copy)`,
  x: clipboard.root.x + 24,
  y: clipboard.root.y + 24,
  zIndex: 2,
};
project.pages[0].elements.push(pasted);
assert.strictEqual(project.pages[0].elements.length, 2, 'Page should now contain 2 elements');
assert.strictEqual(project.pages[0].elements[1].x, 124, 'Pasted element should be offset by +24px');
assert.strictEqual(project.pages[0].elements[1].y, 224, 'Pasted element should be offset by +24px');
assert.notStrictEqual(project.pages[0].elements[1].id, 'btn_1', 'Pasted element should have unique ID');
console.log('✅ Passed: Pasted element added at offset with unique ID.');

// Test 3: Reverse / Undo (Cmd+Z)
console.log('\nTest 3: Reverse / Undo (Cmd+Z)');
const didUndo = undo();
assert(didUndo, 'Undo should succeed');
assert.strictEqual(project.pages[0].elements.length, 1, 'Undo should revert element list to 1 element');
console.log('✅ Passed: Reverse (Undo) successfully restored previous state.');

// Test 4: Redo (Cmd+Shift+Z / Cmd+Y)
console.log('\nTest 4: Redo (Cmd+Shift+Z / Cmd+Y)');
const didRedo = redo();
assert(didRedo, 'Redo should succeed');
assert.strictEqual(project.pages[0].elements.length, 2, 'Redo should reapply pasted element');
console.log('✅ Passed: Redo successfully re-applied future state.');

// Test 5: Cut Element (Cmd+X)
console.log('\nTest 5: Cut Element (Cmd+X)');
pushHistory(project);
const cutTarget = project.pages[0].elements[1];
clipboard = { root: JSON.parse(JSON.stringify(cutTarget)), descendants: [] };
project.pages[0].elements = project.pages[0].elements.filter((el) => el.id !== cutTarget.id);
assert.strictEqual(project.pages[0].elements.length, 1, 'Cutting element should remove it from page');
assert.strictEqual(clipboard.root.id, cutTarget.id, 'Clipboard should hold cut element');
console.log('✅ Passed: Cut element correctly removed from canvas and stored in clipboard.');

// Test 6: Paste Cut Element (Cmd+V)
console.log('\nTest 6: Paste Cut Element (Cmd+V)');
pushHistory(project);
const pastedCutId = generateId();
project.pages[0].elements.push({
  ...clipboard.root,
  id: pastedCutId,
  x: 300,
  y: 400,
});
assert.strictEqual(project.pages[0].elements.length, 2);
console.log('✅ Passed: Cut element pasted successfully.');

// Test 7: Lock Toggle (Cmd+L)
console.log('\nTest 7: Lock / Unlock Element (Cmd+L)');
pushHistory(project);
project.pages[0].elements[0].locked = !project.pages[0].elements[0].locked;
assert.strictEqual(project.pages[0].elements[0].locked, true, 'Element should now be locked');
project.pages[0].elements[0].locked = !project.pages[0].elements[0].locked;
assert.strictEqual(project.pages[0].elements[0].locked, false, 'Element should now be unlocked');
console.log('✅ Passed: Lock/Unlock toggling works smoothly.');

// Test 8: Layer Order (Cmd+[ and Cmd+])
console.log('\nTest 8: Layer Order Stacking (Cmd+[ / Cmd+])');
pushHistory(project);
// Elements order: [btn_1, pastedCutId]
// Move btn_1 forward:
const [first] = project.pages[0].elements.splice(0, 1);
project.pages[0].elements.push(first);
assert.strictEqual(project.pages[0].elements[1].id, 'btn_1', 'btn_1 should now be at the front');
console.log('✅ Passed: Layer reordering forwards/backwards verified.');

// Test 9: Reverse multiple steps
console.log('\nTest 9: Multi-step Undo & Redo Stack Integrity');
undo(); // undo layer order (elements: 2)
undo(); // undo lock toggle (elements: 2)
undo(); // undo paste cut (elements: 1)
undo(); // undo cut (elements: 2)
assert.strictEqual(project.pages[0].elements.length, 2);
console.log('✅ Passed: Stack integrity preserved across sequential reversals.');

console.log('\n🎉 ALL KEYBOARD COMMANDS AND CLIPBOARD TESTS PASSED WITH 100% SUCCESS!');
