import React, { useState } from 'react';
import {
  MapPin,
  ExternalLink,
  Navigation,
  Compass,
  Star,
  Maximize2,
  Minimize2,
  Layers,
  X,
} from 'lucide-react';

export default function GoogleMapsView({
  stays = [],
  selectedStay = null,
  onSelectStay = null,
  destinationName = '',
  className = '',
  height = '500px',
  interactive = true,
}) {
  const activeStay = selectedStay || stays[0] || null;
  const [mapType, setMapType] = useState('m'); // 'm' for roadmap, 'k' for satellite
  const [zoom, setZoom] = useState(13);

  // Determine query for Google Maps embed
  let mapQuery = '';
  if (activeStay?.lat && activeStay?.lng) {
    mapQuery = `${activeStay.lat},${activeStay.lng}`;
  } else if (activeStay) {
    mapQuery = `${activeStay.name}, ${activeStay.location}`;
  } else if (destinationName) {
    mapQuery = destinationName;
  } else {
    mapQuery = 'Manali, Himachal Pradesh';
  }

  const embedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&t=${mapType}&z=${zoom}&ie=UTF8&iwloc=&output=embed`;
  const directMapsUrl = activeStay
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activeStay.name + ', ' + activeStay.location)}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(destinationName || 'Himalayan Stays')}`;

  const directionsUrl = activeStay?.lat && activeStay?.lng
    ? `https://www.google.com/maps/dir/?api=1&destination=${activeStay.lat},${activeStay.lng}`
    : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(activeStay?.location || destinationName)}`;

  return (
    <div
      className={`relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200/80 bg-[#071A2B] text-white flex flex-col ${className}`}
      style={{ minHeight: height }}
    >
      {/* Top Map Control Bar */}
      <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none">
        {/* Left: Active Location Pill */}
        <div className="pointer-events-auto bg-[#071A2B]/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/15 shadow-lg flex items-center gap-2 max-w-[70%]">
          <div className="w-2.5 h-2.5 rounded-full bg-[#FF5A1F] animate-ping flex-shrink-0" />
          <span className="text-xs font-bold text-white truncate">
            {activeStay ? activeStay.name : destinationName || 'Interactive Map'}
          </span>
          {activeStay && (
            <span className="text-[10px] text-slate-300 hidden sm:inline truncate">
              • {activeStay.location}
            </span>
          )}
        </div>

        {/* Right: Map Type & External Link Buttons */}
        <div className="pointer-events-auto flex items-center gap-2">
          {/* Satellite / Road Toggle */}
          <button
            type="button"
            onClick={() => setMapType((prev) => (prev === 'm' ? 'k' : 'm'))}
            className="px-2.5 py-1.5 rounded-full bg-[#071A2B]/90 backdrop-blur-md hover:bg-[#071A2B] text-white text-[11px] font-semibold border border-white/15 shadow-lg flex items-center gap-1 cursor-pointer transition-colors"
            title="Toggle Satellite / Road view"
          >
            <Layers className="w-3.5 h-3.5 text-[#FF5A1F]" />
            <span className="hidden sm:inline">{mapType === 'm' ? 'Satellite' : 'Road'}</span>
          </button>

          {/* Open in Google Maps */}
          <a
            href={directMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-full bg-[#FF5A1F] hover:bg-[#e0480f] text-white text-[11px] font-bold shadow-lg shadow-[#FF5A1F]/30 flex items-center gap-1 cursor-pointer transition-colors"
            title="Open live in Google Maps"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Open in Maps</span>
            <ExternalLink className="w-3 h-3 ml-0.5" />
          </a>
        </div>
      </div>

      {/* Google Maps Embed iframe */}
      <div className="w-full flex-1 relative bg-slate-900">
        <iframe
          title="Google Maps Location"
          src={embedUrl}
          className="w-full h-full border-0 absolute inset-0 filter saturate-110"
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>

      {/* Bottom Floating Stays Ribbon (if multiple stays provided) */}
      {interactive && stays.length > 0 && (
        <div className="absolute bottom-3 left-3 right-3 z-20 pointer-events-none">
          <div className="pointer-events-auto bg-[#071A2B]/90 backdrop-blur-md p-2 sm:p-2.5 rounded-2xl border border-white/15 shadow-xl flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 flex-shrink-0 hidden md:inline">
              Stays ({stays.length}):
            </span>

            {stays.map((stay) => {
              const isSelected = activeStay?.id === stay.id;
              return (
                <button
                  key={stay.id}
                  type="button"
                  onClick={() => onSelectStay && onSelectStay(stay)}
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-left transition-all cursor-pointer flex-shrink-0 max-w-[200px] ${
                    isSelected
                      ? 'bg-[#FF5A1F] text-white shadow-md'
                      : 'bg-white/10 hover:bg-white/20 text-slate-200'
                  }`}
                >
                  <img
                    src={stay.images?.[0] || 'https://images.unsplash.com/photo-1587061949409-02df41d5e562?auto=format&fit=crop&w=100&q=80'}
                    alt={stay.name}
                    className="w-6 h-6 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="overflow-hidden">
                    <p className="text-[11px] font-bold truncate leading-tight">{stay.name}</p>
                    <p className={`text-[10px] truncate ${isSelected ? 'text-white/90' : 'text-slate-400'}`}>
                      ₹{stay.pricePerNight?.toLocaleString('en-IN')}/nt • {stay.rating}★
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
