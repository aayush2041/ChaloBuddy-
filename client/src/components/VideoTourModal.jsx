import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import {
  X,
  Play,
  Pause,
  Compass,
  Volume2,
  VolumeX,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export default function VideoTourModal() {
  const { videoTourModalOpen, setVideoTourModalOpen, navigate } = useStore();
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [activeChapter, setActiveChapter] = useState(0);

  if (!videoTourModalOpen) return null;

  const chapters = [
    {
      title: '01. The Spiti Odyssey',
      desc: 'Crossing Kunzum Pass at 14,930 ft and stargazing by Chandratal lake.',
      image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    },
    {
      title: '02. Parvati & Tirthan Peace',
      desc: 'Riverside wooden cottages, pine forests, and cozy woodfired bakeries.',
      image: 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=1200&q=80',
    },
    {
      title: '03. The Living Bridges of Meghalaya',
      desc: 'Double decker root bridges bio-engineered by ancient Khasi traditions.',
      image: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1200&q=80',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="bg-[#071A2B] text-white w-full max-w-4xl rounded-3xl border border-white/15 shadow-2xl overflow-hidden flex flex-col">
        {/* Top Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#0C2438]">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-[#FF5A1F] flex items-center justify-center text-white">
              <Compass className="w-4 h-4" />
            </span>
            <div>
              <h3 className="font-bold text-sm text-white">ChaloBuddy: The Journey Begins</h3>
              <p className="text-[11px] text-slate-400">Cinematic Adventure Showcase • 4K Experience</p>
            </div>
          </div>

          <button
            onClick={() => setVideoTourModalOpen(false)}
            className="p-1.5 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Canvas / Screen */}
        <div className="relative h-80 sm:h-96 w-full overflow-hidden bg-black flex items-center justify-center group">
          <img
            src={chapters[activeChapter].image}
            alt="Cinematic Preview"
            className="w-full h-full object-cover opacity-85 transition-all duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#071A2B] via-transparent to-black/40" />

          {/* Center Play/Pause button */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-16 h-16 rounded-full bg-[#FF5A1F] text-white flex items-center justify-center shadow-xl shadow-[#FF5A1F]/40 hover:scale-110 transition-all cursor-pointer z-10"
          >
            {isPlaying ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-1" />}
          </button>

          {/* Chapter Overlay Info */}
          <div className="absolute bottom-6 left-6 right-6 z-10 flex items-end justify-between">
            <div className="max-w-lg">
              <span className="text-[11px] font-bold text-[#FF5A1F] uppercase tracking-wider bg-black/50 px-2.5 py-0.5 rounded-full">
                Now Playing
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
                {chapters[activeChapter].title}
              </h2>
              <p className="text-xs text-slate-300 mt-1 line-clamp-2">
                {chapters[activeChapter].desc}
              </p>
            </div>

            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-2 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-sm border border-white/15 cursor-pointer"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Chapters Strip & CTA */}
        <div className="p-4 bg-[#0C2438] border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
            {chapters.map((ch, idx) => (
              <button
                key={idx}
                onClick={() => setActiveChapter(idx)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  activeChapter === idx
                    ? 'bg-[#FF5A1F] text-white shadow-md'
                    : 'bg-white/5 hover:bg-white/10 text-slate-300'
                }`}
              >
                {ch.title.split('.')[1] || ch.title}
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              setVideoTourModalOpen(false);
              navigate('trips');
            }}
            className="w-full sm:w-auto btn-primary-cb !py-2 !px-5 !text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Explore All Trips</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
