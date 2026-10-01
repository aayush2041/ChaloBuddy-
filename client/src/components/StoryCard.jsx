import React from 'react';
import { useStore } from '../context/StoreContext';
import {
  Heart,
  Star,
  MapPin,
  Quote,
} from 'lucide-react';

export default function StoryCard({ story }) {
  const { toggleStoryLike } = useStore();

  return (
    <div className="bg-[#0C2438] rounded-3xl overflow-hidden border border-white/10 shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col justify-between card-hover group">
      {/* High-res Image Header */}
      <div className="relative h-56 w-full overflow-hidden bg-slate-900">
        <img
          src={story.image}
          alt={story.title}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0C2438] via-transparent to-black/30" />

        {/* Top Badges */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-1 text-xs text-white/90 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
            <MapPin className="w-3.5 h-3.5 text-[#FF5A1F]" />
            <span className="truncate max-w-[160px]">{story.location}</span>
          </div>

          <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10 text-xs">
            {Array.from({ length: story.rating || 5 }).map((_, i) => (
              <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
            ))}
          </div>
        </div>

        {/* Quote overlay snippet */}
        <div className="absolute bottom-3 left-4 right-4 z-10">
          <p className="text-xs italic text-slate-200 line-clamp-2 bg-black/50 backdrop-blur-sm p-2 rounded-xl border border-white/10">
            "{story.quote}"
          </p>
        </div>
      </div>

      {/* Story Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h3 className="text-base font-bold text-white group-hover:text-[#FF5A1F] transition-colors line-clamp-2 leading-snug">
            {story.title}
          </h3>
          <p className="text-xs text-slate-300 mt-2 line-clamp-3 leading-relaxed">
            {story.body}
          </p>
        </div>

        {/* Author Footer & Likes */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5">
            <img
              src={story.authorAvatar}
              alt={story.author}
              className="w-8 h-8 rounded-full object-cover ring-1 ring-[#FF5A1F]"
            />
            <div>
              <p className="font-semibold text-white">{story.author}</p>
              <p className="text-[10px] text-slate-400">{story.date}</p>
            </div>
          </div>

          <button
            onClick={() => toggleStoryLike(story.id)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              story.isLiked
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${story.isLiked ? 'fill-rose-400 text-rose-400' : ''}`} />
            <span>{story.likes}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
