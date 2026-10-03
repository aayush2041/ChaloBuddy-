import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import LocationAutocomplete from '../components/LocationAutocomplete';
import DatePicker, { formatDate } from '../components/DatePicker';
import { DESTINATIONS_DATABASE } from '../data/destinationsData';
import {
  Sparkles,
  MapPin,
  Calendar,
  Users,
  Wallet,
  Compass,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Check,
  Plus,
  Minus,
  BedDouble,
  Car,
  Train,
  Plane,
  Bus,
  RotateCcw,
} from 'lucide-react';

const QUESTIONS = [
  { id: 1, title: 'Where To & From?', subtitle: 'Destination and starting location' },
  { id: 2, title: 'When Are You Travelling?', subtitle: 'Dates and duration' },
  { id: 3, title: 'Who Is Joining?', subtitle: 'Travelers and party size' },
  { id: 4, title: 'What Is Your Budget?', subtitle: 'Spending limit and flexibility' },
  { id: 5, title: 'Your Travel Style', subtitle: 'Vibe, interests and requirements' },
];

const TRAVEL_STYLES = [
  { id: 'Comfortable', label: 'Comfortable', icon: '✨' },
  { id: 'Budget', label: 'Budget', icon: '🏷️' },
  { id: 'Backpacking', label: 'Backpacking', icon: '🎒' },
  { id: 'Adventure', label: 'Adventure', icon: '🧗' },
  { id: 'Relaxed', label: 'Relaxed', icon: '☕' },
  { id: 'Family', label: 'Family', icon: '👨‍👩‍👧‍👦' },
  { id: 'Couple', label: 'Couple', icon: '❤️' },
  { id: 'Luxury', label: 'Luxury', icon: '👑' },
];

const ACCOMMODATIONS = [
  { id: 'Hostel', label: 'Hostel (Dorm Bed)', est: '₹650/bed', icon: BedDouble },
  { id: 'Budget Hotel', label: 'Budget Hotel', est: '₹1,600/room', icon: BedDouble },
  { id: 'Hotel', label: 'Boutique Hotel 3★', est: '₹3,200/room', icon: BedDouble },
  { id: 'Homestay', label: 'Local Homestay', est: '₹2,400/room', icon: BedDouble },
  { id: 'Resort', label: 'Nature Resort', est: '₹5,800/room', icon: BedDouble },
  { id: 'Premium', label: '5★ Luxury Resort', est: '₹8,500/room', icon: BedDouble },
];

const TRANSPORTS = [
  { id: 'Cheapest available', label: 'Cheapest (Auto-select)', icon: Wallet },
  { id: 'Train', label: 'Train (Express / 3AC)', icon: Train },
  { id: 'Bus', label: 'AC Volvo Coach', icon: Bus },
  { id: 'Car', label: 'Personal Car (Fuel + Tolls)', icon: Car },
  { id: 'Cab', label: 'Private Outstation Cab', icon: Car },
  { id: 'Flight', label: 'Domestic Flight', icon: Plane },
];

