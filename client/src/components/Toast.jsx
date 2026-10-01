import React from 'react';
import { useStore } from '../context/StoreContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast() {
  const { toasts, removeToast } = useStore();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed bottom-16 sm:bottom-6 right-4 sm:right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 p-3.5 rounded-2xl shadow-2xl border backdrop-blur-md transition-all duration-300 transform translate-y-0 text-xs font-medium ${
              isSuccess
                ? 'bg-[#071A2B]/95 border-[#10B981]/40 text-white ring-1 ring-[#10B981]/20'
                : isError
                ? 'bg-[#071A2B]/95 border-red-500/40 text-white ring-1 ring-red-500/20'
                : 'bg-[#071A2B]/95 border-white/20 text-white'
            }`}
          >
            <div className="flex items-center gap-2.5 overflow-hidden">
              {isSuccess && <CheckCircle2 className="w-4 h-4 text-[#10B981] flex-shrink-0" />}
              {isError && <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />}
              {!isSuccess && !isError && <Info className="w-4 h-4 text-[#FF5A1F] flex-shrink-0" />}
              <span className="truncate">{toast.message}</span>
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer flex-shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
