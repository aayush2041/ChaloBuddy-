import React, { useState, useEffect, useRef } from 'react';
import { searchDestinations, DESTINATIONS_DATABASE } from '../data/destinationsData';
import { MapPin, Sparkles, Check, ChevronRight } from 'lucide-react';

export default function LocationAutocomplete({
  value = '',
  onChange,
  onSelectLocation,
  placeholder = 'Search destination (e.g. Delhi, Dehradun, Spiti)...',
  label = '',
  theme = 'dark', // 'dark' | 'light'
  className = '',
  autoFocus = false,
  required = false,
  error = '',
}) {
  const [query, setQuery] = useState(
    typeof value === 'string' ? value : value?.city || value?.fullName || ''
  );
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const containerRef = useRef(null);

  // Sync external value
  useEffect(() => {
    if (typeof value === 'string') {
      setQuery(value);
    } else if (value && (value.city || value.fullName)) {
      setQuery(value.fullName || value.city);
    }
  }, [value]);

  const suggestions = searchDestinations(query);

  // Handle clicking outside to close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const text = e.target.value;
    setQuery(text);
    setIsOpen(true);
    setHighlightedIndex(0);

    // Look for exact match
    const exactMatch = DESTINATIONS_DATABASE.find(
      (d) => d.city.toLowerCase() === text.trim().toLowerCase()
    );

    if (onChange) {
      onChange(text, exactMatch || null);
    }
  };

  const handleSelect = (dest) => {
    setQuery(dest.city);
    setIsOpen(false);

    // Provide complete structured location object
    const structuredLocation = {
      id: dest.id,
      placeId: `loc_${dest.id}`,
      placeName: dest.city,
      city: dest.city,
      state: dest.state,
      country: dest.country,
      fullName: dest.fullName,
      type: dest.type,
      lat: dest.lat,
      lng: dest.lng,
      popularSpots: dest.popularSpots,
    };

    if (onSelectLocation) {
      onSelectLocation(structuredLocation);
    }
    if (onChange) {
      onChange(dest.city, structuredLocation);
    }
  };

  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (suggestions[highlightedIndex]) {
        handleSelect(suggestions[highlightedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const isDark = theme === 'dark';

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Optional Label */}
      {label && (
        <label className={`text-[11px] font-semibold uppercase tracking-wider block mb-1 ${
          isDark ? 'text-slate-400' : 'text-slate-500'
        }`}>
          {label} {required && <span className="text-[#FF5A1F]">*</span>}
        </label>
      )}

      {/* Input Field */}
      <div className="relative w-full flex items-center">
        <input
          type="text"
          autoFocus={autoFocus}
          value={query}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          required={required}
          className={`w-full text-xs sm:text-sm font-bold focus:outline-none transition-all truncate ${
            isDark
              ? 'bg-transparent text-white placeholder-slate-400'
              : 'bg-transparent text-[#071A2B] placeholder-slate-400'
          }`}
        />
      </div>

      {error && (
        <p className="text-[11px] text-rose-500 font-medium mt-1">{error}</p>
      )}

      {/* Autocomplete Suggestions Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div
          className={`absolute left-0 right-0 top-full mt-2 rounded-2xl shadow-2xl border z-50 overflow-hidden divide-y text-xs transition-all animate-fade-in ${
            isDark
              ? 'bg-[#071A2B] border-white/15 divide-white/5 text-white shadow-black/60'
              : 'bg-white border-slate-200 divide-slate-100 text-[#071A2B] shadow-slate-300/60'
          } max-h-72 overflow-y-auto`}
        >
          <div className={`px-3 py-1.5 text-[10px] uppercase font-bold tracking-wider ${
            isDark ? 'text-slate-400 bg-[#0C2438]' : 'text-slate-500 bg-slate-50'
          }`}>
            Matching Destinations ({suggestions.length})
          </div>

          {suggestions.map((dest, idx) => {
            const isSelected = highlightedIndex === idx;
            return (
              <div
                key={dest.id}
                onMouseEnter={() => setHighlightedIndex(idx)}
                onClick={() => handleSelect(dest)}
                className={`p-3 cursor-pointer flex items-center justify-between gap-3 transition-colors ${
                  isSelected
                    ? isDark
                      ? 'bg-white/10'
                      : 'bg-orange-50'
                    : isDark
                    ? 'hover:bg-white/5'
                    : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start gap-2.5 overflow-hidden">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    isDark ? 'bg-white/10 text-[#FF5A1F]' : 'bg-orange-100 text-[#FF5A1F]'
                  }`}>
                    <MapPin className="w-4 h-4" />
                  </div>

                  <div className="overflow-hidden">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm truncate">
                        {dest.city}
                      </span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        isDark ? 'bg-white/10 text-slate-300' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {dest.type}
                      </span>
                    </div>

                    <p className={`text-[11px] truncate mt-0.5 ${isDark ? 'text-slate-300' : 'text-slate-500'}`}>
                      {dest.state}, {dest.country}
                    </p>

                    {dest.popularSpots && dest.popularSpots.length > 0 && (
                      <p className={`text-[10px] truncate mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>
                        Top spots: {dest.popularSpots.slice(0, 3).join(' • ')}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <span className={`text-[10px] font-medium hidden sm:inline ${
                    isDark ? 'text-slate-400' : 'text-slate-400'
                  }`}>
                    Select
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#FF5A1F]" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
