import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import {
  Heart,
  Calendar,
  MapPin,
  ArrowRight,
  ShieldCheck,
  Flame,
  Clock,
} from 'lucide-react';

export default function TripCard({ trip }) {
  const { navigate, formatPrice, toggleSaveTrip, isTripSaved } = useStore();
  const [heartPopping, setHeartPopping] = useState(false);
  const saved = isTripSaved(trip.id);

  const handleHeartClick = (e) => {
    e.stopPropagation();
    setHeartPopping(true);
    toggleSaveTrip(trip.id);
    setTimeout(() => setHeartPopping(false), 350);
  };

  const getDifficultyBadge = (diff) => {
    switch (diff) {
      case 'Easy':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'Challenging':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      case 'Moderate':
      default:
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
    }
  };

  return (
    <div
      onClick={() => navigate('trip-detail', { id: trip.id })}
      className="group relative bg-[#0C2438] rounded-3xl overflow-hidden border border-white/10 shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col cursor-pointer card-hover"
    >
      {/* Image Header with Zoom & Badges */}
      <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-slate-900">
        <img
          src={trip.images[0]}
          alt={trip.title}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0C2438] via-transparent to-black/30" />

        {/* Top Badges: Difficulty & Heart */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <span
              className={`text-xs px-3 py-1 rounded-full font-bold backdrop-blur-md border ${getDifficultyBadge(
                trip.difficulty
              )}`}
            >
              {trip.difficulty}
            </span>
            {trip.spotsLeft && trip.spotsLeft <= 5 && (
              <span className="text-[11px] px-2.5 py-0.5 rounded-full font-semibold bg-[#FF5A1F] text-white flex items-center gap-1 shadow-md">
                <Flame className="w-3 h-3" />
                {trip.spotsLeft} spots left
              </span>
            )}
          </div>

          {/* Heart Button */}
          <button
            type="button"
            onClick={handleHeartClick}
            aria-label="Save trip"
            className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md transition-all duration-200 cursor-pointer ${
              saved
                ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
                : 'bg-black/40 hover:bg-black/60 text-white border border-white/20'
            } ${heartPopping ? 'animate-heart-pop' : ''}`}
          >
            <Heart className={`w-5 h-5 ${saved ? 'fill-white' : ''}`} />
          </button>
        </div>

        {/* Bottom Image Overlay: Traveler Avatars & Vibe */}
        <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between z-10">
          <div className="flex items-center">
            <div className="flex -space-x-2.5 overflow-hidden">
              {(trip.travelerAvatars || []).slice(0, 3).map((avatar, idx) => (
                <img
                  key={idx}
                  src={avatar}
                  alt="Traveler"
                  className="inline-block w-7 h-7 rounded-full ring-2 ring-[#0C2438] object-cover"
                />
              ))}
            </div>
            <span className="text-xs text-slate-300 ml-2 font-medium bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded-full border border-white/10">
              +{trip.currentGroupSize || 6} joined
            </span>
          </div>

          <span className="text-xs text-white/90 bg-white/15 backdrop-blur-md px-2.5 py-0.5 rounded-full font-medium">
            {trip.duration}
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {/* Location & Host verified badge */}
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
            <div className="flex items-center gap-1 text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-[#FF5A1F]" />
              <span className="truncate max-w-[180px]">{trip.destination}</span>
            </div>
            {trip.verifiedOrganizer && (
              <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                <ShieldCheck className="w-3 h-3" />
                Verified Host
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="text-lg font-bold text-white group-hover:text-[#FF5A1F] transition-colors line-clamp-1">
            {trip.title}
          </h3>

          {/* Subtitle / Description preview */}
          <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
            {trip.subtitle || trip.about}
          </p>

          {/* Dates Bar */}
          <div className="flex items-center gap-2 text-xs text-slate-300 mt-3 pt-3 border-t border-white/10">
            <Calendar className="w-3.5 h-3.5 text-[#FF5A1F]" />
            <span>{trip.dates}</span>
          </div>
        </div>

        {/* Footer: Price & Arrow CTA Button */}
        <div className="pt-2 flex items-center justify-between border-t border-white/10">
          <div>
            <span className="text-[11px] text-slate-400 block font-normal">Starting from</span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-extrabold text-white">
                {formatPrice(trip.price)}
              </span>
              <span className="text-xs text-slate-400">/ person</span>
            </div>
          </div>

          <div className="w-10 h-10 rounded-full bg-[#FF5A1F] group-hover:bg-[#E04812] text-white flex items-center justify-center transition-all duration-200 shadow-md shadow-[#FF5A1F]/30 group-hover:translate-x-1">
            <ArrowRight className="w-5 h-5" />
          </div>
        </div>
      </div>
    </div>
  );
}
