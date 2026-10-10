import React, { useEffect, Suspense, lazy } from 'react';
import { useStore } from './context/StoreContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import MobileBottomNav from './components/MobileBottomNav';
import Toast from './components/Toast';

// Modals
import JoinTripModal from './components/JoinTripModal';
import ReserveStayModal from './components/ReserveStayModal';
import VideoTourModal from './components/VideoTourModal';
import SearchModal from './components/SearchModal';
import ShareModal from './components/ShareModal';
import WriteStoryModal from './components/WriteStoryModal';
import WriteReviewModal from './components/WriteReviewModal';
import AuthModal from './components/AuthModal';

// Pages (Code-split with React.lazy)
const HomePage = lazy(() => import('./pages/HomePage'));
const TripsPage = lazy(() => import('./pages/TripsPage'));
const TripDetailPage = lazy(() => import('./pages/TripDetailPage'));
const ListTripPage = lazy(() => import('./pages/ListTripPage'));
const PlanTripPage = lazy(() => import('./pages/PlanTripPage'));
const PlanResultPage = lazy(() => import('./pages/PlanResultPage'));
const StaysPage = lazy(() => import('./pages/StaysPage'));
const StayDetailPage = lazy(() => import('./pages/StayDetailPage'));
const BuddiesPage = lazy(() => import('./pages/BuddiesPage'));
const UserProfilePage = lazy(() => import('./pages/UserProfilePage'));
const MessagesPage = lazy(() => import('./pages/MessagesPage'));
const MyTripsPage = lazy(() => import('./pages/MyTripsPage'));
const SavedPage = lazy(() => import('./pages/SavedPage'));
const StoriesPage = lazy(() => import('./pages/StoriesPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const SignupPage = lazy(() => import('./pages/SignupPage'));
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage'));

export default function App() {
  const { currentRoute, navigate } = useStore();

  // Listen to browser hash changes for back/forward navigation and deep links
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace(/^#+[\/]?/, '');
      if (!hash) {
        navigate('home');
        return;
      }

      const parts = hash.split('/');
      const page = parts[0];
      const param = parts[1];

      if (page === 'trips' && param) {
        navigate('trip-detail', { id: param });
      } else if (page === 'stays' && param) {
        navigate('stay-detail', { id: param });
      } else if (page === 'profile' && param) {
        navigate('profile', { id: param });
      } else if (page === 'my-trips') {
        navigate('my-trips', { tab: param || 'upcoming' });
      } else if (
        [
          'home',
          'trips',
          'trip-detail',
          'list-trip',
          'plan-trip',
          'plan-result',
          'stays',
          'stay-detail',
          'buddies',
          'profile',
          'messages',
          'my-trips',
          'saved',
          'stories',
          'about',
          'login',
          'signup',
          'admin',
        ].includes(page)
      ) {
        navigate(page, { id: param });
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [navigate]);

  const renderCurrentPage = () => {
    switch (currentRoute.page) {
      case 'trips':
        return <TripsPage />;
      case 'trip-detail':
        return <TripDetailPage />;
      case 'list-trip':
        return <ListTripPage />;
      case 'plan-trip':
        return <PlanTripPage />;
      case 'plan-result':
        return <PlanResultPage />;
      case 'stays':
        return <StaysPage />;
      case 'stay-detail':
        return <StayDetailPage />;
      case 'buddies':
        return <BuddiesPage />;
      case 'profile':
        return <UserProfilePage />;
      case 'messages':
        return <MessagesPage />;
      case 'my-trips':
        return <MyTripsPage />;
      case 'saved':
        return <SavedPage />;
      case 'stories':
        return <StoriesPage />;
      case 'about':
        return <AboutPage />;
      case 'login':
        return <LoginPage />;
      case 'signup':
        return <SignupPage />;
      case 'admin':
        return <AdminDashboardPage />;
      case 'home':
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7F8] text-[#071A2B] flex flex-col font-sans selection:bg-[#FF5A1F] selection:text-white pb-16 md:pb-0">
      {/* Global Navbar */}
      <Navbar />

      {/* Main Page View */}
      <main className="flex-1">
        <Suspense
          fallback={
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="w-8 h-8 border-3 border-[#FF5A1F] border-t-transparent rounded-full animate-spin" />
            </div>
          }
        >
          {renderCurrentPage()}
        </Suspense>
      </main>

      {/* Global Interactive Modals */}
      <JoinTripModal />
      <ReserveStayModal />
      <VideoTourModal />
      <SearchModal />
      <ShareModal />
      <WriteStoryModal />
      <WriteReviewModal />
      <AuthModal />

      {/* Toast Alert Popups */}
      <Toast />

      {/* Mobile Bottom Navigation Bar */}
      {currentRoute.page !== 'admin' && <MobileBottomNav />}

      {/* Global Premium Footer */}
      {currentRoute.page !== 'admin' && currentRoute.page !== 'messages' && <Footer />}
    </div>
  );
}
