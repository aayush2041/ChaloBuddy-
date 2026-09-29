import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { ShieldCheck, Clock, Mail, LayoutDashboard, MessageSquare, Headphones, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function ProcessPage() {
  const { navigate } = useStore();
  const [orderQuery, setOrderQuery] = useState('');

  const handleTrackOrder = (e) => {
    e.preventDefault();
    if (orderQuery.trim()) {
      navigate('tracking', { id: orderQuery.trim() });
    }
  };

  return (
    <div className="w-full bg-white text-[#09090B] min-h-screen py-12 lg:py-20">
      <div className="max-w-[1240px] mx-auto px-6">
        
        {/* Top Header */}
        <div className="border-b border-[#E4E4E7] pb-6 mb-10 max-w-4xl">
          <span className="text-xs uppercase tracking-widest text-[#7C4DFF] font-bold">
            Policy & Workflow
          </span>
          <h1 className="font-heading font-extrabold text-3xl sm:text-5xl uppercase tracking-tight text-[#09090B] mt-2">
            Shipping & Delivery Policy
          </h1>
          <p className="text-sm font-semibold text-[#52525B] mt-2">
            Digital Delivery Workflow & Escrow Verification Protocol – ValorVault
          </p>
        </div>

        {/* Content Box */}
        <div className="space-y-8 font-sans max-w-4xl">
          
          {/* Main Statement */}
          <div className="p-6 bg-white border border-[#E4E4E7] rounded-2xl shadow-xs">
            <h2 className="font-heading font-bold text-lg uppercase text-[#09090B] mb-2 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              100% Digital Delivery
            </h2>
            <p className="text-sm text-[#52525B] leading-relaxed">
              All products sold on <strong className="text-[#09090B]">ValorVault</strong> are delivered digitally. No physical shipment is involved. Once your payment is verified via UPI or Bank Transfer, your account credentials, activation codes, or digital items are dispatched securely directly to your private customer vault.
            </p>
          </div>

          {/* Delivery Times */}
          <div>
            <h3 className="font-heading font-extrabold text-xl uppercase tracking-tight text-[#09090B] mb-4">
              Estimated Delivery Times
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 border border-[#E4E4E7] rounded-2xl bg-white shadow-xs">
                <div className="flex items-center gap-2 text-[#7C4DFF] mb-2">
                  <Clock className="w-5 h-5" />
                  <span className="text-xs uppercase font-extrabold tracking-wider">Automated Products</span>
                </div>
                <h4 className="font-heading font-bold text-lg text-[#09090B]">Instant to 30 Minutes</h4>
                <p className="text-xs text-[#52525B] mt-1">
                  For automated verified inventory, prepaid codes, and pre-audited digital items.
                </p>
              </div>

              <div className="p-5 border border-[#E4E4E7] rounded-2xl bg-white shadow-xs">
                <div className="flex items-center gap-2 text-[#71717A] mb-2">
                  <Clock className="w-5 h-5" />
                  <span className="text-xs uppercase font-extrabold tracking-wider">Manual Fulfillment</span>
                </div>
                <h4 className="font-heading font-bold text-lg text-[#09090B]">Up to 24 Hours</h4>
                <p className="text-xs text-[#52525B] mt-1">
                  For high-tier accounts, custom rank transfers, and multi-factor re-binding.
                </p>
              </div>
            </div>
          </div>

          {/* Delivery Channels */}
          <div>
            <h3 className="font-heading font-extrabold text-xl uppercase tracking-tight text-[#09090B] mb-4">
              Orders May Be Delivered Through
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 border border-[#E4E4E7] rounded-2xl text-center flex flex-col items-center bg-white shadow-xs">
                <Mail className="w-6 h-6 text-[#7C4DFF] mb-2" />
                <span className="font-bold text-sm text-[#09090B]">Email</span>
                <span className="text-[11px] text-[#71717A] mt-1">To registered email address</span>
              </div>
              <div className="p-5 border border-[#E4E4E7] rounded-2xl text-center flex flex-col items-center bg-white shadow-xs">
                <LayoutDashboard className="w-6 h-6 text-[#7C4DFF] mb-2" />
                <span className="font-bold text-sm text-[#09090B]">Customer Dashboard</span>
                <span className="text-[11px] text-[#71717A] mt-1">Encrypted Digital Vault</span>
              </div>
              <div className="p-5 border border-[#E4E4E7] rounded-2xl text-center flex flex-col items-center bg-white shadow-xs">
                <MessageSquare className="w-6 h-6 text-[#7C4DFF] mb-2" />
                <span className="font-bold text-sm text-[#09090B]">Live Chat</span>
                <span className="text-[11px] text-[#71717A] mt-1">Direct agent transfer</span>
              </div>
              <div className="p-5 border border-[#E4E4E7] rounded-2xl text-center flex flex-col items-center bg-white shadow-xs">
                <Headphones className="w-6 h-6 text-[#7C4DFF] mb-2" />
                <span className="font-bold text-sm text-[#09090B]">Discord Support</span>
                <span className="text-[11px] text-[#71717A] mt-1">Private ticket room</span>
              </div>
            </div>
          </div>

          {/* Escrow Guarantee & Support Warning */}
          <div className="p-6 border border-neutral-800 rounded-2xl bg-[#09090B] text-white space-y-3">
            <h4 className="font-heading font-bold text-base uppercase text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              24-Hour Guarantee Notice
            </h4>
            <p className="text-xs text-neutral-300 leading-relaxed">
              If your order has not been received within 24 hours, please contact our support team immediately with your Order Number and payment UTR reference. Our team responds within 15 minutes.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <button
                onClick={() => navigate('contact')}
                className="px-6 py-2.5 bg-[#7C4DFF] hover:bg-[#6D3DF5] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer shadow-xs"
              >
                Open Support Ticket
              </button>
            </div>
          </div>

          {/* Quick Order Lookup Form */}
          <div className="pt-6 border-t border-[#E4E4E7]">
            <h4 className="font-heading font-bold text-base uppercase mb-3 text-[#09090B]">
              Already have an Order ID?
            </h4>
            <form onSubmit={handleTrackOrder} className="flex gap-2 max-w-md">
              <input
                type="text"
                value={orderQuery}
                onChange={(e) => setOrderQuery(e.target.value)}
                placeholder="Enter Order ID (e.g. VV-12345)"
                className="flex-1 px-4 py-3 border border-[#E4E4E7] focus:border-[#7C4DFF] rounded-xl text-sm outline-none font-mono bg-white"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-[#7C4DFF] hover:bg-[#6D3DF5] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition cursor-pointer shadow-xs"
              >
                Track
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
