import React, { useState } from 'react';
import type { CanvasElement } from '../../types/editor';
import { ShoppingBag, Star, Check } from 'lucide-react';
import { addToCart } from '../../utils/cartManager';

interface ProductCardWidgetProps {
  element: CanvasElement;
  isInteractive?: boolean;
}

export const ProductCardWidget: React.FC<ProductCardWidgetProps> = ({
  element,
  isInteractive = true,
}) => {
  const config = element.productConfig || {
    title: 'Aura Wireless Headphones',
    price: 199,
    compareAtPrice: 249,
    currency: '$',
    badge: 'BEST SELLER',
    imageUrl:
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
    buttonText: 'Add to Bag',
    variants: ['Matte Black', 'Lunar Silver', 'Cosmic Blue'],
    selectedVariant: 'Matte Black',
  };

  const variants = config.variants || ['Default'];
  const [selectedVariant, setSelectedVariant] = useState(
    config.selectedVariant || variants[0] || 'Default'
  );
  const [addedAnimation, setAddedAnimation] = useState(false);

  const handleVariantClick = (v: string, e: React.MouseEvent) => {
    if (!isInteractive) return;
    e.stopPropagation();
    setSelectedVariant(v);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    if (!isInteractive) return;
    e.stopPropagation();

    addToCart({
      productId: config.productId || element.id,
      title: config.title,
      price: config.price,
      currency: config.currency,
      imageUrl: config.imageUrl,
      selectedVariant,
    });

    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1200);
  };

  const s = element.styles || {};
  const currency = config.currency || '$';

  return (
    <div
      className="w-full h-full flex flex-col justify-between overflow-hidden rounded-2xl border transition-all text-left group"
      style={{
        backgroundColor: s.backgroundColor || '#121520',
        borderColor: s.borderColor || '#262f44',
        borderWidth: s.borderWidth !== undefined ? `${s.borderWidth}px` : '1px',
        borderStyle: (s.borderStyle as any) || 'solid',
        borderRadius: s.borderRadius !== undefined ? `${s.borderRadius}px` : '16px',
        boxShadow: s.boxShadow || '0 12px 32px rgba(0, 0, 0, 0.3)',
        fontFamily: s.fontFamily,
        color: s.color || '#ffffff',
      }}
    >
      {/* Product Image Area */}
      <div className="relative w-full h-[52%] overflow-hidden bg-slate-950/60 shrink-0">
        <img
          src={config.imageUrl}
          alt={config.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 pointer-events-none"
        />

        {/* Badge Ribbon */}
        {config.badge && (
          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/30">
            {config.badge}
          </div>
        )}

        {/* Rating Star Preview */}
        <div className="absolute bottom-2.5 right-3 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[11px] font-medium text-amber-400 flex items-center gap-1 border border-white/10">
          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
          <span>4.9</span>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-4 flex-1 flex flex-col justify-between gap-3">
        <div>
          {/* Product Title */}
          <h3 className="font-semibold text-base leading-snug text-slate-100 truncate">
            {config.title}
          </h3>

          {/* Pricing */}
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-bold text-white tracking-tight">
              {currency}
              {config.price}
            </span>
            {config.compareAtPrice && config.compareAtPrice > config.price && (
              <span className="text-xs text-slate-400 line-through">
                {currency}
                {config.compareAtPrice}
              </span>
            )}
            {config.compareAtPrice && config.compareAtPrice > config.price && (
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                Save {Math.round(((config.compareAtPrice - config.price) / config.compareAtPrice) * 100)}%
              </span>
            )}
          </div>
        </div>

        {/* Variant Selection Chips */}
        {variants.length > 1 && (
          <div className="flex flex-wrap gap-1.5">
            {variants.map((variant) => {
              const active = selectedVariant === variant;
              return (
                <button
                  key={variant}
                  type="button"
                  onClick={(e) => handleVariantClick(variant, e)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg font-medium transition-all ${
                    active
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30 font-semibold'
                      : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
                  }`}
                >
                  {variant}
                </button>
              );
            })}
          </div>
        )}

        {/* Add to Bag CTA Button */}
        <button
          type="button"
          onClick={handleAddToCart}
          className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
            addedAnimation
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30'
              : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md shadow-blue-600/25'
          }`}
        >
          {addedAnimation ? (
            <>
              <Check className="w-4 h-4" />
              <span>Added to Bag!</span>
            </>
          ) : (
            <>
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>{config.buttonText || 'Add to Bag'}</span>
            </>
          )}
        </button>
      </div>

      {/* Canvas Mode Click Shield */}
      {!isInteractive && (
        <div className="absolute inset-0 bg-transparent z-10 cursor-move" />
      )}
    </div>
  );
};
