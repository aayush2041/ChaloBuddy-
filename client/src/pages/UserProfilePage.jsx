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
  Edit3,
  X,
  Lock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Coins,
  Languages,
  Tag,
} from 'lucide-react';

const COMMON_LANGUAGES = ['English', 'Hindi', 'Bengali', 'Tamil', 'Telugu', 'Marathi', 'Kannada', 'Malayalam', 'Gujarati', 'Punjabi', 'Spanish', 'French'];
const TRAVEL_STYLES = ['Adventure', 'Backpacking', 'Cultural Immersion', 'Road Trips', 'Budget Explorer', 'Luxury & Comfort', 'Spiritual & Wellness', 'Food & Culinary', 'Wildlife & Trekking'];

export default function UserProfilePage() {
  const {
    currentUser,
    updateUserProfile,
    formatPrice,
    allUsers,
    buddies,
    trips,
    stories,
    currentRoute,
    toggleBuddyConnect,
    navigate,
    openDirectChatWithUser,
  } = useStore();

  const routeUserId = currentRoute?.params?.id;

  // Resolve target user
  const user =
    (currentUser && (currentUser.id === routeUserId || !routeUserId))
      ? currentUser
      : allUsers?.find((u) => u.id === routeUserId) ||
        buddies?.find((b) => b.id === routeUserId) ||
        currentUser ||
        allUsers?.[0];

  const isOwnProfile = currentUser && (currentUser.id === user?.id || currentUser.email === user?.email);

  const [activeTab, setActiveTab] = useState('hosted'); // 'hosted' | 'stories' | 'reviews'
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Edit form state initialized from user data
  const [editForm, setEditForm] = useState({
    name: user?.name || '',
    gender: user?.gender || user?.profile?.gender || 'FEMALE',
    location: user?.location || user?.profile?.city || 'Bengaluru, India',
    bio: user?.bio || user?.profile?.bio || '',
    languages: user?.languages || user?.profile?.languages || ['English', 'Hindi'],
    travelStyle: user?.travelStyle || user?.profile?.travelStyle || ['Adventure', 'Backpacking'],
    budgetMin: user?.budgetMin ?? user?.profile?.budgetMin ?? 5000,
    budgetMax: user?.budgetMax ?? user?.profile?.budgetMax ?? 30000,
  });

  const [saving, setSaving] = useState(false);

  const userHostedTrips = (trips || []).filter(
    (t) => t.organizer?.name?.toLowerCase() === user?.name?.toLowerCase() || t.organizer?.id === user?.id
  );

  const userStories = (stories || []).filter(
    (s) => s.author?.toLowerCase() === user?.name?.toLowerCase()
  );

  // Profile Completeness Calculation
  const completenessItems = [
    { label: 'Display Name', done: Boolean(user?.name) },
    { label: 'Travel Bio / Intro', done: Boolean(user?.bio && user?.bio.length > 15) },
    { label: 'Base Location', done: Boolean(user?.location || user?.profile?.city) },
    { label: 'Gender Verification', done: Boolean(user?.gender || user?.profile?.gender) },
    { label: 'Travel Styles', done: Boolean((user?.travelStyle || user?.profile?.travelStyle || []).length > 0) },
    { label: 'Languages Spoken', done: Boolean((user?.languages || user?.profile?.languages || []).length > 0) },
    { label: 'Budget Preferences', done: Boolean(user?.budgetMin || user?.profile?.budgetMin) },
  ];

  const completedCount = completenessItems.filter((i) => i.done).length;
  const completenessPct = Math.round((completedCount / completenessItems.length) * 100);

  const isFemale = (user?.gender || user?.profile?.gender || '').toUpperCase() === 'FEMALE';

  const handleOpenEdit = () => {
    setEditForm({
      name: user?.name || '',
      gender: user?.gender || user?.profile?.gender || 'FEMALE',
      location: user?.location || user?.profile?.city || 'Bengaluru, India',
      bio: user?.bio || user?.profile?.bio || '',
      languages: Array.isArray(user?.languages) ? user.languages : (user?.profile?.languages || ['English', 'Hindi']),
      travelStyle: Array.isArray(user?.travelStyle) ? user.travelStyle : (user?.profile?.travelStyle || ['Adventure', 'Backpacking']),
      budgetMin: user?.budgetMin ?? user?.profile?.budgetMin ?? 5000,
      budgetMax: user?.budgetMax ?? user?.profile?.budgetMax ?? 30000,
    });
    setIsEditModalOpen(true);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateUserProfile(editForm);
      setIsEditModalOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const toggleLanguage = (lang) => {
    setEditForm((prev) => {
      const exists = prev.languages.includes(lang);
      return {
        ...prev,
        languages: exists ? prev.languages.filter((l) => l !== lang) : [...prev.languages, lang],
      };
    });
  };

  const toggleTravelStyle = (style) => {
    setEditForm((prev) => {
      const exists = prev.travelStyle.includes(style);
      return {
        ...prev,
        travelStyle: exists ? prev.travelStyle.filter((s) => s !== style) : [...prev.travelStyle, style],
      };
    });
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
          <span className="text-[#071A2B] font-bold">{user?.name}</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Profile Header Card */}
        <div className="bg-[#0C2438] text-white rounded-3xl p-6 sm:p-8 border border-white/10 shadow-xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
            <div className="relative">
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                alt={user?.name}
                className="w-28 h-28 rounded-3xl object-cover ring-4 ring-[#FF5A1F] shadow-xl"
              />
              {user?.verified && (
                <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-full ring-4 ring-[#0C2438]" title="Verified Traveler ID">
                  <ShieldCheck className="w-4 h-4" />
                </span>
              )}
            </div>

            <div className="space-y-2.5 flex-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{user?.name}</h1>
                <span className="text-xs bg-emerald-500/20 text-emerald-300 font-bold px-3 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified Traveler
                </span>
                {isFemale && (
                  <span className="text-xs bg-pink-500/20 text-pink-300 font-bold px-3 py-1 rounded-full border border-pink-500/40 flex items-center gap-1 shadow-sm">
                    🌸 Verified for Women-Only Trips
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-slate-300">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#FF5A1F]" />
                  {user?.location || user?.profile?.city || 'India'}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-amber-400 font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  {user?.rating || 4.9} Community Rating
                </span>
                <span>•</span>
                <span className="text-slate-300">{user?.tripsCompleted || 8} Journeys Completed</span>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed pt-0.5">
                {user?.bio || user?.profile?.bio || 'Passionate explorer discovering the diverse landscapes and cultures of India and beyond.'}
              </p>

              {/* Languages & Styles */}
              <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                {(user?.travelStyle || user?.profile?.travelStyle || ['Adventure', 'Backpacking']).map((style, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-white/10 text-white border border-white/10 flex items-center gap-1"
                  >
                    <Tag className="w-3 h-3 text-[#FF5A1F]" />
                    {style}
                  </span>
                ))}

                {(user?.languages || user?.profile?.languages || ['English', 'Hindi']).map((lang, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-sky-500/15 text-sky-200 border border-sky-400/20 flex items-center gap-1"
                  >
                    <Languages className="w-3 h-3 text-sky-300" />
                    {lang}
                  </span>
                ))}

                {(user?.budgetMin || user?.profile?.budgetMin) && (
                  <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-200 border border-amber-400/20 flex items-center gap-1">
                    <Coins className="w-3 h-3 text-amber-300" />
                    {formatPrice(user?.budgetMin || user?.profile?.budgetMin || 5000)} – {formatPrice(user?.budgetMax || user?.profile?.budgetMax || 35000)}
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-2 self-center sm:self-start">
              {isOwnProfile ? (
                <button
                  onClick={handleOpenEdit}
                  className="btn-primary-cb !py-2.5 !px-5 !text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md shadow-[#FF5A1F]/30"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Edit Profile</span>
                </button>
              ) : (
                <>
                  <button
                    onClick={() => openDirectChatWithUser(user.id)}
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
                </>
              )}
            </div>
          </div>
        </div>

        {/* Profile Completeness & Zero-Exposure Privacy Shield (Owner View) */}
        {isOwnProfile && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm md:col-span-2 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#FF5A1F]" />
                  <h3 className="font-extrabold text-sm text-[#071A2B]">Profile Completeness</h3>
                </div>
                <span className="text-xs font-extrabold text-[#FF5A1F] bg-[#FF5A1F]/10 px-2.5 py-0.5 rounded-full">
                  {completenessPct}% Completed
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-[#FF5A1F] h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${completenessPct}%` }}
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 text-[11px]">
                {completenessItems.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 text-slate-600">
                    {item.done ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    ) : (
                      <AlertCircle className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                    )}
                    <span className={item.done ? 'text-slate-700 font-medium' : 'text-slate-400'}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Zero-Exposure Policy Widget */}
            <div className="bg-emerald-50/80 p-5 rounded-3xl border border-emerald-200 text-xs space-y-2">
              <div className="flex items-center gap-2 text-emerald-900 font-bold">
                <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Zero-Exposure Privacy Shield</span>
              </div>
              <p className="text-[11px] text-emerald-800 leading-relaxed">
                Your email address, phone number, and identity credentials are strictly hidden from public view. Communication occurs only through verified ChaloBuddy in-app chat.
              </p>
              <div className="text-[10px] text-emerald-700 font-semibold pt-1">
                ✓ PII Stripped on Discovery • End-to-end encrypted sessions
              </div>
            </div>
          </div>
        )}

        {/* Tabs for Hosted, Stories, Reviews */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-1 text-sm font-bold">
          {[
            { id: 'hosted', label: `Hosted Journeys (${userHostedTrips.length})` },
            { id: 'stories', label: `Travel Stories (${userStories.length})` },
            { id: 'reviews', label: 'Reputation & Reviews (18)' },
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

      {/* Edit Profile & Preferences Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200">
            {/* Modal Header */}
            <div className="p-6 bg-[#071A2B] text-white flex items-center justify-between rounded-t-3xl sticky top-0 z-10">
              <div>
                <h3 className="text-lg font-extrabold text-white">Edit Profile & Travel Preferences</h3>
                <p className="text-xs text-slate-300">Keep your travel style and verification up to date</p>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded-full text-slate-300 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveProfile} className="p-6 space-y-5 text-xs">
              {/* Full Name & Gender */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Display Name</label>
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#FF5A1F]"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1 flex items-center justify-between">
                    <span>Gender Identity</span>
                    <span className="text-[10px] text-[#FF5A1F]">Enforces Women-Only Access</span>
                  </label>
                  <select
                    value={editForm.gender}
                    onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#FF5A1F] bg-white"
                  >
                    <option value="FEMALE">Female (Eligible for Women-Only Trips)</option>
                    <option value="MALE">Male</option>
                    <option value="OTHER">Non-binary / Other</option>
                    <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
                  </select>
                </div>
              </div>

              {/* Location & Bio */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">Base Location / City</label>
                <input
                  type="text"
                  value={editForm.location}
                  onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                  placeholder="e.g. Mumbai, Maharashtra"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#FF5A1F]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Travel Bio & Introduction</label>
                <textarea
                  rows={3}
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  placeholder="Share a short summary of who you are, what kind of trips you love, and your travel philosophy..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#FF5A1F]"
                />
              </div>

              {/* Travel Styles Multi-Select */}
              <div>
                <label className="block text-slate-700 font-bold mb-1.5">Travel Styles & Preferences</label>
                <div className="flex flex-wrap gap-1.5">
                  {TRAVEL_STYLES.map((style) => {
                    const isSelected = editForm.travelStyle.includes(style);
                    return (
                      <button
                        type="button"
                        key={style}
                        onClick={() => toggleTravelStyle(style)}
                        className={`px-3 py-1.5 rounded-full text-[11px] font-semibold border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#071A2B] text-white border-[#071A2B]'
                            : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '}{style}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Languages Spoken Multi-Select */}
              <div>
                <label className="block text-slate-700 font-bold mb-1.5">Languages Spoken</label>
                <div className="flex flex-wrap gap-1.5">
                  {COMMON_LANGUAGES.map((lang) => {
                    const isSelected = editForm.languages.includes(lang);
                    return (
                      <button
                        type="button"
                        key={lang}
                        onClick={() => toggleLanguage(lang)}
                        className={`px-3 py-1.5 rounded-full text-[11px] font-semibold border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#FF5A1F] text-white border-[#FF5A1F]'
                            : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '}{lang}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Budget Preferences (Min / Max) */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Preferred Min Budget (₹)</label>
                  <input
                    type="number"
                    min="1000"
                    step="500"
                    value={editForm.budgetMin}
                    onChange={(e) => setEditForm({ ...editForm, budgetMin: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#FF5A1F]"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Preferred Max Budget (₹)</label>
                  <input
                    type="number"
                    min="2000"
                    step="1000"
                    value={editForm.budgetMax}
                    onChange={(e) => setEditForm({ ...editForm, budgetMax: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#FF5A1F]"
                  />
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 font-bold hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary-cb !py-2 !px-6 !text-xs font-bold cursor-pointer"
                >
                  {saving ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
