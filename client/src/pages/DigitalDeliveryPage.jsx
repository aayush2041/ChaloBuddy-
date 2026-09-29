import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { api } from '../api';
import confetti from 'canvas-confetti';
import {
  Key,
  Copy,
  Check,
  Eye,
  EyeOff,
  Download,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export default function DigitalDeliveryPage() {
  const { currentRoute, navigate, currentUser, requireAuth, showToast } = useStore();
  const orderRef = currentRoute.params?.id || 'VV-10248';

  const [order, setOrder] = useState(null);
  const [delivery, setDelivery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [revealedPasswords, setRevealedPasswords] = useState({});
  const [copiedKey, setCopiedKey] = useState(null);
  const [acknowledged, setAcknowledged] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      requireAuth({ page: 'delivery', params: { id: orderRef } });
      return;
    }

    async function loadDelivery() {
      try {
        setLoading(true);
        const res = await api.getOrderByIdOrNumber(orderRef);
        if (res.success && res.order) {
          setOrder(res.order);
          if (res.order.delivery) {
            setDelivery(res.order.delivery);
          } else {
            const delRes = await api.getOrderDelivery(res.order.id);
            if (delRes.success && delRes.delivery) {
              setDelivery(delRes.delivery);
            }
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadDelivery();
  }, [orderRef, currentUser]);

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    showToast?.('Copied to clipboard!', 'info');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDownloadTxt = () => {
    if (!delivery?.data) return;
    const data = delivery.data;
    const content = `VALORVAULT DIGITAL DELIVERY CREDENTIALS
========================================
Order ID: ${order?.order_number}
Timestamp: ${new Date().toISOString()}

CREDENTIALS:
${data.username ? `Username: ${data.username}\n` : ''}${data.password ? `Password: ${data.password}\n` : ''}${data.code ? `Code/Voucher: ${data.code}\n` : ''}${data.pin ? `PIN: ${data.pin}\n` : ''}${data.email ? `Linked Email: ${data.email}\n` : ''}

INSTRUCTIONS:
${data.instructions || 'Login to official client and update password and recovery email.'}

========================================
ValorVault 48h Inspection Guarantee Active.
Official Desk: support@valorvault.in
`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ValorVault-${order?.order_number || 'delivery'}-credentials.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showToast?.('Credentials file downloaded securely', 'info');
  };

  const handleConfirmAccess = async () => {
    try {
      if (order?.id) {
        await api.acknowledgeDelivery(order.id);
      }
      setAcknowledged(true);
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
      showToast?.('Order marked as Completed! Thank you for choosing ValorVault.', 'success');
    } catch {
      showToast?.('Error acknowledging delivery', 'error');
    }
  };

  if (loading) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-neutral-500 text-xs font-semibold">Opening Digital Vault...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-4">
        <h2 className="text-2xl font-heading font-black uppercase text-black">Vault Locked</h2>
        <p className="text-xs text-neutral-600">Unable to find active vault delivery for this order.</p>
        <button
          onClick={() => navigate('account')}
          className="px-6 py-3 bg-black text-white font-bold text-xs uppercase tracking-wider"
          style={{ borderRadius: '0px' }}
        >
          Go to My Account
        </button>
      </div>
    );
  }

  const deliveryData = delivery?.data || {};

  return (
    <div className="bg-white min-h-screen py-10 lg:py-16 text-black">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Vault Header Banner */}
        <div className="border border-black p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Digital Goods Dispatched</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-heading font-black uppercase tracking-tight text-black">
              Authenticated Digital Vault
            </h1>
            <p className="text-xs text-neutral-600">
              Order <span className="font-bold text-black">{order.order_number}</span> • Protected by ValorVault Escrow
            </p>
          </div>

          <div className="flex gap-2.5">
            <button
              onClick={handleDownloadTxt}
              className="px-5 py-3 border border-black hover:bg-neutral-100 text-xs font-bold uppercase tracking-wider text-black flex items-center gap-1.5 transition cursor-pointer"
              style={{ borderRadius: '0px' }}
            >
              <Download className="w-4 h-4 text-black" />
              <span>Download .txt</span>
            </button>
          </div>
        </div>

        {/* Credentials Unlocked Card */}
        <div className="border border-black p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
            <div className="flex items-center gap-2">
              <Key className="w-5 h-5 text-black" />
              <div>
                <h2 className="font-heading font-bold text-base uppercase text-black">
                  Digital Asset Credentials
                </h2>
                <p className="text-xs text-neutral-500">
                  Click the copy button or toggle eye icon to reveal passwords
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border border-emerald-300 text-emerald-700 bg-emerald-50">
              Verified
            </span>
          </div>

          {/* Credential Fields */}
          <div className="space-y-4">
            {deliveryData.username && (
              <div className="p-4 bg-neutral-50 border border-neutral-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">
                    Account Login / Username
                  </span>
                  <span className="font-bold text-sm text-black font-mono select-all">
                    {deliveryData.username}
                  </span>
                </div>
                <button
                  onClick={() => copyToClipboard(deliveryData.username, 'user')}
                  className="px-3 py-1.5 border border-black text-xs font-bold uppercase hover:bg-black hover:text-white transition flex items-center gap-1 cursor-pointer"
                  style={{ borderRadius: '0px' }}
                >
                  {copiedKey === 'user' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'user' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            )}

            {deliveryData.password && (
              <div className="p-4 bg-neutral-50 border border-neutral-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">
                    Password / Master Key
                  </span>
                  <span className="font-bold text-sm text-black font-mono select-all">
                    {revealedPasswords['pwd'] ? deliveryData.password : '••••••••••••••••'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setRevealedPasswords(prev => ({ ...prev, pwd: !prev.pwd }))}
                    className="p-1.5 border border-neutral-300 text-neutral-600 hover:text-black hover:border-black cursor-pointer"
                    title="Toggle Visibility"
                  >
                    {revealedPasswords['pwd'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => copyToClipboard(deliveryData.password, 'pwd')}
                    className="px-3 py-1.5 border border-black text-xs font-bold uppercase hover:bg-black hover:text-white transition flex items-center gap-1 cursor-pointer"
                    style={{ borderRadius: '0px' }}
                  >
                    {copiedKey === 'pwd' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'pwd' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            )}

            {deliveryData.code && (
              <div className="p-4 bg-neutral-50 border border-neutral-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">
                    Digital Voucher / Activation Code
                  </span>
                  <span className="font-bold text-base text-black font-mono select-all">
                    {deliveryData.code}
                  </span>
                </div>
                <button
                  onClick={() => copyToClipboard(deliveryData.code, 'code')}
                  className="px-3 py-1.5 border border-black text-xs font-bold uppercase hover:bg-black hover:text-white transition flex items-center gap-1 cursor-pointer"
                  style={{ borderRadius: '0px' }}
                >
                  {copiedKey === 'code' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'code' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            )}

            {deliveryData.email && (
              <div className="p-4 bg-neutral-50 border border-neutral-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">
                    Linked First Email Access
                  </span>
                  <span className="font-bold text-sm text-black font-mono select-all">
                    {deliveryData.email}
                  </span>
                </div>
                <button
                  onClick={() => copyToClipboard(deliveryData.email, 'email')}
                  className="px-3 py-1.5 border border-black text-xs font-bold uppercase hover:bg-black hover:text-white transition flex items-center gap-1 cursor-pointer"
                  style={{ borderRadius: '0px' }}
                >
                  {copiedKey === 'email' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'email' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            )}

            {deliveryData.instructions && (
              <div className="p-4 bg-neutral-100 border border-neutral-300 text-xs space-y-1">
                <span className="font-bold uppercase tracking-wider block text-black">
                  Seller Instructions:
                </span>
                <p className="text-neutral-700 font-sans leading-relaxed">
                  {deliveryData.instructions}
                </p>
              </div>
            )}
          </div>

          {/* Acknowledgement / Delivery Confirm Action */}
          <div className="pt-4 border-t border-neutral-200">
            {acknowledged || order.status === 'COMPLETED' ? (
              <div className="p-4 bg-emerald-50 border border-emerald-300 text-center space-y-1">
                <p className="font-bold text-xs uppercase text-emerald-900">
                  ✓ Delivery Confirmed & Complete
                </p>
                <p className="text-[11px] text-emerald-700">
                  Your 48-hour warranty period is active. Contact support in case of any access discrepancies.
                </p>
              </div>
            ) : (
              <button
                onClick={handleConfirmAccess}
                className="w-full py-4 bg-black hover:bg-neutral-800 text-white font-bold text-xs uppercase tracking-widest transition cursor-pointer"
                style={{ borderRadius: '0px' }}
              >
                I Confirm I Have Tested & Secured My Account
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
