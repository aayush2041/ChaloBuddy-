import React from 'react';
import { useStore } from '../context/StoreContext';
import StoryCard from '../components/StoryCard';
import { Sparkles, Plus, Compass } from 'lucide-react';

export default function StoriesPage() {
  const { stories, setWriteStoryModalOpen } = useStore();

  return (
    <div className="min-h-screen bg-[#F5F7F8] pt-24 pb-28">
      {/* Top Banner */}
      <div className="bg-[#071A2B] text-white py-12 px-4 sm:px-6 lg:px-8 border-b border-white/10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#FF5A1F] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              ChaloBuddy Community
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white">
              Real People. Real Stories.
            </h1>
            <p className="text-sm text-slate-300 max-w-xl">
              Unfiltered tales of high mountain passes, hidden coastal coves, lifelong friendships formed around campfires, and journeys that transformed perspectives.
            </p>
          </div>

          <button
            onClick={() => setWriteStoryModalOpen(true)}
            className="btn-primary-cb !py-3 !px-6 !text-xs font-bold flex items-center gap-2 cursor-pointer shadow-lg shadow-[#FF5A1F]/30"
          >
            <Plus className="w-4 h-4" />
            <span>Share Your Story</span>
          </button>
        </div>
      </div>

      {/* Stories Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {stories.map((story) => (
            <StoryCard key={story.id} story={story} />
          ))}
        </div>
      </div>
    </div>
  );
}
