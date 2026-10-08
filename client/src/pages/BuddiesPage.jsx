import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import BuddyCard from '../components/BuddyCard';
import {
  Users,
  Search,
  Filter,
  MapPin,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export default function BuddiesPage() {
  const { buddies } = useStore();

  const [searchLocation, setSearchLocation] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('All');
  const [selectedInterest, setSelectedInterest] = useState('All');

  const travelStyles = ['All', 'Adventure', 'Backpacking', 'Road Trips', 'Relaxed', 'Trekking'];
  const interestsList = ['All', 'Photography', 'Camping', 'Motorcycling', 'Folk Culture', 'Yoga'];

  const filteredBuddies = useMemo(() => {
    return buddies.filter((bdy) => {
      if (
        searchLocation.trim() &&
        !bdy.location.toLowerCase().includes(searchLocation.toLowerCase()) &&
        !bdy.name.toLowerCase().includes(searchLocation.toLowerCase())
      ) {
        return false;
      }

      if (selectedStyle !== 'All' && !(bdy.travelStyle || []).includes(selectedStyle)) {
        return false;
      }

      if (selectedInterest !== 'All' && !(bdy.interests || []).includes(selectedInterest)) {
        return false;
      }

      return true;
    });
  }, [buddies, searchLocation, selectedStyle, selectedInterest]);

  return (
    <div className="min-h-screen bg-[#F5F7F8] pt-24 pb-28">
      {/* Top Banner */}
      <div className="bg-[#071A2B] text-white py-10 px-4 sm:px-6 lg:px-8 border-b border-white/10">
        <div className="max-w-7xl mx-auto space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-[#FF5A1F]">
            Travel Community & Social Network
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mt-1">
            Find Travel Buddies
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Connect with verified travelers who share your destinations, dates, and passion for the open trail.
          </p>

          {/* Quick Filter Bar */}
          <div className="bg-[#0C2438] p-3 rounded-2xl border border-white/15 shadow-xl grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex items-center gap-2.5 px-3 py-1.5 bg-[#071A2B] rounded-xl border border-white/10">
              <MapPin className="w-4 h-4 text-[#FF5A1F] flex-shrink-0" />
              <input
                type="text"
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                placeholder="Search city, state, or name (e.g. Delhi, Mumbai)"
                className="w-full bg-transparent text-xs text-white placeholder-slate-400 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedStyle}
                onChange={(e) => setSelectedStyle(e.target.value)}
                className="w-full bg-[#071A2B] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none cursor-pointer"
              >
                {travelStyles.map((style) => (
                  <option key={style} value={style}>
                    Style: {style}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedInterest}
                onChange={(e) => setSelectedInterest(e.target.value)}
                className="w-full bg-[#071A2B] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none cursor-pointer"
              >
                {interestsList.map((interest) => (
                  <option key={interest} value={interest}>
                    Interest: {interest}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Buddy Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="flex items-center justify-between mb-6 text-xs text-slate-500">
          <p>
            Showing <span className="font-extrabold text-[#071A2B]">{filteredBuddies.length}</span> verified travel buddies
          </p>
          {(selectedStyle !== 'All' || selectedInterest !== 'All' || searchLocation) && (
            <button
              onClick={() => {
                setSearchLocation('');
                setSelectedStyle('All');
                setSelectedInterest('All');
              }}
              className="text-[#FF5A1F] hover:underline font-bold cursor-pointer"
            >
              Reset filters
            </button>
          )}
        </div>

        {filteredBuddies.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl text-center space-y-4 border border-slate-200">
            <Users className="w-10 h-10 text-[#FF5A1F] mx-auto" />
            <h3 className="font-bold text-base text-[#071A2B]">No buddies match these filters</h3>
            <p className="text-xs text-slate-500">Try broadening your travel style or location filters.</p>
            <button
              type="button"
              onClick={() => {
                setSearchLocation('');
                setSelectedStyle('All');
                setSelectedInterest('All');
              }}
              className="btn-primary-cb !py-2 !px-5 !text-xs font-semibold cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredBuddies.map((buddy) => (
              <BuddyCard key={buddy.id} buddy={buddy} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
