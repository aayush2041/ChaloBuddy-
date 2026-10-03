import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import {
  Compass,
  Search,
  Bell,
  MessageSquare,
  User,
  Heart,
  Calendar,
  PlusCircle,
  Menu,
  X,
  ChevronDown,
  CheckCircle2,
  Shield,
  LogOut,
  MapPin,
  Sparkles,
  Users,
} from 'lucide-react';

export default function Navbar() {
  const {
    currentRoute,
    navigate,
    currentUser,
    switchUser,
    logoutUser,
    currency,
    setCurrency,
    unreadNotificationCount,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    setSearchModalOpen,
    setAuthModalOpen,
    setAuthModalMode,
    allUsers,
  } = useStore();

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [currencyDropdownOpen, setCurrencyDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);

  // Monitor scroll for transparent -> sticky backdrop transition on homepage
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isHome = currentRoute.page === 'home';
  // On homepage and not scrolled: overlay header. Otherwise: solid sticky dark navy header
  const isDarkOverlay = isHome && !isScrolled;

  const handleNavClick = (page, params = {}) => {
    navigate(page, params);
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
    setNotifDropdownOpen(false);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isDarkOverlay
          ? 'bg-[#071A2B]/75 backdrop-blur-md text-white py-3.5 border-b border-white/10'
          : 'bg-[#071A2B]/95 backdrop-blur-xl text-white shadow-xl py-3.5 border-b border-white/15'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-11">
          {/* Left: Brand Logo & Navigation */}
          <div className="flex items-center gap-6 xl:gap-8">
            <button
              onClick={() => handleNavClick('home')}
              className="flex items-center gap-2.5 group text-left cursor-pointer"
            >
              <div className="w-9 h-9 rounded-full bg-[#FF5A1F] flex items-center justify-center text-white shadow-md shadow-[#FF5A1F]/30 group-hover:scale-105 transition-transform">
                <Compass className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-white flex items-center gap-1">
                  Chalo<span className="text-[#FF5A1F]">Buddy</span>
                </span>
                <span className="hidden sm:block text-[9px] uppercase tracking-widest text-slate-300 font-medium">
                  Travel Better • Plan Smarter
                </span>
              </div>
            </button>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-4 xl:gap-5 text-[13px] xl:text-sm font-medium whitespace-nowrap">
              <button
                onClick={() => handleNavClick('home')}
                className={`transition-colors cursor-pointer py-1 relative ${
                  currentRoute.page === 'home' ? 'text-[#FF5A1F] font-bold' : 'text-slate-200 hover:text-white'
                }`}
              >
                <span>Explore</span>
                {currentRoute.page === 'home' && (
                  <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#FF5A1F] rounded-full" />
                )}
              </button>
              <button
                onClick={() => handleNavClick('trips')}
                className={`inline-flex items-center justify-center transition-colors cursor-pointer py-1 relative min-h-[38px] ${
                  currentRoute.page === 'trips' ? 'text-[#FF5A1F] font-bold' : 'text-slate-200 hover:text-white'
                }`}
              >
                <span className="w-[48px] text-center leading-[1.15]">Find a<br />Trip</span>
                {currentRoute.page === 'trips' && (
                  <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#FF5A1F] rounded-full" />
                )}
              </button>
              <button
                onClick={() => handleNavClick('list-trip')}
                className={`flex items-center justify-center gap-1.5 transition-colors cursor-pointer py-1 relative min-h-[38px] ${
                  currentRoute.page === 'list-trip' ? 'text-[#FF5A1F] font-bold' : 'text-slate-200 hover:text-white'
                }`}
              >
                <span className="w-[48px] text-center leading-[1.15]">List a<br />Trip</span>
                <span className="text-[10px] bg-[#FF5A1F] text-white px-1.5 py-0.2 rounded-full font-bold">Host</span>
                {currentRoute.page === 'list-trip' && (
                  <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#FF5A1F] rounded-full" />
                )}
              </button>
              <button
                onClick={() => handleNavClick('stays')}
                className={`inline-flex items-center justify-center transition-colors cursor-pointer py-1 relative min-h-[38px] ${
                  currentRoute.page === 'stays' ? 'text-[#FF5A1F] font-bold' : 'text-slate-200 hover:text-white'
                }`}
              >
                <span className="w-[52px] text-center leading-[1.15]">Find<br />Stays</span>
                {currentRoute.page === 'stays' && (
                  <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#FF5A1F] rounded-full" />
                )}
              </button>
              <button
                onClick={() => handleNavClick('plan-trip')}
                className={`flex items-center justify-center gap-1 transition-colors cursor-pointer py-1 relative min-h-[38px] ${
                  currentRoute.page === 'plan-trip' || currentRoute.page === 'plan-result' ? 'text-[#FF5A1F] font-bold' : 'text-slate-200 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-[#FF5A1F]" />
                <span className="w-[60px] text-center leading-[1.15]">Smart<br />Planner</span>
                {(currentRoute.page === 'plan-trip' || currentRoute.page === 'plan-result') && (
                  <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#FF5A1F] rounded-full" />
                )}
              </button>
              <button
                onClick={() => handleNavClick('stories')}
                className={`transition-colors cursor-pointer py-1 relative ${
                  currentRoute.page === 'stories' ? 'text-[#FF5A1F] font-bold' : 'text-slate-200 hover:text-white'
                }`}
              >
                <span>Stories</span>
                {currentRoute.page === 'stories' && (
                  <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#FF5A1F] rounded-full" />
                )}
              </button>
              <button
                onClick={() => handleNavClick('about')}
                className={`transition-colors cursor-pointer py-1 relative ${
                  currentRoute.page === 'about' ? 'text-[#FF5A1F] font-bold' : 'text-slate-200 hover:text-white'
                }`}
              >
                <span>About</span>
                {currentRoute.page === 'about' && (
                  <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#FF5A1F] rounded-full" />
                )}
              </button>
            </nav>
          </div>

          {/* Right: Actions, Search, Currency, Notifications, Profile */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 md:gap-3">
            {/* Search Spotlight Trigger */}
            <button
              onClick={() => setSearchModalOpen(true)}
              className="p-2 rounded-full hover:bg-white/10 text-slate-200 hover:text-white transition-colors cursor-pointer"
              title="Search trips, stays, and destinations"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Currency Selector Dropdown (Desktop / Tablet) */}
            <div className="relative hidden md:block">
              <button
                onClick={() => setCurrencyDropdownOpen(!currencyDropdownOpen)}
                className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer border border-white/10"
              >
                <span>{currency === 'INR' ? '₹ INR' : currency === 'USD' ? '$ USD' : '€ EUR'}</span>
                <ChevronDown className="w-3 h-3" />
              </button>
              {currencyDropdownOpen && (
                <div className="absolute right-0 mt-2 w-32 bg-[#0C2438] border border-white/15 rounded-xl shadow-2xl py-1 z-50 text-xs">
                  <button
                    onClick={() => { setCurrency('INR'); setCurrencyDropdownOpen(false); }}
                    className={`w-full text-left px-3 py-2 hover:bg-white/10 flex items-center justify-between cursor-pointer ${currency === 'INR' ? 'text-[#FF5A1F] font-bold' : 'text-white'}`}
                  >
                    <span>₹ INR (Rupee)</span>
                    {currency === 'INR' && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => { setCurrency('USD'); setCurrencyDropdownOpen(false); }}
                    className={`w-full text-left px-3 py-2 hover:bg-white/10 flex items-center justify-between cursor-pointer ${currency === 'USD' ? 'text-[#FF5A1F] font-bold' : 'text-white'}`}
                  >
                    <span>$ USD (Dollar)</span>
                    {currency === 'USD' && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => { setCurrency('EUR'); setCurrencyDropdownOpen(false); }}
                    className={`w-full text-left px-3 py-2 hover:bg-white/10 flex items-center justify-between cursor-pointer ${currency === 'EUR' ? 'text-[#FF5A1F] font-bold' : 'text-white'}`}
                  >
                    <span>€ EUR (Euro)</span>
                    {currency === 'EUR' && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </button>
                </div>
              )}
            </div>

            {/* Notification Bell Dropdown */}
            <div className="relative">
              <button
                onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                className="relative p-2 rounded-full hover:bg-white/10 text-slate-200 hover:text-white transition-colors cursor-pointer"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadNotificationCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-[#FF5A1F] text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce">
                    {unreadNotificationCount}
                  </span>
                )}
              </button>
              {notifDropdownOpen && (
                <div className="absolute right-0 mt-2 w-[calc(100vw-2rem)] max-w-sm sm:w-96 bg-[#071A2B] border border-white/15 rounded-2xl shadow-2xl overflow-hidden z-50">
                  <div className="p-3.5 border-b border-white/10 flex items-center justify-between bg-[#0C2438]">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-[#FF5A1F]" />
                      <span className="font-bold text-sm text-white">Notifications</span>
                      {unreadNotificationCount > 0 && (
                        <span className="bg-[#FF5A1F]/20 text-[#FF5A1F] text-xs px-2 py-0.5 rounded-full font-bold">
                          {unreadNotificationCount} new
                        </span>
                      )}
                    </div>
                    {unreadNotificationCount > 0 && (
                      <button
                        onClick={markAllNotificationsRead}
                        className="text-xs text-[#FF5A1F] hover:underline cursor-pointer"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-white/5">
                    {notifications.length === 0 ? (
                      <p className="p-4 text-xs text-slate-400 text-center">No notifications yet</p>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => {
                            markNotificationRead(notif.id);
                            if (notif.link) handleNavClick(notif.link.page, notif.link.params);
                            setNotifDropdownOpen(false);
                          }}
                          className={`p-3.5 hover:bg-white/5 cursor-pointer transition-colors ${
                            notif.unread ? 'bg-white/5' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-semibold text-xs text-white">{notif.title}</span>
                            <span className="text-[10px] text-slate-400 whitespace-nowrap">{notif.time}</span>
                          </div>
                          <p className="text-xs text-slate-300 mt-1 line-clamp-2">{notif.desc}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Messages Icon (Desktop / Tablet) */}
            <button
              onClick={() => handleNavClick('messages')}
              className="relative p-2 rounded-full hover:bg-white/10 text-slate-200 hover:text-white transition-colors cursor-pointer hidden md:flex"
              title="Chat & Messages"
            >
              <MessageSquare className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#FF5A1F] rounded-full"></span>
            </button>

            {/* Saved Items Heart (Desktop / Tablet) */}
            <button
              onClick={() => handleNavClick('saved')}
              className="p-2 rounded-full hover:bg-white/10 text-slate-200 hover:text-white transition-colors cursor-pointer hidden md:flex"
              title="Saved Trips & Stays"
            >
              <Heart className="w-5 h-5" />
            </button>

            {/* User Profile / Auth State (Desktop / Tablet) */}
            <div className="hidden md:flex items-center">
              {currentUser ? (
                <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 p-1 pl-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 transition-all cursor-pointer"
                >
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-7 h-7 rounded-full object-cover ring-1 ring-[#FF5A1F]"
                  />
                  <span className="hidden md:inline text-xs font-semibold text-white max-w-[100px] truncate">
                    {currentUser.name}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-300" />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-[#071A2B] border border-white/15 rounded-2xl shadow-2xl py-2 z-50 text-sm">
                    <div className="px-4 py-3 border-b border-white/10 bg-[#0C2438]/50">
                      <div className="flex items-center gap-3">
                        <img
                          src={currentUser.avatar}
                          alt={currentUser.name}
                          className="w-10 h-10 rounded-full object-cover ring-2 ring-[#FF5A1F]"
                        />
                        <div className="overflow-hidden">
                          <p className="font-bold text-white text-sm truncate">{currentUser.name}</p>
                          <p className="text-[11px] text-[#FF5A1F] font-medium capitalize flex items-center gap-1">
                            <Shield className="w-3 h-3" />
                            {currentUser.role} • {currentUser.rating}★
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => handleNavClick('my-trips')}
                        className="w-full text-left px-4 py-2 hover:bg-white/10 text-slate-200 hover:text-white flex items-center gap-2.5 cursor-pointer text-xs font-medium"
                      >
                        <Calendar className="w-4 h-4 text-[#FF5A1F]" />
                        <span>My Trips (Workspace)</span>
                      </button>
                      <button
                        onClick={() => handleNavClick('saved')}
                        className="w-full text-left px-4 py-2 hover:bg-white/10 text-slate-200 hover:text-white flex items-center gap-2.5 cursor-pointer text-xs font-medium"
                      >
                        <Heart className="w-4 h-4 text-[#FF5A1F]" />
                        <span>Saved Trips & Wishlist</span>
                      </button>
                      <button
                        onClick={() => handleNavClick('profile', { id: currentUser.id })}
                        className="w-full text-left px-4 py-2 hover:bg-white/10 text-slate-200 hover:text-white flex items-center gap-2.5 cursor-pointer text-xs font-medium"
                      >
                        <User className="w-4 h-4 text-[#FF5A1F]" />
                        <span>View My Profile</span>
                      </button>
                      <button
                        onClick={() => handleNavClick('admin')}
                        className="w-full text-left px-4 py-2 hover:bg-white/10 text-slate-200 hover:text-white flex items-center gap-2.5 cursor-pointer text-xs font-medium"
                      >
                        <Shield className="w-4 h-4 text-emerald-400" />
                        <span>Admin Dashboard</span>
                      </button>
                    </div>

                    {/* Switch Persona Tester Tool */}
                    <div className="px-4 py-2 border-t border-white/10 bg-[#0C2438]/30">
                      <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5">
                        Switch Persona (Tester)
                      </p>
                      <div className="space-y-1">
                        {allUsers.slice(0, 3).map((u) => (
                          <button
                            key={u.id}
                            onClick={() => {
                              switchUser(u);
                              setProfileDropdownOpen(false);
                            }}
                            className={`w-full text-left px-2 py-1 rounded text-xs flex items-center justify-between cursor-pointer ${
                              currentUser.id === u.id
                                ? 'bg-[#FF5A1F]/20 text-[#FF5A1F] font-bold'
                                : 'text-slate-300 hover:bg-white/10'
                            }`}
                          >
                            <span className="truncate">{u.name} ({u.role})</span>
                            {currentUser.id === u.id && <CheckCircle2 className="w-3 h-3 text-[#FF5A1F]" />}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="pt-1 border-t border-white/10">
                      <button
                        onClick={() => {
                          logoutUser();
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-red-500/10 text-red-400 flex items-center gap-2.5 cursor-pointer text-xs font-medium"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Log out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setAuthModalMode('login');
                    setAuthModalOpen(true);
                  }}
                  className="text-xs font-semibold px-3 py-1.5 text-slate-200 hover:text-white transition-colors cursor-pointer"
                >
                  Log in
                </button>
                <button
                  onClick={() => {
                    setAuthModalMode('signup');
                    setAuthModalOpen(true);
                  }}
                  className="btn-primary-cb !py-1.5 !px-3.5 !text-xs cursor-pointer"
                >
                  Sign up
                </button>
              </div>
            )}
            </div>

            {/* Mobile Menu Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6 text-[#FF5A1F]" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu (Full slide-down overlay sheet) */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-[72px] bottom-0 bg-[#071A2B]/98 backdrop-blur-2xl z-50 flex flex-col overflow-y-auto border-t border-white/10 pb-8 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex-1 px-4 py-4 space-y-4 max-w-md mx-auto w-full">
            
            {/* 1. User Profile or Auth Block */}
            {currentUser ? (
              <div className="bg-[#0C2438] border border-white/15 rounded-2xl p-4 shadow-lg">
                <div className="flex items-center gap-3">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-[#FF5A1F]"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-white text-base truncate">{currentUser.name}</p>
                    <p className="text-xs text-[#FF5A1F] font-semibold capitalize flex items-center gap-1 mt-0.5">
                      <Shield className="w-3.5 h-3.5" />
                      {currentUser.role} • {currentUser.rating}★
                    </p>
                  </div>
                  <button
                    onClick={() => handleNavClick('profile', { id: currentUser.id })}
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold cursor-pointer"
                  >
                    Profile
                  </button>
                </div>

                {/* Quick Profile Shortcuts */}
                <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-white/10">
                  <button
                    onClick={() => handleNavClick('my-trips')}
                    className="flex items-center gap-2 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-slate-200 font-medium cursor-pointer"
                  >
                    <Calendar className="w-4 h-4 text-[#FF5A1F]" />
                    <span className="truncate">My Trips</span>
                  </button>
                  <button
                    onClick={() => handleNavClick('messages')}
                    className="flex items-center gap-2 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-slate-200 font-medium cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4 text-[#FF5A1F]" />
                    <span className="truncate">Messages</span>
                  </button>
                </div>

                {/* Tester Persona Switcher */}
                <div className="mt-3 pt-3 border-t border-white/10">
                  <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5">
                    Switch Persona (Tester)
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {allUsers.slice(0, 3).map((u) => (
                      <button
                        key={u.id}
                        onClick={() => switchUser(u)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-all ${
                          currentUser.id === u.id
                            ? 'bg-[#FF5A1F] text-white font-bold'
                            : 'bg-white/10 text-slate-300 hover:bg-white/20'
                        }`}
                      >
                        {u.name.split(' ')[0]} ({u.role})
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-[#0C2438] border border-white/15 rounded-2xl p-4 shadow-lg text-center">
                <p className="text-sm font-bold text-white mb-1">Welcome to ChaloBuddy</p>
                <p className="text-xs text-slate-300 mb-3.5">Join verified travelers, plan smart trips and connect with buddies.</p>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    onClick={() => {
                      setAuthModalMode('login');
                      setAuthModalOpen(true);
                      setMobileMenuOpen(false);
                    }}
                    className="py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs cursor-pointer"
                  >
                    Log in
                  </button>
                  <button
                    onClick={() => {
                      setAuthModalMode('signup');
                      setAuthModalOpen(true);
                      setMobileMenuOpen(false);
                    }}
                    className="btn-primary-cb !py-2 !px-3 !text-xs font-bold cursor-pointer"
                  >
                    Sign up
                  </button>
                </div>
              </div>
            )}

            {/* 2. Navigation Links */}
            <nav className="space-y-1 bg-[#0C2438]/50 border border-white/10 rounded-2xl p-2">
              <button
                onClick={() => handleNavClick('home')}
                className={`w-full text-left py-2.5 px-3.5 rounded-xl hover:bg-white/10 text-xs sm:text-sm font-semibold flex items-center gap-3 cursor-pointer ${
                  currentRoute.page === 'home' ? 'text-[#FF5A1F] bg-white/5' : 'text-white'
                }`}
              >
                <Compass className="w-4 h-4 text-[#FF5A1F]" />
                <span>Explore Home</span>
              </button>
              <button
                onClick={() => handleNavClick('trips')}
                className={`w-full text-left py-2.5 px-3.5 rounded-xl hover:bg-white/10 text-xs sm:text-sm font-semibold flex items-center gap-3 cursor-pointer ${
                  currentRoute.page === 'trips' ? 'text-[#FF5A1F] bg-white/5' : 'text-white'
                }`}
              >
                <MapPin className="w-4 h-4 text-[#FF5A1F]" />
                <span>Find a Trip</span>
              </button>
              <button
                onClick={() => handleNavClick('list-trip')}
                className={`w-full text-left py-2.5 px-3.5 rounded-xl hover:bg-white/10 text-xs sm:text-sm font-semibold flex items-center justify-between cursor-pointer ${
                  currentRoute.page === 'list-trip' ? 'text-[#FF5A1F] bg-white/5' : 'text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <PlusCircle className="w-4 h-4 text-[#FF5A1F]" />
                  <span>List a Trip</span>
                </div>
                <span className="text-[10px] bg-[#FF5A1F] text-white px-2 py-0.5 rounded-full font-bold">Host</span>
              </button>
              <button
                onClick={() => handleNavClick('plan-trip')}
                className={`w-full text-left py-2.5 px-3.5 rounded-xl hover:bg-white/10 text-xs sm:text-sm font-semibold flex items-center justify-between cursor-pointer ${
                  currentRoute.page === 'plan-trip' || currentRoute.page === 'plan-result' ? 'text-[#FF5A1F] bg-white/5' : 'text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Sparkles className="w-4 h-4 text-[#FF5A1F]" />
                  <span>Smart Trip Planner</span>
                </div>
                <span className="text-[10px] bg-orange-500/20 text-[#FF5A1F] border border-[#FF5A1F]/30 px-1.5 py-0.5 rounded font-bold">AI Plan</span>
              </button>
              <button
                onClick={() => handleNavClick('stays')}
                className={`w-full text-left py-2.5 px-3.5 rounded-xl hover:bg-white/10 text-xs sm:text-sm font-semibold flex items-center gap-3 cursor-pointer ${
                  currentRoute.page === 'stays' ? 'text-[#FF5A1F] bg-white/5' : 'text-white'
                }`}
              >
                <MapPin className="w-4 h-4 text-emerald-400" />
                <span>Find Stays</span>
              </button>
              <button
                onClick={() => handleNavClick('buddies')}
                className={`w-full text-left py-2.5 px-3.5 rounded-xl hover:bg-white/10 text-xs sm:text-sm font-semibold flex items-center gap-3 cursor-pointer ${
                  currentRoute.page === 'buddies' ? 'text-[#FF5A1F] bg-white/5' : 'text-white'
                }`}
              >
                <Users className="w-4 h-4 text-sky-400" />
                <span>Find Travel Buddies</span>
              </button>
              <button
                onClick={() => handleNavClick('messages')}
                className={`w-full text-left py-2.5 px-3.5 rounded-xl hover:bg-white/10 text-xs sm:text-sm font-semibold flex items-center justify-between cursor-pointer ${
                  currentRoute.page === 'messages' ? 'text-[#FF5A1F] bg-white/5' : 'text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-4 h-4 text-[#FF5A1F]" />
                  <span>Messages & Chat</span>
                </div>
                <span className="w-2 h-2 rounded-full bg-[#FF5A1F]"></span>
              </button>
              <button
                onClick={() => handleNavClick('saved')}
                className={`w-full text-left py-2.5 px-3.5 rounded-xl hover:bg-white/10 text-xs sm:text-sm font-semibold flex items-center gap-3 cursor-pointer ${
                  currentRoute.page === 'saved' ? 'text-[#FF5A1F] bg-white/5' : 'text-white'
                }`}
              >
                <Heart className="w-4 h-4 text-pink-400" />
                <span>Saved Trips & Wishlist</span>
              </button>
              <button
                onClick={() => handleNavClick('stories')}
                className={`w-full text-left py-2.5 px-3.5 rounded-xl hover:bg-white/10 text-xs sm:text-sm font-semibold flex items-center gap-3 cursor-pointer ${
                  currentRoute.page === 'stories' ? 'text-[#FF5A1F] bg-white/5' : 'text-white'
                }`}
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Stories & Community</span>
              </button>
              <button
                onClick={() => handleNavClick('admin')}
                className={`w-full text-left py-2.5 px-3.5 rounded-xl hover:bg-white/10 text-xs sm:text-sm font-semibold flex items-center gap-3 cursor-pointer ${
                  currentRoute.page === 'admin' ? 'text-[#FF5A1F] bg-white/5' : 'text-emerald-400'
                }`}
              >
                <Shield className="w-4 h-4 text-emerald-400" />
                <span>Admin Dashboard</span>
              </button>
              <button
                onClick={() => handleNavClick('about')}
                className={`w-full text-left py-2.5 px-3.5 rounded-xl hover:bg-white/10 text-xs sm:text-sm font-semibold flex items-center gap-3 cursor-pointer ${
                  currentRoute.page === 'about' ? 'text-[#FF5A1F] bg-white/5' : 'text-slate-300'
                }`}
              >
                <Compass className="w-4 h-4 text-slate-400" />
                <span>About ChaloBuddy</span>
              </button>
            </nav>

            {/* 3. Currency Selector & Logout Footer */}
            <div className="bg-[#0C2438]/50 border border-white/10 rounded-2xl p-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-medium">Currency:</span>
                <div className="flex gap-1">
                  {['INR', 'USD', 'EUR'].map((cur) => (
                    <button
                      key={cur}
                      onClick={() => setCurrency(cur)}
                      className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                        currency === cur
                          ? 'bg-[#FF5A1F] text-white'
                          : 'bg-white/10 text-slate-300 hover:bg-white/20'
                      }`}
                    >
                      {cur === 'INR' ? '₹ INR' : cur === 'USD' ? '$ USD' : '€ EUR'}
                    </button>
                  ))}
                </div>
              </div>

              {currentUser && (
                <button
                  onClick={() => {
                    logoutUser();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 font-semibold py-1 px-2.5 rounded-lg hover:bg-red-500/10 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              )}
            </div>

          </div>
        </div>
      )}
    </header>
  );
}
