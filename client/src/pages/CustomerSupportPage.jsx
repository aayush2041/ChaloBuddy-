import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { api } from '../api';
import { Headphones, Mail, Phone, Clock, MessageSquare, Send, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function CustomerSupportPage() {
  const { currentUser, settings, addToast } = useStore();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadTickets();
  }, [currentUser]);

  const loadTickets = async () => {
    try {
      const email = currentUser?.email || '';
      const res = await api.getTickets({ email });
      if (res.success) setTickets(res.tickets);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;

    setLoading(true);
    try {
      const res = await api.createTicket({
        customer_name: currentUser?.name || 'Customer',
        customer_email: currentUser?.email || '',
        customer_phone: currentUser?.phone || '',
        order_number: orderNumber.trim() || undefined,
        subject: subject.trim(),
        message: message.trim()
      });

      if (res.success) {
        addToast('Support ticket opened successfully. Our team will review it shortly.', 'success');
        setSubject('');
        setMessage('');
        setOrderNumber('');
        loadTickets();
      } else {
        addToast(res.error || 'Failed to submit ticket', 'error');
      }
    } catch {
      addToast('Error submitting support ticket', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#F8F9FC] min-h-screen py-10 text-[#111426]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header */}
        <div className="max-w-xl space-y-2">
          <span className="text-xs font-bold uppercase text-[#5B45F5] tracking-wider">
            Official Helpdesk
          </span>
          <h1 className="text-3xl font-black text-[#111426] tracking-tight">Customer Support</h1>
          <p className="text-xs sm:text-sm text-[#667085] leading-relaxed">
            Need help with manual payment verification, credentials access, or account warranty? Submit a ticket below or reach out directly.
          </p>
        </div>

        {/* Desk Info Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-3xl bg-white border border-[#E7E9F2] shadow-xs flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#EEF0FF] text-[#5B45F5] flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-[#667085] block font-medium">Operating Hours</span>
              <span className="text-xs font-extrabold text-[#111426]">09:00 AM – 11:30 PM IST</span>
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-[#E7E9F2] shadow-xs flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-[#667085] block font-medium">WhatsApp Desk</span>
              <span className="text-xs font-extrabold text-[#111426]">{settings.support_phone || '+91 98765 43210'}</span>
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-[#E7E9F2] shadow-xs flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-[#667085] block font-medium">Support Email</span>
              <span className="text-xs font-extrabold text-[#111426]">{settings.support_email || 'support@valorvault.gg'}</span>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Submit Form (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-[#E7E9F2] p-6 sm:p-8 shadow-xs space-y-6">
            <h2 className="text-xl font-black text-[#111426]">Open a Support Ticket</h2>
            <form onSubmit={handleCreateTicket} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#111426] font-bold mb-1">Related Order Number (Optional)</label>
                <input
                  type="text"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  placeholder="e.g. VV-10248"
                  className="w-full bg-[#F8F9FC] border border-[#E7E9F2] focus:border-[#5B45F5] rounded-xl px-4 py-2.5 text-[#111426] outline-none"
                />
              </div>

              <div>
                <label className="block text-[#111426] font-bold mb-1">Subject / Issue Type *</label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Question about payment reconciliation or Riot login"
                  className="w-full bg-[#F8F9FC] border border-[#E7E9F2] focus:border-[#5B45F5] rounded-xl px-4 py-2.5 text-[#111426] outline-none"
                />
              </div>

              <div>
                <label className="block text-[#111426] font-bold mb-1">Message Details *</label>
                <textarea
                  rows={5}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your inquiry in detail..."
                  className="w-full bg-[#F8F9FC] border border-[#E7E9F2] focus:border-[#5B45F5] rounded-xl p-3 text-[#111426] outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-xl bg-[#5B45F5] hover:bg-[#4B38D3] text-white font-extrabold text-xs transition shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{loading ? 'Submitting...' : 'Submit Support Request'}</span>
              </button>
            </form>
          </div>

          {/* Ticket History (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-[#E7E9F2] p-6 sm:p-8 shadow-xs space-y-4">
            <h3 className="font-black text-base text-[#111426]">Your Recent Tickets</h3>
            {tickets.length === 0 ? (
              <p className="text-xs text-[#667085] py-8 text-center">No submitted tickets found.</p>
            ) : (
              <div className="space-y-3">
                {tickets.map((t) => (
                  <div key={t.id} className="p-4 rounded-2xl bg-[#F8F9FC] border border-[#E7E9F2] space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-extrabold text-[#111426]">{t.ticket_number}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#EEF0FF] text-[#5B45F5] uppercase">
                        {t.status}
                      </span>
                    </div>
                    <p className="font-bold text-[#111426]">{t.subject}</p>
                    <p className="text-[#667085] line-clamp-2">{t.message}</p>
                    {t.admin_reply && (
                      <div className="mt-2 p-2.5 rounded-xl bg-white border border-[#E7E9F2] text-[#111426]">
                        <span className="font-bold text-[#5B45F5] block text-[10px]">Support Desk Response:</span>
                        {t.admin_reply}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
