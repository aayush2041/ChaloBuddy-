import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useStore } from '../context/StoreContext';
import TripCard from '../components/TripCard';
import LocationAutocomplete from '../components/LocationAutocomplete';
import DatePicker from '../components/DatePicker';
import { executeTripSearch } from '../services/tripSearchService';
import {
  Search,
  MapPin,
  Calendar,
  Users,
  Compass,
  Loader2,
  AlertCircle,
  PlusCircle,
  RotateCcw,
  SlidersHorizontal,
  X,
  ChevronDown,
  Sparkles,
  Tag,
  IndianRupee,
  Check,
} from 'lucide-react';

const CATEGORIES = [
  { id: 'all', label: 'All Trips' },
  { id: 'mountains', label: 'Mountains & Hills' },
  { id: 'trekking', label: 'Trekking & Trails' },
  { id: 'beaches', label: 'Beaches & Coastal' },
  { id: 'cultural', label: 'Cultural & Heritage' },
  { id: 'weekend', label: 'Weekend Escapes' },
  { id: 'road-trips', label: 'Road Trips & Adventure' },
];

const BUDGET_TIERS = [
  { id: 'any', label: 'Any Budget', max: null },
  { id: 'under-6000', label: 'Under ₹6,000', max: 6000 },
  { id: 'under-10000', label: 'Under ₹10,000', max: 10000 },
  { id: 'under-15000', label: 'Under ₹15,000', max: 15000 },
];

const SORT_OPTIONS = [
  { id: 'recommended', label: 'Recommended' },
  { id: 'price-low', label: 'Price: Low to High' },
  { id: 'price-high', label: 'Price: High to Low' },
  { id: 'seats', label: 'Most Seats Available' },
];

