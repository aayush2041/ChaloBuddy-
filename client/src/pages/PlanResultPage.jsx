import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import {
  Sparkles,
  MapPin,
  Calendar,
  Wallet,
  Users,
  Route,
  CloudSun,
  BedDouble,
  Clock,
  Plus,
  Trash2,
  RefreshCw,
  Share2,
  Save,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ChevronDown,
  Car,
  Train,
  Plane,
  Bus,
  ShieldCheck,
  Utensils,
  Compass,
  Edit3,
  X,
  Info,
  Check,
  Sunrise,
  Sun,
  Sunset,
} from 'lucide-react';

export default function PlanResultPage() {
  const {
    smartPlan,
    generatePlan,
    saveGeneratedPlan,
    formatPrice,
    setShareModalData,
    addToast,
    navigate,
  } = useStore();

  const [activeTab, setActiveTab] = useState('itinerary'); // 'itinerary' | 'budget' | 'stay' | 'transport'
  const [showEditModal, setShowEditModal] = useState(false);

  // Edit Constraints state
  const [editBudget, setEditBudget] = useState(smartPlan?.userTargetBudget || 25000);
  const [editTravelers, setEditTravelers] = useState(smartPlan?.travelers || 2);

  if (!smartPlan) {
    return (
      <div className="min-h-screen bg-[#F5F7F8] pt-32 text-center p-8 text-[#071A2B]">
        <div className="max-w-md mx-auto bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <Compass className="w-10 h-10 text-[#FF5A1F] mx-auto" />
          <h2 className="text-xl font-black text-[#071A2B]">No Generated Plan Found</h2>
          <p className="text-xs text-slate-500">
            Create a realistic, budget-verified trip plan using the Smart Trip Planner.
          </p>
          <button
            onClick={() => navigate('plan-trip')}
            className="btn-primary-cb !text-xs !py-2.5 !px-6 cursor-pointer"
          >
            Create New Trip Plan
          </button>
        </div>
      </div>
    );
  }

  const handleSavePlan = () => {
    if (!smartPlan) return;
    saveGeneratedPlan(smartPlan);
    navigate('my-trips', { tab: 'saved' });
  };

  const handleApplyEditConstraints = (e) => {
    e.preventDefault();
    const updatedCriteria = {
      ...(smartPlan.criteria || {}),
      userBudget: Number(editBudget),
      budget: Number(editBudget),
      budgetType: 'total',
      travelers: Number(editTravelers),
      adults: Number(editTravelers),
    };

    generatePlan(updatedCriteria);
    setShowEditModal(false);
    addToast('Plan recalculated with your updated travel criteria!', 'success');
  };

  const isOverBudget = Boolean(smartPlan.isOverBudget);
  const shortfallTotal = Number(smartPlan.shortfallTotal) || 0;
  const shortfallPerPerson = Number(smartPlan.shortfallPerPerson) || 0;
  const remainingBudget = Number(smartPlan.remainingBudget) || 0;
  const userBudget = Number(smartPlan.userTargetBudget) || 0;
  const totalCost = Number(smartPlan.totalBudget) || 0;

  // Breakdown items (strictly 6 items)
  const breakdown = smartPlan.budgetBreakdown || [];

  return (
    <div className="min-h-screen bg-[#F5F7F8] pt-24 pb-28 text-[#071A2B]">
      {/* 1. TOP HEADER BANNER */}
      <section className="bg-[#071A2B] text-white py-10 px-4 sm:px-6 lg:px-8 border-b border-white/10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-semibold text-slate-200">
              <Sparkles className="w-3.5 h-3.5 text-[#FF5A1F]" />
              <span>Smart Itinerary</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white">
              {smartPlan.tripTitle}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              {smartPlan.originCity ? `${smartPlan.originCity} ➔ ` : ''}
              {smartPlan.destination} • {smartPlan.duration} • {smartPlan.travelers} {smartPlan.travelers === 1 ? 'Traveler' : 'Travelers'}
            </p>
          </div>

          {/* Action CTAs: Edit, Share, Save */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setShowEditModal(true)}
              className="flex-1 sm:flex-initial btn-secondary-cb !bg-white/10 !text-white !border-white/20 hover:!bg-white/20 !py-2.5 sm:!py-2 !px-3.5 !text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5 text-amber-400" />
              <span>Edit Budget</span>
            </button>

            <button
              onClick={() =>
                setShareModalData({
                  title: smartPlan.tripTitle,
                  url: window.location.href,
                })
              }
              className="btn-secondary-cb !bg-white/10 !text-white !border-white/20 hover:!bg-white/20 !py-2.5 sm:!py-2 !px-3.5 !text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share</span>
            </button>

            <button
              onClick={handleSavePlan}
              className="flex-1 sm:flex-initial btn-primary-cb !py-2.5 sm:!py-2 !px-5 !text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-[#FF5A1F]/30"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Plan</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. MAIN RESULTS CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">

        {/* IMPOSSIBLE / SHORTFALL BUDGET ALERT (PROMPT REQUIREMENT) */}
        {isOverBudget && (
          <div
            data-testid="planner-overbudget-alert"
            className="bg-amber-500/10 border-2 border-amber-500/40 rounded-3xl p-6 text-[#071A2B] space-y-4"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-500 text-white rounded-xl shrink-0 mt-0.5">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-black text-base sm:text-lg text-amber-950">
                  {smartPlan.optimization?.explanation ||
                    `This trip is unlikely to fit within ₹${userBudget.toLocaleString('en-IN')} for ${smartPlan.travelers} ${smartPlan.travelers === 1 ? 'person' : 'people'}.`}
                </h3>
                <p className="text-xs text-amber-900 leading-relaxed">
                  The minimum realistic cost for this journey is{' '}
                  <strong className="text-[#071A2B]">₹{totalCost.toLocaleString('en-IN')}</strong> (₹{Math.round(totalCost / smartPlan.travelers).toLocaleString('en-IN')}/person), creating a shortfall of{' '}
                  <span className="font-extrabold text-rose-600">
                    ₹{shortfallTotal.toLocaleString('en-IN')} (₹{shortfallPerPerson.toLocaleString('en-IN')}/person)
                  </span>. We do not fabricate cheap, unrealistic itineraries.
                </p>
              </div>
            </div>

            {/* Realistic Options List (Prompt Requirement) */}
            <div className="bg-white/90 p-5 rounded-2xl border border-amber-300 space-y-2 text-xs">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-amber-600" />
                Realistic options to make this trip work:
              </span>
              <ul className="space-y-1.5 text-slate-700 pl-5 list-disc">
                {(smartPlan.optimization?.actionableOptions && smartPlan.optimization.actionableOptions.length > 0
                  ? smartPlan.optimization.actionableOptions
                  : [
                      `Reduce number of days to lower lodging and meal expenses.`,
                      `Increase budget to at least ₹${totalCost.toLocaleString('en-IN')} to cover realistic expenses.`,
                      `Choose cheaper transport (e.g. Sleeper Train or AC Bus instead of Flights/Private Cabs).`,
                      `Choose cheaper accommodation (e.g. Hostels or Budget Homestays instead of Hotels).`,
                    ]
                ).map((opt, i) => (
                  <li key={i} className="leading-relaxed">
                    <strong>{opt}</strong>
                  </li>
                ))}
              </ul>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(true)}
                  className="btn-primary-cb !py-2 !px-4 !text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Adjust Budget or Travelers →</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 3. METRIC CARDS OVERVIEW */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Budget Metric Card */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <span className="text-xs text-slate-500 flex items-center gap-1 font-bold">
              <Wallet className="w-3.5 h-3.5 text-[#FF5A1F]" />
              Calculated Total Cost
            </span>
            <div className="mt-2">
              <p className="text-2xl font-black text-[#071A2B]">
                {formatPrice(totalCost)}
              </p>
              <p className="text-xs font-bold text-[#FF5A1F] mt-0.5">
                ₹{Number(smartPlan.perPersonBudget).toLocaleString('en-IN')} / person
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Your entered budget: ₹{userBudget.toLocaleString('en-IN')}
              </p>
            </div>
          </div>

          {/* Weather Metric Card */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <span className="text-xs text-slate-500 flex items-center gap-1 font-bold">
              <CloudSun className="w-3.5 h-3.5 text-amber-500" />
              Weather Estimate
            </span>
            <div className="mt-2">
              <p className="text-sm font-black text-[#071A2B] truncate">
                {smartPlan.weather}
              </p>
              <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                {smartPlan.weatherDetails?.summary || 'Ideal sightseeing conditions'}
              </p>
              <span className="inline-block mt-1 text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                Historical climate model
              </span>
            </div>
          </div>

          {/* Stay Metric Card */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <span className="text-xs text-slate-500 flex items-center gap-1 font-bold">
              <BedDouble className="w-3.5 h-3.5 text-sky-500" />
              Selected Stay
            </span>
            <div className="mt-2">
              <p className="text-sm font-black text-[#071A2B] truncate">
                {smartPlan.stayRecommendation?.name}
              </p>
              <p className="text-[11px] text-slate-500 truncate mt-0.5">
                {smartPlan.stayRecommendation?.roomLabel || 'Standard Accommodation'}
              </p>
              <p className="text-xs font-bold text-emerald-600 mt-1">
                ₹{Number(smartPlan.stayRecommendation?.totalPrice || 0).toLocaleString('en-IN')} total ({smartPlan.nights} nights)
              </p>
            </div>
          </div>

          {/* Route Metric Card */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <span className="text-xs text-slate-500 flex items-center gap-1 font-bold">
              <Route className="w-3.5 h-3.5 text-purple-500" />
              Transit Route
            </span>
            <div className="mt-2">
              <p className="text-sm font-black text-[#071A2B] truncate">
                {smartPlan.distance}
              </p>
              <p className="text-[11px] text-slate-500 truncate mt-0.5">
                {smartPlan.transportRecommendation?.method}
              </p>
              <p className="text-xs font-bold text-[#FF5A1F] mt-1">
                {smartPlan.transportRecommendation?.duration} duration
              </p>
            </div>
          </div>
        </div>

        {/* 4. TAB SELECTION */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-1 text-sm font-bold overflow-x-auto scrollbar-none">
          {[
            { id: 'itinerary', label: 'Day-by-Day Itinerary' },
            { id: 'budget', label: 'Complete Cost Calculation' },
            { id: 'stay', label: 'Accommodation Details' },
            { id: 'transport', label: 'Transit Route & Options' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 px-4 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? 'text-[#FF5A1F] border-b-2 border-[#FF5A1F]'
                  : 'text-slate-500 hover:text-[#071A2B]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ================= TAB 1: DAY-BY-DAY ITINERARY ================= */}
        {activeTab === 'itinerary' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-xl font-black text-[#071A2B]">
                  Day-by-Day Geographically Sensible Itinerary
                </h2>
                <p className="text-xs text-slate-500">
                  Each day is divided into Morning, Afternoon, and Evening windows. Stops are clustered in the same area to eliminate criss-cross backtracking.
                </p>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold">
                <MapPin className="w-3.5 h-3.5 text-[#FF5A1F]" />
                <span>Geographically Clustered</span>
              </div>
            </div>

            <div className="space-y-6">
              {(smartPlan.dayByDay || []).map((day) => (
                <div
                  key={day.day}
                  className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6"
                >
                  {/* Day Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
                    <div>
                      <span className="text-xs font-black text-[#FF5A1F] uppercase tracking-wider block">
                        Day {day.day}
                      </span>
                      <h3 className="text-lg font-black text-[#071A2B] mt-0.5">
                        {day.title}
                      </h3>
                      {day.neighborhood && (
                        <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-[#FF5A1F]" />
                          <span>Primary area cluster: {day.neighborhood}</span>
                        </p>
                      )}
                    </div>

                    {/* Day Daily Estimates Summary Badge */}
                    <div className="bg-[#F5F7F8] p-3 rounded-2xl border border-slate-200 text-xs space-y-1 sm:text-right">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                        Estimated Day Costs (Per Person)
                      </span>
                      <p className="font-extrabold text-[#071A2B]">
                        Local Travel: ₹{day.estimatedLocalTravel?.costPerPerson || 0} • Food: ₹{day.estimatedFood?.costPerPerson || 0}
                      </p>
                    </div>
                  </div>

                  {/* Morning, Afternoon, Evening Cards (Prompt Requirement) */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Morning Window */}
                    {day.morning && (
                      <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/60 space-y-2 flex flex-col justify-between">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-1.5 text-xs font-black text-amber-900">
                            <Sunrise className="w-4 h-4 text-amber-600" />
                            <span>Morning ({day.morning.time})</span>
                          </div>
                          <p className="text-xs font-bold text-[#071A2B]">
                            {day.morning.title}
                          </p>
                          <p className="text-[11px] text-slate-600 leading-relaxed">
                            {day.morning.description}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Afternoon Window */}
                    {day.afternoon && (
                      <div className="p-4 rounded-2xl bg-orange-50/50 border border-orange-200/60 space-y-2 flex flex-col justify-between">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-1.5 text-xs font-black text-orange-900">
                            <Sun className="w-4 h-4 text-[#FF5A1F]" />
                            <span>Afternoon ({day.afternoon.time})</span>
                          </div>
                          <p className="text-xs font-bold text-[#071A2B]">
                            {day.afternoon.title}
                          </p>
                          <p className="text-[11px] text-slate-600 leading-relaxed">
                            {day.afternoon.description}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Evening Window */}
                    {day.evening && (
                      <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-200/60 space-y-2 flex flex-col justify-between">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-1.5 text-xs font-black text-indigo-900">
                            <Sunset className="w-4 h-4 text-indigo-600" />
                            <span>Evening ({day.evening.time})</span>
                          </div>
                          <p className="text-xs font-bold text-[#071A2B]">
                            {day.evening.title}
                          </p>
                          <p className="text-[11px] text-slate-600 leading-relaxed">
                            {day.evening.description}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Chronological Activities / Stops */}
                  <div className="space-y-2.5 pt-2">
                    <span className="text-xs font-bold text-[#071A2B] block">
                      Chronological Stops &amp; Schedule:
                    </span>
                    <div className="space-y-2">
                      {(day.activities || []).map((act, actIdx) => (
                        <div
                          key={act.id || actIdx}
                          className={`p-3.5 rounded-2xl border text-xs flex items-start justify-between gap-3 ${
                            act.isMeal
                              ? 'bg-amber-50/30 border-amber-200/60'
                              : act.category === 'Transport'
                              ? 'bg-purple-50/30 border-purple-200/60'
                              : act.category === 'Accommodation'
                              ? 'bg-sky-50/30 border-sky-200/60'
                              : 'bg-slate-50/60 border-slate-200/70'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex flex-col items-center shrink-0">
                              <span className="font-extrabold text-[11px] text-[#FF5A1F] bg-white px-2 py-0.5 rounded-md border border-orange-200 shadow-2xs">
                                {act.time}
                              </span>
                              {act.travelTime && (
                                <span className="text-[9px] text-slate-400 mt-1 whitespace-nowrap">
                                  ⏱️ {act.travelTime}
                                </span>
                              )}
                            </div>

                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-[#071A2B]">{act.title}</span>
                                {act.category && (
                                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-white text-slate-600 border border-slate-200">
                                    {act.category}
                                  </span>
                                )}
                              </div>
                              <p className="text-slate-500 leading-relaxed">{act.desc}</p>
                            </div>
                          </div>

                          {act.estimatedCost > 0 && (
                            <span className="text-[11px] font-bold text-emerald-600 shrink-0">
                              Est. ₹{act.estimatedCost.toLocaleString('en-IN')}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Day Accommodation Footer Note */}
                  {day.accommodation && (
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between text-slate-600">
                      <div className="flex items-center gap-2">
                        <BedDouble className="w-4 h-4 text-sky-600" />
                        <span><strong>Accommodation:</strong> {day.accommodation.name} ({day.accommodation.location})</span>
                      </div>
                      <span className="text-[11px] font-semibold text-slate-500">{day.accommodation.note}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 2: COMPLETE COST CALCULATION ================= */}
        {activeTab === 'budget' && (
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xl space-y-8">
            <div className="space-y-1">
              <h2 className="text-2xl font-black text-[#071A2B]">
                Mathematically Exact Cost Calculation
              </h2>
              <p className="text-xs text-slate-500">
                Every displayed cost directly contributes to the total. No hidden fees or random discrepancies.
              </p>
            </div>

            {/* 6-Category Component Table (Prompt Requirement) */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F5F7F8] border-b border-slate-200 font-bold text-slate-600 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="p-3.5 sm:px-6">Component</th>
                    <th className="p-3.5 sm:px-6">Description</th>
                    <th className="p-3.5 sm:px-6 text-right">Per Person</th>
                    <th className="p-3.5 sm:px-6 text-right">Total Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {breakdown.map((item) => (
                    <tr key={item.key} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-3.5 sm:px-6 font-bold text-[#071A2B]">
                        {item.category}
                      </td>
                      <td className="p-3.5 sm:px-6 text-slate-500">
                        {item.label}
                      </td>
                      <td className="p-3.5 sm:px-6 text-right text-slate-600 font-semibold">
                        ₹{item.perPerson?.toLocaleString('en-IN')}
                      </td>
                      <td className="p-3.5 sm:px-6 text-right font-black text-[#071A2B]">
                        ₹{item.amount?.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}

                  {/* MATHEMATICAL TOTAL ROW */}
                  <tr className="bg-orange-50/70 border-t-2 border-[#FF5A1F] font-black text-[#071A2B] text-sm">
                    <td className="p-4 sm:px-6 uppercase tracking-wider text-[#FF5A1F]">
                      TOTAL
                    </td>
                    <td className="p-4 sm:px-6 text-xs text-slate-500 font-normal">
                      Sum of Transportation + Accommodation + Food + Local transport + Activities + Miscellaneous
                    </td>
                    <td className="p-4 sm:px-6 text-right text-[#FF5A1F]">
                      ₹{Number(smartPlan.perPersonBudget).toLocaleString('en-IN')}
                    </td>
                    <td className="p-4 sm:px-6 text-right text-base text-[#FF5A1F]">
                      ₹{totalCost.toLocaleString('en-IN')}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Budget vs Estimated Total Comparison Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div data-testid="cost-budget-card" className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-xs font-bold text-slate-500 block">
                  Budget
                </span>
                <span className="text-xl font-black text-[#071A2B] mt-1 block">
                  ₹{userBudget.toLocaleString('en-IN')}
                </span>
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  ₹{Number(smartPlan.userPerPersonBudget).toLocaleString('en-IN')} / person
                </span>
              </div>

              <div data-testid="cost-estimated-card" className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-xs font-bold text-slate-500 block">
                  Estimated Total
                </span>
                <span className="text-xl font-black text-[#FF5A1F] mt-1 block">
                  ₹{totalCost.toLocaleString('en-IN')}
                </span>
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  ₹{Number(smartPlan.perPersonBudget).toLocaleString('en-IN')} / person
                </span>
              </div>

              <div data-testid="cost-remaining-card" className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-xs font-bold text-slate-500 block">
                  {isOverBudget ? 'Over-budget amount' : 'Remaining budget'}
                </span>
                <span
                  className={`text-xl font-black mt-1 block ${
                    isOverBudget ? 'text-rose-600' : 'text-emerald-600'
                  }`}
                >
                  {isOverBudget
                    ? `₹${shortfallTotal.toLocaleString('en-IN')} Shortfall`
                    : `₹${remainingBudget.toLocaleString('en-IN')} Spare`}
                </span>
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  {isOverBudget
                    ? `Over budget by ₹${shortfallPerPerson.toLocaleString('en-IN')} / person`
                    : `Comfortably within entered budget`}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 italic">
              * Note: All prices shown are realistic estimates calculated from highway toll distances, regional transport tariffs, and verified stay catalogs.
            </p>
          </div>
        )}

        {/* ================= TAB 3: ACCOMMODATION DETAILS ================= */}
        {activeTab === 'stay' && (
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xl space-y-6">
            <div className="space-y-1">
              <h2 className="text-xl font-black text-[#071A2B]">Selected Accommodation</h2>
              <p className="text-xs text-slate-500">
                Intelligently chosen to match your party size, duration, and target budget.
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden flex flex-col md:flex-row">
              <div className="md:w-1/3 h-56 md:h-auto bg-slate-200 relative overflow-hidden">
                <img
                  src={
                    smartPlan.stayRecommendation?.image ||
                    'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80'
                  }
                  alt={smartPlan.stayRecommendation?.name}
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-3 left-3 bg-[#071A2B]/85 text-white px-2.5 py-1 rounded-full text-[10px] font-bold">
                  ★ {smartPlan.stayRecommendation?.rating || 4.8} Rating
                </span>
              </div>

              <div className="p-6 md:w-2/3 space-y-4 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-[#FF5A1F] uppercase tracking-wider bg-orange-100 px-2 py-0.5 rounded">
                      {smartPlan.stayRecommendation?.type}
                    </span>
                    <span className="text-xs text-slate-500">
                      📍 {smartPlan.stayRecommendation?.location}
                    </span>
                  </div>

                  <h3 className="text-2xl font-black text-[#071A2B]">
                    {smartPlan.stayRecommendation?.name}
                  </h3>

                  <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-2 text-xs">
                    <div className="flex justify-between font-bold text-slate-800">
                      <span>Room Allocation:</span>
                      <span className="text-[#FF5A1F]">
                        {smartPlan.stayRecommendation?.roomLabel}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Stay Duration:</span>
                      <span>{smartPlan.nights} Nights</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Estimated Nightly Rate:</span>
                      <span>{smartPlan.stayRecommendation?.price}</span>
                    </div>
                    <div className="pt-2 border-t border-slate-100 flex justify-between font-black text-sm text-[#071A2B]">
                      <span>Total Accommodation Cost:</span>
                      <span className="text-emerald-600">
                        ₹{Number(smartPlan.stayRecommendation?.totalPrice || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-2">
                  {(smartPlan.stayRecommendation?.amenities || []).map((amenity, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-600 text-[11px] font-medium"
                    >
                      ✓ {amenity}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 4: TRANSIT ROUTE & OPTIONS ================= */}
        {activeTab === 'transport' && (
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xl space-y-6">
            <div className="space-y-1">
              <h2 className="text-xl font-black text-[#071A2B]">Transit Route &amp; Options</h2>
              <p className="text-xs text-slate-500">
                Sensibly evaluated intercity transit options between {smartPlan.originCity} and {smartPlan.destinationCity}.
              </p>
            </div>

            {/* Selected Transit Hero */}
            <div className="p-5 rounded-2xl bg-orange-50 border border-orange-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#FF5A1F] uppercase tracking-wider">
                  Recommended Transit Choice
                </span>
                <span className="text-xs font-bold text-slate-600">
                  {smartPlan.distance}
                </span>
              </div>
              <h3 className="text-lg font-black text-[#071A2B]">
                {smartPlan.transportRecommendation?.method}
              </h3>
              <p className="text-xs text-slate-600">
                {smartPlan.transportRecommendation?.note}
              </p>
              <div className="pt-2 flex items-center justify-between text-xs font-bold text-[#071A2B]">
                <span>Duration: {smartPlan.transportRecommendation?.duration}</span>
                <span className="text-emerald-600 text-sm">
                  {smartPlan.transportRecommendation?.costPerPerson} / person round-trip
                </span>
              </div>
            </div>

            {/* All Evaluated Options */}
            <div className="space-y-3 pt-2">
              <span className="text-xs font-bold text-[#071A2B] block">
                All Available Intercity Transit Options:
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(smartPlan.allTransportOptions || []).map((opt) => (
                  <div
                    key={opt.id}
                    className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#071A2B]">{opt.name}</span>
                      <span className="text-[11px] font-extrabold text-[#FF5A1F]">
                        {opt.durationLabel}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">{opt.description}</p>
                    <div className="flex justify-between items-center pt-2 border-t border-slate-200/60 font-black">
                      <span className="text-slate-500 text-[11px]">Round-trip cost:</span>
                      <span className="text-[#071A2B]">
                        ₹{opt.costPerPerson.toLocaleString('en-IN')} / person
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </main>

      {/* 5. EDIT CONSTRAINTS MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#071A2B]/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-[#FF5A1F]" />
                <h3 className="font-black text-base text-[#071A2B]">Adjust Budget &amp; Travelers</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleApplyEditConstraints} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#071A2B] block mb-1">
                  Total Budget (₹)
                </label>
                <input
                  type="number"
                  min="1000"
                  step="500"
                  value={editBudget}
                  onChange={(e) => setEditBudget(e.target.value)}
                  className="w-full p-3 rounded-2xl border bg-slate-50 border-slate-200 text-sm font-bold text-[#071A2B] focus:outline-none focus:border-[#FF5A1F] focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#071A2B] block mb-1">
                  Number of Travelers
                </label>
                <input
                  type="number"
                  min="1"
                  max="25"
                  value={editTravelers}
                  onChange={(e) => setEditTravelers(e.target.value)}
                  className="w-full p-3 rounded-2xl border bg-slate-50 border-slate-200 text-sm font-bold text-[#071A2B] focus:outline-none focus:border-[#FF5A1F] focus:bg-white transition-all"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="btn-secondary-cb !py-2.5 !px-4 !text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary-cb !py-2.5 !px-6 !text-xs font-bold cursor-pointer"
                >
                  Recalculate Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
