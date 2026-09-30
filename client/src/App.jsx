import React, { useEffect } from 'react';
import { useStore } from './context/StoreContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import AuthModal from './components/AuthModal';
import MobileBottomNav from './components/MobileBottomNav';
import Toast from './components/Toast';

import HomePage from './pages/HomePage';
import CatalogPage from './pages/CatalogPage';
import ProductDetailPage from './pages/ProductDetailPage';
import ProcessPage from './pages/ProcessPage';
import ContactPage from './pages/ContactPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import PaymentPage from './pages/PaymentPage';
import OrderTrackingPage from './pages/OrderTrackingPage';
import DigitalDeliveryPage from './pages/DigitalDeliveryPage';
import AccountDashboardPage from './pages/AccountDashboardPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import CustomerSupportPage from './pages/CustomerSupportPage';
import LegalPage from './pages/LegalPage';
import AdminDashboardPage from './pages/AdminDashboardPage';

export default function App() {
  const { currentRoute, navigate } = useStore();

  // Listen to browser hash changes for back/forward navigation and deep links
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace(/^#\/?/, '');
      if (!hash) {
        navigate('home');
        return;
      }

      const parts = hash.split('/');
      const page = parts[0];
      const param = parts[1];

      if (page === 'games' || page === 'catalog') {
        navigate('catalog', { category: param || 'all' });
      } else if (page === 'product' && param) {
        navigate('product', { id: param });
      } else if (page === 'orders') {
        navigate('orders', { id: param });
      } else if (page === 'delivery' && param) {
        navigate('delivery', { id: param });
      } else if (page === 'account') {
        navigate('account', { tab: param || 'overview' });
      } else if (page === 'payment') {
        navigate('payment', { orderId: param, orderNumber: param });
      } else if (
        [
          'home',
          'catalog',
          'process',
          'contact',
          'cart',
          'checkout',
          'login',
          'signup',
          'support',
          'terms',
          'privacy',
          'refund-policy',
          'acceptable-use',
          'admin'
        ].includes(page)
      ) {
        navigate(page);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [navigate]);

  const renderCurrentPage = () => {
    switch (currentRoute.page) {
      case 'games':
      case 'catalog':
        return <CatalogPage />;
      case 'product':
        return <ProductDetailPage />;
      case 'process':
        return <ProcessPage />;
      case 'contact':
        return <ContactPage />;
      case 'cart':
        return <CartPage />;
      case 'checkout':
        return <CheckoutPage />;
      case 'payment':
        return <PaymentPage />;
      case 'orders':
      case 'tracking':
        return <OrderTrackingPage />;
      case 'delivery':
        return <DigitalDeliveryPage />;
      case 'account':
      case 'customer-dashboard':
        return <AccountDashboardPage />;
      case 'login':
        return <LoginPage />;
      case 'signup':
        return <SignupPage />;
      case 'support':
        return <CustomerSupportPage />;
      case 'terms':
      case 'privacy':
      case 'refund-policy':
      case 'acceptable-use':
      case 'legal':
        return <LegalPage />;
      case 'admin':
        return <AdminDashboardPage />;
      case 'home':
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#000000] flex flex-col font-sans selection:bg-black selection:text-white pb-16 sm:pb-0">
      {/* Global Navbar */}
      <Navbar />

      {/* Page View */}
      <main className="flex-1">
        {renderCurrentPage()}
      </main>

      {/* Slide-out Cart Drawer */}
      <CartDrawer />

      {/* Required Auth Modal */}
      <AuthModal />

      {/* Toast Notification Container */}
      <Toast />

      {/* Mobile Bottom Navigation */}
      {currentRoute.page !== 'admin' && <MobileBottomNav />}

      {/* Global Footer */}
      {currentRoute.page !== 'admin' && <Footer />}
    </div>
  );
}
