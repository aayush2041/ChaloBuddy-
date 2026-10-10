// ChaloBuddy Production API Client
// Connects frontend to /api server with JWT token management and defensive fallbacks

const API_BASE = '/api';

export function getAuthToken() {
  try {
    return localStorage.getItem('cb_auth_token') || null;
  } catch {
    return null;
  }
}

export function setAuthToken(token) {
  try {
    if (token) {
      localStorage.setItem('cb_auth_token', token);
    } else {
      localStorage.removeItem('cb_auth_token');
    }
  } catch {
    // Ignore storage errors
  }
}

async function request(endpoint, options = {}) {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      return {
        success: false,
        error: data?.error || `Request failed with status ${res.status}`,
        status: res.status,
      };
    }

    return data || { success: true };
  } catch (err) {
    return {
      success: false,
      error: 'Network connection error. Operating in offline/local mode.',
      networkError: true,
    };
  }
}

export const apiClient = {
  // Auth
  auth: {
    login: async (email, password) => {
      const res = await request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      if (res.success && res.token) {
        setAuthToken(res.token);
      }
      return res;
    },
    register: async (userData) => {
      const res = await request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
      if (res.success && res.token) {
        setAuthToken(res.token);
      }
      return res;
    },
    getMe: async () => {
      return request('/auth/me');
    },
    logout: async () => {
      setAuthToken(null);
      return request('/auth/logout', { method: 'POST' });
    },
    updateProfile: async (profileData) => {
      return request('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData),
      });
    },
  },

  // Trips
  trips: {
    list: async (filters = {}) => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') params.append(k, String(v));
      });
      return request(`/trips?${params.toString()}`);
    },
    getById: async (id) => {
      return request(`/trips/${id}`);
    },
    create: async (tripData) => {
      return request('/trips', {
        method: 'POST',
        body: JSON.stringify(tripData),
      });
    },
    update: async (id, tripData) => {
      return request(`/trips/${id}`, {
        method: 'PUT',
        body: JSON.stringify(tripData),
      });
    },
    cancel: async (id) => {
      return request(`/trips/${id}`, {
        method: 'DELETE',
      });
    },
    submitJoinRequest: async (tripId, requestData) => {
      return request(`/trips/${tripId}/join-requests`, {
        method: 'POST',
        body: JSON.stringify(requestData),
      });
    },
    getTripRequests: async (tripId) => {
      return request(`/trips/${tripId}/join-requests`);
    },
  },

  // Requests Moderation
  requests: {
    respond: async (requestId, action, reason = '') => {
      return request(`/requests/${requestId}/respond`, {
        method: 'PUT',
        body: JSON.stringify({ action, reason }),
      });
    },
    getMyRequests: async () => {
      return request('/requests/me');
    },
  },

  // Conversations & Real-Time Chat
  conversations: {
    list: async () => {
      return request('/conversations');
    },
    getMessages: async (conversationId) => {
      return request(`/conversations/${conversationId}/messages`);
    },
    sendMessage: async (conversationId, text, imageUrl = null) => {
      return request(`/conversations/${conversationId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ text, imageUrl }),
      });
    },
    getOrCreateDirect: async (recipientId) => {
      return request('/conversations/direct', {
        method: 'POST',
        body: JSON.stringify({ recipientId }),
      });
    },
  },

  // Stays
  stays: {
    list: async (filters = {}) => {
      const params = new URLSearchParams(filters);
      return request(`/stays?${params.toString()}`);
    },
    getById: async (id) => {
      return request(`/stays/${id}`);
    },
    book: async (stayId, bookingData) => {
      return request(`/stays/${stayId}/book`, {
        method: 'POST',
        body: JSON.stringify(bookingData),
      });
    },
  },

  // Stories
  stories: {
    list: async () => {
      return request('/stories');
    },
    create: async (storyData) => {
      return request('/stories', {
        method: 'POST',
        body: JSON.stringify(storyData),
      });
    },
    like: async (id) => {
      return request(`/stories/${id}/like`, {
        method: 'POST',
      });
    },
  },

  // Notifications
  notifications: {
    list: async () => {
      return request('/notifications');
    },
    markRead: async (id) => {
      return request(`/notifications/${id}/read`, {
        method: 'PUT',
      });
    },
    markAllRead: async () => {
      return request('/notifications/read-all', {
        method: 'PUT',
      });
    },
  },
};
