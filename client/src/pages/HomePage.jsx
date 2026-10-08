import React, { useState, useRef } from 'react';
import { useStore } from '../context/StoreContext';
import TripCard from '../components/TripCard';
import StayCard from '../components/StayCard';
import StoryCard from '../components/StoryCard';
import DestinationAutocomplete from '../components/DestinationAutocomplete';
import DatePicker from '../components/DatePicker';
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

  // Search Bar State
  const [destination, setDestination] = useState(selectedLocation?.city || '');
  const [dateRange, setDateRange] = useState({ start: '15 Oct 2025', end: '22 Oct 2025' });
  const [travelersCount, setTravelersCount] = useState(2);
  const [travelerDropdownOpen, setTravelerDropdownOpen] = useState(false);
  const datePickerRef = useRef(null);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
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
      <section className="relative pt-28 pb-20 sm:pt-36 sm:pb-28 bg-[#071A2B] text-white overflow-hidden">
        {/* Subtle background image overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2000&q=85"
            alt="Scenic Mountain Peaks"
            className="w-full h-full object-cover object-center opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#071A2B]/70 via-[#071A2B]/85 to-[#071A2B]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Eyebrow & Headline */}
          <div className="max-w-3xl space-y-4 text-center sm:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold tracking-wide text-slate-200">
              <span className="w-2 h-2 rounded-full bg-[#FF5A1F]" />
              <span>India&apos;s Travel &amp; Buddy Community</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.12]">
              Find people to travel with, discover trips, or plan your own journey.
            </h1>

            <p className="text-base sm:text-lg text-slate-300 font-normal max-w-2xl leading-relaxed">
              Connect with verified travel buddies, join curated group expeditions, or build your custom day-by-day itinerary with real route and budget estimates.
            </p>
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
              className="bg-[#0C2438]/90 hover:bg-[#0C2438] border border-white/15 hover:border-[#FF5A1F]/50 rounded-2xl p-6 transition-all duration-200 cursor-pointer shadow-lg hover:shadow-2xl hover:-translate-y-1 flex flex-col justify-between group text-left"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#FF5A1F]/20 text-[#FF5A1F] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <MapPin className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Find a Trip</h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Discover upcoming group expeditions led by verified hosts. Join friendly travelers and explore India together.
                </p>
              </div>
              <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-bold text-[#FF5A1F]">
                <span>Browse upcoming trips</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
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
              className="bg-[#0C2438]/90 hover:bg-[#0C2438] border border-white/15 hover:border-emerald-500/50 rounded-2xl p-6 transition-all duration-200 cursor-pointer shadow-lg hover:shadow-2xl hover:-translate-y-1 flex flex-col justify-between group text-left"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <PlusCircle className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                    Host &amp; Lead
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">List a Trip</h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Have an adventure in mind? Host your own trip, invite travel companions, and easily share travel and stay costs.
                </p>
              </div>
              <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-bold text-emerald-400">
                <span>Start hosting a trip</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
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
              className="bg-[#0C2438]/90 hover:bg-[#0C2438] border border-white/15 hover:border-amber-500/50 rounded-2xl p-6 transition-all duration-200 cursor-pointer shadow-lg hover:shadow-2xl hover:-translate-y-1 flex flex-col justify-between group text-left"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full">
                    Smart Engine
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Trip Planner</h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Generate an optimized day-by-day smart itinerary complete with driving routes, recommended stays, and realistic budgets.
                </p>
              </div>
              <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-bold text-amber-400">
                <span>Generate smart plan</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>

          {/* Quick Search Bar */}
          <div className="mt-8 bg-[#0C2438] rounded-2xl p-3 sm:p-4 border border-white/15 shadow-xl">
            <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
              {/* Destination */}
              <div className="lg:col-span-5 bg-[#071A2B] px-3.5 py-2 rounded-xl border border-white/10 flex items-center gap-3">
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
                    placeholder="e.g. Manali, Spiti, Goa..."
                    theme="dark"
                  />
                </div>
              </div>

              {/* Dates */}
              <div
                className="lg:col-span-4 bg-[#071A2B] px-3.5 py-2 rounded-xl border border-white/10 flex items-center gap-3 cursor-pointer"
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
              <div className="lg:col-span-2 relative bg-[#071A2B] px-3.5 py-2 rounded-xl border border-white/10 flex items-center gap-3">
                <Users className="w-5 h-5 text-[#FF5A1F] flex-shrink-0" />
                <div
                  className="flex-1 min-w-0 cursor-pointer"
                  onClick={() => setTravelerDropdownOpen(!travelerDropdownOpen)}
                >
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                    Travelers
                  </span>
                  <span className="text-xs font-bold text-white block truncate">
                    {travelersCount} {travelersCount === 1 ? 'Person' : 'People'}
                  </span>
                </div>

                {travelerDropdownOpen && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute top-full left-0 right-0 mt-2 bg-[#0C2438] border border-white/15 rounded-xl p-3 shadow-2xl z-50 text-xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-white font-medium">Group Size</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setTravelersCount(Math.max(1, travelersCount - 1))}
                          className="w-6 h-6 rounded-full bg-white/10 text-white font-bold flex items-center justify-center hover:bg-white/20"
                        >
                          -
                        </button>
                        <span className="font-bold text-white w-4 text-center">{travelersCount}</span>
                        <button
                          type="button"
                          onClick={() => setTravelersCount(travelersCount + 1)}
                          className="w-6 h-6 rounded-full bg-white/10 text-white font-bold flex items-center justify-center hover:bg-white/20"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setTravelerDropdownOpen(false)}
                      className="w-full btn-primary-cb !py-1 text-xs font-bold"
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
                  className="w-full h-11 btn-primary-cb !py-0 !px-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md hover:scale-102 transition-transform min-h-[44px]"
                  title="Search Trips"
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {trips.slice(0, 6).map((trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))}
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
            <div className="bg-[#F5F7F8] rounded-2xl p-7 border border-slate-200/80 flex flex-col justify-between">
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
            <div className="bg-[#F5F7F8] rounded-2xl p-7 border border-slate-200/80 flex flex-col justify-between">
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
            <div className="bg-[#F5F7F8] rounded-2xl p-7 border border-slate-200/80 flex flex-col justify-between">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {stays.slice(0, 3).map((stay) => (
            <StayCard key={stay.id} stay={stay} />
          ))}
        </div>
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
