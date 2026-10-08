import React, { useState, useMemo, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import {
  Search,
  X,
  MapPin,
  Calendar,
  Home,
  Users,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export default function SearchModal() {
  const {
    searchModalOpen,
    setSearchModalOpen,
    trips,
    stays,
    buddies,
    formatPrice,
    navigate,
  } = useStore();

  const [query, setQuery] = useState('');

  const filteredTrips = useMemo(() => {
    if (!searchModalOpen) return [];
    if (!query.trim()) return (trips || []).slice(0, 3);
    const q = query.toLowerCase();
    return (trips || []).filter(
      (t) =>
        t.title?.toLowerCase().includes(q) ||
        t.destination?.toLowerCase().includes(q) ||
        t.difficulty?.toLowerCase().includes(q) ||
        (t.vibes || []).some((v) => v.toLowerCase().includes(q))
    );
  }, [searchModalOpen, trips, query]);

  const filteredStays = useMemo(() => {
    if (!searchModalOpen) return [];
    if (!query.trim()) return (stays || []).slice(0, 2);
    const q = query.toLowerCase();
    return (stays || []).filter(
      (s) =>
        s.name?.toLowerCase().includes(q) ||
        s.location?.toLowerCase().includes(q) ||
        s.propertyType?.toLowerCase().includes(q)
    );
  }, [searchModalOpen, stays, query]);

  const filteredBuddies = useMemo(() => {
    if (!searchModalOpen) return [];
    if (!query.trim()) return (buddies || []).slice(0, 2);
    const q = query.toLowerCase();
    return (buddies || []).filter(
      (b) =>
        b.name?.toLowerCase().includes(q) ||
        b.location?.toLowerCase().includes(q) ||
        (b.travelStyle || []).some((s) => s.toLowerCase().includes(q))
    );
  }, [searchModalOpen, buddies, query]);

  // Close on Escape key
  useEffect(() => {
    if (!searchModalOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setSearchModalOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchModalOpen, setSearchModalOpen]);

  if (!searchModalOpen) return null;

  const handleSelectTrip = (id) => {
    setSearchModalOpen(false);
    navigate('trip-detail', { id });
  };

  const handleSelectStay = (id) => {
    setSearchModalOpen(false);
    navigate('stay-detail', { id });
  };

  const handleSelectBuddy = (id) => {
    setSearchModalOpen(false);
    navigate('profile', { id });
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) setSearchModalOpen(false);
      }}
      className="fixed inset-0 z-50 flex items-start justify-center pt-14 sm:pt-20 p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-fade-in"
    >
      <div data-testid="search-modal-container" className="bg-[#0C2438] text-white w-full max-w-2xl rounded-3xl border border-white/15 shadow-2xl overflow-hidden flex flex-col max-h-[85vh] sm:max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-white/10 flex items-center gap-3 bg-[#071A2B]">
          <Search className="w-5 h-5 text-[#FF5A1F] flex-shrink-0" />
          <input
            type="text"
            data-testid="search-modal-input"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search destination, trip name, stay, or travel buddy (e.g. Spiti, Manali, Trekking)..."
            className="w-full bg-transparent text-sm text-white placeholder-slate-400 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-xs text-slate-400 hover:text-white"
            >
              Clear
            </button>
          )}
          <button
            data-testid="search-modal-close-btn"
            aria-label="Close search"
            onClick={() => setSearchModalOpen(false)}
            className="p-1 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results List */}
        <div className="p-4 overflow-y-auto space-y-6">
          {/* Quick Popular Keywords */}
          {!query && (
            <div>
              <p className="text-[11px] uppercase font-bold tracking-wider text-slate-400 mb-2">
                Trending Searches
              </p>
              <div className="flex flex-wrap gap-2">
                {['Spiti Valley', 'Kasol', 'Kedarkantha Trek', 'Goa Beaches', 'Old Manali', 'Meghalaya'].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setQuery(tag)}
                    className="text-xs px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 cursor-pointer"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Trips Section */}
          {filteredTrips.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#FF5A1F] uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  Trips ({filteredTrips.length})
                </span>
                <button
                  onClick={() => {
                    setSearchModalOpen(false);
                    navigate('trips');
                  }}
                  className="text-xs text-slate-400 hover:text-white hover:underline cursor-pointer"
                >
                  View all trips →
                </button>
              </div>

              <div className="divide-y divide-white/5">
                {filteredTrips.map((trip) => (
                  <div
                    key={trip.id}
                    onClick={() => handleSelectTrip(trip.id)}
                    className="p-3 rounded-2xl hover:bg-white/5 cursor-pointer transition-colors flex items-center justify-between gap-3 group"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <img
                        src={trip.images[0]}
                        alt={trip.title}
                        className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                      />
                      <div className="overflow-hidden">
                        <p className="font-bold text-xs text-white group-hover:text-[#FF5A1F] transition-colors truncate">
                          {trip.title}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate">
                          {trip.destination} • {trip.dates}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="text-xs font-bold text-white block">
                        {formatPrice(trip.price)}
                      </span>
                      <span className="text-[10px] text-emerald-400 font-semibold">{trip.difficulty}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Stays Section */}
          {filteredStays.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Home className="w-3.5 h-3.5" />
                Stays & Cottages ({filteredStays.length})
              </span>

              <div className="divide-y divide-white/5">
                {filteredStays.map((stay) => (
                  <div
                    key={stay.id}
                    onClick={() => handleSelectStay(stay.id)}
                    className="p-3 rounded-2xl hover:bg-white/5 cursor-pointer transition-colors flex items-center justify-between gap-3 group"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <img
                        src={stay.images[0]}
                        alt={stay.name}
                        className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                      />
                      <div className="overflow-hidden">
                        <p className="font-bold text-xs text-white group-hover:text-amber-400 transition-colors truncate">
                          {stay.name}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate">
                          {stay.location} • {stay.propertyType}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="text-xs font-bold text-white block">
                        {formatPrice(stay.pricePerNight)}
                      </span>
                      <span className="text-[10px] text-slate-400">/ night</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Travel Buddies Section */}
          {filteredBuddies.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                Travel Buddies ({filteredBuddies.length})
              </span>

              <div className="divide-y divide-white/5">
                {filteredBuddies.map((buddy) => (
                  <div
                    key={buddy.id}
                    onClick={() => handleSelectBuddy(buddy.id)}
                    className="p-3 rounded-2xl hover:bg-white/5 cursor-pointer transition-colors flex items-center justify-between gap-3 group"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <img
                        src={buddy.avatar}
                        alt={buddy.name}
                        className="w-10 h-10 rounded-full object-cover flex-shrink-0 ring-1 ring-sky-400"
                      />
                      <div className="overflow-hidden">
                        <p className="font-bold text-xs text-white group-hover:text-sky-400 transition-colors truncate">
                          {buddy.name}, {buddy.age}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate">
                          {buddy.location} • {buddy.tripsCompleted} trips done
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {filteredTrips.length === 0 && filteredStays.length === 0 && filteredBuddies.length === 0 && (
            <div className="text-center py-8">
              <p className="text-slate-400 text-xs">No results found for "{query}".</p>
              <p className="text-slate-500 text-[11px] mt-1">Try searching for Manali, Spiti, Goa, or Trekking.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
