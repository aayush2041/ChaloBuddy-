import React from 'react';
import { useStore } from '../context/StoreContext';
import {
  Compass,
  MapPin,
  Sparkles,
  Users,
  Calendar,
  Heart,
} from 'lucide-react';

export default function MobileBottomNav() {
  const { currentRoute, navigate } = useStore();

  const navItems = [
    { id: 'home', label: 'Explore', icon: Compass },
    { id: 'trips', label: 'Trips', icon: MapPin },
    { id: 'plan-trip', label: 'Planner', icon: Sparkles },
    { id: 'buddies', label: 'Buddies', icon: Users },
    { id: 'my-trips', label: 'My Trips', icon: Calendar },
    { id: 'saved', label: 'Saved', icon: Heart },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#071A2B]/95 backdrop-blur-lg border-t border-white/10 px-2 py-2">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentRoute.page === item.id;
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.id)}
              className={`flex flex-col items-center justify-center p-1 cursor-pointer transition-colors ${
                isActive ? 'text-[#FF5A1F]' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''}`} />
              <span className={`text-[10px] mt-1 font-medium ${isActive ? 'font-bold' : ''}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
