import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { api } from '../api';
import {
  ShieldAlert,
  ShieldCheck,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Receipt,
  Package,
  Layers,
  Settings,
  Headphones,
  Tag,
  DollarSign,
  TrendingUp,
  Search,
  Eye,
  Check,
  X,
  ExternalLink,
  Plus,
  Trash2,
  RotateCcw,
  FileText,
  Key,
  MessageSquare,
  Lock,
  Mail,
  ArrowRight,
  LogOut
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { currentUser, loginUser, logoutUser, addToast, settings, loadSettings, checkAdminQueue, navigate } = useStore();

  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const [activeTab, setActiveTab] = useState('queue'); // 'overview', 'queue', 'orders', 'products', 'coupons', 'tickets', 'settings', 'audit'
  const [stats, setStats] = useState(null);
  const [verificationQueue, setVerificationQueue] = useState([]);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Screenshot Zoom Modal
  const [zoomedScreenshot, setZoomedScreenshot] = useState(null);

  // Reject Reason Modal
  const [rejectingOrder, setRejectingOrder] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('UTR could not be verified in the bank statement.');

  // Manual Delivery Modal
  const [deliveringOrder, setDeliveringOrder] = useState(null);
  const [manualDeliveryText, setManualDeliveryText] = useState('');

  // Ticket Reply Modal
  const [replyingTicket, setReplyingTicket] = useState(null);
  const [ticketReplyText, setTicketReplyText] = useState('');

  // New Product Modal
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    category_id: 'cat_val',
    price: '',
    original_price: '',
    stock: 1,
    delivery_type: 'account',
    short_desc: '',
    description: '',
    images: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800',
    specs: '{"Rank": "Immortal 1", "Region": "AP / Mumbai"}',
    initial_vault_item: ''
  });

  // Settings State Form
  const [settingsForm, setSettingsForm] = useState({ ...settings });
  const [savingSettings, setSavingSettings] = useState(false);

  // New Coupon Form
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    discount_type: 'percentage',
    discount_value: 10,
    min_order_value: 500,
    max_uses: 100
  });

  // Order filters
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');

  const handleAdminAuth = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');
    try {
      const res = await api.login(adminEmail, adminPassword);
      if (res.success && res.user) {
        if (res.user.role === 'admin') {
          loginUser(res.user);
          addToast('Authenticated as Administrator', 'success');
        } else {
          setAuthError('Access Denied: This account does not have administrator privileges.');
          addToast('Access Denied: Administrator role required', 'error');
        }
      } else {
        setAuthError(res.error || 'Invalid administrator email or password.');
      }
    } catch {
      setAuthError('Unable to connect to authentication server. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?.role === 'admin') {
      loadAllAdminData();
    }
  }, [activeTab, currentUser]);

  const loadAllAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, queueRes, ordersRes, prodsRes, catsRes, coupsRes, ticksRes, logsRes] =
        await Promise.all([
          api.getAdminStats(),
          api.getVerificationQueue(),
          api.getAllOrders(),
          api.getProducts(),
          api.getCategories(),
          api.getCoupons(),
          api.getAllTickets(),
          api.getAuditLogs()
        ]);

      if (statsRes?.success) setStats(statsRes.stats);
      if (queueRes?.success) setVerificationQueue(queueRes.queue || []);
      if (ordersRes?.success) setOrders(ordersRes.orders || []);
      if (prodsRes?.success) setProducts(prodsRes.products || []);
      if (catsRes?.success) setCategories(catsRes.categories || []);
      if (coupsRes?.success) setCoupons(coupsRes.coupons || []);
      if (ticksRes?.success) setTickets(ticksRes.tickets || []);
      if (logsRes?.success) setAuditLogs(logsRes.logs || []);
      checkAdminQueue?.();
    } catch (err) {
      console.error(err);
      addToast('Error fetching administrative data', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Payment Verification Confirm
  const handleConfirmPayment = async (orderId) => {
    try {
      const res = await api.verifyPayment(
        orderId,
        'CONFIRM',
        'Verified in official merchant bank ledger.',
        'ValorVault Admin'
      );
      if (res.success) {
        addToast('Payment CONFIRMED! Digital asset bound & dispatched to vault.', 'success');
        loadAllAdminData();
      } else {
        addToast(res.error || 'Failed to verify payment', 'error');
      }
    } catch {
      addToast('Error during payment confirmation', 'error');
    }
  };

  // Payment Verification Reject
  const handleRejectPayment = async (e) => {
    e.preventDefault();
    if (!rejectingOrder) return;
    try {
      const res = await api.verifyPayment(
        rejectingOrder.order_id,
        'REJECT',
        rejectionReason,
        'ValorVault Admin'
      );
      if (res.success) {
        addToast('Payment marked as REJECTED. Customer notified to resubmit.', 'info');
        setRejectingOrder(null);
        loadAllAdminData();
      } else {
        addToast(res.error || 'Failed to reject payment', 'error');
      }
    } catch {
      addToast('Error during payment rejection', 'error');
    }
  };

  // Request Info
  const handleRequestInfo = async (orderId) => {
    try {
      const res = await api.verifyPayment(
        orderId,
        'REQUEST_INFO',
        'Bank inquiry flagged. Verification team reconciling transaction with branch.',
        'ValorVault Admin'
      );
      if (res.success) {
        addToast('Order marked as PAYMENT_UNDER_REVIEW', 'info');
        loadAllAdminData();
      }
    } catch {
      addToast('Error updating status', 'error');
    }
  };

  // Manual Delivery
  const handleDispatchManualDelivery = async (e) => {
    e.preventDefault();
    if (!deliveringOrder || !manualDeliveryText.trim()) return;

    try {
      const payload = {
        credentials: manualDeliveryText.trim(),
        instructions: 'Please test credentials within 24 hours and confirm access.'
      };
      const res = await api.adminDeliverOrder(
        deliveringOrder.id,
        payload,
        'Manual admin fulfillment',
        'ValorVault Admin'
      );
      if (res.success) {
        addToast('Digital credentials dispatched to customer!', 'success');
        setDeliveringOrder(null);
        setManualDeliveryText('');
        loadAllAdminData();
      }
    } catch {
      addToast('Error dispatching delivery', 'error');
    }
  };

  // Support Reply
  const handleReplyTicket = async (e) => {
    e.preventDefault();
    if (!replyingTicket || !ticketReplyText.trim()) return;
    try {
      const res = await api.replyTicket(replyingTicket.id, ticketReplyText.trim(), 'RESOLVED', 'ValorVault Admin');
      if (res.success) {
        addToast('Reply sent and ticket resolved!', 'success');
        setReplyingTicket(null);
        setTicketReplyText('');
        loadAllAdminData();
      }
    } catch {
      addToast('Error sending ticket reply', 'error');
    }
  };

  // Settings Save
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      setSavingSettings(true);
      const res = await api.updateSettings(settingsForm, 'ValorVault Master Admin');
      if (res.success) {
        addToast('Payment and system settings updated!', 'success');
        loadSettings();
      }
    } catch {
      addToast('Error saving settings', 'error');
    } finally {
      setSavingSettings(false);
    }
  };

  // Create Product
  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      let parsedSpecs = {};
      try { parsedSpecs = JSON.parse(newProduct.specs); } catch { parsedSpecs = { Details: newProduct.specs }; }

      const res = await api.createProduct({
        ...newProduct,
        images: [newProduct.images],
        specs: parsedSpecs,
        whats_included: ['Full Account Credentials', 'First Recovery Receipt', 'Warranty Certificate']
      });

      if (res.success) {
        addToast('New product created successfully!', 'success');
        setShowAddProductModal(false);
        loadAllAdminData();
      }
    } catch {
      addToast('Error creating product', 'error');
    }
  };

  // Create Coupon
  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    try {
      const res = await api.createCoupon(newCoupon);
      if (res.success) {
        addToast('New coupon created!', 'success');
        setShowCouponModal(false);
        loadAllAdminData();
      }
    } catch {
      addToast('Error creating coupon', 'error');
    }
  };

  // Filtered orders list
  const filteredOrders = orders.filter((o) => {
    const matchSearch =
      !orderSearch ||
      o.order_number?.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customer_name?.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customer_email?.toLowerCase().includes(orderSearch.toLowerCase());
    const matchStatus = orderStatusFilter === 'all' || o.status === orderStatusFilter;
    return matchSearch && matchStatus;
  });

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="bg-[#09090B] min-h-[90vh] flex items-center justify-center px-4 py-16 text-white selection:bg-[#7C4DFF] selection:text-white font-sans">
        <div className="w-full max-w-md bg-[#121216] border border-[#27272A] rounded-3xl p-8 space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#7C4DFF]/10 rounded-full blur-3xl pointer-events-none" />

          {/* Header */}
          <div className="text-center space-y-2 relative z-10">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#7C4DFF]/15 text-[#7C4DFF] border border-[#7C4DFF]/30 mb-2 shadow-lg">
              <Lock className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-black uppercase tracking-tight text-white font-heading">
              Admin Access Only
            </h1>
            <p className="text-xs text-[#A1A1AA] leading-relaxed max-w-xs mx-auto">
              This area is restricted to ValorVault administrators. Please enter your authorized credentials to proceed.
            </p>
          </div>

          {/* Error Banner */}
          {authError && (
            <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-800/80 text-red-200 text-xs flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleAdminAuth} className="space-y-4 text-xs relative z-10">
            <div>
              <label className="block text-[#D4D4D8] mb-1.5 font-bold uppercase tracking-wider text-[11px]">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#71717A] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="admin@valorvault.gg"
                  className="w-full pl-10 pr-3.5 py-3 rounded-xl bg-[#18181B] border border-[#27272A] focus:border-[#7C4DFF] text-white outline-none transition placeholder-[#52525B]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[#D4D4D8] mb-1.5 font-bold uppercase tracking-wider text-[11px]">
                Master Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#71717A] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="password"
                  required
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-3.5 py-3 rounded-xl bg-[#18181B] border border-[#27272A] focus:border-[#7C4DFF] text-white outline-none transition placeholder-[#52525B]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-3.5 px-4 rounded-xl bg-[#7C4DFF] hover:bg-[#6D3DF5] text-white font-extrabold text-xs transition shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
            >
              <span>{authLoading ? 'Verifying Credentials...' : 'Authenticate & Unlock Vault'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center pt-2 border-t border-[#27272A] relative z-10">
            <button
              type="button"
              onClick={() => navigate('home')}
              className="text-xs text-[#71717A] hover:text-white transition cursor-pointer font-medium"
            >
              ← Return to Public Storefront
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F8F9FC] min-h-screen py-8 text-[#111426]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Top Header */}
        <div className="bg-white rounded-3xl border border-[#E7E9F2] p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#5B45F5] uppercase tracking-wider">
                VALORVAULT MASTER ADMIN CONSOLE
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#111426] tracking-tight mt-1">
              Command Center
            </h1>
            <p className="text-xs text-[#667085] mt-0.5">
              Payment Verification, Manual Escrow Fulfillment, Inventory Vault & Compliance Desk
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => loadAllAdminData()}
              className="px-4 py-2.5 rounded-xl bg-[#F8F9FC] hover:bg-gray-100 text-[#111426] text-xs font-bold border border-[#E7E9F2] transition shadow-2xs cursor-pointer"
            >
              Refresh Data
            </button>
            <button
              onClick={() => navigate('home')}
              className="px-4 py-2.5 rounded-xl bg-[#5B45F5] hover:bg-[#4B38D3] text-white text-xs font-bold transition shadow-xs cursor-pointer"
            >
              View Storefront
            </button>
            <button
              onClick={() => {
                logoutUser();
                navigate('home');
              }}
              className="px-4 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold border border-red-200 transition cursor-pointer flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Admin Navigation Tabs */}
        <div className="flex bg-white rounded-2xl border border-[#E7E9F2] p-1.5 overflow-x-auto gap-1 text-xs font-bold shadow-2xs">
          {[
            { id: 'queue', label: `Payment Queue (${verificationQueue.length})`, icon: ShieldCheck, alert: verificationQueue.length > 0 },
            { id: 'overview', label: 'Metrics Overview', icon: TrendingUp },
            { id: 'orders', label: 'All Orders', icon: Receipt },
            { id: 'products', label: 'Products & Vault', icon: Package },
            { id: 'coupons', label: 'Coupons', icon: Tag },
            { id: 'tickets', label: 'Support Desk', icon: Headphones },
            { id: 'settings', label: 'Payment Settings', icon: Settings },
            { id: 'audit', label: 'Audit Trail', icon: FileText }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-3.5 rounded-xl transition flex items-center gap-2 shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-[#EEF0FF] text-[#5B45F5]'
                    : 'text-[#667085] hover:text-[#111426] hover:bg-[#F8F9FC]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.alert && (
                  <span className="w-2 h-2 rounded-full bg-[#FF4655] animate-ping" />
                )}
              </button>
            );
          })}
        </div>

        {/* 1. PAYMENT VERIFICATION QUEUE */}
        {activeTab === 'queue' && (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-extrabold text-[#111426]">Manual Bank Verification Protocol:</span> Review the submitted UTR and transaction screenshot below. Confirm the funds reflect in the official Bank Statement or UPI Merchant App before clicking "Confirm Payment". Digital goods are immediately dispatched upon confirmation.
              </div>
            </div>

            {verificationQueue.length === 0 ? (
              <div className="p-16 text-center rounded-3xl bg-white border border-[#E7E9F2] shadow-xs space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-black text-[#111426]">Verification Queue is Clear</h3>
                <p className="text-xs text-[#667085]">All submitted UPI and Bank transfer orders have been verified.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {verificationQueue.map((item) => (
                  <div
                    key={item.payment_id || item.order_id}
                    className="p-6 rounded-3xl bg-white border-2 border-amber-300 space-y-4 shadow-sm"
                  >
                    {/* Card Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#F1F3F9] text-xs">
                      <div className="flex items-center space-x-3">
                        <span className="font-extrabold text-sm text-[#111426]">
                          {item.order_number}
                        </span>
                        <span className="text-[#667085]">&bull;</span>
                        <span className="text-[#111426] font-semibold">{item.customer_name}</span>
                        <span className="text-[#667085] font-mono text-[11px]">({item.customer_phone})</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-100 text-[#111426]">
                          Method: {item.method}
                        </span>
                        <span className="text-[10px] font-black px-2.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                          AWAITING VERIFICATION
                        </span>
                      </div>
                    </div>

                    {/* Body: Order Info + Submitted Screenshot */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-xs">
                      {/* Left: Financial Details (7 cols) */}
                      <div className="lg:col-span-7 space-y-3">
                        <div className="p-4 rounded-2xl bg-[#F8F9FC] border border-[#E7E9F2] space-y-1">
                          <span className="text-[10px] text-[#667085] font-bold uppercase">Product Item:</span>
                          <div className="text-sm font-extrabold text-[#111426]">{item.item_name || 'Digital Gaming Package'}</div>
                          <div className="text-[11px] text-[#5B45F5] font-semibold capitalize">Delivery: {item.delivery_type}</div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3.5 rounded-2xl bg-[#F8F9FC] border border-[#E7E9F2]">
                            <span className="text-[#667085] block text-[11px] font-medium">Expected Amount</span>
                            <span className="font-black text-xl text-[#5B45F5]">
                              ₹{item.total_amount?.toLocaleString('en-IN')}
                            </span>
                          </div>

                          <div className="p-3.5 rounded-2xl bg-[#EEF0FF] border border-[#5B45F5]/30">
                            <span className="text-[#5B45F5] block text-[11px] font-bold">Submitted UTR / Ref ID</span>
                            <span className="font-mono font-black text-base text-[#111426] select-all">
                              {item.utr}
                            </span>
                          </div>
                        </div>

                        <div className="text-[11px] text-[#667085] pt-1">
                          Submitted at: <span className="font-mono font-semibold text-[#111426]">{item.payment_submitted_at}</span>
                        </div>
                      </div>

                      {/* Right: Payment Screenshot Thumbnail (5 cols) */}
                      <div className="lg:col-span-5 space-y-2">
                        <span className="text-[#667085] font-bold block text-[11px]">
                          Payment Screenshot / Receipt:
                        </span>
                        <div
                          onClick={() => setZoomedScreenshot(item.screenshot_url)}
                          className="relative rounded-2xl overflow-hidden border border-[#E7E9F2] h-36 bg-gray-100 cursor-pointer group hover:border-[#5B45F5] transition"
                        >
                          <img
                            src={item.screenshot_url}
                            alt="Screenshot"
                            className="w-full h-full object-cover group-hover:scale-105 transition"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition gap-1.5 text-white font-bold text-xs">
                            <Eye className="w-4 h-4" />
                            <span>Click to Inspect Fullscreen</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions Footer */}
                    <div className="pt-3 border-t border-[#F1F3F9] flex flex-wrap items-center justify-between gap-3">
                      <span className="text-[11px] text-[#667085]">
                        Has this UTR matched the merchant bank ledger?
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleRequestInfo(item.order_id)}
                          className="px-3.5 py-2 rounded-xl bg-[#F8F9FC] hover:bg-gray-100 border border-[#E7E9F2] text-[#111426] text-xs font-bold transition cursor-pointer"
                        >
                          Request Info
                        </button>

                        <button
                          onClick={() => setRejectingOrder(item)}
                          className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                          <span>Reject Payment</span>
                        </button>

                        <button
                          onClick={() => handleConfirmPayment(item.order_id)}
                          className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-sm transition active:scale-95 cursor-pointer"
                        >
                          <Check className="w-4 h-4" />
                          <span>Confirm Payment & Dispatch</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 2. OVERVIEW METRICS */}
        {activeTab === 'overview' && stats && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-3xl bg-white border border-[#E7E9F2] shadow-xs space-y-1">
                <span className="text-[#667085] text-xs font-bold uppercase tracking-wider">Today's Revenue</span>
                <div className="text-2xl font-black text-emerald-600">
                  ₹{stats.todayRevenue.toLocaleString('en-IN')}
                </div>
                <div className="text-[10px] text-[#667085]">Bank verified sales today</div>
              </div>

              <div className="p-5 rounded-3xl bg-white border border-[#E7E9F2] shadow-xs space-y-1">
                <span className="text-[#667085] text-xs font-bold uppercase tracking-wider">Total Revenue</span>
                <div className="text-2xl font-black text-[#111426]">
                  ₹{stats.totalRevenue.toLocaleString('en-IN')}
                </div>
                <div className="text-[10px] text-[#667085]">Across {stats.totalOrders} total orders</div>
              </div>

              <div className="p-5 rounded-3xl bg-white border border-amber-300 shadow-xs space-y-1">
                <span className="text-amber-700 text-xs font-bold uppercase tracking-wider">Pending Payments</span>
                <div className="text-2xl font-black text-amber-600">
                  {stats.pendingPayments}
                </div>
                <div className="text-[10px] text-[#667085]">Awaiting UTR match</div>
              </div>

              <div className="p-5 rounded-3xl bg-white border border-blue-200 shadow-xs space-y-1">
                <span className="text-blue-700 text-xs font-bold uppercase tracking-wider">Pending Deliveries</span>
                <div className="text-2xl font-black text-[#5B45F5]">
                  {stats.pendingDeliveries}
                </div>
                <div className="text-[10px] text-[#667085]">Processing order queue</div>
              </div>
            </div>

            {/* Orders Stream */}
            <div className="p-6 rounded-3xl bg-white border border-[#E7E9F2] shadow-xs space-y-4">
              <h3 className="text-base font-black text-[#111426]">Recent Orders Stream</h3>
              <div className="space-y-2 text-xs">
                {orders.slice(0, 6).map((o) => (
                  <div key={o.id} className="p-3.5 rounded-2xl bg-[#F8F9FC] border border-[#E7E9F2] flex justify-between items-center">
                    <div>
                      <span className="font-extrabold text-[#111426]">{o.order_number}</span>
                      <span className="text-[#667085] ml-2">&bull; {o.customer_name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-extrabold text-[#111426]">₹{o.total_amount?.toLocaleString('en-IN')}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white border border-[#E7E9F2] text-[#111426]">
                        {o.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 3. ALL ORDERS MANAGEMENT */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative w-full sm:w-64">
                  <input
                    type="text"
                    placeholder="Search order #, customer..."
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    className="w-full bg-white border border-[#E7E9F2] text-[#111426] rounded-xl px-3 py-2 pl-8 text-xs focus:border-[#5B45F5] outline-none"
                  />
                  <Search className="w-3.5 h-3.5 text-[#667085] absolute left-2.5 top-2.5" />
                </div>

                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="bg-white border border-[#E7E9F2] text-[#111426] rounded-xl px-3 py-2 text-xs focus:border-[#5B45F5] outline-none cursor-pointer"
                >
                  <option value="all">All Statuses</option>
                  <option value="PENDING_PAYMENT">Pending Payment</option>
                  <option value="PAYMENT_SUBMITTED">Payment Submitted</option>
                  <option value="DELIVERED">Delivered</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="PAYMENT_REJECTED">Payment Rejected</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto rounded-3xl border border-[#E7E9F2] bg-white shadow-xs">
              <table className="w-full text-left text-xs text-[#111426]">
                <thead className="bg-[#F8F9FC] text-[#667085] uppercase font-bold text-[10px] border-b border-[#E7E9F2]">
                  <tr>
                    <th className="p-4">Order #</th>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Method</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Date</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F3F9]">
                  {filteredOrders.map((o) => (
                    <tr key={o.id} className="hover:bg-[#F8F9FC] transition">
                      <td className="p-4 font-bold text-[#111426]">{o.order_number}</td>
                      <td className="p-4">
                        <div className="font-bold text-[#111426]">{o.customer_name}</div>
                        <div className="text-[10px] text-[#667085]">{o.customer_email}</div>
                      </td>
                      <td className="p-4 font-extrabold text-[#111426]">₹{o.total_amount?.toLocaleString('en-IN')}</td>
                      <td className="p-4 font-medium">{o.payment_method}</td>
                      <td className="p-4">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-100 text-[#111426]">
                          {o.status}
                        </span>
                      </td>
                      <td className="p-4 text-[#667085]">{o.created_at ? new Date(o.created_at).toLocaleDateString() : 'Recent'}</td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => navigate('tracking', { orderId: o.id, orderNumber: o.order_number })}
                          className="text-[#5B45F5] hover:underline text-[11px] font-bold"
                        >
                          Inspect
                        </button>
                        {o.status === 'PROCESSING' && (
                          <button
                            onClick={() => setDeliveringOrder(o)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200 text-[10px] font-bold"
                          >
                            Manual Deliver
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 4. PRODUCTS & INVENTORY VAULT */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-[#E7E9F2] pb-3">
              <div>
                <h3 className="text-lg font-black text-[#111426]">Products & Vault Stock</h3>
                <p className="text-xs text-[#667085]">Manage catalog listings and digital inventory allocation</p>
              </div>
              <button
                onClick={() => setShowAddProductModal(true)}
                className="px-4 py-2 rounded-xl bg-[#5B45F5] hover:bg-[#4B38D3] text-white font-bold text-xs flex items-center gap-1.5 transition shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Product</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((p) => {
                let images = [];
                try {
                  images = typeof p.images === 'string' ? JSON.parse(p.images) : p.images || [];
                } catch {
                  images = [];
                }
                const img = images[0] || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800';

                return (
                  <div key={p.id} className="p-5 rounded-3xl bg-white border border-[#E7E9F2] shadow-xs space-y-3 text-xs">
                    <img
                      src={img}
                      alt={p.name}
                      className="w-full h-36 object-cover rounded-2xl border border-[#E7E9F2]"
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#EEF0FF] text-[#5B45F5] uppercase">
                        {p.category_name}
                      </span>
                      <span className="text-emerald-600 font-bold">
                        Stock: {p.stock}
                      </span>
                    </div>
                    <h4 className="text-base font-extrabold text-[#111426] truncate" title={p.name}>
                      {p.name}
                    </h4>
                    <div className="flex items-center justify-between pt-2 border-t border-[#F1F3F9]">
                      <span className="font-black text-[#111426] text-base">₹{p.price?.toLocaleString('en-IN')}</span>
                      <span className="text-[11px] text-[#5B45F5] font-semibold capitalize">{p.delivery_type} Delivery</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 5. COUPONS TAB */}
        {activeTab === 'coupons' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-[#E7E9F2] pb-3">
              <div>
                <h3 className="text-lg font-black text-[#111426]">Discount Coupons</h3>
                <p className="text-xs text-[#667085]">Manage promotional voucher codes</p>
              </div>
              <button
                onClick={() => setShowCouponModal(true)}
                className="px-4 py-2 rounded-xl bg-[#5B45F5] hover:bg-[#4B38D3] text-white font-bold text-xs flex items-center gap-1.5 transition shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create Coupon</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {coupons.map((c) => (
                <div key={c.id} className="p-5 rounded-2xl bg-white border border-[#E7E9F2] shadow-xs space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-base font-black text-[#5B45F5]">{c.code}</span>
                    <span className="text-emerald-600 font-bold text-[10px]">
                      {c.uses_count} / {c.max_uses} used
                    </span>
                  </div>
                  <div className="text-[#111426] font-semibold">
                    Discount: {c.discount_type === 'percentage' ? `${c.discount_value}%` : `₹${c.discount_value} Flat`}
                  </div>
                  <div className="text-[#667085] text-[11px]">
                    Min Order: ₹{c.min_order_value} &bull; Expiry: {c.expiry_date}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. SUPPORT TICKETS */}
        {activeTab === 'tickets' && (
          <div className="space-y-6">
            <div className="border-b border-[#E7E9F2] pb-3">
              <h3 className="text-lg font-black text-[#111426]">Customer Support Inquiries</h3>
              <p className="text-xs text-[#667085]">Review tickets and respond to customer queries</p>
            </div>

            <div className="space-y-3">
              {tickets.map((t) => (
                <div key={t.id} className="p-5 rounded-3xl bg-white border border-[#E7E9F2] shadow-xs space-y-3 text-xs">
                  <div className="flex items-center justify-between border-b border-[#F1F3F9] pb-2">
                    <span className="font-extrabold text-[#5B45F5]">{t.ticket_number} &bull; {t.customer_name}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-100 text-[#111426]">
                      {t.status}
                    </span>
                  </div>
                  <h4 className="font-bold text-[#111426] text-sm">{t.subject}</h4>
                  <p className="text-[#667085] leading-relaxed">{t.message}</p>
                  {t.admin_reply && (
                    <div className="p-3 rounded-xl bg-[#EEF0FF] text-[#111426]">
                      <strong className="text-[#5B45F5]">Admin Reply:</strong> {t.admin_reply}
                    </div>
                  )}
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => { setReplyingTicket(t); setTicketReplyText(t.admin_reply || ''); }}
                      className="px-3.5 py-1.5 rounded-xl bg-[#EEF0FF] hover:bg-[#5B45F5] text-[#5B45F5] hover:text-white font-bold text-xs transition cursor-pointer"
                    >
                      Reply to Ticket
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 7. SETTINGS CONFIGURATION */}
        {activeTab === 'settings' && (
          <div className="max-w-3xl space-y-6">
            <div className="border-b border-[#E7E9F2] pb-3">
              <h3 className="text-lg font-black text-[#111426]">
                Payment Gateway & Settlement Settings
              </h3>
              <p className="text-xs text-[#667085]">
                Configure the official UPI VPA and Bank account that displays on customer checkout pages.
              </p>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
              <div className="p-6 rounded-3xl bg-white border border-[#E7E9F2] shadow-xs space-y-4">
                <h4 className="font-extrabold text-[#111426] text-sm">Official UPI Gateway Details</h4>
                <div>
                  <label className="block text-[#667085] font-bold mb-1">UPI ID (VPA) *</label>
                  <input
                    type="text"
                    value={settingsForm.upi_id || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, upi_id: e.target.value })}
                    className="w-full bg-[#F8F9FC] border border-[#E7E9F2] text-[#111426] rounded-xl p-3 font-mono text-xs focus:border-[#5B45F5] outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[#667085] font-bold mb-1">Merchant / Registered Payee Name *</label>
                  <input
                    type="text"
                    value={settingsForm.upi_merchant_name || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, upi_merchant_name: e.target.value })}
                    className="w-full bg-[#F8F9FC] border border-[#E7E9F2] text-[#111426] rounded-xl p-3 text-xs focus:border-[#5B45F5] outline-none"
                    required
                  />
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-white border border-[#E7E9F2] shadow-xs space-y-4">
                <h4 className="font-extrabold text-[#111426] text-sm">Bank Account Settlement Details</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#667085] font-bold mb-1">Bank Name</label>
                    <input
                      type="text"
                      value={settingsForm.bank_name || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, bank_name: e.target.value })}
                      className="w-full bg-[#F8F9FC] border border-[#E7E9F2] text-[#111426] rounded-xl p-3 text-xs focus:border-[#5B45F5] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[#667085] font-bold mb-1">Account Holder Name</label>
                    <input
                      type="text"
                      value={settingsForm.bank_account_holder || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, bank_account_holder: e.target.value })}
                      className="w-full bg-[#F8F9FC] border border-[#E7E9F2] text-[#111426] rounded-xl p-3 text-xs focus:border-[#5B45F5] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[#667085] font-bold mb-1">Account Number</label>
                    <input
                      type="text"
                      value={settingsForm.bank_account_number || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, bank_account_number: e.target.value })}
                      className="w-full bg-[#F8F9FC] border border-[#E7E9F2] text-[#111426] rounded-xl p-3 font-mono text-xs focus:border-[#5B45F5] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[#667085] font-bold mb-1">IFSC Code</label>
                    <input
                      type="text"
                      value={settingsForm.bank_ifsc || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, bank_ifsc: e.target.value })}
                      className="w-full bg-[#F8F9FC] border border-[#E7E9F2] text-[#111426] rounded-xl p-3 font-mono text-xs focus:border-[#5B45F5] outline-none"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={savingSettings}
                className="px-6 py-3 rounded-xl bg-[#5B45F5] hover:bg-[#4B38D3] text-white font-extrabold text-xs transition shadow-md cursor-pointer disabled:opacity-50"
              >
                {savingSettings ? 'Saving Settings...' : 'Save Payment Configurations'}
              </button>
            </form>
          </div>
        )}

        {/* 8. AUDIT TRAIL LOGS */}
        {activeTab === 'audit' && (
          <div className="space-y-6">
            <div className="border-b border-[#E7E9F2] pb-3">
              <h3 className="text-lg font-black text-[#111426]">Security Audit Logs</h3>
              <p className="text-xs text-[#667085]">Complete immutable ledger of all administrative and payment actions</p>
            </div>

            <div className="overflow-x-auto rounded-3xl border border-[#E7E9F2] bg-white shadow-xs">
              <table className="w-full text-left text-xs text-[#111426]">
                <thead className="bg-[#F8F9FC] text-[#667085] uppercase font-bold text-[10px] border-b border-[#E7E9F2]">
                  <tr>
                    <th className="p-4">Timestamp</th>
                    <th className="p-4">Actor</th>
                    <th className="p-4">Type</th>
                    <th className="p-4">Action</th>
                    <th className="p-4">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F3F9]">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-[#F8F9FC] transition text-[11px]">
                      <td className="p-4 text-[#667085] whitespace-nowrap">{log.created_at}</td>
                      <td className="p-4 text-[#111426] font-bold">{log.actor_name} ({log.actor_role})</td>
                      <td className="p-4 text-[#5B45F5]">{log.entity_type}</td>
                      <td className="p-4 font-black">{log.action}</td>
                      <td className="p-4 text-[#667085] max-w-md truncate">{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ZOOMED SCREENSHOT MODAL */}
        {zoomedScreenshot && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              onClick={() => setZoomedScreenshot(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            />
            <div className="relative max-w-4xl max-h-[90vh] z-10 space-y-3 bg-white p-4 rounded-3xl shadow-2xl border border-[#E7E9F2]">
              <div className="flex justify-between items-center text-[#111426] pb-2 border-b border-[#E7E9F2]">
                <span className="font-extrabold text-xs uppercase">UTR & Receipt Fullscreen Inspector</span>
                <button
                  onClick={() => setZoomedScreenshot(null)}
                  className="p-1 rounded-lg hover:bg-gray-100 text-gray-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <img
                src={zoomedScreenshot}
                alt="Zoomed proof"
                className="max-h-[75vh] w-auto mx-auto object-contain rounded-xl"
              />
            </div>
          </div>
        )}

        {/* REJECT PAYMENT MODAL */}
        {rejectingOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              onClick={() => setRejectingOrder(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-xs"
            />
            <div className="relative bg-white border border-[#E7E9F2] rounded-3xl max-w-md w-full p-6 shadow-2xl z-10 space-y-4">
              <h3 className="text-lg font-black text-[#111426]">Reject Payment Verification</h3>
              <p className="text-xs text-[#667085]">
                Provide an explanation to the customer so they can submit the corrected UTR or receipt.
              </p>
              <form onSubmit={handleRejectPayment} className="space-y-3 text-xs">
                <div>
                  <label className="block text-[#667085] font-bold mb-1">Predefined Reason</label>
                  <select
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full bg-[#F8F9FC] border border-[#E7E9F2] text-[#111426] rounded-xl p-2.5 text-xs focus:border-[#5B45F5] outline-none"
                  >
                    <option value="UTR not found in merchant bank account statement.">UTR not found in bank statement.</option>
                    <option value="Amount paid does not match order total amount.">Amount paid mismatch.</option>
                    <option value="Screenshot is blurred or illegible. Please re-upload clear proof.">Screenshot illegible / cropped.</option>
                    <option value="Duplicate UTR number already claimed by another order.">Duplicate UTR reference.</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#667085] font-bold mb-1">Specific Admin Note</label>
                  <textarea
                    rows={3}
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full bg-[#F8F9FC] border border-[#E7E9F2] text-[#111426] rounded-xl p-2.5 text-xs focus:border-[#5B45F5] outline-none resize-none"
                    required
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setRejectingOrder(null)}
                    className="px-4 py-2 rounded-xl border border-[#E7E9F2] text-[#667085] font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold"
                  >
                    Confirm Rejection
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* TICKET REPLY MODAL */}
        {replyingTicket && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              onClick={() => setReplyingTicket(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-xs"
            />
            <div className="relative bg-white border border-[#E7E9F2] rounded-3xl max-w-md w-full p-6 shadow-2xl z-10 space-y-4">
              <h3 className="text-lg font-black text-[#111426]">Reply to Customer Ticket</h3>
              <p className="text-xs text-[#667085]">
                Customer: {replyingTicket.customer_name} &bull; {replyingTicket.subject}
              </p>
              <form onSubmit={handleReplyTicket} className="space-y-3 text-xs">
                <textarea
                  rows={4}
                  value={ticketReplyText}
                  onChange={(e) => setTicketReplyText(e.target.value)}
                  placeholder="Write your official response..."
                  className="w-full bg-[#F8F9FC] border border-[#E7E9F2] text-[#111426] rounded-xl p-3 text-xs focus:border-[#5B45F5] outline-none resize-none"
                  required
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setReplyingTicket(null)}
                    className="px-4 py-2 rounded-xl border border-[#E7E9F2] text-[#667085] font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#5B45F5] hover:bg-[#4B38D3] text-white font-bold"
                  >
                    Send Reply & Resolve
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MANUAL DELIVERY MODAL */}
        {deliveringOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              onClick={() => setDeliveringOrder(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-xs"
            />
            <div className="relative bg-white border border-[#E7E9F2] rounded-3xl max-w-md w-full p-6 shadow-2xl z-10 space-y-4">
              <h3 className="text-lg font-black text-[#111426]">Dispatch Manual Delivery</h3>
              <p className="text-xs text-[#667085]">
                Order: {deliveringOrder.order_number} &bull; {deliveringOrder.primary_item}
              </p>
              <form onSubmit={handleDispatchManualDelivery} className="space-y-3 text-xs">
                <textarea
                  rows={4}
                  value={manualDeliveryText}
                  onChange={(e) => setManualDeliveryText(e.target.value)}
                  placeholder="Enter username, password, or activation codes..."
                  className="w-full bg-[#F8F9FC] border border-[#E7E9F2] text-[#111426] rounded-xl p-3 text-xs focus:border-[#5B45F5] outline-none font-mono resize-none"
                  required
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setDeliveringOrder(null)}
                    className="px-4 py-2 rounded-xl border border-[#E7E9F2] text-[#667085] font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                  >
                    Dispatch to Vault
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* CREATE PRODUCT MODAL */}
        {showAddProductModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              onClick={() => setShowAddProductModal(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-xs"
            />
            <div className="relative bg-white border border-[#E7E9F2] rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl z-10 space-y-4 max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-black text-[#111426]">Add New Product Listing</h3>
              <form onSubmit={handleCreateProduct} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-[#667085] font-bold mb-1">Product Title *</label>
                  <input
                    type="text"
                    placeholder="e.g. Valorant Immortal 3 Kuronami Account"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    className="w-full bg-[#F8F9FC] border border-[#E7E9F2] text-[#111426] rounded-xl p-3 text-xs focus:border-[#5B45F5] outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#667085] font-bold mb-1">Category *</label>
                    <select
                      value={newProduct.category_id}
                      onChange={(e) => setNewProduct({ ...newProduct, category_id: e.target.value })}
                      className="w-full bg-[#F8F9FC] border border-[#E7E9F2] text-[#111426] rounded-xl p-3 text-xs focus:border-[#5B45F5] outline-none"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[#667085] font-bold mb-1">Delivery Type *</label>
                    <select
                      value={newProduct.delivery_type}
                      onChange={(e) => setNewProduct({ ...newProduct, delivery_type: e.target.value })}
                      className="w-full bg-[#F8F9FC] border border-[#E7E9F2] text-[#111426] rounded-xl p-3 text-xs focus:border-[#5B45F5] outline-none"
                    >
                      <option value="account">Account Credentials</option>
                      <option value="code">Digital Code / Voucher</option>
                      <option value="currency">Currency / Topup</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[#667085] font-bold mb-1">Price (₹) *</label>
                    <input
                      type="number"
                      value={newProduct.price}
                      onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                      className="w-full bg-[#F8F9FC] border border-[#E7E9F2] text-[#111426] rounded-xl p-3 text-xs focus:border-[#5B45F5] outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[#667085] font-bold mb-1">Original Price (₹)</label>
                    <input
                      type="number"
                      value={newProduct.original_price}
                      onChange={(e) => setNewProduct({ ...newProduct, original_price: e.target.value })}
                      className="w-full bg-[#F8F9FC] border border-[#E7E9F2] text-[#111426] rounded-xl p-3 text-xs focus:border-[#5B45F5] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[#667085] font-bold mb-1">Initial Stock</label>
                    <input
                      type="number"
                      value={newProduct.stock}
                      onChange={(e) => setNewProduct({ ...newProduct, stock: Number(e.target.value) })}
                      className="w-full bg-[#F8F9FC] border border-[#E7E9F2] text-[#111426] rounded-xl p-3 text-xs focus:border-[#5B45F5] outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[#667085] font-bold mb-1">Short Highlights</label>
                  <input
                    type="text"
                    placeholder="Immortal 1 | 45 Skins | Mumbai Server"
                    value={newProduct.short_desc}
                    onChange={(e) => setNewProduct({ ...newProduct, short_desc: e.target.value })}
                    className="w-full bg-[#F8F9FC] border border-[#E7E9F2] text-[#111426] rounded-xl p-3 text-xs focus:border-[#5B45F5] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[#667085] font-bold mb-1">Image URL</label>
                  <input
                    type="text"
                    value={newProduct.images}
                    onChange={(e) => setNewProduct({ ...newProduct, images: e.target.value })}
                    className="w-full bg-[#F8F9FC] border border-[#E7E9F2] text-[#111426] rounded-xl p-3 text-xs focus:border-[#5B45F5] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[#667085] font-bold mb-1">Specifications (JSON format)</label>
                  <input
                    type="text"
                    value={newProduct.specs}
                    onChange={(e) => setNewProduct({ ...newProduct, specs: e.target.value })}
                    className="w-full bg-[#F8F9FC] border border-[#E7E9F2] text-[#111426] rounded-xl p-3 font-mono text-xs focus:border-[#5B45F5] outline-none"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddProductModal(false)}
                    className="px-4 py-2 rounded-xl border border-[#E7E9F2] text-[#667085] font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#5B45F5] hover:bg-[#4B38D3] text-white font-bold"
                  >
                    Create Listing
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* CREATE COUPON MODAL */}
        {showCouponModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              onClick={() => setShowCouponModal(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-xs"
            />
            <div className="relative bg-white border border-[#E7E9F2] rounded-3xl max-w-sm w-full p-6 shadow-2xl z-10 space-y-4">
              <h3 className="text-lg font-black text-[#111426]">Create Coupon Code</h3>
              <form onSubmit={handleCreateCoupon} className="space-y-3 text-xs">
                <div>
                  <label className="block text-[#667085] font-bold mb-1">Coupon Code *</label>
                  <input
                    type="text"
                    placeholder="e.g. SUMMER20"
                    value={newCoupon.code}
                    onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                    className="w-full bg-[#F8F9FC] border border-[#E7E9F2] text-[#111426] rounded-xl p-2.5 font-mono uppercase focus:border-[#5B45F5] outline-none"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[#667085] font-bold mb-1">Type</label>
                    <select
                      value={newCoupon.discount_type}
                      onChange={(e) => setNewCoupon({ ...newCoupon, discount_type: e.target.value })}
                      className="w-full bg-[#F8F9FC] border border-[#E7E9F2] text-[#111426] rounded-xl p-2.5 focus:border-[#5B45F5] outline-none"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="flat">Flat (₹)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[#667085] font-bold mb-1">Value</label>
                    <input
                      type="number"
                      value={newCoupon.discount_value}
                      onChange={(e) => setNewCoupon({ ...newCoupon, discount_value: Number(e.target.value) })}
                      className="w-full bg-[#F8F9FC] border border-[#E7E9F2] text-[#111426] rounded-xl p-2.5 focus:border-[#5B45F5] outline-none"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[#667085] font-bold mb-1">Min Order Value (₹)</label>
                  <input
                    type="number"
                    value={newCoupon.min_order_value}
                    onChange={(e) => setNewCoupon({ ...newCoupon, min_order_value: Number(e.target.value) })}
                    className="w-full bg-[#F8F9FC] border border-[#E7E9F2] text-[#111426] rounded-xl p-2.5 focus:border-[#5B45F5] outline-none"
                  />
                </div>
                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCouponModal(false)}
                    className="px-4 py-2 rounded-xl border border-[#E7E9F2] text-[#667085] font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#5B45F5] text-white font-bold"
                  >
                    Create
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
