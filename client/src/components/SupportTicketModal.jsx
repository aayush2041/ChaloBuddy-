import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { api } from '../api';
import { Headphones, X, Send, AlertCircle, CheckCircle2, Paperclip } from 'lucide-react';

export default function SupportTicketModal() {
  const { supportModalData, setSupportModalData, currentUser, addToast } = useStore();

  const [orderId, setOrderId] = useState(supportModalData?.orderId || '');
  const [issueType, setIssueType] = useState('payment_verification');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!supportModalData?.isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      addToast('Please provide a subject and detailed message', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await api.createTicket({
        user_id: currentUser?.id,
        customer_name: currentUser?.name || 'Customer',
        customer_email: currentUser?.email || '',
        order_id: orderId.trim() || null,
        issue_type: issueType,
        subject: subject.trim(),
        message: message.trim(),
        attachment_url: attachmentUrl.trim() || null
      });

      if (res.success) {
        addToast(`Ticket #${res.ticketNumber} created successfully! Our team will reply shortly.`, 'success');
        setSupportModalData(null);
      } else {
        addToast(res.error || 'Failed to submit ticket', 'error');
      }
    } catch (err) {
      addToast('Error submitting support ticket', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={() => setSupportModalData(null)}
        className="absolute inset-0 bg-black/40 backdrop-blur-xs"
      />

      <div className="relative bg-white border border-[#E7E9F2] rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-150 text-[#111426]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#F1F3F9]">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#EEF0FF] text-[#5B45F5] flex items-center justify-center">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-[#111426] tracking-tight">
                Create Support Ticket
              </h3>
              <p className="text-[11px] text-[#667085]">Our support desk is active 09:00 - 23:30 IST</p>
            </div>
          </div>
          <button
            onClick={() => setSupportModalData(null)}
            className="text-gray-400 hover:text-gray-700 p-1.5 rounded-xl hover:bg-gray-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-4 text-xs">
          <div>
            <label className="block text-[#111426] font-bold mb-1">Issue Category *</label>
            <select
              value={issueType}
              onChange={(e) => setIssueType(e.target.value)}
              className="w-full bg-[#F8F9FC] border border-[#E7E9F2] text-[#111426] rounded-xl px-3 py-2.5 text-xs focus:border-[#5B45F5] outline-none cursor-pointer"
            >
              <option value="payment_verification">Payment Verification Delay</option>
              <option value="payment_problem">Payment Problem / Bank Transfer Issue</option>
              <option value="product_issue">Product Issue / Wrong Specifications</option>
              <option value="delivery_issue">Delivery Issue / Vault Access</option>
              <option value="account_issue">Account Login / Password Assistance</option>
              <option value="refund_request">Refund Request</option>
              <option value="other">Other Inquiry</option>
            </select>
          </div>

          <div>
            <label className="block text-[#111426] font-bold mb-1">Related Order ID (Optional)</label>
            <input
              type="text"
              placeholder="e.g. ord_xxx or VV-10248"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              className="w-full bg-[#F8F9FC] border border-[#E7E9F2] text-[#111426] rounded-xl px-3 py-2.5 text-xs focus:border-[#5B45F5] outline-none"
            />
          </div>

          <div>
            <label className="block text-[#111426] font-bold mb-1">Subject *</label>
            <input
              type="text"
              placeholder="Brief summary of your inquiry"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
              className="w-full bg-[#F8F9FC] border border-[#E7E9F2] text-[#111426] rounded-xl px-3 py-2.5 text-xs focus:border-[#5B45F5] outline-none"
            />
          </div>

          <div>
            <label className="block text-[#111426] font-bold mb-1">Detailed Message *</label>
            <textarea
              rows={4}
              placeholder="Please describe your query with any relevant transaction numbers or error details..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              className="w-full bg-[#F8F9FC] border border-[#E7E9F2] text-[#111426] rounded-xl p-3 text-xs focus:border-[#5B45F5] outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-[#111426] font-bold mb-1">Attachment Link (Optional)</label>
            <div className="relative">
              <input
                type="text"
                placeholder="https://... or image receipt link"
                value={attachmentUrl}
                onChange={(e) => setAttachmentUrl(e.target.value)}
                className="w-full bg-[#F8F9FC] border border-[#E7E9F2] text-[#111426] rounded-xl px-3 py-2.5 pl-8 text-xs focus:border-[#5B45F5] outline-none"
              />
              <Paperclip className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-3" />
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setSupportModalData(null)}
              className="px-4 py-2.5 rounded-xl border border-[#E7E9F2] text-[#667085] font-bold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-[#5B45F5] hover:bg-[#4B38D3] text-white font-bold flex items-center gap-2 transition shadow-xs cursor-pointer disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Submitting...' : 'Submit Ticket'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
