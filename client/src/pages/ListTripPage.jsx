import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import LocationAutocomplete from '../components/LocationAutocomplete';
import DatePicker from '../components/DatePicker';
import {
  Compass,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Calendar,
  Users,
  Wallet,
  MapPin,
  Image as ImageIcon,
  ShieldCheck,
  Plus,
  Trash2,
  Sparkles,
  Flame,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ListTripPage() {
  const { addNewTrip, formatPrice, navigate, currentRoute } = useStore();

  const prefill = currentRoute?.params?.prefill || {};

  const [currentStep, setCurrentStep] = useState(1);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishedTrip, setPublishedTrip] = useState(null);

  // 11-step Form Data
  const [formData, setFormData] = useState({
    // Step 1: Basic Information
    title: prefill.name || 'Winter Spiti Valley & Chandratal Expedition',
    destination: prefill.destination || 'Spiti Valley, Himachal Pradesh',
    startingLocation: 'New Delhi (Majnu Ka Tilla)',
    tripType: prefill.tripType || 'Trekking & High Altitude',
    subtitle: 'Epic high-altitude road expedition across frozen passes & ancient Tibetan monasteries',
    about: 'Join our small group expedition exploring Key Monastery, high mountain passes like Kunzum La, the fossil village of Langza, and serene starry camps by the crescent Moon Lake.',

    // Step 2: Dates
    startDate: '2025-11-15',
    endDate: '2025-11-22',
    duration: '8 Days / 7 Nights',

    // Step 3: Travelers
    minGroupSize: 4,
    maxGroupSize: prefill.travelers || 12,

    // Step 4: Budget
    price: prefill.budget || 12999,
    currency: 'INR',

    // Step 5: Itinerary (Day by day)
    itinerary: [
      { day: 1, title: 'Delhi to Narkanda', desc: 'Overnight journey into the Shivalik pine hills.' },
      { day: 2, title: 'Narkanda to Sangla & Chitkul', desc: 'Drive along Baspa river to the last village on the Indo-Tibet border.' },
      { day: 3, title: 'Chitkul to Kalpa & Nako Lake', desc: 'Sunrise views of Kinnaur Kailash and walk around high alpine lake.' },
      { day: 4, title: 'Nako to Tabo & Kaza', desc: 'Visit 1000-year-old UNESCO monastery and Dhankar fort.' },
      { day: 5, title: 'Hikkim, Komic & Langza', desc: 'Postcards from the highest post office and fossil hunting.' },
      { day: 6, title: 'Key Monastery & Chicham Bridge', desc: 'Ancient cliff monastery fortress and Asia’s highest suspension bridge.' },
      { day: 7, title: 'Kunzum Pass & Chandratal Camp', desc: 'Ascend 14,930 ft pass and camp under the Milky Way.' },
      { day: 8, title: 'Chandratal to Manali via Atal Tunnel & Return', desc: 'Traverse engineering wonder back to plains.' },
    ],

    // Step 6: Stay
    stayDetails: 'Handpicked authentic homestays in Kaza & Tabo with hot water, plus Swiss alpine tents at Chandratal.',

    // Step 7: Transport
    transport: 'Private Force Urbania 4x4 / Custom Modified Tempo Traveler with experienced mountain chauffeurs.',
    meetingPoint: 'Majnu Ka Tilla, New Delhi (06:00 PM on Day 0)',

    // Step 8: Images
    images: [
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80',
    ],

    // Step 9: Requirements
    difficulty: 'Moderate',
    agePreference: '18–45 years',
    fitnessRequirement: 'Good cardiovascular endurance; capability to walk 4-5 km with daypack.',
    specialRequirements: 'High-altitude warm layers (down jacket, thermal inners, gloves) required.',

    included: [
      'Entire transport Delhi to Delhi via Tempo Traveler/4x4',
      '7 Nights stay (Homestays + Alpine Swiss Tents)',
      '14 Meals (Breakfast & Dinner daily)',
      'Certified Himalayan trip lead & local Spitian guide',
      'Inner Line Permits and green cess fees',
      'Oxygen cylinder, medical kit & emergency backup',
    ],
    excluded: [
      'Lunches & highway food during transit',
      'Personal expenses, snacks, laundry',
      'Any cost arising due to unforeseen road blocks or weather changes',
    ],
  });

  const stepNames = [
    'Basic Information',
    'Dates',
    'Travelers',
    'Budget',
    'Itinerary',
    'Stay Details',
    'Transport',
    'Trip Images',
    'Requirements',
    'Review Preview',
    'Publish',
  ];

  const handleNext = () => {
    if (currentStep < 10) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (currentStep === 10) {
      handlePublish();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePublish = () => {
    setIsPublishing(true);
    setTimeout(() => {
      const created = addNewTrip({
        title: formData.title,
        subtitle: formData.subtitle,
        destination: formData.destination,
        dates: `${formData.startDate} – ${formData.endDate}`,
        startDate: formData.startDate,
        endDate: formData.endDate,
        duration: formData.duration,
        price: Number(formData.price),
        difficulty: formData.difficulty,
        maxGroupSize: Number(formData.maxGroupSize),
        about: formData.about,
        meetingPoint: formData.meetingPoint,
        transport: formData.transport,
        stayDetails: formData.stayDetails,
        itinerary: formData.itinerary,
        images: formData.images,
        included: formData.included,
        excluded: formData.excluded,
        vibes: ['Mountains', 'Adventure', 'Road Trips'],
      });

      setIsPublishing(false);
      setPublishedTrip(created);
      setCurrentStep(11);

      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#FF5A1F', '#10B981', '#071A2B'],
        });
      } catch (err) {
        // ignore
      }
    }, 1200);
  };

  const addItineraryDay = () => {
    const nextDayNum = formData.itinerary.length + 1;
    setFormData({
      ...formData,
      itinerary: [
        ...formData.itinerary,
        {
          day: nextDayNum,
          title: `Day ${nextDayNum} Exploration`,
          desc: 'Exciting group activity, scenic views, and local cuisine.',
        },
      ],
    });
  };

  const removeItineraryDay = (index) => {
    if (formData.itinerary.length <= 1) return;
    const updated = formData.itinerary
      .filter((_, idx) => idx !== index)
      .map((d, i) => ({ ...d, day: i + 1 }));
    setFormData({ ...formData, itinerary: updated });
  };

  return (
    <div className="min-h-screen bg-[#F5F7F8] pt-24 pb-28">
      {/* Top Banner */}
      <div className="bg-[#071A2B] text-white py-10 px-4 sm:px-6 lg:px-8 border-b border-white/10">
        <div className="max-w-4xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-[#FF5A1F] block">
            Trip Host Studio • 11-Step Workflow
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mt-1">
            List a Trip on ChaloBuddy
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Publish your group journey to thousands of active travelers. Instant booking notifications and group workspace.
          </p>

          {/* Stepper Progress Bar */}
          <div className="mt-8">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 mb-2">
              <span className="text-[#FF5A1F]">Step {currentStep} of 11: {stepNames[currentStep - 1]}</span>
              <span>{Math.round((currentStep / 11) * 100)}% Completed</span>
            </div>
            <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-[#FF5A1F] transition-all duration-300"
                style={{ width: `${(currentStep / 11) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Wizard Form Container */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-xl space-y-6">
          {/* Step 11: Published Success Screen */}
          {currentStep === 11 ? (
            <div className="text-center py-10 space-y-5">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-50">
                <CheckCircle2 className="w-12 h-12" />
              </div>

              <div>
                <span className="text-xs font-bold text-[#FF5A1F] uppercase tracking-wider">
                  Success!
                </span>
                <h2 className="text-3xl font-extrabold text-[#071A2B] mt-1">
                  Your Trip is Live on ChaloBuddy! 🚀
                </h2>
                <p className="text-sm text-slate-600 mt-2 max-w-lg mx-auto">
                  <span className="font-bold text-[#071A2B]">{formData.title}</span> is now searchable under Find a Trip. Travelers can start sending join requests right away!
                </p>
              </div>

              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/60 max-w-md mx-auto text-left text-xs space-y-2.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Destination:</span>
                  <span className="font-bold text-[#071A2B]">{formData.destination}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Price per Person:</span>
                  <span className="font-extrabold text-[#FF5A1F]">{formatPrice(formData.price)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Duration:</span>
                  <span className="font-semibold text-[#071A2B]">{formData.duration}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Capacity:</span>
                  <span className="font-semibold text-[#071A2B]">Up to {formData.maxGroupSize} Travelers</span>
                </div>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => navigate('trip-detail', { id: publishedTrip?.id || 'trip-spiti-valley' })}
                  className="w-full sm:w-auto btn-primary-cb !py-3 !px-7 !text-xs font-bold cursor-pointer"
                >
                  View Published Trip Page →
                </button>
                <button
                  onClick={() => navigate('trips')}
                  className="w-full sm:w-auto btn-secondary-cb !py-3 !px-7 !text-xs font-bold cursor-pointer"
                >
                  Back to Find Trips
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Form Content by Step */}
              {/* Step 1: Basic Information */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <h3 className="text-xl font-extrabold text-[#071A2B]">Step 1: Basic Information</h3>
                  <p className="text-xs text-slate-500">Give your trip a catchy headline and primary destination.</p>

                  <div className="space-y-3.5 text-xs">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Trip Title</label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="e.g. Winter Spiti Valley & Chandratal Expedition"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-[#071A2B] focus:outline-none focus:border-[#FF5A1F]"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Destination</label>
                        <div className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-1.5 focus-within:border-[#FF5A1F] focus-within:bg-white transition-all">
                          <LocationAutocomplete
                            value={formData.destination}
                            onChange={(text) => setFormData({ ...formData, destination: text })}
                            onSelectLocation={(loc) => setFormData({ ...formData, destination: loc.fullName || loc.city })}
                            placeholder="e.g. Spiti Valley, Himachal Pradesh"
                            theme="light"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Starting Location</label>
                        <div className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-1.5 focus-within:border-[#FF5A1F] focus-within:bg-white transition-all">
                          <LocationAutocomplete
                            value={formData.startingLocation}
                            onChange={(text) => setFormData({ ...formData, startingLocation: text })}
                            onSelectLocation={(loc) => setFormData({ ...formData, startingLocation: loc.fullName || loc.city })}
                            placeholder="e.g. New Delhi"
                            theme="light"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Trip Type</label>
                      <select
                        value={formData.tripType}
                        onChange={(e) => setFormData({ ...formData, tripType: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-[#071A2B] focus:outline-none focus:border-[#FF5A1F] cursor-pointer"
                      >
                        <option value="Trekking & High Altitude">Trekking & High Altitude</option>
                        <option value="Weekend Road Trip">Weekend Road Trip</option>
                        <option value="Backpacking & Culture">Backpacking & Culture</option>
                        <option value="Beach & Coastal Vibes">Beach & Coastal Vibes</option>
                        <option value="Photography Expedition">Photography Expedition</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Short Subtitle</label>
                      <input
                        type="text"
                        value={formData.subtitle}
                        onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-[#071A2B] focus:outline-none focus:border-[#FF5A1F]"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">About This Journey</label>
                      <textarea
                        rows={3}
                        value={formData.about}
                        onChange={(e) => setFormData({ ...formData, about: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-[#071A2B] focus:outline-none focus:border-[#FF5A1F]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Dates */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <h3 className="text-xl font-extrabold text-[#071A2B]">Step 2: Dates & Duration</h3>
                  <p className="text-xs text-slate-500">When does the journey commence and end? Select departure and return dates.</p>

                  <div className="space-y-4 text-xs">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Trip Date Range</label>
                      <div className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus-within:border-[#FF5A1F] focus-within:bg-white transition-all">
                        <DatePicker
                          mode="range"
                          theme="light"
                          label=""
                          placeholder="Select trip start and return dates"
                          value={{ start: formData.startDate, end: formData.endDate }}
                          onChange={(dates) => {
                            if (dates?.start && dates?.end) {
                              const s = new Date(dates.startDate || dates.start);
                              const e = new Date(dates.endDate || dates.end);
                              const diffTime = Math.abs(e - s);
                              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
                              const dur = `${diffDays + 1} Days / ${diffDays} Nights`;
                              setFormData({
                                ...formData,
                                startDate: dates.start,
                                endDate: dates.end,
                                duration: dur,
                              });
                            }
                          }}
                        />
                      </div>
                    </div>

                    <div className="text-xs">
                      <label className="block text-slate-700 font-bold mb-1">Total Duration Display</label>
                      <input
                        type="text"
                        value={formData.duration}
                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                        placeholder="e.g. 8 Days / 7 Nights"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-[#071A2B] focus:outline-none focus:border-[#FF5A1F]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Travelers */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <h3 className="text-xl font-extrabold text-[#071A2B]">Step 3: Group Size</h3>
                  <p className="text-xs text-slate-500">Set the minimum and maximum capacity for this trip.</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Minimum Group Size</label>
                      <input
                        type="number"
                        min="2"
                        value={formData.minGroupSize}
                        onChange={(e) => setFormData({ ...formData, minGroupSize: Number(e.target.value) })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-[#071A2B]"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Maximum Group Size</label>
                      <input
                        type="number"
                        min="2"
                        max="30"
                        value={formData.maxGroupSize}
                        onChange={(e) => setFormData({ ...formData, maxGroupSize: Number(e.target.value) })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-[#071A2B]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Budget */}
              {currentStep === 4 && (
                <div className="space-y-4">
                  <h3 className="text-xl font-extrabold text-[#071A2B]">Step 4: Budget per Person</h3>
                  <p className="text-xs text-slate-500">What is the total price per traveler in INR?</p>

                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4 max-w-md">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Price per person (₹)</label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-2.5 font-bold text-slate-500 text-sm">₹</span>
                        <input
                          type="number"
                          step="100"
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 pl-8 text-base font-extrabold text-[#071A2B] focus:outline-none focus:border-[#FF5A1F]"
                        />
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Recommendation: Keep prices transparent and specify all stay & transport inclusions to attract verified travelers.
                    </p>
                  </div>
                </div>
              )}

              {/* Step 5: Itinerary Builder */}
              {currentStep === 5 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-extrabold text-[#071A2B]">Step 5: Day-by-Day Itinerary</h3>
                      <p className="text-xs text-slate-500">Map out the daily activities and highlights.</p>
                    </div>
                    <button
                      type="button"
                      onClick={addItineraryDay}
                      className="btn-primary-cb !py-1.5 !px-3.5 !text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Day</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {formData.itinerary.map((day, idx) => (
                      <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-[#FF5A1F] uppercase">Day {day.day}</span>
                          {formData.itinerary.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeItineraryDay(idx)}
                              className="text-red-500 hover:text-red-700 p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                        <input
                          type="text"
                          value={day.title}
                          onChange={(e) => {
                            const updated = [...formData.itinerary];
                            updated[idx].title = e.target.value;
                            setFormData({ ...formData, itinerary: updated });
                          }}
                          placeholder="Day Title"
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 font-bold text-slate-800"
                        />
                        <textarea
                          rows={2}
                          value={day.desc}
                          onChange={(e) => {
                            const updated = [...formData.itinerary];
                            updated[idx].desc = e.target.value;
                            setFormData({ ...formData, itinerary: updated });
                          }}
                          placeholder="Day Description & Activities"
                          className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-slate-700"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 6: Stay */}
              {currentStep === 6 && (
                <div className="space-y-4">
                  <h3 className="text-xl font-extrabold text-[#071A2B]">Step 6: Accommodation Details</h3>
                  <p className="text-xs text-slate-500">Where will travelers rest and sleep during the trip?</p>

                  <div className="text-xs space-y-2">
                    <label className="block text-slate-700 font-bold mb-1">Stay Description</label>
                    <textarea
                      rows={3}
                      value={formData.stayDetails}
                      onChange={(e) => setFormData({ ...formData, stayDetails: e.target.value })}
                      placeholder="e.g. Traditional wooden homestays in Kaza, luxury tents at Chandratal..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:outline-none focus:border-[#FF5A1F]"
                    />
                  </div>
                </div>
              )}

              {/* Step 7: Transport */}
              {currentStep === 7 && (
                <div className="space-y-4">
                  <h3 className="text-xl font-extrabold text-[#071A2B]">Step 7: Transport & Route</h3>
                  <p className="text-xs text-slate-500">Provide pickup location and transport details.</p>

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Meeting & Pickup Point</label>
                      <div className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-1.5 focus-within:border-[#FF5A1F] focus-within:bg-white transition-all">
                        <LocationAutocomplete
                          value={formData.meetingPoint}
                          onChange={(text) => setFormData({ ...formData, meetingPoint: text })}
                          onSelectLocation={(loc) => setFormData({ ...formData, meetingPoint: loc.fullName || loc.city })}
                          placeholder="e.g. Majnu Ka Tilla, New Delhi"
                          theme="light"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Transport Method</label>
                      <input
                        type="text"
                        value={formData.transport}
                        onChange={(e) => setFormData({ ...formData, transport: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-[#071A2B]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 8: Images */}
              {currentStep === 8 && (
                <div className="space-y-4">
                  <h3 className="text-xl font-extrabold text-[#071A2B]">Step 8: Photos & Gallery</h3>
                  <p className="text-xs text-slate-500">High-resolution photography attracts 4x more travelers.</p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {formData.images.map((img, idx) => (
                      <div key={idx} className="relative h-32 rounded-2xl overflow-hidden border border-slate-200 group">
                        <img src={img} alt="Trip Preview" className="w-full h-full object-cover" />
                        <div className="absolute top-2 left-2 bg-black/60 px-2 py-0.5 rounded text-[10px] text-white">
                          {idx === 0 ? 'Cover Photo' : `Image ${idx + 1}`}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 9: Requirements */}
              {currentStep === 9 && (
                <div className="space-y-4">
                  <h3 className="text-xl font-extrabold text-[#071A2B]">Step 9: Participant Requirements</h3>
                  <p className="text-xs text-slate-500">Fitness, difficulty, and special notes.</p>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Difficulty</label>
                      <select
                        value={formData.difficulty}
                        onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                      >
                        <option value="Easy">Easy</option>
                        <option value="Moderate">Moderate</option>
                        <option value="Challenging">Challenging</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Age Preference</label>
                      <input
                        type="text"
                        value={formData.agePreference}
                        onChange={(e) => setFormData({ ...formData, agePreference: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                      />
                    </div>
                  </div>

                  <div className="text-xs">
                    <label className="block text-slate-700 font-bold mb-1">Fitness Requirement</label>
                    <input
                      type="text"
                      value={formData.fitnessRequirement}
                      onChange={(e) => setFormData({ ...formData, fitnessRequirement: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                    />
                  </div>
                </div>
              )}

              {/* Step 10: Preview */}
              {currentStep === 10 && (
                <div className="space-y-4">
                  <h3 className="text-xl font-extrabold text-[#071A2B]">Step 10: Preview Your Listing</h3>
                  <p className="text-xs text-slate-500">Inspect how your trip will look to travelers on ChaloBuddy.</p>

                  <div className="bg-[#0C2438] text-white p-6 rounded-3xl border border-white/10 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <span className="text-[11px] text-[#FF5A1F] font-bold uppercase tracking-wider">
                          {formData.difficulty} • {formData.tripType}
                        </span>
                        <h4 className="text-2xl font-extrabold text-white mt-1">{formData.title}</h4>
                        <p className="text-xs text-slate-300 mt-1">{formData.destination} • {formData.duration}</p>
                      </div>

                      <div className="text-right">
                        <span className="text-xs text-slate-400">Price per traveler</span>
                        <p className="text-2xl font-black text-[#FF5A1F]">{formatPrice(formData.price)}</p>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed pt-2 border-t border-white/10">
                      {formData.about}
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs">
                      <div className="p-2.5 rounded-xl bg-[#071A2B]">
                        <span className="text-slate-400 text-[10px] block">Dates</span>
                        <span className="font-bold text-white">{formData.startDate}</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-[#071A2B]">
                        <span className="text-slate-400 text-[10px] block">Max Capacity</span>
                        <span className="font-bold text-white">{formData.maxGroupSize} People</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-[#071A2B]">
                        <span className="text-slate-400 text-[10px] block">Pickup</span>
                        <span className="font-bold text-white truncate block">Delhi</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-[#071A2B]">
                        <span className="text-slate-400 text-[10px] block">Lead</span>
                        <span className="font-bold text-emerald-400">Verified</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Wizard Navigation Footer Controls */}
              <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                {currentStep > 1 ? (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="btn-secondary-cb !py-2.5 !px-6 !text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back</span>
                  </button>
                ) : (
                  <div />
                )}

                <button
                  type="button"
                  onClick={handleNext}
                  disabled={isPublishing}
                  className="btn-primary-cb !py-2.5 !px-8 !text-xs font-bold flex items-center gap-2 cursor-pointer shadow-lg shadow-[#FF5A1F]/30 disabled:opacity-50"
                >
                  {isPublishing ? (
                    <span>Publishing to ChaloBuddy...</span>
                  ) : currentStep === 10 ? (
                    <>
                      <span>Publish Trip Now 🚀</span>
                      <Sparkles className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      <span>Next Step</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
