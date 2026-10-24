import React, { useState, useEffect, useRef } from 'react';
import { searchDestinations, DESTINATIONS_DATABASE } from '../data/destinationsData';
import { searchLocations, geocodeLocation } from '../services/destinationDiscoveryService';
import { findTransportHubs } from '../data/transportHubsData';
import {
  MapPin,
  Plane,
  Train,
  Bus,
  Anchor,
  Building2,
  Loader2,
  ChevronRight,
  AlertCircle,
  X,
} from 'lucide-react';

export default function LocationAutocomplete({
  value = '',
  onChange,
  onSelectLocation,
  placeholder = 'Search city, airport, railway station, landmark...',
  label = '',
  theme = 'dark',
  className = '',
  autoFocus = false,
  required = false,
  error = '',
  inputTestId = '',
}) {
  const [query, setQuery] = useState(typeof value === 'string' ? value : value?.fullName || '');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [internalError, setInternalError] = useState('');
  const containerRef = useRef(null);
  const debounceRef = useRef(null);
  const lastSelectedRef = useRef(typeof value === 'object' ? value : null);

  useEffect(() => {
    if (typeof value === 'string') {
      setQuery(value);
    } else if (value?.fullName || value?.city) {
      setQuery(value.fullName || value.city);
      lastSelectedRef.current = value;
    }
  }, [value]);

  useEffect(() => {
    const onOutside = async (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        const trimmed = query.trim();
        if (trimmed.length > 1) {
          const isMatch =
            lastSelectedRef.current &&
            (lastSelectedRef.current.fullName === trimmed ||
              lastSelectedRef.current.city?.toLowerCase() === trimmed.toLowerCase());
          if (!isMatch) {
            // Check hubs first
            const hubMatch = findTransportHubs(trimmed, 1);
            if (hubMatch.length > 0) {
              handleSelect(hubMatch[0]);
              return;
            }
            // Check local database
            const localExact = DESTINATIONS_DATABASE.find(
              (d) =>
                d.city.toLowerCase() === trimmed.toLowerCase() ||
                d.fullName.toLowerCase() === trimmed.toLowerCase()
            );
            if (localExact) {
              handleSelect({ ...localExact, source: 'curated' });
            } else if (results.length > 0 && !loading) {
              handleSelect(results[0]);
            }
          }
        }
      }
    };
    document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, [query, results, loading]);

  useEffect(() => () => clearTimeout(debounceRef.current), []);

  const resolveQueryImmediately = async (textToResolve) => {
    const raw = String(textToResolve || query).trim();
    if (!raw) return;

    setLoading(true);
    setInternalError('');

    try {
      // 1. Check transport hubs
      const hubMatch = findTransportHubs(raw, 1);
      if (hubMatch.length > 0) {
        handleSelect(hubMatch[0]);
        return;
      }

      // 2. Check local curated destinations
      const localMatch = DESTINATIONS_DATABASE.find(
        (d) =>
          d.city.toLowerCase() === raw.toLowerCase() ||
          d.fullName.toLowerCase() === raw.toLowerCase() ||
          (raw.length > 2 && d.city.toLowerCase().startsWith(raw.toLowerCase()))
      );

      if (localMatch) {
        handleSelect({ ...localMatch, source: 'curated' });
        return;
      }

      // 3. Fallback to Open-Meteo live geocoding
      const geocoded = await geocodeLocation(raw);
      if (geocoded && Number.isFinite(Number(geocoded.lat)) && Number.isFinite(Number(geocoded.lng))) {
        handleSelect(geocoded);
        return;
      }

      throw new Error(`Location not found: ${raw}`);
    } catch (err) {
      const msg = `Could not find location "${raw}". Please check the spelling or choose from suggestions.`;
      setInternalError(msg);
      setIsOpen(false);
      setResults([]);
      lastSelectedRef.current = null;
      onChange?.(raw, null);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const text = e.target.value;
    setQuery(text);
    setIsOpen(true);
    setHighlightedIndex(0);
    setInternalError('');
    setResults([]);

    clearTimeout(debounceRef.current);
    if (text.trim().length < 2) {
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const live = await searchLocations(text, 8);
        const local = searchDestinations(text).map((d) => ({
          ...d,
          source: 'curated',
        }));

        const merged = [...live, ...local].filter(
          (item, index, arr) =>
            index === arr.findIndex((x) =>
              String(x.fullName).toLowerCase() === String(item.fullName).toLowerCase()
            )
        );
        setResults(merged.slice(0, 8));
      } catch {
        setResults(searchDestinations(text).map((d) => ({ ...d, source: 'curated' })));
      } finally {
        setLoading(false);
      }
    }, 200);
  };

  const handleSelect = (loc) => {
    if (!loc) return;
    const structured = {
      id: loc.id,
      placeId: loc.placeId || loc.id,
      code: loc.code || '',
      placeName: loc.placeName || loc.city,
      city: loc.city || loc.placeName,
      state: loc.state || '',
      country: loc.country || '',
      countryCode: loc.countryCode || '',
      fullName: loc.fullName || [loc.city || loc.placeName, loc.state, loc.country].filter(Boolean).join(', '),
      type: loc.type || 'City',
      lat: Number(loc.lat),
      lng: Number(loc.lng),
      popularSpots: loc.popularSpots || [],
      source: loc.source || 'geocoding',
    };

    setQuery(structured.fullName);
    setIsOpen(false);
    setInternalError('');
    lastSelectedRef.current = structured;
    onSelectLocation?.(structured);
    onChange?.(structured.fullName, structured);
  };

  const handleKeyDown = async (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const textToUse =
        e.target?.value !== undefined && e.target.value !== '' ? e.target.value.trim() : query.trim();
      if (!textToUse) return;

      const currentHighlighted = results[highlightedIndex];
      if (isOpen && results.length > 0 && currentHighlighted) {
        handleSelect(currentHighlighted);
      } else {
        await resolveQueryImmediately(textToUse);
      }
      return;
    }

    if (!isOpen || !results.length) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') setIsOpen(true);
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((i) => (i + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((i) => (i - 1 + results.length) % results.length);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const renderTypeIcon = (type) => {
    switch (type) {
      case 'Airport':
        return <Plane className="w-3.5 h-3.5 text-sky-400" />;
      case 'Railway Station':
        return <Train className="w-3.5 h-3.5 text-amber-400" />;
      case 'Bus Station':
        return <Bus className="w-3.5 h-3.5 text-emerald-400" />;
      case 'Ferry Port':
        return <Anchor className="w-3.5 h-3.5 text-teal-400" />;
      case 'City':
      case 'Metropolis & Capital Hub':
        return <Building2 className="w-3.5 h-3.5 text-[#FF5A1F]" />;
      default:
        return <MapPin className="w-3.5 h-3.5 text-[#FF5A1F]" />;
    }
  };

  const isDark = theme === 'dark';
  const displayError = error || internalError;

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {label && (
        <label
          className={`text-[11px] font-bold uppercase tracking-wider block mb-1.5 ${
            isDark ? 'text-slate-300' : 'text-slate-600'
          }`}
        >
          {label} {required && <span className="text-[#FF5A1F]">*</span>}
        </label>
      )}

      <div
        className={`relative w-full flex items-center px-3 py-2.5 rounded-2xl border transition-all ${
          isDark
            ? 'bg-[#071A2B]/80 border-white/15 focus-within:border-[#FF5A1F] focus-within:ring-2 focus-within:ring-[#FF5A1F]/30 text-white'
            : 'bg-white border-slate-300 focus-within:border-[#FF5A1F] focus-within:ring-2 focus-within:ring-[#FF5A1F]/20 text-[#071A2B] shadow-sm'
        }`}
      >
        <div className="mr-2.5 flex-shrink-0">
          {renderTypeIcon(lastSelectedRef.current?.type || 'Destination')}
        </div>

        <input
          type="text"
          data-testid={inputTestId || undefined}
          autoFocus={autoFocus}
          value={query}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          required={required}
          className={`w-full text-xs sm:text-sm font-semibold focus:outline-none transition-all truncate bg-transparent ${
            isDark ? 'text-white placeholder-slate-400' : 'text-[#071A2B] placeholder-slate-400'
          }`}
        />

        {query && !loading && (
          <button
            type="button"
            aria-label="Clear location"
            onClick={() => {
              setQuery('');
              setIsOpen(false);
              setResults([]);
              lastSelectedRef.current = null;
              onChange?.('', null);
            }}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer mr-1 shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}

        {loading && <Loader2 className="w-4 h-4 text-[#FF5A1F] animate-spin shrink-0" />}
      </div>

      {displayError && (
        <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-rose-500 font-medium">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{displayError}</span>
        </div>
      )}

      {isOpen && results.length > 0 && (
        <div
          className={`absolute left-0 right-0 top-full mt-2 rounded-2xl shadow-2xl border z-50 overflow-hidden divide-y text-xs ${
            isDark
              ? 'bg-[#071A2B] border-white/20 divide-white/5 text-white shadow-black/60'
              : 'bg-white border-slate-200 divide-slate-100 text-[#071A2B]'
          } max-h-80 overflow-y-auto`}
        >
          <div
            className={`px-3 py-1.5 text-[10px] uppercase font-bold tracking-wider flex items-center justify-between ${
              isDark ? 'text-slate-400 bg-[#0C2438]' : 'text-slate-500 bg-slate-50'
            }`}
          >
            <span>Suggested Cities, Stations & Airports</span>
            <span className="text-[9px] font-normal lowercase opacity-75">powered by open transport registry</span>
          </div>

          {results.map((loc, idx) => {
            const selected = highlightedIndex === idx;
            return (
              <div
                key={`${loc.id || loc.placeId}-${idx}`}
                onMouseEnter={() => setHighlightedIndex(idx)}
                onClick={() => handleSelect(loc)}
                className={`p-3 cursor-pointer flex items-center justify-between gap-3 transition-colors ${
                  selected
                    ? isDark
                      ? 'bg-white/10 text-white'
                      : 'bg-orange-50 text-[#FF5A1F]'
                    : isDark
                    ? 'hover:bg-white/5'
                    : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      isDark ? 'bg-white/10' : 'bg-slate-100'
                    }`}
                  >
                    {renderTypeIcon(loc.type)}
                  </div>

                  <div className="overflow-hidden">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-xs sm:text-sm truncate">
                        {loc.placeName || loc.city}
                      </span>
                      {loc.code && (
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-[#FF5A1F]/20 text-[#FF5A1F] border border-[#FF5A1F]/30">
                          {loc.code}
                        </span>
                      )}
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/10 text-slate-300 font-medium">
                        {loc.type || 'City'}
                      </span>
                    </div>
                    <p
                      className={`text-[11px] truncate mt-0.5 ${
                        isDark ? 'text-slate-400' : 'text-slate-500'
                      }`}
                    >
                      {[loc.city, loc.state, loc.country].filter(Boolean).join(', ')}
                    </p>
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
