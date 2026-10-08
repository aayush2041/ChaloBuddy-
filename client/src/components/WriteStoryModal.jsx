import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import {
  X,
  Star,
  Image,
  Sparkles,
  MapPin,
  CheckCircle2,
  Loader2,
} from 'lucide-react';

export default function WriteStoryModal() {
  const { writeStoryModalOpen, setWriteStoryModalOpen, addStory, addToast } = useStore();

  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [quote, setQuote] = useState('');
  const [body, setBody] = useState('');
  const [rating, setRating] = useState(5);
  const [selectedImage, setSelectedImage] = useState(
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!writeStoryModalOpen) return null;

  const presetImages = [
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=600&q=80',
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!title.trim() || !body.trim() || !location.trim()) {
      addToast('Please fill in title, destination, and your story narrative', 'error');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      addStory({
        title: title.trim(),
        location: location.trim(),
        quote: quote.trim() || title.trim(),
        body: body.trim(),
        rating,
        image: selectedImage,
      });
      setIsSubmitting(false);
      setTitle('');
      setLocation('');
      setQuote('');
      setBody('');
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#0C2438] text-white w-full max-w-xl rounded-3xl border border-white/15 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-[#071A2B]">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-full bg-[#FF5A1F]/20 text-[#FF5A1F] flex items-center justify-center font-bold text-sm">
              ✍️
            </span>
            <div>
              <h3 className="font-bold text-base text-white">Share Your Travel Story</h3>
              <p className="text-xs text-slate-400">Inspire the ChaloBuddy traveler community</p>
            </div>
          </div>

          <button
            onClick={() => setWriteStoryModalOpen(false)}
            className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Story Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Sunrise at 14,000 Feet over Spiti Valley"
              className="w-full bg-[#071A2B] border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#FF5A1F]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Destination / Location</label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Old Manali, Himachal"
                className="w-full bg-[#071A2B] border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#FF5A1F]"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Trip Rating</label>
              <div className="flex items-center gap-1.5 py-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="cursor-pointer"
                  >
                    <Star
                      className={`w-5 h-5 ${
                        rating >= star ? 'fill-amber-400 text-amber-400' : 'text-slate-500'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Highlight Quote (One liner)</label>
            <input
              type="text"
              value={quote}
              onChange={(e) => setQuote(e.target.value)}
              placeholder="e.g. The night sky felt so close you could reach out and pluck a star."
              className="w-full bg-[#071A2B] border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#FF5A1F]"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Your Story</label>
            <textarea
              rows={4}
              required
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Tell other travelers about your experience, the unexpected moments, the food, and the people..."
              className="w-full bg-[#071A2B] border border-white/15 rounded-xl p-3 text-white focus:outline-none focus:border-[#FF5A1F]"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1.5">Choose Cover Photo</label>
            <div className="grid grid-cols-4 gap-2">
              {presetImages.map((imgUrl, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedImage(imgUrl)}
                  className={`relative h-16 rounded-xl overflow-hidden cursor-pointer border transition-all ${
                    selectedImage === imgUrl
                      ? 'border-[#FF5A1F] ring-2 ring-[#FF5A1F]'
                      : 'border-white/10 hover:border-white/30 opacity-70'
                  }`}
                >
                  <img src={imgUrl} alt="Preset" className="w-full h-full object-cover" />
                  {selectedImage === imgUrl && (
                    <div className="absolute inset-0 bg-[#FF5A1F]/20 flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setWriteStoryModalOpen(false)}
              className="px-4 py-2 rounded-full border border-white/15 text-slate-300 hover:bg-white/5 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary-cb !py-2.5 !px-6 font-bold cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Publishing Story...</span>
                </>
              ) : (
                <span>Publish Story 🚀</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
