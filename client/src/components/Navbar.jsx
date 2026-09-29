import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import {
  Search,
  ShoppingCart,
  User,
  ChevronDown,
  Menu,
  X,
  LogOut,
  Receipt,
  Key,
  ShieldCheck,
  Headphones,
  SlidersHorizontal
} from 'lucide-react';
import SearchModal from './SearchModal';

export default function Navbar() {
  const {
    currentUser,
    logoutUser,
    cartCount,
    setIsCartOpen,
    navigate,
    currentRoute,
    setAuthModalOpen,
    setAuthModalMode
  } = useStore();

  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navClass = (page) => {
    const isActive = currentRoute.page === page || ((page === 'games' || page === 'catalog') && (currentRoute.page === 'games' || currentRoute.page === 'catalog'));
    return `text-[13px] font-bold tracking-wider uppercase transition-all duration-200 cursor-pointer select-none py-1.5 relative ${
      isActive
        ? 'text-[#09090B] after:content-[""] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#7C4DFF] after:rounded-full'
        : 'text-[#71717A] hover:text-[#09090B]'
    }`;
  };

  return (
    <>
      {/* Top Announcement Bar */}
      <div className="bg-[#09090B] text-white text-[10px] sm:text-[11px] font-semibold py-1.5 sm:py-2 px-3 sm:px-4 text-center tracking-wider uppercase border-b border-neutral-800">
        <div className="max-w-[1240px] mx-auto flex items-center justify-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <span className="text-neutral-200 truncate">
            <span className="hidden sm:inline">Instant Digital Delivery • Verified 24/7 Escrow Protection • Official ValorVault Store</span>
            <span className="sm:hidden">⚡ Instant Digital Delivery • 24/7 Escrow Protection</span>
          </span>
        </div>
      </div>

      {/* Main Header (64px mobile, 72px desktop) */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E4E4E7] transition-all">
        <div className="max-w-[1240px] mx-auto h-[64px] sm:h-[72px] px-3 sm:px-6 flex items-center justify-between gap-2 sm:gap-6">
          
          {/* Left: Mobile Menu Button & Brand Logo */}
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => setMobileDrawerOpen(true)}
              className="lg:hidden p-2 text-[#09090B] hover:text-[#7C4DFF] rounded-lg transition-colors cursor-pointer"
              aria-label="Open Navigation Menu"
            >
              <Menu className="w-5 h-5" strokeWidth={2} />
            </button>

            {/* Logo */}
            <div
              onClick={() => navigate('home')}
              className="flex items-center gap-3 cursor-pointer group select-none py-1"
            >
              <img
                src="/shopify_assets/logo.png"
                alt="ValorVault"
                className="h-8 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <div className="flex flex-col">
                <span className="font-extrabold text-[19px] tracking-tight text-[#09090B] uppercase leading-none font-heading">
                  VALOR<span className="text-[#7C4DFF]">VAULT</span>
                </span>
                <span className="text-[9px] font-bold tracking-widest text-[#71717A] uppercase mt-0.5">
                  Gaming Vault
                </span>
              </div>
            </div>
          </div>

          {/* Center: Desktop Navigation Links (24-28px spacing) */}
          <nav className="hidden lg:flex items-center gap-7">
            <span onClick={() => navigate('home')} className={navClass('home')}>
              Home
            </span>
            <span onClick={() => navigate('games')} className={navClass('games')}>
              Games
            </span>
            <span onClick={() => navigate('process')} className={navClass('process')}>
              Process
            </span>
            <span onClick={() => navigate('contact')} className={navClass('contact')}>
              Contact
            </span>
          </nav>

          {/* Right: Actions (Search, Account, Cart) */}
          <div className="flex items-center gap-3">
            
            {/* Search Icon Button */}
            <button
              onClick={() => setSearchModalOpen(true)}
              className="p-2 text-[#09090B] hover:text-[#7C4DFF] hover:bg-neutral-100 rounded-lg cursor-pointer transition-colors flex items-center gap-1.5"
              title="Search (Ctrl + K)"
              aria-label="Search"
            >
              <Search className="w-4 h-4" strokeWidth={2} />
              <span className="hidden md:inline text-[11px] text-[#71717A] font-mono border border-[#E4E4E7] px-1.5 py-0.5 rounded">
                ⌘K
              </span>
            </button>

            {/* Account / User Menu */}
            {currentUser ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 py-1.5 px-3 border border-[#E4E4E7] hover:border-[#09090B] text-[#09090B] text-xs font-bold rounded-xl transition-all duration-150 hover:-translate-y-[1px] cursor-pointer bg-white"
                >
                  <User className="w-3.5 h-3.5 text-[#7C4DFF]" strokeWidth={2} />
                  <span className="hidden sm:inline max-w-[100px] truncate">
                    {currentUser.name || currentUser.username}
                  </span>
                  <ChevronDown className="w-3 h-3 text-[#71717A]" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-[#E4E4E7] rounded-xl shadow-xl z-50 py-2 animate-in fade-in duration-150">
                    <div className="px-4 py-2 border-b border-[#F4F4F5]">
                      <p className="text-[11px] text-[#71717A]">Signed in as</p>
                      <p className="text-xs font-bold text-[#09090B] truncate">{currentUser.email}</p>
                      <span className="inline-block mt-1 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#F1ECFF] text-[#7C4DFF]">
                        {currentUser.role}
                      </span>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          navigate('account');
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-semibold text-[#52525B] hover:text-[#09090B] hover:bg-neutral-50 flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        <Receipt className="w-3.5 h-3.5 text-[#71717A]" />
                        My Orders
                      </button>

                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          navigate('account', { tab: 'credentials' });
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-semibold text-[#52525B] hover:text-[#09090B] hover:bg-neutral-50 flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        <Key className="w-3.5 h-3.5 text-emerald-600" />
                        Digital Vault
                      </button>

                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          navigate('contact');
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-semibold text-[#52525B] hover:text-[#09090B] hover:bg-neutral-50 flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        <Headphones className="w-3.5 h-3.5 text-[#71717A]" />
                        Support Desk
                      </button>

                      {currentUser.role === 'admin' && (
                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            navigate('admin');
                          }}
                          className="w-full text-left px-4 py-2 text-xs font-bold text-[#7C4DFF] hover:bg-[#F1ECFF]/50 flex items-center gap-2 border-t border-[#F4F4F5] cursor-pointer transition-colors"
                        >
                          <SlidersHorizontal className="w-3.5 h-3.5" />
                          Admin Console
                        </button>
                      )}
                    </div>

                    <div className="border-t border-[#F4F4F5] pt-1">
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          logoutUser();
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => {
                  setAuthModalMode('login');
                  setAuthModalOpen(true);
                }}
                className="text-[11px] sm:text-xs uppercase font-bold tracking-wider px-3 sm:px-4 py-1.5 sm:py-2 bg-[#7C4DFF] hover:bg-[#6D3DF5] text-white rounded-xl shadow-xs transition-all duration-150 hover:-translate-y-[1px] cursor-pointer"
              >
                Log In
              </button>
            )}

            {/* Cart Icon & Sliding Drawer Trigger */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-[#09090B] hover:text-[#7C4DFF] hover:bg-neutral-100 rounded-lg cursor-pointer transition-colors flex items-center"
              aria-label={`Cart with ${cartCount} items`}
            >
              <ShoppingCart className="w-5 h-5" strokeWidth={2} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#7C4DFF] text-white text-[10px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center shadow-xs">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setMobileDrawerOpen(false)}
          />

          {/* Drawer Content */}
          <div className="relative w-full max-w-xs bg-white text-[#09090B] h-full shadow-2xl flex flex-col justify-between z-10 animate-in slide-in-from-left duration-200">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-[#E4E4E7]">
                <div className="flex items-center gap-2">
                  <img src="/shopify_assets/logo.png" alt="Logo" className="h-7 w-auto" />
                  <span className="font-extrabold text-base tracking-tight uppercase font-heading">
                    VALOR<span className="text-[#7C4DFF]">VAULT</span>
                  </span>
                </div>
                <button
                  onClick={() => setMobileDrawerOpen(false)}
                  className="p-1.5 text-[#71717A] hover:text-[#09090B] rounded-lg cursor-pointer transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="p-5 space-y-3">
                <div
                  onClick={() => {
                    navigate('home');
                    setMobileDrawerOpen(false);
                  }}
                  className="text-sm font-bold uppercase tracking-wider text-[#09090B] hover:text-[#7C4DFF] cursor-pointer py-2 border-b border-[#F4F4F5] transition-colors"
                >
                  Home
                </div>
                <div
                  onClick={() => {
                    navigate('games');
                    setMobileDrawerOpen(false);
                  }}
                  className="text-sm font-bold uppercase tracking-wider text-[#09090B] hover:text-[#7C4DFF] cursor-pointer py-2 border-b border-[#F4F4F5] transition-colors"
                >
                  Games
                </div>
                <div
                  onClick={() => {
                    navigate('process');
                    setMobileDrawerOpen(false);
                  }}
                  className="text-sm font-bold uppercase tracking-wider text-[#09090B] hover:text-[#7C4DFF] cursor-pointer py-2 border-b border-[#F4F4F5] transition-colors"
                >
                  Process
                </div>
                <div
                  onClick={() => {
                    navigate('contact');
                    setMobileDrawerOpen(false);
                  }}
                  className="text-sm font-bold uppercase tracking-wider text-[#09090B] hover:text-[#7C4DFF] cursor-pointer py-2 border-b border-[#F4F4F5] transition-colors"
                >
                  Contact
                </div>
              </nav>
            </div>

            {/* Bottom Actions */}
            <div className="p-5 border-t border-[#E4E4E7] bg-[#FAFAFA] space-y-3">
              {currentUser ? (
                <div className="space-y-2">
                  <div className="text-[11px] text-[#71717A] font-semibold uppercase">
                    Account: {currentUser.name || currentUser.username}
                  </div>
                  <button
                    onClick={() => {
                      navigate('account');
                      setMobileDrawerOpen(false);
                    }}
                    className="w-full py-2.5 bg-[#09090B] hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition cursor-pointer"
                  >
                    View Account & Orders
                  </button>
                  <button
                    onClick={() => {
                      logoutUser();
                      setMobileDrawerOpen(false);
                    }}
                    className="w-full py-2.5 border border-[#E4E4E7] hover:border-[#09090B] text-xs font-bold uppercase tracking-wider rounded-xl transition cursor-pointer text-[#09090B] bg-white"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setAuthModalMode('login');
                    setAuthModalOpen(true);
                    setMobileDrawerOpen(false);
                  }}
                  className="w-full py-3 bg-[#7C4DFF] hover:bg-[#6D3DF5] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-xs transition cursor-pointer"
                >
                  Log In / Create Account
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Predictive Search Modal */}
      <SearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
      />
    </>
  );
}
