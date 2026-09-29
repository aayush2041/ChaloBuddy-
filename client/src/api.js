// API Helper for ValorVault

const API_BASE = '/api';

export const api = {
  // Settings
  getSettings: async () => {
    const res = await fetch(`${API_BASE}/settings`);
    return res.json();
  },
  updateSettings: async (settings, updatedBy = 'Admin') => {
    const res = await fetch(`${API_BASE}/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ settings, updatedBy })
    });
    return res.json();
  },

  // Auth
  login: async (email, password) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return res.json();
  },
  register: async (name, email, phone, password) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, phone, password })
    });
    return res.json();
  },

  // Categories & Products
  getCategories: async () => {
    const res = await fetch(`${API_BASE}/categories`);
    return res.json();
  },
  getProducts: async (filters = {}) => {
    const query = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') query.append(k, v);
    });
    const res = await fetch(`${API_BASE}/products?${query.toString()}`);
    return res.json();
  },
  getProductByIdOrSlug: async (idOrSlug) => {
    const res = await fetch(`${API_BASE}/products/${idOrSlug}`);
    return res.json();
  },
  createProduct: async (productData) => {
    const res = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData)
    });
    return res.json();
  },
  updateProduct: async (id, productData) => {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData)
    });
    return res.json();
  },
  deleteProduct: async (id) => {
    const res = await fetch(`${API_BASE}/products/${id}`, { method: 'DELETE' });
    return res.json();
  },

  // Coupons
  validateCoupon: async (code, order_amount, category_id) => {
    const res = await fetch(`${API_BASE}/coupons/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, order_amount, category_id })
    });
    return res.json();
  },
  getCoupons: async () => {
    const res = await fetch(`${API_BASE}/coupons`);
    return res.json();
  },
  createCoupon: async (couponData) => {
    const res = await fetch(`${API_BASE}/coupons`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(couponData)
    });
    return res.json();
  },

  // Orders
  createOrder: async (orderPayload) => {
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderPayload)
    });
    return res.json();
  },
  getOrders: async (filters = {}) => {
    const query = new URLSearchParams(filters);
    const res = await fetch(`${API_BASE}/orders?${query.toString()}`);
    return res.json();
  },
  getAllOrders: async (filters = {}) => {
    const query = new URLSearchParams(filters);
    const res = await fetch(`${API_BASE}/orders?${query.toString()}`);
    return res.json();
  },
  getOrderByIdOrNumber: async (idOrNumber) => {
    const res = await fetch(`${API_BASE}/orders/${idOrNumber}`);
    return res.json();
  },

  // Payments
  submitPayment: async (orderId, formData) => {
    // Can be FormData or JSON
    let options = { method: 'POST' };
    if (formData instanceof FormData) {
      options.body = formData;
    } else {
      options.headers = { 'Content-Type': 'application/json' };
      options.body = JSON.stringify(formData);
    }
    const res = await fetch(`${API_BASE}/orders/${orderId}/payment`, options);
    return res.json();
  },

  // Admin Verification
  getVerificationQueue: async () => {
    const res = await fetch(`${API_BASE}/admin/payments/queue`);
    return res.json();
  },
  verifyPayment: async (orderId, action, rejection_reason = '', admin_notes = '', verified_by = 'ValorVault Admin') => {
    const res = await fetch(`${API_BASE}/admin/payments/${orderId}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, rejection_reason, admin_notes, verified_by })
    });
    return res.json();
  },

  // Deliveries
  getOrderDelivery: async (orderId) => {
    const res = await fetch(`${API_BASE}/orders/${orderId}/delivery`);
    return res.json();
  },
  adminDeliverOrder: async (orderId, delivery_data, delivery_notes, admin_name) => {
    const res = await fetch(`${API_BASE}/admin/orders/${orderId}/deliver`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ delivery_data, delivery_notes, admin_name })
    });
    return res.json();
  },
  acknowledgeDelivery: async (orderId) => {
    const res = await fetch(`${API_BASE}/orders/${orderId}/acknowledge-delivery`, {
      method: 'POST'
    });
    return res.json();
  },

  // Refunds
  requestRefund: async (orderId, reason, customer_name) => {
    const res = await fetch(`${API_BASE}/orders/${orderId}/refund-request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason, customer_name })
    });
    return res.json();
  },
  decideRefund: async (orderId, decision, reason, admin_name) => {
    const res = await fetch(`${API_BASE}/admin/orders/${orderId}/refund-decision`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ decision, reason, admin_name })
    });
    return res.json();
  },

  // Support Tickets
  createTicket: async (ticketData) => {
    const res = await fetch(`${API_BASE}/tickets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ticketData)
    });
    return res.json();
  },
  getTickets: async (filters = {}) => {
    const query = new URLSearchParams(filters);
    const res = await fetch(`${API_BASE}/tickets?${query.toString()}`);
    return res.json();
  },
  getAllTickets: async (filters = {}) => {
    const query = new URLSearchParams(filters);
    const res = await fetch(`${API_BASE}/tickets?${query.toString()}`);
    return res.json();
  },
  replyTicket: async (id, reply, status, admin_name) => {
    const res = await fetch(`${API_BASE}/tickets/${id}/reply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reply, status, admin_name })
    });
    return res.json();
  },

  // Reviews
  getReviews: async (productId) => {
    const res = await fetch(`${API_BASE}/reviews${productId ? `?product_id=${productId}` : ''}`);
    return res.json();
  },
  createReview: async (reviewData) => {
    const res = await fetch(`${API_BASE}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reviewData)
    });
    return res.json();
  },

  // Admin Stats & Audit Logs
  getAdminStats: async () => {
    const res = await fetch(`${API_BASE}/admin/stats`);
    return res.json();
  },
  getAuditLogs: async () => {
    const res = await fetch(`${API_BASE}/admin/audit-logs`);
    return res.json();
  }
};
