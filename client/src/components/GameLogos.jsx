import React from 'react';

// Genuine recognizable vector logos for games and platforms
export function ValorantLogo({ className = "w-6 h-6", color = "#FF4655" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill={color} xmlns="http://www.w3.org/2000/svg">
      <path d="M14.05 4H24v16h-9.95L7.26 9.54h5.27l1.52 2.39V4zM0 4h5.25L0 12.38V4z" fillRule="evenodd" />
    </svg>
  );
}

export function PubgLogo({ className = "w-7 h-7" }) {
  return (
    <div className={`flex flex-col items-center justify-center bg-[#F1A80A] text-[#111426] font-black rounded-lg p-1 leading-none select-none ${className}`}>
      <span className="text-[11px] tracking-tighter">PUBG</span>
      <span className="text-[6px] tracking-widest font-bold">MOBILE</span>
    </div>
  );
}

export function BgmiLogo({ className = "w-7 h-7" }) {
  return (
    <div className={`flex flex-col items-center justify-center bg-gradient-to-br from-[#1E293B] to-[#0F172A] text-[#F59E0B] font-black rounded-lg border border-[#F59E0B]/40 p-1 leading-none select-none ${className}`}>
      <span className="text-[10px] tracking-tighter text-white font-extrabold">BGMI</span>
      <span className="text-[5px] text-[#F59E0B] tracking-wider font-semibold">BATTLE</span>
    </div>
  );
}

export function Cs2Logo({ className = "w-7 h-7" }) {
  return (
    <svg className={className} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" rx="8" fill="#1E2430" />
      {/* Counter-Terrorist Operative Silhouette */}
      <path d="M22 8c1.1 0 2 .9 2 2v2.1c1.5.5 2.6 1.8 2.8 3.4l.7 5.5-2.5-.5V32h-3v-8h-2v8h-3V20l-2.5.5.7-5.5c.2-1.6 1.3-2.9 2.8-3.4V10c0-1.1.9-2 2-2h2z" fill="#E2E8F0" />
      <path d="M25 15l7-3v2l-7 3v-2z" fill="#E2E8F0" />
      {/* Orange 2 Accent */}
      <circle cx="28" cy="26" r="6" fill="#F97316" />
      <text x="28" y="29.5" textAnchor="middle" fill="#FFFFFF" fontSize="9" fontWeight="900" fontFamily="sans-serif">2</text>
    </svg>
  );
}

export function Dota2Logo({ className = "w-7 h-7" }) {
  return (
    <svg className={className} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" rx="8" fill="#D32F2F" />
      <path d="M10 13l4 2 4-5-8 3zm20 14l-4-2-4 5 8-3zM15 26l10-12-3-2-10 12 3 2z" fill="#FFFFFF" />
    </svg>
  );
}

export function GtaVLogo({ className = "w-7 h-7" }) {
  return (
    <div className={`flex items-center justify-center bg-[#111827] text-white font-black rounded-lg p-1 select-none relative overflow-hidden ${className}`}>
      <span className="text-[8px] font-bold text-gray-300 mr-0.5">GTA</span>
      <span className="text-[14px] font-black text-[#10B981] italic tracking-tighter">V</span>
    </div>
  );
}

export function FortniteLogo({ className = "w-7 h-7" }) {
  return (
    <div className={`flex items-center justify-center bg-[#111426] text-white font-black rounded-lg p-1 select-none ${className}`}>
      <span className="text-[13px] font-black tracking-tighter transform -skew-x-6 text-[#00F5D4]">F</span>
    </div>
  );
}

export function ApexLogo({ className = "w-7 h-7" }) {
  return (
    <svg className={className} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" rx="8" fill="#DA292A" />
      {/* Apex Legends stylized lambda chevron */}
      <path d="M20 9L11 28h5l4-7 4 7h5L20 9zm0 6l2.3 4h-4.6L20 15z" fill="#FFFFFF" />
    </svg>
  );
}

export function CodLogo({ className = "w-7 h-7" }) {
  return (
    <div className={`flex flex-col items-center justify-center bg-[#0F172A] text-white font-black rounded-lg p-1 select-none border border-slate-700 ${className}`}>
      <span className="text-[9px] tracking-tight font-extrabold text-amber-400">CALLOF</span>
      <span className="text-[8px] tracking-widest text-slate-300">DUTY</span>
    </div>
  );
}

export function FreeFireLogo({ className = "w-7 h-7" }) {
  return (
    <div className={`flex flex-col items-center justify-center bg-gradient-to-b from-[#EA580C] to-[#C2410C] text-white font-black rounded-lg p-1 select-none ${className}`}>
      <span className="text-[9px] font-black tracking-tighter">FREE</span>
      <span className="text-[8px] font-bold tracking-tight text-amber-200">FIRE</span>
    </div>
  );
}

// Social Logos
export function YoutubeLogo({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="#FF0000" xmlns="http://www.w3.org/2000/svg">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

export function InstagramLogo({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="24" rx="6" fill="url(#ig-grad)" />
      <path d="M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm0-1.6A2.4 2.4 0 1 1 12 9.6a2.4 2.4 0 0 1 0 4.8zm4.8-6.1a.9.9 0 1 1-1.8 0 .9.9 0 0 1 1.8 0z" fill="#FFF" />
      <path d="M17.5 4h-11A4.5 4.5 0 0 0 2 8.5v7A4.5 4.5 0 0 0 6.5 20h11a4.5 4.5 0 0 0 4.5-4.5v-7A4.5 4.5 0 0 0 17.5 4zm2.7 11.5a2.7 2.7 0 0 1-2.7 2.7h-11a2.7 2.7 0 0 1-2.7-2.7v-7a2.7 2.7 0 0 1 2.7-2.7h11a2.7 2.7 0 0 1 2.7 2.7v7z" fill="#FFF" />
      <defs>
        <radialGradient id="ig-grad" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="matrix(24 0 0 24 3 21)">
          <stop stopColor="#FA7E1E" />
          <stop offset="0.5" stopColor="#D62976" />
          <stop offset="1" stopColor="#962FBF" />
        </radialGradient>
      </defs>
    </svg>
  );
}

export function DiscordLogo({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="#5865F2" xmlns="http://www.w3.org/2000/svg">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.893.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  );
}

export function TwitterXLogo({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}
