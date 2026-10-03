import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  X,
  Plus,
  Minus,
  Trash2,
  Tag,
  CreditCard,
  Lock,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';
import {
  getCartItems,
  isCartOpen,
  setCartOpen,
  updateQuantity,
  removeFromCart,
  clearCart,
  getCartSubtotal,
  applyPromoCode,
  getAppliedPromo,
  getDiscountAmount,
  getFinalTotal,
  subscribeToCart,
} from '../../utils/cartManager';

interface CartDrawerProps {
  onCheckout?: (total: number, items: ReturnType<typeof getCartItems>) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onCheckout }) => {
  const [open, setOpen] = useState(isCartOpen());
  const [items, setItems] = useState(getCartItems());
  const [promoInput, setPromoInput] = useState('');
  const [promoMessage, setPromoMessage] = useState<{ text: string; success: boolean } | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutComplete, setCheckoutComplete] = useState(false);

  useEffect(() => {
    const unsub = subscribeToCart(() => {
      setOpen(isCartOpen());
      setItems(getCartItems());
    });
    return unsub;
  }, []);

  const subtotal = getCartSubtotal();
  const appliedPromo = getAppliedPromo();
  const discount = getDiscountAmount();
  const total = getFinalTotal();
  const currency = items[0]?.currency || '$';

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim()) return;
    const res = applyPromoCode(promoInput);
    setPromoMessage({ text: res.message, success: res.valid });
    if (res.valid) {
      setPromoInput('');
    }
  };

  const handleCheckout = () => {
    if (items.length === 0) return;
    setIsCheckingOut(true);
    setTimeout(() => {
      setIsCheckingOut(false);
      setCheckoutComplete(true);
      if (onCheckout) {
        onCheckout(total, items);
      }
      setTimeout(() => {
        clearCart();
        setCheckoutComplete(false);
        setCartOpen(false);
      }, 2500);
    }, 1200);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={() => setCartOpen(false)}
      />

      {/* Drawer Container */}
      <div className="relative w-full max-w-md bg-[#0f121d] border-l border-[#262f44] text-white shadow-2xl flex flex-col h-full z-10 animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#262f44] bg-[#141827]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold tracking-wide">Shopping Bag</h2>
              <p className="text-xs text-slate-400">
                {items.length} {items.length === 1 ? 'item' : 'items'} in your cart
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setCartOpen(false)}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {checkoutComplete ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center animate-bounce">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white">Payment Successful!</h3>
              <p className="text-sm text-slate-300 max-w-xs">
                Your simulated Stripe checkout completed successfully. Thank you for your order!
              </p>
            </div>
          ) : items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-16 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-500">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-base font-medium text-slate-200">Your bag is empty</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">
                  Explore products on the site and click "Add to Bag" to start your order.
                </p>
              </div>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 p-3.5 rounded-xl bg-[#14192b] border border-[#222a3f] hover:border-slate-700 transition-colors"
              >
                {/* Thumbnail */}
                <div className="w-20 h-20 rounded-lg overflow-hidden bg-slate-900 border border-white/10 shrink-0">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-semibold text-slate-100 truncate">
                        {item.title}
                      </h4>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.id)}
                        className="text-slate-500 hover:text-red-400 transition-colors p-1"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    {item.selectedVariant && (
                      <span className="inline-block mt-1 text-[11px] font-medium text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-md">
                        {item.selectedVariant}
                      </span>
                    )}
                  </div>

                  {/* Quantity and Price */}
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
                    <div className="flex items-center gap-2 bg-[#0c0e17] border border-[#262f44] rounded-lg px-2 py-1">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, -1)}
                        className="text-slate-400 hover:text-white p-0.5"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-xs font-semibold px-1 text-slate-200">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, 1)}
                        className="text-slate-400 hover:text-white p-0.5"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="text-sm font-bold text-white">
                      {currency}
                      {(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer with Subtotal and Checkout */}
        {items.length > 0 && !checkoutComplete && (
          <div className="p-6 border-t border-[#262f44] bg-[#141827] space-y-4">
            {/* Promo Code Input */}
            <form onSubmit={handleApplyPromo} className="flex gap-2">
              <div className="relative flex-1">
                <Tag className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Promo code (try SAVE10)"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value)}
                  className="w-full bg-[#0c0e17] border border-[#262f44] rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
              <button
                type="submit"
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors border border-slate-700"
              >
                Apply
              </button>
            </form>

            {promoMessage && (
              <p
                className={`text-xs ${
                  promoMessage.success ? 'text-emerald-400' : 'text-amber-400'
                }`}
              >
                {promoMessage.text}
              </p>
            )}

            {/* Price Breakdown */}
            <div className="space-y-1.5 text-xs text-slate-400 pt-2 border-t border-white/5">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-slate-200 font-medium">
                  {currency}
                  {subtotal.toFixed(2)}
                </span>
              </div>
              {appliedPromo && (
                <div className="flex justify-between text-emerald-400 font-medium">
                  <span>Promo ({appliedPromo.code} -{appliedPromo.discountPercent}%)</span>
                  <span>-{currency}{discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-white/10">
                <span>Total</span>
                <span className="text-base text-blue-400">
                  {currency}
                  {total.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Checkout Action Button */}
            <button
              type="button"
              onClick={handleCheckout}
              disabled={isCheckingOut}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50"
            >
              {isCheckingOut ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Securing Stripe Checkout...
                </span>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  <span>Checkout ({currency}{total.toFixed(2)})</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
              <Lock className="w-3 h-3" />
              <span>256-bit Encrypted Checkout • Stripe & Lemon Squeezy ready</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
