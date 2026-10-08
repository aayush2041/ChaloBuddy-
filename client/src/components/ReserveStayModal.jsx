import React, { useState, useRef } from 'react';
import { useStore } from '../context/StoreContext';
import DatePicker, { parseDate } from './DatePicker';
import {
  X,
  Calendar,
  Users,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Star,
  Home,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ReserveStayModal() {
  const {
    reserveStayModalData,
    setReserveStayModalData,
    reserveStay,
    formatPrice,
    navigate,
  } = useStore();

  const [checkIn, setCheckIn] = useState('15 Nov 2026');
  const [checkOut, setCheckOut] = useState('18 Nov 2026');
  const [guests, setGuests] = useState(2);
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const datePickerRef = useRef(null);

  if (!reserveStayModalData) return null;
  const stay = reserveStayModalData;

  const rooms = stay.rooms || [
    { id: 'def_1', name: 'Deluxe Mountain Room', price: stay.pricePerNight, capacity: '2 Guests', beds: '1 King Bed' },
  ];

  const selectedRoom = rooms.find((r) => r.id === selectedRoomId) || rooms[0];

  // Calculate nights dynamically without UTC timezone drift
  const sDate = parseDate(checkIn);
  const eDate = parseDate(checkOut);
  const diffTime = sDate && eDate ? eDate.getTime() - sDate.getTime() : 0;
  const nights = !isNaN(diffTime) && diffTime > 0 ? Math.max(1, Math.round(diffTime / (1000 * 60 * 60 * 24))) : 3;
  const roomPrice = selectedRoom.price || stay.pricePerNight;
  const subtotal = roomPrice * nights;
  const serviceFee = Math.round(subtotal * 0.08);
  const totalAmount = subtotal + serviceFee;

  const handleReserve = () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setTimeout(() => {
      reserveStay(stay.id, {
        checkIn,
        checkOut,
        guests,
        roomName: selectedRoom.name,
        totalAmount,
      });
      setIsSubmitting(false);
      setIsConfirmed(true);

      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#FF5A1F', '#071A2B', '#10B981'],
        });
      } catch (err) {
        // ignore
      }
    }, 800);
  };

  const handleClose = () => {
    setReserveStayModalData(null);
    setIsConfirmed(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#0C2438] text-white w-full max-w-lg rounded-3xl border border-white/15 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-[#071A2B]">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-full bg-[#FF5A1F]/20 text-[#FF5A1F] flex items-center justify-center font-bold text-sm">
              🏡
            </span>
            <div>
              <h3 className="font-bold text-base text-white">Reserve Your Stay</h3>
              <p className="text-xs text-slate-400 truncate max-w-[200px] sm:max-w-xs">{stay.name}</p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4 sm:space-y-5">
          {isConfirmed ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-500/10 animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <h4 className="text-2xl font-extrabold text-white">Stay Reserved!</h4>
                <p className="text-xs text-slate-300 mt-1 max-w-md mx-auto">
                  Your reservation at <span className="text-[#FF5A1F] font-bold">{stay.name}</span> has been confirmed. The host has been notified.
                </p>
              </div>

              <div className="bg-[#071A2B] p-4 rounded-2xl border border-white/10 max-w-sm mx-auto text-left text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Room:</span>
                  <span className="font-semibold text-white truncate max-w-[180px]">{selectedRoom.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Duration:</span>
                  <span className="font-semibold text-white">{nights} Nights ({checkIn} to {checkOut})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Guests:</span>
                  <span className="font-semibold text-white">{guests} Guests</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-white/10">
                  <span className="text-slate-400">Total Paid:</span>
                  <span className="font-bold text-[#FF5A1F]">{formatPrice(totalAmount)}</span>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-center gap-3">
                <button
                  onClick={() => {
                    handleClose();
                    navigate('my-trips');
                  }}
                  className="btn-primary-cb !text-xs cursor-pointer"
                >
                  View My Bookings →
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Dates Picker */}
              <div className="text-xs">
                <label className="block text-slate-300 font-medium mb-1">Stay Dates (Check-in & Check-out)</label>
                <div
                  className="bg-[#071A2B] border border-white/15 rounded-xl px-3.5 py-2.5 focus-within:border-[#FF5A1F] cursor-pointer"
                  onClick={() => datePickerRef.current?.open()}
                >
                  <div onClick={(e) => e.stopPropagation()}>
                    <DatePicker
                      ref={datePickerRef}
                      mode="range"
                      theme="dark"
                      label=""
                      placeholder="Select check-in & check-out dates"
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

              {/* Guests Count */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Number of Guests</label>
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 3, 4].map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGuests(g)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        guests === g
                          ? 'bg-[#FF5A1F] text-white border-[#FF5A1F]'
                          : 'bg-[#071A2B] text-slate-300 border-white/10 hover:border-white/20'
                      }`}
                    >
                      {g} {g === 1 ? 'Guest' : 'Guests'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Room Selection */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Select Room Option</label>
                <div className="space-y-2">
                  {rooms.map((room) => (
                    <div
                      key={room.id}
                      onClick={() => setSelectedRoomId(room.id)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                        selectedRoom.id === room.id
                          ? 'bg-[#071A2B] border-[#FF5A1F] ring-1 ring-[#FF5A1F]'
                          : 'bg-[#071A2B]/50 border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div>
                        <p className="font-bold text-xs text-white">{room.name}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">{room.beds} • {room.capacity}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-sm text-[#FF5A1F]">{formatPrice(room.price)}</span>
                        <span className="text-[10px] text-slate-400 block">/ night</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="bg-[#071A2B] p-4 rounded-2xl border border-white/10 space-y-2 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>{formatPrice(roomPrice)} × {nights} nights</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>ChaloBuddy Service & Platform Fee (8%)</span>
                  <span>{formatPrice(serviceFee)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-white/10 text-sm font-bold text-white">
                  <span>Total Due</span>
                  <span className="text-[#FF5A1F] text-base">{formatPrice(totalAmount)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-emerald-400 bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20">
                <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                <span>Instant Confirmation • No booking fee charged for early reservations.</span>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {!isConfirmed && (
          <div className="p-4 border-t border-white/10 bg-[#071A2B] flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 block">Total Price</span>
              <span className="text-base font-extrabold text-[#FF5A1F]">{formatPrice(totalAmount)}</span>
            </div>

            <button
              onClick={handleReserve}
              disabled={isSubmitting}
              className="btn-primary-cb !py-2.5 !px-6 !text-xs font-bold flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Reserving Room...</span>
              ) : (
                <>
                  <span>Confirm Reservation</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
