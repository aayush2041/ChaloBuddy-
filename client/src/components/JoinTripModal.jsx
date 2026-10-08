import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import {
  X,
  Users,
  Calendar,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  MapPin,
  Clock,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function JoinTripModal() {
  const {
    joinTripModalData,
    setJoinTripModalData,
    currentUser,
    joinTrip,
    formatPrice,
    navigate,
  } = useStore();

  const [step, setStep] = useState(1);
  const [travelersCount, setTravelersCount] = useState(1);
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: '+91 98765 43210',
    emergencyContact: '+91 98765 00000',
    messageToOrganizer: 'Hi! Really excited to join this adventure. Have good fitness and love mountain views!',
    specialRequirements: 'Vegetarian meals preferred.',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  if (!joinTripModalData) return null;
  const trip = joinTripModalData;

  const totalCost = trip.price * travelersCount;

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setTimeout(() => {
      joinTrip(trip.id, {
        travelersCount,
        ...formData,
      });
      setIsSubmitting(false);
      setIsConfirmed(true);

      // Trigger celebratory confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#FF5A1F', '#071A2B', '#10B981'],
        });
      } catch (err) {
        // ignore
      }
    }, 900);
  };

  const handleClose = () => {
    setJoinTripModalData(null);
    setStep(1);
    setIsConfirmed(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div data-testid="join-trip-modal" className="bg-[#0C2438] text-white w-full max-w-xl rounded-3xl border border-white/15 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-[#071A2B]">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-full bg-[#FF5A1F]/20 text-[#FF5A1F] flex items-center justify-center font-bold text-sm">
              🎒
            </span>
            <div>
              <h3 className="font-bold text-base text-white">Join This Trip</h3>
              <p className="text-xs text-slate-400 truncate max-w-[200px] sm:max-w-sm">{trip.title}</p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator */}
        {!isConfirmed && (
          <div className="bg-[#071A2B]/60 px-3 sm:px-6 py-2.5 sm:py-3 border-b border-white/10 flex items-center justify-between text-xs">
            <div className={`flex items-center gap-1 sm:gap-1.5 ${step >= 1 ? 'text-[#FF5A1F] font-bold' : 'text-slate-400'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 1 ? 'bg-[#FF5A1F] text-white' : 'bg-white/10'}`}>1</span>
              <span className="text-[11px] sm:text-xs">Travelers</span>
            </div>
            <div className="w-3 sm:w-8 h-0.5 bg-white/10" />
            <div className={`flex items-center gap-1 sm:gap-1.5 ${step >= 2 ? 'text-[#FF5A1F] font-bold' : 'text-slate-400'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 2 ? 'bg-[#FF5A1F] text-white' : 'bg-white/10'}`}>2</span>
              <span className="text-[11px] sm:text-xs">Details</span>
            </div>
            <div className="w-3 sm:w-8 h-0.5 bg-white/10" />
            <div className={`flex items-center gap-1 sm:gap-1.5 ${step >= 3 ? 'text-[#FF5A1F] font-bold' : 'text-slate-400'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 3 ? 'bg-[#FF5A1F] text-white' : 'bg-white/10'}`}>3</span>
              <span className="text-[11px] sm:text-xs">Payment</span>
            </div>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4 sm:space-y-5">
          {isConfirmed ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-500/10 animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <h4 data-testid="join-trip-confirmed-heading" className="text-2xl font-extrabold text-white">You're Going to {trip.destination.split(',')[0]}!</h4>
                <p className="text-xs text-slate-300 mt-2 max-w-md mx-auto">
                  Your request has been instantly accepted by {trip.organizer?.name || 'the organizer'}. Your booking is secured and your interactive Trip Workspace is ready.
                </p>
              </div>

              <div className="bg-[#071A2B] p-4 rounded-2xl border border-white/10 max-w-sm mx-auto text-left text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Dates:</span>
                  <span className="font-semibold text-white">{trip.dates}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Travelers:</span>
                  <span className="font-semibold text-white">{travelersCount} Person</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Paid:</span>
                  <span className="font-bold text-[#FF5A1F]">{formatPrice(totalCost)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Meeting Point:</span>
                  <span className="font-semibold text-white truncate max-w-[180px]">{trip.meetingPoint}</span>
                </div>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => {
                    handleClose();
                    navigate('my-trips', { tab: 'upcoming' });
                  }}
                  className="w-full sm:w-auto btn-primary-cb !text-xs cursor-pointer"
                >
                  Open Trip Workspace →
                </button>
                <button
                  onClick={() => {
                    handleClose();
                    navigate('messages');
                  }}
                  className="w-full sm:w-auto btn-secondary-cb !bg-white/10 !text-white !border-white/20 !text-xs cursor-pointer"
                >
                  Chat with Group
                </button>
              </div>
            </div>
          ) : step === 1 ? (
            /* Step 1: Number of travelers */
            <div className="space-y-4">
              <div className="bg-[#071A2B] p-4 rounded-2xl border border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 block">Price per traveler</span>
                  <span className="text-xl font-extrabold text-[#FF5A1F]">{formatPrice(trip.price)}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Spots available</span>
                  <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    {trip.spotsLeft || 4} spots remaining
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-2">
                  How many travelers are joining?
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 3, 4].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setTravelersCount(num)}
                      className={`py-3 rounded-2xl font-bold text-sm border transition-all cursor-pointer ${
                        travelersCount === num
                          ? 'bg-[#FF5A1F] text-white border-[#FF5A1F] shadow-lg shadow-[#FF5A1F]/30'
                          : 'bg-[#071A2B] text-slate-300 border-white/10 hover:border-white/30'
                      }`}
                    >
                      {num} {num === 1 ? 'Traveler' : 'Travelers'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Host preview */}
              <div className="bg-[#071A2B]/70 p-4 rounded-2xl border border-white/10 flex items-center gap-3">
                <img
                  src={trip.organizer?.avatar}
                  alt={trip.organizer?.name}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-[#FF5A1F]"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white">{trip.organizer?.name}</span>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Lead Organizer • {trip.organizer?.rating || 4.9}★ ({trip.organizer?.tripsHosted || 20} trips hosted)
                  </p>
                </div>
              </div>
            </div>
          ) : step === 2 ? (
            /* Step 2: Contact info & Message to organizer */
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Your Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-[#071A2B] border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#FF5A1F]"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Phone Number (WhatsApp)</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-[#071A2B] border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#FF5A1F]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Message to Organizer ({trip.organizer?.name})
                </label>
                <textarea
                  rows={2}
                  value={formData.messageToOrganizer}
                  onChange={(e) => setFormData({ ...formData, messageToOrganizer: e.target.value })}
                  placeholder="Introduce yourself, fitness level, or prior experience..."
                  className="w-full bg-[#071A2B] border border-white/15 rounded-xl p-3 text-white focus:outline-none focus:border-[#FF5A1F]"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Special Requirements or Dietary Notes
                </label>
                <input
                  type="text"
                  value={formData.specialRequirements}
                  onChange={(e) => setFormData({ ...formData, specialRequirements: e.target.value })}
                  placeholder="e.g. Vegetarian, medical conditions, preferred pickup..."
                  className="w-full bg-[#071A2B] border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#FF5A1F]"
                />
              </div>
            </div>
          ) : (
            /* Step 3: Review & Summary */
            <div className="space-y-4 text-xs">
              <div className="bg-[#071A2B] p-4 rounded-2xl border border-white/10 space-y-2.5">
                <div className="flex justify-between pb-2 border-b border-white/10">
                  <span className="text-slate-400">Trip</span>
                  <span className="font-bold text-white text-right">{trip.title}</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-white/10">
                  <span className="text-slate-400">Dates</span>
                  <span className="font-semibold text-white">{trip.dates}</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-white/10">
                  <span className="text-slate-400">Meeting Point</span>
                  <span className="font-semibold text-white truncate max-w-[200px]">{trip.meetingPoint}</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-white/10">
                  <span className="text-slate-400">Travelers</span>
                  <span className="font-semibold text-white">{travelersCount} Person(s)</span>
                </div>
                <div className="flex justify-between pt-1 text-sm font-bold">
                  <span className="text-white">Total Amount</span>
                  <span className="text-[#FF5A1F] text-base">{formatPrice(totalCost)}</span>
                </div>
              </div>

              <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl flex items-center gap-2 text-emerald-300 text-xs">
                <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                <span>ChaloBuddy Trust Guarantee: Free cancellation up to 48 hours prior to departure.</span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        {!isConfirmed && (
          <div className="p-4 border-t border-white/10 bg-[#071A2B] flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-4 py-2 rounded-full border border-white/15 text-xs text-slate-300 hover:bg-white/5 cursor-pointer"
              >
                Back
              </button>
            ) : (
              <div />
            )}

            <button
              type="button"
              data-testid="join-trip-next-btn"
              onClick={handleNext}
              disabled={isSubmitting}
              className="btn-primary-cb !py-2.5 !px-6 !text-xs font-bold flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Confirming Booking...</span>
              ) : step === 3 ? (
                <>
                  <span>Submit & Join Trip</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  <span>Continue</span>
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
