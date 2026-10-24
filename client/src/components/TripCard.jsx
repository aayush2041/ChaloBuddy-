import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { getTripStartingLocation } from '../services/tripSearchService';
import {
  Heart,
  Calendar,
  MapPin,
  ArrowRight,
  ShieldCheck,
  Users,
  Star,
  Tag,
  User,
  Sparkles,
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

  const handleHeartKeyDown = (e) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.stopPropagation();
    }
  };

  const startingLocation = getTripStartingLocation(trip);
  const availableSeats =
    trip.spotsLeft ??
    (trip.maxGroupSize - (trip.currentGroupSize || 0)) ??
    4;

  const host = trip.organizer;
  const hostName = host?.name || 'Trip Leader';
  const hostAvatar = host?.avatar || null;
  const hasValidRating =
    typeof host?.rating === 'number' &&
    Number.isFinite(host.rating) &&
    host.rating > 0 &&
    host.rating <= 5;
  const isVerified = Boolean(trip.verifiedOrganizer === true || host?.verified === true);
  const isWomenOnly = Boolean(trip.isWomenOnly);

  const primaryVibe = Array.isArray(trip.vibes) && trip.vibes.length > 0 ? trip.vibes[0] : (trip.vibe || null);

  const handleCardClick = () => {
    navigate('trip-detail', { id: trip.id });
  };

  const handleKeyDown = (e) => {
    if (e.target !== e.currentTarget) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCardClick();
    }
  };

  return (
    <div
      role="article"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      aria-label={`Trip: ${trip.title} to ${trip.destination}, priced at ${formatPrice(trip.price)} per person`}
      className={`group relative bg-[#0C2438] rounded-2xl overflow-hidden border shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col justify-between cursor-pointer focus:outline-none ${
        isWomenOnly
          ? 'border-pink-500/30 hover:border-pink-400/80 hover:shadow-pink-500/10 focus:ring-2 focus:ring-pink-500'
          : 'border-white/10 hover:border-white/25 focus:ring-2 focus:ring-[#FF5A1F]'
      }`}
    >
      {/* Top Banner Accent for Women-Only Trips */}
      {isWomenOnly && (
        <div className="bg-gradient-to-r from-pink-600 to-rose-500 text-white text-[11px] font-bold px-3 py-1 flex items-center justify-between z-20">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-pink-200" />
            <span>Women-Only Expedition</span>
          </span>
          <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
            Verified Safe Space
          </span>
        </div>
      )}

      {/* Image Header */}
      <div className="relative h-48 sm:h-56 md:h-60 w-full overflow-hidden bg-slate-900">
        <img
          src={
            trip.images?.[0] ||
            'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80'
          }
          alt={trip.title}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0C2438] via-black/25 to-black/35" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10 gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] sm:text-xs px-2.5 py-1 rounded-full font-bold bg-[#071A2B]/90 text-white backdrop-blur-md border border-white/15 flex items-center gap-1.5 shadow min-h-[32px]">
              <Users className={`w-3.5 h-3.5 shrink-0 ${isWomenOnly ? 'text-pink-400' : 'text-[#FF5A1F]'}`} />
              <span>
                {availableSeats} {availableSeats === 1 ? 'seat left' : 'seats left'}
              </span>
            </span>

            {isWomenOnly ? (
              <span className="text-[11px] px-2.5 py-1 rounded-full font-bold bg-pink-500/30 text-pink-200 backdrop-blur-md border border-pink-400/40 shadow min-h-[32px] flex items-center gap-1">
                <span>🌸 All-Women</span>
              </span>
            ) : (
              primaryVibe && (
                <span className="hidden xs:inline-flex text-[11px] px-2.5 py-1 rounded-full font-semibold bg-white/15 text-slate-100 backdrop-blur-md border border-white/15 items-center gap-1 shadow min-h-[32px]">
                  <Tag className="w-3 h-3 text-amber-300 shrink-0" />
                  <span>{primaryVibe}</span>
                </span>
              )
            )}
          </div>

          <button
            type="button"
            onClick={handleHeartClick}
            onKeyDown={handleHeartKeyDown}
            aria-label={saved ? `Remove ${trip.title} from saved trips` : `Save ${trip.title}`}
            className={`w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-md transition-all cursor-pointer touch-manipulation shrink-0 ${
              saved
                ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
                : 'bg-black/50 hover:bg-black/70 text-white border border-white/25'
            } ${heartPopping ? 'animate-heart-pop' : ''}`}
          >
            <Heart className={`w-4 h-4 ${saved ? 'fill-white text-white' : 'text-white'}`} />
          </button>
        </div>

        {/* Bottom Image Overlay: Route pill */}
        <div className="absolute bottom-3 left-3 right-3 sm:left-3.5 sm:right-3.5 z-10">
          <div className="inline-flex items-center gap-1.5 bg-[#071A2B]/95 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/15 text-[11px] sm:text-xs text-white max-w-full shadow-md">
            <MapPin className={`w-3.5 h-3.5 shrink-0 ${isWomenOnly ? 'text-pink-400' : 'text-[#FF5A1F]'}`} />
            <span className="font-semibold truncate max-w-[85px] sm:max-w-[110px]">
              {startingLocation.split(',')[0]}
            </span>
            <span className={`font-bold ${isWomenOnly ? 'text-pink-400' : 'text-[#FF5A1F]'}`}>→</span>
            <span className="font-semibold truncate max-w-[95px] sm:max-w-[130px] text-amber-200">
              {trip.destination.split(',')[0]}
            </span>
          </div>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3.5">
        <div className="space-y-2.5">
          <h3 className={`text-base sm:text-lg font-bold text-white transition-colors line-clamp-1 ${isWomenOnly ? 'group-hover:text-pink-300' : 'group-hover:text-[#FF5A1F]'}`}>
            {trip.title}
          </h3>

          {/* Date & Duration */}
          <div className="flex items-center justify-between text-xs text-slate-300">
            <div className="flex items-center gap-1.5">
              <Calendar className={`w-3.5 h-3.5 shrink-0 ${isWomenOnly ? 'text-pink-400' : 'text-[#FF5A1F]'}`} />
              <span className="font-medium">{trip.dates}</span>
            </div>
            {trip.duration && (
              <span className="text-slate-400 font-medium bg-white/5 px-2 py-0.5 rounded-md border border-white/5">
                {trip.duration.split('/')[0].trim()}
              </span>
            )}
          </div>

          {/* Host Information */}
          <div className="flex items-center justify-between pt-2.5 border-t border-white/10 text-xs">
            <div className="flex items-center gap-2 min-w-0">
              {hostAvatar ? (
                <img
                  src={hostAvatar}
                  alt={hostName}
                  className="w-6 h-6 rounded-full object-cover ring-1 ring-white/20 shrink-0"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-slate-700 ring-1 ring-white/20 flex items-center justify-center text-[10px] font-bold text-slate-300 shrink-0">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
              <span className="font-medium text-slate-200 truncate max-w-[110px] sm:max-w-[140px]">
                {hostName}
              </span>
              {hasValidRating && (
                <span className="hidden xs:flex items-center gap-0.5 text-[11px] text-amber-300 font-bold shrink-0">
                  <Star className="w-3 h-3 fill-amber-300" />
                  <span>{Number(host.rating).toFixed(1)}</span>
                </span>
              )}
            </div>
            {isVerified && (
              <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium shrink-0">
                <ShieldCheck className="w-3 h-3" />
                <span>Verified Host</span>
              </span>
            )}
          </div>
        </div>

        {/* Footer: Price & View Button */}
        <div className="pt-3 border-t border-white/10 flex flex-col xs:flex-row items-stretch xs:items-center justify-between gap-3">
          <div className="flex items-baseline xs:block justify-between">
            <span className="text-[10px] text-slate-400 block uppercase font-medium tracking-wide">
              Contribution / Price
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-lg sm:text-xl font-black text-white">
                {formatPrice(trip.price)}
              </span>
              <span className="text-[11px] text-slate-400">/ person</span>
            </div>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              navigate('trip-detail', { id: trip.id });
            }}
            aria-label={`View full itinerary for ${trip.title}`}
            className={`!py-2.5 xs:!py-2 !px-4 !text-xs font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer rounded-full transition-transform w-full xs:w-auto min-h-[44px] ${
              isWomenOnly
                ? 'bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white shadow-md shadow-pink-600/30'
                : 'btn-primary-cb shadow-md shadow-[#FF5A1F]/20'
            }`}
          >
            <span>View Trip</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
