import React, { useState, useMemo, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import TripCard from '../components/TripCard';
import DestinationAutocomplete from '../components/DestinationAutocomplete';
import {
  Search,
  Filter,
  SlidersHorizontal,
  MapPin,
  Calendar,
  Wallet,
  ShieldCheck,
  Map as MapIcon,
  Grid,
  X,
  Sparkles,
  ArrowUpDown,
  Compass,
} from 'lucide-react';

export default function TripsPage() {
  const { trips, formatPrice, currentRoute, navigate, selectedLocation, setSelectedLocation } = useStore();

  // Search & Filter State
  const [searchDestination, setSearchDestination] = useState(
    currentRoute?.params?.destination || (selectedLocation ? selectedLocation.city : '')
  );
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [selectedDuration, setSelectedDuration] = useState('All'); // 'All' | 'weekend' | 'week' | 'long'
  const [maxBudget, setMaxBudget] = useState(
    currentRoute?.params?.budget ? Number(currentRoute.params.budget) : 30000
  );
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [selectedVibe, setSelectedVibe] = useState(currentRoute?.params?.vibe || 'All');
  const [sortBy, setSortBy] = useState('recommended'); // 'recommended' | 'price-asc' | 'price-desc' | 'duration'
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [showMapPanel, setShowMapPanel] = useState(false);

  // Synchronize route params when user searches from Home or changes filters
  useEffect(() => {
    if (currentRoute?.params?.destination !== undefined) {
      setSearchDestination(currentRoute.params.destination);
    }
    if (currentRoute?.params?.budget !== undefined) {
      setMaxBudget(Number(currentRoute.params.budget));
    }
    if (currentRoute?.params?.vibe !== undefined) {
      setSelectedVibe(currentRoute.params.vibe);
    }
  }, [currentRoute?.params]);

  // Filter & Sort Logic
  const filteredTrips = useMemo(() => {
    return trips
      .filter((trip) => {
        // Destination filter
        if (
          searchDestination.trim() &&
          !trip.destination.toLowerCase().includes(searchDestination.toLowerCase()) &&
          !trip.title.toLowerCase().includes(searchDestination.toLowerCase())
        ) {
          return false;
        }

        // Difficulty filter
        if (selectedDifficulty !== 'All' && trip.difficulty !== selectedDifficulty) {
          return false;
        }

        // Vibe filter
        if (selectedVibe !== 'All' && !(trip.vibes || []).includes(selectedVibe) && trip.vibe !== selectedVibe) {
          return false;
        }

        // Budget filter
        if (trip.price > maxBudget) {
          return false;
        }

        // Verified organizer filter
        if (verifiedOnly && !trip.verifiedOrganizer) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'duration') return parseInt(b.duration) - parseInt(a.duration);
        return (b.rating || 4.5) - (a.rating || 4.5); // 'recommended'
      });
  }, [trips, searchDestination, selectedDifficulty, selectedVibe, maxBudget, verifiedOnly, sortBy]);

  const clearFilters = () => {
    setSearchDestination('');
    setSelectedDifficulty('All');
    setSelectedDuration('All');
    setMaxBudget(30000);
    setVerifiedOnly(false);
    setSelectedVibe('All');
    setSortBy('recommended');
  };

  return (
    <div className="min-h-screen bg-[#F5F7F8] pt-24 pb-20">
      {/* Top Banner & Search Bar */}
      <div className="bg-[#071A2B] text-white py-10 px-4 sm:px-6 lg:px-8 border-b border-white/10">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#FF5A1F]">
                Verified Group Journeys
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white mt-1">
                Find Your Next Trip
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Explore handpicked expeditions across the Himalayas, coastal trails, and cultural hubs.
              </p>
            </div>

            {/* View Mode Toggle: Grid vs Map Split */}
            <button
              onClick={() => setShowMapPanel(!showMapPanel)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                showMapPanel
                  ? 'bg-[#FF5A1F] text-white'
                  : 'bg-white/10 hover:bg-white/20 text-white border border-white/15'
              }`}
            >
              <MapIcon className="w-4 h-4" />
              <span>{showMapPanel ? 'Hide Map Panel' : 'Show Map Panel'}</span>
            </button>
          </div>

          {/* Quick Search Row */}
          <div className="bg-[#0C2438] p-3 rounded-2xl border border-white/15 shadow-xl grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex items-center gap-2.5 px-3 py-1.5 bg-[#071A2B] rounded-xl border border-white/10 relative">
              <MapPin className="w-4 h-4 text-[#FF5A1F] flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <DestinationAutocomplete
                  value={searchDestination}
                  onChange={(text, loc) => {
                    setSearchDestination(text);
                    if (loc) setSelectedLocation(loc);
                  }}
                  onSelectLocation={(loc) => {
                    setSearchDestination(loc.city);
                    setSelectedLocation(loc);
                  }}
                  placeholder="Where to? (e.g. Delhi, Dehradun, Spiti)"
                  theme="dark"
                />
              </div>
            </div>

            <div className="flex items-center gap-2.5 px-3 py-1.5 bg-[#071A2B] rounded-xl border border-white/10">
              <Wallet className="w-4 h-4 text-[#FF5A1F] flex-shrink-0" />
              <div className="w-full flex items-center justify-between text-xs">
                <span className="text-slate-400">Budget:</span>
                <span className="font-bold text-white">{formatPrice(maxBudget)} max</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative w-full">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full bg-[#071A2B] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF5A1F] cursor-pointer appearance-none"
                >
                  <option value="recommended">Sort: Recommended</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="duration">Duration: Longest First</option>
                </select>
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3 pointer-events-none" />
              </div>

              {/* Mobile Filter Toggle */}
              <button
                onClick={() => setMobileFilterOpen(true)}
                className="lg:hidden p-2 rounded-xl bg-[#FF5A1F] text-white flex-shrink-0 cursor-pointer"
              >
                <Filter className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Layout (Desktop: Left Filter Sidebar, Center Cards, Optional Map) */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block lg:col-span-3 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6 sticky top-28">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="font-bold text-sm text-[#071A2B] flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#FF5A1F]" />
                Filters
              </span>
              <button
                onClick={clearFilters}
                className="text-xs text-[#FF5A1F] hover:underline font-semibold cursor-pointer"
              >
                Reset All
              </button>
            </div>

            {/* Difficulty Filter */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#071A2B] uppercase tracking-wider block">
                Difficulty
              </label>
              <div className="grid grid-cols-2 gap-1.5 text-xs">
                {['All', 'Easy', 'Moderate', 'Challenging'].map((diff) => (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => setSelectedDifficulty(diff)}
                    className={`py-2 px-3 rounded-xl font-semibold border transition-all cursor-pointer text-center ${
                      selectedDifficulty === diff
                        ? 'bg-[#FF5A1F] text-white border-[#FF5A1F] shadow-sm'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

            {/* Vibe Filter */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#071A2B] uppercase tracking-wider block">
                Travel Vibe
              </label>
              <div className="flex flex-wrap gap-1.5 text-xs">
                {['All', 'Mountains', 'Trekking', 'Beaches', 'Cultural', 'Weekend'].map((vibe) => (
                  <button
                    key={vibe}
                    type="button"
                    onClick={() => setSelectedVibe(vibe)}
                    className={`px-3 py-1.5 rounded-full font-medium border transition-all cursor-pointer ${
                      selectedVibe === vibe
                        ? 'bg-[#071A2B] text-white border-[#071A2B]'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {vibe}
                  </button>
                ))}
              </div>
            </div>

            {/* Budget Slider */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs">
                <label className="font-bold text-[#071A2B] uppercase tracking-wider">
                  Max Budget
                </label>
                <span className="font-extrabold text-[#FF5A1F]">{formatPrice(maxBudget)}</span>
              </div>
              <input
                type="range"
                min="5000"
                max="30000"
                step="1000"
                value={maxBudget}
                onChange={(e) => setMaxBudget(Number(e.target.value))}
                className="w-full accent-[#FF5A1F] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>₹5,000</span>
                <span>₹30,000</span>
              </div>
            </div>

            {/* Verified Organizer Toggle */}
            <div className="pt-2 border-t border-slate-100">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={verifiedOnly}
                  onChange={(e) => setVerifiedOnly(e.target.checked)}
                  className="w-4 h-4 rounded text-[#FF5A1F] focus:ring-[#FF5A1F] accent-[#FF5A1F]"
                />
                <span className="text-xs font-semibold text-[#071A2B] flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  Verified Organizers Only
                </span>
              </label>
            </div>
          </aside>

          {/* Center Trip Cards Area (+ Optional Map Panel) */}
          <main
            className={`${
              showMapPanel ? 'lg:col-span-5' : 'lg:col-span-9'
            } space-y-6 transition-all duration-300`}
          >
            {/* Results Count & Badges */}
            <div className="flex items-center justify-between text-xs text-slate-500 pb-2">
              <p>
                Showing <span className="font-extrabold text-[#071A2B]">{filteredTrips.length}</span> trips matching your preferences
              </p>
              {(selectedDifficulty !== 'All' || selectedVibe !== 'All' || searchDestination) && (
                <button
                  onClick={clearFilters}
                  className="text-[#FF5A1F] hover:underline cursor-pointer font-semibold"
                >
                  Clear filters
                </button>
              )}
            </div>

            {/* Grid of Trip Cards */}
            {filteredTrips.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl text-center space-y-4 border border-slate-200">
                <div className="w-16 h-16 rounded-full bg-orange-50 text-[#FF5A1F] flex items-center justify-center mx-auto">
                  <Compass className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#071A2B]">No trips match your exact filters</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Try adjusting your budget or selecting 'All' for difficulty and vibes to discover more adventures.
                  </p>
                </div>
                <button
                  onClick={clearFilters}
                  className="btn-primary-cb !py-2.5 !px-6 !text-xs cursor-pointer"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div
                className={`grid grid-cols-1 ${
                  showMapPanel ? 'sm:grid-cols-1' : 'sm:grid-cols-2 lg:grid-cols-3'
                } gap-6`}
              >
                {filteredTrips.map((trip) => (
                  <TripCard key={trip.id} trip={trip} />
                ))}
              </div>
            )}
          </main>

          {/* Optional Interactive Map Panel */}
          {showMapPanel && (
            <aside className="hidden lg:block lg:col-span-4 bg-[#0C2438] p-4 rounded-3xl border border-white/15 sticky top-28 text-white space-y-4 shadow-xl">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <span className="font-bold text-xs text-white flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#FF5A1F]" />
                  Geographical Route Map
                </span>
                <button
                  onClick={() => setShowMapPanel(false)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Simulated Map View with Destination Pins */}
              <div className="relative h-96 rounded-2xl overflow-hidden bg-slate-950 border border-white/10 flex items-center justify-center">
                <img
                  src="https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=800&q=80"
                  alt="Himalayan Map Visualizer"
                  className="w-full h-full object-cover opacity-40"
                />
                <div className="absolute inset-0 bg-radial-gradient from-transparent to-[#071A2B]/80" />

                {/* Simulated Pins */}
                {filteredTrips.slice(0, 4).map((t, idx) => (
                  <div
                    key={t.id}
                    onClick={() => navigate('trip-detail', { id: t.id })}
                    style={{
                      top: `${25 + idx * 18}%`,
                      left: `${20 + idx * 18}%`,
                    }}
                    className="absolute p-1.5 rounded-full bg-[#FF5A1F] text-white shadow-xl cursor-pointer hover:scale-125 transition-transform flex items-center gap-1.5"
                    title={t.title}
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-bold bg-[#071A2B] px-1.5 py-0.5 rounded shadow">
                      {formatPrice(t.price)}
                    </span>
                  </div>
                ))}
              </div>

              <p className="text-[11px] text-slate-400 text-center">
                Click any pin to inspect the trip and day-by-day route details.
              </p>
            </aside>
          )}
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex justify-end">
          <div className="bg-white w-full max-w-sm h-full p-6 space-y-6 overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="font-bold text-base text-[#071A2B]">Filter Trips</span>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="p-1 rounded-full text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Difficulty */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#071A2B] uppercase">Difficulty</label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {['All', 'Easy', 'Moderate', 'Challenging'].map((d) => (
                  <button
                    key={d}
                    onClick={() => setSelectedDifficulty(d)}
                    className={`py-2 px-3 rounded-xl font-bold ${
                      selectedDifficulty === d ? 'bg-[#FF5A1F] text-white' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile Vibe */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#071A2B] uppercase">Vibe</label>
              <div className="flex flex-wrap gap-2 text-xs">
                {['All', 'Mountains', 'Trekking', 'Beaches', 'Cultural', 'Weekend'].map((v) => (
                  <button
                    key={v}
                    onClick={() => setSelectedVibe(v)}
                    className={`px-3 py-1.5 rounded-full font-bold ${
                      selectedVibe === v ? 'bg-[#071A2B] text-white' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile Budget */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span>Max Budget</span>
                <span className="text-[#FF5A1F]">{formatPrice(maxBudget)}</span>
              </div>
              <input
                type="range"
                min="5000"
                max="30000"
                step="1000"
                value={maxBudget}
                onChange={(e) => setMaxBudget(Number(e.target.value))}
                className="w-full accent-[#FF5A1F]"
              />
            </div>

            <button
              onClick={() => setMobileFilterOpen(false)}
              className="w-full btn-primary-cb !py-3 !text-xs font-bold"
            >
              Apply Filters ({filteredTrips.length})
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
