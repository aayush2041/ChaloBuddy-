import React from 'react';
import { useStore } from '../context/StoreContext';
import {
  Compass,
  MapPin,
  PlusCircle,
  Sparkles,
  Calendar,
} from 'lucide-react';

export default function MobileBottomNav() {
  const { currentRoute, navigate } = useStore();

  const navItems = [
    { id: 'home', label: 'Explore', icon: Compass },
    { id: 'trips', label: 'Find Trips', icon: MapPin },
    { id: 'list-trip', label: 'Host', icon: PlusCircle, isHighlight: true },
    { id: 'plan-trip', label: 'Planner', icon: Sparkles, altIds: ['plan-result'] },
    { id: 'my-trips', label: 'My Trips', icon: Calendar },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#071A2B]/98 backdrop-blur-xl border-t border-white/15 px-2 pt-1.5 pb-[max(0.4rem,env(safe-area-inset-bottom))] shadow-2xl transition-all"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            currentRoute.page === item.id ||
            (item.altIds && item.altIds.includes(currentRoute.page));

          if (item.isHighlight) {
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.id)}
                className="flex flex-col items-center justify-center p-1 cursor-pointer group touch-manipulation focus:outline-none -mt-3"
                aria-label="List a Trip"
              >
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg transition-transform active:scale-95 ${
                    isActive
                      ? 'bg-[#FF5A1F] text-white ring-2 ring-white/30 shadow-[#FF5A1F]/40'
                      : 'bg-[#FF5A1F] text-white hover:bg-[#e04f1a] shadow-[#FF5A1F]/30'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] mt-1 font-bold text-white tracking-tight">
                  {item.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => navigate(item.id)}
              className={`flex-1 flex flex-col items-center justify-center py-1 px-0.5 cursor-pointer transition-all touch-manipulation focus:outline-none min-h-[48px] ${
                isActive
                  ? 'text-[#FF5A1F]'
                  : 'text-slate-400 hover:text-slate-200 active:text-white'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 stroke-[2.25]' : 'stroke-2'}`} />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#FF5A1F]" />
                )}
              </div>
              <span className={`text-[10px] mt-1 tracking-tight truncate max-w-[64px] ${isActive ? 'font-bold text-white' : 'font-medium'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