export default function PlanTripPage() {
  const { generatePlan, selectedLocation, setSelectedLocation } = useStore();

  const [currentStep, setCurrentStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);

  // Q1: Destination & Origin
  const [destinationObj, setDestinationObj] = useState(
    selectedLocation || {
      id: 'dehradun',
      city: 'Dehradun',
      state: 'Uttarakhand',
      country: 'India',
      fullName: 'Dehradun, Uttarakhand, India',
    }
  );
  const [destinationQuery, setDestinationQuery] = useState(
    selectedLocation ? selectedLocation.fullName : 'Dehradun, Uttarakhand, India'
  );

  const [originObj, setOriginObj] = useState({
    id: 'delhi',
    city: 'Delhi',
    state: 'NCT of Delhi',
    country: 'India',
    fullName: 'Delhi, NCT of Delhi, India',
  });
  const [originQuery, setOriginQuery] = useState('Delhi, NCT of Delhi, India');

  // Q2: Dates
  const [dates, setDates] = useState({
    start: '2026-10-15',
    end: '2026-10-18',
  });

  // Q3: Travelers
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);

  // Q4: Budget
  const [budgetAmount, setBudgetAmount] = useState(15000);
  const [budgetType, setBudgetType] = useState('person'); // 'person' | 'total'
  const [budgetFlexibility, setBudgetFlexibility] = useState('Moderate'); // 'Strict' | 'Moderate' | 'Flexible'

  // Q5: Style, Stay & Transit
  const [travelStyle, setTravelStyle] = useState('Comfortable');
  const [accommodationPreference] = useState('Smart-selected');
  const [intercityTransport] = useState('Smart-selected');
  const [localTransport] = useState('Smart-selected');
  const [interests, setInterests] = useState(['Sightseeing', 'Nature', 'Food & Cafes']);
  const [specialRequirements, setSpecialRequirements] = useState([]);

  // Calculate days & nights from dates
  const calculateDaysNights = () => {
    if (dates.start && dates.end) {
      const s = new Date(dates.start);
      const e = new Date(dates.end);
      if (!isNaN(s.getTime()) && !isNaN(e.getTime()) && e >= s) {
        const diffMs = e.getTime() - s.getTime();
        const d = Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)) + 1);
        const n = Math.max(1, d - 1);
        return { days: d, nights: n };
      }
    }
    return { days: 4, nights: 3 };
  };

  const { days, nights } = calculateDaysNights();
  const totalTravelers = adults + children;
  const recommendedRooms = Math.max(1, Math.ceil(adults / 2));

  const totalCalculatedTargetBudget =
    budgetType === 'person' ? budgetAmount * totalTravelers : budgetAmount;
  const perPersonTargetBudget =
    budgetType === 'person' ? budgetAmount : Math.round(budgetAmount / totalTravelers);

  const canProceed = () => {
    if (currentStep === 1) return destinationQuery.trim().length > 1 && originQuery.trim().length > 1 && Number(destinationObj?.lat) && Number(destinationObj?.lng) && Number(originObj?.lat) && Number(originObj?.lng);
    if (currentStep === 2) return Boolean(dates.start && dates.end);
    if (currentStep === 3) return adults >= 1;
    if (currentStep === 4) return budgetAmount >= 1000;
    return true;
  };

  const handleNext = () => {
    if (canProceed() && currentStep < 5) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 120, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 120, behavior: 'smooth' });
    }
  };

  const handleFinalGenerate = (e) => {
    if (e) e.preventDefault();
    setIsGenerating(true);

    const criteria = {
      destination: destinationObj?.fullName || destinationQuery,
      destinationObj,
      origin: originObj?.fullName || originQuery,
      originObj,
      startDate: dates.start,
      endDate: dates.end,
      days,
      nights,
      adults,
      children,
      infants: 0,
      travelers: totalTravelers,
      userBudget: budgetAmount,
      budget: budgetAmount,
      budgetType,
      budgetFlexibility,
      travelStyle: [travelStyle],
      accommodationPreference: 'Smart-selected',
      roomsRequired: null,
      intercityTransportPreference: 'Smart-selected',
      localTransportPreference: 'Smart-selected',
      interests,
      activityIntensity: travelStyle === 'Relaxed' ? 'Relaxed' : travelStyle === 'Adventure' ? 'Packed' : 'Balanced',
      specialRequirements,
    };

    setTimeout(() => {
      generatePlan(criteria).finally(() => setIsGenerating(false));
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#F5F7F8] pt-24 pb-28">
      {/* Top Banner */}
      <div className="bg-[#071A2B] text-white py-10 px-4 sm:px-6 lg:px-8 border-b border-white/10">
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF5A1F]/20 text-[#FF5A1F] text-xs font-bold border border-[#FF5A1F]/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Smart Trip Planner</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Plan Your Realistic Trip in 5 Simple Steps
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Answer 5 quick questions. We calculate real highway distances, stays, meal allowances, and realistic budgets down to the rupee.
          </p>

          {/* 5-Step Stepper Progress Bar */}
          <div className="pt-2 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-[#FF5A1F]">
                Question {currentStep} of 5:{' '}
                <span className="text-white font-medium">{QUESTIONS[currentStep - 1].title}</span>
              </span>
              <span className="text-slate-400 font-medium">{currentStep * 20}% Done</span>
            </div>
            <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#FF5A1F] h-full rounded-full transition-all duration-300"
                style={{ width: `${currentStep * 20}%` }}
              />
            </div>

            {/* Stepper Tabs */}
            <div className="grid grid-cols-5 gap-2 pt-2">
              {QUESTIONS.map((q) => {
                const isCurrent = q.id === currentStep;
                const isPassed = q.id < currentStep;
                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => {
                      if (q.id <= currentStep || canProceed()) setCurrentStep(q.id);
                    }}
                    className={`py-1.5 px-2 rounded-xl text-[11px] font-bold text-center transition-all cursor-pointer truncate ${
                      isCurrent
                        ? 'bg-[#FF5A1F] text-white shadow-md'
                        : isPassed
                        ? 'bg-white/15 text-slate-200 hover:bg-white/25'
                        : 'bg-white/5 text-slate-500'
                    }`}
                  >
                    {q.id}. {q.title.split(' ')[0]}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Main Questionnaire Box */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xl space-y-6">

          {/* QUESTION 1: WHERE TO & FROM? */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-1">
                <span className="text-xs font-bold text-[#FF5A1F] uppercase tracking-wider">Question 1 of 5</span>
                <h2 className="text-2xl font-black text-[#071A2B]">Where do you want to go & where are you starting from?</h2>
                <p className="text-xs text-slate-500">
                  Real location autocomplete. Both locations are required to compute realistic highway distances and transport routes.
                </p>
              </div>

              {/* Destination */}
              <div className="space-y-2">
                <LocationAutocomplete
                  value={destinationQuery}
                  onChange={(text, obj) => {
                    setDestinationQuery(text);
                    if (obj) setDestinationObj(obj);
                  }}
                  onSelectLocation={(locObj) => {
                    setDestinationObj(locObj);
                    setDestinationQuery(locObj.fullName);
                    setSelectedLocation(locObj);
                  }}
                  placeholder="Where to? (e.g. Dehradun, Manali, Goa, Jaipur)..."
                  label="DESTINATION CITY"
                  theme="light"
                  autoFocus
                />

                {/* Popular chips */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Popular:</span>
                  {['Dehradun', 'Manali', 'Goa', 'Jaipur', 'Spiti Valley'].map((cityName) => {
                    const match = DESTINATIONS_DATABASE.find((d) => d.city.toLowerCase() === cityName.toLowerCase());
                    return (
                      <button
                        key={cityName}
                        type="button"
                        onClick={() => {
                          if (match) {
                            setDestinationObj(match);
                            setDestinationQuery(match.fullName);
                            setSelectedLocation(match);
                          }
                        }}
                        className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 hover:bg-orange-50 hover:text-[#FF5A1F] border border-slate-200 transition-colors cursor-pointer"
                      >
                        📍 {cityName}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Origin */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <LocationAutocomplete
                  value={originQuery}
                  onChange={(text, obj) => {
                    setOriginQuery(text);
                    if (obj) setOriginObj(obj);
                  }}
                  onSelectLocation={(locObj) => {
                    setOriginObj(locObj);
                    setOriginQuery(locObj.fullName);
                  }}
                  placeholder="Travelling from? (e.g. New Delhi, Mumbai, Bengaluru)..."
                  label="STARTING LOCATION (ORIGIN)"
                  theme="light"
                />

                {/* Hub chips */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Starting Hubs:</span>
                  {['Delhi', 'Mumbai', 'Bengaluru', 'Chandigarh'].map((hubName) => {
                    const match = DESTINATIONS_DATABASE.find((d) => d.city.toLowerCase() === hubName.toLowerCase());
                    return (
                      <button
                        key={hubName}
                        type="button"
                        onClick={() => {
                          if (match) {
                            setOriginObj(match);
                            setOriginQuery(match.fullName);
                          }
                        }}
                        className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 hover:bg-orange-50 hover:text-[#FF5A1F] border border-slate-200 transition-colors cursor-pointer"
                      >
                        🚀 {hubName}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* QUESTION 2: WHEN ARE YOU TRAVELLING? */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-1">
                <span className="text-xs font-bold text-[#FF5A1F] uppercase tracking-wider">Question 2 of 5</span>
                <h2 className="text-2xl font-black text-[#071A2B]">When are you taking this trip?</h2>
                <p className="text-xs text-slate-500">
                  Select your departure and return dates. Number of days and nights is computed automatically.
                </p>
              </div>

              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
                <DatePicker
                  mode="range"
                  value={dates}
                  onChange={(newDates) => setDates(newDates)}
                  label="DEPARTURE & RETURN DATES"
                  placeholder="Pick date range"
                  theme="light"
                  minDate={new Date()}
                />

                <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 text-xs">
                  <div>
                    <span className="text-slate-400 font-semibold block">Trip Duration</span>
                    <span className="text-base font-black text-[#071A2B]">
                      {days} Days / {nights} Nights
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 font-semibold block">Travel Window</span>
                    <span className="text-xs font-bold text-[#FF5A1F]">
                      {formatDate(dates.start)} ➔ {formatDate(dates.end)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* QUESTION 3: WHO IS TRAVELLING? */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-1">
                <span className="text-xs font-bold text-[#FF5A1F] uppercase tracking-wider">Question 3 of 5</span>
                <h2 className="text-2xl font-black text-[#071A2B]">Who is joining the trip?</h2>
                <p className="text-xs text-slate-500">
                  We use traveler counts to determine tickets, meals, and room sizing (2 adults per room standard).
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Adults */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                  <div>
                    <h4 className="font-extrabold text-sm text-[#071A2B]">Adults</h4>
                    <p className="text-xs text-slate-500">Age 12+ years</p>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <button
                      type="button"
                      disabled={adults <= 1}
                      onClick={() => setAdults((prev) => Math.max(1, prev - 1))}
                      className="w-9 h-9 rounded-full bg-white border border-slate-300 flex items-center justify-center font-bold text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:border-[#FF5A1F] cursor-pointer"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-xl font-black text-[#071A2B]">{adults}</span>
                    <button
                      type="button"
                      onClick={() => setAdults((prev) => prev + 1)}
                      className="w-9 h-9 rounded-full bg-white border border-slate-300 flex items-center justify-center font-bold text-slate-700 hover:border-[#FF5A1F] cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Children */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                  <div>
                    <h4 className="font-extrabold text-sm text-[#071A2B]">Children</h4>
                    <p className="text-xs text-slate-500">Age 2–11 years</p>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <button
                      type="button"
                      disabled={children <= 0}
                      onClick={() => setChildren((prev) => Math.max(0, prev - 1))}
                      className="w-9 h-9 rounded-full bg-white border border-slate-300 flex items-center justify-center font-bold text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:border-[#FF5A1F] cursor-pointer"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-xl font-black text-[#071A2B]">{children}</span>
                    <button
                      type="button"
                      onClick={() => setChildren((prev) => prev + 1)}
                      className="w-9 h-9 rounded-full bg-white border border-slate-300 flex items-center justify-center font-bold text-slate-700 hover:border-[#FF5A1F] cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100 flex items-center justify-between text-xs">
                <span className="font-bold text-[#071A2B]">
                  Total Traveling Party: {totalTravelers} {totalTravelers === 1 ? 'Traveler' : 'Travelers'}
                </span>
                <span className="font-semibold text-[#FF5A1F]">
                  Allocating {recommendedRooms} Room{recommendedRooms > 1 ? 's' : ''} (2 adults/room)
                </span>
              </div>
            </div>
          )}

          {/* QUESTION 4: WHAT IS YOUR BUDGET? */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-1">
                <span className="text-xs font-bold text-[#FF5A1F] uppercase tracking-wider">Question 4 of 5</span>
                <h2 className="text-2xl font-black text-[#071A2B]">What is your target budget?</h2>
                <p className="text-xs text-slate-500">
                  Every number shown in the generated plan will stay aligned with your budget.
                </p>
              </div>

              {/* Per Person vs Total Toggle */}
              <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-100 rounded-2xl max-w-sm">
                <button
                  type="button"
                  onClick={() => setBudgetType('person')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    budgetType === 'person' ? 'bg-white text-[#FF5A1F] shadow-sm' : 'text-slate-500'
                  }`}
                >
                  Budget Per Person
                </button>
                <button
                  type="button"
                  onClick={() => setBudgetType('total')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    budgetType === 'total' ? 'bg-white text-[#FF5A1F] shadow-sm' : 'text-slate-500'
                  }`}
                >
                  Total Group Budget
                </button>
              </div>

              {/* Budget Amount Input */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700">
                  AMOUNT ({budgetType === 'person' ? '₹ / PERSON' : '₹ TOTAL TRIP'})
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    min="1000"
                    step="500"
                    value={budgetAmount}
                    onChange={(e) => setBudgetAmount(Number(e.target.value))}
                    className="w-full pl-9 pr-4 py-3.5 bg-slate-50 border border-slate-300 rounded-2xl text-lg font-extrabold text-[#071A2B] focus:border-[#FF5A1F] focus:outline-none"
                  />
                </div>
              </div>

              {/* Budget Presets */}
              <div className="flex flex-wrap gap-2">
                {(budgetType === 'person' ? [8000, 15000, 25000, 40000] : [25000, 50000, 80000, 120000]).map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setBudgetAmount(val)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                      budgetAmount === val
                        ? 'bg-[#FF5A1F] text-white border-[#FF5A1F]'
                        : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    ₹{val.toLocaleString('en-IN')}
                  </button>
                ))}
              </div>

              {/* Budget Flexibility */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="text-xs font-bold text-slate-700 block">BUDGET FLEXIBILITY</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'Strict', title: 'Strict (0%)', desc: 'Strict limit' },
                    { id: 'Moderate', title: 'Moderate (15%)', desc: 'Comfort buffer' },
                    { id: 'Flexible', title: 'Flexible (25%)', desc: 'Best experiences' },
                  ].map((flex) => (
                    <button
                      key={flex.id}
                      type="button"
                      onClick={() => setBudgetFlexibility(flex.id)}
                      className={`p-3 rounded-2xl text-left border transition-all cursor-pointer ${
                        budgetFlexibility === flex.id
                          ? 'bg-orange-50/50 border-[#FF5A1F] ring-1 ring-[#FF5A1F]'
                          : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <span className="font-bold text-xs text-[#071A2B] block">{flex.title}</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">{flex.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Total Calculation Display */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400 font-semibold block">Total Estimated Group Budget</span>
                  <span className="text-lg font-black text-[#071A2B]">
                    ₹{totalCalculatedTargetBudget.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 font-semibold block">Per Person Target</span>
                  <span className="text-sm font-extrabold text-[#FF5A1F]">
                    ₹{perPersonTargetBudget.toLocaleString('en-IN')}/person
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* QUESTION 5: STYLE, STAY & TRANSIT PREFERENCES */}
          {currentStep === 5 && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-1">
                <span className="text-xs font-bold text-[#FF5A1F] uppercase tracking-wider">Question 5 of 5 • Final Step</span>
                <h2 className="text-2xl font-black text-[#071A2B]">What kind of trip do you want?</h2>
                <p className="text-xs text-slate-500">
                  Tell us your travel style and interests. Smart Planner handles the transport and stay choices automatically.
                </p>
              </div>

              {/* Smart planning explanation */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-orange-50 to-white border border-orange-200">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FF5A1F] text-white flex items-center justify-center shrink-0"><Sparkles className="w-5 h-5" /></div>
                  <div>
                    <h3 className="font-black text-[#071A2B]">We'll choose the trip for you</h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">You don't need to choose trains, buses, cabs, hotels or stay tiers. Smart Planner compares practical options and builds the complete trip around your budget, dates, group size and interests.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="text-xs font-bold text-slate-700 block">WHAT DO YOU LIKE?</label>
                <div className="flex flex-wrap gap-2">
                  {['Nature', 'Adventure', 'Culture', 'History', 'Food & Cafes', 'Beaches', 'Nightlife', 'Shopping', 'Photography', 'Spiritual'].map((interest) => {
                    const active = interests.includes(interest);
                    return <button key={interest} type="button" onClick={() => setInterests((prev) => active ? prev.filter((x) => x !== interest) : [...prev, interest])}
                      className={`px-3 py-2 rounded-full text-xs font-bold border transition-all cursor-pointer ${active ? 'bg-[#FF5A1F] text-white border-[#FF5A1F]' : 'bg-white text-slate-600 border-slate-200 hover:border-[#FF5A1F]'}`}>{interest}</button>;
                  })}
                </div>
                <p className="text-[10px] text-slate-400">These preferences guide activity selection and trip pacing.</p>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="text-xs font-bold text-slate-700 block">SPECIAL REQUIREMENTS</label>
                <div className="flex flex-wrap gap-2">
                  {['Vegetarian food', 'Senior-friendly', 'Child-friendly', 'Avoid long hikes', 'Accessibility needs'].map((item) => {
                    const active = specialRequirements.includes(item);
                    return <button key={item} type="button" onClick={() => setSpecialRequirements((prev) => active ? prev.filter((x) => x !== item) : [...prev, item])}
                      className={`px-3 py-2 rounded-full text-xs font-bold border transition-all cursor-pointer ${active ? 'bg-orange-50 text-[#FF5A1F] border-[#FF5A1F]' : 'bg-white text-slate-600 border-slate-200 hover:border-[#FF5A1F]'}`}>{item}</button>;
                  })}
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
                <div className="font-bold text-[#071A2B]">Smart Planner will automatically optimize:</div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 text-slate-600">
                  <span>🚆 Intercity transit</span><span>🏨 Accommodation</span><span>🚕 Local transport</span><span>💰 Activities & budget</span>
                </div>
              </div>

              {/* Ready Summary Card */}
              <div className="p-4 bg-orange-50 rounded-2xl border border-orange-200 text-xs space-y-1">
                <span className="font-extrabold text-[#071A2B] block">Summary of your inputs:</span>
                <p className="text-slate-600">
                  📍 {originObj.city} ➔ {destinationObj.city} • 📅 {days} Days / {nights} Nights • 👥 {totalTravelers} Travelers ({recommendedRooms} Room{recommendedRooms > 1 ? 's' : ''})
                </p>
                <p className="text-slate-600">
                  💰 Budget: ₹{totalCalculatedTargetBudget.toLocaleString('en-IN')} (₹{perPersonTargetBudget.toLocaleString('en-IN')}/person) • ✨ Transport & stay: Automatically optimized
                </p>
              </div>
            </div>
          )}

          {/* Navigation Buttons: Back / Continue / Final Generate */}
          <div className="pt-6 border-t border-slate-100 flex items-center justify-between gap-4">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="btn-secondary-cb !py-2.5 !px-5 !text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : (
              <div />
            )}

            {currentStep < 5 ? (
              <button
                type="button"
                disabled={!canProceed()}
                onClick={handleNext}
                className="btn-primary-cb !py-2.5 !px-6 !text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-[#FF5A1F]/30"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                disabled={isGenerating}
                onClick={handleFinalGenerate}
                className="btn-primary-cb !py-3 !px-8 !text-sm font-extrabold flex items-center gap-2 cursor-pointer shadow-lg shadow-[#FF5A1F]/30"
              >
                {isGenerating ? (
                  <>
                    <RotateCcw className="w-4 h-4 animate-spin" />
                    <span>Calculating Realistic Plan...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate My Smart Trip Plan →</span>
                  </>
                )}
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
