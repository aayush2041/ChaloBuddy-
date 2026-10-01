import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import {
  X,
  Copy,
  Check,
  Share2,
  MessageCircle,
  Mail,
} from 'lucide-react';

export default function ShareModal() {
  const { shareModalData, setShareModalData, addToast } = useStore();
  const [copied, setCopied] = useState(false);

  if (!shareModalData) return null;

  const url = window.location.href;
  const title = shareModalData.title || 'Check out this epic journey on ChaloBuddy!';

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    addToast('Link copied to clipboard! 📋', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent(`${title} — Explore more on ChaloBuddy: ${url}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleTwitter = () => {
    const text = encodeURIComponent(`Traveling to ${title} with @ChaloBuddy! 🏔️✨ ${url}`);
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
  };

  const handleFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#0C2438] text-white w-full max-w-md rounded-3xl border border-white/15 shadow-2xl overflow-hidden p-6 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-[#FF5A1F]" />
            <h3 className="font-bold text-base text-white">Share This Journey</h3>
          </div>
          <button
            onClick={() => setShareModalData(null)}
            className="p-1 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div>
          <p className="text-xs text-slate-300 font-semibold truncate">{title}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Invite your buddies to travel together or split expenses.</p>
        </div>

        {/* Copy Link Input */}
        <div className="flex items-center gap-2 bg-[#071A2B] p-2 rounded-2xl border border-white/10">
          <input
            type="text"
            readOnly
            value={url}
            className="w-full bg-transparent text-xs text-slate-300 px-2 focus:outline-none"
          />
          <button
            onClick={handleCopy}
            className="btn-primary-cb !py-1.5 !px-3.5 !text-xs font-semibold flex items-center gap-1.5 cursor-pointer flex-shrink-0"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>

        {/* Social Share Grid */}
        <div className="grid grid-cols-4 gap-2 pt-2">
          <button
            onClick={handleWhatsApp}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#071A2B] hover:bg-[#25D366]/20 hover:border-[#25D366]/40 border border-white/10 transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-full bg-[#25D366]/20 text-[#25D366] flex items-center justify-center group-hover:scale-110 transition-transform">
              <MessageCircle className="w-5 h-5" />
            </div>
            <span className="text-[11px] text-slate-300 mt-1.5 font-medium">WhatsApp</span>
          </button>

          <button
            onClick={handleTwitter}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#071A2B] hover:bg-[#1DA1F2]/20 hover:border-[#1DA1F2]/40 border border-white/10 transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-full bg-[#1DA1F2]/20 text-[#1DA1F2] flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </div>
            <span className="text-[11px] text-slate-300 mt-1.5 font-medium">X (Twitter)</span>
          </button>

          <button
            onClick={handleFacebook}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#071A2B] hover:bg-[#1877F2]/20 hover:border-[#1877F2]/40 border border-white/10 transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-full bg-[#1877F2]/20 text-[#1877F2] flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </div>
            <span className="text-[11px] text-slate-300 mt-1.5 font-medium">Facebook</span>
          </button>

          <button
            onClick={handleCopy}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#071A2B] hover:bg-[#FF5A1F]/20 hover:border-[#FF5A1F]/40 border border-white/10 transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-full bg-[#FF5A1F]/20 text-[#FF5A1F] flex items-center justify-center group-hover:scale-110 transition-transform">
              <Mail className="w-4 h-4" />
            </div>
            <span className="text-[11px] text-slate-300 mt-1.5 font-medium">Email</span>
          </button>
        </div>
      </div>
    </div>
  );
}
