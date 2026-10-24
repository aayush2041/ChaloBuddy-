import React, { useState, useRef } from 'react';
import { useStore } from '../context/StoreContext';
import TripCard from '../components/TripCard';
import StayCard from '../components/StayCard';
import StoryCard from '../components/StoryCard';
import DestinationAutocomplete from '../components/DestinationAutocomplete';
import DatePicker, { toISODateString } from '../components/DatePicker';
import {
  Search,
  Calendar,
  Users,
  MapPin,
  ArrowRight,
  Sparkles,
  Compass,
  PlusCircle,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export default function HomePage() {
  const {
    trips,
    stays,
    stories,
    navigate,
    selectedLocation,
    setSelectedLocation,
    addToast,
  } = useStore();

  // Search Bar State with safe dynamic upcoming dates
  const [destination, setDestination] = useState(selectedLocation?.city || '');
  const [dateRange, setDateRange] = useState(() => {
    const today = new Date();
    const start = new Date(today.getTime() + 7 * 86400000);
    const end = new Date(today.getTime() + 14 * 86400000);
    return {
      start: toISODateString(start),
      end: toISODateString(end),
    };
  });
  const [travelersCount, setTravelersCount] = useState(2);
  const [travelerDropdownOpen, setTravelerDropdownOpen] = useState(false);
  const datePickerRef = useRef(null);

  const handleSearchSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!destination || !destination.trim()) {
      addToast('Please enter a destination to search.', 'error');
      return;
    }
    navigate('trips', {
      destination: destination.trim(),
      start: dateRange?.start || '',
      end: dateRange?.end || '',
      travelers: travelersCount,
    });
  };

  return (
    <div className="min-h-screen bg-[#F5F7F8] text-[#071A2B]">
      {/* 1. HERO SECTION */}
      <section className="relative pt-24 pb-16 sm:pt-32 sm:pb-24 bg-[#071A2B] text-white overflow-hidden">
        {/* Subtle background image overlay with high contrast */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=2000&q=85"
            alt="Scenic Mountain Peaks"
            className="w-full h-full object-cover object-center opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#071A2B]/75 via-[#071A2B]/85 to-[#071A2B]" />
        </div>

        {/* Subtle ambient glow in top right */}
        <div className="absolute top-1/4 right-10 w-96 h-96 bg-[#FF5A1F]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Eyebrow, Headline & Value Proposition */}
          <div className="max-w-3xl space-y-4 text-center sm:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold tracking-wide text-slate-200 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#FF5A1F] animate-pulse" />
              <span>India&apos;s Travel &amp; Buddy Community</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.12]">
              Find people to travel with, discover trips, or plan your own journey.
            </h1>

            <p className="text-base sm:text-lg text-slate-300 font-normal max-w-2xl leading-relaxed">
              Connect with verified travel buddies, join curated group expeditions, or build your custom day-by-day itinerary with real route and budget estimates.
            </p>

            {/* Trust Assurances */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 sm:gap-4 pt-1 text-xs text-slate-300 font-medium">
              <span className="inline-flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1 rounded-full">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                100% Verified Hosts
              </span>
              <span className="inline-flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#FF5A1F]" />
                Zero Commission Fees
              </span>
              <span className="inline-flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1 rounded-full">
                <Users className="w-3.5 h-3.5 text-sky-400" />
                Small Friendly Groups
              </span>
            </div>
          </div>

          {/* 3 Obvious Primary Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mt-10">
            {/* Card 1: Find a Trip */}
            <div
              role="button"
              tabIndex={0}
              data-testid="hero-card-trips"
              onClick={() => navigate('trips')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  navigate('trips');
                }
              }}
              className="bg-[#0C2438]/90 hover:bg-[#0C2438] border border-white/12 hover:border-[#FF5A1F]/60 rounded-2xl p-6 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-2xl hover:-translate-y-1.5 flex flex-col justify-between group text-left relative overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A1F]"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF5A1F]/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform" />
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[#FF5A1F]/20 text-[#FF5A1F] flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-bold bg-[#FF5A1F]/15 text-[#FF5A1F] border border-[#FF5A1F]/30 px-2 py-0.5 rounded-full">
                    Upcoming Groups
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#FF5A1F] transition-colors">
                  Find a Trip
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Discover upcoming group expeditions led by verified hosts. Join friendly travelers and explore India together.
                </p>
              </div>
              <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-bold text-[#FF5A1F]">
                <span>Browse upcoming trips</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
              </div>
            </div>

            {/* Card 2: List a Trip */}
            <div
              role="button"
              tabIndex={0}
              data-testid="hero-card-list-trip"
              onClick={() => navigate('list-trip')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  navigate('list-trip');
                }
              }}
              className="bg-[#0C2438]/90 hover:bg-[#0C2438] border border-white/12 hover:border-emerald-500/60 rounded-2xl p-6 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-2xl hover:-translate-y-1.5 flex flex-col justify-between group text-left relative overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform" />
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
                    <PlusCircle className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                    Host &amp; Lead
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">
                  List a Trip
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Have an adventure in mind? Host your own trip, invite travel companions, and easily share travel and stay costs.
                </p>
              </div>
              <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-bold text-emerald-400">
                <span>Start hosting a trip</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
              </div>
            </div>

            {/* Card 3: Plan a Trip */}
            <div
              role="button"
              tabIndex={0}
              data-testid="hero-card-plan-trip"
              onClick={() => navigate('plan-trip')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  navigate('plan-trip');
                }
              }}
              className="bg-[#0C2438]/90 hover:bg-[#0C2438] border border-white/12 hover:border-amber-500/60 rounded-2xl p-6 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-2xl hover:-translate-y-1.5 flex flex-col justify-between group text-left relative overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform" />
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full">
                    Smart Engine
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-amber-400 transition-colors">
                  Trip Planner
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Generate an optimized day-by-day smart itinerary complete with driving routes, recommended stays, and realistic budgets.
                </p>
              </div>
              <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-bold text-amber-400">
                <span>Generate smart plan</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
              </div>
            </div>
          </div>

          {/* Quick Search Bar Console */}
          <div className="mt-8 bg-[#0C2438] rounded-2xl sm:rounded-3xl p-3 sm:p-4 border border-white/15 shadow-2xl backdrop-blur-md">
            <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
              {/* Destination */}
              <div className="lg:col-span-5 bg-[#071A2B] px-3.5 py-2.5 rounded-xl border border-white/10 hover:border-white/20 transition-colors flex items-center gap-3">
                <MapPin className="w-5 h-5 text-[#FF5A1F] flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                    Destination
                  </span>
                  <DestinationAutocomplete
                    value={destination}
                    onChange={(text, loc) => {
                      setDestination(text);
                      if (loc) setSelectedLocation(loc);
                    }}
                    onSelectLocation={(loc) => {
                      setDestination(loc.city);
                      setSelectedLocation(loc);
                    }}
                    placeholder="e.g. Manali, Spiti, Goa, Jaipur..."
                    theme="dark"
                  />
                </div>
              </div>

              {/* Dates */}
              <div
                className="lg:col-span-4 bg-[#071A2B] px-3.5 py-2.5 rounded-xl border border-white/10 hover:border-white/20 transition-colors flex items-center gap-3 cursor-pointer"
                onClick={() => datePickerRef.current?.open()}
              >
                <Calendar className="w-5 h-5 text-[#FF5A1F] flex-shrink-0" />
                <div className="flex-1 min-w-0" onClick={(e) => e.stopPropagation()}>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                    When?
                  </span>
                  <DatePicker
                    ref={datePickerRef}
                    mode="range"
                    theme="dark"
                    label=""
                    placeholder="Select dates"
                    value={dateRange}
                    onChange={(dates) => {
                      if (dates?.start && dates?.end) {
                        setDateRange({ start: dates.start, end: dates.end });
                      }
                    }}
                  />
                </div>
              </div>

              {/* Travelers */}
              <div className="lg:col-span-2 relative bg-[#071A2B] px-3.5 py-2.5 rounded-xl border border-white/10 hover:border-white/20 transition-colors flex items-center gap-3">
                <Users className="w-5 h-5 text-[#FF5A1F] flex-shrink-0" />
                <div
                  className="flex-1 min-w-0 cursor-pointer"
                  onClick={() => setTravelerDropdownOpen(!travelerDropdownOpen)}
                >
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                    Travelers
                  </span>
                  <span className="text-xs font-bold text-white block truncate">
                    {travelersCount} {travelersCount === 1 ? 'Traveler' : 'Travelers'}
                  </span>
                </div>

                {travelerDropdownOpen && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute top-full left-0 right-0 mt-2 bg-[#0C2438] border border-white/20 rounded-xl p-3 shadow-2xl z-50 text-xs space-y-2 animate-in fade-in zoom-in-95 duration-150"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-white font-medium">Group Size</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setTravelersCount(Math.max(1, travelersCount - 1))}
                          className="w-7 h-7 rounded-full bg-white/10 text-white font-bold flex items-center justify-center hover:bg-white/20 active:scale-95 transition-all cursor-pointer"
                          aria-label="Decrease travelers"
                        >
                          -
                        </button>
                        <span className="font-bold text-white w-5 text-center text-sm">{travelersCount}</span>
                        <button
                          type="button"
                          onClick={() => setTravelersCount(Math.min(15, travelersCount + 1))}
                          className="w-7 h-7 rounded-full bg-white/10 text-white font-bold flex items-center justify-center hover:bg-white/20 active:scale-95 transition-all cursor-pointer"
                          aria-label="Increase travelers"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setTravelerDropdownOpen(false)}
                      className="w-full btn-primary-cb !py-1.5 text-xs font-bold cursor-pointer"
                    >
                      Done
                    </button>
                  </div>
                )}
              </div>

              {/* Search Submit */}
              <div className="lg:col-span-1">
                <button
                  type="submit"
                  className="w-full h-11 btn-primary-cb !py-0 !px-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all min-h-[44px]"
                  title="Search Trips"
                  aria-label="Search Trips"
                >
                  <Search className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="lg:hidden text-xs font-bold">Find Trips</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* 2. UPCOMING GROUP TRIPS */}
      <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#FF5A1F] block">
              Discover Journeys
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#071A2B] mt-1 tracking-tight">
              Popular Upcoming Trips
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Handpicked itineraries led by verified hosts and friendly small groups.
            </p>
          </div>

          <button
            onClick={() => navigate('trips')}
            className="inline-flex items-center gap-1.5 text-sm font-bold text-[#FF5A1F] hover:text-[#e04f1a] transition-colors cursor-pointer self-start sm:self-auto"
          >
            <span>View all trips</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Trips Grid */}
        {trips.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-8 max-w-md mx-auto space-y-3 shadow-xs">
            <Compass className="w-10 h-10 text-[#FF5A1F] mx-auto" />
            <p className="text-sm font-bold text-[#071A2B]">Loading upcoming trips...</p>
            <p className="text-xs text-slate-500">Connecting to verified group departures.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {trips.slice(0, 6).map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        )}
      </section>

      {/* 2B. DEDICATED WOMEN-ONLY TRIPS SECTION */}
      <section className="py-16 sm:py-20 bg-gradient-to-b from-[#160b18] via-[#0e0712] to-[#071A2B] text-white border-y border-pink-500/20 relative overflow-hidden">
        <div className="absolute top-1/2 left-10 w-96 h-96 bg-pink-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/15 border border-pink-400/30 text-pink-300 text-xs font-bold mb-3 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-pink-400 animate-pulse" />
                <span>Dedicated Safe Space</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight flex items-center gap-2">
                <span>Women-Only Expeditions</span>
                <span className="text-xl">🌸</span>
              </h2>
              <p className="text-xs sm:text-sm text-pink-100/70 mt-1 max-w-2xl leading-relaxed">
                Curated, verified adventures exclusively open to female travelers. Explore high mountain passes, coastal trails, and cultural retreats with female expedition leaders and vetted accommodations.
              </p>
            </div>

            <button
              onClick={() => navigate('trips', { womenOnly: 'true' })}
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold bg-pink-600 hover:bg-pink-500 text-white px-5 py-2.5 rounded-full transition-all cursor-pointer shadow-lg shadow-pink-600/30 self-start sm:self-auto"
            >
              <span>Explore All Women-Only Trips</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {trips.filter((t) => t.isWomenOnly).length > 0
              ? trips.filter((t) => t.isWomenOnly).slice(0, 3).map((trip) => (
                  <TripCard key={trip.id} trip={trip} />
                ))
              : trips.slice(0, 2).map((trip) => (
                  <TripCard key={trip.id} trip={{ ...trip, isWomenOnly: true }} />
                ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-12 pt-8 border-t border-pink-500/20 text-xs text-pink-100/80">
            <div className="flex items-start gap-3 bg-white/5 p-4 rounded-xl border border-pink-500/20">
              <ShieldCheck className="w-5 h-5 text-pink-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-white mb-0.5">Verified Female Travelers</h4>
                <p className="text-[11px] text-pink-200/70">Backend query and room membership restrictions strictly protect group privacy.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-white/5 p-4 rounded-xl border border-pink-500/20">
              <Users className="w-5 h-5 text-pink-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-white mb-0.5">Certified Female Leads</h4>
                <p className="text-[11px] text-pink-200/70">Expeditions guided by certified female trek leaders with wilderness first-aid training.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-white/5 p-4 rounded-xl border border-pink-500/20">
              <CheckCircle2 className="w-5 h-5 text-pink-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-white mb-0.5">Vetted Safe Stays</h4>
                <p className="text-[11px] text-pink-200/70">Handpicked homestays, twin-share private chalets, and secure verified transit.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. HOW CHALOBUDDY WORKS */}
      <section className="py-16 sm:py-20 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-[#FF5A1F] block">
              How It Works
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#071A2B] mt-1 tracking-tight">
              Travel Made Simple
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">
              Everything you need to discover, organize, and experience unforgettable adventures.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-[#F5F7F8] rounded-2xl p-7 border border-slate-200/80 flex flex-col justify-between hover:border-slate-300 transition-colors">
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#071A2B] text-[#FF5A1F] flex items-center justify-center font-bold text-lg mb-5 shadow-sm">
                  01
                </div>
                <h3 className="text-lg font-bold text-[#071A2B] mb-2">Find or Host a Trip</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Browse verified upcoming group trips or list your own dream destination to invite travelers and split travel costs.
                </p>
              </div>
              <button
                onClick={() => navigate('trips')}
                className="mt-6 pt-4 border-t border-slate-200 text-xs font-bold text-[#FF5A1F] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Browse trips</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Step 2 */}
            <div className="bg-[#F5F7F8] rounded-2xl p-7 border border-slate-200/80 flex flex-col justify-between hover:border-slate-300 transition-colors">
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#071A2B] text-[#FF5A1F] flex items-center justify-center font-bold text-lg mb-5 shadow-sm">
                  02
                </div>
                <h3 className="text-lg font-bold text-[#071A2B] mb-2">Smart Day-by-Day Planning</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Use the smart trip planner to get an optimized itinerary with route distances, weather estimates, and verified stays.
                </p>
              </div>
              <button
                onClick={() => navigate('plan-trip')}
                className="mt-6 pt-4 border-t border-slate-200 text-xs font-bold text-[#FF5A1F] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Try smart planner</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Step 3 */}
            <div className="bg-[#F5F7F8] rounded-2xl p-7 border border-slate-200/80 flex flex-col justify-between hover:border-slate-300 transition-colors">
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#071A2B] text-[#FF5A1F] flex items-center justify-center font-bold text-lg mb-5 shadow-sm">
                  03
                </div>
                <h3 className="text-lg font-bold text-[#071A2B] mb-2">Connect &amp; Travel Together</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Connect with fellow travelers via group chat, coordinate pickup points, and make lifelong travel memories.
                </p>
              </div>
              <button
                onClick={() => navigate('list-trip')}
                className="mt-6 pt-4 border-t border-slate-200 text-xs font-bold text-[#FF5A1F] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Host an adventure</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CURATED STAYS */}
      <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#FF5A1F] block">
              Handpicked Places
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#071A2B] mt-1 tracking-tight">
              Stays Travelers Love
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              From mountain wooden cottages to serene hostels, verified for comfort and safety.
            </p>
          </div>

          <button
            onClick={() => navigate('stays')}
            className="inline-flex items-center gap-1.5 text-sm font-bold text-[#FF5A1F] hover:text-[#e04f1a] transition-colors cursor-pointer self-start sm:self-auto"
          >
            <span>Browse all stays</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Stays Grid */}
        {stays.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-8 max-w-md mx-auto space-y-3 shadow-xs">
            <MapPin className="w-10 h-10 text-emerald-500 mx-auto" />
            <p className="text-sm font-bold text-[#071A2B]">Discovering verified homestays...</p>
            <p className="text-xs text-slate-500">Checking boutique properties and chalets.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {stays.slice(0, 3).map((stay) => (
              <StayCard key={stay.id} stay={stay} />
            ))}
          </div>
        )}
      </section>

      {/* 5. COMMUNITY STORIES */}
      <section className="py-16 sm:py-20 bg-[#071A2B] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#FF5A1F] block">
                Community Voices
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-1 tracking-tight">
                Real Stories from Real Travelers
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Hear from explorers who found trusted travel buddies on ChaloBuddy.
              </p>
            </div>

            <button
              onClick={() => navigate('stories')}
              className="inline-flex items-center gap-1.5 text-sm font-bold text-[#FF5A1F] hover:text-[#e04f1a] transition-colors cursor-pointer self-start sm:self-auto"
            >
              <span>Read all stories</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {stories.slice(0, 2).map((story) => (
              <StoryCard key={story.id} story={story} />
            ))}
          </div>
        </div>
      </section>

      {/* 6. CLEAN CALL TO ACTION */}
      <section className="py-16 sm:py-20 bg-white border-t border-slate-200 text-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-5">
          <h2 className="text-3xl sm:text-5xl font-black text-[#071A2B] tracking-tight">
            Ready for your next adventure?
          </h2>
          <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
            Join thousands of travelers planning, exploring stays, and discovering India together.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <button
              onClick={() => navigate('trips')}
              className="w-full sm:w-auto btn-primary-cb !py-3.5 !px-8 text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-lg"
            >
              <span>Find a Trip</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate('plan-trip')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#071A2B] hover:bg-[#0C2438] text-white font-bold text-sm transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md"
            >
              <span>Plan Your Journey</span>
              <Sparkles className="w-4 h-4 text-[#FF5A1F]" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
