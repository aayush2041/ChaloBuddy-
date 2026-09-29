import React from 'react';
import { useStore } from '../context/StoreContext';
import { Home, Gamepad2, Tag, Receipt, User, ShoppingBag } from 'lucide-react';

export default function MobileBottomNav() {
  const { currentRoute, navigate, cartCount, setIsCartOpen, currentUser } = useStore();

  const isActive = (page) => currentRoute.page === page;

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E7E9F2] px-2 py-1.5 flex items-center justify-around shadow-[0_-2px_10px_rgba(0,0,0,0.04)]">
      <button
        onClick={() => navigate('home')}
        className={`flex flex-col items-center gap-1 p-1 transition cursor-pointer ${
          isActive('home') ? 'text-[#5B45F5]' : 'text-[#667085] hover:text-[#111426]'
        }`}
      >
        <Home className="w-4 h-4" />
        <span className="text-[10px] font-bold">Home</span>
      </button>

      <button
        onClick={() => navigate('games', { category: 'all' })}
        className={`flex flex-col items-center gap-1 p-1 transition cursor-pointer ${
          isActive('games') || isActive('catalog') ? 'text-[#5B45F5]' : 'text-[#667085] hover:text-[#111426]'
        }`}
      >
        <Gamepad2 className="w-4 h-4" />
        <span className="text-[10px] font-bold">Games</span>
      </button>

      <button
        onClick={() => navigate('games', { is_deal: 'true' })}
        className={`flex flex-col items-center gap-1 p-1 transition cursor-pointer ${
          currentRoute.params?.is_deal === 'true' ? 'text-[#5B45F5]' : 'text-[#667085] hover:text-[#111426]'
        }`}
      >
        <Tag className="w-4 h-4" />
        <span className="text-[10px] font-bold">Deals</span>
      </button>

      <button
        onClick={() => navigate('orders')}
        className={`flex flex-col items-center gap-1 p-1 transition cursor-pointer ${
          isActive('orders') ? 'text-[#5B45F5]' : 'text-[#667085] hover:text-[#111426]'
        }`}
      >
        <Receipt className="w-4 h-4" />
        <span className="text-[10px] font-bold">Orders</span>
      </button>

      <button
        onClick={() => {
          if (currentUser) {
            navigate('account');
          } else {
            navigate('login');
          }
        }}
        className={`flex flex-col items-center gap-1 p-1 transition cursor-pointer ${
          isActive('account') || isActive('login') ? 'text-[#5B45F5]' : 'text-[#667085] hover:text-[#111426]'
        }`}
      >
        <User className="w-4 h-4" />
        <span className="text-[10px] font-bold">Profile</span>
      </button>
    </nav>
  );
}
