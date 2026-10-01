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
  ArrowUp,
  ArrowDown,
  Info,
  Check,
} from 'lucide-react';

export default function PlanResultPage() {
  const {
    smartPlan,
    removePlanActivity,
    addPlanActivity,
    generatePlan,
    formatPrice,
    setShareModalData,
    addToast,
    navigate,
  } = useStore();

  const [activeTab, setActiveTab] = useState('itinerary'); // 'itinerary' | 'budget' | 'stay' | 'transport'
  const [showRegenerateDropdown, setShowRegenerateDropdown] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Add Activity Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newActivityDay, setNewActivityDay] = useState(0);
  const [newActivityTime, setNewActivityTime] = useState('03:30 PM');
  const [newActivityTitle, setNewActivityTitle] = useState('');
  const [newActivityDesc, setNewActivityDesc] = useState('');
  const [newActivityCategory, setNewActivityCategory] = useState('Sightseeing');
  const [newActivityCost, setNewActivityCost] = useState(0);

  // Edit Constraints state
  const [editBudget, setEditBudget] = useState(smartPlan?.userTargetBudget || 15000);
  const [editBudgetType, setEditBudgetType] = useState(smartPlan?.budgetType || 'person');
  const [editFlexibility, setEditFlexibility] = useState(smartPlan?.budgetFlexibility || 'Moderate');
  const [editTravelers, setEditTravelers] = useState(smartPlan?.travelers || 2);
  const [editTransport, setEditTransport] = useState(smartPlan?.criteria?.intercityTransportPreference || 'Cheapest available');
  const [editAccom, setEditAccom] = useState(smartPlan?.criteria?.accommodationPreference || 'Hotel');
  const [editIntensity, setEditIntensity] = useState(smartPlan?.criteria?.activityIntensity || 'Balanced');

  if (!smartPlan) {
    return (
      <div className="min-h-screen bg-[#F5F7F8] pt-32 text-center p-8">
        <p className="text-sm text-slate-500">No generated plan found.</p>
        <button
          onClick={() => navigate('plan-trip')}
          className="btn-primary-cb !text-xs mt-4"
        >
          Create New Plan
        </button>
      </div>
    );
  }

  // Safe regeneration: uses preserved criteria, eliminating compounding bugs!
  const handleRegenerate = (mode = 'full') => {
    setShowRegenerateDropdown(false);
    const criteria = smartPlan.criteria || {
      destination: smartPlan.destination,
      origin: smartPlan.origin?.fullName || 'Delhi',
      travelers: smartPlan.travelers,
      days: smartPlan.days,
      nights: smartPlan.nights,
      budget: smartPlan.userTargetBudget || 15000,
      budgetType: smartPlan.budgetType || 'person',
      travelStyle: smartPlan.travelStyle,
    };

    if (mode === 'itinerary') {
      generatePlan({ ...criteria, regenerateType: 'itinerary' });
      addToast('Itinerary schedule refreshed with fresh neighborhood spots!', 'success');
      return;
    }

    if (mode === 'stay') {
      generatePlan({ ...criteria, regenerateType: 'stay' });
      addToast('Stay recommendation refreshed!', 'success');
      return;
    }

    generatePlan(criteria);
    addToast('Plan refreshed with your verified constraints!', 'success');
  };

  const handleSavePlan = () => {
    addToast('Plan saved to your My Trips workspace! 📁', 'success');
    navigate('my-trips', { tab: 'upcoming' });
  };

  const handleAddActivitySubmit = (e) => {
    e.preventDefault();
    if (!newActivityTitle.trim()) return;

    addPlanActivity(newActivityDay, {
      id: `custom-act-${Date.now()}`,
      time: newActivityTime,
      title: newActivityTitle,
      desc: newActivityDesc || 'Custom traveler activity',
      category: newActivityCategory,
      costPerPerson: Number(newActivityCost) || 0,
      estimatedCost: Number(newActivityCost) || 0,
      travelTime: '15 mins',
      isMeal: newActivityCategory === 'Food',
    });

    setNewActivityTitle('');
    setNewActivityDesc('');
    setNewActivityCost(0);
    setShowAddModal(false);
  };

  const handleApplyEditConstraints = (e) => {
    e.preventDefault();
    const updatedCriteria = {
      ...(smartPlan.criteria || {}),
      userBudget: Number(editBudget),
      budget: Number(editBudget),
      budgetType: editBudgetType,
      budgetFlexibility: editFlexibility,
      travelers: Number(editTravelers),
      adults: Number(editTravelers),
      intercityTransportPreference: editTransport,
      accommodationPreference: editAccom,
      activityIntensity: editIntensity,
    };

    generatePlan(updatedCriteria);
    setShowEditModal(false);
    addToast('Plan recalculated with your updated travel criteria!', 'success');
  };

  const handleSwitchTransport = (transportId) => {
    const updatedCriteria = {
      ...(smartPlan.criteria || {}),
      intercityTransportPreference: transportId,
    };
    generatePlan(updatedCriteria);
    addToast(`Intercity transport updated to ${transportId}!`, 'success');
  };

  const isOverBudget = smartPlan.isOverBudget || (smartPlan.shortfall && smartPlan.shortfall.total > 0);
  const shortfallTotal = smartPlan.shortfall?.total || 0;
  const shortfallPerPerson = smartPlan.shortfall?.perPerson || 0;
  const budgetUsed = smartPlan.budgetUsedPercent || 100;

  return (
    <div className="min-h-screen bg-[#F5F7F8] pt-24 pb-28">
      {/* Top Banner with Actions */}
      <div className="bg-[#071A2B] text-white py-10 px-4 sm:px-6 lg:px-8 border-b border-white/10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div className="space-y-2">
            <span className="text-xs font-bold text-[#FF5A1F] uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Verified Realistic Plan
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
              {smartPlan.tripTitle}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              {smartPlan.originCity ? `${smartPlan.originCity} ➔ ` : ''}
              {smartPlan.destination} • {smartPlan.duration} • {smartPlan.travelers} Travelers
            </p>
          </div>

          {/* Action Buttons: Edit, Regenerate, Share, Save */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowEditModal(true)}
              className="btn-secondary-cb !bg-white/10 !text-white !border-white/20 hover:!bg-white/20 !py-2 !px-3.5 !text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5 text-amber-400" />
              <span>Edit Constraints</span>
            </button>

            {/* Targeted Regenerate Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowRegenerateDropdown(!showRegenerateDropdown)}
                className="btn-secondary-cb !bg-white/10 !text-white !border-white/20 hover:!bg-white/20 !py-2 !px-3.5 !text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Regenerate</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showRegenerateDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-[#0C2438] border border-white/15 rounded-2xl shadow-2xl py-2 z-50 text-xs">
                  <button
                    onClick={() => handleRegenerate('full')}
                    className="w-full text-left px-4 py-2 hover:bg-white/10 text-white flex items-center gap-2"
                  >
                    <span>Full Plan Refresh</span>
                  </button>
                  <button
                    onClick={() => handleRegenerate('itinerary')}
                    className="w-full text-left px-4 py-2 hover:bg-white/10 text-slate-300 hover:text-white flex items-center gap-2"
                  >
                    <span>Rotate Activities Only</span>
                  </button>
                  <button
                    onClick={() => handleRegenerate('stay')}
                    className="w-full text-left px-4 py-2 hover:bg-white/10 text-slate-300 hover:text-white flex items-center gap-2"
                  >
                    <span>Alternate Stays Only</span>
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => setShareModalData({ title: smartPlan.tripTitle, url: window.location.href })}
              className="btn-secondary-cb !bg-white/10 !text-white !border-white/20 hover:!bg-white/20 !py-2 !px-3.5 !text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share</span>
            </button>

            <button
              onClick={handleSavePlan}
              className="btn-primary-cb !py-2 !px-5 !text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md shadow-[#FF5A1F]/30"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Plan</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">

        {/* Shortfall Alert Card (if budget exceeded) */}
        {isOverBudget && (
          <div className="bg-amber-500/10 border-2 border-amber-500/30 rounded-3xl p-6 text-[#071A2B] space-y-3">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-500 text-white rounded-xl shrink-0 mt-0.5">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-extrabold text-base text-amber-900">
                  Estimated Trip Cost Exceeds Your Target Budget
                </h3>
                <p className="text-xs text-amber-800 leading-relaxed">
                  Realistic calculated expenditure is{' '}
                  <strong>₹{Number(smartPlan.totalBudget).toLocaleString('en-IN')}</strong> (₹{Number(smartPlan.perPersonBudget).toLocaleString('en-IN')}/person), while your budget was set to{' '}
                  <strong>₹{Number(smartPlan.userTargetBudget).toLocaleString('en-IN')}</strong> (₹{Number(smartPlan.userPerPersonBudget).toLocaleString('en-IN')}/person). Shortfall:{' '}
                  <span className="font-extrabold text-rose-600">
                    ₹{shortfallTotal.toLocaleString('en-IN')} total (₹{shortfallPerPerson.toLocaleString('en-IN')}/person)
                  </span>.
                </p>
              </div>
            </div>

            {/* Actionable Recommendations */}
            <div className="bg-white/80 p-4 rounded-2xl border border-amber-200/80 space-y-2 text-xs">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-amber-600" />
                Actionable ways to bring costs within your target budget:
              </span>
              <ul className="space-y-1.5 text-slate-600 pl-4 list-disc">
                {(smartPlan.shortfall?.suggestions && smartPlan.shortfall.suggestions.length > 0
                  ? smartPlan.shortfall.suggestions
                  : [
                      'Switch to Train (Express / 3AC) or Volvo Bus for intercity transit to save on vehicle costs.',
                      'Choose a cozy Homestay or Budget Hotel instead of premium resort rooms.',
                      'Rent a scooter or use public transit instead of dedicated private cabs for local commute.',
                      `Increase target budget to ₹${smartPlan.perPersonBudget?.toLocaleString('en-IN')}/person to keep current preferences.`,
                    ]
                ).map((sug, i) => (
                  <li key={i}>{sug}</li>
                ))}
              </ul>
              <div className="pt-2">
                <button
                  onClick={() => setShowEditModal(true)}
                  className="btn-primary-cb !py-1.5 !px-4 !text-xs font-bold inline-flex items-center gap-1"
                >
                  <span>Adjust Constraints in Edit Modal →</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Metric Cards Banner: Budget, Weather, Stay, Route */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <span className="text-xs text-slate-400 flex items-center gap-1 font-semibold">
              <Wallet className="w-3.5 h-3.5 text-[#FF5A1F]" />
              Calculated Budget
            </span>
            <div className="mt-2">
              <p className="text-xl font-black text-[#071A2B]">
                {formatPrice(smartPlan.totalBudget)}
              </p>
              <p className="text-[11px] font-bold text-[#FF5A1F]">
                ₹{Number(smartPlan.perPersonBudget).toLocaleString('en-IN')} / person
              </p>
              <p className="text-[10px] text-slate-400 mt-1">
                Target: ₹{Number(smartPlan.userTargetBudget).toLocaleString('en-IN')} ({budgetUsed}% used)
              </p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <span className="text-xs text-slate-400 flex items-center gap-1 font-semibold">
              <CloudSun className="w-3.5 h-3.5 text-amber-500" />
              Weather Forecast
            </span>
            <div className="mt-2">
              <p className="text-sm font-extrabold text-[#071A2B] truncate">
                {smartPlan.weather}
              </p>
              <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                {smartPlan.weatherDetails?.summary || 'Ideal sightseeing climate'}
              </p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <span className="text-xs text-slate-400 flex items-center gap-1 font-semibold">
              <BedDouble className="w-3.5 h-3.5 text-sky-500" />
              Stay Recommendation
            </span>
            <div className="mt-2">
              <p className="text-sm font-extrabold text-[#071A2B] truncate">
                {smartPlan.stayRecommendation?.name}
              </p>
              <p className="text-[11px] text-slate-500 truncate">
                {smartPlan.stayRecommendation?.roomLabel || `${smartPlan.stayRecommendation?.rooms || 1} Rooms`}
              </p>
              <p className="text-[11px] font-bold text-emerald-600 mt-0.5">
                {smartPlan.stayRecommendation?.price}
              </p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <span className="text-xs text-slate-400 flex items-center gap-1 font-semibold">
              <Route className="w-3.5 h-3.5 text-purple-500" />
              Transit Route
            </span>
            <div className="mt-2">
              <p className="text-sm font-extrabold text-[#071A2B] truncate">
                {smartPlan.distance}
              </p>
              <p className="text-[11px] text-slate-500 truncate">
                {smartPlan.transportRecommendation?.method}
              </p>
              <p className="text-[11px] font-bold text-[#FF5A1F] mt-0.5">
                {smartPlan.transportRecommendation?.duration} duration
              </p>
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-1 text-sm font-bold overflow-x-auto scrollbar-none">
          {[
            { id: 'itinerary', label: 'Day-by-Day Activities' },
            { id: 'budget', label: '7-Category Budget Breakdown' },
            { id: 'stay', label: 'Stay & Room Details' },
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

        {/* TAB 1: DAY-BY-DAY ACTIVITIES */}
        {activeTab === 'itinerary' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-xl text-[#071A2B]">Geographically Clustered Itinerary</h3>
                <p className="text-xs text-slate-500">
                  Attractions are scheduled by neighborhood to prevent city backtracking. Includes travel buffers and regional meal times.
                </p>
              </div>

              <button
                onClick={() => setShowAddModal(true)}
                className="btn-primary-cb !py-2 !px-4 !text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md shadow-[#FF5A1F]/30"
              >
                <Plus className="w-4 h-4" />
                <span>Add Stop / Activity</span>
              </button>
            </div>

            <div className="space-y-6">
              {(smartPlan.dayByDay || []).map((day, dayIdx) => (
                <div
                  key={dayIdx}
                  className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                    <div>
                      <span className="font-extrabold text-sm text-[#FF5A1F] uppercase tracking-wider block">
                        Day {day.day}: {day.title}
                      </span>
                      {day.neighborhood && (
                        <span className="text-[11px] text-slate-400 flex items-center gap-1 font-medium mt-0.5">
                          <MapPin className="w-3 h-3 text-[#FF5A1F]" />
                          Area cluster: {day.neighborhood}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        setNewActivityDay(dayIdx);
                        setShowAddModal(true);
                      }}
                      className="text-xs text-slate-500 hover:text-[#FF5A1F] flex items-center gap-1 font-semibold cursor-pointer self-start sm:self-auto"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add stop to Day {day.day}</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {day.activities.map((act, actIdx) => (
                      <div
                        key={act.id || actIdx}
                        className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-4 group ${
                          act.isMeal
                            ? 'bg-amber-50/40 border-amber-200/70'
                            : act.category === 'Transport'
                            ? 'bg-purple-50/40 border-purple-200/70'
                            : act.category === 'Stay'
                            ? 'bg-sky-50/40 border-sky-200/70'
                            : 'bg-slate-50 border-slate-200/80 hover:bg-slate-100/70'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex flex-col items-center shrink-0">
                            <span className="text-xs font-bold text-[#FF5A1F] bg-white px-2 py-0.5 rounded-md border border-orange-200 mt-0.5 shadow-2xs">
                              {act.time}
                            </span>
                            {act.travelTime && (
                              <span className="text-[9px] text-slate-400 mt-1 whitespace-nowrap">
                                ⏱️ {act.travelTime}
                              </span>
                            )}
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <p className="font-extrabold text-xs text-[#071A2B]">{act.title}</p>
                              {act.category && (
                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-white text-slate-600 border border-slate-200">
                                  {act.category}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 leading-relaxed">{act.desc}</p>
                            {act.estimatedCost > 0 && (
                              <p className="text-[11px] font-bold text-emerald-600">
                                Est. Ticket / Entry: ₹{act.estimatedCost.toLocaleString('en-IN')}/person
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all shrink-0">
                          <button
                            onClick={() => removePlanActivity(dayIdx, actIdx)}
                            className="p-1.5 text-slate-400 hover:text-red-500 transition-all cursor-pointer rounded-lg hover:bg-white"
                            title="Remove activity"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: 7-CATEGORY BUDGET BREAKDOWN */}
        {activeTab === 'budget' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div>
              <h3 className="font-extrabold text-xl text-[#071A2B]">7-Category Deterministic Budget Breakdown</h3>
              <p className="text-xs text-slate-500">
                Calculated down to the rupee based on highway distances, room counts, daily meals, local transit and safety reserves.
              </p>
            </div>

            {/* Budget Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {(smartPlan.budgetBreakdown || []).map((item, idx) => (
                <div key={idx} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                      <span>{item.category}</span>
                      <span className="font-bold text-[#FF5A1F]">{item.percentage}%</span>
                    </div>
                    <p className="text-2xl font-black text-[#071A2B] mt-2">
                      {formatPrice(item.amount)}
                    </p>
                    <p className="text-xs font-semibold text-slate-500 mt-0.5">
                      ₹{item.perPerson?.toLocaleString('en-IN') || Math.round(item.amount / smartPlan.travelers).toLocaleString('en-IN')} / person
                    </p>
                  </div>

                  <div className="w-full bg-slate-200 h-2 rounded-full mt-4 overflow-hidden">
                    <div
                      className="bg-[#FF5A1F] h-full rounded-full transition-all"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Summary Overview */}
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
              <div>
                <span className="text-slate-400 font-bold uppercase tracking-wider block">Target User Budget</span>
                <span className="text-xl font-extrabold text-[#071A2B] mt-1 block">
                  ₹{Number(smartPlan.userTargetBudget).toLocaleString('en-IN')}
                </span>
                <span className="text-slate-500">
                  ₹{Number(smartPlan.userPerPersonBudget).toLocaleString('en-IN')}/person ({smartPlan.budgetFlexibility} flexibility)
                </span>
              </div>

              <div>
                <span className="text-slate-400 font-bold uppercase tracking-wider block">Calculated Total Cost</span>
                <span className="text-xl font-black text-[#FF5A1F] mt-1 block">
                  ₹{Number(smartPlan.totalBudget).toLocaleString('en-IN')}
                </span>
                <span className="text-slate-500">
                  ₹{Number(smartPlan.perPersonBudget).toLocaleString('en-IN')}/person for {smartPlan.travelers} travelers
                </span>
              </div>

              <div>
                <span className="text-slate-400 font-bold uppercase tracking-wider block">Budget Status</span>
                <span className={`text-base font-extrabold mt-1 block ${isOverBudget ? 'text-amber-600' : 'text-emerald-600'}`}>
                  {isOverBudget ? `Over Budget by ₹${shortfallTotal.toLocaleString('en-IN')}` : `Within Budget (₹${Math.max(0, smartPlan.userTargetBudget - smartPlan.totalBudget).toLocaleString('en-IN')} spare)`}
                </span>
                <span className="text-slate-500">
                  Includes 4% Misc & 6% Emergency Safety Buffer
                </span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: STAY & ROOM DETAILS */}
        {activeTab === 'stay' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div>
              <h3 className="font-extrabold text-xl text-[#071A2B]">Stay & Room Math</h3>
              <p className="text-xs text-slate-500">
                Transparent accommodation sizing based on party count (2 adults per room standard).
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden flex flex-col md:flex-row">
              {/* Stay Image */}
              <div className="md:w-1/3 h-52 md:h-auto bg-slate-200 relative overflow-hidden">
                <img
                  src={smartPlan.stayRecommendation?.image || 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80'}
                  alt={smartPlan.stayRecommendation?.name}
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-3 left-3 bg-[#071A2B]/80 backdrop-blur-md text-white px-2.5 py-1 rounded-full text-[10px] font-bold">
                  ★ {smartPlan.stayRecommendation?.rating || 4.8} Rating
                </span>
              </div>

              {/* Stay Content */}
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

                  <h4 className="text-2xl font-black text-[#071A2B]">
                    {smartPlan.stayRecommendation?.name}
                  </h4>

                  {/* Room Math Card */}
                  <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-1 text-xs">
                    <div className="flex items-center justify-between font-bold text-slate-800">
                      <span>Room Allocation:</span>
                      <span className="text-[#FF5A1F]">
                        {smartPlan.stayRecommendation?.roomLabel || `${smartPlan.stayRecommendation?.rooms || 1} Rooms for ${smartPlan.travelers} Travelers`}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-500">
                      <span>Duration:</span>
                      <span>{smartPlan.nights} Nights</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-500">
                      <span>Nightly Rate:</span>
                      <span>{smartPlan.stayRecommendation?.price}</span>
                    </div>
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between font-extrabold text-sm text-[#071A2B]">
                      <span>Total Stay Cost:</span>
                      <span className="text-emerald-600">
                        ₹{Number(smartPlan.stayRecommendation?.totalPrice || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {/* Amenities */}
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {(smartPlan.stayRecommendation?.amenities || ['Free Wi-Fi', 'Hot Water', 'Scenic Balcony', 'Room Service']).map((amenity, i) => (
                      <span key={i} className="text-[11px] bg-slate-200/70 text-slate-700 px-2.5 py-0.5 rounded-full font-medium">
                        ✓ {amenity}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 flex items-center gap-3">
                  <button
                    onClick={() => navigate('stays')}
                    className="btn-primary-cb !py-2.5 !px-6 !text-xs font-bold cursor-pointer"
                  >
                    View All Stays in {smartPlan.destinationCity || 'Destination'} →
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: TRANSIT ROUTE & OPTIONS */}
        {activeTab === 'transport' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div>
              <h3 className="font-extrabold text-xl text-[#071A2B]">Intercity Route & Transport Options</h3>
              <p className="text-xs text-slate-500">
                Calculated for {smartPlan.originCity || 'Origin'} ➔ {smartPlan.destinationCity || 'Destination'} ({smartPlan.distance}).
              </p>
            </div>

            {/* Current Chosen Transit */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-3">
              <span className="text-[10px] font-bold text-[#FF5A1F] uppercase tracking-wider">
                Current Selected Transit Mode
              </span>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-lg font-black text-[#071A2B]">
                    {smartPlan.transportRecommendation?.method}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    {smartPlan.transportRecommendation?.note}
                  </p>
                </div>
                <div className="text-right sm:text-right">
                  <span className="text-lg font-black text-emerald-600 block">
                    {smartPlan.transportRecommendation?.costPerPerson}/person
                  </span>
                  <span className="text-xs text-slate-400">
                    Total: ₹{Number(smartPlan.transportRecommendation?.totalCost || 0).toLocaleString('en-IN')} for party
                  </span>
                </div>
              </div>
            </div>

            {/* Compare All Modes Table */}
            <div className="space-y-3">
              <h4 className="font-bold text-sm text-[#071A2B]">Compare All Available Transit Modes</h4>
              <div className="grid grid-cols-1 gap-3">
                {(smartPlan.allTransportOptions || []).map((opt) => {
                  const isCurrent = opt.id === (smartPlan.criteria?.intercityTransportPreference?.toLowerCase() || 'train');
                  return (
                    <div
                      key={opt.id}
                      className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                        isCurrent
                          ? 'bg-orange-50/50 border-[#FF5A1F] ring-1 ring-[#FF5A1F]'
                          : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-xs text-[#071A2B]">{opt.name}</span>
                          {isCurrent && (
                            <span className="text-[10px] font-bold bg-[#FF5A1F] text-white px-2 py-0.5 rounded-full">
                              Active
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500">{opt.description}</p>
                        <p className="text-[11px] text-slate-400">Travel Duration: {opt.durationLabel}</p>
                      </div>

                      <div className="flex items-center gap-4 self-end sm:self-center">
                        <div className="text-right">
                          <p className="font-extrabold text-sm text-[#071A2B]">
                            ₹{opt.costPerPerson.toLocaleString('en-IN')}{' '}
                            <span className="text-[11px] font-normal text-slate-500">/person</span>
                          </p>
                          <p className="text-[10px] text-slate-400">
                            Total: ₹{opt.totalCost.toLocaleString('en-IN')}
                          </p>
                        </div>

                        {!isCurrent && (
                          <button
                            onClick={() => handleSwitchTransport(opt.id)}
                            className="btn-secondary-cb !py-1.5 !px-3 !text-xs font-bold cursor-pointer"
                          >
                            Switch Mode
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Add Custom Activity Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0C2438] text-white w-full max-w-md rounded-3xl border border-white/15 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-bold text-base text-white">Add Custom Activity</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddActivitySubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Select Day</label>
                <select
                  value={newActivityDay}
                  onChange={(e) => setNewActivityDay(Number(e.target.value))}
                  className="w-full bg-[#071A2B] border border-white/15 rounded-xl px-3 py-2 text-white"
                >
                  {(smartPlan.dayByDay || []).map((d, i) => (
                    <option key={i} value={i}>
                      Day {d.day}: {d.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Time</label>
                  <input
                    type="text"
                    value={newActivityTime}
                    onChange={(e) => setNewActivityTime(e.target.value)}
                    placeholder="e.g. 03:30 PM"
                    className="w-full bg-[#071A2B] border border-white/15 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Category</label>
                  <select
                    value={newActivityCategory}
                    onChange={(e) => setNewActivityCategory(e.target.value)}
                    className="w-full bg-[#071A2B] border border-white/15 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="Sightseeing">Sightseeing</option>
                    <option value="Nature">Nature & Scenic</option>
                    <option value="Food">Food / Dining</option>
                    <option value="Culture">Heritage & Temple</option>
                    <option value="Adventure">Adventure / Sport</option>
                    <option value="Shopping">Shopping / Bazaar</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Activity Title</label>
                <input
                  type="text"
                  required
                  value={newActivityTitle}
                  onChange={(e) => setNewActivityTitle(e.target.value)}
                  placeholder="e.g. Sunset paragliding over Solang"
                  className="w-full bg-[#071A2B] border border-white/15 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Estimated Cost Per Person (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={newActivityCost}
                  onChange={(e) => setNewActivityCost(e.target.value)}
                  placeholder="e.g. 250"
                  className="w-full bg-[#071A2B] border border-white/15 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Description (Optional)</label>
                <input
                  type="text"
                  value={newActivityDesc}
                  onChange={(e) => setNewActivityDesc(e.target.value)}
                  placeholder="e.g. Gliding with certified pilot overlooking Friendship Peak"
                  className="w-full bg-[#071A2B] border border-white/15 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-full border border-white/15 text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary-cb !py-2 !px-5 font-bold cursor-pointer">
                  Add Activity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Constraints Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0C2438] text-white w-full max-w-lg rounded-3xl border border-white/15 p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-base text-white">Edit Trip Constraints</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApplyEditConstraints} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Target Budget (₹)</label>
                  <input
                    type="number"
                    min="1000"
                    step="500"
                    value={editBudget}
                    onChange={(e) => setEditBudget(Number(e.target.value))}
                    className="w-full bg-[#071A2B] border border-white/15 rounded-xl px-3 py-2 text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Budget Type</label>
                  <select
                    value={editBudgetType}
                    onChange={(e) => setEditBudgetType(e.target.value)}
                    className="w-full bg-[#071A2B] border border-white/15 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="person">Per Person</option>
                    <option value="total">Total Trip Budget</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Travelers (Adults)</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={editTravelers}
                    onChange={(e) => setEditTravelers(Number(e.target.value))}
                    className="w-full bg-[#071A2B] border border-white/15 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Budget Flexibility</label>
                  <select
                    value={editFlexibility}
                    onChange={(e) => setEditFlexibility(e.target.value)}
                    className="w-full bg-[#071A2B] border border-white/15 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="Strict">Strict (0%)</option>
                    <option value="Moderate">Moderate (10-15%)</option>
                    <option value="Flexible">Flexible (20-25%)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Accommodation Tier</label>
                <select
                  value={editAccom}
                  onChange={(e) => setEditAccom(e.target.value)}
                  className="w-full bg-[#071A2B] border border-white/15 rounded-xl px-3 py-2 text-white"
                >
                  <option value="Hostel">Backpacker Hostel (₹650/bed)</option>
                  <option value="Budget Hotel">Budget Hotel (₹1,600/room)</option>
                  <option value="Hotel">Boutique Hotel 3★ (₹3,200/room)</option>
                  <option value="Homestay">Local Homestay (₹2,400/room)</option>
                  <option value="Resort">Nature / Valley Resort (₹5,800/room)</option>
                  <option value="Premium">Premium 5★ Luxury (₹8,500/room)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Intercity Transport</label>
                <select
                  value={editTransport}
                  onChange={(e) => setEditTransport(e.target.value)}
                  className="w-full bg-[#071A2B] border border-white/15 rounded-xl px-3 py-2 text-white"
                >
                  <option value="Cheapest available">Cheapest Available</option>
                  <option value="Fastest">Fastest Available</option>
                  <option value="Train">Train (Express / AC 3-Tier)</option>
                  <option value="Bus">AC Volvo / Multi-Axle Bus</option>
                  <option value="Car">Personal Car / Self-Drive</option>
                  <option value="Cab">Dedicated Private Cab</option>
                  <option value="Flight">Domestic Flight</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Daily Pace & Intensity</label>
                <select
                  value={editIntensity}
                  onChange={(e) => setEditIntensity(e.target.value)}
                  className="w-full bg-[#071A2B] border border-white/15 rounded-xl px-3 py-2 text-white"
                >
                  <option value="Relaxed">Relaxed (1–2 stops/day)</option>
                  <option value="Balanced">Balanced (2–3 stops/day)</option>
                  <option value="Packed">Packed / Fast-Paced (3–4 stops/day)</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 rounded-full border border-white/15 text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary-cb !py-2 !px-5 font-bold cursor-pointer">
                  Recalculate Plan →
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
