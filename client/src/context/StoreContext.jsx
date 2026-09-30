import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api';

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  // Current user state (stored in localStorage)
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('vv_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Clear any old mock demo customer if role is customer and id is usr_cust_01
        if (parsed?.id === 'usr_cust_01' && parsed?.email === 'player@gmail.com') {
          localStorage.removeItem('vv_user');
          return null;
        }
        return parsed;
      }
      return null;
    } catch {
      return null;
    }
  });

  // Authentication gate modal state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login'); // 'login' | 'signup'
  const [authRedirectAction, setAuthRedirectAction] = useState(null);

  // Current view mode: 'store' or 'admin'
  const [viewMode, setViewMode] = useState('store');

  // Navigation state / Hash routing
  const [currentRoute, setCurrentRoute] = useState(() => {
    const hash = window.location.hash.replace(/^#\/?/, '');
    if (!hash) return { page: 'home', params: {} };
    const parts = hash.split('/');
    const page = parts[0] || 'home';
    const param = parts[1] || '';
    return { page, params: { id: param, category: param } };
  });

  // Global Products catalog cache
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);

  // Cart state persisted in localStorage
  const [cart, setCart] = useState(() => {
    try {
      const savedCart = localStorage.getItem('vv_cart');
      return savedCart ? JSON.parse(savedCart) : [];
    } catch {
      return [];
    }
  });

  // Public Settings (UPI, Bank, etc.)
  const [settings, setSettings] = useState({
    upi_id: 'valorvault@upi',
    upi_merchant_name: 'VALORVAULT DIGITAL ENTERPRISES',
    bank_name: 'State Bank of India',
    bank_account_holder: 'ValorVault Digital Enterprises',
    bank_account_number: '3982019482910',
    bank_ifsc: 'SBIN0004821',
    support_phone: '',
    support_email: 'iushyt12@gmail.com',
    support_hours: '09:00 AM – 11:30 PM IST (7 Days/Week)',
    verification_notice: 'Payments verified within 5-15 mins during 09:00 AM - 11:30 PM IST.',
    platform_fee: '0'
  });

  // Global Toast Notifications
  const [toasts, setToasts] = useState([]);

  // Pending verification queue count for admin badge
  const [pendingQueueCount, setPendingQueueCount] = useState(1);

  // Cart Drawer open state
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Support modal open state
  const [supportModalData, setSupportModalData] = useState(null);

  // Sync cart to localStorage
  useEffect(() => {
    localStorage.setItem('vv_cart', JSON.stringify(cart));
  }, [cart]);

  // Sync user to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('vv_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('vv_user');
    }
  }, [currentUser]);

  // Load Products, Settings, and Pending Queue Count periodically
  useEffect(() => {
    loadProducts();
    loadSettings();
  }, []);

  useEffect(() => {
    if (currentUser?.role === 'admin') {
      checkAdminQueue();
      const interval = setInterval(() => {
        checkAdminQueue();
      }, 20000);
      return () => clearInterval(interval);
    }
  }, [currentUser]);

  const loadProducts = async () => {
    try {
      setProductsLoading(true);
      const data = await api.getProducts();
      if (data && data.products && Array.isArray(data.products)) {
        setProducts(data.products);
      } else if (Array.isArray(data)) {
        setProducts(data);
      }
    } catch (err) {
      console.warn('Failed to load products', err);
    } finally {
      setProductsLoading(false);
    }
  };

  const loadSettings = async () => {
    try {
      const data = await api.getSettings();
      if (data.success && data.settings) {
        setSettings(prev => ({ ...prev, ...data.settings }));
      }
    } catch (err) {
      console.warn('Failed to load settings', err);
    }
  };

  const checkAdminQueue = async () => {
    if (currentUser?.role !== 'admin') return;
    try {
      const data = await api.getVerificationQueue();
      if (data && data.success) {
        setPendingQueueCount(data.count || 0);
      }
    } catch {
      // Ignore
    }
  };

  // Toast Helper
  const addToast = (message, type = 'info', duration = 3500) => {
    const id = Date.now() + Math.random().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Cart Operations
  const addToCart = (product, quantity = 1, openDrawer = true) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: Math.min(product.stock || 99, item.quantity + quantity) }
            : item
        );
      }
      return [...prev, { product, quantity: Math.min(product.stock || 1, quantity) }];
    });
    const title = product.name || product.title || 'Product';
    addToast(`Added "${title.slice(0, 26)}..." to cart`, 'success');
    if (openDrawer) setIsCartOpen(true);
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
    addToast('Item removed from cart', 'info');
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev =>
      prev.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce((sum, item) => sum + (Number(item.product.price) * item.quantity), 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Navigation Helper
  const navigate = (page, params = {}) => {
    setCurrentRoute({ page, params });
    window.scrollTo({ top: 0, behavior: 'smooth' });

    let hashUrl = `#/${page}`;
    if ((page === 'games' || page === 'catalog') && params.category && params.category !== 'all') {
      hashUrl = `#/catalog/${params.category}`;
    } else if (page === 'product' && params.id) {
      hashUrl = `#/product/${params.id}`;
    } else if ((page === 'orders' || page === 'tracking') && params.id) {
      hashUrl = `#/orders/${params.id}`;
    } else if (page === 'delivery' && params.id) {
      hashUrl = `#/delivery/${params.id}`;
    } else if (page === 'account' && params.tab) {
      hashUrl = `#/account/${params.tab}`;
    }
    window.history.pushState(null, '', hashUrl);

    if (page === 'admin') {
      setViewMode('admin');
    } else {
      setViewMode('store');
    }
  };

  // Auth Protection Gate
  const requireAuth = (action) => {
    if (!currentUser) {
      setAuthRedirectAction(action);
      setAuthModalMode('login');
      setAuthModalOpen(true);
      return false;
    }
    if (typeof action === 'function') {
      action();
    } else if (action && action.page) {
      navigate(action.page, action.params);
    }
    return true;
  };

  const loginUser = (userData) => {
    setCurrentUser(userData);
    setAuthModalOpen(false);
    addToast(`Welcome back, ${userData.name || userData.username}!`, 'success');

    if (authRedirectAction) {
      if (typeof authRedirectAction === 'function') {
        authRedirectAction();
      } else if (authRedirectAction.page) {
        navigate(authRedirectAction.page, authRedirectAction.params);
      }
      setAuthRedirectAction(null);
    }
  };

  const logoutUser = () => {
    setCurrentUser(null);
    addToast('Signed out successfully', 'info');
    navigate('home');
  };

  const switchRole = () => {
    // Disabled in production
  };

  return (
    <StoreContext.Provider value={{
      currentUser,
      setCurrentUser,
      authModalOpen,
      setAuthModalOpen,
      authModalMode,
      setAuthModalMode,
      requireAuth,
      loginUser,
      logoutUser,
      viewMode,
      setViewMode,
      currentRoute,
      navigate,
      products,
      productsLoading,
      loadProducts,
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      cartTotal,
      cartCount,
      isCartOpen,
      setIsCartOpen,
      settings,
      loadSettings,
      toasts,
      addToast,
      showToast: addToast,
      removeToast,
      pendingQueueCount,
      checkAdminQueue,
      switchRole,
      supportModalData,
      setSupportModalData
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within StoreProvider');
  return context;
}
