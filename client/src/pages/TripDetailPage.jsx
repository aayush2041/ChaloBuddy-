import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import {
  MapPin,
  Calendar,
  Clock,
  Users,
  ShieldCheck,
  Star,
  CheckCircle2,
  XCircle,
  Share2,
  Heart,
  MessageCircle,
  ArrowRight,
  Flame,
  ChevronRight,
  Navigation,
  Sparkles,
  Info,
} from 'lucide-react';

export default function TripDetailPage() {
  const {
    trips,
    currentRoute,
    formatPrice,
    toggleSaveTrip,
    isTripSaved,
    setJoinTripModalData,
    setShareModalData,
    setWriteReviewModalData,
    navigate,
    openDirectChatWithUser,
  } = useStore();

  const tripId = currentRoute.params?.id || 'trip-spiti-valley';
  const trip = trips.find((t) => t.id === tripId) || trips[0];

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [activeTab, setActiveTab] = useState('itinerary'); // 'itinerary' | 'inclusions' | 'meeting' | 'reviews'
  const saved = isTripSaved(trip.id);

  const handleAskOrganizer = () => {
    openDirectChatWithUser(trip.organizer?.id || 'usr_aarav');
  };

  return (
    <div className="min-h-screen bg-[#F5F7F8] pt-24 pb-28">
      {/* Breadcrumb Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <button onClick={() => navigate('home')} className="hover:text-[#071A2B] cursor-pointer">Home</button>
          <ChevronRight className="w-3.5 h-3.5" />
          <button onClick={() => navigate('trips')} className="hover:text-[#071A2B] cursor-pointer">Trips</button>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[#071A2B] font-bold truncate max-w-xs">{trip.title}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Hero Gallery Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 sm:gap-4 h-[380px] sm:h-[460px] rounded-3xl overflow-hidden shadow-lg">
          {/* Main Large Image */}
          <div className="lg:col-span-3 relative h-full bg-slate-900 group">
            <img
              src={trip.images[activeImageIdx] || trip.images[0]}
              alt={trip.title}
              className="w-full h-full object-cover transition-all duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

            {/* Difficulty & Spots Badges */}
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <span className="text-xs px-3.5 py-1 rounded-full font-bold bg-[#071A2B]/80 text-white backdrop-blur-md border border-white/20">
                {trip.difficulty} Difficulty
              </span>
              {trip.spotsLeft && (
                <span className="text-xs px-3 py-1 rounded-full font-bold bg-[#FF5A1F] text-white flex items-center gap-1 shadow-md">
                  <Flame className="w-3.5 h-3.5" />
                  Only {trip.spotsLeft} spots left
                </span>
              )}
            </div>

            {/* Quick Share & Save Buttons */}
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <button
                onClick={() => setShareModalData({ title: trip.title, url: window.location.href })}
                className="w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition-all cursor-pointer"
                title="Share trip"
              >
                <Share2 className="w-4 h-4" />
              </button>

              <button
                onClick={() => toggleSaveTrip(trip.id)}
                className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md transition-all cursor-pointer ${
                  saved ? 'bg-rose-500 text-white' : 'bg-black/40 hover:bg-black/60 text-white border border-white/20'
                }`}
                title="Save trip"
              >
                <Heart className={`w-4 h-4 ${saved ? 'fill-white' : ''}`} />
              </button>
            </div>
          </div>

          {/* Thumbnails Column on Desktop */}
          <div className="hidden lg:grid grid-rows-3 gap-3 h-full">
            {trip.images.slice(0, 3).map((img, idx) => (
              <div
                key={idx}
                onClick={() => setActiveImageIdx(idx)}
                className={`relative rounded-2xl overflow-hidden cursor-pointer border-2 transition-all ${
                  activeImageIdx === idx ? 'border-[#FF5A1F] ring-2 ring-[#FF5A1F]' : 'border-transparent opacity-80 hover:opacity-100'
                }`}
              >
                <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>

        {/* Two-Column Detail Layout: Left Info, Right Sticky Booking Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Details Column */}
          <div className="lg:col-span-8 space-y-8">
            {/* Title, Destination & Rating Header */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
                <span className="flex items-center gap-1 text-[#FF5A1F]">
                  <MapPin className="w-4 h-4" />
                  {trip.destination}
                </span>
                <span>•</span>
                <span>{trip.duration}</span>
                <span>•</span>
                <span className="flex items-center gap-1 text-amber-500">
                  <Star className="w-4 h-4 fill-amber-400" />
                  {trip.rating} ({trip.reviewCount || 42} traveler reviews)
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold text-[#071A2B] tracking-tight">
                {trip.title}
              </h1>

              <p className="text-sm text-slate-600 leading-relaxed">
                {trip.about}
              </p>

              {/* Key Highlights Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-100 text-xs">
                <div className="p-3 rounded-2xl bg-slate-50">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Duration</span>
                  <span className="font-extrabold text-[#071A2B] text-sm mt-0.5 block">{trip.duration}</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Group Size</span>
                  <span className="font-extrabold text-[#071A2B] text-sm mt-0.5 block">Max {trip.maxGroupSize || 12} People</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Difficulty</span>
                  <span className="font-extrabold text-amber-600 text-sm mt-0.5 block">{trip.difficulty}</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Starting Point</span>
                  <span className="font-extrabold text-[#071A2B] text-sm mt-0.5 block truncate">Delhi Hub</span>
                </div>
              </div>
            </div>

            {/* Organizer Card matching Section 9 */}
            <div className="bg-[#0C2438] text-white p-6 rounded-3xl border border-white/10 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <img
                  src={trip.organizer?.avatar}
                  alt={trip.organizer?.name}
                  className="w-16 h-16 rounded-2xl object-cover ring-2 ring-[#FF5A1F]"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-white">{trip.organizer?.name}</h3>
                    <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      Verified Lead
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">
                    {trip.organizer?.rating}★ Lead Rating • {trip.organizer?.tripsHosted} Expeditions Hosted
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Himalayan mountaineering certified • Wilderness first-aid responder
                  </p>
                </div>
              </div>

              <button
                onClick={handleAskOrganizer}
                className="w-full sm:w-auto btn-secondary-cb !bg-white/10 !text-white !border-white/20 hover:!bg-white/20 !text-xs font-bold flex items-center justify-center gap-2 cursor-pointer flex-shrink-0"
              >
                <MessageCircle className="w-4 h-4 text-[#FF5A1F]" />
                <span>Ask Organizer</span>
              </button>
            </div>

            {/* Sections Tabs Navigation */}
            <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1 text-sm font-bold">
              {[
                { id: 'itinerary', label: 'Day-by-Day Itinerary' },
                { id: 'inclusions', label: 'Inclusions & Exclusions' },
                { id: 'meeting', label: 'Meeting Point & Route' },
                { id: 'reviews', label: `Reviews (${trip.reviewCount || 42})` },
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

            {/* Tab 1: Day-by-Day Itinerary Timeline */}
            {activeTab === 'itinerary' && (
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
                <h3 className="font-extrabold text-lg text-[#071A2B]">Detailed Journey Plan</h3>
                <div className="relative pl-6 space-y-8 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {(trip.itinerary || []).map((day, idx) => (
                    <div key={idx} className="relative group">
                      <div className="absolute -left-[27px] top-1 w-4 h-4 rounded-full bg-[#FF5A1F] ring-4 ring-white shadow" />
                      <div>
                        <span className="text-xs font-extrabold text-[#FF5A1F] uppercase tracking-wider block">
                          Day {day.day}
                        </span>
                        <h4 className="text-base font-bold text-[#071A2B] mt-0.5">{day.title}</h4>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">{day.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 2: Inclusions & Exclusions */}
            {activeTab === 'inclusions' && (
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Included */}
                  <div className="space-y-3">
                    <h4 className="font-bold text-sm text-[#071A2B] flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      What's Included
                    </h4>
                    <ul className="space-y-2 text-xs text-slate-600">
                      {(trip.included || []).map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-emerald-500 font-bold">✓</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Excluded */}
                  <div className="space-y-3">
                    <h4 className="font-bold text-sm text-[#071A2B] flex items-center gap-2">
                      <XCircle className="w-5 h-5 text-rose-500" />
                      What's Excluded
                    </h4>
                    <ul className="space-y-2 text-xs text-slate-600">
                      {(trip.excluded || []).map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-rose-500 font-bold">✕</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Meeting Point & Route */}
            {activeTab === 'meeting' && (
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
                <h3 className="font-extrabold text-lg text-[#071A2B]">Logistics & Meeting Point</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-1">
                    <p className="font-bold text-slate-400 uppercase text-[10px]">Assembly Location</p>
                    <p className="font-extrabold text-sm text-[#071A2B]">{trip.meetingPoint}</p>
                    <p className="text-slate-500">Please arrive 30 minutes prior to scheduled departure.</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-1">
                    <p className="font-bold text-slate-400 uppercase text-[10px]">Transport Vehicle</p>
                    <p className="font-extrabold text-sm text-[#071A2B]">{trip.transport}</p>
                    <p className="text-slate-500">Equipped with mountain safety kit and luggage carrier.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 4: Reviews */}
            {activeTab === 'reviews' && (
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div>
                    <h3 className="font-extrabold text-lg text-[#071A2B]">Traveler Reviews</h3>
                    <p className="text-xs text-slate-500">Verified reviews from past participants</p>
                  </div>
                  <button
                    onClick={() => setWriteReviewModalData({ title: trip.title })}
                    className="btn-primary-cb !py-2 !px-4 !text-xs font-bold cursor-pointer"
                  >
                    Write a Review
                  </button>
                </div>

                <div className="space-y-4">
                  {[
                    {
                      name: 'Rohan Verma',
                      date: 'Oct 2025',
                      rating: 5,
                      text: 'Aarav is an exceptional lead! He paced the hike perfectly for high altitude acclimatization and the homestays served delicious steaming hot Thukpa and momos.',
                    },
                    {
                      name: 'Ananya Sen',
                      date: 'Sep 2025',
                      rating: 5,
                      text: 'The Chandratal night sky was breathtaking. The group chemistry was unmatched and we are already planning our next trek together with ChaloBuddy.',
                    },
                  ].map((rev, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#071A2B]">{rev.name}</span>
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: rev.rating }).map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                      </div>
                      <p className="text-slate-600 leading-relaxed">{rev.text}</p>
                      <span className="text-[10px] text-slate-400">{rev.date} • Verified Traveler</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Group Members Avatars Section */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
              <h3 className="font-bold text-sm text-[#071A2B]">
                Fellow Travelers on this Trip ({trip.currentGroupSize || 8} Joined)
              </h3>
              <div className="flex flex-wrap items-center gap-3">
                {(trip.travelerAvatars || []).map((avatar, idx) => (
                  <img
                    key={idx}
                    src={avatar}
                    alt="Member"
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-[#FF5A1F]"
                  />
                ))}
                <div className="w-12 h-12 rounded-full bg-slate-100 border border-dashed border-slate-300 flex items-center justify-center text-xs font-bold text-slate-500">
                  +{trip.spotsLeft || 4} left
                </div>
              </div>
            </div>
          </div>

          {/* Right Sticky Booking Card matching Section 9 */}
          <div className="lg:col-span-4 sticky top-28 space-y-4">
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xl space-y-5">
              <div>
                <span className="text-xs text-slate-500 font-medium block">Price per traveler</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-3xl font-black text-[#071A2B]">
                    {formatPrice(trip.price)}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">all-inclusive</span>
                </div>
              </div>

              {/* Trip Dates & Spots */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Dates:</span>
                  <span className="font-bold text-[#071A2B]">{trip.dates}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Duration:</span>
                  <span className="font-bold text-[#071A2B]">{trip.duration}</span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-slate-200">
                  <span className="text-slate-500">Availability:</span>
                  <span className="font-extrabold text-[#FF5A1F]">
                    {trip.spotsLeft || 4} spots available
                  </span>
                </div>
              </div>

              {/* Primary Sticky Join CTA */}
              <button
                onClick={() => setJoinTripModalData(trip)}
                className="w-full btn-primary-cb !py-3.5 !text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#FF5A1F]/30"
              >
                <span>Join This Trip</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Secondary CTA buttons */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => toggleSaveTrip(trip.id)}
                  className="btn-secondary-cb !py-2 !text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Heart className={`w-3.5 h-3.5 ${saved ? 'fill-rose-500 text-rose-500' : ''}`} />
                  <span>{saved ? 'Saved' : 'Save Trip'}</span>
                </button>

                <button
                  onClick={() => setShareModalData({ title: trip.title, url: window.location.href })}
                  className="btn-secondary-cb !py-2 !text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share</span>
                </button>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center gap-2 text-[11px] text-emerald-600">
                <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                <span>Verified lead organizer • Free cancellation up to 48h</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Booking Bar */}
      <div className="lg:hidden fixed bottom-[52px] left-0 right-0 z-30 bg-[#071A2B]/95 backdrop-blur-xl border-t border-white/10 px-4 py-2.5 flex items-center justify-between shadow-2xl">
        <div>
          <span className="text-[10px] text-slate-400 block uppercase font-bold">Contribution</span>
          <div className="flex items-baseline gap-1">
            <span className="text-base font-black text-white">{formatPrice(trip.price)}</span>
            <span className="text-[10px] text-slate-400">/ person</span>
          </div>
        </div>
        <button
          onClick={() => setJoinTripModalData(trip)}
          className="btn-primary-cb !py-2.5 !px-5 !text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-md shadow-[#FF5A1F]/30"
        >
          <span>Join Trip</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
