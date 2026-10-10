import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Wallet,
  CheckCircle2,
  Plus,
  MessageCircle,
  FileText,
  Car,
  BedDouble,
  Compass,
  ArrowRight,
  ShieldCheck,
  CheckSquare,
  Square,
  Sparkles,
} from 'lucide-react';

export default function MyTripsPage() {
  const {
    myTrips,
    formatPrice,
    togglePackingItem,
    addPackingItem,
    addWorkspaceExpense,
    openTripRoom,
    setSmartPlan,
    navigate,
    currentRoute,
  } = useStore();

  const [activeStatusTab, setActiveStatusTab] = useState(
    currentRoute?.params?.tab || 'upcoming'
  ); // 'upcoming' | 'ongoing' | 'past' | 'saved'

  useEffect(() => {
    if (currentRoute?.params?.tab) {
      setActiveStatusTab(currentRoute.params.tab);
    }
  }, [currentRoute?.params?.tab]);

  const filteredTrips = myTrips.filter((t) => t.status === activeStatusTab);
  const [selectedTripId, setSelectedTripId] = useState(filteredTrips[0]?.bookingId || myTrips[0]?.bookingId);

  useEffect(() => {
    if (filteredTrips.length > 0 && !filteredTrips.some((t) => t.bookingId === selectedTripId)) {
      setSelectedTripId(filteredTrips[0].bookingId);
    }
  }, [activeStatusTab, filteredTrips, selectedTripId]);

  const selectedTrip = myTrips.find((t) => t.bookingId === selectedTripId) || filteredTrips[0] || myTrips[0];

  // Workspace internal tabs
  const [workspaceTab, setWorkspaceTab] = useState('overview'); // 'overview' | 'itinerary' | 'people' | 'stay' | 'transport' | 'budget' | 'notes'

  // Notes/Checklist new item state
  const [newChecklistText, setNewChecklistText] = useState('');

  // Budget new expense state
  const [expenseItem, setExpenseItem] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('Gear');

  const handleAddChecklist = (e) => {
    e.preventDefault();
    if (!newChecklistText.trim()) return;
    addPackingItem(selectedTrip.bookingId, newChecklistText);
    setNewChecklistText('');
  };

  const handleAddExpense = (e) => {
    e.preventDefault();
    if (!expenseItem.trim() || !expenseAmount) return;
    addWorkspaceExpense(selectedTrip.bookingId, {
      item: expenseItem,
      amount: Number(expenseAmount),
      category: expenseCategory,
    });
    setExpenseItem('');
    setExpenseAmount('');
  };

  const handleOpenGroupChat = () => {
    openTripRoom(selectedTrip);
  };

  return (
    <div className="min-h-screen bg-[#F5F7F8] pt-24 pb-28">
      {/* Top Banner */}
      <div className="bg-[#071A2B] text-white py-10 px-4 sm:px-6 lg:px-8 border-b border-white/10">
        <div className="max-w-7xl mx-auto space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-[#FF5A1F]">
            Traveler Dashboard
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mt-1">
            My Trips & Workspaces
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Manage your booked journeys, coordinate with organizers, track shared expenses, and access offline notes.
          </p>

          {/* Status Tabs: Upcoming, Ongoing, Past, Saved Plans */}
          <div className="flex items-center gap-2 pt-2 flex-wrap">
            {[
              { id: 'upcoming', label: 'Upcoming' },
              { id: 'ongoing', label: 'Ongoing' },
              { id: 'past', label: 'Past Trips' },
              { id: 'saved', label: 'Saved Plans' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveStatusTab(tab.id)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  activeStatusTab === tab.id
                    ? 'bg-[#FF5A1F] text-white shadow-md shadow-[#FF5A1F]/30'
                    : 'bg-white/10 hover:bg-white/20 text-slate-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Trips Carousel / Selection Bar */}
        {filteredTrips.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl text-center space-y-4 border border-slate-200">
            <Calendar className="w-10 h-10 text-[#FF5A1F] mx-auto" />
            <h3 className="font-bold text-base text-[#071A2B]">
              {activeStatusTab === 'saved' ? 'No saved plans found' : `No ${activeStatusTab} trips found`}
            </h3>
            <p className="text-xs text-slate-500">
              {activeStatusTab === 'saved'
                ? 'Generate a realistic custom itinerary with Smart Planner and save it here to access anytime.'
                : 'Ready for an adventure? Find and join an upcoming group trip.'}
            </p>
            <button
              onClick={() => navigate(activeStatusTab === 'saved' ? 'plan-trip' : 'trips')}
              className="btn-primary-cb !py-2.5 !px-6 !text-xs font-bold"
            >
              {activeStatusTab === 'saved' ? 'Open Smart Planner →' : 'Explore Trips →'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {filteredTrips.map((trip) => (
              <div
                key={trip.bookingId}
                onClick={() => setSelectedTripId(trip.bookingId)}
                className={`p-4 rounded-3xl border transition-all cursor-pointer flex items-center gap-3.5 ${
                  selectedTrip?.bookingId === trip.bookingId
                    ? 'bg-white border-[#FF5A1F] shadow-lg ring-2 ring-[#FF5A1F]/30'
                    : 'bg-white/80 border-slate-200 hover:border-slate-300'
                }`}
              >
                <img
                  src={trip.image}
                  alt={trip.tripTitle}
                  className="w-16 h-16 rounded-2xl object-cover flex-shrink-0"
                />
                <div className="overflow-hidden flex-1 text-xs">
                  <span className="text-[10px] font-bold text-[#FF5A1F] uppercase block">
                    {trip.bookingId}
                  </span>
                  <h4 className="font-extrabold text-sm text-[#071A2B] truncate mt-0.5">
                    {trip.tripTitle}
                  </h4>
                  <p className="text-slate-500 truncate">{trip.dates}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TRIP WORKSPACE SECTION (Overview, Itinerary, People, Chat, Stay, Transport, Budget, Notes) */}
        {selectedTrip && (
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden space-y-6">
            {/* Workspace Header Bar */}
            <div className="p-6 bg-[#071A2B] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs font-bold text-[#FF5A1F] uppercase tracking-wider">
                  Active Trip Workspace • {selectedTrip.bookingId}
                </span>
                <h2 className="text-2xl font-extrabold text-white">{selectedTrip.tripTitle}</h2>
                <p className="text-xs text-slate-300 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#FF5A1F]" />
                  <span>{selectedTrip.destination}</span>
                  <span>•</span>
                  <span>{selectedTrip.dates}</span>
                </p>
              </div>

              <div className="flex items-center gap-2">
                {selectedTrip.isSavedPlan && selectedTrip.smartPlanData ? (
                  <button
                    onClick={() => {
                      setSmartPlan(selectedTrip.smartPlanData);
                      navigate('plan-result');
                    }}
                    className="btn-primary-cb !py-2 !px-4 !text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md shadow-[#FF5A1F]/30"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>View Full Smart Plan</span>
                  </button>
                ) : (
                  <button
                    onClick={handleOpenGroupChat}
                    className="btn-primary-cb !py-2 !px-4 !text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md shadow-[#FF5A1F]/30"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Group Chat</span>
                  </button>
                )}
              </div>
            </div>

            {/* Workspace Tab Bar */}
            <div className="px-6 border-b border-slate-200 flex items-center gap-2 overflow-x-auto text-xs font-bold">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'notes', label: 'Packing Checklist' },
                { id: 'budget', label: 'Budget & Expenses' },
                { id: 'people', label: 'Co-Travelers' },
                { id: 'stay', label: 'Stay Info' },
                { id: 'transport', label: 'Transport & Pickup' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setWorkspaceTab(tab.id)}
                  className={`pb-3 px-3 transition-all cursor-pointer whitespace-nowrap ${
                    workspaceTab === tab.id
                      ? 'text-[#FF5A1F] border-b-2 border-[#FF5A1F]'
                      : 'text-slate-500 hover:text-[#071A2B]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Workspace Tab Contents */}
            <div className="p-6 pt-0 space-y-6">
              {/* Tab 1: Overview */}
              {workspaceTab === 'overview' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-2">
                    <p className="font-bold text-[#071A2B] text-sm">Booking Verification</p>
                    <p className="text-slate-500">Booking ID: <span className="font-mono font-bold text-[#071A2B]">{selectedTrip.bookingId}</span></p>
                    <p className="text-slate-500">Travelers: <span className="font-bold text-[#071A2B]">{selectedTrip.travelers} Pax</span></p>
                    <p className="text-slate-500">Total Paid: <span className="font-extrabold text-[#FF5A1F]">{formatPrice(selectedTrip.totalPaid)}</span></p>
                    <p className="text-emerald-600 font-bold flex items-center gap-1 pt-1">
                      <ShieldCheck className="w-4 h-4" />
                      Status: Confirmed & Active
                    </p>
                  </div>

                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-2">
                    <p className="font-bold text-[#071A2B] text-sm">Logistics Summary</p>
                    <p className="text-slate-500">Lead Host: <span className="font-bold text-[#071A2B]">{selectedTrip.organizer}</span></p>
                    <p className="text-slate-500">Assembly: <span className="font-bold text-[#071A2B]">{selectedTrip.meetingPoint}</span></p>
                    <p className="text-slate-500">Vehicle: <span className="font-bold text-[#071A2B]">{selectedTrip.transportInfo}</span></p>
                  </div>

                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-2">
                    <p className="font-bold text-[#071A2B] text-sm">Weather Readiness</p>
                    <p className="text-slate-500">Expected: <span className="font-bold text-[#071A2B]">6°C to 14°C</span></p>
                    <p className="text-slate-500">Atmosphere: Crisp mountain air with starry nights</p>
                    <p className="text-slate-500">Required: Thermal base layers and windcheater</p>
                  </div>
                </div>
              )}

              {/* Tab 2: Notes & Packing Checklist */}
              {workspaceTab === 'notes' && (
                <div className="space-y-6 text-xs">
                  <div>
                    <h3 className="font-extrabold text-base text-[#071A2B]">Personal Packing Checklist</h3>
                    <p className="text-slate-500">Check off items as you pack for your adventure.</p>
                  </div>

                  {/* Checklist items */}
                  <div className="space-y-2">
                    {(selectedTrip.packingChecklist || []).map((item) => (
                      <div
                        key={item.id}
                        onClick={() => togglePackingItem(selectedTrip.bookingId, item.id)}
                        className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-colors ${
                          item.done
                            ? 'bg-emerald-50/60 border-emerald-200 text-slate-500'
                            : 'bg-slate-50 border-slate-200 text-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {item.done ? (
                            <CheckSquare className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-400" />
                          )}
                          <span className={item.done ? 'line-through text-slate-400' : 'font-medium'}>
                            {item.text}
                          </span>
                        </div>
                        {item.done && (
                          <span className="text-[10px] text-emerald-600 font-bold bg-emerald-100 px-2 py-0.5 rounded-full">
                            Packed
                          </span>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Add new checklist item form */}
                  <form onSubmit={handleAddChecklist} className="flex gap-2">
                    <input
                      type="text"
                      value={newChecklistText}
                      onChange={(e) => setNewChecklistText(e.target.value)}
                      placeholder="Add item (e.g. Extra wool socks, Power bank)..."
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#FF5A1F]"
                    />
                    <button
                      type="submit"
                      className="btn-primary-cb !py-2 !px-4 !text-xs font-bold"
                    >
                      Add Item
                    </button>
                  </form>
                </div>
              )}

              {/* Tab 3: Budget & Expenses */}
              {workspaceTab === 'budget' && (
                <div className="space-y-6 text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 p-6 rounded-2xl border border-slate-200">
                    <div>
                      <p className="text-slate-500 font-medium">Estimated Budget</p>
                      <p className="text-2xl font-black text-[#071A2B] mt-0.5">
                        {formatPrice(selectedTrip.budgetTracker?.target || 20000)}
                      </p>
                    </div>

                    <div>
                      <p className="text-slate-500 font-medium">Total Spent So Far</p>
                      <p className="text-2xl font-black text-[#FF5A1F] mt-0.5">
                        {formatPrice(selectedTrip.budgetTracker?.spent || 16998)}
                      </p>
                    </div>

                    <div>
                      <p className="text-slate-500 font-medium">Remaining Buffer</p>
                      <p className="text-2xl font-black text-emerald-600 mt-0.5">
                        {formatPrice(
                          Math.max(
                            0,
                            (selectedTrip.budgetTracker?.target || 20000) -
                              (selectedTrip.budgetTracker?.spent || 16998)
                          )
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Expense Items List */}
                  <div className="space-y-2">
                    <p className="font-bold text-sm text-[#071A2B]">Recorded Expenses</p>
                    {(selectedTrip.budgetTracker?.expenses || []).map((exp) => (
                      <div
                        key={exp.id}
                        className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between"
                      >
                        <div>
                          <p className="font-bold text-[#071A2B]">{exp.item}</p>
                          <span className="text-[10px] text-slate-400 bg-slate-200 px-2 py-0.5 rounded-full">
                            {exp.category}
                          </span>
                        </div>
                        <span className="font-extrabold text-sm text-[#071A2B]">
                          {formatPrice(exp.amount)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Add Expense Form */}
                  <form onSubmit={handleAddExpense} className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-2">
                    <input
                      type="text"
                      value={expenseItem}
                      onChange={(e) => setExpenseItem(e.target.value)}
                      placeholder="Expense item (e.g. Highway lunch, snacks)"
                      className="sm:col-span-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                    />
                    <input
                      type="number"
                      value={expenseAmount}
                      onChange={(e) => setExpenseAmount(e.target.value)}
                      placeholder="Amount (₹)"
                      className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                    />
                    <button type="submit" className="btn-primary-cb !py-2 !text-xs font-bold">
                      Add Expense
                    </button>
                  </form>
                </div>
              )}

              {/* Tab 4: Co-Travelers */}
              {workspaceTab === 'people' && (
                <div className="space-y-4 text-xs">
                  <h3 className="font-bold text-sm text-[#071A2B]">Trip Group Members</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"
                          alt="Lead"
                          className="w-10 h-10 rounded-full object-cover ring-2 ring-[#FF5A1F]"
                        />
                        <div>
                          <p className="font-bold text-[#071A2B]">{selectedTrip.organizer}</p>
                          <span className="text-[10px] text-emerald-600 font-bold">Lead Organizer</span>
                        </div>
                      </div>
                      <button
                        onClick={handleOpenGroupChat}
                        className="btn-secondary-cb !py-1 !px-3 !text-[11px]"
                      >
                        Message
                      </button>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80"
                          alt="Rohan"
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <p className="font-bold text-[#071A2B]">Rohan Verma</p>
                          <span className="text-[10px] text-slate-500">Co-Traveler</span>
                        </div>
                      </div>
                      <button
                        onClick={handleOpenGroupChat}
                        className="btn-secondary-cb !py-1 !px-3 !text-[11px]"
                      >
                        Message
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 5: Stay Info */}
              {workspaceTab === 'stay' && (
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                  <p className="font-bold text-sm text-[#071A2B]">Accommodation Details</p>
                  <p className="text-slate-600">{selectedTrip.stayInfo}</p>
                  <p className="text-slate-500">Check-in: 01:00 PM • Power backup & hot water guaranteed</p>
                </div>
              )}

              {/* Tab 6: Transport & Pickup */}
              {workspaceTab === 'transport' && (
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                  <p className="font-bold text-sm text-[#071A2B]">Transport & Vehicle Info</p>
                  <p className="text-slate-600">Vehicle: <span className="font-bold text-[#071A2B]">{selectedTrip.transportInfo}</span></p>
                  <p className="text-slate-600">Pickup Point: <span className="font-bold text-[#071A2B]">{selectedTrip.meetingPoint}</span></p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
