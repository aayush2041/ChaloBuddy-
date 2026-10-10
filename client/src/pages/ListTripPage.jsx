import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../context/StoreContext';
import LocationAutocomplete from '../components/LocationAutocomplete';
import DatePicker, { toISODateString } from '../components/DatePicker';
import {
  Compass,
  ArrowRight,
  CheckCircle2,
  Calendar,
  Clock,
  Users,
  Wallet,
  MapPin,
  AlertCircle,
  Loader2,
  FileText,
  Shield,
  Sparkles,
  LogIn,
} from 'lucide-react';
import confetti from 'canvas-confetti';

const DEPARTURE_TIMES = [
  '05:00 AM',
  '06:00 AM',
  '07:00 AM',
  '08:00 AM',
  '09:00 AM',
  '10:00 AM',
  '11:00 AM',
  '12:00 PM',
  '02:00 PM',
  '04:00 PM',
  '06:00 PM',
  '08:00 PM',
  '10:00 PM',
];

const DEFAULT_TRIP_IMAGES = [
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=1200&q=80',
];

export default function ListTripPage() {
  const {
    addNewTrip,
    formatPrice,
    navigate,
    currentRoute,
    currentUser,
    setAuthModalOpen,
    setAuthModalMode,
    addToast,
  } = useStore();

  const prefill = currentRoute?.params?.prefill || {};

  // Form State
  const [formData, setFormData] = useState({
    startingLocation: prefill.startingLocation || prefill.from || '',
    destination: prefill.destination || '',
    date: prefill.date || '',
    startDate: '',
    departureTime: '06:00 AM',
    seats: prefill.travelers ? Math.min(20, Math.max(1, Number(prefill.travelers))) : 4,
    price: prefill.budget ? String(prefill.budget) : '3500',
    title: prefill.name || '',
    description: prefill.description || '',
  });

  // Validation Errors & Submission State
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState('');
  const [publishedTrip, setPublishedTrip] = useState(null);
  const datePickerRef = useRef(null);

  // Synchronize prefill when route changes
  useEffect(() => {
    if (prefill.destination) {
      setFormData((prev) => ({
        ...prev,
        destination: prefill.destination,
      }));
    }
    if (prefill.travelers) {
      setFormData((prev) => ({
        ...prev,
        seats: Math.min(20, Math.max(1, Number(prefill.travelers))),
      }));
    }
  }, [currentRoute?.params?.prefill]);

  // Validation Logic
  const validateForm = () => {
    const newErrors = {};

    if (!formData.startingLocation || !formData.startingLocation.trim()) {
      newErrors.startingLocation = 'Please enter a starting location.';
    }

    if (!formData.destination || !formData.destination.trim()) {
      newErrors.destination = 'Please enter a destination.';
    }

    if (
      formData.startingLocation &&
      formData.destination &&
      formData.startingLocation.trim().toLowerCase() === formData.destination.trim().toLowerCase()
    ) {
      newErrors.destination = 'Starting location and destination cannot be identical.';
    }

    if (!formData.date || !formData.date.trim()) {
      newErrors.date = 'Please select a travel date.';
    }

    if (!formData.departureTime) {
      newErrors.departureTime = 'Please select a departure time.';
    }

    const seatsNum = Number(formData.seats);
    if (isNaN(seatsNum) || seatsNum < 1 || seatsNum > 30) {
      newErrors.seats = 'Available seats must be between 1 and 30.';
    }

    const priceNum = Number(formData.price);
    if (isNaN(priceNum) || priceNum < 0) {
      newErrors.price = 'Price / contribution must be ₹0 or greater.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    if (isSubmitting) return; // Prevent duplicate click/submissions

    // 1. Authenticated User Check
    if (!currentUser) {
      setSubmissionError('You must be logged in to list a trip as a verified host.');
      addToast('Please log in to list your trip.', 'info');
      setAuthModalMode('login');
      setAuthModalOpen(true);
      return;
    }

    // 2. Validate Fields
    setSubmissionError('');
    if (!validateForm()) {
      window.scrollTo({ top: 150, behavior: 'smooth' });
      return;
    }

    // 3. Loading State & Submission
    setIsSubmitting(true);

    try {
      // Simulate natural server response time
      await new Promise((resolve) => setTimeout(resolve, 600));

      const startCity = formData.startingLocation.split(',')[0].trim();
      const destCity = formData.destination.split(',')[0].trim();
      const tripTitle = formData.title.trim() || `${startCity} to ${destCity} Group Expedition`;
      const tripSubtitle =
        formData.description.trim().slice(0, 100) ||
        `Scenic group adventure from ${startCity} to ${destCity} departing at ${formData.departureTime}.`;

      const created = await addNewTrip({
        title: tripTitle,
        subtitle: tripSubtitle,
        startingLocation: formData.startingLocation.trim(),
        destination: formData.destination.trim(),
        dates: formData.date,
        startDate: formData.startDate || new Date().toISOString().split('T')[0],
        departureTime: formData.departureTime,
        duration: 'Group Journey',
        price: Number(formData.price) || 0,
        maxGroupSize: Number(formData.seats) + 1,
        spotsLeft: Number(formData.seats),
        about:
          formData.description.trim() ||
          `Join our small group journey from ${formData.startingLocation} to ${formData.destination}. Departing at ${formData.departureTime} with verified travelers.`,
        meetingPoint: `${formData.startingLocation} (${formData.departureTime})`,
        transport: 'Private Group Vehicle',
        stayDetails: 'Verified local accommodations & homestays',
        images: DEFAULT_TRIP_IMAGES,
        vibes: ['Mountains', 'Adventure', 'Road Trips'],
      });

      setPublishedTrip(created);

      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#FF5A1F', '#10B981', '#071A2B'],
        });
      } catch {
        // ignore confetti failures
      }
    } catch (err) {
      console.error('List a Trip submission error:', err);
      setSubmissionError('We could not publish your trip right now. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7F8] pt-24 pb-28 text-[#071A2B]">
      {/* 1. TOP HEADER BANNER */}
      <section className="bg-[#071A2B] text-white py-12 px-4 sm:px-6 lg:px-8 border-b border-white/10">
        <div className="max-w-3xl mx-auto space-y-3 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-semibold text-slate-200">
            <span className="w-2 h-2 rounded-full bg-[#FF5A1F]" />
            <span>Host Studio</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
            List a Trip
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Have travel plans? Host a group trip, invite fellow travelers, and share journey costs.
          </p>
        </div>
      </section>

      {/* 2. MAIN FORM CONTAINER */}
      <main className="max-w-3xl mx-auto px-3 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {/* Unauthenticated Alert Banner */}
        {!currentUser && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 text-xs">
              <Shield className="w-4 h-4 text-[#FF5A1F] shrink-0" />
              <span>
                <strong>Log in required:</strong> You must be signed in to host and list trips.
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                setAuthModalMode('login');
                setAuthModalOpen(true);
              }}
              className="btn-primary-cb !py-1.5 !px-3 !text-xs font-bold shrink-0 flex items-center gap-1.5 cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Log in</span>
            </button>
          </div>
        )}

        {/* Global Submission Error Message */}
        {submissionError && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <p className="font-bold">Unable to list trip</p>
              <p>{submissionError}</p>
            </div>
          </div>
        )}

        {/* Success Confirmation Card */}
        {publishedTrip ? (
          <div
            data-testid="trip-published-success"
            className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-xl text-center space-y-6"
          >
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto ring-8 ring-emerald-50 shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-[#FF5A1F] uppercase tracking-wider block">
                Trip Published
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[#071A2B]">
                Your Trip is Live on ChaloBuddy! 🚀
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                <span className="font-bold text-[#071A2B]">{publishedTrip.title}</span> is now searchable under Find a Trip. Fellow travelers can now discover and join your journey.
              </p>
            </div>

            {/* Trip Summary Card */}
            <div className="bg-[#F5F7F8] p-5 rounded-2xl border border-slate-200 text-left text-xs space-y-3 max-w-md mx-auto">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="text-slate-500">Route:</span>
                <span className="font-bold text-[#071A2B]">
                  {publishedTrip.startingLocation.split(',')[0]} → {publishedTrip.destination.split(',')[0]}
                </span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="text-slate-500">Departure:</span>
                <span className="font-bold text-[#071A2B]">
                  {publishedTrip.dates} • {publishedTrip.departureTime || 'Morning'}
                </span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="text-slate-500">Available Seats:</span>
                <span className="font-bold text-emerald-600">
                  {publishedTrip.spotsLeft} seats available
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Price per Person:</span>
                <span className="font-black text-[#FF5A1F] text-sm">
                  {formatPrice(publishedTrip.price)}
                </span>
              </div>
            </div>

            {/* Post-publish Action CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => navigate('trip-detail', { id: publishedTrip.id })}
                className="w-full sm:w-auto btn-primary-cb !py-3 !px-7 !text-xs font-bold cursor-pointer"
              >
                <span>View Published Trip Page</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => navigate('trips')}
                className="w-full sm:w-auto px-6 py-3 rounded-full border border-slate-300 hover:bg-slate-100 text-[#071A2B] font-bold text-xs cursor-pointer"
              >
                Go to Find Trips
              </button>
            </div>
          </div>
        ) : (
          /* Logical Single-Page Form */
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-3xl p-5 sm:p-10 border border-slate-200 shadow-xl space-y-8"
          >
            {/* Section 1: Route & Schedule */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <Compass className="w-4 h-4 text-[#FF5A1F]" />
                <h2 className="text-base font-bold text-[#071A2B]">Route &amp; Schedule</h2>
              </div>

              {/* Starting Location & Destination */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Starting Location */}
                <div>
                  <label className="text-xs font-bold text-[#071A2B] block mb-1">
                    Starting Location <span className="text-[#FF5A1F]">*</span>
                  </label>
                  <div className="p-2.5 rounded-2xl border bg-slate-50 border-slate-200 focus-within:border-[#FF5A1F] focus-within:bg-white transition-all">
                    <LocationAutocomplete
                      value={formData.startingLocation}
                      inputTestId="list-from-location-input"
                      onChange={(text) => {
                        setFormData((prev) => ({ ...prev, startingLocation: text }));
                        if (errors.startingLocation) setErrors((prev) => ({ ...prev, startingLocation: '' }));
                      }}
                      onSelectLocation={(loc) => {
                        const locText = loc.city || loc.fullName;
                        setFormData((prev) => ({ ...prev, startingLocation: locText }));
                        if (errors.startingLocation) setErrors((prev) => ({ ...prev, startingLocation: '' }));
                      }}
                      placeholder="e.g. Delhi, Majnu Ka Tilla"
                      theme="light"
                    />
                  </div>
                  {errors.startingLocation && (
                    <p className="flex items-center gap-1 mt-1 text-[11px] text-rose-500 font-medium">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{errors.startingLocation}</span>
                    </p>
                  )}
                </div>

                {/* Destination */}
                <div>
                  <label className="text-xs font-bold text-[#071A2B] block mb-1">
                    Destination <span className="text-[#FF5A1F]">*</span>
                  </label>
                  <div className="p-2.5 rounded-2xl border bg-slate-50 border-slate-200 focus-within:border-[#FF5A1F] focus-within:bg-white transition-all">
                    <LocationAutocomplete
                      value={formData.destination}
                      inputTestId="list-destination-input"
                      onChange={(text) => {
                        setFormData((prev) => ({ ...prev, destination: text }));
                        if (errors.destination) setErrors((prev) => ({ ...prev, destination: '' }));
                      }}
                      onSelectLocation={(loc) => {
                        const locText = loc.city || loc.fullName;
                        setFormData((prev) => ({ ...prev, destination: locText }));
                        if (errors.destination) setErrors((prev) => ({ ...prev, destination: '' }));
                      }}
                      placeholder="e.g. Manali, Spiti, Goa"
                      theme="light"
                    />
                  </div>
                  {errors.destination && (
                    <p className="flex items-center gap-1 mt-1 text-[11px] text-rose-500 font-medium">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{errors.destination}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Travel Date & Departure Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                {/* Travel Date (entire field clickable) */}
                <div>
                  <label className="text-xs font-bold text-[#071A2B] block mb-1">
                    Travel Date <span className="text-[#FF5A1F]">*</span>
                  </label>
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
                        mode="single"
                        theme="light"
                        label=""
                        placeholder="Select travel date"
                        value={formData.date}
                        onChange={(formatted, dateObj, isoStr) => {
                          setFormData((prev) => ({
                            ...prev,
                            date: formatted,
                            startDate: isoStr || (dateObj ? toISODateString(dateObj) : ''),
                          }));
                          if (errors.date) setErrors((prev) => ({ ...prev, date: '' }));
                        }}
                        minDate={new Date()}
                        className="w-full"
                      />
                    </div>
                  </div>
                  {errors.date && (
                    <p className="flex items-center gap-1 mt-1 text-[11px] text-rose-500 font-medium">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{errors.date}</span>
                    </p>
                  )}
                </div>

                {/* Departure Time */}
                <div>
                  <label className="text-xs font-bold text-[#071A2B] block mb-1">
                    Departure Time <span className="text-[#FF5A1F]">*</span>
                  </label>
                  <div className="p-3 rounded-2xl border bg-slate-50 border-slate-200 focus-within:border-[#FF5A1F] focus-within:bg-white transition-all flex items-center gap-2.5">
                    <Clock className="w-4 h-4 text-[#FF5A1F] shrink-0" />
                    <select
                      data-testid="list-departure-time-select"
                      value={formData.departureTime}
                      onChange={(e) => {
                        setFormData((prev) => ({ ...prev, departureTime: e.target.value }));
                        if (errors.departureTime) setErrors((prev) => ({ ...prev, departureTime: '' }));
                      }}
                      className="w-full bg-transparent text-xs sm:text-sm font-bold text-[#071A2B] focus:outline-none cursor-pointer"
                    >
                      {DEPARTURE_TIMES.map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.departureTime && (
                    <p className="flex items-center gap-1 mt-1 text-[11px] text-rose-500 font-medium">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{errors.departureTime}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Section 2: Capacity & Contribution */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <Users className="w-4 h-4 text-[#FF5A1F]" />
                <h2 className="text-base font-bold text-[#071A2B]">Capacity &amp; Contribution</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Available Seats Selector */}
                <div>
                  <label className="text-xs font-bold text-[#071A2B] block mb-1">
                    Available Seats <span className="text-[#FF5A1F]">*</span>
                  </label>
                  <div className="p-3 rounded-2xl border bg-slate-50 border-slate-200 flex items-center justify-between">
                    <div className="text-xs text-slate-500 font-medium">
                      <span>Max passengers:</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        aria-label="Decrease seats"
                        disabled={formData.seats <= 1}
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            seats: Math.max(1, prev.seats - 1),
                          }))
                        }
                        className="w-8 h-8 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-40 text-slate-800 font-black flex items-center justify-center transition-all cursor-pointer shadow-sm"
                      >
                        –
                      </button>
                      <span
                        data-testid="list-seats-count"
                        className="w-7 text-center text-sm font-black text-[#071A2B]"
                      >
                        {formData.seats}
                      </span>
                      <button
                        type="button"
                        aria-label="Increase seats"
                        disabled={formData.seats >= 30}
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            seats: Math.min(30, prev.seats + 1),
                          }))
                        }
                        className="w-8 h-8 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-40 text-slate-800 font-black flex items-center justify-center transition-all cursor-pointer shadow-sm"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  {errors.seats && (
                    <p className="flex items-center gap-1 mt-1 text-[11px] text-rose-500 font-medium">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{errors.seats}</span>
                    </p>
                  )}
                </div>

                {/* Price / Estimated Contribution */}
                <div>
                  <label className="text-xs font-bold text-[#071A2B] block mb-1">
                    Estimated Contribution / Price (₹) <span className="text-[#FF5A1F]">*</span>
                  </label>
                  <div className="p-3 rounded-2xl border bg-slate-50 border-slate-200 focus-within:border-[#FF5A1F] focus-within:bg-white transition-all flex items-center gap-2">
                    <span className="text-slate-400 font-bold text-sm">₹</span>
                    <input
                      type="number"
                      min="0"
                      step="100"
                      data-testid="list-price-input"
                      value={formData.price}
                      onChange={(e) => {
                        setFormData((prev) => ({ ...prev, price: e.target.value }));
                        if (errors.price) setErrors((prev) => ({ ...prev, price: '' }));
                      }}
                      placeholder="e.g. 3500 (or 0 for free ride)"
                      className="w-full bg-transparent text-xs sm:text-sm font-bold text-[#071A2B] focus:outline-none"
                    />
                  </div>
                  {errors.price && (
                    <p className="flex items-center gap-1 mt-1 text-[11px] text-rose-500 font-medium">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{errors.price}</span>
                    </p>
                  )}
                  <p className="text-[11px] text-slate-500 mt-1">
                    Per-person share for fuel, toll, or stay costs.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 3: Trip Details & Description */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <FileText className="w-4 h-4 text-[#FF5A1F]" />
                <h2 className="text-base font-bold text-[#071A2B]">Trip Details (Optional)</h2>
              </div>

              {/* Trip Title */}
              <div>
                <label className="text-xs font-bold text-[#071A2B] block mb-1">
                  Trip Headline
                </label>
                <input
                  type="text"
                  data-testid="list-title-input"
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder={`e.g. ${formData.startingLocation.split(',')[0] || 'Delhi'} to ${formData.destination.split(',')[0] || 'Manali'} Weekend Expedition`}
                  className="w-full p-3 rounded-2xl border bg-slate-50 border-slate-200 text-xs sm:text-sm font-bold text-[#071A2B] focus:outline-none focus:border-[#FF5A1F] focus:bg-white transition-all"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-bold text-[#071A2B] block mb-1">
                  Notes / Vehicle &amp; Luggage Details
                </label>
                <textarea
                  rows={3}
                  data-testid="list-description-input"
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Tell travelers about pickup landmarks, vehicle comfort, music, luggage space, or travel vibe..."
                  className="w-full p-3 rounded-2xl border bg-slate-50 border-slate-200 text-xs sm:text-sm text-[#071A2B] focus:outline-none focus:border-[#FF5A1F] focus:bg-white transition-all resize-none"
                />
              </div>
            </div>

            {/* Primary CTA Submit Button */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-slate-500 text-center sm:text-left">
                By publishing, you agree to ChaloBuddy community guidelines and traveler safety standards.
              </p>

              <button
                type="submit"
                disabled={isSubmitting}
                data-testid="list-trip-submit-btn"
                className="w-full sm:w-auto btn-primary-cb !py-3.5 !px-8 text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#FF5A1F]/30 hover:scale-102 active:scale-98 transition-all disabled:opacity-75 shrink-0"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Publishing Trip...</span>
                  </>
                ) : (
                  <>
                    <span>List Trip</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
