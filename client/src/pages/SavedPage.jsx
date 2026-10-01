import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import TripCard from '../components/TripCard';
import StayCard from '../components/StayCard';
import BuddyCard from '../components/BuddyCard';
import { Heart, Compass, Home, Users } from 'lucide-react';

export default function SavedPage() {
  const {
    trips,
    stays,
    buddies,
    savedTrips,
    savedStays,
    savedBuddies,
    navigate,
  } = useStore();

  const [activeTab, setActiveTab] = useState('trips'); // 'trips' | 'stays' | 'buddies'

  const savedTripsList = trips.filter((t) => savedTrips.includes(t.id));
  const savedStaysList = stays.filter((s) => savedStays.includes(s.id));
  const savedBuddiesList = buddies.filter((b) => savedBuddies.includes(b.id));

  return (
    <div className="min-h-screen bg-[#F5F7F8] pt-24 pb-28">
      {/* Top Banner */}
      <div className="bg-[#071A2B] text-white py-10 px-4 sm:px-6 lg:px-8 border-b border-white/10">
        <div className="max-w-7xl mx-auto space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-[#FF5A1F] flex items-center gap-1.5">
            <Heart className="w-4 h-4 fill-[#FF5A1F]" />
            Your Wishlist
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mt-1">
            Saved Collections
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Keep track of upcoming adventures, dream mountain stays, and travel buddies you want to journey with.
          </p>

          {/* Tabs */}
          <div className="flex items-center gap-2 pt-2">
            {[
              { id: 'trips', label: `Saved Trips (${savedTripsList.length})`, icon: Compass },
              { id: 'stays', label: `Saved Stays (${savedStaysList.length})`, icon: Home },
              { id: 'buddies', label: `Saved Buddies (${savedBuddiesList.length})`, icon: Users },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === tab.id
                      ? 'bg-[#FF5A1F] text-white shadow-md shadow-[#FF5A1F]/30'
                      : 'bg-white/10 hover:bg-white/20 text-slate-300'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Grid Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {activeTab === 'trips' && (
          <div>
            {savedTripsList.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl text-center space-y-4 border border-slate-200">
                <Compass className="w-10 h-10 text-slate-400 mx-auto" />
                <h3 className="font-bold text-base text-[#071A2B]">No saved trips yet</h3>
                <p className="text-xs text-slate-500">Tap the heart icon on any trip card to save it here.</p>
                <button
                  onClick={() => navigate('trips')}
                  className="btn-primary-cb !py-2.5 !px-6 !text-xs font-bold"
                >
                  Browse Trips →
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {savedTripsList.map((trip) => (
                  <TripCard key={trip.id} trip={trip} />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'stays' && (
          <div>
            {savedStaysList.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl text-center space-y-4 border border-slate-200">
                <Home className="w-10 h-10 text-slate-400 mx-auto" />
                <h3 className="font-bold text-base text-[#071A2B]">No saved stays yet</h3>
                <p className="text-xs text-slate-500">Tap the heart icon on any cottage or resort to add it to your wishlist.</p>
                <button
                  onClick={() => navigate('stays')}
                  className="btn-primary-cb !py-2.5 !px-6 !text-xs font-bold"
                >
                  Browse Stays →
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {savedStaysList.map((stay) => (
                  <StayCard key={stay.id} stay={stay} />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'buddies' && (
          <div>
            {savedBuddiesList.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl text-center space-y-4 border border-slate-200">
                <Users className="w-10 h-10 text-slate-400 mx-auto" />
                <h3 className="font-bold text-base text-[#071A2B]">No saved buddies yet</h3>
                <p className="text-xs text-slate-500">Bookmark travelers you want to coordinate future getaways with.</p>
                <button
                  onClick={() => navigate('buddies')}
                  className="btn-primary-cb !py-2.5 !px-6 !text-xs font-bold"
                >
                  Find Buddies →
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {savedBuddiesList.map((buddy) => (
                  <BuddyCard key={buddy.id} buddy={buddy} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
