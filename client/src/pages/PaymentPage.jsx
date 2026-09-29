import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { api } from '../api';
import { QRCodeSVG } from 'qrcode.react';
import {
  Copy,
  Check,
  Upload,
  Building,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Download
} from 'lucide-react';

export default function PaymentPage() {
  const { currentRoute, navigate, settings, showToast } = useStore();
  const orderId = currentRoute.params?.orderId;
  const orderNumber = currentRoute.params?.orderNumber;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // Tabs: 'UPI' or 'BANK_TRANSFER'
  const [selectedMethod, setSelectedMethod] = useState('UPI');

  // Submit payment form state
  const [utrNumber, setUtrNumber] = useState('');
  const [screenshotFile, setScreenshotFile] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);

  useEffect(() => {
    async function loadOrder() {
      try {
        setLoading(true);
        const ref = orderId || orderNumber || 'VV-10248';
        const res = await api.getOrderByIdOrNumber(ref);
        if (res.success && res.order) {
          setOrder(res.order);
        } else {
          const fallback = await api.getOrderByIdOrNumber('VV-10248');
          if (fallback.success && fallback.order) {
            setOrder(fallback.order);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadOrder();
  }, [orderId, orderNumber]);

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
    showToast?.('Copied to clipboard!', 'info');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setScreenshotFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDownloadQr = () => {
    const svg = document.getElementById('payment-qr-svg');
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `ValorVault-QR-${order?.order_number || 'Payment'}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  const handleSubmitProof = async (e) => {
    e.preventDefault();

    if (!order) return;

    if (!utrNumber || utrNumber.trim().length < 8) {
      showToast?.('Please enter a valid 12-digit UTR or Reference Number', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append('method', selectedMethod);
      formData.append('utr', utrNumber.trim());
      formData.append('amount', order.total_amount);
      if (screenshotFile) {
        formData.append('screenshot', screenshotFile);
      }

      const res = await api.submitPayment(order.id, formData);
      if (res.success) {
        showToast?.('Payment proof submitted successfully!', 'success');
        navigate('orders', { id: order.order_number });
      } else {
        showToast?.(res.error || 'Failed to submit payment proof', 'error');
      }
    } catch {
      showToast?.('Network error submitting payment proof', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-xl mx-auto px-6 py-24 text-center">
        <div className="w-8 h-8 border-2 border-[#7C4DFF] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs font-semibold text-[#71717A]">Loading payment gateway...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-xl mx-auto px-6 py-24 text-center space-y-4">
        <h2 className="text-2xl font-heading font-extrabold uppercase text-[#09090B]">Order Not Found</h2>
        <p className="text-xs text-[#52525B]">Unable to find active order details.</p>
        <button
          onClick={() => navigate('home')}
          className="px-6 py-3 bg-[#7C4DFF] hover:bg-[#6D3DF5] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer"
        >
          Return Home
        </button>
      </div>
    );
  }

  const upiId = settings.upi_id || 'valorvault@upi';
  const merchantName = settings.upi_merchant_name || 'VALORVAULT DIGITAL ENTERPRISES';
  const upiString = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(merchantName)}&am=${order.total_amount}&cu=INR&tn=Order%20${order.order_number}`;

  return (
    <div className="bg-white min-h-screen py-10 lg:py-16 text-[#09090B]">
      {/* Global container max-w-[1240px] px-6 */}
      <div className="max-w-[1240px] mx-auto px-6 space-y-8">
        
        {/* Step Indicator */}
        <div className="border-b border-[#E4E4E7] pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#7C4DFF] font-bold">
              Step 3 of 3 • Escrow Settlement
            </span>
            <h1 className="font-heading font-extrabold text-3xl uppercase tracking-tight text-[#09090B] mt-1">
              Payment Verification
            </h1>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs uppercase font-bold tracking-wider text-[#71717A] block">
              Order {order.order_number} Total
            </span>
            <span className="font-heading font-extrabold text-3xl text-[#09090B]">
              ₹{Number(order.total_amount).toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Payment Methods and Instructions Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: Dynamic UPI QR & Bank Settlement (6 cols) */}
          <div className="lg:col-span-6 bg-white border border-[#E4E4E7] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
            
            {/* Method Tabs */}
            <div className="flex p-1 bg-[#F4F4F5] rounded-xl gap-1">
              <button
                onClick={() => setSelectedMethod('UPI')}
                className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  selectedMethod === 'UPI'
                    ? 'bg-white text-[#09090B] shadow-xs'
                    : 'text-[#71717A] hover:text-[#09090B]'
                }`}
              >
                <QrCode className="w-4 h-4 text-[#7C4DFF]" />
                <span>UPI / QR Code</span>
              </button>
              <button
                onClick={() => setSelectedMethod('BANK_TRANSFER')}
                className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  selectedMethod === 'BANK_TRANSFER'
                    ? 'bg-white text-[#09090B] shadow-xs'
                    : 'text-[#71717A] hover:text-[#09090B]'
                }`}
              >
                <Building className="w-4 h-4 text-[#7C4DFF]" />
                <span>Bank Transfer</span>
              </button>
            </div>

            {selectedMethod === 'UPI' ? (
              <div className="space-y-5 text-center">
                {/* QR Code Container */}
                <div className="inline-block p-4 bg-white border border-[#E4E4E7] rounded-2xl shadow-xs">
                  <QRCodeSVG
                    id="payment-qr-svg"
                    value={upiString}
                    size={200}
                    level="H"
                    includeMargin={true}
                  />
                  <p className="text-[11px] font-bold text-[#71717A] mt-2 uppercase tracking-wide">
                    Scan with GPay, PhonePe, Paytm, or BHIM
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row justify-center gap-2.5">
                  <a
                    href={upiString}
                    className="sm:hidden w-full py-2.5 px-4 bg-[#7C4DFF] hover:bg-[#6D3DF5] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-2 shadow-xs"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>Pay via UPI App (GPay / PhonePe)</span>
                  </a>
                  <button
                    onClick={handleDownloadQr}
                    className="w-full sm:w-auto px-4 py-2 border border-[#E4E4E7] hover:border-[#09090B] rounded-xl text-xs font-bold uppercase tracking-wider text-[#09090B] hover:bg-neutral-50 flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-[#7C4DFF]" />
                    <span>Download QR</span>
                  </button>
                </div>

                {/* UPI ID Copy Field */}
                <div className="p-3.5 bg-white border border-[#E4E4E7] rounded-xl text-left space-y-1 shadow-xs">
                  <span className="text-[10px] font-bold text-[#71717A] uppercase tracking-wider">
                    Official Merchant UPI ID
                  </span>
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm text-[#09090B] font-mono select-all">
                      {upiId}
                    </span>
                    <button
                      onClick={() => copyToClipboard(upiId, 'upi')}
                      className="px-3 py-1 bg-white border border-[#E4E4E7] hover:border-[#09090B] rounded-lg text-xs font-bold uppercase hover:bg-neutral-50 transition flex items-center gap-1 cursor-pointer text-[#09090B]"
                    >
                      {copiedKey === 'upi' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-[#7C4DFF]" />}
                      <span>{copiedKey === 'upi' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <span className="text-[10px] text-[#71717A] block">
                    Payee: {merchantName}
                  </span>
                </div>
              </div>
            ) : (
              /* Bank Transfer Details */
              <div className="space-y-4 text-xs font-sans">
                <div className="p-4 bg-white border border-[#E4E4E7] rounded-xl space-y-3 shadow-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-[#71717A] font-semibold">Bank Name:</span>
                    <span className="font-bold text-[#09090B]">{settings.bank_name || 'State Bank of India'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#71717A] font-semibold">Account Holder:</span>
                    <span className="font-bold text-[#09090B]">{settings.bank_account_holder || 'ValorVault Digital'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#71717A] font-semibold">Account Number:</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-sm text-[#09090B] font-mono">{settings.bank_account_number || '3982019482910'}</span>
                      <button
                        onClick={() => copyToClipboard(settings.bank_account_number || '3982019482910', 'acc')}
                        className="text-[#7C4DFF] hover:underline font-bold"
                      >
                        {copiedKey === 'acc' ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#71717A] font-semibold">IFSC Code:</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-sm text-[#09090B] font-mono">{settings.bank_ifsc || 'SBIN0004821'}</span>
                      <button
                        onClick={() => copyToClipboard(settings.bank_ifsc || 'SBIN0004821', 'ifsc')}
                        className="text-[#7C4DFF] hover:underline font-bold"
                      >
                        {copiedKey === 'ifsc' ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="p-4 bg-[#F1ECFF]/50 border border-[#7C4DFF]/20 rounded-xl text-[11px] text-[#09090B] space-y-1">
              <p className="font-bold uppercase tracking-wider flex items-center gap-1.5 text-[#7C4DFF]">
                <Clock className="w-3.5 h-3.5" />
                <span>Verification SLA</span>
              </p>
              <p className="text-[#52525B] leading-relaxed font-sans">
                Payments are verified within 5-15 mins during 09:00 AM - 11:30 PM IST. Credentials unlock immediately upon confirmation.
              </p>
            </div>
          </div>

          {/* RIGHT: Proof Submission Form (6 cols) */}
          <div className="lg:col-span-6 bg-white border border-[#E4E4E7] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
            <div>
              <h2 className="font-heading font-extrabold text-xl uppercase tracking-tight text-[#09090B]">
                Submit Payment Confirmation
              </h2>
              <p className="text-xs text-[#52525B] mt-1">
                Enter your transaction reference (UTR) from your banking app
              </p>
            </div>

            <form onSubmit={handleSubmitProof} className="space-y-4">
              {/* UTR Input */}
              <div>
                <label className="text-xs uppercase font-bold tracking-wider text-[#09090B] mb-1.5 block">
                  12-Digit UTR / Transaction Reference ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={utrNumber}
                  onChange={(e) => setUtrNumber(e.target.value.replace(/\s+/g, ''))}
                  placeholder="e.g. 429182390192"
                  className="w-full bg-white border border-[#E4E4E7] focus:border-[#7C4DFF] rounded-xl text-sm font-bold text-[#09090B] px-4 py-3 outline-none font-mono"
                />
                <p className="text-[11px] text-[#71717A] mt-1">
                  Found on the confirmation screen of your GPay, PhonePe, Paytm, or Net Banking receipt.
                </p>
              </div>

              {/* Screenshot Upload Dropzone */}
              <div>
                <label className="text-xs uppercase font-bold tracking-wider text-[#09090B] mb-1.5 block">
                  Upload Payment Screenshot <span className="text-[#71717A] font-normal">(Recommended)</span>
                </label>
                <div className="border border-dashed border-[#E4E4E7] hover:border-[#7C4DFF] rounded-xl p-4 text-center cursor-pointer transition relative bg-[#FAFAFA] hover:bg-[#F1ECFF]/30">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  {screenshotPreview ? (
                    <div className="space-y-2">
                      <img
                        src={screenshotPreview}
                        alt="Screenshot Preview"
                        className="max-h-40 mx-auto object-contain rounded-lg border border-[#E4E4E7]"
                      />
                      <p className="text-[11px] font-bold text-emerald-700">
                        Screenshot attached! Click or drag to replace
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2 py-3">
                      <Upload className="w-5 h-5 mx-auto text-[#7C4DFF]" />
                      <p className="text-xs font-bold text-[#09090B] uppercase">
                        Click to upload or drag receipt here
                      </p>
                      <p className="text-[11px] text-[#71717A]">
                        Supports PNG, JPG, or WebP up to 5MB
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit CTA Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-[#7C4DFF] hover:bg-[#6D3DF5] text-white font-bold text-xs uppercase tracking-widest rounded-xl transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-xs hover:-translate-y-[1px]"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isSubmitting ? 'Submitting Proof...' : 'Submit Payment Proof'}</span>
                </button>
              </div>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => navigate('orders', { id: order.order_number })}
                  className="text-xs font-bold uppercase tracking-wider text-[#7C4DFF] hover:underline transition cursor-pointer"
                >
                  View Order Tracking Status →
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
