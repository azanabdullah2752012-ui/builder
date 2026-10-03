import assert from 'node:assert';
import { createElement } from './src/constants/defaults.ts';
import {
  addToCart,
  getCartItems,
  getCartCount,
  getCartSubtotal,
  updateQuantity,
  removeFromCart,
  clearCart,
  applyPromoCode,
  getAppliedPromo,
  getDiscountAmount,
  getFinalTotal,
  setCartOpen,
  isCartOpen,
  subscribeToCart,
} from './src/utils/cartManager.ts';
import { executeElementAction, ACTION_DEFINITIONS } from './src/utils/actionExecutor.ts';
import { generateExportHtml } from './src/utils/exportHtml.ts';

console.log('🧪 Starting E-Commerce & Mini-Storefront Engine Test Suite...');

// Mock browser globals for Node testing
if (typeof globalThis.window === 'undefined') {
  globalThis.window = {
    dispatchEvent: () => true,
    addEventListener: () => {},
    removeEventListener: () => {},
    open: () => {},
  };
}
if (typeof globalThis.CustomEvent === 'undefined') {
  globalThis.CustomEvent = class CustomEvent {
    constructor(type, dict) {
      this.type = type;
      this.detail = dict?.detail;
    }
  };
}

// -------------------------------------------------------------
// Test 1: Element Factory & Product Defaults
// -------------------------------------------------------------
console.log('  Test 1: Verify product-card element defaults...');
const productEl = createElement('product-card', 100, 150);

assert.strictEqual(productEl.type, 'product-card', 'Type must be product-card');
assert.ok(productEl.productConfig, 'Must have productConfig object');
assert.strictEqual(productEl.productConfig.price, 199, 'Default price should be 199');
assert.strictEqual(productEl.productConfig.currency, '$', 'Default currency should be $');
assert.strictEqual(productEl.productConfig.badge, 'BEST SELLER', 'Default badge check');
assert.ok(productEl.productConfig.imageUrl.length > 0, 'Must have product image URL');
assert.ok(productEl.productConfig.variants.length >= 2, 'Should have multiple variant choices');
assert.strictEqual(productEl.behavior.actionType, 'add-to-cart', 'Default action should be add-to-cart');
console.log('  ✅ Product card element creation verified.');

// -------------------------------------------------------------
// Test 2: CartManager Operations & Reactivity
// -------------------------------------------------------------
console.log('  Test 2: Testing CartManager operations & state machine...');
clearCart();
assert.strictEqual(getCartCount(), 0, 'Cart should be empty initially');

let notificationTriggered = false;
const unsub = subscribeToCart(() => {
  notificationTriggered = true;
});

addToCart({
  productId: 'prod_aura_pro',
  title: 'Aura Studio Wireless',
  price: 199,
  currency: '$',
  selectedVariant: 'Matte Black',
}, 1);

assert.strictEqual(getCartCount(), 1, 'Cart count should be 1');
assert.strictEqual(getCartSubtotal(), 199, 'Subtotal should be 199');
assert.strictEqual(isCartOpen(), true, 'Adding item should open cart drawer');
assert.strictEqual(notificationTriggered, true, 'Subscriber should be notified');

// Add item with same productId and same variant -> quantity increments
addToCart({
  productId: 'prod_aura_pro',
  title: 'Aura Studio Wireless',
  price: 199,
  currency: '$',
  selectedVariant: 'Matte Black',
}, 2);

assert.strictEqual(getCartCount(), 3, 'Cart count should be 3');
assert.strictEqual(getCartSubtotal(), 199 * 3, 'Subtotal should be 597');

// Quantity update
const firstItem = getCartItems()[0];
updateQuantity(firstItem.id, -1);
assert.strictEqual(getCartCount(), 2, 'Cart count should be 2 after -1 quantity update');

// Promo code discount application
const promoResult = applyPromoCode('SAVE10');
assert.strictEqual(promoResult.valid, true, 'SAVE10 should be a valid promo');
assert.strictEqual(getAppliedPromo().discountPercent, 10, 'Discount percent should be 10');
assert.strictEqual(getDiscountAmount(), 39.8, '10% discount on 398 should be 39.8');
assert.strictEqual(getFinalTotal(), 358.2, 'Final total should be 358.2');

