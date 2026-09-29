import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { api } from '../api';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, ShieldCheck, Tag } from 'lucide-react';

export default function CartPage() {
  const {
    cart,
    cartTotal,
    updateQuantity,
    removeFromCart,
    clearCart,
    navigate,
    requireAuth,
    showToast
  } = useStore();

  const [couponCode, setCouponCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setValidatingCoupon(true);
    try {
      const res = await api.validateCoupon(couponCode.trim().toUpperCase(), cartTotal);
      if (res.success && res.discount > 0) {
        setAppliedDiscount(res.discount);
        showToast?.(`Coupon "${couponCode.toUpperCase()}" applied: -₹${res.discount.toLocaleString('en-IN')}`, 'success');
      } else {
        showToast?.(res.error || 'Invalid or expired coupon code', 'error');
        setAppliedDiscount(0);
      }
    } catch {
      showToast?.('Error validating coupon', 'error');
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleProceedToCheckout = () => {
    requireAuth(() => {
      navigate('checkout');
    });
  };

  if (cart.length === 0) {
    return (
      <div className="bg-white min-h-[70vh] flex items-center justify-center py-16 px-6">
        <div className="max-w-md w-full text-center bg-white p-8 sm:p-12 border border-[#E4E4E7] rounded-2xl shadow-xs space-y-5">
          <div className="w-16 h-16 bg-[#F1ECFF] text-[#7C4DFF] rounded-2xl flex items-center justify-center mx-auto">
            <ShoppingBag className="w-8 h-8" strokeWidth={1.5} />
          </div>
          <h1 className="text-2xl font-heading font-extrabold uppercase text-[#09090B]">Your Cart is Empty</h1>
          <p className="text-xs sm:text-sm text-[#52525B] leading-relaxed font-sans">
            Looks like you haven't added any digital products yet. Browse verified accounts, currencies, or creator channels.
          </p>
          <div className="pt-2">
            <button
              onClick={() => navigate('catalog')}
              className="px-8 py-3.5 bg-[#7C4DFF] hover:bg-[#6D3DF5] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition cursor-pointer shadow-xs"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  const finalTotal = Math.max(0, cartTotal - appliedDiscount);

  return (
    <div className="bg-white min-h-screen py-10 lg:py-16 text-[#09090B]">
      {/* Global container max-w-[1240px] px-6 */}
      <div className="max-w-[1240px] mx-auto px-6 space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-[#E4E4E7]">
          <div>
            <h1 className="text-3xl sm:text-4xl font-heading font-extrabold uppercase tracking-tight text-[#09090B]">
              Your Cart
            </h1>
            <p className="text-xs text-[#71717A] font-sans mt-1">
              Review your selected digital assets before proceeding to checkout
            </p>
          </div>
          <button
            onClick={clearCart}
            className="text-xs font-bold text-red-600 hover:underline uppercase tracking-wider cursor-pointer"
          >
            Clear Cart
          </button>
        </div>

        {/* Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: Items List (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            {cart.map(({ product, quantity }) => {
              let images = [];
              try {
                images = typeof product.images === 'string' ? JSON.parse(product.images) : product.images || [];
              } catch {
                images = [];
              }
              const img = product.image || images[0] || '/shopify_assets/hero.png';
              const pPrice = Number(product.price) || 0;

              return (
                <div
                  key={product.id}
                  className="p-4 sm:p-5 bg-white border border-[#E4E4E7] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs"
                >
                  <div className="flex items-center space-x-4 min-w-0">
                    <img
                      src={img}
                      alt={product.title || product.name}
                      className="w-16 h-16 sm:w-20 sm:h-20 object-cover shrink-0 rounded-xl border border-[#E4E4E7]"
                    />
                    <div className="min-w-0 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-[#F1ECFF] text-[#7C4DFF] rounded-md inline-block">
                        {product.category || product.category_name || 'Item'}
                      </span>
                      <h3 className="font-heading font-bold text-sm text-[#09090B] truncate">
                        {product.title || product.name}
                      </h3>
                      <p className="text-xs font-bold text-[#09090B] font-sans">
                        ₹{pPrice.toLocaleString('en-IN')} each
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end space-x-6 border-t sm:border-t-0 pt-3 sm:pt-0 border-[#F4F4F5]">
                    {/* Quantity Selector */}
                    <div className="flex items-center border border-[#E4E4E7] rounded-xl bg-white overflow-hidden">
                      <button
                        onClick={() => updateQuantity(product.id, quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-neutral-100 text-[#09090B] cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center text-xs font-bold text-[#09090B] font-mono">
                        {quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(product.id, quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-neutral-100 text-[#09090B] cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Total for item */}
                    <div className="text-right min-w-[90px]">
                      <p className="text-sm font-heading font-extrabold text-[#09090B]">
                        ₹{(pPrice * quantity).toLocaleString('en-IN')}
                      </p>
                    </div>

                    {/* Remove */}
                    <button
                      onClick={() => removeFromCart(product.id)}
                      className="text-[#71717A] hover:text-red-600 transition p-1.5 cursor-pointer rounded-lg hover:bg-neutral-100"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* RIGHT: Order Summary (4 cols) */}
          <div className="lg:col-span-4 bg-white border border-[#E4E4E7] rounded-2xl p-6 space-y-6 shadow-xs">
            <h2 className="font-heading font-extrabold text-sm uppercase tracking-wider text-[#09090B] pb-3 border-b border-[#F4F4F5]">
              Order Summary
            </h2>

            {/* Price Calculations */}
            <div className="space-y-3 text-xs text-[#52525B] font-sans">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-heading font-bold text-[#09090B] text-sm">
                  ₹{Number(cartTotal).toLocaleString('en-IN')}
                </span>
              </div>

              {appliedDiscount > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Coupon Discount</span>
                  <span>-₹{appliedDiscount.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Escrow Verification</span>
                <span className="font-bold text-emerald-700">FREE (₹0)</span>
              </div>

              <div className="pt-3 border-t border-[#F4F4F5] flex justify-between items-baseline text-sm">
                <span className="font-heading font-bold text-[#09090B] uppercase">Total Amount</span>
                <span className="font-heading font-extrabold text-2xl text-[#09090B]">
                  ₹{finalTotal.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Coupon Box */}
            <form onSubmit={handleApplyCoupon} className="pt-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[#09090B] mb-1.5 block">
                Have a coupon code?
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="w-3.5 h-3.5 text-[#71717A] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="e.g. VALOR10"
                    className="w-full bg-white border border-[#E4E4E7] focus:border-[#7C4DFF] rounded-xl uppercase text-xs font-bold pl-9 pr-3 py-2.5 outline-none font-sans"
                  />
                </div>
                <button
                  type="submit"
                  disabled={validatingCoupon}
                  className="px-4 py-2.5 bg-[#7C4DFF] hover:bg-[#6D3DF5] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition cursor-pointer"
                >
                  {validatingCoupon ? '...' : 'Apply'}
                </button>
              </div>
              <p className="text-[10px] text-[#71717A] mt-1.5">
                Try codes: <span className="font-bold text-[#7C4DFF] font-mono">VALOR10</span> (10% off) or <span className="font-bold text-[#7C4DFF] font-mono">FIRST50</span>
              </p>
            </form>

            {/* Checkout CTA */}
            <div className="space-y-3 pt-2">
              <button
                onClick={handleProceedToCheckout}
                className="w-full py-4 bg-[#7C4DFF] hover:bg-[#6D3DF5] text-white font-bold text-xs uppercase tracking-widest rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-xs hover:-translate-y-[1px]"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center space-x-1.5 text-[11px] text-[#71717A] pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Protected by automated UPI / Bank escrow verification</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
