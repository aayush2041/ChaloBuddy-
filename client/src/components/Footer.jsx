import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { ArrowRight, ShieldCheck, Mail } from 'lucide-react';

export default function Footer() {
  const { navigate } = useStore();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="w-full bg-white text-[#09090B] border-t border-[#E4E4E7] text-xs font-sans">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-8 sm:gap-10">
          
          {/* Brand Column */}
          <div className="sm:col-span-2 md:col-span-4 space-y-4">
            <div
              onClick={() => navigate('home')}
              className="flex items-center gap-3 cursor-pointer select-none"
            >
              <img
                src="/shopify_assets/logo.png"
                alt="ValorVault"
                className="h-8 w-auto object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <span className="font-heading font-extrabold text-xl uppercase tracking-tight text-[#09090B]">
                VALOR<span className="text-[#7C4DFF]">VAULT</span>
              </span>
            </div>

            <p className="text-[13px] text-[#52525B] leading-relaxed max-w-sm">
              The trusted digital marketplace for gamers. Buying and selling verified accounts, VP, UC, and gaming assets with automated escrow protection.
            </p>

            <div className="flex items-center gap-2 text-[11px] font-semibold text-emerald-700 bg-emerald-50/50 border border-emerald-200/60 p-2.5 rounded-xl max-w-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Instant Digital Delivery • 100% Escrow Protection</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-[#09090B]">
              Navigation
            </h4>
            <ul className="space-y-2 text-[#52525B]">
              <li>
                <button onClick={() => navigate('home')} className="hover:text-[#7C4DFF] transition-colors cursor-pointer">
                  Home
                </button>
              </li>
              <li>
                <button onClick={() => navigate('games')} className="hover:text-[#7C4DFF] transition-colors cursor-pointer">
                  Games
                </button>
              </li>
              <li>
                <button onClick={() => navigate('process')} className="hover:text-[#7C4DFF] transition-colors cursor-pointer">
                  Process & Delivery
                </button>
              </li>
              <li>
                <button onClick={() => navigate('contact')} className="hover:text-[#7C4DFF] transition-colors cursor-pointer">
                  Contact
                </button>
              </li>
              <li>
                <button onClick={() => navigate('account')} className="hover:text-[#7C4DFF] transition-colors cursor-pointer">
                  Customer Vault
                </button>
              </li>
              <li>
                <button onClick={() => navigate('admin')} className="hover:text-[#7C4DFF] transition-colors cursor-pointer text-xs text-neutral-400">
                  Admin Portal
                </button>
              </li>
            </ul>
          </div>

          {/* Policies */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-[#09090B]">
              Policies
            </h4>
            <ul className="space-y-2 text-[#52525B]">
              <li>
                <button onClick={() => navigate('process')} className="hover:text-[#7C4DFF] transition-colors cursor-pointer">
                  Shipping Policy
                </button>
              </li>
              <li>
                <button onClick={() => navigate('legal', { type: 'terms' })} className="hover:text-[#7C4DFF] transition-colors cursor-pointer">
                  Terms of Service
                </button>
              </li>
              <li>
                <button onClick={() => navigate('legal', { type: 'privacy' })} className="hover:text-[#7C4DFF] transition-colors cursor-pointer">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button onClick={() => navigate('legal', { type: 'refund' })} className="hover:text-[#7C4DFF] transition-colors cursor-pointer">
                  Refund & Escrow Terms
                </button>
              </li>
            </ul>
          </div>

          {/* Newsletter Box */}
          <div className="sm:col-span-2 md:col-span-4 space-y-3">
            <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-[#09090B]">
              Stay in the Vault
            </h4>
            <p className="text-[13px] text-[#52525B]">
              Subscribe to get notified about rare inventory drops, skin discounts, and marketplace updates.
            </p>

            {subscribed ? (
              <div className="p-3 bg-[#F1ECFF] border border-[#7C4DFF]/30 rounded-xl text-xs font-semibold text-[#7C4DFF]">
                ✓ Thank you for subscribing to ValorVault updates!
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-1 px-3.5 py-2.5 text-xs text-[#09090B] bg-white border border-[#E4E4E7] focus:border-[#7C4DFF] rounded-xl outline-none font-sans"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-[#7C4DFF] hover:bg-[#6D3DF5] text-white rounded-xl transition cursor-pointer flex items-center justify-center hover:-translate-y-[1px]"
                  aria-label="Subscribe"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>

        </div>

        {/* Bottom Bar: Payment Badges & Copyright */}
        <div className="mt-14 pt-8 border-t border-[#E4E4E7] flex flex-col sm:flex-row items-center justify-between gap-4 text-[#71717A]">
          <div>
            © 2026, <span className="text-[#09090B] font-semibold">ValorVault</span>. All rights reserved.
          </div>

          {/* Payment Method Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold px-2 py-0.5 border border-[#E4E4E7] text-[#52525B] bg-[#FAFAFA] rounded-md">
              UPI
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 border border-[#E4E4E7] text-[#52525B] bg-[#FAFAFA] rounded-md">
              Google Pay
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 border border-[#E4E4E7] text-[#52525B] bg-[#FAFAFA] rounded-md">
              PhonePe
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 border border-[#E4E4E7] text-[#52525B] bg-[#FAFAFA] rounded-md">
              Paytm
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 border border-[#E4E4E7] text-[#52525B] bg-[#FAFAFA] rounded-md">
              IMPS / Bank
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 border border-[#E4E4E7] text-[#52525B] bg-[#FAFAFA] rounded-md">
              Cards
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
}
