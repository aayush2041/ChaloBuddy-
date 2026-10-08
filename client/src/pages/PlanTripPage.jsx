import React, { useState, useRef } from 'react';
import { useStore } from '../context/StoreContext';
import LocationAutocomplete from '../components/LocationAutocomplete';
import DatePicker, { formatDate, parseDate, toISODateString } from '../components/DatePicker';
import { resolveLocation } from '../services/locationService';
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
  Loader2,
  AlertCircle,
  ShieldAlert,
  HelpCircle,
  RotateCcw,
} from 'lucide-react';

const STEPS = [
  { id: 1, name: 'From', title: 'Starting Location', subtitle: 'Where will your journey begin?' },
  { id: 2, name: 'Destination', title: 'Trip Destination', subtitle: 'Where do you want to explore?' },
  { id: 3, name: 'Dates', title: 'Travel Dates', subtitle: 'When are you traveling?' },
  { id: 4, name: 'Budget', title: 'Total Budget', subtitle: 'What is your total spending limit?' },
  { id: 5, name: 'People', title: 'Number of Travelers', subtitle: 'How many people are going?' },
  { id: 6, name: 'Generate', title: 'Review & Generate Plan', subtitle: 'Review criteria and let AI plan your trip.' },
];

export default function PlanTripPage() {
  const { generatePlan, selectedLocation, formatPrice } = useStore();

  const [currentStep, setCurrentStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [stepError, setStepError] = useState('');
  const [plannerError, setPlannerError] = useState('');

  // Step 1: Starting Location
  const defaultOrigin = resolveLocation('delhi');
  const [originQuery, setOriginQuery] = useState(defaultOrigin.fullName);
  const [originObj, setOriginObj] = useState(defaultOrigin);

  // Step 2: Destination
  const defaultDest = resolveLocation(selectedLocation || 'manali');
  const [destinationQuery, setDestinationQuery] = useState(defaultDest.fullName);
  const [destinationObj, setDestinationObj] = useState(defaultDest);

  // Step 3: Dates
  const [dates, setDates] = useState({
    start: '2026-10-15',
    end: '2026-10-18',
  });

  // Step 4: Budget (Source of Truth)
  const [budgetAmount, setBudgetAmount] = useState(25000);

  // Step 5: People / Travelers
  const [travelersCount, setTravelersCount] = useState(2);

  const datePickerRef = useRef(null);

  // Compute days & nights
  const calculateDaysNights = () => {
    if (dates.start && dates.end) {
      const s = parseDate(dates.start);
      const e = parseDate(dates.end);
      if (s && e && e >= s) {
        const diffMs = e.getTime() - s.getTime();
        const d = Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)) + 1);
        const n = Math.max(1, d - 1);
        return { days: d, nights: n };
      }
    }
    return { days: 4, nights: 3 };
  };

  const { days, nights } = calculateDaysNights();
  const perPersonBudget = Math.round(budgetAmount / Math.max(1, travelersCount));

  // Validation per step
  const validateCurrentStep = () => {
    setStepError('');
    if (currentStep === 1) {
      if (!originQuery || !originQuery.trim()) {
        setStepError('Please enter a starting location.');
        return false;
      }
      return true;
    }
    if (currentStep === 2) {
      if (!destinationQuery || !destinationQuery.trim()) {
        setStepError('Please enter a destination.');
        return false;
      }
      const cleanOrigin = originQuery.split(',')[0].trim().toLowerCase();
      const cleanDest = destinationQuery.split(',')[0].trim().toLowerCase();
      if (cleanOrigin === cleanDest) {
        setStepError('Starting location and destination cannot be identical.');
        return false;
      }
      return true;
    }
    if (currentStep === 3) {
      if (!dates.start || !dates.end) {
        setStepError('Please select both departure and return travel dates.');
        return false;
      }
      return true;
    }
    if (currentStep === 4) {
      const b = Number(budgetAmount);
      if (isNaN(b) || b < 1000) {
        setStepError('Please enter a valid trip budget (minimum ₹1,000).');
        return false;
      }
      return true;
    }
    if (currentStep === 5) {
      const p = Number(travelersCount);
      if (isNaN(p) || p < 1 || p > 25) {
        setStepError('Number of travelers must be between 1 and 25.');
        return false;
      }
      return true;
    }
    return true;
  };

  const handleNext = () => {
    if (!validateCurrentStep()) return;
    if (currentStep < 6) {
      setCurrentStep((prev) => prev + 1);
      setStepError('');
      window.scrollTo({ top: 120, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    setStepError('');
    setPlannerError('');
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 120, behavior: 'smooth' });
    }
  };

  const handleFinalGenerate = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (isGenerating) return; // Prevent duplicate requests

    if (!validateCurrentStep()) return;

    setIsGenerating(true);
    setPlannerError('');

    const resolvedOrigin = resolveLocation(originQuery || originObj);
    const resolvedDest = resolveLocation(destinationQuery || destinationObj);

    const criteria = {
      origin: resolvedOrigin.fullName || originQuery,
      originObj: resolvedOrigin,
      destination: resolvedDest.fullName || destinationQuery,
      destinationObj: resolvedDest,
      startDate: dates.start,
      endDate: dates.end,
      days,
      nights,
      travelers: travelersCount,
      adults: travelersCount,
      children: 0,
      userBudget: Number(budgetAmount),
      budget: Number(budgetAmount),
      budgetType: 'total', // Source of truth is total trip budget
    };

    try {
      await generatePlan(criteria);
    } catch (err) {
      console.error('Smart Planner generation error:', err);
      setPlannerError(
        err?.message ||
        'We could not generate the trip plan. Please verify the locations or adjust your constraints, then try again.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7F8] pt-24 pb-28 text-[#071A2B]">
      {/* Top Banner */}
      <section className="bg-[#071A2B] text-white py-10 px-4 sm:px-6 lg:px-8 border-b border-white/10">
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF5A1F]/20 text-[#FF5A1F] text-xs font-bold border border-[#FF5A1F]/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Smart Trip Planner</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Plan Your Realistic Trip in 6 Simple Steps
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Give us your destination, dates, party size, and total budget. Our planner calculates real routes, stays, meals, and day-by-day itineraries that respect your budget.
          </p>

          {/* Simple Progress Indicator */}
          <div className="pt-3 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-[#FF5A1F]">
                Step {currentStep} of 6:{' '}
                <span className="text-white font-medium">{STEPS[currentStep - 1].title}</span>
              </span>
              <span className="text-slate-400 font-medium">
                {Math.round((currentStep / 6) * 100)}% Complete
              </span>
            </div>

            {/* Progress Bar Line */}
            <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#FF5A1F] h-full rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / 6) * 100}%` }}
              />
            </div>

            {/* Stepper Steps Row: Desktop */}
            <div className="hidden sm:grid sm:grid-cols-6 gap-1.5 pt-2">
              {STEPS.map((s) => {
                const isCurrent = s.id === currentStep;
                const isCompleted = s.id < currentStep;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      if (s.id < currentStep) {
                        setCurrentStep(s.id);
                        setStepError('');
                      }
                    }}
                    disabled={s.id > currentStep}
                    className={`py-1.5 px-1 rounded-xl text-[11px] font-bold text-center transition-all cursor-pointer truncate ${
                      isCurrent
                        ? 'bg-[#FF5A1F] text-white shadow-md'
                        : isCompleted
                        ? 'bg-white/15 text-slate-200 hover:bg-white/25 cursor-pointer'
                        : 'bg-white/5 text-slate-500 cursor-not-allowed opacity-50'
                    }`}
                  >
                    {s.id}. {s.name}
                  </button>
                );
              })}
            </div>

            {/* Stepper Steps Row: Mobile 6-Step Compact Indicator */}
            <div className="flex sm:hidden items-center justify-between gap-1.5 pt-2">
              {STEPS.map((s) => {
                const isCurrent = s.id === currentStep;
                const isCompleted = s.id < currentStep;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      if (s.id < currentStep) {
                        setCurrentStep(s.id);
                        setStepError('');
                      }
                    }}
                    disabled={s.id > currentStep}
                    className={`flex-1 py-1.5 px-0.5 rounded-lg text-xs font-black text-center transition-all cursor-pointer ${
                      isCurrent
                        ? 'bg-[#FF5A1F] text-white shadow-md'
                        : isCompleted
                        ? 'bg-white/20 text-slate-200 cursor-pointer'
                        : 'bg-white/5 text-slate-600 opacity-40 cursor-not-allowed'
                    }`}
                    title={s.title}
                  >
                    {isCompleted ? '✓' : s.id}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Main Questionnaire Box */}
      <main className="max-w-3xl mx-auto px-3 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        <div className="bg-white rounded-3xl p-5 sm:p-10 border border-slate-200 shadow-xl space-y-6">

          {/* Step Error Notice */}
          {stepError && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{stepError}</span>
            </div>
          )}

          {/* Global Planner Failure Notice */}
          {plannerError && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Unable to generate trip plan</span>
              </div>
              <p className="text-slate-600 leading-relaxed">{plannerError}</p>
              <button
                type="button"
                onClick={handleFinalGenerate}
                disabled={isGenerating}
                className="btn-primary-cb !py-1.5 !px-3 !text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retry Generation</span>
              </button>
            </div>
          )}

          {/* ================= STEP 1: FROM ================= */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-1">
                <span className="text-xs font-bold text-[#FF5A1F] uppercase tracking-wider">
                  Step 1 of 6
                </span>
                <h2 className="text-2xl font-black text-[#071A2B]">Where are you starting from?</h2>
                <p className="text-xs text-slate-500">
                  Enter your origin city or airport hub to calculate realistic transit routes and distances.
                </p>
              </div>

              <div className="p-3 rounded-2xl border bg-slate-50 border-slate-200 focus-within:border-[#FF5A1F] focus-within:bg-white transition-all">
                <LocationAutocomplete
                  value={originQuery}
                  inputTestId="planner-from-input"
                  onChange={(text, matchedLoc) => {
                    setOriginQuery(text);
                    if (matchedLoc) setOriginObj(matchedLoc);
                    else if (text.trim().length > 1) setOriginObj(resolveLocation(text));
                    setStepError('');
                  }}
                  onSelectLocation={(loc) => {
                    const text = loc.fullName || loc.city;
                    setOriginQuery(text);
                    setOriginObj(loc);
                    setStepError('');
                  }}
                  placeholder="e.g. Delhi, Mumbai, Bengaluru..."
                  theme="light"
                  autoFocus
                />
              </div>

              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between pt-4 border-t border-slate-100 gap-3">
                <span className="text-xs text-slate-400 text-center sm:text-left">Step 1 of 6</span>
                <button
                  type="button"
                  onClick={handleNext}
                  data-testid="planner-next-btn"
                  className="btn-primary-cb !py-3.5 sm:!py-3 !px-7 !text-xs font-bold flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto"
                >
                  <span>Next: Destination</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ================= STEP 2: DESTINATION ================= */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-1">
                <span className="text-xs font-bold text-[#FF5A1F] uppercase tracking-wider">
                  Step 2 of 6
                </span>
                <h2 className="text-2xl font-black text-[#071A2B]">Where do you want to travel to?</h2>
                <p className="text-xs text-slate-500">
                  Enter any domestic or international destination. We evaluate attractions, stays, and weather.
                </p>
              </div>

              <div className="p-3 rounded-2xl border bg-slate-50 border-slate-200 focus-within:border-[#FF5A1F] focus-within:bg-white transition-all">
                <LocationAutocomplete
                  value={destinationQuery}
                  inputTestId="planner-to-input"
                  onChange={(text, matchedLoc) => {
                    setDestinationQuery(text);
                    if (matchedLoc) setDestinationObj(matchedLoc);
                    else if (text.trim().length > 1) setDestinationObj(resolveLocation(text));
                    setStepError('');
                  }}
                  onSelectLocation={(loc) => {
                    const text = loc.fullName || loc.city;
                    setDestinationQuery(text);
                    setDestinationObj(loc);
                    setStepError('');
                  }}
                  placeholder="e.g. Manali, Goa, Spiti, Dubai, Paris..."
                  theme="light"
                  autoFocus
                />
              </div>

              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between pt-4 border-t border-slate-100 gap-3">
                <button
                  type="button"
                  onClick={handleBack}
                  data-testid="planner-back-btn"
                  className="btn-secondary-cb !py-3 !px-5 !text-xs font-bold flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  data-testid="planner-next-btn"
                  className="btn-primary-cb !py-3.5 sm:!py-3 !px-7 !text-xs font-bold flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto"
                >
                  <span>Next: Travel Dates</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ================= STEP 3: DATES ================= */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-1">
                <span className="text-xs font-bold text-[#FF5A1F] uppercase tracking-wider">
                  Step 3 of 6
                </span>
                <h2 className="text-2xl font-black text-[#071A2B]">When are you traveling?</h2>
                <p className="text-xs text-slate-500">
                  Select your journey start and return dates. We will build a realistic day-by-day itinerary.
                </p>
              </div>

              <div
                className="p-3 rounded-2xl border bg-slate-50 border-slate-200 hover:border-slate-300 transition-all cursor-pointer flex items-center gap-2.5"
                onClick={() => {
                  datePickerRef.current?.open();
                }}
              >
                <Calendar className="w-4 h-4 text-[#FF5A1F] shrink-0" />
                <div className="flex-1 min-w-0" onClick={(e) => e.stopPropagation()}>
                  <DatePicker
                    ref={datePickerRef}
                    mode="range"
                    theme="light"
                    label=""
                    placeholder="Select travel dates"
                    value={dates}
                    onChange={(val) => {
                      if (val && typeof val === 'object') {
                        setDates({
                          start: val.startDateStr || (val.startDate ? toISODateString(val.startDate) : val.start),
                          end: val.endDateStr || (val.endDate ? toISODateString(val.endDate) : val.end),
                        });
                        setStepError('');
                      }
                    }}
                    minDate={new Date()}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Trip Duration Summary Pill */}
              <div className="p-4 rounded-2xl bg-orange-50/70 border border-orange-200/60 flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium">Calculated trip duration:</span>
                <span className="font-extrabold text-[#FF5A1F]">
                  {days} Days / {nights} Nights
                </span>
              </div>

              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between pt-4 border-t border-slate-100 gap-3">
                <button
                  type="button"
                  onClick={handleBack}
                  data-testid="planner-back-btn"
                  className="btn-secondary-cb !py-3 !px-5 !text-xs font-bold flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  data-testid="planner-next-btn"
                  className="btn-primary-cb !py-3.5 sm:!py-3 !px-7 !text-xs font-bold flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto"
                >
                  <span>Next: Budget</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ================= STEP 4: BUDGET ================= */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-1">
                <span className="text-xs font-bold text-[#FF5A1F] uppercase tracking-wider">
                  Step 4 of 6
                </span>
                <h2 className="text-2xl font-black text-[#071A2B]">What is your total trip budget?</h2>
                <p className="text-xs text-slate-500">
                  Your entered budget is the source of truth. We will never overwrite it with random amounts.
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl border bg-slate-50 border-slate-200 focus-within:border-[#FF5A1F] focus-within:bg-white transition-all flex items-center gap-3">
                  <span className="text-slate-400 font-bold text-lg">₹</span>
                  <input
                    type="number"
                    min="1000"
                    step="500"
                    data-testid="planner-budget-input"
                    value={budgetAmount}
                    onChange={(e) => {
                      setBudgetAmount(Number(e.target.value) || 0);
                      setStepError('');
                    }}
                    placeholder="e.g. 25000"
                    className="w-full bg-transparent text-lg font-black text-[#071A2B] focus:outline-none"
                    autoFocus
                  />
                </div>

                {/* Quick Budget Chips */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-[11px] font-bold text-slate-400">Quick presets:</span>
                  {[10000, 20000, 35000, 50000, 80000, 150000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setBudgetAmount(amt)}
                      className={`px-3 py-1 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                        budgetAmount === amt
                          ? 'bg-[#FF5A1F] text-white border-[#FF5A1F]'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      ₹{amt.toLocaleString('en-IN')}
                    </button>
                  ))}
                </div>

                <p className="text-[11px] text-slate-500">
                  Equivalent to <strong>₹{perPersonBudget.toLocaleString('en-IN')} / person</strong> for {travelersCount} {travelersCount === 1 ? 'traveler' : 'travelers'}.
                </p>
              </div>

              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between pt-4 border-t border-slate-100 gap-3">
                <button
                  type="button"
                  onClick={handleBack}
                  data-testid="planner-back-btn"
                  className="btn-secondary-cb !py-3 !px-5 !text-xs font-bold flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  data-testid="planner-next-btn"
                  className="btn-primary-cb !py-3.5 sm:!py-3 !px-7 !text-xs font-bold flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto"
                >
                  <span>Next: People</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ================= STEP 5: PEOPLE ================= */}
          {currentStep === 5 && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-1">
                <span className="text-xs font-bold text-[#FF5A1F] uppercase tracking-wider">
                  Step 5 of 6
                </span>
                <h2 className="text-2xl font-black text-[#071A2B]">How many people are traveling?</h2>
                <p className="text-xs text-slate-500">
                  We use party size to calculate room allocation, vehicle capacities, and meal portions.
                </p>
              </div>

              {/* People Stepper */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-sm font-bold text-[#071A2B] block">Total Travelers</span>
                  <span className="text-xs text-slate-500">Adults and children joining this journey</span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    aria-label="Decrease travelers"
                    disabled={travelersCount <= 1}
                    onClick={() => setTravelersCount((prev) => Math.max(1, prev - 1))}
                    className="w-10 h-10 rounded-2xl bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-40 text-slate-800 font-black flex items-center justify-center transition-all cursor-pointer shadow-sm text-base"
                  >
                    –
                  </button>
                  <span
                    data-testid="planner-people-count"
                    className="w-8 text-center text-lg font-black text-[#071A2B]"
                  >
                    {travelersCount}
                  </span>
                  <button
                    type="button"
                    aria-label="Increase travelers"
                    disabled={travelersCount >= 25}
                    onClick={() => setTravelersCount((prev) => Math.min(25, prev + 1))}
                    className="w-10 h-10 rounded-2xl bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-40 text-slate-800 font-black flex items-center justify-center transition-all cursor-pointer shadow-sm text-base"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-orange-50/70 border border-orange-200/60 text-xs text-slate-700 flex items-center justify-between">
                <span>Calculated per-person budget:</span>
                <span className="font-extrabold text-[#FF5A1F]">
                  ₹{perPersonBudget.toLocaleString('en-IN')} / person
                </span>
              </div>

              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between pt-4 border-t border-slate-100 gap-3">
                <button
                  type="button"
                  onClick={handleBack}
                  data-testid="planner-back-btn"
                  className="btn-secondary-cb !py-3 !px-5 !text-xs font-bold flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  data-testid="planner-next-btn"
                  className="btn-primary-cb !py-3.5 sm:!py-3 !px-7 !text-xs font-bold flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto"
                >
                  <span>Next: Review &amp; Plan</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ================= STEP 6: GENERATE PLAN ================= */}
          {currentStep === 6 && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-1">
                <span className="text-xs font-bold text-[#FF5A1F] uppercase tracking-wider">
                  Step 6 of 6
                </span>
                <h2 className="text-2xl font-black text-[#071A2B]">Review &amp; Generate Your Smart Plan</h2>
                <p className="text-xs text-slate-500">
                  Review your confirmed travel criteria below. The planner will automatically choose optimal transit, accommodation, and daily activities.
                </p>
              </div>

              {/* Criteria Summary Review Card */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3 text-xs">
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="text-slate-500">Route:</span>
                  <span className="font-bold text-[#071A2B]">
                    {originQuery.split(',')[0]} ➔ {destinationQuery.split(',')[0]}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="text-slate-500">Dates &amp; Duration:</span>
                  <span className="font-bold text-[#071A2B]">
                    {dates.start} to {dates.end} ({days} Days / {nights} Nights)
                  </span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="text-slate-500">Travelers:</span>
                  <span className="font-bold text-[#071A2B]">
                    {travelersCount} {travelersCount === 1 ? 'Traveler' : 'Travelers'}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="text-slate-500">Entered Total Budget:</span>
                  <span className="font-black text-[#FF5A1F] text-sm">
                    ₹{Number(budgetAmount).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-500">
                  <span>Per-person allocation:</span>
                  <span className="font-bold text-slate-700">
                    ₹{perPersonBudget.toLocaleString('en-IN')} / person
                  </span>
                </div>
              </div>

              {/* Engine Intelligence Notice */}
              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/70 text-xs text-blue-900 flex items-start gap-3">
                <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold">Automated Intelligent Decisions</p>
                  <p className="text-blue-800 leading-relaxed text-[11px]">
                    No need to guess transport modes or hotel categories. We allocate your budget across Transportation, Accommodation, Food, Local Commute, Activities, and Miscellaneous expenses based on realistic market rates.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between pt-4 border-t border-slate-100 gap-3">
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={isGenerating}
                  data-testid="planner-back-btn"
                  className="btn-secondary-cb !py-3 !px-5 !text-xs font-bold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 w-full sm:w-auto"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>

                <button
                  type="button"
                  onClick={handleFinalGenerate}
                  disabled={isGenerating}
                  data-testid="planner-generate-btn"
                  className="btn-primary-cb !py-3.5 !px-8 !text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#FF5A1F]/30 disabled:opacity-75 w-full sm:w-auto"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Intelligently Generating Plan...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Generate Smart Plan</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
