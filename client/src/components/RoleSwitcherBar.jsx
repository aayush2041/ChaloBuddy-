import React from 'react';
import { useStore } from '../context/StoreContext';
import { ShieldCheck, User, ShieldAlert } from 'lucide-react';

export default function RoleSwitcherBar() {
  const { currentUser, switchRole, pendingQueueCount, navigate } = useStore();

  return (
    <div className="bg-neutral-100 border-b border-neutral-300 px-4 py-1 text-xs text-neutral-600 select-none">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-neutral-500 hidden sm:inline font-medium">Demo Mode:</span>
          <span className="font-semibold text-black flex items-center gap-1.5 bg-white px-2 py-0.5 border border-neutral-300">
            {currentUser?.role === 'admin' ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-black" />
                <span>ValorVault Admin</span>
              </>
            ) : (
              <>
                <User className="w-3.5 h-3.5 text-black" />
                <span>{currentUser ? currentUser.name : 'Store Visitor'}</span>
              </>
            )}
          </span>
        </div>

        <div className="flex items-center space-x-3">
          {pendingQueueCount > 0 && (
            <div
              onClick={() => {
                switchRole('admin');
                navigate('admin');
              }}
              className="hidden sm:flex items-center gap-1.5 text-amber-900 bg-amber-100 px-2 py-0.5 border border-amber-300 text-[11px] font-semibold cursor-pointer"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-amber-700" />
              <span>{pendingQueueCount} Pending UTR{pendingQueueCount > 1 ? 's' : ''} in Escrow</span>
            </div>
          )}

          <div className="flex items-center space-x-1 bg-white p-0.5 border border-neutral-300">
            <button
              onClick={() => switchRole('customer')}
              className={`px-2 py-0.5 text-xs font-bold uppercase tracking-wider transition flex items-center gap-1 cursor-pointer ${
                currentUser?.role === 'customer'
                  ? 'bg-black text-white'
                  : 'text-neutral-600 hover:text-black'
              }`}
            >
              <User className="w-3 h-3" />
              <span>Customer</span>
            </button>
            <button
              onClick={() => {
                switchRole('admin');
                navigate('admin');
              }}
              className={`px-2 py-0.5 text-xs font-bold uppercase tracking-wider transition flex items-center gap-1 cursor-pointer ${
                currentUser?.role === 'admin'
                  ? 'bg-black text-white'
                  : 'text-neutral-600 hover:text-black'
              }`}
            >
              <ShieldCheck className="w-3 h-3" />
              <span>Admin</span>
              {pendingQueueCount > 0 && (
                <span className="bg-red-600 text-white text-[9px] px-1 font-bold">
                  {pendingQueueCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
