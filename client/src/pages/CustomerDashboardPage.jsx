import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { api } from '../api';
import {
  User,
  Package,
  Receipt,
  ShieldCheck,
  Headphones,
  Key,
  ExternalLink,
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle,
  Copy,
  Eye,
  EyeOff,
  Plus
} from 'lucide-react';

export default function CustomerDashboardPage() {
  const { currentUser, currentRoute, navigate, setSupportModalData, addToast } = useStore();
  const [activeTab, setActiveTab] = useState(currentRoute.params?.tab || 'overview'); // 'overview', 'orders', 'deliveries', 'support', 'profile'

  const [orders, setOrders] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (currentRoute.params?.tab) {
      setActiveTab(currentRoute.params.tab);
    }
  }, [currentRoute.params]);

  useEffect(() => {
    async function loadCustomerData() {
      try {
        setLoading(true);
        const [ordersRes, ticketsRes] = await Promise.all([
          api.getOrders({ email: currentUser?.email || '' }),
          api.getTickets({ email: currentUser?.email || '' })
        ]);
        if (ordersRes.success) setOrders(ordersRes.orders);
        if (ticketsRes.success) setTickets(ticketsRes.tickets);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadCustomerData();
  }, [currentUser]);

  const deliveredOrders = orders.filter(o => ['DELIVERED', 'COMPLETED'].includes(o.status));
  const activeOrders = orders.filter(o => !['COMPLETED', 'CANCELLED', 'REFUNDED'].includes(o.status));

  const filteredOrders = statusFilter === 'all'
    ? orders
    : orders.filter(o => o.status === statusFilter);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner with Profile Summary */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#131b29] via-[#0f141f] to-[#121622] border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 p-0.5 shadow-xl shadow-cyan-500/10">
            <img
              src={currentUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
              alt={currentUser?.name}
              className="w-full h-full object-cover rounded-2xl"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-gaming text-2xl font-bold text-white">{currentUser?.name}</h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                VERIFIED PLAYER
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {currentUser?.email} &bull; {currentUser?.phone}
            </p>
          </div>
        </div>

        {/* Quick Stats in Header */}
        <div className="flex items-center gap-3">
          <div className="px-4 py-2.5 rounded-xl bg-black/40 border border-white/5 text-center">
            <div className="text-lg font-bold font-gaming text-white">{orders.length}</div>
            <div className="text-[10px] text-slate-400">Total Orders</div>
          </div>
          <div className="px-4 py-2.5 rounded-xl bg-black/40 border border-white/5 text-center">
            <div className="text-lg font-bold font-gaming text-emerald-400">{deliveredOrders.length}</div>
            <div className="text-[10px] text-slate-400">Vault Assets</div>
          </div>
          <div className="px-4 py-2.5 rounded-xl bg-black/40 border border-white/5 text-center">
            <div className="text-lg font-bold font-gaming text-amber-400">{activeOrders.length}</div>
            <div className="text-[10px] text-slate-400">Active Orders</div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-white/10 overflow-x-auto space-x-2 pb-px text-xs font-semibold">
        {[
          { id: 'overview', label: 'Overview', icon: User },
          { id: 'orders', label: `My Orders (${orders.length})`, icon: Receipt },
          { id: 'deliveries', label: `Digital Deliveries (${deliveredOrders.length})`, icon: Key },
          { id: 'support', label: `Support Tickets (${tickets.length})`, icon: Headphones },
          { id: 'profile', label: 'Security & Profile', icon: ShieldCheck }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 px-4 rounded-t-xl transition flex items-center gap-2 shrink-0 ${
                activeTab === tab.id
                  ? 'bg-[#121824] text-[#ff4655] border-t-2 border-[#ff4655] font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT */}

      {/* 1. OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-[#0f141f] border border-white/10 space-y-3">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>Active Transactions</span>
                <Clock className="w-4 h-4 text-amber-400" />
              </div>
              <div className="font-gaming text-3xl font-bold text-white">{activeOrders.length}</div>
              <p className="text-[11px] text-slate-400">
                Orders undergoing payment submission or verification review.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#0f141f] border border-white/10 space-y-3">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>Total Spent</span>
                <Receipt className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="font-gaming text-3xl font-bold text-cyan-300">
                ₹{orders.reduce((sum, o) => sum + o.total_amount, 0).toLocaleString('en-IN')}
              </div>
              <p className="text-[11px] text-slate-400">Across {orders.length} digital marketplace orders.</p>
            </div>

            <div className="p-6 rounded-2xl bg-[#0f141f] border border-white/10 space-y-3">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>Active Support Tickets</span>
                <Headphones className="w-4 h-4 text-rose-400" />
              </div>
              <div className="font-gaming text-3xl font-bold text-white">
                {tickets.filter(t => t.status === 'OPEN').length}
              </div>
              <p className="text-[11px] text-slate-400">Helpdesk tickets awaiting resolution.</p>
            </div>
          </div>

          {/* Recent Orders Overview */}
          <div className="p-6 rounded-3xl bg-[#0f141f] border border-white/10 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-gaming text-base font-bold text-white uppercase tracking-wider">
                RECENT PURCHASES
              </h3>
              <button
                onClick={() => setActiveTab('orders')}
                className="text-xs font-semibold text-[#ff4655] hover:underline"
              >
                View All Orders
              </button>
            </div>

            {orders.length === 0 ? (
              <p className="text-slate-400 text-xs">No orders placed yet.</p>
            ) : (
              <div className="space-y-3">
                {orders.slice(0, 3).map((o) => (
                  <div
                    key={o.id}
                    onClick={() => navigate('tracking', { orderId: o.id, orderNumber: o.order_number })}
                    className="p-4 rounded-xl bg-black/40 border border-white/5 hover:border-white/20 transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="font-mono font-bold text-white">{o.order_number}</div>
                      <div className="text-slate-400 mt-0.5">{o.primary_item || 'Digital Gaming Item'} &bull; {o.created_at}</div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-gaming font-bold text-sm text-white">₹{o.total_amount.toLocaleString('en-IN')}</div>
                        <div className="text-[10px] text-cyan-400 font-mono">{o.status}</div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. MY ORDERS TAB */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400">Filter by Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-[#151c29] border border-white/10 text-white rounded-lg px-2.5 py-1.5 focus:border-[#ff4655] focus:outline-none"
              >
                <option value="all">All Orders</option>
                <option value="PAYMENT_SUBMITTED">Under Verification</option>
                <option value="DELIVERED">Delivered</option>
                <option value="COMPLETED">Completed</option>
                <option value="PAYMENT_REJECTED">Rejected</option>
              </select>
            </div>

            <button
              onClick={() => navigate('catalog')}
              className="px-4 py-2 rounded-xl bg-[#ff4655] hover:bg-rose-600 text-white font-semibold text-xs transition"
            >
              Browse Products
            </button>
          </div>

          <div className="space-y-3">
            {filteredOrders.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-[#0f141f] border border-white/10 text-slate-400 text-xs">
                No orders match the selected filter.
              </div>
            ) : (
              filteredOrders.map((o) => (
                <div
                  key={o.id}
                  className="p-5 rounded-2xl bg-[#0f141f] border border-white/10 space-y-3 hover:border-white/20 transition"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/5 text-xs">
                    <div>
                      <span className="text-slate-400">Order:</span>{' '}
                      <span className="font-mono font-bold text-white">{o.order_number}</span>
                      <span className="text-slate-500 mx-2">&bull;</span>
                      <span className="text-slate-400">{o.created_at}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-white">
                        {o.payment_method}
                      </span>
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                        o.status === 'DELIVERED' || o.status === 'COMPLETED'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : o.status === 'PAYMENT_REJECTED'
                          ? 'bg-rose-500/20 text-rose-400'
                          : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {o.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                    <div>
                      <h4 className="font-semibold text-white text-sm">
                        {o.primary_item || 'Digital Gaming Package'}
                      </h4>
                      <div className="text-slate-400 mt-0.5">
                        Total Amount Paid: <span className="text-white font-bold">₹{o.total_amount.toLocaleString('en-IN')}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigate('tracking', { orderId: o.id, orderNumber: o.order_number })}
                        className="px-4 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 font-semibold transition flex items-center gap-1.5"
                      >
                        <span>Track & Vault</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 3. DIGITAL DELIVERIES TAB (Dedicated Vault) */}
      {activeTab === 'deliveries' && (
        <div className="space-y-6">
          <div className="border-b border-white/10 pb-3">
            <h3 className="font-gaming text-lg font-bold text-white">
              DIGITAL CREDENTIALS VAULT
            </h3>
            <p className="text-xs text-slate-400">
              Direct access to all verified accounts, gift codes, and ownership keys purchased on ValorVault.
            </p>
          </div>

          {deliveredOrders.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-[#0f141f] border border-white/10 text-slate-400 text-xs">
              No digital goods delivered yet. Place an order and complete payment verification to receive vault goods.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {deliveredOrders.map((o) => (
                <div key={o.id} className="p-6 rounded-2xl bg-[#0f141f] border border-emerald-500/30 space-y-4">
                  <div className="flex items-center justify-between text-xs border-b border-white/10 pb-3">
                    <span className="font-mono text-emerald-400 font-bold">
                      {o.order_number}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      Delivered: {o.updated_at}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-gaming text-base font-bold text-white">
                      {o.primary_item}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Full access granted. Passwords and recovery keys are securely stored in your order ledger.
                    </p>
                  </div>

                  <button
                    onClick={() => navigate('tracking', { orderId: o.id, orderNumber: o.order_number })}
                    className="w-full py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-semibold text-xs flex items-center justify-center gap-2 transition"
                  >
                    <Key className="w-4 h-4" />
                    <span>Open Order Credentials Vault</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4. SUPPORT TICKETS TAB */}
      {activeTab === 'support' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <h3 className="font-gaming text-lg font-bold text-white">SUPPORT TICKETS</h3>
              <p className="text-xs text-slate-400">Assistance with payments, orders, or verification</p>
            </div>
            <button
              onClick={() => setSupportModalData({ isOpen: true })}
              className="px-4 py-2 rounded-xl bg-[#ff4655] hover:bg-rose-600 text-white font-semibold text-xs flex items-center gap-1.5 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Open New Ticket</span>
            </button>
          </div>

          {tickets.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-[#0f141f] border border-white/10 text-slate-400 text-xs">
              No support tickets opened. Click "Open New Ticket" if you need any help.
            </div>
          ) : (
            <div className="space-y-3">
              {tickets.map((t) => (
                <div key={t.id} className="p-5 rounded-2xl bg-[#0f141f] border border-white/10 space-y-3 text-xs">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <span className="font-mono text-cyan-400 font-bold">{t.ticket_number}</span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                      t.status === 'RESOLVED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {t.status}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-semibold text-white text-sm">{t.subject}</h4>
                    <p className="text-slate-300 mt-1 leading-relaxed">{t.message}</p>
                  </div>

                  {t.admin_reply && (
                    <div className="p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-500/20 text-cyan-300 space-y-1">
                      <span className="font-bold block text-white text-[11px]">Official Admin Reply:</span>
                      <p className="text-slate-300">{t.admin_reply}</p>
                    </div>
                  )}

                  <div className="text-[10px] text-slate-500 pt-1">Opened on {t.created_at}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 5. PROFILE & SECURITY */}
      {activeTab === 'profile' && (
        <div className="max-w-2xl space-y-6">
          <div className="p-6 rounded-2xl bg-[#0f141f] border border-white/10 space-y-4 text-xs">
            <h3 className="font-gaming text-base font-bold text-white uppercase tracking-wider border-b border-white/10 pb-3">
              PROFILE DETAILS
            </h3>
            <div className="space-y-3">
              <div>
                <span className="text-slate-400 block mb-1">Display Name</span>
                <input
                  type="text"
                  value={currentUser?.name}
                  disabled
                  className="w-full bg-[#151c29] border border-white/10 text-white rounded-lg p-2.5 opacity-80"
                />
              </div>
              <div>
                <span className="text-slate-400 block mb-1">Email Address (Order notifications)</span>
                <input
                  type="email"
                  value={currentUser?.email}
                  disabled
                  className="w-full bg-[#151c29] border border-white/10 text-white rounded-lg p-2.5 opacity-80"
                />
              </div>
              <div>
                <span className="text-slate-400 block mb-1">Mobile Phone Number</span>
                <input
                  type="tel"
                  value={currentUser?.phone}
                  disabled
                  className="w-full bg-[#151c29] border border-white/10 text-white rounded-lg p-2.5 opacity-80"
                />
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#0f141f] border border-cyan-500/20 text-xs space-y-2">
            <h4 className="font-semibold text-white">Account Security Recommendation:</h4>
            <p className="text-slate-400 leading-relaxed">
              When purchasing gaming accounts, always log into the official Riot Client or Krafton settings and change passwords immediately upon receipt. Keep your Order ID safe for any warranty or inspection disputes.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
