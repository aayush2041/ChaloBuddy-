import React from 'react';
import { useStore } from '../context/StoreContext';
import { ShoppingBag, X, Trash2, ArrowRight, ShieldCheck, Plus, Minus } from 'lucide-react';

export default function CartDrawer() {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    cartTotal,
    isCartOpen,
    setIsCartOpen,
    requireAuth,
    navigate,
    setAuthModalOpen,
    setAuthModalMode,
    currentUser
  } = useStore();

  if (!isCartOpen) return null;

  const handleCheckout = () => {
    setIsCartOpen(false);
    requireAuth(() => {
      navigate('checkout');
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white border-l border-[#E4E4E7] shadow-2xl flex flex-col text-[#09090B] animate-in slide-in-from-right duration-200">
          
          {/* Header */}
          <div className="p-5 border-b border-[#E4E4E7] flex items-center justify-between bg-white">
            <div>
              <h2 className="font-heading font-extrabold text-lg uppercase tracking-tight text-[#09090B]">
                {cart.length === 0 ? 'Your Cart Is Empty' : 'Your Cart'}
              </h2>
              {cart.length > 0 && (
                <span className="text-xs text-[#71717A] font-medium">
                  {cart.length} {cart.length === 1 ? 'item' : 'items'} in vault
                </span>
              )}
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="text-[#71717A] hover:text-[#09090B] p-2 rounded-lg hover:bg-neutral-100 cursor-pointer transition-colors"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Content */}
          <div className="flex-1 overflow-y-auto p-5">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-[#F1ECFF] text-[#7C4DFF] flex items-center justify-center">
                  <ShoppingBag className="w-8 h-8" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-base text-[#09090B]">
                    Your cart is empty
                  </h3>
                  {!currentUser && (
                    <p className="text-xs text-[#52525B] mt-2">
                      Have an account?{' '}
                      <button
                        onClick={() => {
                          setAuthModalMode('login');
                          setAuthModalOpen(true);
                        }}
                        className="text-[#7C4DFF] font-bold underline hover:no-underline cursor-pointer"
                      >
                        Log in
                      </button>{' '}
                      to check out faster.
                    </p>
                  )}
                </div>

                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    navigate('catalog');
                  }}
                  className="w-full py-3 bg-[#7C4DFF] hover:bg-[#6D3DF5] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition cursor-pointer shadow-xs"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              <div className="space-y-3.5">
                {cart.map(({ product, quantity }) => {
                  let images = [];
                  try {
                    images = typeof product.images === 'string' ? JSON.parse(product.images) : product.images || [];
                  } catch {
                    images = [];
                  }
                  const img = product.image || images[0] || '/shopify_assets/hero.png';
                  const itemPrice = Number(product.price) || 0;

                  return (
                    <div
                      key={product.id}
                      className="p-3 bg-[#FAFAFA] border border-[#E7E7E7] rounded-xl flex gap-3 items-center text-xs"
                    >
                      <img
                        src={img}
                        alt={product.name || product.title}
                        className="w-16 h-16 object-cover rounded-lg border border-[#E4E4E7] shrink-0"
                        onError={(e) => {
                          e.currentTarget.src = '/shopify_assets/hero.png';
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-[#7C4DFF]">
                          {product.category || product.category_name}
                        </span>
                        <h4 className="font-bold text-[#09090B] truncate" title={product.name || product.title}>
                          {product.name || product.title}
                        </h4>
                        <div className="font-heading font-extrabold text-[#09090B] text-xs mt-1">
                          ₹{itemPrice.toLocaleString('en-IN')}
                        </div>
                      </div>

                      {/* Quantity Controls & Remove */}
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <button
                          onClick={() => removeFromCart(product.id)}
                          className="text-[#71717A] hover:text-red-600 p-1 cursor-pointer transition"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        <div className="flex items-center border border-[#E4E4E7] rounded-lg bg-white overflow-hidden">
                          <button
                            onClick={() => updateQuantity(product.id, quantity - 1)}
                            className="w-6 h-6 flex items-center justify-center hover:bg-neutral-100 text-[#09090B] cursor-pointer"
                          >
                            <Minus className="w-2.5 h-2.5" />
                          </button>
                          <span className="w-6 text-center text-xs font-bold text-[#09090B]">
                            {quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(product.id, quantity + 1)}
                            className="w-6 h-6 flex items-center justify-center hover:bg-neutral-100 text-[#09090B] cursor-pointer"
                          >
                            <Plus className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer with Subtotal and Checkout Button */}
          {cart.length > 0 && (
            <div className="p-5 border-t border-[#E4E4E7] bg-white space-y-4">
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-[#52525B]">
                  <span>Subtotal</span>
                  <span className="font-heading font-bold text-[#09090B] text-sm">
                    ₹{Number(cartTotal).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between text-emerald-700 font-semibold text-[11px]">
                  <span>Instant Escrow Protection</span>
                  <span>Included</span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-[#09090B] pt-2 border-t border-[#F4F4F5]">
                  <span>Estimated Total</span>
                  <span className="font-heading text-base">₹{Number(cartTotal).toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  onClick={handleCheckout}
                  className="w-full py-3.5 px-4 bg-[#7C4DFF] hover:bg-[#6D3DF5] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer shadow-xs hover:-translate-y-[1px]"
                >
                  <span>Check Out</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    navigate('cart');
                  }}
                  className="w-full py-2.5 px-4 bg-white hover:bg-neutral-50 text-[#09090B] border border-[#E4E4E7] hover:border-[#09090B] font-bold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer"
                >
                  View Cart & Coupons
                </button>
              </div>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#71717A] pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Protected by automated UPI / Bank Escrow Verification</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
