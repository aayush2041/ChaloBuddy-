import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { api } from '../api';
import {
  Check,
  Clock,
  ArrowRight,
  Key,
  Search,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export default function OrderTrackingPage() {
  const { currentRoute, navigate, currentUser, showToast } = useStore();
  const orderRef = currentRoute.params?.id || currentRoute.params?.orderId || currentRoute.params?.orderNumber;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        if (orderRef) {
          const res = await api.getOrderByIdOrNumber(orderRef);
          if (res.success && res.order) {
            setOrder(res.order);
          } else {
            const fb = await api.getOrderByIdOrNumber('VV-10248');
            if (fb.success && fb.order) setOrder(fb.order);
          }
        } else {
          const email = currentUser?.email || '';
          const listRes = await api.getOrders({ email });
          if (listRes.success && listRes.orders.length > 0) {
            const first = await api.getOrderByIdOrNumber(listRes.orders[0].id);
            if (first.success && first.order) setOrder(first.order);
          } else {
            const fb = await api.getOrderByIdOrNumber('VV-10248');
            if (fb.success && fb.order) setOrder(fb.order);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();

    const interval = setInterval(() => {
      if (orderRef) {
        api.getOrderByIdOrNumber(orderRef).then(res => {
          if (res.success && res.order) setOrder(res.order);
        });
      }
    }, 6000);
    return () => clearInterval(interval);
  }, [orderRef, currentUser]);

  const handleSearchOrder = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      const res = await api.getOrderByIdOrNumber(searchQuery.trim());
      if (res.success && res.order) {
        setOrder(res.order);
        navigate('orders', { id: res.order.order_number });
      } else {
        showToast?.('Order not found. Please check your Order ID.', 'error');
      }
    } catch {
      showToast?.('Error searching order', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-neutral-500 text-xs font-semibold">Tracking order status...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="bg-white min-h-[70vh] flex items-center justify-center py-16 px-4">
        <div className="max-w-md w-full text-center bg-white p-8 border border-black space-y-4">
          <h2 className="text-xl font-heading font-black uppercase text-black">No Orders Found</h2>
          <p className="text-xs text-neutral-600">
            Search by order reference number or browse verified games.
          </p>
          <button
            onClick={() => navigate('games')}
            className="px-6 py-3 bg-black text-white text-xs font-bold uppercase tracking-wider"
            style={{ borderRadius: '0px' }}
          >
            Explore Games
          </button>
        </div>
      </div>
    );
  }

  // Active step
  let stepIndex = 0;
  if (['PAYMENT_SUBMITTED', 'PAYMENT_UNDER_REVIEW'].includes(order.status)) stepIndex = 1;
  if (['PAYMENT_CONFIRMED', 'PROCESSING'].includes(order.status)) stepIndex = 2;
  if (['DELIVERED', 'COMPLETED'].includes(order.status)) stepIndex = 3;
  if (order.status === 'PAYMENT_REJECTED') stepIndex = -1;

  const steps = [
    { title: 'Order Placed', desc: 'Awaiting manual payment' },
    { title: 'Payment Submitted', desc: 'Bank statement reconciliation' },
    { title: 'Admin Confirmed', desc: 'Escrow verification complete' },
    { title: 'Delivered', desc: 'Unlocked in digital vault' }
  ];

  return (
    <div className="bg-white min-h-screen py-10 lg:py-16 text-black">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Top Search Bar */}
        <div className="border border-black p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-heading font-black uppercase tracking-tight text-black">
              Order Tracking
            </h1>
            <p className="text-xs text-neutral-500 font-sans">
              Real-time manual UTR reconciliation status
            </p>
          </div>

          <form onSubmit={handleSearchOrder} className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Order Number (e.g. VV-10248)..."
              className="w-full bg-white border border-black text-xs font-semibold text-black pl-9 pr-3 py-2.5 outline-none font-mono"
              style={{ borderRadius: '0px' }}
            />
          </form>
        </div>

        {/* Order Details Banner */}
        <div className="border border-black p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-neutral-200 gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                Order Reference
              </span>
              <h2 className="text-2xl font-heading font-black text-black tracking-tight">
                {order.order_number}
              </h2>
              <p className="text-xs text-neutral-600 mt-0.5">
                Recipient: <span className="font-bold text-black">{order.customer_name}</span> ({order.customer_phone})
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {['DELIVERED', 'COMPLETED'].includes(order.status) ? (
                <button
                  onClick={() => navigate('delivery', { id: order.order_number })}
                  className="px-6 py-3 bg-black hover:bg-neutral-800 text-white font-bold text-xs uppercase tracking-wider transition flex items-center gap-2 cursor-pointer"
                  style={{ borderRadius: '0px' }}
                >
                  <Key className="w-4 h-4" />
                  <span>Open Digital Vault</span>
                </button>
              ) : order.status === 'PENDING_PAYMENT' ? (
                <button
                  onClick={() => navigate('payment', { orderId: order.id, orderNumber: order.order_number, total: order.total_amount })}
                  className="px-6 py-3 bg-black hover:bg-neutral-800 text-white font-bold text-xs uppercase tracking-wider transition flex items-center gap-2 cursor-pointer"
                  style={{ borderRadius: '0px' }}
                >
                  <span>Pay Now (Rs. {Number(order.total_amount).toFixed(2)})</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : null}
            </div>
          </div>

          {/* Stepper */}
          {order.status === 'PAYMENT_REJECTED' ? (
            <div className="p-4 bg-red-50 border border-red-300 text-red-900 space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm uppercase">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <span>Payment Verification Rejected</span>
              </div>
              <p className="text-xs">
                {order.admin_notes || 'UTR reference could not be matched against current bank statements.'}
              </p>
            </div>
          ) : (
            <div className="py-4">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                {steps.map((st, idx) => {
                  const isDone = stepIndex >= idx;
                  const isCurrent = stepIndex === idx;

                  return (
                    <div
                      key={idx}
                      className={`p-4 border ${
                        isCurrent
                          ? 'border-2 border-black bg-neutral-50'
                          : isDone
                          ? 'border-neutral-300 bg-white'
                          : 'border-neutral-200 bg-neutral-50/50 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div
                          className={`w-6 h-6 flex items-center justify-center text-xs font-bold ${
                            isDone ? 'bg-black text-white' : 'border border-neutral-300 text-neutral-400'
                          }`}
                        >
                          {isDone ? '✓' : idx + 1}
                        </div>
                        <span className="font-heading font-bold text-xs uppercase text-black">
                          {st.title}
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-500 font-sans">
                        {st.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Order Summary & UTR info */}
          <div className="p-4 bg-neutral-50 border border-neutral-200 text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-neutral-500">Total Amount:</span>
              <span className="font-heading font-bold text-black text-sm">
                Rs. {Number(order.total_amount).toFixed(2)}
              </span>
            </div>
            {order.payment_reference && (
              <div className="flex justify-between">
                <span className="text-neutral-500">Submitted UTR Reference:</span>
                <span className="font-mono font-bold text-black">{order.payment_reference}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-neutral-500">Current Status:</span>
              <span className="font-bold uppercase tracking-wider text-black bg-white px-2 py-0.5 border border-neutral-300">
                {order.status}
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
