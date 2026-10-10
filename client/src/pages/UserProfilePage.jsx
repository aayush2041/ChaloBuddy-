import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import TripCard from '../components/TripCard';
import StoryCard from '../components/StoryCard';
import {
  MapPin,
  ShieldCheck,
  Star,
  Calendar,
  MessageCircle,
  UserPlus,
  UserCheck,
  Globe,
  Heart,
  ChevronRight,
  Compass,
} from 'lucide-react';

export default function UserProfilePage() {
  const {
    allUsers,
    buddies,
    trips,
    stories,
    currentRoute,
    toggleBuddyConnect,
    navigate,
    openDirectChatWithUser,
  } = useStore();

  const userId = currentRoute.params?.id || 'usr_priya';

  // Find user from allUsers or buddies
  const user =
    allUsers.find((u) => u.id === userId) ||
    buddies.find((b) => b.id === userId) ||
    allUsers[0];

  const [activeTab, setActiveTab] = useState('hosted'); // 'hosted' | 'joined' | 'stories' | 'reviews'

  const userHostedTrips = trips.filter(
    (t) => t.organizer?.name?.toLowerCase() === user.name?.toLowerCase() || t.organizer?.id === user.id
  );

  const userStories = stories.filter(
    (s) => s.author?.toLowerCase() === user.name?.toLowerCase()
  );

  const handleMessageUser = () => {
    openDirectChatWithUser(user.id);
  };

  return (
    <div className="min-h-screen bg-[#F5F7F8] pt-24 pb-28">
      {/* Breadcrumbs */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <button onClick={() => navigate('home')} className="hover:text-[#071A2B] cursor-pointer">Home</button>
          <ChevronRight className="w-3.5 h-3.5" />
          <button onClick={() => navigate('buddies')} className="hover:text-[#071A2B] cursor-pointer">Travelers</button>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[#071A2B] font-bold">{user.name}</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Profile Header Card */}
        <div className="bg-[#0C2438] text-white rounded-3xl p-6 sm:p-8 border border-white/10 shadow-xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
            <div className="relative">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-28 h-28 rounded-3xl object-cover ring-4 ring-[#FF5A1F] shadow-xl"
              />
              {user.verified && (
                <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-full ring-4 ring-[#0C2438]">
                  <ShieldCheck className="w-4 h-4" />
                </span>
              )}
            </div>

            <div className="space-y-2 flex-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{user.name}</h1>
                <span className="text-xs bg-emerald-500/20 text-emerald-300 font-bold px-3 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified Traveler
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-slate-300">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#FF5A1F]" />
                  {user.location || 'India'}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-amber-400 font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  {user.rating || 4.9} Community Rating
                </span>
                <span>•</span>
                <span className="text-slate-300">{user.tripsCompleted || 15} Trips Completed</span>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed pt-1">
                {user.bio}
              </p>

              {/* Badges / Chips */}
              <div className="pt-2 flex flex-wrap justify-center sm:justify-start gap-1.5">
                {(user.travelStyle || ['Adventure', 'Backpacking']).map((style, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-white/10 text-white border border-white/10"
                  >
                    {style}
                  </span>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-2 self-center sm:self-start">
              <button
                onClick={handleMessageUser}
                className="btn-secondary-cb !bg-white/10 !text-white !border-white/20 hover:!bg-white/20 !py-2.5 !px-5 !text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 text-[#FF5A1F]" />
                <span>Message</span>
              </button>

              <button
                onClick={() => toggleBuddyConnect(user.id)}
                className="btn-primary-cb !py-2.5 !px-5 !text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md shadow-[#FF5A1F]/30"
              >
                <UserPlus className="w-4 h-4" />
                <span>Connect</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tabs for Hosted, Joined, Stories, Reviews */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-1 text-sm font-bold">
          {[
            { id: 'hosted', label: `Hosted Trips (${userHostedTrips.length})` },
            { id: 'stories', label: `Travel Stories (${userStories.length})` },
            { id: 'reviews', label: 'Traveler Reviews (18)' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 px-4 transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'text-[#FF5A1F] border-b-2 border-[#FF5A1F]'
                  : 'text-slate-500 hover:text-[#071A2B]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab 1: Hosted Trips */}
        {activeTab === 'hosted' && (
          <div>
            {userHostedTrips.length === 0 ? (
              <div className="bg-white p-8 rounded-3xl text-center text-xs text-slate-500 border border-slate-200">
                <Compass className="w-8 h-8 text-[#FF5A1F] mx-auto mb-2" />
                <p>No hosted trips currently published under this profile.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userHostedTrips.map((trip) => (
                  <TripCard key={trip.id} trip={trip} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Travel Stories */}
        {activeTab === 'stories' && (
          <div>
            {userStories.length === 0 ? (
              <div className="bg-white p-8 rounded-3xl text-center text-xs text-slate-500 border border-slate-200">
                <p>No public stories shared yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {userStories.map((story) => (
                  <StoryCard key={story.id} story={story} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Reviews */}
        {activeTab === 'reviews' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-extrabold text-lg text-[#071A2B]">Community Reputation & Reviews</h3>
            <div className="space-y-3">
              {[
                {
                  reviewer: 'Kabir Mehta',
                  date: 'Sep 2025',
                  rating: 5,
                  text: 'Traveled with them to Spiti. Always punctual, super respectful of mountain culture, and brings great energy to the group!',
                },
                {
                  reviewer: 'Tanvi Kapoor',
                  date: 'Jul 2025',
                  rating: 5,
                  text: 'Reliable travel buddy with solid photography skills. Would definitely join another journey together.',
                },
              ].map((rev, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#071A2B]">{rev.reviewer}</span>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: rev.rating }).map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-slate-600 leading-relaxed">{rev.text}</p>
                  <span className="text-[10px] text-slate-400">{rev.date} • Verified Co-Traveler</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
