import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Compass, Mail, Lock, User, ArrowRight } from 'lucide-react';

export default function SignupPage() {
  const { loginUser, navigate } = useStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    loginUser(email || 'new.traveler@chalobuddy.com', password);
    navigate('home');
  };

  return (
    <div className="min-h-screen bg-[#F5F7F8] pt-28 pb-20 flex items-center justify-center px-4">
      <div className="bg-[#0C2438] text-white w-full max-w-md rounded-3xl border border-white/15 shadow-2xl p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-[#FF5A1F] text-white flex items-center justify-center mx-auto shadow-lg shadow-[#FF5A1F]/30">
            <Compass className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-extrabold text-white">Join ChaloBuddy</h2>
          <p className="text-xs text-slate-300">Start discovering, listing trips, and traveling with buddies</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Full Name</label>
            <div className="relative">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Priya Patel"
                className="w-full bg-[#071A2B] border border-white/15 rounded-xl px-3 py-2.5 pl-9 text-white focus:outline-none focus:border-[#FF5A1F]"
              />
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
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
                placeholder="••••••••"
                className="w-full bg-[#071A2B] border border-white/15 rounded-xl px-3 py-2.5 pl-9 text-white focus:outline-none focus:border-[#FF5A1F]"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <button
            type="submit"
            className="w-full btn-primary-cb !py-3 !text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer mt-2"
          >
            <span>Create Free Account</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-slate-400 pt-2 border-t border-white/10">
          <p>
            Already have an account?{' '}
            <button
              onClick={() => navigate('login')}
              className="text-[#FF5A1F] font-bold hover:underline cursor-pointer"
            >
              Log in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
