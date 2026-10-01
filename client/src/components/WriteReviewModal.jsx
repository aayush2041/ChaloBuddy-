import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import {
  X,
  Star,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';

export default function WriteReviewModal() {
  const { writeReviewModalData, setWriteReviewModalData, addToast } = useStore();

  const [tripRating, setTripRating] = useState(5);
  const [hostRating, setHostRating] = useState(5);
  const [stayRating, setStayRating] = useState(5);
  const [valueRating, setValueRating] = useState(5);
  const [comment, setComment] = useState('');

  if (!writeReviewModalData) return null;
  const target = writeReviewModalData;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      addToast('Please write a short review sharing your experience', 'error');
      return;
    }

    addToast('Thank you! Your verified review has been submitted and posted.', 'success');
    setWriteReviewModalData(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#0C2438] text-white w-full max-w-lg rounded-3xl border border-white/15 shadow-2xl overflow-hidden p-6 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center">
              ⭐
            </span>
            <div>
              <h3 className="font-bold text-base text-white">Write a Review</h3>
              <p className="text-xs text-slate-400 truncate max-w-xs">{target.title || target.name}</p>
            </div>
          </div>

          <button
            onClick={() => setWriteReviewModalData(null)}
            className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Multi-criteria star ratings */}
          <div className="grid grid-cols-2 gap-3 bg-[#071A2B] p-4 rounded-2xl border border-white/10">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Overall Trip</label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setTripRating(s)}
                    className="cursor-pointer"
                  >
                    <Star
                      className={`w-4 h-4 ${tripRating >= s ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Host / Organizer</label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setHostRating(s)}
                    className="cursor-pointer"
                  >
                    <Star
                      className={`w-4 h-4 ${hostRating >= s ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Stay Comfort</label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStayRating(s)}
                    className="cursor-pointer"
                  >
                    <Star
                      className={`w-4 h-4 ${stayRating >= s ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Value for Money</label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setValueRating(s)}
                    className="cursor-pointer"
                  >
                    <Star
                      className={`w-4 h-4 ${valueRating >= s ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}`}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Detailed Review & Advice for Travelers</label>
            <textarea
              rows={4}
              required
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What did you love most? How were the trails, food, and group vibes?"
              className="w-full bg-[#071A2B] border border-white/15 rounded-xl p-3 text-white focus:outline-none focus:border-[#FF5A1F]"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setWriteReviewModalData(null)}
              className="px-4 py-2 rounded-full border border-white/15 text-slate-300 hover:bg-white/5 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary-cb !py-2.5 !px-6 font-bold cursor-pointer"
            >
              Submit Review ⭐
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
