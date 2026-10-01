import React, { useState, useMemo, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import StayCard from '../components/StayCard';
import GoogleMapsView from '../components/GoogleMapsView';
import DestinationAutocomplete from '../components/DestinationAutocomplete';
import { DESTINATIONS_DATABASE } from '../data/destinationsData';
import {
  Search,
  Home,
  SlidersHorizontal,
  MapPin,
  Calendar,
  Users,
  Wallet,
  Star,
  CheckCircle2,
  Grid,
  Map as MapIcon,
  Layers,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

export default function StaysPage() {
  const { stays, formatPrice, currentRoute, selectedLocation, setSelectedLocation } = useStore();

  const [destination, setDestination] = useState(
    currentRoute?.params?.destination || (selectedLocation ? selectedLocation.city : '')
  );
  const [selectedType, setSelectedType] = useState('All');
  const [maxPrice, setMaxPrice] = useState(6000);
  const [minRating, setMinRating] = useState(4.0);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'split'
  const [selectedStay, setSelectedStay] = useState(null);

  const propertyTypes = ['All', 'Cottage', 'Resort', 'Hostel', 'Chalet', 'Haveli', 'Villa'];

  const filteredStays = useMemo(() => {
    return stays.filter((stay) => {
      if (destination.trim()) {
        const query = destination.toLowerCase().trim();
        const matchesLoc = stay.location?.toLowerCase().includes(query);
        const matchesName = stay.name?.toLowerCase().includes(query);
        const matchesState = stay.state?.toLowerCase().includes(query);
        if (!matchesLoc && !matchesName && !matchesState) return false;
      }

      if (selectedType !== 'All' && !stay.propertyType.toLowerCase().includes(selectedType.toLowerCase())) {
        return false;
      }

      if (stay.pricePerNight > maxPrice) {
        return false;
      }

      if (stay.rating < minRating) {
        return false;
      }

      return true;
    });
  }, [stays, destination, selectedType, maxPrice, minRating]);

  // Update selectedStay when filtered list changes
  useEffect(() => {
    if (filteredStays.length > 0) {
      if (!selectedStay || !filteredStays.find((s) => s.id === selectedStay.id)) {
        setSelectedStay(filteredStays[0]);
      }
    } else {
      setSelectedStay(null);
    }
  }, [filteredStays]);

  return (
    <div className="min-h-screen bg-[#F5F7F8] pt-24 pb-28">
      {/* Top Banner with Search & View Mode Switcher */}
      <div className="bg-[#071A2B] text-white py-10 px-4 sm:px-6 lg:px-8 border-b border-white/10">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#FF5A1F] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Curated Boutique Stays & Resorts
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white mt-1">
                Find Stays Across India
              </h1>
              <p className="text-xs sm:text-sm text-slate-300">
                Heritage Mughal havelis, pine-forest wooden chalets, riverfront eco-resorts & scenic stays.
              </p>
            </div>

            {/* View Mode Switcher: Grid vs Map Split View */}
            <div className="flex items-center gap-2 bg-[#0C2438] p-1 rounded-2xl border border-white/15 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-[#FF5A1F] text-white shadow-md'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Grid className="w-3.5 h-3.5" />
                <span>Grid View</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('split')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'split'
                    ? 'bg-[#FF5A1F] text-white shadow-md'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <MapIcon className="w-3.5 h-3.5" />
                <span>Map Split View</span>
              </button>
            </div>
          </div>

          {/* Search & Filter Bar with Destination Typeahead */}
          <div className="bg-[#0C2438] p-3 rounded-2xl border border-white/15 shadow-xl grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Field 1: Autocomplete Destination Search */}
            <div className="flex items-center gap-2.5 px-3 py-1.5 bg-[#071A2B] rounded-xl border border-white/10 relative">
              <MapPin className="w-4 h-4 text-[#FF5A1F] flex-shrink-0" />
              <div className="flex-1 min-w-0">
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
                  placeholder="Where to stay? (e.g. Delhi, Dehradun, Manali)"
                  theme="dark"
                />
              </div>
            </div>

            {/* Field 2: Max Price */}
            <div className="flex items-center gap-2.5 px-3 py-1.5 bg-[#071A2B] rounded-xl border border-white/10 text-xs">
              <Wallet className="w-4 h-4 text-[#FF5A1F] flex-shrink-0" />
              <div className="w-full flex items-center justify-between">
                <span className="text-slate-400">Nightly max:</span>
                <span className="font-bold text-white">{formatPrice(maxPrice)}</span>
              </div>
            </div>

            {/* Field 3: Property Type Filter */}
            <div className="flex items-center gap-2">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full bg-[#071A2B] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none cursor-pointer"
              >
                <option value="All">All Property Types</option>
                <option value="Cottage">Wooden Cottages</option>
                <option value="Resort">Eco Resorts</option>
                <option value="Hostel">Social Hostels</option>
                <option value="Chalet">Kathkuni Chalets</option>
                <option value="Haveli">Heritage Havelis</option>
                <option value="Villa">Private Villas</option>
              </select>
            </div>
          </div>

          {/* Quick Location Suggestion Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Quick Filter:
            </span>
            {[
              { label: 'All Stays', value: '' },
              { label: 'Delhi', value: 'Delhi' },
              { label: 'Dehradun', value: 'Dehradun' },
              { label: 'Deoghar', value: 'Deoghar' },
              { label: 'Old Manali', value: 'Manali' },
              { label: 'Kasol', value: 'Kasol' },
              { label: 'Goa', value: 'Goa' },
            ].map(({ label, value }) => (
              <button
                key={label}
                type="button"
                onClick={() => setDestination(value)}
                className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer transition-colors ${
                  destination.toLowerCase() === value.toLowerCase()
                    ? 'bg-[#FF5A1F] text-white shadow-sm'
                    : 'bg-white/10 hover:bg-white/20 text-slate-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 pt-8">
        {/* Results Counter & Reset */}
        <div className="flex items-center justify-between mb-6 text-xs text-slate-500">
          <p>
            Showing <span className="font-extrabold text-[#071A2B]">{filteredStays.length}</span> verified boutique stays
            {destination && (
              <span> in <span className="font-bold text-[#FF5A1F]">"{destination}"</span></span>
            )}
          </p>

          <div className="flex items-center gap-3">
            {(selectedType !== 'All' || destination || maxPrice < 6000) && (
              <button
                onClick={() => {
                  setDestination('');
                  setSelectedType('All');
                  setMaxPrice(6000);
                }}
                className="text-[#FF5A1F] hover:underline font-bold cursor-pointer"
              >
                Reset filters
              </button>
            )}

            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'split' : 'grid')}
              className="font-bold text-[#071A2B] hover:text-[#FF5A1F] flex items-center gap-1 cursor-pointer"
            >
              {viewMode === 'grid' ? (
                <>
                  <MapIcon className="w-3.5 h-3.5 text-[#FF5A1F]" />
                  <span>Show on Google Maps</span>
                </>
              ) : (
                <>
                  <Grid className="w-3.5 h-3.5 text-[#FF5A1F]" />
                  <span>Show as Grid</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* View Mode 1: MAP SPLIT VIEW (Google Maps on Left + Stays on Right) */}
        {viewMode === 'split' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Interactive Google Maps Embed */}
            <div className="lg:col-span-6 lg:sticky lg:top-24 space-y-4">
              <GoogleMapsView
                stays={filteredStays}
                selectedStay={selectedStay}
                onSelectStay={(stay) => setSelectedStay(stay)}
                destinationName={destination}
                height="560px"
                interactive={true}
              />

              {/* Active Stay Preview Detail Card */}
              {selectedStay && (
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <img
                      src={selectedStay.images[0]}
                      alt={selectedStay.name}
                      className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                    />
                    <div className="overflow-hidden">
                      <span className="text-[10px] font-bold uppercase text-[#FF5A1F]">
                        Selected on Map
                      </span>
                      <h4 className="font-extrabold text-sm text-[#071A2B] truncate">
                        {selectedStay.name}
                      </h4>
                      <p className="text-xs text-slate-500 truncate">{selectedStay.location}</p>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <span className="text-xs text-slate-400 block">Nightly</span>
                    <span className="font-black text-[#071A2B] text-base">
                      {formatPrice(selectedStay.pricePerNight)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Scrollable Stay Cards */}
            <div className="lg:col-span-6 space-y-4">
              {filteredStays.length === 0 ? (
                <div className="bg-white p-12 rounded-3xl text-center space-y-4 border border-slate-200">
                  <Home className="w-10 h-10 text-[#FF5A1F] mx-auto" />
                  <h3 className="font-bold text-base text-[#071A2B]">No stays found</h3>
                  <p className="text-xs text-slate-500">Try changing your price range or destination keywords.</p>
                </div>
              ) : (
                filteredStays.map((stay) => {
                  const isSelected = selectedStay?.id === stay.id;
                  return (
                    <div
                      key={stay.id}
                      onMouseEnter={() => setSelectedStay(stay)}
                      className={`transition-all rounded-3xl ${
                        isSelected ? 'ring-2 ring-[#FF5A1F] shadow-xl' : ''
                      }`}
                    >
                      <StayCard stay={stay} />
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ) : (
          /* View Mode 2: STANDARD GRID VIEW */
          <div>
            {filteredStays.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl text-center space-y-4 border border-slate-200">
                <Home className="w-10 h-10 text-[#FF5A1F] mx-auto" />
                <h3 className="font-bold text-base text-[#071A2B]">No stays found</h3>
                <p className="text-xs text-slate-500">Try changing your price range or destination keywords.</p>
              </div>
            ) : (
              <div className="space-y-8">
                {/* 3-Column Stays Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                  {filteredStays.map((stay) => (
                    <StayCard key={stay.id} stay={stay} />
                  ))}
                </div>

                {/* Google Maps Bottom Showcase Banner */}
                <div className="bg-[#0C2438] rounded-3xl p-6 sm:p-8 text-white border border-white/10 shadow-2xl overflow-hidden relative">
                  <div className="max-w-2xl space-y-3 relative z-10">
                    <span className="text-xs font-bold uppercase text-[#FF5A1F] tracking-wider flex items-center gap-1.5">
                      <MapIcon className="w-4 h-4" />
                      Interactive Google Maps Listing
                    </span>
                    <h3 className="text-2xl font-extrabold text-white">
                      Explore All {filteredStays.length} Stays on an Interactive Map
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-300">
                      View exact property coordinates, nearby mountain trails, cafes, and get turn-by-turn driving directions directly with Google Maps.
                    </p>
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setViewMode('split');
                          window.scrollTo({ top: 300, behavior: 'smooth' });
                        }}
                        className="btn-primary-cb !py-2.5 !px-5 !text-xs font-bold inline-flex items-center gap-2 cursor-pointer shadow-lg shadow-[#FF5A1F]/30"
                      >
                        <MapIcon className="w-4 h-4" />
                        <span>Open Split Map View</span>
                      </button>
                    </div>
                  </div>

                  <div className="mt-6 rounded-2xl overflow-hidden shadow-xl border border-white/10">
                    <GoogleMapsView
                      stays={filteredStays}
                      selectedStay={filteredStays[0]}
                      height="380px"
                      interactive={true}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
