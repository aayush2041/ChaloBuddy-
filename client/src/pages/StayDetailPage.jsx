import React, { useState, useRef } from 'react';
import { useStore } from '../context/StoreContext';
import GoogleMapsView from '../components/GoogleMapsView';
import DatePicker, { parseDate } from '../components/DatePicker';
import {
  MapPin,
  Star,
  CheckCircle2,
  ShieldCheck,
  Calendar,
  Users,
  Wifi,
  Sparkles,
  Share2,
  Heart,
  ChevronRight,
  ArrowRight,
  Home,
  Check,
} from 'lucide-react';

export default function StayDetailPage() {
  const {
    stays,
    currentRoute,
    formatPrice,
    toggleSaveStay,
    isStaySaved,
    setReserveStayModalData,
    setShareModalData,
    navigate,
  } = useStore();

  const stayId = currentRoute.params?.id || 'stay-himalayan-stay';
  const stay = stays.find((s) => s.id === stayId) || stays[0];

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [checkIn, setCheckIn] = useState('15 Nov 2026');
  const [checkOut, setCheckOut] = useState('18 Nov 2026');
  const [guestCount, setGuestCount] = useState(2);
  const datePickerRef = useRef(null);

  const saved = isStaySaved(stay.id);

  const rooms = stay.rooms || [
    { id: 'rm_1', name: 'Deluxe Apple Orchard Room', price: stay.pricePerNight, capacity: '2 Guests', beds: '1 King Bed' },
  ];

  const selectedRoom = rooms.find((r) => r.id === selectedRoomId) || rooms[0];

  // Calculate nights dynamically without UTC timezone drift
  const sDate = parseDate(checkIn);
  const eDate = parseDate(checkOut);
  const diffTime = sDate && eDate ? eDate.getTime() - sDate.getTime() : 0;
  const nights = !isNaN(diffTime) && diffTime > 0 ? Math.max(1, Math.round(diffTime / (1000 * 60 * 60 * 24))) : 3;
  const subtotal = selectedRoom.price * nights;
  const serviceFee = Math.round(subtotal * 0.08);
  const totalAmount = subtotal + serviceFee;

  const handleOpenReserveModal = () => {
    setReserveStayModalData(stay);
  };

  return (
    <div className="min-h-screen bg-[#F5F7F8] pt-24 pb-28">
      {/* Breadcrumbs */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-3">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <button onClick={() => navigate('home')} className="hover:text-[#071A2B] cursor-pointer">Home</button>
          <ChevronRight className="w-3.5 h-3.5" />
          <button onClick={() => navigate('stays')} className="hover:text-[#071A2B] cursor-pointer">Stays</button>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[#071A2B] font-bold truncate max-w-xs">{stay.name}</span>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 space-y-8">
        {/* Image Gallery */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 sm:gap-4 h-[360px] sm:h-[440px] rounded-3xl overflow-hidden shadow-lg">
          <div className="lg:col-span-3 relative h-full bg-slate-900">
            <img
              src={stay.images[activeImageIdx] || stay.images[0]}
              alt={stay.name}
              className="w-full h-full object-cover transition-all duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />

            {/* Badges */}
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <span className="text-xs px-3.5 py-1 rounded-full font-bold bg-[#071A2B]/85 text-white backdrop-blur-md border border-white/20">
                {stay.propertyType}
              </span>
              <span className="text-xs px-3 py-1 rounded-full font-bold bg-amber-500 text-white flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-white" />
                {stay.rating} ({stay.reviewCount} reviews)
              </span>
            </div>

            {/* Top Right Save & Share */}
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <button
                onClick={() => setShareModalData({ title: stay.name, url: window.location.href })}
                className="w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-md border border-white/20 cursor-pointer"
                title="Share stay"
              >
                <Share2 className="w-4 h-4" />
              </button>

              <button
                onClick={() => toggleSaveStay(stay.id)}
                className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md cursor-pointer ${
                  saved ? 'bg-rose-500 text-white' : 'bg-black/40 hover:bg-black/60 text-white border border-white/20'
                }`}
                title="Save stay"
              >
                <Heart className={`w-4 h-4 ${saved ? 'fill-white' : ''}`} />
              </button>
            </div>
          </div>

          {/* Thumbnails */}
          <div className="hidden lg:grid grid-rows-3 gap-3 h-full">
            {stay.images.slice(0, 3).map((img, idx) => (
              <div
                key={idx}
                onClick={() => setActiveImageIdx(idx)}
                className={`relative rounded-2xl overflow-hidden cursor-pointer border-2 transition-all ${
                  activeImageIdx === idx ? 'border-[#FF5A1F] ring-2 ring-[#FF5A1F]' : 'border-transparent opacity-80 hover:opacity-100'
                }`}
              >
                <img src={img} alt="Thumb" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>

        {/* 2-Column Info & Sticky Booking Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Details */}
          <div className="lg:col-span-8 space-y-8">
            {/* Header info */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <MapPin className="w-4 h-4 text-[#FF5A1F]" />
                <span className="font-semibold text-slate-700">{stay.location}</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-[#071A2B]">
                {stay.name}
              </h1>
              <p className="text-sm text-slate-600 leading-relaxed pt-2">
                {stay.description}
              </p>
            </div>

            {/* Host info card */}
            <div className="bg-[#0C2438] text-white p-6 rounded-3xl border border-white/10 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <img
                  src={stay.host?.avatar}
                  alt={stay.host?.name}
                  className="w-14 h-14 rounded-2xl object-cover ring-2 ring-[#FF5A1F]"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-sm text-white">{stay.host?.name}</h3>
                    <span className="bg-amber-500/20 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
                      ★ Superhost
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">Response Rate: {stay.host?.responseRate || '100%'}</p>
                </div>
              </div>

              <div className="text-right text-xs text-slate-300 hidden sm:block">
                <p className="font-bold text-white">ChaloBuddy Verified Stay</p>
                <p className="text-[11px] text-slate-400">Inspected for safety, hygiene & power backup</p>
              </div>
            </div>

            {/* Amenities Grid */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
              <h3 className="font-extrabold text-lg text-[#071A2B]">Amenities & Facilities</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                {(stay.amenities || []).map((amenity, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-slate-50 border border-slate-200/60 flex items-center gap-2.5 text-slate-700 font-medium"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Rooms Available */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
              <h3 className="font-extrabold text-lg text-[#071A2B]">Available Room Categories</h3>
              <div className="space-y-3">
                {rooms.map((room) => (
                  <div
                    key={room.id}
                    onClick={() => setSelectedRoomId(room.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      selectedRoom.id === room.id
                        ? 'bg-orange-50/50 border-[#FF5A1F] ring-1 ring-[#FF5A1F]'
                        : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <h4 className="font-bold text-sm text-[#071A2B]">{room.name}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{room.beds} • Max {room.capacity}</p>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4">
                      <div className="text-right">
                        <span className="font-extrabold text-base text-[#FF5A1F]">
                          {formatPrice(room.price)}
                        </span>
                        <span className="text-[11px] text-slate-400 block">/ night</span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedRoomId(room.id);
                        }}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                          selectedRoom.id === room.id
                            ? 'bg-[#FF5A1F] text-white'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {selectedRoom.id === room.id ? 'Selected' : 'Select Room'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* House Rules */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-3 text-xs">
              <h3 className="font-bold text-sm text-[#071A2B]">House Rules & Guidelines</h3>
              <ul className="space-y-1.5 text-slate-600">
                {(stay.rules || ['Check-in: 1:00 PM', 'Check-out: 11:00 AM']).map((rule, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF5A1F]" />
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Google Maps & Location Information */}
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
              <div>
                <h3 className="font-bold text-base text-[#071A2B] flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#FF5A1F]" />
                  <span>Google Maps & Location</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {stay.location} • Verified GPS Coordinates: {stay.lat || 32.2530}° N, {stay.lng || 77.1887}° E
                </p>
              </div>

              <GoogleMapsView
                stays={[stay]}
                selectedStay={stay}
                height="340px"
                interactive={false}
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="font-bold text-[#071A2B] block">Road Access</span>
                  <span className="text-slate-500 text-[11px]">All-weather road connectivity with on-site parking.</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="font-bold text-[#071A2B] block">Nearby Walking Trails</span>
                  <span className="text-slate-500 text-[11px]">Pine forest paths & river viewpoints within 5 mins walk.</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="font-bold text-[#071A2B] block">Local Cafes</span>
                  <span className="text-slate-500 text-[11px]">Artisan bakeries and organic bistros along the market lane.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sticky Booking Panel matching Section 12 */}
          <div className="lg:col-span-4 sticky top-28 space-y-4">
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xl space-y-5">
              <div>
                <span className="text-xs text-slate-500 font-medium block">Starting from</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-3xl font-black text-[#071A2B]">
                    {formatPrice(selectedRoom.price)}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">/ night</span>
                </div>
              </div>

              {/* Date Pickers */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-3 text-xs">
                <div>
                  <label className="text-slate-500 text-[10px] uppercase font-bold block mb-1">Check-in — Check-out</label>
                  <div
                    className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 focus-within:border-[#FF5A1F] cursor-pointer"
                    onClick={() => datePickerRef.current?.open()}
                  >
                    <div onClick={(e) => e.stopPropagation()}>
                      <DatePicker
                        ref={datePickerRef}
                        mode="range"
                        theme="light"
                        label=""
                        placeholder="Select dates"
                        value={{ start: checkIn, end: checkOut }}
                        onChange={(dates) => {
                          if (dates?.start && dates?.end) {
                            setCheckIn(dates.start);
                            setCheckOut(dates.end);
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-slate-500 text-[10px] uppercase font-bold block mb-1">Guests</label>
                  <select
                    value={guestCount}
                    onChange={(e) => setGuestCount(Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 rounded-xl px-2 py-1.5 text-slate-800 font-semibold cursor-pointer"
                  >
                    <option value={1}>1 Guest</option>
                    <option value={2}>2 Guests</option>
                    <option value={3}>3 Guests</option>
                    <option value={4}>4 Guests</option>
                  </select>
                </div>
              </div>

              {/* Price Calculation */}
              <div className="space-y-2 text-xs border-t border-slate-100 pt-3">
                <div className="flex justify-between text-slate-600">
                  <span>{formatPrice(selectedRoom.price)} × {nights} nights</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>ChaloBuddy platform & support fee (8%)</span>
                  <span>{formatPrice(serviceFee)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-100 text-sm font-bold text-[#071A2B]">
                  <span>Total (incl. taxes)</span>
                  <span className="text-[#FF5A1F] text-base">{formatPrice(totalAmount)}</span>
                </div>
              </div>

              {/* Primary Reserve Button */}
              <button
                onClick={handleOpenReserveModal}
                className="w-full btn-primary-cb !py-3.5 !text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#FF5A1F]/30"
              >
                <span>Reserve Room</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 text-[11px] text-emerald-600 justify-center">
                <ShieldCheck className="w-4 h-4" />
                <span>Instant reservation • No upfront charge required</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Reservation Bar */}
      <div className="lg:hidden fixed bottom-[52px] left-0 right-0 z-30 bg-[#071A2B]/95 backdrop-blur-xl border-t border-white/10 px-4 py-2.5 flex items-center justify-between shadow-2xl">
        <div>
          <span className="text-[10px] text-slate-400 block uppercase font-bold">Total ({nights} nights)</span>
          <div className="flex items-baseline gap-1">
            <span className="text-base font-black text-white">{formatPrice(totalAmount)}</span>
            <span className="text-[10px] text-slate-400">incl. taxes</span>
          </div>
        </div>
        <button
          onClick={handleOpenReserveModal}
          className="btn-primary-cb !py-2.5 !px-5 !text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-md shadow-[#FF5A1F]/30"
        >
          <span>Reserve</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
