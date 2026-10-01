import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import {
  ShieldCheck,
  Star,
  MapPin,
  UserCheck,
  UserPlus,
  Compass,
  MessageCircle,
  Heart,
} from 'lucide-react';

export default function BuddyCard({ buddy }) {
  const { navigate, toggleBuddyConnect, toggleSaveBuddy, isBuddySaved } = useStore();
  const [heartPopping, setHeartPopping] = useState(false);
  const saved = isBuddySaved(buddy.id);

  const handleHeartClick = (e) => {
    e.stopPropagation();
    setHeartPopping(true);
    toggleSaveBuddy(buddy.id);
    setTimeout(() => setHeartPopping(false), 350);
  };

  return (
    <div className="bg-[#0C2438] rounded-3xl p-6 border border-white/10 shadow-lg hover:shadow-2xl transition-all duration-300 card-hover flex flex-col justify-between relative overflow-hidden group">
      {/* Top action: Heart */}
      <button
        onClick={handleHeartClick}
        className={`absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm transition-all cursor-pointer ${
          saved ? 'bg-rose-500 text-white' : 'bg-white/10 hover:bg-white/20 text-slate-300'
        } ${heartPopping ? 'animate-heart-pop' : ''}`}
      >
        <Heart className={`w-4 h-4 ${saved ? 'fill-white' : ''}`} />
      </button>

      <div>
        {/* Avatar & Verification */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={buddy.avatar}
              alt={buddy.name}
              className="w-16 h-16 rounded-2xl object-cover ring-2 ring-[#FF5A1F]/50 group-hover:ring-[#FF5A1F] transition-all"
            />
            {buddy.verified && (
              <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-0.5 rounded-full ring-2 ring-[#0C2438]">
                <ShieldCheck className="w-3.5 h-3.5" />
              </span>
            )}
          </div>
          <div>
            <h4 className="text-base font-bold text-white flex items-center gap-1.5">
              <span>{buddy.name}</span>
              <span className="text-xs text-slate-400 font-normal">, {buddy.age}</span>
            </h4>
            <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
              <MapPin className="w-3 h-3 text-[#FF5A1F]" />
              <span className="truncate">{buddy.location}</span>
            </div>
            <div className="flex items-center gap-2 mt-1 text-xs">
              <span className="flex items-center gap-0.5 text-amber-400 font-bold">
                <Star className="w-3 h-3 fill-amber-400" />
                {buddy.rating}
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-300">{buddy.tripsCompleted} trips done</span>
            </div>
          </div>
        </div>

        {/* Bio */}
        <p className="text-xs text-slate-300 mt-4 line-clamp-2 leading-relaxed">
          {buddy.bio}
        </p>

        {/* Travel Style Pills */}
        <div className="mt-3.5 flex flex-wrap gap-1.5">
          {(buddy.travelStyle || []).map((style, idx) => (
            <span
              key={idx}
              className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-white/5 text-slate-200 border border-white/5"
            >
              {style}
            </span>
          ))}
        </div>

        {/* Interests */}
        <div className="mt-3 pt-3 border-t border-white/10 flex flex-wrap gap-1 text-[10px] text-slate-400">
          {(buddy.interests || []).slice(0, 3).map((item, idx) => (
            <span key={idx} className="bg-[#071A2B] px-2 py-0.5 rounded text-slate-300">
              #{item}
            </span>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-5 pt-4 border-t border-white/10 grid grid-cols-2 gap-2">
        <button
          onClick={() => navigate('profile', { id: buddy.id })}
          className="btn-secondary-cb !py-2 !px-3 !text-xs !bg-white/5 !text-white !border-white/15 hover:!bg-white/10"
        >
          View Profile
        </button>

        <button
          onClick={() => toggleBuddyConnect(buddy.id)}
          className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-full text-xs font-bold transition-all cursor-pointer ${
            buddy.connected
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              : 'bg-[#FF5A1F] hover:bg-[#E04812] text-white shadow-md shadow-[#FF5A1F]/25'
          }`}
        >
          {buddy.connected ? (
            <>
              <UserCheck className="w-3.5 h-3.5" />
              <span>Connected</span>
            </>
          ) : (
            <>
              <UserPlus className="w-3.5 h-3.5" />
              <span>Connect</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
