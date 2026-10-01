import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Compass, Mail, Lock, ArrowRight, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const { loginUser, switchUser, allUsers, navigate } = useStore();
  const [email, setEmail] = useState('priya.patel@chalobuddy.com');
  const [password, setPassword] = useState('password123');

  const handleSubmit = (e) => {
    e.preventDefault();
    loginUser(email, password);
    navigate('home');
  };

  return (
    <div className="min-h-screen bg-[#F5F7F8] pt-28 pb-20 flex items-center justify-center px-4">
      <div className="bg-[#0C2438] text-white w-full max-w-md rounded-3xl border border-white/15 shadow-2xl p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-[#FF5A1F] text-white flex items-center justify-center mx-auto shadow-lg shadow-[#FF5A1F]/30">
            <Compass className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-extrabold text-white">Welcome Back</h2>
          <p className="text-xs text-slate-300">Sign in to manage your trips and connect with buddies</p>
        </div>

        {/* Quick Demo Login */}
        <div className="bg-[#071A2B] p-3 rounded-2xl border border-white/10 space-y-2">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block text-center">
            Quick 1-Click Demo Login
          </span>
          <div className="grid grid-cols-3 gap-1.5">
            {allUsers.slice(0, 3).map((user) => (
              <button
                key={user.id}
                type="button"
                onClick={() => {
                  switchUser(user);
                  navigate('home');
                }}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-center transition-all cursor-pointer"
              >
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-7 h-7 rounded-full object-cover mx-auto ring-1 ring-[#FF5A1F]"
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

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Email</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#071A2B] border border-white/15 rounded-xl px-3 py-2.5 pl-9 text-white focus:outline-none focus:border-[#FF5A1F]"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
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
                className="w-full bg-[#071A2B] border border-white/15 rounded-xl px-3 py-2.5 pl-9 text-white focus:outline-none focus:border-[#FF5A1F]"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <button
            type="submit"
            className="w-full btn-primary-cb !py-3 !text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer mt-2"
          >
            <span>Sign In</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-slate-400 pt-2 border-t border-white/10">
          <p>
            Don't have an account?{' '}
            <button
              onClick={() => navigate('signup')}
              className="text-[#FF5A1F] font-bold hover:underline cursor-pointer"
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
