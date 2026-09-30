import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { api } from '../api';
import { Lock, Mail, ArrowRight, ShieldCheck, User } from 'lucide-react';

export default function LoginPage() {
  const { loginUser, navigate, addToast } = useStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.login(email, password);
      if (res.success && res.user) {
        loginUser(res.user);
        if (res.user.role === 'admin') {
          navigate('admin');
        } else {
          navigate('account');
        }
      } else {
        addToast(res.error || 'Invalid email or password', 'error');
      }
    } catch {
      addToast('Failed to sign in. Please verify your details.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#F8F9FC] min-h-[80vh] flex items-center justify-center px-4 py-16 text-[#111426]">
      <div className="w-full max-w-md bg-white border border-[#E7E9F2] rounded-3xl p-8 space-y-6 shadow-sm">
        {/* Brand Emblem & Heading */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#EEF0FF] text-[#5B45F5] mb-2 shadow-2xs">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-[#111426] tracking-tight">Welcome Back</h1>
          <p className="text-xs text-[#667085] leading-relaxed max-w-xs mx-auto">
            Login to your ValorVault account to manage orders and access your digital vault.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-[#111426] mb-1.5 font-bold">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#667085] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@domain.com"
                className="w-full bg-[#F8F9FC] border border-[#E7E9F2] focus:border-[#5B45F5] focus:bg-white text-xs font-semibold text-[#111426] rounded-xl pl-10 pr-4 py-3 outline-none transition"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-[#111426] font-bold">Password</label>
              <button
                type="button"
                onClick={() => addToast('Please use demo password: player123 or admin123', 'info')}
                className="text-[11px] text-[#5B45F5] hover:underline font-semibold"
              >
                Forgot?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#667085] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#F8F9FC] border border-[#E7E9F2] focus:border-[#5B45F5] focus:bg-white text-xs font-semibold text-[#111426] rounded-xl pl-10 pr-4 py-3 outline-none transition"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-[#5B45F5] hover:bg-[#4B38D3] text-white font-extrabold text-xs transition shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        <div className="pt-2 border-t border-[#F1F3F9] text-center text-xs text-[#667085]">
          <span>Don't have an account? </span>
          <button
            onClick={() => navigate('signup')}
            className="text-[#5B45F5] font-extrabold hover:underline"
          >
            Create an Account
          </button>
        </div>
      </div>
    </div>
  );
}