export default function TripsPage() {
  const { trips, currentRoute, navigate, selectedLocation } = useStore();

  // Route & Search Inputs
  const [fromLocation, setFromLocation] = useState(
    currentRoute?.params?.from || currentRoute?.params?.origin || ''
  );
  const [destination, setDestination] = useState(
    currentRoute?.params?.destination || (selectedLocation ? selectedLocation.city : '')
  );
  const [travelDate, setTravelDate] = useState(
    currentRoute?.params?.date || currentRoute?.params?.start || ''
  );
  const [passengers, setPassengers] = useState(
    Number(currentRoute?.params?.travelers) || 1
  );

  // New Filters: Category, Budget, Sort
  const [selectedCategory, setSelectedCategory] = useState(
    currentRoute?.params?.category || 'all'
  );
  const [maxPrice, setMaxPrice] = useState(
    currentRoute?.params?.maxPrice ? Number(currentRoute?.params?.maxPrice) : null
  );
  const [sortBy, setSortBy] = useState(
    currentRoute?.params?.sortBy || 'recommended'
  );

  // Search Execution & State
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchError, setSearchError] = useState('');

  // Dropdown UI states
  const [budgetDropdownOpen, setBudgetDropdownOpen] = useState(false);
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const datePickerRef = useRef(null);
  const budgetRef = useRef(null);
  const sortRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (budgetRef.current && !budgetRef.current.contains(e.target)) {
        setBudgetDropdownOpen(false);
      }
      if (sortRef.current && !sortRef.current.contains(e.target)) {
        setSortDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Synchronize when route params change (e.g. from homepage search, deep link, or browser Back/Forward)
  useEffect(() => {
    const params = currentRoute?.params || {};

    const targetFrom = params.from || params.origin || '';
    const targetDest = params.destination || '';
    const targetDate = params.date || params.start || '';
    const targetTravelers = Math.max(1, Math.min(12, Number(params.travelers) || 1));
    const targetCategory = params.category || 'all';
    const targetMaxPrice = params.maxPrice ? Number(params.maxPrice) : null;
    const targetSortBy = params.sortBy || 'recommended';

    setFromLocation((prev) => (prev !== targetFrom ? targetFrom : prev));
    setDestination((prev) => (prev !== targetDest ? targetDest : prev));
    setTravelDate((prev) => (prev !== targetDate ? targetDate : prev));
    setPassengers((prev) => (prev !== targetTravelers ? targetTravelers : prev));
    setSelectedCategory((prev) => (prev !== targetCategory ? targetCategory : prev));
    setMaxPrice((prev) => (prev !== targetMaxPrice ? targetMaxPrice : prev));
    setSortBy((prev) => (prev !== targetSortBy ? targetSortBy : prev));
  }, [
    currentRoute?.params?.from,
    currentRoute?.params?.origin,
    currentRoute?.params?.destination,
    currentRoute?.params?.date,
    currentRoute?.params?.start,
    currentRoute?.params?.travelers,
    currentRoute?.params?.category,
    currentRoute?.params?.maxPrice,
    currentRoute?.params?.sortBy,
  ]);

  // Synchronize URL with active filters
  const syncRouteWithFilters = useCallback(
    (overrides = {}) => {
      const merged = {
        from: fromLocation,
        destination,
        date: travelDate,
        travelers: passengers,
        category: selectedCategory,
        maxPrice,
        sortBy,
        ...overrides,
      };

      const cleanParams = {};
      if (merged.from && merged.from.trim()) cleanParams.from = merged.from.trim();
      if (merged.destination && merged.destination.trim()) cleanParams.destination = merged.destination.trim();
      if (merged.date && merged.date.trim()) cleanParams.date = merged.date.trim();
      if (merged.travelers && Number(merged.travelers) > 1) cleanParams.travelers = merged.travelers;
      if (merged.category && merged.category !== 'all') cleanParams.category = merged.category;
      if (merged.maxPrice && Number(merged.maxPrice) > 0) cleanParams.maxPrice = merged.maxPrice;
      if (merged.sortBy && merged.sortBy !== 'recommended') cleanParams.sortBy = merged.sortBy;

      navigate('trips', cleanParams);
    },
    [fromLocation, destination, travelDate, passengers, selectedCategory, maxPrice, sortBy, navigate]
  );

  // Search execution helper
  const runSearch = useCallback(
    async (overrideCriteria = null) => {
      setIsSearching(true);
      setSearchError('');

      const criteria = {
        from: fromLocation,
        destination,
        date: travelDate,
        travelers: passengers,
        category: selectedCategory,
        maxPrice,
        sortBy,
        ...(overrideCriteria || {}),
      };

      try {
        await new Promise((resolve) => setTimeout(resolve, 150));
        const { results } = await executeTripSearch(trips, criteria);
        setSearchResults(results);
        setHasSearched(true);
      } catch (err) {
        console.error('Find a Trip search error:', err);
        setSearchError('We could not load trips at this time. Please check your connection and try again.');
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    },
    [trips, fromLocation, destination, travelDate, passengers, selectedCategory, maxPrice, sortBy]
  );

  // Run search when inputs, filters, or trips change
  useEffect(() => {
    runSearch();
  }, [runSearch]);

  const handleSearchSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    syncRouteWithFilters();
    runSearch();
  };

  const handleCategorySelect = (catId) => {
    setSelectedCategory(catId);
    syncRouteWithFilters({ category: catId });
    runSearch({ category: catId });
  };

  const handleBudgetSelect = (maxVal) => {
    setMaxPrice(maxVal);
    setBudgetDropdownOpen(false);
    syncRouteWithFilters({ maxPrice: maxVal });
    runSearch({ maxPrice: maxVal });
  };

  const handleSortSelect = (sortId) => {
    setSortBy(sortId);
    setSortDropdownOpen(false);
    syncRouteWithFilters({ sortBy: sortId });
    runSearch({ sortBy: sortId });
  };

  const handleResetSearch = () => {
    setFromLocation('');
    setDestination('');
    setTravelDate('');
    setPassengers(1);
    setSelectedCategory('all');
    setMaxPrice(null);
    setSortBy('recommended');

    navigate('trips', {});
    runSearch({
      from: '',
      destination: '',
      date: '',
      travelers: 1,
      category: 'all',
      maxPrice: null,
      sortBy: 'recommended',
    });
  };

  const decrementPassengers = (e) => {
    if (e) e.stopPropagation();
    const nextVal = Math.max(1, passengers - 1);
    setPassengers(nextVal);
    syncRouteWithFilters({ travelers: nextVal });
  };

  const incrementPassengers = (e) => {
    if (e) e.stopPropagation();
    const nextVal = Math.min(12, passengers + 1);
    setPassengers(nextVal);
    syncRouteWithFilters({ travelers: nextVal });
  };

  const hasActiveFilters = Boolean(
    (fromLocation && fromLocation.trim()) ||
      (destination && destination.trim()) ||
      (travelDate && travelDate.trim()) ||
      passengers > 1 ||
      (selectedCategory && selectedCategory !== 'all') ||
      maxPrice !== null ||
      (sortBy && sortBy !== 'recommended')
  );

  const activeCategoryObj = CATEGORIES.find((c) => c.id === selectedCategory) || CATEGORIES[0];
  const activeBudgetObj = BUDGET_TIERS.find((b) => b.max === maxPrice) || BUDGET_TIERS[0];
  const activeSortObj = SORT_OPTIONS.find((s) => s.id === sortBy) || SORT_OPTIONS[0];

  return (
    <div className="min-h-screen bg-[#F5F7F8] pt-24 pb-24 text-[#071A2B]">
      {/* 1. HERO & UNIFIED SEARCH HEADER */}
      <section className="bg-[#071A2B] text-white pt-10 pb-14 px-3 sm:px-6 lg:px-8 border-b border-white/10 relative overflow-hidden">
        {/* Subtle ambient light background */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#FF5A1F]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto space-y-6 relative z-10">
          {/* Header Title */}
          <div className="space-y-2 text-center sm:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-semibold text-slate-200">
              <span className="w-2 h-2 rounded-full bg-[#FF5A1F]" />
              <span>Explore Trips & Travel Groups</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
              Where do you want to travel?
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Discover curated journeys led by verified hosts. Filter by destination, travel dates, budget, or travel style to find your ideal group.
            </p>
          </div>

          {/* 4-Input Unified Search Form */}
          <div className="bg-[#0C2438] p-3 sm:p-4 rounded-3xl border border-white/15 shadow-2xl backdrop-blur-xl">
            <form onSubmit={handleSearchSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-2.5 items-stretch">
                {/* 1. From / Starting Location */}
                <div className="lg:col-span-3 min-h-[68px] bg-[#071A2B] hover:bg-[#071A2B]/90 px-3.5 py-2 rounded-2xl border border-white/10 hover:border-white/20 transition-all flex flex-col justify-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider mb-0.5">
                    From / Starting Location
                  </span>
                  <LocationAutocomplete
                    value={fromLocation}
                    inputTestId="from-location-input"
                    onChange={(text) => setFromLocation(text)}
                    onSelectLocation={(loc) => setFromLocation(loc.city || loc.fullName)}
                    placeholder="e.g. Delhi, Dehradun, Mumbai..."
                    theme="dark"
                  />
                </div>

                {/* 2. Destination */}
                <div className="lg:col-span-3 min-h-[68px] bg-[#071A2B] hover:bg-[#071A2B]/90 px-3.5 py-2 rounded-2xl border border-white/10 hover:border-white/20 transition-all flex flex-col justify-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider mb-0.5">
                    To / Destination
                  </span>
                  <LocationAutocomplete
                    value={destination}
                    inputTestId="destination-input"
                    onChange={(text) => setDestination(text)}
                    onSelectLocation={(loc) => setDestination(loc.city || loc.fullName)}
                    placeholder="e.g. Manali, Spiti, Goa..."
                    theme="dark"
                  />
                </div>

                {/* 3. Travel Date */}
                <div
                  className="lg:col-span-3 min-h-[68px] bg-[#071A2B] hover:bg-[#071A2B]/90 px-3.5 py-2 rounded-2xl border border-white/10 hover:border-white/20 transition-all cursor-pointer flex items-center gap-2.5"
                  onClick={() => {
                    datePickerRef.current?.open();
                  }}
                >
                  <div className="w-8 h-8 rounded-xl bg-white/5 text-[#FF5A1F] flex items-center justify-center shrink-0">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0" onClick={(e) => e.stopPropagation()}>
                    <DatePicker
                      ref={datePickerRef}
                      mode="single"
                      theme="dark"
                      label="Travel Date"
                      placeholder="Select travel date"
                      value={travelDate}
                      onChange={(formatted) => setTravelDate(formatted)}
                      minDate={new Date()}
                      className="w-full"
                    />
                  </div>
                </div>

                {/* 4. Passenger Selector */}
                <div className="lg:col-span-2 min-h-[68px] bg-[#071A2B] hover:bg-[#071A2B]/90 px-3.5 py-2 rounded-2xl border border-white/10 hover:border-white/20 transition-all flex items-center justify-between gap-2">
                  <div className="overflow-hidden flex-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                      Passengers
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-white block truncate">
                      {passengers} {passengers === 1 ? 'Passenger' : 'Passengers'}
                    </span>
                  </div>

                  {/* Direct - Number + controls */}
                  <div className="flex items-center gap-1.5 shrink-0 bg-white/5 p-1 rounded-xl border border-white/10">
                    <button
                      type="button"
                      aria-label="Decrease passenger count"
                      disabled={passengers <= 1}
                      onClick={decrementPassengers}
                      className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed text-white font-black flex items-center justify-center transition-all cursor-pointer"
                    >
                      –
                    </button>
                    <span className="w-5 text-center text-xs font-black text-white">
                      {passengers}
                    </span>
                    <button
                      type="button"
                      aria-label="Increase passenger count"
                      disabled={passengers >= 12}
                      onClick={incrementPassengers}
                      className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed text-white font-black flex items-center justify-center transition-all cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Primary CTA: "Find Trips" Button */}
                <div className="lg:col-span-1 min-h-[68px] flex items-stretch">
                  <button
                    type="submit"
                    disabled={isSearching}
                    data-testid="find-trips-submit-btn"
                    className="w-full h-full btn-primary-cb !rounded-2xl !py-0 !px-4 text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#FF5A1F]/30 hover:scale-102 active:scale-98 transition-transform disabled:opacity-75 min-h-[44px]"
                    title="Find Trips"
                  >
                    {isSearching ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Search className="w-4 h-4 shrink-0" />
                        <span className="lg:hidden font-bold">Find Trips</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Category Filter Pills (Horizontal Scrollable on Mobile) */}
          <div className="pt-2">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none no-scrollbar">
              {CATEGORIES.map((cat) => {
                const isActive = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleCategorySelect(cat.id)}
                    className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 min-h-[38px] ${
                      isActive
                        ? 'bg-[#FF5A1F] text-white shadow-md shadow-[#FF5A1F]/30'
                        : 'bg-white/10 hover:bg-white/20 text-slate-200 border border-white/15'
                    }`}
                  >
                    {cat.id === 'all' ? (
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    ) : (
                      <Tag className="w-3.5 h-3.5 opacity-80" />
                    )}
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 2. RESULTS CONTAINER & SECONDARY FILTERS */}
      <main className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 pt-8">
        {/* Controls Toolbar: Count, Budget Filter, Sort & Reset */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[#071A2B] tracking-tight">
              {isSearching ? 'Searching trips...' : 'Available Trips'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              {isSearching ? (
                'Checking routes, host schedules, and seat availability...'
              ) : (
                <>
                  Showing <span className="font-extrabold text-[#071A2B]">{searchResults.length}</span>{' '}
                  {searchResults.length === 1 ? 'trip' : 'trips'}
                  {destination && <span> to &ldquo;{destination}&rdquo;</span>}
                  {fromLocation && <span> from &ldquo;{fromLocation}&rdquo;</span>}
                  {selectedCategory !== 'all' && (
                    <span className="text-[#FF5A1F] font-semibold"> • {activeCategoryObj.label}</span>
                  )}
                  {maxPrice && (
                    <span className="text-slate-600 font-medium"> • Under ₹{maxPrice.toLocaleString('en-IN')}</span>
                  )}
                </>
              )}
            </p>
          </div>

          {/* Secondary Filter Dropdowns & Reset */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Budget Filter Dropdown */}
            <div className="relative" ref={budgetRef}>
              <button
                type="button"
                onClick={() => setBudgetDropdownOpen(!budgetDropdownOpen)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold border flex items-center gap-2 transition-all cursor-pointer min-h-[40px] ${
                  maxPrice
                    ? 'bg-orange-50 border-[#FF5A1F] text-[#FF5A1F]'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                <IndianRupee className="w-3.5 h-3.5" />
                <span>{activeBudgetObj.label}</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-60" />
              </button>

              {budgetDropdownOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-48 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-30 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Filter by Budget
                  </div>
                  {BUDGET_TIERS.map((tier) => (
                    <button
                      key={tier.id}
                      type="button"
                      onClick={() => handleBudgetSelect(tier.max)}
                      className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition-colors ${
                        maxPrice === tier.max
                          ? 'font-bold text-[#FF5A1F] bg-orange-50/50'
                          : 'text-slate-700 font-medium'
                      }`}
                    >
                      <span>{tier.label}</span>
                      {maxPrice === tier.max && <Check className="w-3.5 h-3.5 text-[#FF5A1F]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="relative" ref={sortRef}>
              <button
                type="button"
                onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold border flex items-center gap-2 transition-all cursor-pointer min-h-[40px] ${
                  sortBy !== 'recommended'
                    ? 'bg-slate-100 border-slate-400 text-[#071A2B]'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>{activeSortObj.label}</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-60" />
              </button>

              {sortDropdownOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-52 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-30 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Sort Results
                  </div>
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleSortSelect(opt.id)}
                      className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition-colors ${
                        sortBy === opt.id
                          ? 'font-bold text-[#FF5A1F] bg-orange-50/50'
                          : 'text-slate-700 font-medium'
                      }`}
                    >
                      <span>{opt.label}</span>
                      {sortBy === opt.id && <Check className="w-3.5 h-3.5 text-[#FF5A1F]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Reset All Filters Button */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetSearch}
                aria-label="Reset all search filters"
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-[#FF5A1F] hover:bg-orange-50 border border-orange-200 flex items-center gap-1.5 cursor-pointer transition-colors min-h-[40px]"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset all</span>
              </button>
            )}
          </div>
        </div>

        {/* Active Filter Chips Bar */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 flex-wrap pt-4">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
              Active Filters:
            </span>

            {destination && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-300 text-xs text-[#071A2B] font-semibold">
                <span>To: {destination}</span>
                <button
                  type="button"
                  onClick={() => {
                    setDestination('');
                    syncRouteWithFilters({ destination: '' });
                    runSearch({ destination: '' });
                  }}
                  className="hover:text-rose-600 transition-colors"
                  aria-label="Remove destination filter"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {fromLocation && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-300 text-xs text-[#071A2B] font-semibold">
                <span>From: {fromLocation}</span>
                <button
                  type="button"
                  onClick={() => {
                    setFromLocation('');
                    syncRouteWithFilters({ from: '' });
                    runSearch({ from: '' });
                  }}
                  className="hover:text-rose-600 transition-colors"
                  aria-label="Remove starting location filter"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {travelDate && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-300 text-xs text-[#071A2B] font-semibold">
                <span>Date: {travelDate}</span>
                <button
                  type="button"
                  onClick={() => {
                    setTravelDate('');
                    syncRouteWithFilters({ date: '' });
                    runSearch({ date: '' });
                  }}
                  className="hover:text-rose-600 transition-colors"
                  aria-label="Remove date filter"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {passengers > 1 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-300 text-xs text-[#071A2B] font-semibold">
                <span>{passengers} Passengers</span>
                <button
                  type="button"
                  onClick={() => {
                    setPassengers(1);
                    syncRouteWithFilters({ travelers: 1 });
                    runSearch({ travelers: 1 });
                  }}
                  className="hover:text-rose-600 transition-colors"
                  aria-label="Reset passengers to 1"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedCategory !== 'all' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 border border-orange-300 text-xs text-[#FF5A1F] font-bold">
                <span>Category: {activeCategoryObj.label}</span>
                <button
                  type="button"
                  onClick={() => handleCategorySelect('all')}
                  className="hover:text-rose-600 transition-colors"
                  aria-label="Remove category filter"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {maxPrice && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 border border-orange-300 text-xs text-[#FF5A1F] font-bold">
                <span>Budget: {activeBudgetObj.label}</span>
                <button
                  type="button"
                  onClick={() => handleBudgetSelect(null)}
                  className="hover:text-rose-600 transition-colors"
                  aria-label="Remove budget filter"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        )}

        {/* Error State: Friendly user-facing message */}
        {searchError && (
          <div className="mt-8 p-6 bg-rose-50 border border-rose-200 rounded-3xl text-rose-800 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-2">
              <p className="font-bold text-sm">Something went wrong</p>
              <p className="text-xs text-rose-700">{searchError}</p>
              <button
                type="button"
                onClick={() => runSearch()}
                className="mt-2 px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs cursor-pointer min-h-[36px]"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Loading State Skeleton */}
        {isSearching && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-8">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-[#0C2438] rounded-2xl border border-white/10 p-4 space-y-4 animate-pulse"
              >
                <div className="h-48 bg-slate-800 rounded-xl" />
                <div className="h-4 bg-slate-800 rounded w-3/4" />
                <div className="h-3 bg-slate-800/60 rounded w-1/2" />
                <div className="h-10 bg-slate-800 rounded-xl mt-4" />
              </div>
            ))}
          </div>
        )}

        {/* Empty State: Clear advice to change filters */}
        {!isSearching && !searchError && searchResults.length === 0 && (
          <div
            data-testid="trips-empty-state"
            className="mt-10 bg-white rounded-3xl p-8 sm:p-12 text-center border border-slate-200 shadow-sm max-w-2xl mx-auto space-y-6"
          >
            <div className="w-16 h-16 rounded-2xl bg-orange-50 text-[#FF5A1F] flex items-center justify-center mx-auto shadow-inner">
              <Compass className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl sm:text-2xl font-black text-[#071A2B]">
                No trips found matching your filters
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                We couldn&apos;t find any trips
                {fromLocation ? ` from "${fromLocation}"` : ''}
                {destination ? ` to "${destination}"` : ''}
                {travelDate ? ` on ${travelDate}` : ''}
                {selectedCategory !== 'all' ? ` in ${activeCategoryObj.label}` : ''}
                {maxPrice ? ` within ₹${maxPrice.toLocaleString('en-IN')}` : ''} for {passengers} passenger
                {passengers > 1 ? 's' : ''}.
              </p>
            </div>

            {/* Helpful Suggestions */}
            <div className="bg-[#F5F7F8] p-5 rounded-2xl text-left border border-slate-200/80 space-y-2.5 text-xs text-slate-600">
              <p className="font-bold text-[#071A2B] uppercase tracking-wider text-[11px]">
                Suggested adjustments:
              </p>
              <div className="flex items-start gap-2">
                <span className="text-[#FF5A1F] font-bold">•</span>
                <span>
                  <strong>Broaden your budget:</strong> Try clearing or increasing your budget tier to view more premium expeditions.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-[#FF5A1F] font-bold">•</span>
                <span>
                  <strong>Switch categories:</strong> Select &ldquo;All Trips&rdquo; to browse adventures across all styles.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-[#FF5A1F] font-bold">•</span>
                <span>
                  <strong>Change travel dates or starting point:</strong> Group trips depart on scheduled dates, frequently from transit hubs like Delhi or Dehradun.
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleResetSearch}
                className="w-full sm:w-auto btn-primary-cb !py-3 !px-6 !text-xs font-bold cursor-pointer min-h-[44px]"
              >
                Reset All Filters
              </button>
              <button
                type="button"
                onClick={() =>
                  navigate('list-trip', {
                    prefill: {
                      destination: destination || '',
                      travelers: passengers,
                    },
                  })
                }
                className="w-full sm:w-auto px-6 py-3 rounded-full border border-slate-300 hover:bg-slate-100 text-[#071A2B] font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px]"
              >
                <PlusCircle className="w-4 h-4 text-[#FF5A1F]" />
                <span>Host This Trip Instead</span>
              </button>
            </div>
          </div>
        )}

        {/* Real Trips Grid */}
        {!isSearching && !searchError && searchResults.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 pt-6">
            {searchResults.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
