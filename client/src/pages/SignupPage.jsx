import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { api } from '../api';
import { Lock, Mail, User, Phone, ShieldCheck, ArrowRight } from 'lucide-react';

export default function SignupPage() {
  const { loginUser, navigate, addToast } = useStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      addToast('Passwords do not match', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await api.register(name, email, phone, password);
      if (res.success && res.user) {
        loginUser(res.user);
        navigate('account');
      } else {
        addToast(res.error || 'Failed to create account', 'error');
      }
    } catch {
      addToast('Error during account creation. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#F8F9FC] min-h-[85vh] flex items-center justify-center px-4 py-16 text-[#111426]">
      <div className="w-full max-w-md bg-white border border-[#E7E9F2] rounded-3xl p-8 space-y-6 shadow-sm">
        {/* Brand Emblem & Heading */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#EEF0FF] text-[#5B45F5] mb-2 shadow-2xs">
            <User className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-[#111426] tracking-tight">Create Account</h1>
          <p className="text-xs text-[#667085] leading-relaxed max-w-xs mx-auto">
            Your email is used for order verification and authenticated digital vault delivery.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-[#111426] mb-1 font-bold">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-[#667085] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Aayush Sharma"
                className="w-full bg-[#F8F9FC] border border-[#E7E9F2] focus:border-[#5B45F5] focus:bg-white text-xs font-semibold text-[#111426] rounded-xl pl-10 pr-4 py-2.5 outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#111426] mb-1 font-bold">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#667085] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="player@gmail.com"
                className="w-full bg-[#F8F9FC] border border-[#E7E9F2] focus:border-[#5B45F5] focus:bg-white text-xs font-semibold text-[#111426] rounded-xl pl-10 pr-4 py-2.5 outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#111426] mb-1 font-bold">Mobile / WhatsApp Number</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-[#667085] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98112 23344"
                className="w-full bg-[#F8F9FC] border border-[#E7E9F2] focus:border-[#5B45F5] focus:bg-white text-xs font-semibold text-[#111426] rounded-xl pl-10 pr-4 py-2.5 outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#111426] mb-1 font-bold">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#667085] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#F8F9FC] border border-[#E7E9F2] focus:border-[#5B45F5] focus:bg-white text-xs font-semibold text-[#111426] rounded-xl pl-10 pr-4 py-2.5 outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#111426] mb-1 font-bold">Confirm Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#667085] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#F8F9FC] border border-[#E7E9F2] focus:border-[#5B45F5] focus:bg-white text-xs font-semibold text-[#111426] rounded-xl pl-10 pr-4 py-2.5 outline-none transition"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-[#5B45F5] hover:bg-[#4B38D3] text-white font-extrabold text-xs transition shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>{loading ? 'Creating...' : 'Register Account'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        <div className="pt-2 border-t border-[#F1F3F9] text-center text-xs text-[#667085]">
          <span>Already have an account? </span>
          <button
            onClick={() => navigate('login')}
            className="text-[#5B45F5] font-extrabold hover:underline"
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
}
