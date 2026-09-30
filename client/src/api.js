// API Helper for ValorVault

const API_BASE = '/api';

const getAuthHeaders = () => {
  try {
    const userStr = localStorage.getItem('vv_user');
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user && user.token) {
        return { Authorization: `Bearer ${user.token}` };
      }
    }
  } catch (e) {
    // Ignore error
  }
  return {};
};

const authFetch = async (url, options = {}) => {
  const headers = {
    ...getAuthHeaders(),
    ...(options.headers || {})
  };
  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers
  });
  return res.json();
};

export const api = {
  // Settings
  getSettings: async () => {
    const res = await fetch(`${API_BASE}/settings`);
    return res.json();
  },
  updateSettings: async (settings, updatedBy = 'Admin') => {
    return authFetch('/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ settings, updatedBy })
    });
  },
  updateAdminSecurity: async (email, current_password, new_password) => {
    return authFetch('/admin/security', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, current_password, new_password })
    });
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
    return authFetch('/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData)
    });
  },
  updateProduct: async (id, productData) => {
    return authFetch(`/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData)
    });
  },
  deleteProduct: async (id) => {
    return authFetch(`/products/${id}`, { method: 'DELETE' });
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
    return authFetch('/coupons');
  },
  createCoupon: async (couponData) => {
    return authFetch('/coupons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(couponData)
    });
  },
  deleteCoupon: async (id) => {
    return authFetch(`/coupons/${id}`, { method: 'DELETE' });
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
    return authFetch(`/orders?${query.toString()}`);
  },
  getOrderByIdOrNumber: async (idOrNumber) => {
    const res = await fetch(`${API_BASE}/orders/${idOrNumber}`);
    return res.json();
  },

  // Payments
  submitPayment: async (orderId, formData) => {
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
    return authFetch('/admin/payments/queue');
  },
  verifyPayment: async (orderId, action, rejection_reason = '', admin_notes = '', verified_by = 'ValorVault Admin') => {
    return authFetch(`/admin/payments/${orderId}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, rejection_reason, admin_notes, verified_by })
    });
  },

  // Deliveries
  getOrderDelivery: async (orderId) => {
    const res = await fetch(`${API_BASE}/orders/${orderId}/delivery`);
    return res.json();
  },
  adminDeliverOrder: async (orderId, delivery_data, delivery_notes, admin_name) => {
    return authFetch(`/admin/orders/${orderId}/deliver`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ delivery_data, delivery_notes, admin_name })
    });
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
    return authFetch(`/admin/orders/${orderId}/refund-decision`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ decision, reason, admin_name })
    });
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
    return authFetch(`/tickets?${query.toString()}`);
  },
  replyTicket: async (id, reply, status, admin_name) => {
    return authFetch(`/tickets/${id}/reply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reply, status, admin_name })
    });
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
    return authFetch('/admin/stats');
  },
  getAuditLogs: async () => {
    return authFetch('/admin/audit-logs');
  }
};
