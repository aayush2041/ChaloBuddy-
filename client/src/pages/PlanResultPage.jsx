import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useStore } from '../context/StoreContext';
import LocationAutocomplete from '../components/LocationAutocomplete';
import { fetchMultimodalRoutes } from '../services/routeService';
import {
  Train,
  Bus,
  Plane,
  Car,
  Anchor,
  Clock,
  ArrowRight,
  ArrowLeft,
  ArrowRightLeft,
  Search,
  Calendar,
  Users,
  ShieldCheck,
  MapPin,
  ExternalLink,
  Printer,
  Share2,
  Bookmark,
  CheckCircle2,
  Info,
  Filter,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Loader2,
  Navigation,
  Compass,
  Building2,
  RotateCcw,
} from 'lucide-react';

export default function PlanResultPage() {
  const {
    journeySearchParams,
    setJourneySearchParams,
    journeyResults,
    setJourneyResults,
    formatPrice,
    saveGeneratedPlan,
    addToast,
    navigate,
  } = useStore();

  // Search parameters
  const [origin, setOrigin] = useState(journeySearchParams?.origin || 'New Delhi, India');
  const [destination, setDestination] = useState(journeySearchParams?.destination || 'Manali, Himachal Pradesh');
  const [departureDate, setDepartureDate] = useState(
    journeySearchParams?.departureDate || new Date().toISOString().split('T')[0]
  );
  const [travelers, setTravelers] = useState(journeySearchParams?.travelers || 2);

  // UI state
  const [isModifyingSearch, setIsModifyingSearch] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedRouteId, setSelectedRouteId] = useState(null);

  // Sorting: 'best' | 'fastest' | 'cheapest'
  const [sortBy, setSortBy] = useState('best');

  // Filtering: 'ALL' | 'TRAIN' | 'BUS' | 'FLIGHT' | 'CAB' | 'CAR' | 'FERRY' | 'MIXED'
  const [selectedModeFilter, setSelectedModeFilter] = useState('ALL');
  const [maxTransfersFilter, setMaxTransfersFilter] = useState('ALL'); // 'ALL' | 'DIRECT' | '1'

  // If no results in memory, trigger search automatically on mount
  useEffect(() => {
    if (!journeyResults && origin && destination) {
      setIsSearching(true);
      fetchMultimodalRoutes(origin, destination, travelers, 4, departureDate)
        .then((res) => {
          setJourneyResults(res);
        })
        .catch((err) => {
          console.error('Failed to load initial journey routes:', err);
        })
        .finally(() => {
          setIsSearching(false);
        });
    }
  }, [journeyResults, origin, destination, travelers, departureDate, setJourneyResults]);

  // Execute modified search
  const handleModifySearch = async (e) => {
    e?.preventDefault();
    if (!origin.trim() || !destination.trim()) {
      addToast('Please enter both origin and destination', 'error');
      return;
    }

    setIsSearching(true);
    setSelectedRouteId(null);
    try {
      const updatedParams = {
        origin,
        destination,
        departureDate,
        travelers,
      };
      setJourneySearchParams(updatedParams);
      const res = await fetchMultimodalRoutes(origin, destination, travelers, 4, departureDate);
      setJourneyResults(res);
      setIsModifyingSearch(false);
      addToast(`Updated routes for ${origin.split(',')[0]} to ${destination.split(',')[0]}`, 'info');
    } catch (err) {
      addToast('Failed to update routes. Please check spelling.', 'error');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSwapLocations = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  };

  const allRoutes = journeyResults?.allRoutes || [];

  // Filter routes
  const filteredRoutes = useMemo(() => {
    return allRoutes.filter((r) => {
      // Mode filter
      if (selectedModeFilter !== 'ALL') {
        const hasMode =
          r.mode === selectedModeFilter ||
          (Array.isArray(r.modeSummary) && r.modeSummary.includes(selectedModeFilter));
        if (!hasMode) return false;
      }

      // Transfers filter
      if (maxTransfersFilter === 'DIRECT' && r.transfersCount > 0) return false;
      if (maxTransfersFilter === '1' && r.transfersCount > 1) return false;

      return true;
    });
  }, [allRoutes, selectedModeFilter, maxTransfersFilter]);

  // Sort routes
  const sortedRoutes = useMemo(() => {
    const list = [...filteredRoutes];
    if (sortBy === 'cheapest') {
      return list.sort((a, b) => a.totalCost - b.totalCost);
    }
    if (sortBy === 'fastest') {
      return list.sort((a, b) => a.durationHours - b.durationHours);
    }
    // 'best' - recommended balance
    return list.sort((a, b) => {
      if (a.isBest && !b.isBest) return -1;
      if (!a.isBest && b.isBest) return 1;
      return a.durationHours - b.durationHours;
    });
  }, [filteredRoutes, sortBy]);

  const selectedRoute = allRoutes.find((r) => r.id === selectedRouteId) || null;

  // Mode Icon helper
  const getModeIcon = (mode) => {
    switch (mode) {
      case 'TRAIN':
        return <Train className="w-4 h-4 text-amber-500" />;
      case 'BUS':
        return <Bus className="w-4 h-4 text-emerald-500" />;
      case 'FLIGHT':
        return <Plane className="w-4 h-4 text-sky-500" />;
      case 'FERRY':
        return <Anchor className="w-4 h-4 text-teal-500" />;
      case 'CAB':
      case 'TAXI':
        return <Car className="w-4 h-4 text-orange-500" />;
      case 'CAR':
        return <Car className="w-4 h-4 text-purple-500" />;
      default:
        return <Navigation className="w-4 h-4 text-slate-500" />;
    }
  };

  // Price Classification Badge helper
  const renderPriceBadge = (classification) => {
    switch (classification) {
      case 'LIVE_OFFER':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
            ✓ Live Offer
          </span>
        );
      case 'CALCULATED_ESTIMATE':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-200">
            Calculated Estimate
          </span>
        );
      case 'INDICATIVE_ESTIMATE':
      default:
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
            Indicative Estimate
          </span>
        );
    }
  };

  // Save Route to Workspace
  const handleSaveRoute = () => {
    if (!selectedRoute) return;
    const planToSave = {
      tripTitle: `${selectedRoute.title} (${origin.split(',')[0]} to ${destination.split(',')[0]})`,
      destination: destination,
      destinationCity: destination.split(',')[0].trim(),
      originCity: origin.split(',')[0].trim(),
      startDate: departureDate,
      endDate: departureDate,
      travelers,
      totalBudget: selectedRoute.totalCost,
      transitOption: selectedRoute,
      dayPlans: selectedRoute.segments,
    };
    saveGeneratedPlan(planToSave);
  };

  // Print route
  const handlePrint = () => {
    window.print();
  };

  // Share route
  const handleShare = () => {
    navigator.clipboard?.writeText?.(window.location.href);
    addToast('Route link copied to clipboard!', 'info');
  };

  return (
    <div className="min-h-screen bg-[#F5F7F8] pt-16 pb-24 text-[#071A2B]">
      {/* STICKY TOP SEARCH SUMMARY & MODIFIER BAR */}
      <section className="bg-[#071A2B] text-white border-b border-white/10 sticky top-12 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            {/* Search Pill Summary */}
            <div className="flex items-center gap-2 text-xs sm:text-sm font-extrabold flex-wrap">
              <span className="text-white truncate max-w-[150px] sm:max-w-[200px]">{origin}</span>
              <ArrowRight className="w-4 h-4 text-[#FF5A1F] shrink-0" />
              <span className="text-white truncate max-w-[150px] sm:max-w-[200px]">{destination}</span>
              <span className="text-slate-400 font-normal hidden sm:inline">•</span>
              <span className="text-slate-300 font-medium hidden sm:inline">{departureDate}</span>
              <span className="text-slate-400 font-normal hidden sm:inline">•</span>
              <span className="text-slate-300 font-medium hidden sm:inline">{travelers} Travelers</span>
            </div>

            {/* Edit Search / Modify Toggle Button */}
            <button
              onClick={() => setIsModifyingSearch(!isModifyingSearch)}
              className="btn-secondary-cb !bg-white/10 !text-white !border-white/20 hover:!bg-white/20 !py-1.5 !px-4 text-xs font-bold flex items-center gap-1.5 cursor-pointer self-end md:self-auto"
            >
              <Search className="w-3.5 h-3.5 text-[#FF5A1F]" />
              <span>{isModifyingSearch ? 'Close Search' : 'Modify Search'}</span>
              {isModifyingSearch ? <ChevronUp className="w-3.5 h-3.5 ml-1" /> : <ChevronDown className="w-3.5 h-3.5 ml-1" />}
            </button>
          </div>

          {/* Expandable Inline Search Form */}
          {isModifyingSearch && (
            <form onSubmit={handleModifySearch} className="pt-4 pb-2 border-t border-white/10 mt-3 space-y-3 animate-fade-in text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-11 gap-2.5 items-end">
                <div className="lg:col-span-4">
                  <label className="text-[10px] font-bold uppercase text-slate-300 block mb-1">Origin</label>
                  <LocationAutocomplete
                    value={origin}
                    onChange={(val) => setOrigin(val)}
                    onSelectLocation={(loc) => setOrigin(loc.fullName)}
                    theme="dark"
                  />
                </div>

                <div className="hidden lg:flex lg:col-span-1 justify-center pb-2">
                  <button
                    type="button"
                    onClick={handleSwapLocations}
                    className="p-2 rounded-full bg-white/10 hover:bg-[#FF5A1F] text-white transition-colors cursor-pointer"
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="lg:col-span-4">
                  <label className="text-[10px] font-bold uppercase text-slate-300 block mb-1">Destination</label>
                  <LocationAutocomplete
                    value={destination}
                    onChange={(val) => setDestination(val)}
                    onSelectLocation={(loc) => setDestination(loc.fullName)}
                    theme="dark"
                  />
                </div>

                <div className="lg:col-span-2">
                  <button
                    type="submit"
                    disabled={isSearching}
                    className="w-full btn-primary-cb !py-2.5 !px-4 text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-[#FF5A1F]/30"
                  >
                    {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                    <span>Update Routes</span>
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </section>

      {/* MAIN TWO-COLUMN SPLIT LAYOUT (ROME2RIO EXPERIENCE) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN: ROUTES LIST OR DETAILED ROUTE VIEW (7 of 12 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {isSearching ? (
              <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
                <Loader2 className="w-10 h-10 text-[#FF5A1F] animate-spin mx-auto" />
                <h3 className="font-extrabold text-base text-[#071A2B]">Comparing Transport Options...</h3>
                <p className="text-xs text-slate-500">Querying live schedules, IRCTC rails, redBus coaches, and flight fares</p>
              </div>
            ) : selectedRoute ? (
              /* ========================================================================= */
              /* VIEW B: DETAILED ROUTE VIEW (DRILL-DOWN SEGMENT BREAKDOWN)                */
              /* ========================================================================= */
              <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden space-y-6 animate-fade-in">
                {/* Back to Results Header */}
                <div className="p-4 sm:p-5 bg-[#071A2B] text-white flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setSelectedRouteId(null)}
                    className="flex items-center gap-2 text-xs font-extrabold text-slate-300 hover:text-white transition-colors cursor-pointer group"
                  >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform text-[#FF5A1F]" />
                    <span>All Transport Alternatives</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handlePrint}
                      className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                      title="Print Route Details"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={handleShare}
                      className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                      title="Share Route"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveRoute}
                      className="btn-primary-cb !py-1.5 !px-3 text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Bookmark className="w-3.5 h-3.5" />
                      <span>Save Route</span>
                    </button>
                  </div>
                </div>

                <div className="p-6 space-y-6 pt-0">
                  {/* Route Title & Key Stats */}
                  <div className="space-y-2 border-b border-slate-100 pb-5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-xl sm:text-2xl font-black text-[#071A2B]">{selectedRoute.title}</h2>
                      {renderPriceBadge(selectedRoute.priceClassification)}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
                      <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                        <span className="text-[10px] font-bold uppercase text-slate-400 block">Total Travel Time</span>
                        <span className="font-extrabold text-[#071A2B] text-sm mt-0.5 block">{selectedRoute.durationLabel}</span>
                      </div>
                      <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                        <span className="text-[10px] font-bold uppercase text-slate-400 block">Estimated Price</span>
                        <span className="font-extrabold text-[#FF5A1F] text-sm mt-0.5 block">
                          {formatPrice(selectedRoute.priceRange?.min || selectedRoute.costPerPerson)} – {formatPrice(selectedRoute.priceRange?.max || selectedRoute.costPerPerson * 1.3)}
                        </span>
                      </div>
                      <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                        <span className="text-[10px] font-bold uppercase text-slate-400 block">Total Distance</span>
                        <span className="font-extrabold text-[#071A2B] text-sm mt-0.5 block">{selectedRoute.distanceKm} km</span>
                      </div>
                      <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                        <span className="text-[10px] font-bold uppercase text-slate-400 block">Transfers</span>
                        <span className="font-extrabold text-[#071A2B] text-sm mt-0.5 block">
                          {selectedRoute.transfersCount === 0 ? 'Direct (0 Stops)' : `${selectedRoute.transfersCount} Transfer`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* ORDERED SEGMENT-BY-SEGMENT TIMELINE */}
                  <div className="space-y-4">
                    <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-500">
                      Step-by-Step Journey Segments ({selectedRoute.segments?.length || 1})
                    </h3>

                    <div className="space-y-4 relative">
                      {(selectedRoute.segments || []).map((seg, idx) => (
                        <div key={idx} className="space-y-3">
                          {/* Segment Card */}
                          <div className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-[#FF5A1F]/40 shadow-sm transition-all space-y-3">
                            {/* Segment Header */}
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                                  {getModeIcon(seg.mode)}
                                </div>
                                <div>
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF5A1F] block">
                                    Segment {seg.segmentIndex || idx + 1} • {seg.mode}
                                  </span>
                                  <h4 className="font-extrabold text-sm text-[#071A2B]">{seg.name}</h4>
                                </div>
                              </div>

                              <div className="text-right">
                                <span className="font-extrabold text-sm text-[#071A2B] block">{seg.durationLabel}</span>
                                {seg.fareEstimate && (
                                  <span className="text-[11px] font-bold text-slate-500">
                                    {formatPrice(seg.fareEstimate.min)} – {formatPrice(seg.fareEstimate.max)}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Carrier & Service */}
                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs flex flex-wrap items-center justify-between gap-2">
                              <div>
                                <span className="text-slate-400 font-medium">Operator / Service: </span>
                                <span className="font-bold text-[#071A2B]">{seg.carrier || selectedRoute.carrier}</span>
                                {seg.serviceNumber && (
                                  <span className="text-slate-600 font-mono text-[11px] ml-1">({seg.serviceNumber})</span>
                                )}
                              </div>
                              {seg.departureTime && (
                                <div className="text-[11px] text-slate-500 font-semibold">
                                  Dep: {seg.departureTime} → Arr: {seg.arrivalTime}
                                </div>
                              )}
                            </div>

                            {/* Intermediate Stops */}
                            {Array.isArray(seg.intermediateStops) && seg.intermediateStops.length > 0 && (
                              <div className="text-[11px] text-slate-500 space-y-1">
                                <span className="font-semibold text-slate-600">Intermediate Stops: </span>
                                <span>{seg.intermediateStops.join(' • ')}</span>
                              </div>
                            )}

                            {/* Booking Action CTA */}
                            {seg.bookingUrl && (
                              <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                                <span className="text-[11px] text-slate-400">Direct carrier booking</span>
                                <a
                                  href={seg.bookingUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="btn-primary-cb !py-1.5 !px-4 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
                                >
                                  <span>{seg.bookingLabel || 'Book Tickets'}</span>
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              </div>
                            )}
                          </div>

                          {/* Layover / Transfer Notice between segments */}
                          {seg.transferWaitMinutes > 0 && (
                            <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 flex items-center gap-2.5 ml-4">
                              <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                              <div className="text-[11px]">
                                <span className="font-bold">Connection Layover: {seg.transferWaitMinutes} mins. </span>
                                <span>{seg.transferNotice || 'Allow adequate connection time between stations.'}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Data Source & Price Freshness Footer */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Data Provider: <strong className="text-slate-700">{selectedRoute.dataSource || selectedRoute.provider}</strong></span>
                    </div>
                    <span className="text-slate-400">
                      Retrieved: {new Date(selectedRoute.lastRetrieved || Date.now()).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              /* ========================================================================= */
              /* VIEW A: COMPARABLE ROUTE ALTERNATIVES LIST (ROME2RIO DISCOVERY)            */
              /* ========================================================================= */
              <div className="space-y-4">
                {/* Header Summary & Route Count */}
                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h2 className="text-base sm:text-lg font-black text-[#071A2B]">
                        Ways to travel from {origin.split(',')[0]} to {destination.split(',')[0]}
                      </h2>
                      <p className="text-xs text-slate-500">
                        {allRoutes.length} genuine transport alternatives found • {journeyResults?.distanceKm || 0} km
                      </p>
                    </div>

                    {journeyResults?.fastest && (
                      <span className="text-xs bg-[#FF5A1F]/10 text-[#FF5A1F] font-bold px-3 py-1 rounded-full self-start sm:self-auto">
                        Fastest: {journeyResults.fastest.durationLabel}
                      </span>
                    )}
                  </div>

                  {/* SORT TABS (Best, Fastest, Cheapest) */}
                  <div className="flex items-center gap-2 border-t border-slate-100 pt-3 flex-wrap">
                    <span className="text-xs font-bold text-slate-400 mr-1">Sort by:</span>
                    {[
                      { id: 'best', label: '⭐ Recommended' },
                      { id: 'fastest', label: '⚡ Fastest' },
                      { id: 'cheapest', label: '💰 Cheapest' },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setSortBy(tab.id)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                          sortBy === tab.id
                            ? 'bg-[#071A2B] text-white shadow-sm'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* MODE FILTER PILLS */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs pt-1">
                    {[
                      { id: 'ALL', label: `All (${allRoutes.length})` },
                      { id: 'TRAIN', label: 'Train', icon: Train },
                      { id: 'BUS', label: 'Bus', icon: Bus },
                      { id: 'FLIGHT', label: 'Flight', icon: Plane },
                      { id: 'CAB', label: 'Cab / Taxi', icon: Car },
                      { id: 'CAR', label: 'Drive', icon: Navigation },
                      { id: 'FERRY', label: 'Ferry', icon: Anchor },
                    ].map((filter) => {
                      const Icon = filter.icon;
                      return (
                        <button
                          key={filter.id}
                          type="button"
                          onClick={() => setSelectedModeFilter(filter.id)}
                          className={`px-3 py-1 rounded-full font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1 ${
                            selectedModeFilter === filter.id
                              ? 'bg-[#FF5A1F] text-white shadow-md shadow-[#FF5A1F]/30'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {Icon && <Icon className="w-3 h-3" />}
                          <span>{filter.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* ROUTE CARDS LIST */}
                {sortedRoutes.length === 0 ? (
                  <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
                    <Compass className="w-10 h-10 text-slate-400 mx-auto" />
                    <h3 className="font-extrabold text-base text-[#071A2B]">No routes match your active filters</h3>
                    <p className="text-xs text-slate-500">Try switching your mode filter to All to see other travel alternatives.</p>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedModeFilter('ALL');
                        setMaxTransfersFilter('ALL');
                      }}
                      className="btn-primary-cb !text-xs !py-2 !px-4"
                    >
                      Reset Filters
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {sortedRoutes.map((route) => {
                      const isSelected = selectedRouteId === route.id;
                      return (
                        <div
                          key={route.id}
                          onClick={() => setSelectedRouteId(route.id)}
                          className={`p-5 rounded-3xl bg-white border transition-all cursor-pointer hover:shadow-lg space-y-3 ${
                            isSelected
                              ? 'border-[#FF5A1F] ring-2 ring-[#FF5A1F]/30 shadow-md'
                              : 'border-slate-200 hover:border-[#FF5A1F]/60'
                          }`}
                        >
                          {/* Card Top: Mode Chain & Duration */}
                          <div className="flex items-start justify-between gap-3">
                            <div className="space-y-1">
                              {/* Sequence of Mode Badges */}
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {(route.modeSummary || [route.mode]).map((m, i) => (
                                  <React.Fragment key={i}>
                                    <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-[#071A2B] font-bold text-xs flex items-center gap-1">
                                      {getModeIcon(m)}
                                      <span>{m}</span>
                                    </span>
                                    {i < (route.modeSummary || [route.mode]).length - 1 && (
                                      <span className="text-slate-400 text-xs font-bold">➔</span>
                                    )}
                                  </React.Fragment>
                                ))}

                                {route.isBest && (
                                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                                    ⭐ Best Value
                                  </span>
                                )}
                                {route.isCheapest && !route.isBest && (
                                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                                    💰 Cheapest
                                  </span>
                                )}
                              </div>

                              <h3 className="font-extrabold text-base text-[#071A2B] pt-0.5 hover:text-[#FF5A1F] transition-colors">
                                {route.title}
                              </h3>
                            </div>

                            {/* Duration & Price */}
                            <div className="text-right shrink-0">
                              <span className="text-base sm:text-lg font-black text-[#071A2B] block">
                                {route.durationLabel}
                              </span>
                              <span className="text-sm font-extrabold text-[#FF5A1F] block">
                                {formatPrice(route.priceRange?.min || route.costPerPerson)} – {formatPrice(route.priceRange?.max || route.costPerPerson * 1.3)}
                              </span>
                            </div>
                          </div>

                          {/* Operators & Transfers Subtitle */}
                          <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
                            <div className="flex items-center gap-2 truncate">
                              <span>{route.frequency || 'Regular service'}</span>
                              <span>•</span>
                              <span className="font-semibold text-slate-700">
                                {route.transfersCount === 0 ? 'Direct' : `${route.transfersCount} Transfer (${route.transfers?.join(', ') || 'Hub'})`}
                              </span>
                            </div>

                            <span className="text-xs font-bold text-[#FF5A1F] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                              <span>See details</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: INTERACTIVE ROUTE MAP VISUALIZER (5 of 12 cols, Sticky) */}
          <div className="lg:col-span-5 sticky top-28 space-y-4">
            <div className="bg-[#071A2B] rounded-3xl p-6 text-white shadow-xl border border-white/10 space-y-4 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#FF5A1F] animate-ping" />
                  <h3 className="font-extrabold text-sm text-white">Route Visualizer</h3>
                </div>
                <span className="text-[11px] font-bold text-slate-300">
                  {selectedRoute ? selectedRoute.title : 'Overview Map'}
                </span>
              </div>

              {/* ROUTE GEOMETRY & WAYPOINTS CANVAS */}
              <div className="relative rounded-2xl bg-[#0C2438] border border-white/15 p-5 min-h-[300px] flex flex-col justify-between overflow-hidden">
                {/* Visual SVG Map Background Grid */}
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />

                {/* Origin Waypoint Pin */}
                <div className="relative z-10 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs shadow-lg shadow-emerald-500/30">
                    A
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">Starting Point</span>
                    <h4 className="font-black text-sm text-white">{origin.split(',')[0]}</h4>
                    <p className="text-[10px] text-slate-400">{origin.split(',').slice(1).join(', ')}</p>
                  </div>
                </div>

                {/* Dynamic Segment Connection Line with Modes */}
                <div className="relative z-10 my-4 ml-3.5 pl-5 border-l-2 border-dashed border-[#FF5A1F]/60 space-y-3">
                  {selectedRoute ? (
                    (selectedRoute.segments || []).map((seg, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs">
                        <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                          {getModeIcon(seg.mode)}
                        </div>
                        <span className="text-white font-bold">{seg.mode}</span>
                        <span className="text-slate-400 text-[11px]">({seg.durationLabel})</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-slate-400 space-y-1">
                      <p className="font-bold text-slate-300">Multimodal Highway Corridor</p>
                      <p className="text-[11px]">Connecting {journeyResults?.distanceKm || 0} km by road and rail</p>
                    </div>
                  )}
                </div>

                {/* Destination Waypoint Pin */}
                <div className="relative z-10 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-[#FF5A1F] text-white flex items-center justify-center font-bold text-xs shadow-lg shadow-[#FF5A1F]/30">
                    B
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF5A1F] block">Destination</span>
                    <h4 className="font-black text-sm text-white">{destination.split(',')[0]}</h4>
                    <p className="text-[10px] text-slate-400">{destination.split(',').slice(1).join(', ')}</p>
                  </div>
                </div>
              </div>

              {/* Direct Maps Action */}
              <div className="pt-1 flex items-center justify-between text-xs">
                <span className="text-slate-400">Total Distance: <strong className="text-white">{journeyResults?.distanceKm || 0} km</strong></span>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-[#FF5A1F] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Open live in Google Maps</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Rome2Rio Experience Information Pill */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-[#071A2B]">
                <Info className="w-4 h-4 text-[#FF5A1F]" />
                <span>Search Accuracy & Verification</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Routes are calculated using live road distance matrices, real train station enquiry schedules, and verified operator booking paths.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
