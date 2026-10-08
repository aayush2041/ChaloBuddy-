import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { api } from '../api';
import {
  User,
  Mail,
  Phone,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  FileText
} from 'lucide-react';

export default function CheckoutPage() {
  const {
    cart,
    cartTotal,
    clearCart,
    currentUser,
    requireAuth,
    navigate,
    showToast
  } = useStore();

  const [customerName, setCustomerName] = useState(currentUser?.name || '');
  const [customerPhone, setCustomerPhone] = useState(currentUser?.phone || '');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Authenticated email is locked & auto-filled from current user account
  const customerEmail = currentUser?.email || '';

  useEffect(() => {
    if (!currentUser) {
      requireAuth({ page: 'checkout' });
    } else {
      if (!customerName) setCustomerName(currentUser.name || '');
      if (!customerPhone) setCustomerPhone(currentUser.phone || '');
    }
  }, [currentUser]);

  if (cart.length === 0) {
    return (
      <div className="bg-white min-h-[70vh] flex items-center justify-center py-16 px-6">
        <div className="max-w-md w-full text-center bg-white p-8 border border-[#E4E4E7] rounded-2xl shadow-sm space-y-4">
          <h2 className="text-2xl font-heading font-extrabold uppercase text-[#09090B]">Your Cart is Empty</h2>
          <p className="text-xs text-[#52525B]">
            Select verified items from our games collection before proceeding to checkout.
          </p>
          <button
            onClick={() => navigate('games')}
            className="px-6 py-3 bg-[#7C4DFF] hover:bg-[#6D3DF5] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer"
          >
            Browse Games
          </button>
        </div>
      </div>
    );
  }

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();

    if (!currentUser) {
      requireAuth({ page: 'checkout' });
      return;
    }

    if (!customerName.trim() || !customerPhone.trim()) {
      showToast?.('Please provide your name and phone number for delivery', 'error');
      return;
    }

    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      const itemsPayload = cart.map((i) => ({
        product_id: i.product.id,
        quantity: i.quantity
      }));

      const res = await api.createOrder({
        customer_name: customerName.trim(),
        customer_email: customerEmail.trim().toLowerCase(),
        customer_phone: customerPhone.trim(),
        items: itemsPayload,
        user_id: currentUser.id,
        notes: deliveryNotes.trim()
      });

      if (res.success && res.order) {
        clearCart();
        showToast?.(`Order ${res.order.order_number} created!`, 'success');
        navigate('payment', {
          orderId: res.order.id,
          orderNumber: res.order.order_number,
          total: res.order.total_amount
        });
      } else {
        showToast?.(res.error || 'We couldn\'t complete this request right now. Please try again in a few moments.', 'error');
      }
    } catch {
      showToast?.('Something went wrong. Please check your connection and try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white min-h-screen py-10 lg:py-16 text-[#09090B]">
      {/* Global container max-w-[1240px] px-6 */}
      <div className="max-w-[1240px] mx-auto px-6 space-y-8">
        
        {/* Title Bar */}
        <div className="border-b border-[#E4E4E7] pb-4">
          <span className="text-xs uppercase tracking-widest text-[#7C4DFF] font-bold">
            Step 2 of 3
          </span>
          <h1 className="font-heading font-extrabold text-3xl uppercase tracking-tight text-[#09090B] mt-1">
            Checkout & Delivery
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: Customer Details Form (7 cols) */}
          <div className="lg:col-span-7 bg-white border border-[#E4E4E7] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
            <div>
              <h2 className="font-heading font-bold text-lg uppercase text-[#09090B] tracking-tight">
                Delivery & Contact Information
              </h2>
              <p className="text-xs text-[#52525B] mt-1">
                Your credentials and digital codes will be securely unlocked inside your vault.
              </p>
            </div>

            <form onSubmit={handleCheckoutSubmit} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="text-xs uppercase font-bold tracking-wider text-[#09090B] mb-1.5 block">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#71717A] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full bg-white border border-[#E4E4E7] focus:border-[#7C4DFF] rounded-xl text-xs font-semibold text-[#09090B] pl-10 pr-4 py-3 outline-none"
                  />
                </div>
              </div>

              {/* Email (Locked to current user) */}
              <div>
                <label className="text-xs uppercase font-bold tracking-wider text-[#09090B] mb-1.5 flex items-center justify-between">
                  <span>Vault Account Email</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#7C4DFF] bg-[#F1ECFF] px-2 py-0.5 rounded-md">
                    Verified
                  </span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#71717A] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    disabled
                    value={customerEmail}
                    className="w-full bg-neutral-100 border border-[#E4E4E7] rounded-xl text-xs font-bold text-[#52525B] pl-10 pr-4 py-3 cursor-not-allowed opacity-80"
                  />
                </div>
                <p className="text-[11px] text-[#71717A] mt-1">
                  Digital vault items will be permanently linked to this verified account.
                </p>
              </div>

              {/* Phone */}
              <div>
                <label className="text-xs uppercase font-bold tracking-wider text-[#09090B] mb-1.5 block">
                  Mobile Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#71717A] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+91 98000 00000"
                    className="w-full bg-white border border-[#E4E4E7] focus:border-[#7C4DFF] rounded-xl text-xs font-semibold text-[#09090B] pl-10 pr-4 py-3 outline-none"
                  />
                </div>
                <p className="text-[11px] text-[#71717A] mt-1">
                  Used for SMS dispatch alerts and manual UTR reconciliation inquiries.
                </p>
              </div>

              {/* Delivery Notes / Discord ID */}
              <div>
                <label className="text-xs uppercase font-bold tracking-wider text-[#09090B] mb-1.5 block">
                  Delivery Notes / Discord ID <span className="text-[#71717A] font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <FileText className="w-4 h-4 text-[#71717A] absolute left-3.5 top-3 pointer-events-none" />
                  <textarea
                    rows={2}
                    value={deliveryNotes}
                    onChange={(e) => setDeliveryNotes(e.target.value)}
                    placeholder="e.g. My Character UID is 512938192 or Discord handle"
                    className="w-full bg-white border border-[#E4E4E7] focus:border-[#7C4DFF] rounded-xl text-xs font-semibold text-[#09090B] pl-10 pr-4 py-2.5 outline-none resize-none"
                  />
                </div>
              </div>

              {/* Escrow Protocol Notice */}
              <div className="p-4 bg-[#FAFAFA] border border-[#E7E7E7] rounded-xl flex items-start space-x-3 text-xs">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold uppercase tracking-wider text-[#09090B]">
                    Automated Escrow Verification Protocol
                  </p>
                  <p className="text-[#52525B] text-[11px] leading-relaxed">
                    On the next screen, you will be given dynamic UPI QR & bank settlement details. Submit your 12-digit UTR reference for instant verification.
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-[#7C4DFF] hover:bg-[#6D3DF5] text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-xs hover:-translate-y-[1px]"
                >
                  <span>{isSubmitting ? 'Creating Order...' : `Proceed to Pay ₹${Number(cartTotal).toLocaleString('en-IN')}`}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>

          {/* RIGHT: Order Summary (5 cols) */}
          <div className="lg:col-span-5 bg-white border border-[#E4E4E7] rounded-2xl p-6 space-y-6 shadow-xs">
            <h3 className="font-heading font-extrabold text-sm uppercase tracking-wider text-[#09090B] pb-3 border-b border-[#F4F4F5]">
              Items in Order ({cart.length})
            </h3>

            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
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
                  <div key={product.id} className="flex items-center justify-between text-xs py-2 border-b border-[#F4F4F5]">
                    <div className="flex items-center space-x-3 min-w-0">
                      <img src={img} alt="" className="w-12 h-12 object-cover rounded-lg border border-[#E4E4E7]" />
                      <div className="min-w-0">
                        <p className="font-bold text-[#09090B] truncate max-w-[170px]">{product.title || product.name}</p>
                        <p className="text-[11px] text-[#71717A]">Qty: {quantity}</p>
                      </div>
                    </div>
                    <span className="font-heading font-extrabold text-[#09090B]">
                      ₹{(pPrice * quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="space-y-2 text-xs text-[#52525B] pt-2 border-t border-[#F4F4F5]">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold text-[#09090B]">₹{Number(cartTotal).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Escrow Protection Fee</span>
                <span>FREE (₹0)</span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-[#09090B] pt-3 border-t border-[#F4F4F5]">
                <span>Total to Pay</span>
                <span className="font-heading text-lg">₹{Number(cartTotal).toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-[#F4F4F5] space-y-2 text-[11px] text-[#52525B]">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Encrypted Vault Delivery</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Automated UPI / Bank Escrow Guarantee</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
