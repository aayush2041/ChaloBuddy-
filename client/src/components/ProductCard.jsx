import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { ShoppingBag, Check, ShieldCheck } from 'lucide-react';

export default function ProductCard({
  product,
  onWishlistToggle,
  isWishlisted = false
}) {
  const { navigate, addToCart, setIsCartOpen } = useStore();
  const [added, setAdded] = useState(false);

  let images = [];
  try {
    images = typeof product.images === 'string' ? JSON.parse(product.images) : product.images || [];
  } catch {
    images = [];
  }
  const coverImage = product.image || images[0] || '/shopify_assets/hero.png';

  const priceNum = Number(product.price) || 0;
  const originalPriceNum = Number(product.original_price || product.compareAtPrice) || 0;
  const isSale = originalPriceNum > priceNum;

  const isOutOfStock = Number(product.stock) <= 0 || product.status === 'out_of_stock';

  const handleQuickAdd = (e) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    addToCart(product, 1, false);
    setAdded(true);
    setIsCartOpen(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const categoryLabel = product.category_name || product.category || 'GAMING';

  return (
    <div
      onClick={() => navigate('product', { id: product.id })}
      className="group relative bg-white border border-[#E4E4E7] hover:border-[#7C4DFF]/40 rounded-2xl transition-all duration-200 ease-out hover:-translate-y-[3px] hover:shadow-[0_10px_25px_-5px_rgba(0,0,0,0.06)] flex flex-col cursor-pointer select-none overflow-hidden"
    >
      {/* 10. PRODUCT IMAGE CONSISTENCY: aspect-ratio: 16 / 10; object-fit: cover */}
      <div className="relative w-full aspect-[16/10] bg-neutral-100 overflow-hidden flex items-center justify-center">
        <img
          src={coverImage}
          alt={product.name || product.title}
          className={`w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-103 ${isOutOfStock ? 'opacity-70 grayscale-[30%]' : ''}`}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = '/shopify_assets/hero.png';
          }}
        />

        {/* Badges: SALE, OUT OF STOCK & VERIFIED */}
        <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1.5">
          {isOutOfStock ? (
            <span className="bg-rose-600 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md shadow-xs">
              Sold Out
            </span>
          ) : isSale ? (
            <span className="bg-[#09090B] text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md shadow-xs">
              SALE
            </span>
          ) : (
            <span className="bg-white/90 backdrop-blur-xs text-[#09090B] text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border border-[#E4E4E7]">
              HOT
            </span>
          )}
        </div>

        <div className="absolute top-2.5 right-2.5 z-10">
          <span className="bg-white/95 backdrop-blur-xs text-emerald-700 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1 shadow-xs">
            <ShieldCheck className="w-3 h-3 text-emerald-600" />
            <span>Verified</span>
          </span>
        </div>
      </div>

      {/* Product Details Section */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Game Category */}
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#7C4DFF] mb-1">
            {categoryLabel}
          </div>

          {/* Product Name (Prominent) */}
          <h3 className="font-heading font-bold text-[15px] text-[#09090B] group-hover:text-[#7C4DFF] transition-colors line-clamp-1 leading-snug">
            {product.name || product.title}
          </h3>

          {/* Rank / Details Metadata (Smaller) */}
          <p className="text-[13px] text-[#71717A] mt-1 line-clamp-1">
            {product.short_desc || product.rank || 'Instant escrow-verified digital asset'}
          </p>
        </div>

        {/* Price Row & Compact Add to Cart Button */}
        <div className="mt-3 pt-3 border-t border-[#F4F4F5] flex items-center justify-between gap-2">
          <div className="flex items-baseline gap-2">
            <span className="font-heading font-extrabold text-[17px] text-[#09090B]">
              ₹{priceNum.toLocaleString('en-IN')}
            </span>
            {isSale && (
              <span className="text-[12px] text-[#A1A1AA] line-through font-medium">
                ₹{originalPriceNum.toLocaleString('en-IN')}
              </span>
            )}
          </div>

          {/* Compact Add to Cart Button */}
          {isOutOfStock ? (
            <button
              disabled
              onClick={(e) => e.stopPropagation()}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-neutral-100 text-neutral-400 cursor-not-allowed border border-neutral-200"
              title="Sold Out"
            >
              Sold Out
            </button>
          ) : (
            <button
              onClick={handleQuickAdd}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 ease-out flex items-center gap-1.5 cursor-pointer hover:-translate-y-[1px] ${
                added
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#F1ECFF] hover:bg-[#7C4DFF] text-[#7C4DFF] hover:text-white'
              }`}
              title="Add to Cart"
            >
              {added ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Added</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Add</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
