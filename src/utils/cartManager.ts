import type { CartItem, ProductConfig } from '../types/editor';

const STORAGE_KEY = 'studio_cart_items_v1';
const PROMO_KEY = 'studio_cart_promo_v1';

// In-memory state
let cartItems: CartItem[] = [];
let appliedPromo: { code: string; discountPercent: number } | null = null;
let isDrawerOpen = false;
const listeners = new Set<() => void>();

// Load from storage safely
function initCartFromStorage() {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      cartItems = JSON.parse(raw);
    }
    const rawPromo = localStorage.getItem(PROMO_KEY);
    if (rawPromo) {
      appliedPromo = JSON.parse(rawPromo);
    }
  } catch (e) {
    console.warn('Failed to parse cart storage:', e);
  }
}

initCartFromStorage();

function persistCart() {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems));
    if (appliedPromo) {
      localStorage.setItem(PROMO_KEY, JSON.stringify(appliedPromo));
    } else {
      localStorage.removeItem(PROMO_KEY);
    }
  } catch (e) {
    console.warn('Failed to save cart storage:', e);
  }
}

function notify() {
  persistCart();
  listeners.forEach((l) => l());
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('studio:cart:change', {
      detail: {
        items: [...cartItems],
        count: getCartCount(),
        total: getFinalTotal(),
        isOpen: isDrawerOpen,
      },
    }));
  }
}

export function getCartItems(): CartItem[] {
  return [...cartItems];
}

export function isCartOpen(): boolean {
  return isDrawerOpen;
}

export function setCartOpen(open: boolean): void {
  isDrawerOpen = open;
  notify();
}

export function toggleCart(): void {
  isDrawerOpen = !isDrawerOpen;
  notify();
}

export function addToCart(
  product: {
    productId?: string;
    title: string;
    price: number;
    currency?: string;
    imageUrl?: string;
    selectedVariant?: string;
  },
  quantity = 1
): void {
  const pId = product.productId || `prod_${Date.now()}`;
  const variant = product.selectedVariant || '';
  const existingIdx = cartItems.findIndex(
    (item) => item.productId === pId && (item.selectedVariant || '') === variant
  );

  if (existingIdx >= 0) {
    cartItems[existingIdx].quantity += quantity;
  } else {
    cartItems.push({
      id: `cart_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      productId: pId,
      title: product.title || 'Product Item',
      price: product.price || 0,
      currency: product.currency || '$',
      imageUrl: product.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
      quantity: Math.max(1, quantity),
      selectedVariant: variant || undefined,
    });
  }

  isDrawerOpen = true; // Auto-open shopping bag on add
  notify();
}

export function addProductConfigToCart(config: ProductConfig, quantity = 1): void {
  addToCart(
    {
      productId: config.productId || config.title.toLowerCase().replace(/[^a-z0-9]/g, '_'),
      title: config.title,
      price: config.price,
      currency: config.currency,
      imageUrl: config.imageUrl,
      selectedVariant: config.selectedVariant || (config.variants && config.variants[0]),
    },
    quantity
  );
}

export function updateQuantity(id: string, delta: number): void {
  const idx = cartItems.findIndex((it) => it.id === id);
  if (idx === -1) return;

  const newQty = cartItems[idx].quantity + delta;
  if (newQty <= 0) {
    cartItems.splice(idx, 1);
  } else {
    cartItems[idx].quantity = newQty;
  }
  notify();
}

export function removeFromCart(id: string): void {
  cartItems = cartItems.filter((it) => it.id !== id);
  notify();
}

export function clearCart(): void {
  cartItems = [];
  appliedPromo = null;
  notify();
}

export function getCartCount(): number {
  return cartItems.reduce((acc, it) => acc + it.quantity, 0);
}

export function getCartSubtotal(): number {
  return cartItems.reduce((acc, it) => acc + it.price * it.quantity, 0);
}

export function applyPromoCode(code: string): { valid: boolean; discountPercent: number; message: string } {
  const clean = code.trim().toUpperCase();
  if (!clean) {
    appliedPromo = null;
    notify();
    return { valid: false, discountPercent: 0, message: 'Promo code removed' };
  }

  const validPromos: Record<string, number> = {
    SAVE10: 10,
    STUDIO20: 20,
    VIP30: 30,
    LAUNCH50: 50,
  };

  if (validPromos[clean]) {
    appliedPromo = { code: clean, discountPercent: validPromos[clean] };
    notify();
    return {
      valid: true,
      discountPercent: validPromos[clean],
      message: `🎉 Code applied! ${validPromos[clean]}% discount unlocked.`,
    };
  }

  return {
    valid: false,
    discountPercent: 0,
    message: 'Invalid promo code. Try "SAVE10" or "STUDIO20".',
  };
}

export function getAppliedPromo() {
  return appliedPromo;
}

export function getDiscountAmount(): number {
  if (!appliedPromo) return 0;
  const subtotal = getCartSubtotal();
  return (subtotal * appliedPromo.discountPercent) / 100;
}

export function getFinalTotal(): number {
  const subtotal = getCartSubtotal();
  const discount = getDiscountAmount();
  return Math.max(0, subtotal - discount);
}

export function subscribeToCart(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
