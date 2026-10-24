import React, { useState, useRef } from 'react';
import { useStore } from '../context/StoreContext';
import LocationAutocomplete from '../components/LocationAutocomplete';
import { resolveLocation } from '../services/locationService';
import {
  ArrowRightLeft,
  Calendar,
  Users,
  Search,
  Train,
  Bus,
  Plane,
  Car,
  Anchor,
  Compass,
  Sparkles,
  MapPin,
  Clock,
  ShieldCheck,
  ChevronRight,
  AlertCircle,
  Loader2,
  X,
  Plus,
  Minus,
} from 'lucide-react';

const POPULAR_SEARCHES = [
  { origin: 'Delhi, India', destination: 'Manali, Himachal Pradesh', title: 'Delhi ➔ Manali', tag: 'Mountains' },
  { origin: 'Mumbai, Maharashtra', destination: 'Goa, India', title: 'Mumbai ➔ Goa', tag: 'Coastal' },
  { origin: 'Delhi, India', destination: 'Agra, Uttar Pradesh', title: 'Delhi ➔ Agra', tag: 'Heritage' },
  { origin: 'Bengaluru, Karnataka', destination: 'Ooty, Tamil Nadu', title: 'Bengaluru ➔ Ooty', tag: 'Hill Station' },
  { origin: 'Mumbai, Maharashtra', destination: 'Alibaug, Maharashtra', title: 'Mumbai ➔ Alibaug', tag: 'Ferry Crossing' },
  { origin: 'Kolkata, West Bengal', destination: 'Darjeeling, West Bengal', title: 'Kolkata ➔ Darjeeling', tag: 'Tea Gardens' },
  { origin: 'Delhi, India', destination: 'Jaipur, Rajasthan', title: 'Delhi ➔ Jaipur', tag: 'Expressway' },
  { origin: 'Delhi, India', destination: 'Rishikesh, Uttarakhand', title: 'Delhi ➔ Rishikesh', tag: 'Spiritual / Yoga' },
];