// Remove from cart
removeFromCart(firstItem.id);
assert.strictEqual(getCartCount(), 0, 'Cart should be empty after item removal');

unsub();
console.log('  ✅ CartManager state machine verified.');

// -------------------------------------------------------------
// Test 3: Action Definitions & Dispatcher
// -------------------------------------------------------------
console.log('  Test 3: Testing E-Commerce Action Handlers in ActionExecutor...');
const openCartDef = ACTION_DEFINITIONS.find((a) => a.value === 'open-cart');
assert.ok(openCartDef, 'open-cart action must be in ACTION_DEFINITIONS');

const addToCartDef = ACTION_DEFINITIONS.find((a) => a.value === 'add-to-cart');
assert.ok(addToCartDef, 'add-to-cart action must be in ACTION_DEFINITIONS');

const checkoutDef = ACTION_DEFINITIONS.find((a) => a.value === 'checkout-stripe');
assert.ok(checkoutDef, 'checkout-stripe action must be in ACTION_DEFINITIONS');

let lastToast = null;
const mockContext = {
  showToast: (msg, type) => {
    lastToast = { msg, type };
  },
};

executeElementAction(productEl, mockContext);
assert.strictEqual(getCartCount(), 1, 'Executing add-to-cart should add item to cart');
assert.strictEqual(lastToast?.type, 'success', 'Toast should report success on add to cart');

setCartOpen(false);
const openCartButton = createElement('button', 0, 0, {
  behavior: { actionType: 'open-cart' },
});
executeElementAction(openCartButton, mockContext);
assert.strictEqual(isCartOpen(), true, 'Executing open-cart should set cart open');
console.log('  ✅ Action definitions & dispatchers verified.');

// -------------------------------------------------------------
// Test 4: Standalone HTML Export Parity
// -------------------------------------------------------------
console.log('  Test 4: Testing HTML export serialization for E-Commerce Storefront...');
const testPage = {
  id: 'page_store',
  name: 'Store Page',
  elements: [productEl, openCartButton],
};

const mockProject = {
  id: 'proj_ecom',
  name: 'Aura Sound Store',
  pages: [testPage],
  activePageId: 'page_store',
};

const exportedHtml = generateExportHtml(mockProject, testPage);

// Assert product card markup
assert.ok(exportedHtml.includes('class="el-' + productEl.id + ' studio-product-card"'), 'Must render studio-product-card');
assert.ok(exportedHtml.includes(productEl.productConfig.title), 'Must render product title');
assert.ok(exportedHtml.includes('BEST SELLER'), 'Must render badge ribbon');
assert.ok(exportedHtml.includes('studioAddToCart'), 'Must attach studioAddToCart click handler');

// Assert slide-out Cart Drawer markup
assert.ok(exportedHtml.includes('id="studio-cart-badge"'), 'Must include floating cart badge');
assert.ok(exportedHtml.includes('id="studio-cart-drawer"'), 'Must include slide-out cart drawer');
assert.ok(exportedHtml.includes('Shopping Bag'), 'Must include shopping bag header');
assert.ok(exportedHtml.includes('Checkout with Stripe'), 'Must include Stripe checkout button');

// Assert client shopping bag runtime
assert.ok(exportedHtml.includes('studioCart'), 'Must include studioCart runtime data');
assert.ok(exportedHtml.includes('function studioToggleCart'), 'Must include studioToggleCart handler');
assert.ok(exportedHtml.includes('function studioAddToCart'), 'Must include studioAddToCart handler');
assert.ok(exportedHtml.includes('function renderStudioCart'), 'Must include renderStudioCart renderer');
assert.ok(exportedHtml.includes('function studioCheckout'), 'Must include studioCheckout trigger');

console.log('  ✅ HTML export parity verified.');
console.log('🎉 E-Commerce & Mini-Storefront Engine: ALL TESTS PASSED WITH 100% SUCCESS!');
