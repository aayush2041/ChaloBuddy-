import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { api } from '../api';
import {
  User,
  Receipt,
  CreditCard,
  Key,
  Headphones,
  ShieldCheck,
  LogOut,
  ChevronRight,
  ExternalLink,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Wallet,
  Heart,
  Settings
} from 'lucide-react';

export default function AccountDashboardPage() {
  const {
    currentUser,
    logoutUser,
    currentRoute,
    navigate,
    setSupportModalData,
    addToast
  } = useStore();

  const [activeTab, setActiveTab] = useState(currentRoute.params?.tab || 'overview');
  const [orders, setOrders] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentRoute.params?.tab) {
      setActiveTab(currentRoute.params.tab);
    }
  }, [currentRoute.params]);

  useEffect(() => {
    async function loadAccountData() {
      try {
        setLoading(true);
        const email = currentUser?.email || 'player@gmail.com';
        const [ordersRes, ticketsRes] = await Promise.all([
          api.getOrders({ email }),
          api.getTickets({ email })
        ]);
        if (ordersRes.success) setOrders(ordersRes.orders);
        if (ticketsRes.success) setTickets(ticketsRes.tickets);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadAccountData();
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="bg-[#F8F9FC] min-h-[70vh] flex items-center justify-center py-16 px-4">
        <div className="max-w-md w-full text-center bg-white p-8 rounded-3xl border border-[#E7E9F2] shadow-xs space-y-4">
          <User className="w-12 h-12 text-[#5B45F5] mx-auto" />
          <h2 className="text-xl font-black text-[#111426]">Please Sign In</h2>
          <p className="text-xs text-[#667085]">
            Sign in to view your dashboard, orders, and unlocked digital vault.
          </p>
          <button
            onClick={() => navigate('login')}
            className="px-6 py-2.5 rounded-xl bg-[#5B45F5] text-white text-xs font-bold"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const deliveredOrders = orders.filter((o) => ['DELIVERED', 'COMPLETED'].includes(o.status));
  const pendingOrders = orders.filter((o) => ['PENDING_PAYMENT', 'PAYMENT_SUBMITTED'].includes(o.status));
  const totalSpent = orders
    .filter((o) => ['PAYMENT_CONFIRMED', 'DELIVERED', 'COMPLETED'].includes(o.status))
    .reduce((sum, o) => sum + (o.total_amount || 0), 0);

  const sidebarLinks = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'orders', label: 'My Orders', icon: Receipt, count: orders.length },
    { id: 'deliveries', label: 'Digital Vault', icon: Key, count: deliveredOrders.length },
    { id: 'support', label: 'Support Desk', icon: Headphones, count: tickets.length },
    { id: 'profile', label: 'Settings', icon: Settings }
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'DELIVERED':
      case 'COMPLETED':
        return <span className="bg-emerald-50 text-emerald-600 border border-emerald-200/60 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md">Delivered</span>;
      case 'PAYMENT_CONFIRMED':
        return <span className="bg-blue-50 text-blue-600 border border-blue-200/60 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md">Confirmed</span>;
      case 'PAYMENT_SUBMITTED':
        return <span className="bg-purple-50 text-[#5B45F5] border border-purple-200/60 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md">Under Review</span>;
      case 'PENDING_PAYMENT':
        return <span className="bg-amber-50 text-amber-600 border border-amber-200/60 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md">Payment Pending</span>;
      case 'PAYMENT_REJECTED':
        return <span className="bg-rose-50 text-rose-600 border border-rose-200/60 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md">Rejected</span>;
      default:
        return <span className="bg-gray-50 text-gray-600 border border-gray-200/60 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md">{status}</span>;
    }
  };

  return (
    <div className="bg-[#F8F9FC] min-h-screen py-10 text-[#111426]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* SIDEBAR (3 cols) */}
          <aside className="lg:col-span-3 space-y-4">
            <div className="p-5 rounded-3xl bg-white border border-[#E7E9F2] shadow-xs space-y-4">
              {/* User Profile Card */}
              <div className="flex items-center space-x-3 pb-4 border-b border-[#F1F3F9]">
                <img
                  src={currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                  alt={currentUser.name}
                  className="w-12 h-12 rounded-2xl object-cover border border-[#E7E9F2]"
                />
                <div className="min-w-0">
                  <h3 className="font-extrabold text-sm text-[#111426] truncate">
                    {currentUser.name}
                  </h3>
                  <p className="text-[11px] text-[#667085] truncate font-medium">
                    {currentUser.email}
                  </p>
                  <span className="inline-block text-[10px] font-bold text-[#5B45F5] bg-[#EEF0FF] px-2 py-0.5 rounded-md mt-1">
                    Verified Customer
                  </span>
                </div>
              </div>

              {/* Sidebar Navigation */}
              <nav className="space-y-1">
                {sidebarLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = activeTab === link.id;
                  return (
                    <button
                      key={link.id}
                      onClick={() => setActiveTab(link.id)}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                        isActive
                          ? 'bg-[#EEF0FF] text-[#5B45F5]'
                          : 'text-[#667085] hover:bg-[#F8F9FC] hover:text-[#111426]'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <Icon className="w-4 h-4" />
                        <span>{link.label}</span>
                      </div>
                      {link.count !== undefined && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                          isActive ? 'bg-[#5B45F5] text-white' : 'bg-gray-100 text-[#667085]'
                        }`}>
                          {link.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>

              {/* Logout button */}
              <div className="pt-2 border-t border-[#F1F3F9]">
                <button
                  onClick={logoutUser}
                  className="w-full flex items-center space-x-2.5 px-3.5 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </aside>

          {/* MAIN CONTENT (9 cols) */}
          <main className="lg:col-span-9 space-y-6">
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-5 rounded-2xl bg-white border border-[#E7E9F2] shadow-xs">
                    <span className="text-[11px] font-bold text-[#667085] uppercase tracking-wider">Total Orders</span>
                    <p className="text-2xl font-black text-[#111426] mt-1">{orders.length}</p>
                    <span className="text-[10px] text-emerald-600 font-semibold">{deliveredOrders.length} delivered</span>
                  </div>

                  <div className="p-5 rounded-2xl bg-white border border-[#E7E9F2] shadow-xs">
                    <span className="text-[11px] font-bold text-[#667085] uppercase tracking-wider">Total Spent</span>
                    <p className="text-2xl font-black text-[#111426] mt-1">₹{totalSpent.toLocaleString('en-IN')}</p>
                    <span className="text-[10px] text-[#5B45F5] font-semibold">Bank Escrow Verified</span>
                  </div>

                  <div className="p-5 rounded-2xl bg-white border border-[#E7E9F2] shadow-xs">
                    <span className="text-[11px] font-bold text-[#667085] uppercase tracking-wider">Digital Vault Items</span>
                    <p className="text-2xl font-black text-[#5B45F5] mt-1">{deliveredOrders.length}</p>
                    <span className="text-[10px] text-gray-500 font-semibold">Active licenses</span>
                  </div>

                  <div className="p-5 rounded-2xl bg-white border border-[#E7E9F2] shadow-xs">
                    <span className="text-[11px] font-bold text-[#667085] uppercase tracking-wider">Support Tickets</span>
                    <p className="text-2xl font-black text-[#111426] mt-1">{tickets.length}</p>
                    <span className="text-[10px] text-emerald-600 font-semibold">24/7 desk ready</span>
                  </div>
                </div>

                {/* Recent Orders Card */}
                <div className="bg-white rounded-3xl border border-[#E7E9F2] p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-[#F1F3F9]">
                    <h3 className="font-black text-sm uppercase tracking-wider text-[#111426]">
                      Recent Orders
                    </h3>
                    <button
                      onClick={() => setActiveTab('orders')}
                      className="text-xs font-bold text-[#5B45F5] hover:underline"
                    >
                      View All →
                    </button>
                  </div>

                  {orders.length === 0 ? (
                    <p className="text-xs text-[#667085] py-4 text-center">No orders placed yet.</p>
                  ) : (
                    <div className="divide-y divide-[#F1F3F9]">
                      {orders.slice(0, 5).map((ord) => (
                        <div key={ord.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-extrabold text-[#111426]">{ord.order_number}</span>
                              {getStatusBadge(ord.status)}
                            </div>
                            <p className="text-[11px] text-[#667085] mt-0.5">
                              {ord.primary_item || 'Gaming Marketplace Item'} • Total: <span className="font-bold text-[#111426]">₹{ord.total_amount}</span>
                            </p>
                          </div>

                          <div className="flex items-center space-x-2">
                            {['DELIVERED', 'COMPLETED'].includes(ord.status) ? (
                              <button
                                onClick={() => navigate('delivery', { id: ord.order_number })}
                                className="px-3.5 py-1.5 rounded-xl bg-[#5B45F5] text-white font-bold text-xs flex items-center gap-1 shadow-2xs cursor-pointer"
                              >
                                <Key className="w-3.5 h-3.5" />
                                <span>Vault</span>
                              </button>
                            ) : ord.status === 'PENDING_PAYMENT' ? (
                              <button
                                onClick={() => navigate('payment', { orderId: ord.id, orderNumber: ord.order_number, total: ord.total_amount })}
                                className="px-3.5 py-1.5 rounded-xl bg-[#5B45F5] text-white font-bold text-xs shadow-2xs cursor-pointer"
                              >
                                Pay Now
                              </button>
                            ) : null}

                            <button
                              onClick={() => navigate('orders', { id: ord.order_number })}
                              className="px-3 py-1.5 rounded-xl border border-[#E7E9F2] text-[#667085] hover:text-[#111426] font-bold text-xs"
                            >
                              Track
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ORDERS TAB */}
            {activeTab === 'orders' && (
              <div className="bg-white rounded-3xl border border-[#E7E9F2] p-6 shadow-xs space-y-4">
                <h3 className="font-black text-base text-[#111426]">All Orders</h3>
                <div className="divide-y divide-[#F1F3F9]">
                  {orders.map((ord) => (
                    <div key={ord.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-extrabold text-[#111426]">{ord.order_number}</span>
                          {getStatusBadge(ord.status)}
                        </div>
                        <p className="text-[11px] text-[#667085] mt-0.5">
                          {ord.created_at ? new Date(ord.created_at).toLocaleDateString() : 'Recent'} • Amount: ₹{ord.total_amount}
                        </p>
                      </div>

                      <div className="flex items-center space-x-2">
                        {['DELIVERED', 'COMPLETED'].includes(ord.status) && (
                          <button
                            onClick={() => navigate('delivery', { id: ord.order_number })}
                            className="px-3 py-1.5 rounded-xl bg-[#5B45F5] text-white font-bold"
                          >
                            Open Vault
                          </button>
                        )}
                        <button
                          onClick={() => navigate('orders', { id: ord.order_number })}
                          className="px-3 py-1.5 rounded-xl border border-[#E7E9F2] font-bold text-[#667085]"
                        >
                          View Status
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* DELIVERIES / DIGITAL VAULT TAB */}
            {activeTab === 'deliveries' && (
              <div className="bg-white rounded-3xl border border-[#E7E9F2] p-6 shadow-xs space-y-4">
                <h3 className="font-black text-base text-[#111426]">Digital Vault Deliveries</h3>
                <p className="text-xs text-[#667085]">
                  Access your delivered game credentials, keys, and warranty certificates.
                </p>

                {deliveredOrders.length === 0 ? (
                  <p className="text-xs text-[#667085] py-8 text-center">No delivered assets yet.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    {deliveredOrders.map((ord) => (
                      <div key={ord.id} className="p-4 rounded-2xl bg-[#F8F9FC] border border-[#E7E9F2] space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="font-extrabold text-[#111426]">{ord.order_number}</span>
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                            Unlocked
                          </span>
                        </div>
                        <p className="text-xs text-[#667085] line-clamp-1">{ord.primary_item || 'Account Credentials'}</p>
                        <button
                          onClick={() => navigate('delivery', { id: ord.order_number })}
                          className="w-full py-2 rounded-xl bg-[#5B45F5] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs"
                        >
                          <Key className="w-3.5 h-3.5" />
                          <span>View Credentials</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* SUPPORT DESK TAB */}
            {activeTab === 'support' && (
              <div className="bg-white rounded-3xl border border-[#E7E9F2] p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#F1F3F9]">
                  <h3 className="font-black text-base text-[#111426]">Support Tickets</h3>
                  <button
                    onClick={() => setSupportModalData({ order_id: null })}
                    className="px-4 py-2 rounded-xl bg-[#5B45F5] text-white font-bold text-xs flex items-center gap-1.5 shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>New Ticket</span>
                  </button>
                </div>

                {tickets.length === 0 ? (
                  <p className="text-xs text-[#667085] py-6 text-center">No open support tickets.</p>
                ) : (
                  <div className="divide-y divide-[#F1F3F9]">
                    {tickets.map(t => (
                      <div key={t.id} className="py-3 text-xs space-y-1">
                        <div className="flex justify-between font-bold">
                          <span className="text-[#111426]">{t.subject}</span>
                          <span className="text-[#5B45F5] uppercase text-[10px]">{t.status}</span>
                        </div>
                        <p className="text-[#667085]">{t.message}</p>
                        {t.admin_reply && (
                          <div className="mt-2 p-2.5 bg-[#EEF0FF] rounded-xl text-[#111426] font-medium">
                            <span className="font-bold text-[#5B45F5] block text-[10px]">Admin Reply:</span>
                            {t.admin_reply}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* PROFILE / SETTINGS TAB */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-3xl border border-[#E7E9F2] p-6 shadow-xs space-y-4">
                <h3 className="font-black text-base text-[#111426]">Profile Settings</h3>
                <div className="space-y-3 text-xs max-w-md">
                  <div>
                    <label className="font-bold text-[#667085] block mb-1">Name</label>
                    <input
                      type="text"
                      disabled
                      value={currentUser.name}
                      className="w-full bg-[#F8F9FC] border border-[#E7E9F2] rounded-xl px-3 py-2 font-bold text-[#111426]"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-[#667085] block mb-1">Email</label>
                    <input
                      type="email"
                      disabled
                      value={currentUser.email}
                      className="w-full bg-[#F8F9FC] border border-[#E7E9F2] rounded-xl px-3 py-2 font-bold text-[#111426]"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-[#667085] block mb-1">Phone</label>
                    <input
                      type="text"
                      disabled
                      value={currentUser.phone || '+91 98112 23344'}
                      className="w-full bg-[#F8F9FC] border border-[#E7E9F2] rounded-xl px-3 py-2 font-bold text-[#111426]"
                    />
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
