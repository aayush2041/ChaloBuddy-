import React, { useState, useEffect, useRef } from 'react';
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
} from 'lucide-react';

export default function TripsPage() {
  const { trips, currentRoute, navigate, selectedLocation } = useStore();

  // Search Flow Inputs: From, Destination, Date, Travelers
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

  // Search Execution & State
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchError, setSearchError] = useState('');

  // Passengers dropdown state (optional fine-grain popover)
  const [passengerDropdownOpen, setPassengerDropdownOpen] = useState(false);
  const datePickerRef = useRef(null);

  // Synchronize when route params change (e.g. from homepage search or direct link)
  useEffect(() => {
    const params = currentRoute?.params;
    if (!params) return;

    if (params.from !== undefined) setFromLocation(params.from);
    if (params.destination !== undefined) setDestination(params.destination);
    if (params.date !== undefined || params.start !== undefined) {
      setTravelDate(params.date || params.start);
    }
    if (params.travelers !== undefined) {
      setPassengers(Math.max(1, Math.min(12, Number(params.travelers) || 1)));
    }
  }, [currentRoute?.params]);

  // Initial and reactive query execution
  const runSearch = async (overrideCriteria = null) => {
    setIsSearching(true);
    setSearchError('');

    const criteria = overrideCriteria || {
      from: fromLocation,
      destination,
      date: travelDate,
      travelers: passengers,
    };

    try {
      // Simulate quick natural network turnaround for visual feedback
      await new Promise((resolve) => setTimeout(resolve, 250));

      const { results } = await executeTripSearch(trips, criteria);
      setSearchResults(results);
      setHasSearched(true);
    } catch (err) {
      console.error('Find a Trip search error:', err);
      // Friendly user-facing message, never expose raw codes or undefined
      setSearchError('We could not load trips at this time. Please check your connection and try again.');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Run initial search when component mounts or when trips change
  useEffect(() => {
    runSearch();
  }, [trips]);

  const handleSearchSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    runSearch();
  };

  const handleResetSearch = () => {
    setFromLocation('');
    setDestination('');
    setTravelDate('');
    setPassengers(1);
    runSearch({ from: '', destination: '', date: '', travelers: 1 });
  };

  // Safe passenger updates
  const decrementPassengers = (e) => {
    if (e) e.stopPropagation();
    setPassengers((prev) => Math.max(1, prev - 1));
  };

  const incrementPassengers = (e) => {
    if (e) e.stopPropagation();
    setPassengers((prev) => Math.min(12, prev + 1));
  };

  return (
    <div className="min-h-screen bg-[#F5F7F8] pt-24 pb-24 text-[#071A2B]">
      {/* 1. HERO & UNIFIED SEARCH HEADER */}
      <section className="bg-[#071A2B] text-white pt-10 pb-16 px-3 sm:px-6 lg:px-8 border-b border-white/10 relative overflow-hidden">
        {/* Subtle ambient light background */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#FF5A1F]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto space-y-6 relative z-10">
          {/* Header Title */}
          <div className="space-y-2 text-center sm:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-semibold text-slate-200">
              <span className="w-2 h-2 rounded-full bg-[#FF5A1F]" />
              <span>Find a Trip</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
              Where do you want to travel?
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Enter your starting point, destination, date, and passenger count to find matching trips led by verified hosts.
            </p>
          </div>

          {/* 4-Input Simplified Search Form */}
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

                {/* 3. Travel Date (Entire area clickable) */}
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

                {/* 4. Passenger Selector (Minus / Number / Plus) */}
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
                    className="w-full h-full btn-primary-cb !rounded-2xl !py-0 !px-4 text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#FF5A1F]/30 hover:scale-102 active:scale-98 transition-transform disabled:opacity-75"
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
        </div>
      </section>

      {/* 2. RESULTS CONTAINER */}
      <main className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 pt-8">
        {/* Results Bar: Count & Quick Reset */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-200">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[#071A2B] tracking-tight">
              {isSearching ? 'Searching trips...' : 'Available Trips'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              {isSearching ? (
                'Checking routes and host schedules...'
              ) : (
                <>
                  Showing <span className="font-extrabold text-[#071A2B]">{searchResults.length}</span>{' '}
                  {searchResults.length === 1 ? 'trip' : 'trips'}
                  {destination && <span> to &ldquo;{destination}&rdquo;</span>}
                  {fromLocation && <span> from &ldquo;{fromLocation}&rdquo;</span>}
                </>
              )}
            </p>
          </div>

          {(fromLocation || destination || travelDate || passengers > 1) && (
            <button
              onClick={handleResetSearch}
              className="text-xs font-bold text-[#FF5A1F] hover:text-[#e04f1a] flex items-center gap-1 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset search</span>
            </button>
          )}
        </div>

        {/* Error State: Friendly user-facing message */}
        {searchError && (
          <div className="mt-8 p-6 bg-rose-50 border border-rose-200 rounded-3xl text-rose-800 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-2">
              <p className="font-bold text-sm">Something went wrong</p>
              <p className="text-xs text-rose-700">{searchError}</p>
              <button
                onClick={() => runSearch()}
                className="mt-2 px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs cursor-pointer"
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
                className="bg-white rounded-2xl border border-slate-200 p-4 space-y-4 animate-pulse"
              >
                <div className="h-48 bg-slate-200 rounded-xl" />
                <div className="h-4 bg-slate-200 rounded w-3/4" />
                <div className="h-3 bg-slate-100 rounded w-1/2" />
                <div className="h-8 bg-slate-200 rounded-xl mt-4" />
              </div>
            ))}
          </div>
        )}

        {/* Empty State: Clear advice to change date, destination, or starting location */}
        {!isSearching && !searchError && searchResults.length === 0 && (
          <div data-testid="trips-empty-state" className="mt-10 bg-white rounded-3xl p-8 sm:p-12 text-center border border-slate-200 shadow-sm max-w-2xl mx-auto space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-orange-50 text-[#FF5A1F] flex items-center justify-center mx-auto shadow-inner">
              <Compass className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl sm:text-2xl font-black text-[#071A2B]">
                No trips found matching your search
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                We couldn&apos;t find any trips
                {fromLocation ? ` from "${fromLocation}"` : ''}
                {destination ? ` to "${destination}"` : ''}
                {travelDate ? ` on ${travelDate}` : ''} for {passengers} passenger{passengers > 1 ? 's' : ''}.
              </p>
            </div>

            {/* Helpful Suggestions */}
            <div className="bg-[#F5F7F8] p-5 rounded-2xl text-left border border-slate-200/80 space-y-2.5 text-xs text-slate-600">
              <p className="font-bold text-[#071A2B] uppercase tracking-wider text-[11px]">
                Suggested adjustments:
              </p>
              <div className="flex items-start gap-2">
                <span className="text-[#FF5A1F] font-bold">•</span>
                <span><strong>Change travel date:</strong> Trips depart on scheduled dates. Try selecting a different date or clear the date to see all departures.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-[#FF5A1F] font-bold">•</span>
                <span><strong>Adjust starting location:</strong> Many group expeditions depart from transit hubs like Delhi or Dehradun.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-[#FF5A1F] font-bold">•</span>
                <span><strong>Explore nearby destinations:</strong> Try searching for broader regions such as Himachal Pradesh or Uttarakhand.</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleResetSearch}
                className="w-full sm:w-auto btn-primary-cb !py-3 !px-6 !text-xs font-bold cursor-pointer"
              >
                View All Available Trips
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
                className="w-full sm:w-auto px-6 py-3 rounded-full border border-slate-300 hover:bg-slate-100 text-[#071A2B] font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4 text-[#FF5A1F]" />
                <span>Host This Trip Instead</span>
              </button>
            </div>
          </div>
        )}

        {/* Real Trips Grid */}
        {!isSearching && !searchError && searchResults.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 pt-8">
            {searchResults.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
