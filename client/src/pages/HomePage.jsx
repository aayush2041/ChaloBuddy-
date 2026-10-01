import React, { useState, useRef } from 'react';
import { useStore } from '../context/StoreContext';
import TripCard from '../components/TripCard';
import StayCard from '../components/StayCard';
import StoryCard from '../components/StoryCard';
import DestinationAutocomplete from '../components/DestinationAutocomplete';
import DatePicker from '../components/DatePicker';
import { VIBES } from '../data/seedData';
import {
  Search,
  Calendar,
  Users,
  Wallet,
  MapPin,
  ArrowRight,
  Play,
  Star,
  CheckCircle2,
  Sparkles,
  Compass,
  ChevronRight,
  ChevronLeft,
  ShieldCheck,
  Flame,
  Clock,
  Layers,
  Heart,
  Navigation,
  CloudSun,
  BedDouble,
  Route,
} from 'lucide-react';

export default function HomePage() {
  const {
    trips,
    stays,
    stories,
    navigate,
    formatPrice,
    setVideoTourModalOpen,
    selectedLocation,
    setSelectedLocation,
    addToast,
  } = useStore();

  // Floating Search Widget State
  const [searchTab, setSearchTab] = useState('trip'); // 'trip' | 'stay' | 'list'
  const [destination, setDestination] = useState(selectedLocation?.city || '');
  const [dateRange, setDateRange] = useState({ start: '15 Oct 2025', end: '22 Oct 2025' });
  const [travelersCount, setTravelersCount] = useState(2);
  const [selectedBudget, setSelectedBudget] = useState(15000);

  // Dropdown visibility states
  const [destDropdownOpen, setDestDropdownOpen] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [travelerSelectorOpen, setTravelerSelectorOpen] = useState(false);
  const [budgetSelectorOpen, setBudgetSelectorOpen] = useState(false);

  // Vibe carousel scroll ref
  const vibeScrollRef = useRef(null);

  // Smart Planner Mockup Interactive Tab
  const [plannerMockTab, setPlannerMockTab] = useState('itinerary'); // 'overview' | 'itinerary' | 'budget' | 'stay'

  // Quick List a Trip Form State
  const [quickListForm, setQuickListForm] = useState({
    name: 'Spiti Winter Expedition 2025',
    destination: 'Spiti Valley, Himachal',
    dates: '15–22 Oct, 2025',
    travelers: 10,
    budget: 12999,
    tripType: 'Trekking & High Altitude',
  });

  const scrollVibes = (direction) => {
    if (vibeScrollRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      vibeScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!destination || !destination.trim()) {
      addToast('Please select a destination.', 'error');
      return;
    }
    if (!dateRange?.start) {
      addToast('Please select your travel dates.', 'error');
      return;
    }
    if (!travelersCount || travelersCount < 1) {
      addToast('Please select the number of travelers.', 'error');
      return;
    }
    if (!selectedBudget || selectedBudget <= 0) {
      addToast('Please enter your maximum budget.', 'error');
      return;
    }

    const trimmedDest = destination.trim();
    if (searchTab === 'stay') {
      navigate('stays', {
        destination: trimmedDest,
        start: dateRange.start,
        end: dateRange.end,
        guests: travelersCount,
        budget: selectedBudget,
      });
    } else if (searchTab === 'list') {
      navigate('list-trip', {
        prefill: {
          destination: trimmedDest,
          dates: `${dateRange.start} – ${dateRange.end}`,
          travelers: travelersCount,
          budget: selectedBudget,
        },
      });
    } else {
      navigate('trips', {
        destination: trimmedDest,
        start: dateRange.start,
        end: dateRange.end,
        travelers: travelersCount,
        budget: selectedBudget,
      });
    }
  };

  const handleQuickListSubmit = (e) => {
    e.preventDefault();
    navigate('list-trip', { prefill: quickListForm });
  };

  return (
    <div className="min-h-screen bg-[#F5F7F8] text-[#071A2B]">
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[92vh] sm:min-h-[95vh] flex flex-col justify-between pt-24 pb-32 sm:pb-36 bg-[#071A2B] overflow-hidden">
        {/* Cinematic Background Mountain Photography with Dark Navy Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2000&q=85"
            alt="Majestic Mountain Landscape"
            className="w-full h-full object-cover object-center opacity-45 scale-102"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#071A2B] via-[#071A2B]/40 to-[#071A2B]/70" />
          <div className="absolute inset-0 bg-radial-gradient from-transparent to-[#071A2B]/80" />
        </div>

        {/* Hand-drawn decorative doodles & ambient light */}
        <div className="absolute top-1/4 left-10 w-72 h-72 bg-[#FF5A1F]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 relative z-10 my-auto text-center sm:text-left">
          <div className="max-w-3xl space-y-6">
            {/* Eyebrow with Hand-drawn style badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-bold tracking-wider uppercase">
              <span className="w-2 h-2 rounded-full bg-[#FF5A1F] animate-ping" />
              <span>YOUR TRAVEL BUDDY</span>
              <span className="text-[#FF5A1F] font-handwriting text-sm lowercase font-bold">
                ✦ 100% verified hosts
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.08]">
              Travel Better.{' '}
              <span className="block mt-1 sm:inline">
                Plan <span className="text-[#FF5A1F] relative">
                  Smarter.
                  {/* Subtle hand-drawn underline SVG */}
                  <svg
                    className="absolute -bottom-2 left-0 w-full h-3 text-[#FF5A1F]"
                    viewBox="0 0 200 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M3 9C50 3 150 2 197 9"
                      stroke="currentColor"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              </span>
            </h1>

            {/* Supporting Copy */}
            <p className="text-base sm:text-xl text-slate-200 font-normal leading-relaxed max-w-2xl">
              Find trips. List your own. Meet travel buddies, discover stays and turn travel dreams into real adventures.
            </p>

            {/* Action Buttons & Hand-drawn Annotation */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-4 relative">
              <button
                onClick={() => navigate('trips')}
                className="w-full sm:w-auto btn-primary-cb !py-3.5 !px-8 text-sm sm:text-base font-bold flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span>Find a Trip</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => setVideoTourModalOpen(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-white/15 hover:bg-white/25 text-white font-semibold text-sm backdrop-blur-md border border-white/20 transition-all cursor-pointer group"
              >
                <div className="w-6 h-6 rounded-full bg-[#FF5A1F] flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform">
                  <Play className="w-3 h-3 fill-white ml-0.5" />
                </div>
                <span>Watch Video</span>
              </button>

              {/* Hand-drawn style annotation */}
              <div className="hidden md:flex items-center gap-2 absolute -right-24 top-2 text-white/90">
                <svg className="w-12 h-8 text-[#FF5A1F] -rotate-12" viewBox="0 0 60 40" fill="none">
                  <path d="M5 30 C 20 10, 40 5, 55 15 M 55 15 L 45 10 M 55 15 L 50 25" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="font-handwriting text-lg text-amber-300 font-bold rotate-6 whitespace-nowrap">
                  Over 1,000+ happy groups!
                </span>
              </div>
            </div>

            {/* Stats Ribbon */}
            <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 border-t border-white/10 text-white">
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-white">10K+</p>
                <p className="text-xs text-slate-300 font-medium">Travelers</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-1">
                  4.8<Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                </p>
                <p className="text-xs text-slate-300 font-medium">User Rating</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-white">1000+</p>
                <p className="text-xs text-slate-300 font-medium">Destinations</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-[#FF5A1F]">Growing</p>
                <p className="text-xs text-slate-300 font-medium">Community</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FLOATING SEARCH WIDGET (Overlaps Hero & Explore) */}
      <section className="relative z-30 -mt-20 sm:-mt-24 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
        <div className="bg-[#0C2438] rounded-3xl p-4 sm:p-6 shadow-2xl border border-white/15 backdrop-blur-xl">
          {/* Tabs: Find a Trip, Find Stays, List a Trip */}
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/10">
            <button
              type="button"
              onClick={() => setSearchTab('trip')}
              className={`px-5 py-2 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                searchTab === 'trip'
                  ? 'bg-[#FF5A1F] text-white shadow-lg shadow-[#FF5A1F]/30'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300'
              }`}
            >
              Find a Trip
            </button>
            <button
              type="button"
              onClick={() => setSearchTab('stay')}
              className={`px-5 py-2 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                searchTab === 'stay'
                  ? 'bg-[#FF5A1F] text-white shadow-lg shadow-[#FF5A1F]/30'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300'
              }`}
            >
              Find Stays
            </button>
            <button
              type="button"
              onClick={() => setSearchTab('list')}
              className={`px-5 py-2 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                searchTab === 'list'
                  ? 'bg-[#FF5A1F] text-white shadow-lg shadow-[#FF5A1F]/30'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300'
              }`}
            >
              List a Trip
            </button>
          </div>

          {/* Interactive Search Fields Form - All 4 fields + button aligned with identical height, border radius, and padding */}
          <form onSubmit={handleSearchSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-stretch">
              {/* Field 1: Where to? */}
              <div className="lg:col-span-3 min-h-[72px] h-[72px] bg-[#071A2B] hover:bg-[#071A2B]/90 px-4 py-2 rounded-2xl border border-white/10 hover:border-white/20 transition-all flex items-center gap-3 z-30">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-[#FF5A1F] flex-shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Where to?
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
                    placeholder="Search e.g. Delhi, Dehradun, Spiti..."
                    theme="dark"
                  />
                </div>
              </div>

              {/* Field 2: When? (Strict DatePicker with range mode) */}
              <div className="lg:col-span-3 min-h-[72px] h-[72px] bg-[#071A2B] hover:bg-[#071A2B]/90 px-4 py-2 rounded-2xl border border-white/10 hover:border-white/20 transition-all flex items-center gap-3 z-20">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-[#FF5A1F] flex-shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <DatePicker
                    mode="range"
                    theme="dark"
                    label="When?"
                    placeholder="Select travel dates"
                    value={dateRange}
                    onChange={(dates) => {
                      if (dates?.start && dates?.end) {
                        setDateRange({ start: dates.start, end: dates.end });
                      }
                    }}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Field 3: Travelers */}
              <div
                onClick={() => setTravelerSelectorOpen(!travelerSelectorOpen)}
                className="relative lg:col-span-2 min-h-[72px] h-[72px] bg-[#071A2B] hover:bg-[#071A2B]/90 px-4 py-2 rounded-2xl border border-white/10 hover:border-white/20 transition-all cursor-pointer flex items-center gap-3 z-10"
              >
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-[#FF5A1F] flex-shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div className="overflow-hidden flex-1">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Travelers
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-white block truncate">
                    {travelersCount} {travelersCount === 1 ? 'Traveler' : 'Travelers'}
                  </span>
                </div>

                {/* Travelers Dropdown */}
                {travelerSelectorOpen && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute top-full left-0 right-0 sm:w-64 mt-2 bg-[#071A2B] border border-white/15 rounded-2xl shadow-2xl p-4 z-50 text-xs space-y-3"
                  >
                    <span className="font-bold text-white text-xs block pb-1 border-b border-white/10">
                      Who is traveling?
                    </span>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-white">Travelers</p>
                        <p className="text-[10px] text-slate-400">Total group size</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setTravelersCount(Math.max(1, travelersCount - 1))}
                          className="w-7 h-7 rounded-full bg-white/10 text-white font-bold flex items-center justify-center hover:bg-white/20"
                        >
                          -
                        </button>
                        <span className="w-4 text-center font-bold text-white">{travelersCount}</span>
                        <button
                          type="button"
                          onClick={() => setTravelersCount(travelersCount + 1)}
                          className="w-7 h-7 rounded-full bg-white/10 text-white font-bold flex items-center justify-center hover:bg-white/20"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setTravelerSelectorOpen(false)}
                      className="w-full btn-primary-cb !py-1.5 !text-xs font-bold"
                    >
                      Done
                    </button>
                  </div>
                )}
              </div>

              {/* Field 4: Budget */}
              <div
                onClick={() => setBudgetSelectorOpen(!budgetSelectorOpen)}
                className="relative lg:col-span-2 min-h-[72px] h-[72px] bg-[#071A2B] hover:bg-[#071A2B]/90 px-4 py-2 rounded-2xl border border-white/10 hover:border-white/20 transition-all cursor-pointer flex items-center gap-3 z-10"
              >
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-[#FF5A1F] flex-shrink-0">
                  <Wallet className="w-5 h-5" />
                </div>
                <div className="overflow-hidden flex-1">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Budget
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-white block truncate">
                    {formatPrice(selectedBudget)} max
                  </span>
                </div>

                {/* Budget Dropdown Slider */}
                {budgetSelectorOpen && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute top-full right-0 sm:w-72 mt-2 bg-[#071A2B] border border-white/15 rounded-2xl shadow-2xl p-4 z-50 text-xs space-y-3"
                  >
                    <span className="font-bold text-white text-xs block pb-1 border-b border-white/10">
                      Budget Per Person
                    </span>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-slate-300">
                        <span>Max Price:</span>
                        <span className="font-extrabold text-[#FF5A1F]">{formatPrice(selectedBudget)}</span>
                      </div>
                      <input
                        type="range"
                        min="5000"
                        max="35000"
                        step="1000"
                        value={selectedBudget}
                        onChange={(e) => setSelectedBudget(Number(e.target.value))}
                        className="w-full accent-[#FF5A1F] cursor-pointer"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-1 pt-1">
                      {[8500, 15000, 25000].map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setSelectedBudget(amt)}
                          className="px-2 py-1 rounded-lg bg-white/5 text-[10px] text-slate-300 hover:bg-white/15 text-center"
                        >
                          {formatPrice(amt)}
                        </button>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => setBudgetSelectorOpen(false)}
                      className="w-full btn-primary-cb !py-1.5 !text-xs font-bold"
                    >
                      Set Budget
                    </button>
                  </div>
                )}
              </div>

              {/* Submit Button - Aligned with fields in same row with identical height */}
              <div className="lg:col-span-2 min-h-[72px] h-[72px] flex items-stretch">
                <button
                  type="submit"
                  className="w-full h-full btn-primary-cb !rounded-2xl !py-0 !px-4 text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#FF5A1F]/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  <Search className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">
                    {searchTab === 'stay' ? 'Find Stays' : searchTab === 'list' ? 'List Trip' : 'Find a Trip'}
                  </span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>

      {/* 3. EXPLORE BY VIBE (Horizontal cards) */}
      <section className="py-20 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#FF5A1F] block">
              Curated Moods
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#071A2B] mt-1">
              Explore by Vibe
            </h2>
          </div>

          {/* Carousel controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => scrollVibes('left')}
              className="p-2.5 rounded-full bg-white hover:bg-slate-100 text-slate-700 shadow-sm border border-slate-200 cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scrollVibes('right')}
              className="p-2.5 rounded-full bg-white hover:bg-slate-100 text-slate-700 shadow-sm border border-slate-200 cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Horizontal Scrolling Vibes Container */}
        <div
          ref={vibeScrollRef}
          className="flex items-center gap-4 overflow-x-auto no-scrollbar pb-4 pt-1 snap-x snap-mandatory"
        >
          {VIBES.map((vibe) => (
            <div
              key={vibe.id}
              onClick={() => navigate('trips', { vibe: vibe.label })}
              className="group relative flex-shrink-0 w-44 sm:w-52 h-64 rounded-3xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-all duration-300 card-hover snap-start"
            >
              <img
                src={vibe.image}
                alt={vibe.label}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#071A2B] via-[#071A2B]/40 to-transparent" />

              <div className="absolute bottom-4 left-4 right-4 text-white">
                <h3 className="font-extrabold text-lg text-white group-hover:text-[#FF5A1F] transition-colors">
                  {vibe.label}
                </h3>
                <p className="text-xs text-slate-300 font-medium">{vibe.count}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. POPULAR TRIPS SECTION */}
      <section className="py-16 bg-[#071A2B] text-white relative">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#FF5A1F] block">
                Trending Expeditions
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-1">
                Popular Trips
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Handcrafted itineraries with verified mountain leads and small friendly groups.
              </p>
            </div>

            <button
              onClick={() => navigate('trips')}
              className="btn-secondary-cb !bg-white/10 !text-white !border-white/20 hover:!bg-white/20 !text-xs sm:!text-sm font-semibold flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
            >
              <span>View All Trips</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Grid of reusable TripCards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {trips.slice(0, 6).map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        </div>
      </section>

      {/* 5. HOW CHALOBUDDY WORKS */}
      <section className="py-20 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-[#FF5A1F] block">
            Simple 4-Step Journey
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#071A2B] mt-1">
            How ChaloBuddy Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            From spontaneous weekend road trips to high-altitude Himalayan summits — everything happens in 4 seamless steps.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {[
            {
              step: '01',
              title: 'Find a Trip',
              desc: 'Discover existing trips or get inspired by curated itineraries and verified hosts.',
              icon: Compass,
              accent: 'from-orange-500 to-amber-500',
              route: 'trips',
              routeParams: {},
            },
            {
              step: '02',
              title: 'Set Your Preferences',
              desc: 'Customize budget, dates, group size, fitness level and travel style with one click.',
              icon: Layers,
              accent: 'from-blue-500 to-cyan-500',
              route: 'plan-trip',
              routeParams: {},
            },
            {
              step: '03',
              title: 'Plan or Join',
              desc: 'Create your own group trip as a host or join a matching journey with fellow travelers.',
              icon: Sparkles,
              accent: 'from-emerald-500 to-teal-500',
              route: 'list-trip',
              routeParams: {},
            },
            {
              step: '04',
              title: 'Travel Together',
              desc: 'Connect in group chat, follow the interactive itinerary, split costs and create memories.',
              icon: Users,
              accent: 'from-purple-500 to-indigo-500',
              route: 'buddies',
              routeParams: {},
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                onClick={() => navigate(item.route, item.routeParams)}
                className="bg-white p-7 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-[#FF5A1F]/30 transition-all duration-300 card-hover flex flex-col justify-between h-full group cursor-pointer"
              >
                <div className="flex-1 flex flex-col">
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-[#071A2B] text-[#FF5A1F] flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-2xl font-black text-slate-300 font-mono">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-lg text-[#071A2B] mb-2">{item.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed flex-1">{item.desc}</p>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(item.route, item.routeParams);
                  }}
                  className="w-full mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#FF5A1F] hover:text-[#e04f1a] transition-colors cursor-pointer group/btn"
                >
                  <span>Learn more</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. LIST A TRIP SECTION (Dark Cinematic Section with Floating Create a Trip Card) */}
      <section className="py-20 bg-[#071A2B] text-white relative overflow-hidden">
        {/* Mountain camping photography background */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=2000&q=80"
            alt="Camping in Mountains"
            className="w-full h-full object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#071A2B] via-[#071A2B]/85 to-[#071A2B]/75" />
        </div>

        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Copy & CTAs */}
            <div className="lg:col-span-6 space-y-6">
              <span className="text-xs font-bold uppercase tracking-wider text-[#FF5A1F] bg-[#FF5A1F]/10 px-3 py-1 rounded-full border border-[#FF5A1F]/20">
                Become a ChaloBuddy Host
              </span>

              <h2 className="text-3xl sm:text-5xl font-extrabold text-white leading-tight">
                Got a trip in mind? <br />
                <span className="text-[#FF5A1F]">List it.</span>
              </h2>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                Turn your travel plans into group adventures. Host fellow travelers, split fuel and stay costs, and lead unforgettable journeys with full safety tools and instant traveler verification.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2.5 text-xs text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Set your own price, group capacity, and itinerary</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Integrated group chat and automated payment splits</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Zero listing fees for independent community organizers</span>
                </div>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row items-center gap-4">
                <button
                  onClick={() => navigate('list-trip')}
                  className="w-full sm:w-auto btn-primary-cb !py-3.5 !px-8 text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#FF5A1F]/30"
                >
                  <span>List a Trip</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setVideoTourModalOpen(true)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/15 transition-all cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>How it works</span>
                </button>
              </div>
            </div>

            {/* Right: Floating "Create a Trip" Form Card */}
            <div className="lg:col-span-6">
              <div className="bg-[#0C2438] rounded-3xl p-6 sm:p-8 border border-white/15 shadow-2xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div>
                    <h3 className="font-extrabold text-lg text-white">Create a Trip</h3>
                    <p className="text-xs text-slate-400">Quick list your adventure in 60 seconds</p>
                  </div>
                  <span className="text-xs bg-[#FF5A1F] text-white px-2.5 py-0.5 rounded-full font-bold">
                    Fast Host
                  </span>
                </div>

                <form onSubmit={handleQuickListSubmit} className="space-y-3.5 text-xs">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Trip Name</label>
                    <input
                      type="text"
                      value={quickListForm.name}
                      onChange={(e) => setQuickListForm({ ...quickListForm, name: e.target.value })}
                      placeholder="e.g. Spiti Winter Expedition 2025"
                      className="w-full bg-[#071A2B] border border-white/15 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#FF5A1F]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-medium mb-1">Where are you going?</label>
                      <div className="bg-[#071A2B] border border-white/15 rounded-xl px-3 py-1.5 focus-within:border-[#FF5A1F]">
                        <DestinationAutocomplete
                          value={quickListForm.destination}
                          onChange={(text) => setQuickListForm({ ...quickListForm, destination: text })}
                          onSelectLocation={(loc) => setQuickListForm({ ...quickListForm, destination: loc.fullName || loc.city })}
                          placeholder="e.g. Spiti Valley"
                          theme="dark"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-slate-300 font-medium mb-1">Dates</label>
                      <div className="bg-[#071A2B] border border-white/15 rounded-xl px-3 py-1.5 focus-within:border-[#FF5A1F]">
                        <DatePicker
                          mode="range"
                          theme="dark"
                          label=""
                          placeholder="Select dates"
                          value={quickListForm.dates}
                          onChange={(dates) => {
                            if (dates?.start && dates?.end) {
                              setQuickListForm({ ...quickListForm, dates: `${dates.start} – ${dates.end}` });
                            }
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-medium mb-1">Max Travelers</label>
                      <input
                        type="number"
                        min="2"
                        max="30"
                        value={quickListForm.travelers}
                        onChange={(e) => setQuickListForm({ ...quickListForm, travelers: Number(e.target.value) })}
                        className="w-full bg-[#071A2B] border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#FF5A1F]"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-medium mb-1">Budget per person (₹)</label>
                      <input
                        type="number"
                        value={quickListForm.budget}
                        onChange={(e) => setQuickListForm({ ...quickListForm, budget: Number(e.target.value) })}
                        className="w-full bg-[#071A2B] border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#FF5A1F]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Trip Type</label>
                    <select
                      value={quickListForm.tripType}
                      onChange={(e) => setQuickListForm({ ...quickListForm, tripType: e.target.value })}
                      className="w-full bg-[#071A2B] border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#FF5A1F] cursor-pointer"
                    >
                      <option value="Trekking & High Altitude">Trekking & High Altitude</option>
                      <option value="Weekend Road Trip">Weekend Road Trip</option>
                      <option value="Cultural & Backpacking">Cultural & Backpacking</option>
                      <option value="Beach & Coastal Vibes">Beach & Coastal Vibes</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full btn-primary-cb !py-3 !text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#FF5A1F]/30"
                  >
                    <span>List My Trip</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. SMART TRIP PLANNER SHOWCASE (Dark Cinematic Section with Live Dashboard Mockup) */}
      <section className="py-20 bg-[#071A2B] text-white border-t border-white/10 relative">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
          <div className="max-w-3xl mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-[#FF5A1F] flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              Algorithmic Itinerary Engine
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white mt-1">
              Your Entire Trip. One Smart Plan.
            </h2>
            <p className="text-sm sm:text-base text-slate-300 mt-2 leading-relaxed">
              A clear itinerary, estimated budget, routes, stays and more — all in one place.
            </p>
            <div className="pt-4">
              <button
                onClick={() => navigate('plan-trip')}
                className="btn-primary-cb !py-3 !px-7 text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer shadow-lg shadow-[#FF5A1F]/30"
              >
                <span>Open Trip Planner</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Large Trip Dashboard Mockup matching Section 6 */}
          <div className="bg-[#0C2438] rounded-3xl border border-white/15 shadow-2xl overflow-hidden">
            {/* Mockup Header Bar */}
            <div className="p-5 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#071A2B]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#FF5A1F] flex items-center justify-center text-white font-bold">
                  🏔️
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-white">Trip: Manali Trip</h3>
                  <p className="text-xs text-slate-400">5 Days, 2 Travelers • Scenic & Adventure</p>
                </div>
              </div>

              {/* Mockup Tabs */}
              <div className="flex items-center gap-1 bg-[#0C2438] p-1 rounded-full border border-white/10 text-xs">
                {['overview', 'itinerary', 'stay', 'budget'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setPlannerMockTab(tab)}
                    className={`px-3 py-1 rounded-full capitalize font-semibold transition-all cursor-pointer ${
                      plannerMockTab === tab
                        ? 'bg-[#FF5A1F] text-white shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* 4 Quick Stat Metric Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-white/10 border-b border-white/10 bg-[#071A2B]/40 text-xs">
              <div className="p-4">
                <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <Wallet className="w-3.5 h-3.5 text-[#FF5A1F]" />
                  Total Budget
                </span>
                <p className="text-lg font-extrabold text-white mt-0.5">₹18,500</p>
                <p className="text-[10px] text-emerald-400">₹9,250 / person estimate</p>
              </div>

              <div className="p-4">
                <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <CloudSun className="w-3.5 h-3.5 text-amber-400" />
                  Weather
                </span>
                <p className="text-lg font-extrabold text-white mt-0.5">5°C – 12°C</p>
                <p className="text-[10px] text-slate-300">Crisp autumn sunshine</p>
              </div>

              <div className="p-4">
                <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <BedDouble className="w-3.5 h-3.5 text-sky-400" />
                  Stay Recommendation
                </span>
                <p className="text-sm font-bold text-white mt-0.5 truncate">The Himalayan Stay</p>
                <p className="text-[10px] text-slate-300">Old Manali Wooden Cottage</p>
              </div>

              <div className="p-4">
                <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <Route className="w-3.5 h-3.5 text-purple-400" />
                  Route Distance
                </span>
                <p className="text-lg font-extrabold text-white mt-0.5">540 km</p>
                <p className="text-[10px] text-slate-300">Overnight Volvo coach</p>
              </div>
            </div>

            {/* Mockup Interactive Content Area */}
            <div className="p-6">
              {plannerMockTab === 'itinerary' && (
                <div className="space-y-4">
                  <span className="text-xs font-bold text-[#FF5A1F] uppercase tracking-wider block">
                    Day-by-Day Interactive Timeline
                  </span>

                  <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-white/10">
                    {[
                      {
                        time: '06:00 PM',
                        title: 'Delhi → Manali Volvo Boarding',
                        desc: 'Depart from Majnu Ka Tilla with luxury reclining seats and mountain playlist.',
                      },
                      {
                        time: '09:30 PM',
                        title: 'Lunch / Dinner Stop at Murthal',
                        desc: 'World famous stuffed parathas with white makhan and steaming kadak chai.',
                      },
                      {
                        time: '08:00 AM',
                        title: 'Check-in at The Himalayan Stay',
                        desc: 'Fresh apple juice welcome in Old Manali, unpack and enjoy panoramic peak vistas.',
                      },
                      {
                        time: '01:00 PM',
                        title: 'Explore Mall Road & Hadimba Temple',
                        desc: 'Walk amidst ancient deodars, visit wooden pagoda shrine, and enjoy trout pizza.',
                      },
                      {
                        time: 'Next Day',
                        title: 'Solang Valley & Atal Tunnel to Sissu',
                        desc: 'Cross the 9.02 km tunnel into Lahaul snowfields and frozen waterfalls.',
                      },
                    ].map((step, idx) => (
                      <div key={idx} className="relative group">
                        <div className="absolute -left-[27px] top-1 w-3.5 h-3.5 rounded-full bg-[#FF5A1F] ring-4 ring-[#0C2438]" />
                        <div className="bg-[#071A2B] p-4 rounded-2xl border border-white/10 group-hover:border-white/25 transition-all">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="font-bold text-white text-sm">{step.title}</span>
                            <span className="text-[11px] text-[#FF5A1F] font-semibold">{step.time}</span>
                          </div>
                          <p className="text-xs text-slate-300">{step.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {plannerMockTab === 'overview' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="bg-[#071A2B] p-4 rounded-2xl border border-white/10 space-y-2">
                    <p className="font-bold text-white text-sm">Adventure Summary</p>
                    <p className="text-slate-300">
                      5-day journey from the bustling plains of Delhi through Chandigarh, Bilaspur, and Mandi into the alpine bowl of Kullu Valley.
                    </p>
                  </div>
                  <div className="bg-[#071A2B] p-4 rounded-2xl border border-white/10 space-y-2">
                    <p className="font-bold text-white text-sm">Packing Recommendation</p>
                    <p className="text-slate-300">
                      Temperatures drop to 5°C at night. Windproof fleece, thermal layers, and trekking boots recommended.
                    </p>
                  </div>
                </div>
              )}

              {plannerMockTab === 'budget' && (
                <div className="space-y-3 text-xs">
                  <p className="font-bold text-white text-sm">Budget Allocation Breakdown</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-[#071A2B] p-3 rounded-2xl border border-white/10">
                      <p className="text-slate-400">Stay (4 Nights)</p>
                      <p className="text-base font-bold text-white mt-1">₹7,500</p>
                      <p className="text-[10px] text-slate-500">40% of total</p>
                    </div>
                    <div className="bg-[#071A2B] p-3 rounded-2xl border border-white/10">
                      <p className="text-slate-400">Transport</p>
                      <p className="text-base font-bold text-white mt-1">₹5,200</p>
                      <p className="text-[10px] text-slate-500">28% of total</p>
                    </div>
                    <div className="bg-[#071A2B] p-3 rounded-2xl border border-white/10">
                      <p className="text-slate-400">Activities</p>
                      <p className="text-base font-bold text-white mt-1">₹3,300</p>
                      <p className="text-[10px] text-slate-500">18% of total</p>
                    </div>
                    <div className="bg-[#071A2B] p-3 rounded-2xl border border-white/10">
                      <p className="text-slate-400">Food & Cafes</p>
                      <p className="text-base font-bold text-white mt-1">₹2,500</p>
                      <p className="text-[10px] text-slate-500">14% of total</p>
                    </div>
                  </div>
                </div>
              )}

              {plannerMockTab === 'stay' && (
                <div className="bg-[#071A2B] p-4 rounded-2xl border border-white/10 flex flex-col sm:flex-row items-center gap-4 text-xs">
                  <img
                    src="https://images.unsplash.com/photo-1587061949409-02df41d5e562?auto=format&fit=crop&w=400&q=80"
                    alt="The Himalayan Stay"
                    className="w-full sm:w-36 h-24 rounded-xl object-cover"
                  />
                  <div className="flex-1 space-y-1">
                    <p className="text-base font-bold text-white">The Himalayan Stay</p>
                    <p className="text-slate-400">Old Manali, among apple orchards</p>
                    <p className="text-[#FF5A1F] font-bold">₹2,800 / night • 4.9★ (88 reviews)</p>
                  </div>
                  <button
                    onClick={() => navigate('stay-detail', { id: 'stay-himalayan-stay' })}
                    className="btn-primary-cb !py-2 !px-4 !text-xs cursor-pointer"
                  >
                    View Stay →
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 8. DESKTOP RIGHT-SIDE EDITORIAL CONTINUATION & REAL PEOPLE. REAL STORIES (Section 18 & 28) */}
      <section className="py-20 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Real People. Real Stories. */}
          <div className="lg:col-span-8 space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#FF5A1F] block">
                  Community Voices
                </span>
                <h2 className="text-2xl sm:text-4xl font-extrabold text-[#071A2B] mt-1">
                  Real People. Real Stories.
                </h2>
              </div>
              <button
                onClick={() => navigate('stories')}
                className="text-xs sm:text-sm font-bold text-[#FF5A1F] hover:underline cursor-pointer flex items-center gap-1"
              >
                <span>Read all stories</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {stories.slice(0, 2).map((story) => (
                <StoryCard key={story.id} story={story} />
              ))}
            </div>
          </div>

          {/* Right Column: Featured Stay Spotlight & Editorial Card (Section 28) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#FF5A1F] block">
                Stay of the Week
              </span>
              <button
                onClick={() => navigate('stays')}
                className="text-xs font-bold text-slate-500 hover:text-slate-800"
              >
                All stays →
              </button>
            </div>

            {stays[0] && <StayCard stay={stays[0]} />}

            {/* Editorial Highlight Banner */}
            <div className="bg-[#071A2B] p-6 rounded-3xl text-white space-y-3 border border-white/10 relative overflow-hidden">
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                ChaloBuddy Verified
              </span>
              <h3 className="font-bold text-base text-white">
                Find Your Travel Buddy
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Connect with verified solo travelers who share your dates and vibe. Never travel alone unless you want to.
              </p>
              <button
                onClick={() => navigate('buddies')}
                className="btn-primary-cb !py-2 !px-4 !text-xs font-bold flex items-center gap-1.5 cursor-pointer mt-2"
              >
                <span>Browse Buddies</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 9. FINAL ADVENTURE CTA */}
      <section className="py-20 bg-gradient-to-r from-[#FF5A1F] to-[#E04812] text-white text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 space-y-6">
          <span className="font-handwriting text-2xl text-amber-200 font-bold block rotate-[-2deg]">
            ✦ Pack your backpack, the mountains are calling
          </span>
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Ready for your next journey?
          </h2>
          <p className="text-base sm:text-lg text-white/90 max-w-xl mx-auto">
            Join thousands of travelers planning, discovering stays, and exploring the subcontinent together.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate('trips')}
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#071A2B] hover:bg-[#0C2438] text-white font-bold text-sm shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Explore All Trips</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate('list-trip')}
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-white hover:bg-slate-100 text-[#071A2B] font-bold text-sm shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Host a Group Trip</span>
              <ArrowRight className="w-4 h-4 text-[#FF5A1F]" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
