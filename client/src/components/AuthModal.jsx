import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import {
  X,
  Compass,
  Mail,
  Lock,
  User,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export default function AuthModal() {
  const {
    authModalOpen,
    setAuthModalOpen,
    authModalMode,
    setAuthModalMode,
    loginUser,
    switchUser,
    allUsers,
  } = useStore();

  const [email, setEmail] = useState('priya.patel@chalobuddy.com');
  const [password, setPassword] = useState('password123');
  const [name, setName] = useState('Priya Patel');

  if (!authModalOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    loginUser(email, password);
  };

  const handleGoogleLogin = () => {
    loginUser('google.traveler@chalobuddy.com', 'google_pass');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#0C2438] text-white w-full max-w-md rounded-3xl border border-white/15 shadow-2xl overflow-hidden p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#FF5A1F] flex items-center justify-center text-white">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">
                {authModalMode === 'login' ? 'Welcome Back!' : 'Join ChaloBuddy'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {authModalMode === 'login'
                  ? 'Access your trips, chat, and saved journeys'
                  : 'Start planning, hosting, and traveling together'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setAuthModalOpen(false)}
            className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Demo Persona Switcher (Convenient for Reviewers) */}
        <div className="bg-[#071A2B] p-3 rounded-2xl border border-white/10 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
              Quick 1-Click Demo Login
            </span>
            <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full">
              Demo Ready
            </span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {allUsers.slice(0, 3).map((user) => (
              <button
                key={user.id}
                type="button"
                onClick={() => {
                  switchUser(user);
                  setAuthModalOpen(false);
                }}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-center transition-all cursor-pointer group"
              >
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-7 h-7 rounded-full object-cover mx-auto ring-1 ring-[#FF5A1F] group-hover:scale-110 transition-transform"
                />
                <span className="text-[11px] font-bold text-white block mt-1 truncate">
                  {user.name.split(' ')[0]}
                </span>
                <span className="text-[9px] text-slate-400 capitalize block">
                  {user.role}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Google One-Click Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full py-2.5 px-4 rounded-full bg-white text-slate-900 font-bold text-xs flex items-center justify-center gap-2 hover:bg-slate-100 transition-colors shadow-md cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="h-px bg-white/10 flex-1" />
          <span className="text-[10px] text-slate-400 uppercase tracking-widest">Or with email</span>
          <div className="h-px bg-white/10 flex-1" />
        </div>

        {/* Email / Password Form */}
        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          {authModalMode === 'signup' && (
            <div>
              <label className="block text-slate-300 font-medium mb-1">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Priya Patel"
                  className="w-full bg-[#071A2B] border border-white/15 rounded-xl px-3 py-2 pl-9 text-white focus:outline-none focus:border-[#FF5A1F]"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-slate-300 font-medium mb-1">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-[#071A2B] border border-white/15 rounded-xl px-3 py-2 pl-9 text-white focus:outline-none focus:border-[#FF5A1F]"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Password</label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#071A2B] border border-white/15 rounded-xl px-3 py-2 pl-9 text-white focus:outline-none focus:border-[#FF5A1F]"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>
          </div>

          <button
            type="submit"
            className="w-full btn-primary-cb !py-2.5 !text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer mt-2"
          >
            <span>{authModalMode === 'login' ? 'Sign In to ChaloBuddy' : 'Create Account'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Switch Mode Toggle */}
        <div className="text-center text-xs text-slate-400 pt-2 border-t border-white/10">
          {authModalMode === 'login' ? (
            <p>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => setAuthModalMode('signup')}
                className="text-[#FF5A1F] font-bold hover:underline cursor-pointer"
              >
                Sign up free
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setAuthModalMode('login')}
                className="text-[#FF5A1F] font-bold hover:underline cursor-pointer"
              >
                Sign in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
