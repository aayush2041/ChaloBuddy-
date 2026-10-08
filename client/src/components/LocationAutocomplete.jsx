import React, { useState, useEffect, useRef } from 'react';
import { searchDestinations, DESTINATIONS_DATABASE } from '../data/destinationsData';
import { searchLocations, geocodeLocation } from '../services/destinationDiscoveryService';
import { MapPin, Loader2, ChevronRight, AlertCircle, X } from 'lucide-react';

export default function LocationAutocomplete({
  value = '',
  onChange,
  onSelectLocation,
  placeholder = 'Search any city, town or destination...',
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
          const isMatch = lastSelectedRef.current &&
            (lastSelectedRef.current.fullName === trimmed || lastSelectedRef.current.city?.toLowerCase() === trimmed.toLowerCase());
          if (!isMatch) {
            // Check local database first
            const localExact = DESTINATIONS_DATABASE.find(
              (d) => d.city.toLowerCase() === trimmed.toLowerCase() ||
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
      // 1. Check local database match
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

      // 2. Fallback to Open-Meteo live geocoding
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
    setResults([]); // Clear stale suggestions while typing new query

    const localExact = DESTINATIONS_DATABASE.find(
      (d) => d.city.toLowerCase() === text.trim().toLowerCase() ||
        d.fullName.toLowerCase() === text.trim().toLowerCase()
    );

    if (localExact) {
      lastSelectedRef.current = localExact;
      onChange?.(text, localExact);
    } else {
      lastSelectedRef.current = null;
      onChange?.(text, null);
    }

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

        const merged = [...local, ...live].filter(
          (item, index, arr) =>
            index === arr.findIndex((x) =>
              String(x.fullName).toLowerCase() === String(item.fullName).toLowerCase()
            )
        );
        setResults(merged.slice(0, 10));
      } catch {
        // Fallback to local only on network failure
        setResults(searchDestinations(text).map((d) => ({ ...d, source: 'curated' })));
      } finally {
        setLoading(false);
      }
    }, 250);
  };

  const handleSelect = (loc) => {
    if (!loc) return;
    const structured = {
      id: loc.id,
      placeId: loc.placeId || loc.id,
      placeName: loc.placeName || loc.city,
      city: loc.city || loc.placeName,
      state: loc.state || '',
      country: loc.country || '',
      countryCode: loc.countryCode || '',
      fullName: loc.fullName || [loc.city || loc.placeName, loc.state, loc.country].filter(Boolean).join(', '),
      type: loc.type || 'Destination',
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
      const textToUse = (e.target?.value !== undefined && e.target.value !== '') ? e.target.value.trim() : query.trim();
      if (!textToUse) return;

      const currentHighlighted = results[highlightedIndex];
      const matchesCurrentInput = currentHighlighted && (
        currentHighlighted.city?.toLowerCase() === textToUse.toLowerCase() ||
        currentHighlighted.fullName?.toLowerCase().includes(textToUse.toLowerCase()) ||
        textToUse.toLowerCase().includes(currentHighlighted.city?.toLowerCase())
      );

      if (isOpen && results.length > 0 && matchesCurrentInput) {
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

  const isDark = theme === 'dark';
  const displayError = error || internalError;

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {label && (
        <label className={`text-[11px] font-semibold uppercase tracking-wider block mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          {label} {required && <span className="text-[#FF5A1F]">*</span>}
        </label>
      )}

      <div className="relative w-full flex items-center">
        <MapPin className="w-4 h-4 mr-2 flex-shrink-0 text-[#FF5A1F]" />
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
          className={`w-full text-xs sm:text-sm font-bold focus:outline-none transition-all truncate ${isDark ? 'bg-transparent text-white placeholder-slate-400' : 'bg-transparent text-[#071A2B] placeholder-slate-400'}`}
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
            className="p-1 rounded-full text-slate-400 hover:text-white transition-colors cursor-pointer mr-1 shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
        {loading && <Loader2 className="w-4 h-4 text-[#FF5A1F] animate-spin shrink-0" />}
      </div>

      {displayError && (
        <div className="flex items-center gap-1.5 mt-1 text-[11px] text-rose-500 font-medium">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{displayError}</span>
        </div>
      )}

      {isOpen && results.length > 0 && (
        <div className={`absolute left-0 right-0 top-full mt-2 rounded-2xl shadow-2xl border z-50 overflow-hidden divide-y text-xs ${isDark ? 'bg-[#071A2B] border-white/15 divide-white/5 text-white' : 'bg-white border-slate-200 divide-slate-100 text-[#071A2B]'} max-h-80 overflow-y-auto`}>
          <div className={`px-3 py-2 text-[10px] uppercase font-bold tracking-wider ${isDark ? 'text-slate-400 bg-[#0C2438]' : 'text-slate-500 bg-slate-50'}`}>
            Search worldwide destinations
          </div>
          {results.map((loc, idx) => {
            const selected = highlightedIndex === idx;
            return (
              <div
                key={`${loc.id}-${idx}`}
                onMouseEnter={() => setHighlightedIndex(idx)}
                onClick={() => handleSelect(loc)}
                className={`p-3 cursor-pointer flex items-center justify-between gap-3 transition-colors ${selected ? (isDark ? 'bg-white/10' : 'bg-orange-50') : (isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50')}`}
              >
                <div className="flex items-start gap-2.5 overflow-hidden">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${isDark ? 'bg-white/10 text-[#FF5A1F]' : 'bg-orange-100 text-[#FF5A1F]'}`}>
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div className="overflow-hidden">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm truncate">{loc.city || loc.placeName}</span>
                      {loc.source === 'curated' && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-orange-100 text-orange-700">Popular</span>
                      )}
                    </div>
                    <p className={`text-[11px] truncate mt-0.5 ${isDark ? 'text-slate-300' : 'text-slate-500'}`}>
                      {[loc.state, loc.country].filter(Boolean).join(', ')}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-[#FF5A1F] flex-shrink-0" />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