export default function PlanTripPage() {
  const {
    journeySearchParams,
    searchJourney,
    selectedLocation,
  } = useStore();

  const defaultOrigin = journeySearchParams?.origin || 'New Delhi, India';
  const defaultDest = selectedLocation?.fullName || journeySearchParams?.destination || 'Manali, Himachal Pradesh';

  const [origin, setOrigin] = useState(defaultOrigin);
  const [destination, setDestination] = useState(defaultDest);
  const [originObj, setOriginObj] = useState(null);
  const [destinationObj, setDestinationObj] = useState(null);

  const [departureDate, setDepartureDate] = useState(
    journeySearchParams?.departureDate || new Date().toISOString().split('T')[0]
  );
  const [returnDate, setReturnDate] = useState(journeySearchParams?.returnDate || '');
  const [showReturnDate, setShowReturnDate] = useState(Boolean(journeySearchParams?.returnDate));
  const [travelers, setTravelers] = useState(journeySearchParams?.travelers || 2);
  const [showTravelersDropdown, setShowTravelersDropdown] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [validationError, setValidationError] = useState('');

  const departureDateInputRef = useRef(null);
  const returnDateInputRef = useRef(null);
  const travelersRef = useRef(null);

  // Close travelers dropdown on click outside
  React.useEffect(() => {
    const handleClickOutside = (e) => {
      if (travelersRef.current && !travelersRef.current.contains(e.target)) {
        setShowTravelersDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Swap Origin and Destination
  const handleSwapLocations = () => {
    const tempOrigin = origin;
    const tempOriginObj = originObj;
    setOrigin(destination);
    setOriginObj(destinationObj);
    setDestination(tempOrigin);
    setDestinationObj(tempOriginObj);
    setValidationError('');
  };

  // Quick Preset Search
  const handleQuickSearch = (preset) => {
    setOrigin(preset.origin);
    setDestination(preset.destination);
    setValidationError('');
    executeSearch({
      origin: preset.origin,
      destination: preset.destination,
      departureDate,
      returnDate: showReturnDate ? returnDate : '',
      travelers,
    });
  };

  const executeSearch = async (overrideParams = null) => {
    setValidationError('');
    const targetOrigin = overrideParams?.origin || origin;
    const targetDest = overrideParams?.destination || destination;

    if (!targetOrigin || !targetOrigin.trim()) {
      setValidationError('Please select or enter a starting location.');
      return;
    }
    if (!targetDest || !targetDest.trim()) {
      setValidationError('Please select or enter your destination.');
      return;
    }

    const cleanOrigin = targetOrigin.split(',')[0].trim().toLowerCase();
    const cleanDest = targetDest.split(',')[0].trim().toLowerCase();
    if (cleanOrigin === cleanDest) {
      setValidationError('Starting location and destination cannot be identical.');
      return;
    }

    setIsLoading(true);
    try {
      await searchJourney({
        origin: targetOrigin,
        destination: targetDest,
        originObj,
        destinationObj,
        departureDate,
        returnDate: showReturnDate ? returnDate : '',
        travelers,
      });
    } catch {
      // toast shown in store
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    executeSearch();
  };

  return (
    <div className="min-h-screen bg-[#F5F7F8] pt-20 pb-24 text-[#071A2B]">
      {/* Hero Header Banner */}
      <section className="bg-[#071A2B] text-white py-14 px-4 sm:px-6 lg:px-8 border-b border-white/10 relative overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#FF5A1F]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -right-24 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto space-y-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 px-3.5 py-1 rounded-full text-xs font-bold text-white border border-white/15 backdrop-blur-md">
            <Compass className="w-3.5 h-3.5 text-[#FF5A1F]" />
            <span>Rome2Rio-Style Multimodal Journey Search</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Discover How to Get Anywhere
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Compare genuine travel routes across <span className="text-white font-bold">Trains</span>, <span className="text-white font-bold">Buses</span>, <span className="text-white font-bold">Flights</span>, <span className="text-white font-bold">Ferries</span>, and <span className="text-white font-bold">Driving</span> with verified schedules, accurate fares, and direct booking links.
          </p>

          {/* MAIN ROME2RIO SEARCH BOX */}
          <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-2xl border border-slate-200 text-left mt-4 max-w-4xl mx-auto">
            <form onSubmit={handleFormSubmit} className="space-y-4">
              {/* Origin, Swap Button & Destination Row */}
              <div className="grid grid-cols-1 lg:grid-cols-11 gap-3 items-center">
                {/* Origin Location (From) */}
                <div className="lg:col-span-5">
                  <LocationAutocomplete
                    label="From (Origin)"
                    placeholder="Enter city, airport, railway station..."
                    value={origin}
                    onChange={(val, obj) => {
                      setOrigin(val);
                      if (obj) setOriginObj(obj);
                      setValidationError('');
                    }}
                    onSelectLocation={(loc) => {
                      setOrigin(loc.fullName);
                      setOriginObj(loc);
                      setValidationError('');
                    }}
                    theme="light"
                    required
                  />
                </div>

                {/* Swap Button */}
                <div className="lg:col-span-1 flex justify-center pt-4 lg:pt-5">
                  <button
                    type="button"
                    onClick={handleSwapLocations}
                    title="Swap starting location and destination"
                    className="w-10 h-10 rounded-full bg-slate-100 hover:bg-[#FF5A1F] hover:text-white text-slate-600 border border-slate-200 flex items-center justify-center transition-all duration-300 transform active:rotate-180 cursor-pointer shadow-sm"
                  >
                    <ArrowRightLeft className="w-4 h-4" />
                  </button>
                </div>

                {/* Destination Location (To) */}
                <div className="lg:col-span-5">
                  <LocationAutocomplete
                    label="To (Destination)"
                    placeholder="Enter city, hill station, landmark..."
                    value={destination}
                    onChange={(val, obj) => {
                      setDestination(val);
                      if (obj) setDestinationObj(obj);
                      setValidationError('');
                    }}
                    onSelectLocation={(loc) => {
                      setDestination(loc.fullName);
                      setDestinationObj(loc);
                      setValidationError('');
                    }}
                    theme="light"
                    required
                  />
                </div>
              </div>

              {/* Dates & Travelers Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-11 gap-3 items-center pt-1 border-t border-slate-100">
                {/* Departure Date (Click anywhere in field to open picker) */}
                <div
                  onClick={() => departureDateInputRef.current?.showPicker?.()}
                  className="lg:col-span-4 p-2.5 rounded-2xl border border-slate-300 hover:border-[#FF5A1F] bg-slate-50/80 transition-all cursor-pointer relative"
                >
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-0.5 pointer-events-none">
                    Departure Date
                  </label>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#FF5A1F] shrink-0" />
                    <input
                      ref={departureDateInputRef}
                      type="date"
                      value={departureDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setDepartureDate(e.target.value)}
                      className="w-full bg-transparent text-xs sm:text-sm font-bold text-[#071A2B] focus:outline-none cursor-pointer"
                    />
                  </div>
                </div>

                {/* Return Date (Optional) */}
                <div className="lg:col-span-4 p-2.5 rounded-2xl border border-slate-300 hover:border-[#FF5A1F] bg-slate-50/80 transition-all relative">
                  <div className="flex items-center justify-between mb-0.5">
                    <label
                      onClick={() => {
                        if (showReturnDate) returnDateInputRef.current?.showPicker?.();
                      }}
                      className="text-[11px] font-bold uppercase tracking-wider text-slate-500 cursor-pointer"
                    >
                      Return Date
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        if (showReturnDate) {
                          setShowReturnDate(false);
                          setReturnDate('');
                        } else {
                          setShowReturnDate(true);
                          setReturnDate(departureDate);
                        }
                      }}
                      className="text-[10px] font-bold text-[#FF5A1F] hover:underline cursor-pointer"
                    >
                      {showReturnDate ? 'Remove Return' : '+ Add Return'}
                    </button>
                  </div>

                  {showReturnDate ? (
                    <div
                      onClick={() => returnDateInputRef.current?.showPicker?.()}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                      <input
                        ref={returnDateInputRef}
                        type="date"
                        value={returnDate}
                        min={departureDate}
                        onChange={(e) => setReturnDate(e.target.value)}
                        className="w-full bg-transparent text-xs sm:text-sm font-bold text-[#071A2B] focus:outline-none cursor-pointer"
                      />
                    </div>
                  ) : (
                    <div
                      onClick={() => {
                        setShowReturnDate(true);
                        setReturnDate(departureDate);
                      }}
                      className="text-xs text-slate-400 font-medium py-0.5 cursor-pointer flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5 text-[#FF5A1F]" />
                      <span>One-way journey selected</span>
                    </div>
                  )}
                </div>

                {/* Travelers Selector */}
                <div ref={travelersRef} className="lg:col-span-3 relative">
                  <div
                    onClick={() => setShowTravelersDropdown(!showTravelersDropdown)}
                    className="p-2.5 rounded-2xl border border-slate-300 hover:border-[#FF5A1F] bg-slate-50/80 transition-all cursor-pointer"
                  >
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-0.5 pointer-events-none">
                      Travelers
                    </label>
                    <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-[#071A2B]">
                      <Users className="w-4 h-4 text-[#FF5A1F] shrink-0" />
                      <span>{travelers} {travelers === 1 ? 'Traveler' : 'Travelers'}</span>
                    </div>
                  </div>

                  {/* Travelers Dropdown Menu */}
                  {showTravelersDropdown && (
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-40 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-[#071A2B]">Adults</p>
                          <p className="text-[10px] text-slate-400">Age 12 and above</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            disabled={travelers <= 1}
                            onClick={() => setTravelers(Math.max(1, travelers - 1))}
                            className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center disabled:opacity-40 cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="font-extrabold text-sm w-4 text-center">{travelers}</span>
                          <button
                            type="button"
                            disabled={travelers >= 10}
                            onClick={() => setTravelers(Math.min(10, travelers + 1))}
                            className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center disabled:opacity-40 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowTravelersDropdown(false)}
                        className="w-full py-1.5 rounded-xl bg-[#071A2B] text-white text-xs font-bold cursor-pointer hover:bg-[#0C2438]"
                      >
                        Done
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Validation Error Notice */}
              {validationError && (
                <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>{validationError}</span>
                </div>
              )}

              {/* Prominent Search Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full btn-primary-cb !py-3.5 !px-6 !text-sm font-extrabold flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#FF5A1F]/30 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-60"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Discovering Transport Alternatives...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5" />
                      <span>Find Transport Alternatives →</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Popular Indian Route Shortcuts */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-[#071A2B]">Popular Journey Searches</h2>
            <p className="text-xs text-slate-500">Explore multimodal alternatives for high-demand routes</p>
          </div>
          <span className="text-xs font-bold text-[#FF5A1F] hidden sm:inline">1-Click Compare</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {POPULAR_SEARCHES.map((preset, idx) => (
            <div
              key={idx}
              onClick={() => handleQuickSearch(preset)}
              className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-[#FF5A1F] hover:shadow-md transition-all cursor-pointer group space-y-1"
            >
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF5A1F] block">
                {preset.tag}
              </span>
              <h3 className="font-extrabold text-xs text-[#071A2B] group-hover:text-[#FF5A1F] truncate transition-colors">
                {preset.title}
              </h3>
              <p className="text-[11px] text-slate-400 truncate">
                Train • Bus • Flight • Cab
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Transport Modes & Verification Quality */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-xl font-extrabold text-[#071A2B]">Genuine Multimodal Transport Modes</h2>
          <p className="text-xs text-slate-500">Connecting Indian cities, airports, railway networks, and hill gateways</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 text-xs">
          {[
            { icon: Train, name: 'Train', label: 'IRCTC NTES', desc: 'Shatabdi, Vande Bharat, Rajdhani', color: 'text-amber-500 bg-amber-50 border-amber-200' },
            { icon: Bus, name: 'Bus', label: 'redBus Network', desc: 'AC Volvo & Multi-Axle Sleeper', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
            { icon: Plane, name: 'Flight', label: 'Amadeus / IndiGo', desc: 'Domestic & International GDS', color: 'text-sky-600 bg-sky-50 border-sky-200' },
            { icon: Anchor, name: 'Ferry', label: 'Port Operators', desc: 'Waterways & Ro-Pax Catamarans', color: 'text-teal-600 bg-teal-50 border-teal-200' },
            { icon: Car, name: 'Outstation Cab', label: 'MakeMyTrip Cabs', desc: 'Chauffeur Driven Door-to-Door', color: 'text-orange-600 bg-orange-50 border-orange-200' },
            { icon: MapPin, name: 'Road Trip', label: 'NHAI FASTag', desc: 'Highway driving distance & tolls', color: 'text-purple-600 bg-purple-50 border-purple-200' },
          ].map((mode, i) => {
            const Icon = mode.icon;
            return (
              <div key={i} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm text-center space-y-1.5">
                <div className={`w-9 h-9 rounded-xl mx-auto flex items-center justify-center border ${mode.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-extrabold text-sm text-[#071A2B]">{mode.name}</h3>
                <p className="text-[10px] font-bold text-slate-500">{mode.label}</p>
                <p className="text-[10px] text-slate-400 leading-tight">{mode.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Rome2Rio Experience Guarantee Banner */}
        <div className="p-6 rounded-3xl bg-[#071A2B] text-white flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FF5A1F]/20 text-[#FF5A1F] flex items-center justify-center font-bold shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white">Transparent Route & Price Transparency</h3>
              <p className="text-xs text-slate-300">
                Every route clearly distinguishes Live Provider Offers, Calculated Highway Estimates, and Indicative GDS fares with real operator links.
              </p>
            </div>
          </div>
          <span className="text-xs bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full border border-emerald-500/30 font-bold shrink-0">
            ✓ Zero Fabricated Schedules
          </span>
        </div>
      </section>
    </div>
  );
}
