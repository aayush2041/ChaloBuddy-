import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Mail, Phone, MessageSquare, Headphones, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';
import { api } from '../api';

export default function ContactPage() {
  const { currentUser, showToast } = useStore();
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: '',
    comment: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.comment) {
      showToast?.('Please fill out all required fields', 'error');
      return;
    }

    setLoading(true);
    try {
      await api.createTicket({
        title: `Contact Inquiry from ${formData.name}`,
        message: `${formData.comment}\n\nPhone: ${formData.phone || 'N/A'}`,
        user_email: formData.email,
        priority: 'medium'
      });
      setSubmitted(true);
    } catch (err) {
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-white text-[#09090B] min-h-screen py-12 lg:py-20">
      <div className="max-w-[1240px] mx-auto px-6">
        
        {/* Header */}
        <div className="border-b border-[#E4E4E7] pb-6 mb-10 max-w-4xl">
          <span className="text-xs uppercase tracking-widest text-[#7C4DFF] font-bold">
            Customer Support & Escrow Assistance
          </span>
          <h1 className="font-heading font-extrabold text-3xl sm:text-5xl uppercase tracking-tight text-[#09090B] mt-2">
            Contact Us
          </h1>
          <p className="text-sm font-semibold text-[#52525B] mt-2">
            Have questions about accounts, verification, or payments? We respond within minutes.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 max-w-4xl">
          
          {/* Left Form */}
          <div className="lg:col-span-7">
            {submitted ? (
              <div className="p-8 border border-[#E4E4E7] rounded-2xl bg-white text-center space-y-4 shadow-xs">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="font-heading font-bold text-xl uppercase text-[#09090B]">Message Received</h3>
                <p className="text-sm text-[#52525B]">
                  Thank you for reaching out. A ValorVault escrow agent will respond to <strong>{formData.email}</strong> within 15 minutes.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({ name: '', email: '', phone: '', comment: '' });
                  }}
                  className="px-6 py-2.5 bg-[#7C4DFF] hover:bg-[#6D3DF5] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition cursor-pointer shadow-xs"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5 bg-white border border-[#E4E4E7] rounded-2xl p-6 sm:p-8 shadow-xs">
                <div>
                  <label className="block text-xs uppercase font-bold tracking-wider mb-2 text-[#09090B]">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Your Name"
                    className="w-full px-4 py-3 border border-[#E4E4E7] focus:border-[#7C4DFF] rounded-xl text-sm outline-none font-sans bg-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase font-bold tracking-wider mb-2 text-[#09090B]">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="you@email.com"
                      className="w-full px-4 py-3 border border-[#E4E4E7] focus:border-[#7C4DFF] rounded-xl text-sm outline-none font-sans bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase font-bold tracking-wider mb-2 text-[#09090B]">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 XXXXX XXXXX"
                      className="w-full px-4 py-3 border border-[#E4E4E7] focus:border-[#7C4DFF] rounded-xl text-sm outline-none font-sans bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase font-bold tracking-wider mb-2 text-[#09090B]">
                    Comment / Details <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={formData.comment}
                    onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                    placeholder="Include your Order ID or question about accounts/payments..."
                    className="w-full px-4 py-3 border border-[#E4E4E7] focus:border-[#7C4DFF] rounded-xl text-sm outline-none font-sans resize-y bg-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-[#7C4DFF] hover:bg-[#6D3DF5] text-white font-bold text-xs uppercase tracking-widest rounded-xl transition cursor-pointer flex items-center justify-center gap-2 shadow-xs hover:-translate-y-[1px]"
                >
                  <span>{loading ? 'Sending...' : 'Send Message'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>

          {/* Right Direct Contact Info */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 bg-white border border-[#E4E4E7] rounded-2xl space-y-4 shadow-xs">
              <h3 className="font-heading font-bold text-base uppercase text-[#09090B]">
                Direct Contacts
              </h3>
              
              <div className="space-y-3 text-xs">
                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-[#7C4DFF] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[#09090B] block">Email Support</span>
                    <a href="mailto:support@valorvault.gg" className="text-[#52525B] hover:text-[#7C4DFF] transition-colors">
                      support@valorvault.gg
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-[#7C4DFF] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[#09090B] block">WhatsApp Escrow Desk</span>
                    <span className="text-[#52525B]">+91 98765 43210</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Headphones className="w-4 h-4 text-[#7C4DFF] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[#09090B] block">Live Hours</span>
                    <span className="text-[#52525B]">09:00 AM – 11:30 PM IST (7 Days/Week)</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5 border border-emerald-200/80 bg-emerald-50/50 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs uppercase">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Escrow Guarantee</span>
              </div>
              <p className="text-xs text-emerald-900/80 leading-relaxed font-sans">
                Every transaction on ValorVault is backed by our customer protection fund. If credentials fail verification within warranty, you are eligible for immediate replacement or full refund.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
