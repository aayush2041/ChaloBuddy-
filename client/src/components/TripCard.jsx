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

  const startingLocation = getTripStartingLocation(trip);
  const availableSeats = trip.spotsLeft ?? (trip.maxGroupSize - (trip.currentGroupSize || 0)) ?? 4;
  const host = trip.organizer || {
    name: 'Verified Host',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    rating: 4.9,
  };

  return (
    <div
      onClick={() => navigate('trip-detail', { id: trip.id })}
      className="group relative bg-[#0C2438] rounded-2xl overflow-hidden border border-white/10 shadow-lg hover:shadow-2xl hover:border-white/20 transition-all duration-300 flex flex-col justify-between cursor-pointer card-hover"
    >
      {/* Image Header with Responsive Height */}
      <div className="relative h-48 sm:h-56 md:h-60 w-full overflow-hidden bg-slate-900">
        <img
          src={trip.images?.[0] || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80'}
          alt={trip.title}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0C2438] via-black/20 to-black/30" />

        {/* Top Badges: Available Seats & Save Heart */}
        <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between z-10">
          <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-[#071A2B]/90 text-white backdrop-blur-md border border-white/15 flex items-center gap-1.5 shadow min-h-[30px]">
            <Users className="w-3.5 h-3.5 text-[#FF5A1F]" />
            <span>{availableSeats} {availableSeats === 1 ? 'seat left' : 'seats left'}</span>
          </span>

          <button
            type="button"
            onClick={handleHeartClick}
            aria-label="Save trip"
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center backdrop-blur-md transition-all cursor-pointer touch-manipulation ${
              saved
                ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
                : 'bg-black/40 hover:bg-black/60 text-white border border-white/20'
            } ${heartPopping ? 'animate-heart-pop' : ''}`}
          >
            <Heart className={`w-4 h-4 ${saved ? 'fill-white' : ''}`} />
          </button>
        </div>

        {/* Bottom Image Overlay: Route pill */}
        <div className="absolute bottom-3 left-3 right-3 sm:left-3.5 sm:right-3.5 z-10">
          <div className="inline-flex items-center gap-1.5 bg-[#071A2B]/90 backdrop-blur-md px-2.5 sm:px-3 py-1 rounded-full border border-white/15 text-[11px] sm:text-xs text-white max-w-full">
            <MapPin className="w-3.5 h-3.5 text-[#FF5A1F] flex-shrink-0" />
            <span className="font-semibold truncate max-w-[85px] sm:max-w-[110px]">{startingLocation.split(',')[0]}</span>
            <span className="text-[#FF5A1F] font-bold">→</span>
            <span className="font-semibold truncate max-w-[95px] sm:max-w-[130px] text-amber-200">
              {trip.destination.split(',')[0]}
            </span>
          </div>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3 sm:space-y-4">
        <div className="space-y-2">
          {/* Title */}
          <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-[#FF5A1F] transition-colors line-clamp-1">
            {trip.title}
          </h3>

          {/* Date & Duration */}
          <div className="flex items-center justify-between text-xs text-slate-300">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#FF5A1F]" />
              <span>{trip.dates}</span>
            </div>
            {trip.duration && (
              <span className="text-slate-400 font-medium">
                {trip.duration.split('/')[0].trim()}
              </span>
            )}
          </div>

          {/* Host Information */}
          <div className="flex items-center justify-between pt-2.5 border-t border-white/10 text-xs">
            <div className="flex items-center gap-2">
              <img
                src={host.avatar}
                alt={host.name}
                className="w-6 h-6 rounded-full object-cover ring-1 ring-white/20"
              />
              <span className="font-medium text-slate-200 truncate max-w-[130px]">
                {host.name}
              </span>
            </div>
            {trip.verifiedOrganizer && (
              <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                <ShieldCheck className="w-3 h-3" />
                Verified
              </span>
            )}
          </div>
        </div>

        {/* Footer: Price & Clear View Trip Button - Vertically structured on small mobile screens */}
        <div className="pt-3 border-t border-white/10 flex flex-col xs:flex-row items-stretch xs:items-center justify-between gap-3">
          <div className="flex items-baseline xs:block justify-between">
            <span className="text-[10px] text-slate-400 block uppercase font-medium">
              Contribution / Price
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-black text-white">
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
            className="btn-primary-cb !py-2.5 xs:!py-2 !px-4 !text-xs font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-[#FF5A1F]/20 group-hover:scale-102 transition-transform w-full xs:w-auto min-h-[40px]"
          >
            <span>View Trip</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
