import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { api } from '../api';
import { X, Lock, Mail, User, Phone, ArrowRight, ShieldCheck, Check } from 'lucide-react';

export default function AuthModal() {
  const {
    authModalOpen,
    setAuthModalOpen,
    authModalMode,
    setAuthModalMode,
    loginUser,
    addToast
  } = useStore();

  const [email, setEmail] = useState('player@gmail.com');
  const [password, setPassword] = useState('player123');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  if (!authModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (authModalMode === 'login') {
        const res = await api.login(email, password);
        if (res.success && res.user) {
          loginUser(res.user);
        } else {
          addToast(res.error || 'Invalid email or password', 'error');
        }
      } else {
        if (password !== confirmPassword) {
          addToast('Passwords do not match', 'error');
          setLoading(false);
          return;
        }
        const res = await api.register(name, email, phone, password);
        if (res.success && res.user) {
          loginUser(res.user);
        } else {
          addToast(res.error || 'Failed to create account', 'error');
        }
      }
    } catch {
      addToast('Authentication error. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (role) => {
    if (role === 'customer') {
      loginUser({
        id: 'usr_cust_01',
        name: 'Aayush Sharma',
        email: 'player@gmail.com',
        phone: '+91 98112 23344',
        role: 'customer',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'
      });
    } else {
      loginUser({
        id: 'usr_admin_01',
        name: 'ValorVault Admin',
        email: 'admin@valorvault.gg',
        phone: '+91 98765 43210',
        role: 'admin',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-white border border-[#E7E9F2] rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 text-[#111426]">
        {/* Close Button */}
        <button
          onClick={() => setAuthModalOpen(false)}
          className="absolute top-5 right-5 p-2 rounded-xl text-[#667085] hover:text-[#111426] hover:bg-gray-100 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand & Header */}
        <div className="space-y-2 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#EEF0FF] text-[#5B45F5] mb-1">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-[#111426] tracking-tight">
            {authModalMode === 'login' ? 'Welcome Back' : 'Create an Account'}
          </h2>
          <p className="text-xs text-[#667085] leading-relaxed max-w-xs mx-auto">
            {authModalMode === 'login'
              ? 'Sign in to access your digital vault and proceed with verified escrow purchases.'
              : 'Sign up to purchase high-tier accounts and redeem instant digital vouchers.'}
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex bg-[#F8F9FC] border border-[#E7E9F2] rounded-2xl p-1">
          <button
            type="button"
            onClick={() => setAuthModalMode('login')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
              authModalMode === 'login'
                ? 'bg-white text-[#5B45F5] shadow-xs'
                : 'text-[#667085] hover:text-[#111426]'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setAuthModalMode('signup')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
              authModalMode === 'signup'
                ? 'bg-white text-[#5B45F5] shadow-xs'
                : 'text-[#667085] hover:text-[#111426]'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {authModalMode === 'signup' && (
            <>
              <div>
                <label className="text-xs font-bold text-[#111426] mb-1 block">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#667085] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Aayush Sharma"
                    className="w-full bg-[#F8F9FC] border border-[#E7E9F2] focus:border-[#5B45F5] focus:bg-white text-xs font-bold text-[#111426] rounded-xl pl-10 pr-3 py-2.5 outline-none transition"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-[#111426] mb-1 block">Mobile Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#667085] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98112 23344"
                    className="w-full bg-[#F8F9FC] border border-[#E7E9F2] focus:border-[#5B45F5] focus:bg-white text-xs font-bold text-[#111426] rounded-xl pl-10 pr-3 py-2.5 outline-none transition"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="text-xs font-bold text-[#111426] mb-1 block">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#667085] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="player@gmail.com"
                className="w-full bg-[#F8F9FC] border border-[#E7E9F2] focus:border-[#5B45F5] focus:bg-white text-xs font-bold text-[#111426] rounded-xl pl-10 pr-3 py-2.5 outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[#111426] mb-1 block">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#667085] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#F8F9FC] border border-[#E7E9F2] focus:border-[#5B45F5] focus:bg-white text-xs font-bold text-[#111426] rounded-xl pl-10 pr-3 py-2.5 outline-none transition"
              />
            </div>
          </div>

          {authModalMode === 'signup' && (
            <div>
              <label className="text-xs font-bold text-[#111426] mb-1 block">Confirm Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#667085] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#F8F9FC] border border-[#E7E9F2] focus:border-[#5B45F5] focus:bg-white text-xs font-bold text-[#111426] rounded-xl pl-10 pr-3 py-2.5 outline-none transition"
                />
              </div>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-[#5B45F5] hover:bg-[#4B38D3] text-white font-extrabold text-xs transition shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>{loading ? 'Please wait...' : authModalMode === 'login' ? 'Sign In' : 'Create Account'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Demo Fast-Login Helper */}
        <div className="pt-2 border-t border-[#F1F3F9] text-center space-y-2">
          <p className="text-[11px] font-semibold text-[#667085]">Instant Demo Login:</p>
          <div className="flex justify-center gap-2">
            <button
              type="button"
              onClick={() => handleDemoLogin('customer')}
              className="px-3 py-1.5 rounded-lg bg-[#F8F9FC] hover:bg-[#EEF0FF] border border-[#E7E9F2] text-[11px] font-bold text-[#111426] hover:text-[#5B45F5] transition cursor-pointer"
            >
              Verified Customer
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('admin')}
              className="px-3 py-1.5 rounded-lg bg-[#F8F9FC] hover:bg-[#EEF0FF] border border-[#E7E9F2] text-[11px] font-bold text-[#111426] hover:text-[#5B45F5] transition cursor-pointer"
            >
              Master Admin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
