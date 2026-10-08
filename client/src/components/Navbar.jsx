import React, { useState, useEffect, useRef } from 'react';
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
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);

  // Monitor scroll for header background transition
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isHome = currentRoute.page === 'home';
  const isDarkOverlay = isHome && !isScrolled;

  const handleNavClick = (page, params = {}) => {
    navigate(page, params);
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
    setNotifDropdownOpen(false);
  };

  // Close dropdowns on outside click
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifDropdownOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isDarkOverlay
          ? 'bg-[#071A2B]/80 backdrop-blur-md text-white py-3 border-b border-white/10'
          : 'bg-[#071A2B]/95 backdrop-blur-xl text-white shadow-lg py-3 border-b border-white/15'
      }`}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12">
          {/* Left: Brand Logo & Simplified Desktop Navigation */}
          <div className="flex items-center gap-3 sm:gap-8 lg:gap-10">
            {/* Brand Logo */}
            <button
              onClick={() => handleNavClick('home')}
              className="flex items-center gap-2 sm:gap-2.5 text-left cursor-pointer group"
              aria-label="ChaloBuddy Home"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#FF5A1F] flex items-center justify-center text-white shadow-md shadow-[#FF5A1F]/30 group-hover:scale-105 transition-transform shrink-0">
                <Compass className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg sm:text-2xl font-black tracking-tight text-white leading-none whitespace-nowrap">
                  Chalo<span className="text-[#FF5A1F]">Buddy</span>
                </span>
                <span className="text-[10px] text-slate-400 font-medium tracking-wider mt-0.5 hidden sm:block">
                  Travel Together
                </span>
              </div>
            </button>

            {/* Primary Desktop Navigation: 3 Core Items */}
            <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-semibold">
              <button
                onClick={() => handleNavClick('trips')}
                className={`transition-colors py-1 relative cursor-pointer ${
                  currentRoute.page === 'trips'
                    ? 'text-[#FF5A1F]'
                    : 'text-slate-200 hover:text-white'
                }`}
              >
                <span>Find a Trip</span>
                {currentRoute.page === 'trips' && (
                  <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#FF5A1F] rounded-full" />
                )}
              </button>

              <button
                onClick={() => handleNavClick('list-trip')}
                className={`inline-flex items-center gap-1.5 transition-colors py-1 relative cursor-pointer ${
                  currentRoute.page === 'list-trip'
                    ? 'text-[#FF5A1F]'
                    : 'text-slate-200 hover:text-white'
                }`}
              >
                <span>List a Trip</span>
                <span className="text-[10px] bg-[#FF5A1F] text-white px-1.5 py-0.5 rounded-full font-bold">
                  Host
                </span>
                {currentRoute.page === 'list-trip' && (
                  <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#FF5A1F] rounded-full" />
                )}
              </button>

              <button
                onClick={() => handleNavClick('plan-trip')}
                className={`inline-flex items-center gap-1.5 transition-colors py-1 relative cursor-pointer ${
                  currentRoute.page === 'plan-trip' || currentRoute.page === 'plan-result'
                    ? 'text-[#FF5A1F]'
                    : 'text-slate-200 hover:text-white'
                }`}
              >
                <Sparkles className="w-4 h-4 text-[#FF5A1F]" />
                <span>Trip Planner</span>
                {(currentRoute.page === 'plan-trip' || currentRoute.page === 'plan-result') && (
                  <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#FF5A1F] rounded-full" />
                )}
              </button>
            </nav>
          </div>

          {/* Right: Actions & Separate Auth/Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search Spotlight Trigger */}
            <button
              data-testid="search-spotlight-btn"
              onClick={() => setSearchModalOpen(true)}
              className="p-2 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer shrink-0"
              title="Search trips and destinations"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Notification Bell Dropdown */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                className="relative p-2 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Notifications"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadNotificationCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-[#FF5A1F] text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
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
                      <p className="p-6 text-xs text-slate-400 text-center">No notifications yet</p>
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

            {/* Desktop Separate Auth / Profile Section */}
            <div className="hidden md:flex items-center" ref={profileRef}>
              {currentUser ? (
                <div className="relative">
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center gap-2.5 p-1 pl-2.5 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 transition-all cursor-pointer"
                  >
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-7 h-7 rounded-full object-cover ring-1 ring-[#FF5A1F]"
                    />
                    <span className="text-xs font-semibold text-white max-w-[100px] truncate">
                      {currentUser.name}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-300 pr-0.5" />
                  </button>

                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-[#071A2B] border border-white/15 rounded-2xl shadow-2xl py-2 z-50 text-sm">
                      {/* User Info Header */}
                      <div className="px-4 py-3 border-b border-white/10 bg-[#0C2438]/60">
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

                      {/* Workspace & Navigation Links */}
                      <div className="py-1">
                        <button
                          onClick={() => handleNavClick('my-trips')}
                          className="w-full text-left px-4 py-2 hover:bg-white/10 text-slate-200 hover:text-white flex items-center gap-2.5 cursor-pointer text-xs font-medium"
                        >
                          <Calendar className="w-4 h-4 text-[#FF5A1F]" />
                          <span>My Trips (Workspace)</span>
                        </button>
                        <button
                          onClick={() => handleNavClick('messages')}
                          className="w-full text-left px-4 py-2 hover:bg-white/10 text-slate-200 hover:text-white flex items-center gap-2.5 cursor-pointer text-xs font-medium"
                        >
                          <MessageSquare className="w-4 h-4 text-[#FF5A1F]" />
                          <span>Messages & Chat</span>
                        </button>
                        <button
                          onClick={() => handleNavClick('saved')}
                          className="w-full text-left px-4 py-2 hover:bg-white/10 text-slate-200 hover:text-white flex items-center gap-2.5 cursor-pointer text-xs font-medium"
                        >
                          <Heart className="w-4 h-4 text-[#FF5A1F]" />
                          <span>Saved Trips & Plans</span>
                        </button>
                        <button
                          onClick={() => handleNavClick('profile', { id: currentUser.id })}
                          className="w-full text-left px-4 py-2 hover:bg-white/10 text-slate-200 hover:text-white flex items-center gap-2.5 cursor-pointer text-xs font-medium"
                        >
                          <User className="w-4 h-4 text-[#FF5A1F]" />
                          <span>View Profile</span>
                        </button>
                      </div>

                      {/* Switch Persona Tester Tool */}
                      <div className="px-4 py-2.5 border-t border-white/10 bg-[#0C2438]/40">
                        <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5">
                          Switch Persona (Demo)
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

                      {/* Logout */}
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
                    className="btn-primary-cb !py-1.5 !px-3.5 !text-xs cursor-pointer font-bold"
                  >
                    Sign up
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-200 hover:text-white hover:bg-white/10 active:bg-white/15 transition-colors cursor-pointer touch-manipulation min-w-[40px] min-h-[40px] flex items-center justify-center shrink-0"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-[#FF5A1F]" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div data-testid="mobile-nav-drawer" className="md:hidden fixed inset-x-0 top-[56px] sm:top-[60px] bottom-0 bg-[#071A2B]/98 backdrop-blur-2xl z-50 flex flex-col overflow-y-auto border-t border-white/10 pb-24 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex-1 px-4 py-5 space-y-4 max-w-md mx-auto w-full">
            
            {/* User Profile or Auth CTA */}
            {currentUser ? (
              <div className="bg-[#0C2438] border border-white/15 rounded-2xl p-4 shadow-lg">
                <div className="flex items-center gap-3">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-11 h-11 rounded-full object-cover ring-2 ring-[#FF5A1F]"
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
              </div>
            ) : (
              <div className="bg-[#0C2438] border border-white/15 rounded-2xl p-4 shadow-lg text-center">
                <p className="text-sm font-bold text-white mb-1">Welcome to ChaloBuddy</p>
                <p className="text-xs text-slate-300 mb-3">Find travel buddies, discover trips, and plan journeys.</p>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    onClick={() => {
                      setAuthModalMode('login');
                      setAuthModalOpen(true);
                      setMobileMenuOpen(false);
                    }}
                    className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs cursor-pointer"
                  >
                    Log in
                  </button>
                  <button
                    onClick={() => {
                      setAuthModalMode('signup');
                      setAuthModalOpen(true);
                      setMobileMenuOpen(false);
                    }}
                    className="btn-primary-cb !py-2.5 !px-3 !text-xs font-bold cursor-pointer"
                  >
                    Sign up
                  </button>
                </div>
              </div>
            )}

            {/* Primary Mobile Navigation: 3 Obvious Actions */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1">
                Main Menu
              </span>

              <button
                onClick={() => handleNavClick('trips')}
                className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                  currentRoute.page === 'trips'
                    ? 'bg-[#FF5A1F]/15 border-[#FF5A1F] text-white'
                    : 'bg-[#0C2438] border-white/10 hover:border-white/20 text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#FF5A1F]/20 text-[#FF5A1F] flex items-center justify-center">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-sm block">Find a Trip</span>
                    <span className="text-xs text-slate-400">Discover upcoming group trips</span>
                  </div>
                </div>
                <span className="text-slate-400">→</span>
              </button>

              <button
                onClick={() => handleNavClick('list-trip')}
                className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                  currentRoute.page === 'list-trip'
                    ? 'bg-[#FF5A1F]/15 border-[#FF5A1F] text-white'
                    : 'bg-[#0C2438] border-white/10 hover:border-white/20 text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <PlusCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm">List a Trip</span>
                      <span className="text-[10px] bg-[#FF5A1F] text-white px-1.5 py-0.2 rounded-full font-bold">Host</span>
                    </div>
                    <span className="text-xs text-slate-400">Lead a journey & share costs</span>
                  </div>
                </div>
                <span className="text-slate-400">→</span>
              </button>

              <button
                onClick={() => handleNavClick('plan-trip')}
                className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                  currentRoute.page === 'plan-trip' || currentRoute.page === 'plan-result'
                    ? 'bg-[#FF5A1F]/15 border-[#FF5A1F] text-white'
                    : 'bg-[#0C2438] border-white/10 hover:border-white/20 text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-sm block">Trip Planner</span>
                    <span className="text-xs text-slate-400">Day-by-day smart itinerary</span>
                  </div>
                </div>
                <span className="text-slate-400">→</span>
              </button>
            </div>

            {/* Secondary Shortcuts */}
            <div className="bg-[#0C2438]/60 border border-white/10 rounded-2xl p-2 divide-y divide-white/5">
              <button
                onClick={() => handleNavClick('home')}
                className="w-full text-left py-2.5 px-3 rounded-xl hover:bg-white/10 text-xs font-semibold flex items-center gap-3 cursor-pointer text-slate-200"
              >
                <Compass className="w-4 h-4 text-[#FF5A1F]" />
                <span>Home</span>
              </button>
              {currentUser && (
                <>
                  <button
                    onClick={() => handleNavClick('my-trips')}
                    className="w-full text-left py-2.5 px-3 rounded-xl hover:bg-white/10 text-xs font-semibold flex items-center gap-3 cursor-pointer text-slate-200"
                  >
                    <Calendar className="w-4 h-4 text-[#FF5A1F]" />
                    <span>My Trips</span>
                  </button>
                  <button
                    onClick={() => handleNavClick('messages')}
                    className="w-full text-left py-2.5 px-3 rounded-xl hover:bg-white/10 text-xs font-semibold flex items-center gap-3 cursor-pointer text-slate-200"
                  >
                    <MessageSquare className="w-4 h-4 text-[#FF5A1F]" />
                    <span>Messages & Chat</span>
                  </button>
                  <button
                    onClick={() => handleNavClick('saved')}
                    className="w-full text-left py-2.5 px-3 rounded-xl hover:bg-white/10 text-xs font-semibold flex items-center gap-3 cursor-pointer text-slate-200"
                  >
                    <Heart className="w-4 h-4 text-pink-400" />
                    <span>Saved Trips & Plans</span>
                  </button>
                </>
              )}
              <button
                onClick={() => handleNavClick('stays')}
                className="w-full text-left py-2.5 px-3 rounded-xl hover:bg-white/10 text-xs font-semibold flex items-center gap-3 cursor-pointer text-slate-200"
              >
                <MapPin className="w-4 h-4 text-emerald-400" />
                <span>Find Stays</span>
              </button>
            </div>

            {/* Currency Selector & Tester Persona in Drawer */}
            <div className="bg-[#0C2438]/40 border border-white/10 rounded-2xl p-3 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">Currency:</span>
                <div className="flex gap-1.5">
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
                <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">Demo user:</span>
                  <div className="flex gap-1">
                    {allUsers.slice(0, 3).map((u) => (
                      <button
                        key={u.id}
                        onClick={() => switchUser(u)}
                        className={`px-2 py-0.5 rounded text-[11px] font-medium cursor-pointer ${
                          currentUser.id === u.id
                            ? 'bg-[#FF5A1F] text-white font-bold'
                            : 'bg-white/10 text-slate-300'
                        }`}
                      >
                        {u.name.split(' ')[0]}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {currentUser && (
                <div className="pt-2 border-t border-white/10 text-right">
                  <button
                    onClick={() => {
                      logoutUser();
                      setMobileMenuOpen(false);
                    }}
                    className="inline-flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 font-semibold py-1 px-2.5 rounded-lg hover:bg-red-500/10 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Log out</span>
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </header>
  );
}
