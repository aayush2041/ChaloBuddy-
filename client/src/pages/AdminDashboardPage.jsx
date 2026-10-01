import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import {
  ShieldCheck,
  Users,
  Compass,
  Home,
  Calendar,
  CreditCard,
  Star,
  AlertTriangle,
  FileText,
  BarChart3,
  CheckCircle2,
  XCircle,
  Trash2,
  Eye,
  TrendingUp,
  MapPin,
  ArrowRight,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const {
    trips,
    stays,
    buddies,
    myTrips,
    stories,
    formatPrice,
    addToast,
    navigate,
  } = useStore();

  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'users' | 'trips' | 'stays' | 'bookings' | 'reviews' | 'analytics'

  const stats = [
    { title: 'Total Registered Users', value: '12,480', change: '+14% this month', icon: Users, color: 'text-sky-500' },
    { title: 'Active Group Trips', value: trips.length.toString(), change: '+8 new listings', icon: Compass, color: 'text-[#FF5A1F]' },
    { title: 'Boutique Stays Listed', value: stays.length.toString(), change: '100% verified', icon: Home, color: 'text-amber-500' },
    { title: 'Platform Bookings', value: '3,842', change: '₹4.2M gross volume', icon: CreditCard, color: 'text-emerald-500' },
  ];

  const handleVerifyUser = (name) => {
    addToast(`User ${name} has been verified with identity badge!`, 'success');
  };

  const handleApproveTrip = (title) => {
    addToast(`Trip "${title}" approved and featured on homepage!`, 'success');
  };

  return (
    <div className="min-h-screen bg-[#F5F7F8] pt-24 pb-28">
      {/* Top Banner */}
      <div className="bg-[#071A2B] text-white py-10 px-4 sm:px-6 lg:px-8 border-b border-white/10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>ChaloBuddy Superadmin Portal</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white mt-1">Admin Command Center</h1>
            <p className="text-xs text-slate-300">
              Manage trips, verify hosts, supervise bookings, and monitor platform metrics.
            </p>
          </div>

          <button
            onClick={() => navigate('home')}
            className="btn-secondary-cb !bg-white/10 !text-white !border-white/20 hover:!bg-white/20 !text-xs font-bold self-start sm:self-auto cursor-pointer"
          >
            Exit to Storefront →
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1 text-xs font-bold">
          {[
            { id: 'dashboard', label: 'Dashboard Overview', icon: BarChart3 },
            { id: 'trips', label: `Trips (${trips.length})`, icon: Compass },
            { id: 'stays', label: `Stays (${stays.length})`, icon: Home },
            { id: 'users', label: 'Users & Hosts', icon: Users },
            { id: 'bookings', label: 'Bookings & Orders', icon: Calendar },
            { id: 'reviews', label: 'Reviews Moderation', icon: Star },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-3 px-4 transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'text-[#FF5A1F] border-b-2 border-[#FF5A1F]'
                    : 'text-slate-500 hover:text-[#071A2B]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: Dashboard Overview */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((s, idx) => {
                const Icon = s.icon;
                return (
                  <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500 font-semibold">{s.title}</span>
                      <Icon className={`w-5 h-5 ${s.color}`} />
                    </div>
                    <p className="text-3xl font-black text-[#071A2B]">{s.value}</p>
                    <span className="text-[11px] text-emerald-600 font-semibold block">{s.change}</span>
                  </div>
                );
              })}
            </div>

            {/* Quick Management Table */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-extrabold text-base text-[#071A2B]">Recent Listed Trips</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px]">
                      <th className="pb-3">Trip Title</th>
                      <th className="pb-3">Destination</th>
                      <th className="pb-3">Host Lead</th>
                      <th className="pb-3">Price</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {trips.slice(0, 5).map((trip) => (
                      <tr key={trip.id} className="hover:bg-slate-50">
                        <td className="py-3 font-bold text-[#071A2B]">{trip.title}</td>
                        <td className="py-3 text-slate-600">{trip.destination}</td>
                        <td className="py-3 text-slate-600">{trip.organizer?.name}</td>
                        <td className="py-3 font-bold text-[#FF5A1F]">{formatPrice(trip.price)}</td>
                        <td className="py-3">
                          <span className="bg-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded-full font-bold text-[10px]">
                            Approved
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => handleApproveTrip(trip.title)}
                            className="text-[#FF5A1F] hover:underline font-semibold text-xs cursor-pointer"
                          >
                            Feature ★
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Trips Management */}
        {activeTab === 'trips' && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-[#071A2B]">All Published Trips ({trips.length})</h3>
              <button
                onClick={() => navigate('list-trip')}
                className="btn-primary-cb !py-1.5 !px-3.5 !text-xs font-bold"
              >
                + Add New Trip
              </button>
            </div>

            <div className="space-y-3">
              {trips.map((trip) => (
                <div
                  key={trip.id}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <img src={trip.images[0]} alt={trip.title} className="w-12 h-12 rounded-xl object-cover" />
                    <div>
                      <p className="font-bold text-sm text-[#071A2B]">{trip.title}</p>
                      <p className="text-slate-500">{trip.destination} • {trip.dates}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="font-extrabold text-sm text-[#071A2B]">{formatPrice(trip.price)}</span>
                    <button
                      onClick={() => navigate('trip-detail', { id: trip.id })}
                      className="btn-secondary-cb !py-1.5 !px-3 !text-xs"
                    >
                      Inspect
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Stays Management */}
        {activeTab === 'stays' && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-extrabold text-base text-[#071A2B]">Managed Accommodations ({stays.length})</h3>
            <div className="space-y-3">
              {stays.map((stay) => (
                <div
                  key={stay.id}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <img src={stay.images[0]} alt={stay.name} className="w-12 h-12 rounded-xl object-cover" />
                    <div>
                      <p className="font-bold text-sm text-[#071A2B]">{stay.name}</p>
                      <p className="text-slate-500">{stay.location} • {stay.propertyType}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-[#FF5A1F]">{formatPrice(stay.pricePerNight)} / night</span>
                    <button
                      onClick={() => navigate('stay-detail', { id: stay.id })}
                      className="btn-secondary-cb !py-1.5 !px-3 !text-xs"
                    >
                      View Stay
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Users & Hosts */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-extrabold text-base text-[#071A2B]">Community Users & Trip Leads</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {buddies.map((user) => (
                <div
                  key={user.id}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
                    <div>
                      <p className="font-bold text-[#071A2B]">{user.name}, {user.age}</p>
                      <p className="text-slate-500">{user.location} • {user.rating}★</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleVerifyUser(user.name)}
                    className="btn-secondary-cb !py-1 !px-3 !text-[11px] font-bold text-emerald-600 hover:bg-emerald-50"
                  >
                    ✓ Verified
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 5: Bookings */}
        {activeTab === 'bookings' && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-extrabold text-base text-[#071A2B]">Platform Bookings & Transactions</h3>
            <div className="space-y-3 text-xs">
              {myTrips.map((b) => (
                <div
                  key={b.bookingId}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between"
                >
                  <div>
                    <span className="font-mono font-bold text-[#FF5A1F]">{b.bookingId}</span>
                    <p className="font-bold text-sm text-[#071A2B]">{b.tripTitle}</p>
                    <p className="text-slate-500">{b.dates} • {b.travelers} Traveler(s)</p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-[#071A2B] block">{formatPrice(b.totalPaid)}</span>
                    <span className="text-[10px] text-emerald-600 font-bold bg-emerald-100 px-2 py-0.5 rounded-full">
                      Paid & Confirmed
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 6: Reviews Moderation */}
        {activeTab === 'reviews' && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-extrabold text-base text-[#071A2B]">Recent Traveler Reviews</h3>
            <div className="space-y-3 text-xs">
              {[
                { author: 'Rohan Verma', target: 'Spiti Valley Expedition', rating: 5, comment: 'Phenomenal trip organization and delicious mountain meals.' },
                { author: 'Tanvi Kapoor', target: 'The Himalayan Stay', rating: 5, comment: 'Clean wooden rooms, stunning views, fast Wi-Fi.' },
              ].map((rev, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#071A2B]">{rev.author}</span>
                      <span className="text-slate-400">on</span>
                      <span className="font-semibold text-slate-700">{rev.target}</span>
                    </div>
                    <p className="text-slate-600 mt-1">{rev.comment}</p>
                  </div>
                  <span className="text-emerald-600 font-bold bg-emerald-100 px-2 py-0.5 rounded-full text-[10px]">
                    Published
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
