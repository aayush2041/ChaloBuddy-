import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import {
  Heart,
  Star,
  MapPin,
  Wifi,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

export default function StayCard({ stay }) {
  const { navigate, formatPrice, toggleSaveStay, isStaySaved } = useStore();
  const [heartPopping, setHeartPopping] = useState(false);
  const saved = isStaySaved(stay.id);

  const handleHeartClick = (e) => {
    e.stopPropagation();
    setHeartPopping(true);
    toggleSaveStay(stay.id);
    setTimeout(() => setHeartPopping(false), 350);
  };

  return (
    <div
      onClick={() => navigate('stay-detail', { id: stay.id })}
      className="group relative bg-[#0C2438] rounded-3xl overflow-hidden border border-white/10 shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col cursor-pointer card-hover"
    >
      {/* Image Header with Responsive Height */}
      <div className="relative h-48 sm:h-56 md:h-60 w-full overflow-hidden bg-slate-900">
        <img
          src={stay.images[0]}
          alt={stay.name}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0C2438] via-transparent to-black/30" />

        {/* Top Badges */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
          <span className="text-xs px-3 py-1 rounded-full font-bold bg-[#071A2B]/80 text-white backdrop-blur-md border border-white/20">
            {stay.propertyType}
          </span>

          <button
            type="button"
            onClick={handleHeartClick}
            aria-label="Save stay"
            className={`w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md transition-all duration-200 cursor-pointer touch-manipulation ${
              saved
                ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
                : 'bg-black/40 hover:bg-black/60 text-white border border-white/20'
            } ${heartPopping ? 'animate-heart-pop' : ''}`}
          >
            <Heart className={`w-4 h-4 ${saved ? 'fill-white' : ''}`} />
          </button>
        </div>

        {/* Bottom Amenity Highlights */}
        <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs text-white/90 z-10">
          <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-sm px-2.5 py-0.5 rounded-full border border-white/10">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="font-bold">{stay.rating}</span>
            <span className="text-slate-300">({stay.reviewCount})</span>
          </div>
          <span className="bg-white/15 backdrop-blur-md px-2 py-0.5 rounded-full text-[11px]">
            {stay.host?.superhost ? '★ Superhost' : 'Verified Stay'}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <div className="flex items-center gap-1 text-xs text-slate-400 mb-1">
            <MapPin className="w-3.5 h-3.5 text-[#FF5A1F]" />
            <span className="truncate">{stay.location}</span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-[#FF5A1F] transition-colors line-clamp-1">
            {stay.name}
          </h3>
          <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
            {stay.description}
          </p>

          {/* Quick Amenities */}
          <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-white/10">
            {(stay.amenities || []).slice(0, 3).map((amenity, idx) => (
              <span
                key={idx}
                className="text-[11px] px-2 py-0.5 rounded-md bg-white/5 text-slate-300 border border-white/5"
              >
                {amenity}
              </span>
            ))}
          </div>
        </div>

        {/* Price & CTA */}
        <div className="pt-2 flex flex-col xs:flex-row items-stretch xs:items-center justify-between border-t border-white/10 gap-2">
          <div className="flex items-baseline xs:block justify-between">
            <span className="text-[11px] text-slate-400 block font-normal">Nightly rate</span>
            <div className="flex items-baseline gap-1">
              <span className="text-lg sm:text-xl font-extrabold text-white">
                {formatPrice(stay.pricePerNight)}
              </span>
              <span className="text-xs text-slate-400">/ night</span>
            </div>
          </div>

          <div className="w-full xs:w-auto flex justify-end">
            <button
              type="button"
              className="btn-primary-cb !py-2 !px-4 !text-xs font-bold w-full xs:w-auto inline-flex items-center justify-center gap-1.5"
            >
              <span>View Stay</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
