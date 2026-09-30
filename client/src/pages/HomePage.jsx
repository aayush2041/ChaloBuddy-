import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import ProductCard from '../components/ProductCard';
import {
  ShieldCheck,
  Zap,
  Lock,
  Headphones,
  CheckCircle2,
  Play,
  ArrowRight,
  Sparkles,
  ChevronRight
} from 'lucide-react';

export default function HomePage() {
  const { products, navigate } = useStore();
  const [selectedGame, setSelectedGame] = useState('all');
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  const games = [
    {
      id: 'valorant',
      name: 'VALORANT',
      slug: 'valorant',
      image: '/shopify_assets/logo_valorant.svg',
      category: 'Valorant'
    },
    {
      id: 'bgmi',
      name: 'BGMI',
      slug: 'bgmi',
      image: '/shopify_assets/logo_bgmi.png',
      category: 'BGMI'
    },
    {
      id: 'youtube',
      name: 'YOUTUBE',
      slug: 'youtube',
      image: '/shopify_assets/logo_youtube.svg',
      category: 'YouTube'
    },
    {
      id: 'pubg',
      name: 'PUBG MOBILE',
      slug: 'pubg',
      image: '/shopify_assets/logo_pubg.svg',
      category: 'PUBG'
    },
    {
      id: 'freefire',
      name: 'FREE FIRE',
      slug: 'freefire',
      image: '/shopify_assets/logo_freefire.png',
      category: 'Free Fire'
    }
  ];

  const steps = [
    {
      step: '01',
      title: 'CHOOSE YOUR ACCOUNT',
      desc: 'Browse our verified gaming accounts and select the perfect one with full inventory details.'
    },
    {
      step: '02',
      title: 'SECURE CHECKOUT',
      desc: 'Complete your purchase instantly via secure UPI QR code or bank transfer with automated escrow lock.'
    },
    {
      step: '03',
      title: 'RECEIVE LOGIN DETAILS',
      desc: 'Get instant access to your account credentials directly in your encrypted digital customer vault.'
    },
    {
      step: '04',
      title: 'SECURE & ENJOY',
      desc: 'Verify the credentials, update the login security details, and jump straight into ranked games.'
    }
  ];

  const trustBadges = [
    { icon: Zap, label: 'INSTANT DELIVERY' },
    { icon: Lock, label: 'SECURE CHECKOUT' },
    { icon: Headphones, label: '24/7 SUPPORT' },
    { icon: CheckCircle2, label: 'VERIFIED SELLERS' },
    { icon: ShieldCheck, label: 'FAST DIGITAL DELIVERY' }
  ];

  const productList = Array.isArray(products) ? products : [];
  const filteredProducts = selectedGame === 'all'
    ? productList
    : productList.filter(p => {
        const cat = (p.category || p.category_name || p.category_slug || '').toLowerCase();
        return cat.includes(selectedGame.toLowerCase());
      });

  return (
    <div className="w-full bg-white text-[#09090B] min-h-screen">
      
      {/* ==================================================
          1. HERO SECTION (Responsive across mobile, tablet, desktop)
          ================================================== */}
      <section className="relative w-full min-h-[440px] sm:min-h-[480px] lg:h-[520px] bg-white overflow-hidden flex items-center">
        {/* Right Artwork Container with Seamless Fade */}
        <div className="absolute inset-y-0 right-0 w-full lg:w-[60%] z-0 overflow-hidden pointer-events-none">
          <picture>
            <source srcSet="/shopify_assets/hero.webp" type="image/webp" />
            <img
              src="/shopify_assets/hero.png"
              alt="Hero Artwork"
              fetchPriority="high"
              loading="eager"
              decoding="async"
              className="w-full h-full object-cover object-right-top opacity-90 sm:opacity-95"
            />
          </picture>
          {/* Subtle horizontal mask that keeps the left clean for text while integrating character */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(to right, #FFFFFF 0%, rgba(255, 255, 255, 0.95) 25%, rgba(255, 255, 255, 0.7) 48%, rgba(255, 255, 255, 0.05) 78%, transparent 100%)'
            }}
          />
          {/* Bottom fade that seamlessly dissolves artwork into the white background */}
          <div
            className="absolute inset-x-0 bottom-0 h-24 sm:h-28 pointer-events-none"
            style={{
              background: 'linear-gradient(to bottom, transparent 0%, rgba(255, 255, 255, 0.6) 40%, #FFFFFF 100%)'
            }}
          />
          {/* Mobile contrast veil so text is 100% crisp regardless of screen width */}
          <div
            className="absolute inset-0 sm:hidden pointer-events-none"
            style={{
              background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.94) 0%, rgba(255, 255, 255, 0.88) 55%, #FFFFFF 100%)'
            }}
          />
        </div>

        {/* Global Container max-w-[1240px] px-4 sm:px-6 */}
        <div className="relative z-10 max-w-[1240px] mx-auto px-4 sm:px-6 w-full flex items-center">
          <div className="w-full lg:w-[48%] flex flex-col items-start justify-center py-8 sm:py-10 lg:py-0">
            
            {/* Small Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold tracking-wide uppercase bg-[#F1ECFF] text-[#7C4DFF] border border-[#7C4DFF]/30 mb-4 sm:mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#7C4DFF] animate-pulse" />
              <span>⚡ #1 Rated Gaming Escrow Marketplace</span>
            </div>

            {/* Hero Heading */}
            <h1 className="font-heading font-extrabold text-[32px] xs:text-4xl sm:text-5xl lg:text-[62px] text-[#09090B] tracking-[-0.035em] leading-[1.04] sm:leading-[0.98] uppercase max-w-[700px]">
              BUY. SELL. PLAY.
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7C4DFF] to-[#8B5CF6]">
                ALL IN ONE PLACE.
              </span>
            </h1>

            {/* Description */}
            <p className="text-[14px] sm:text-[16px] text-[#52525B] leading-[1.5] max-w-lg mt-3 sm:mt-4 font-sans">
              The trusted digital marketplace for gamers. Buy and sell verified Valorant, BGMI, and YouTube accounts with automated escrow protection.
            </p>

            {/* Hero CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-5 sm:mt-7 w-full sm:w-auto">
              <button
                onClick={() => navigate('games')}
                className="w-full sm:w-auto px-7 py-3 bg-[#7C4DFF] hover:bg-[#6D3DF5] text-white font-bold text-sm tracking-wide rounded-xl shadow-[0_4px_14px_rgba(124,77,255,0.3)] transition-all duration-200 hover:-translate-y-[1px] cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Explore Market</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => navigate('process')}
                className="w-full sm:w-auto px-7 py-3 bg-white hover:bg-neutral-50 text-[#09090B] border border-[#E4E4E7] hover:border-[#09090B] font-bold text-sm tracking-wide rounded-xl transition-all duration-200 hover:-translate-y-[1px] cursor-pointer text-center"
              >
                Process & Escrow
              </button>
            </div>

          </div>
        </div>
      </section>


      {/* ==================================================
          2. TRUST / FEATURE CARDS
          Mobile: 2 cols with centered 5th badge
          Tablet: 3 cols | Desktop: 5 cols
          ================================================== */}
      <section className="w-full pt-2 pb-6 lg:pt-3 lg:pb-8 bg-white">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-4">
            {trustBadges.map((badge, idx) => {
              const Icon = badge.icon;
              const isLast = idx === 4;
              return (
                <div
                  key={idx}
                  className={`h-[95px] sm:h-[105px] bg-white border border-[#E4E4E7] hover:border-[#7C4DFF]/40 rounded-2xl p-2.5 sm:p-3 flex flex-col items-center justify-center text-center shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_20px_rgba(124,77,255,0.06)] hover:-translate-y-[2px] transition-all duration-200 ${
                    isLast ? 'col-span-2 sm:col-span-1 max-w-[220px] sm:max-w-none mx-auto w-full' : ''
                  }`}
                >
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#F1ECFF] text-[#7C4DFF] flex items-center justify-center shrink-0">
                    <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={2} />
                  </div>
                  <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-[#09090B] mt-2 leading-tight">
                    {badge.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>


      {/* ==================================================
          3. BROWSE BY GAME
          Mobile: touch-inertia snap scroll
          Desktop: 5 grid columns
          ================================================== */}
      <section className="w-full py-8 lg:py-10 bg-white">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
          
          {/* Section Header */}
          <div className="flex items-center justify-between gap-3 sm:gap-4">
            <div>
              <h2 className="font-heading font-extrabold text-2xl sm:text-3xl lg:text-[32px] text-[#09090B] uppercase tracking-[-0.025em] leading-none">
                BROWSE BY GAME
              </h2>
              <p className="text-[13px] sm:text-[14px] text-[#52525B] mt-1 sm:mt-1.5 font-sans">
                Explore verified listings by platform.
              </p>
            </div>

            <button
              onClick={() => navigate('games')}
              className="text-[12px] sm:text-[13px] font-bold uppercase tracking-wider text-[#7C4DFF] hover:text-[#6D3DF5] flex items-center gap-1 transition-colors cursor-pointer group shrink-0"
            >
              <span>VIEW ALL</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 ease-out group-hover:translate-x-[3px]" />
            </button>
          </div>

          {/* Cards Grid / Snap Scroll */}
          <div className="flex sm:grid sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mt-5 lg:mt-6 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory touch-pan-x pb-2 sm:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0">
            {games.map((game) => (
              <div
                key={game.id}
                onClick={() => {
                  setSelectedGame(game.slug);
                  navigate('games', { category: game.category });
                }}
                className="w-[155px] sm:w-auto h-[148px] sm:h-[160px] shrink-0 snap-start bg-white border border-[#E4E4E7] hover:border-[#7C4DFF]/50 rounded-2xl p-3 sm:p-4 flex flex-col items-center justify-center text-center cursor-pointer select-none group transition-all duration-200 ease-out hover:-translate-y-[2px] shadow-[0_2px_10px_rgba(0,0,0,0.025)] hover:shadow-[0_10px_25px_rgba(124,77,255,0.08)]"
              >
                {/* Logo Container */}
                <div className="w-[136px] sm:w-[146px] h-[70px] sm:h-[74px] rounded-xl bg-[#F8F8FA] border border-[#EEEEF2] flex items-center justify-center p-2.5 shrink-0 group-hover:border-[#D8D0FF] group-hover:bg-[#F5F2FF]/40 transition-colors">
                  <img
                    src={game.image}
                    alt={game.name}
                    className="max-h-[44px] sm:max-h-[46px] max-w-[110px] sm:max-w-[118px] w-auto h-auto object-contain transition-transform duration-200 ease-out group-hover:scale-105"
                    loading="lazy"
                  />
                </div>

                {/* Game Name */}
                <h3 className="font-heading font-bold text-[13px] sm:text-[14px] text-[#18181B] group-hover:text-[#7C4DFF] uppercase tracking-wide transition-colors mt-2.5 text-center leading-snug">
                  {game.name}
                </h3>
              </div>
            ))}
          </div>

        </div>
      </section>


      {/* ==================================================
          4. PRODUCTS SECTION
          Responsive grid & horizontal scrollable filter tabs on mobile
          ================================================== */}
      <section className="w-full py-8 lg:py-10 bg-white">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-5 sm:mb-7 gap-3 sm:gap-4">
            <div>
              <h2 className="font-heading font-extrabold text-2xl sm:text-3xl lg:text-[32px] text-[#09090B] uppercase tracking-[-0.025em] leading-[1.1]">
                PRODUCTS
              </h2>
              <p className="text-[13px] sm:text-[14px] text-[#52525B] mt-1 sm:mt-1.5">
                Verified digital gaming assets with instant encrypted delivery
              </p>
            </div>

            {/* Filter Tabs: Horizontal scroll on mobile, flex-wrap on desktop */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
              {[
                { id: 'all', label: 'All Products' },
                { id: 'valorant', label: 'Valorant' },
                { id: 'bgmi', label: 'BGMI' },
                { id: 'youtube', label: 'YouTube' },
                { id: 'pubg', label: 'PUBG' },
                { id: 'freefire', label: 'Free Fire' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedGame(tab.id)}
                  className={`text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-xl transition-all duration-150 cursor-pointer shrink-0 ${
                    selectedGame === tab.id
                      ? 'bg-[#7C4DFF] text-white shadow-xs'
                      : 'bg-white text-[#52525B] border border-[#E4E4E7] hover:border-[#09090B] hover:text-[#09090B]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Product Grid: 1 col on mobile, 2 on tablet, 4 on desktop */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {filteredProducts.slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* View All Games CTA */}
          <div className="mt-7 text-center">
            <button
              onClick={() => navigate('games')}
              className="w-full sm:w-auto px-7 py-3 bg-white hover:bg-neutral-50 text-[#09090B] border border-[#E4E4E7] hover:border-[#09090B] font-bold text-xs uppercase tracking-widest rounded-xl transition-all duration-200 hover:-translate-y-[1px] cursor-pointer inline-flex items-center justify-center gap-2 shadow-xs"
            >
              <span>View All Games</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </section>


      {/* ==================================================
          5. HOW TO BUY SECTION
          Fluid card heights, responsive columns
          ================================================== */}
      <section className="w-full py-8 lg:py-10 bg-white">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
          
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-7">
            <h2 className="font-heading font-extrabold text-2xl sm:text-3xl lg:text-[32px] text-[#09090B] uppercase tracking-[-0.025em] leading-[1.1]">
              HOW TO BUY
            </h2>
            <p className="text-[13px] sm:text-[14px] text-[#52525B] mt-1 sm:mt-1.5">
              Purchase your gaming account in just 4 simple, escrow-protected steps.
            </p>
          </div>

          {/* 4 Process Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {steps.map((item) => (
              <div
                key={item.step}
                className="min-h-[185px] sm:min-h-[195px] h-auto bg-white border border-[#E7E7E7] hover:border-[#7C4DFF]/40 rounded-2xl p-5 sm:p-6 text-center shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-[0_10px_25px_-5px_rgba(0,0,0,0.06)] hover:-translate-y-[2px] transition-all duration-200 ease-out flex flex-col items-center justify-center"
              >
                {/* Number circle */}
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-extrabold text-sm mb-3 shadow-sm bg-gradient-to-br from-[#7C4DFF] to-[#8B5CF6]">
                  {item.step}
                </div>

                {/* Title */}
                <h3 className="font-heading font-bold text-[15px] sm:text-[16px] text-[#09090B] uppercase tracking-tight mb-1.5">
                  {item.title}
                </h3>

                {/* Description */}
                <p className="text-[13px] text-[#52525B] leading-[1.45] font-sans">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>


      {/* ==================================================
          6. VIDEO SECTION
          Aspect ratio: 16:9 on mobile, 16:7 on desktop
          ================================================== */}
      <section className="w-full py-8 lg:py-10 bg-white">
        <div className="max-w-[1100px] mx-auto px-4 sm:px-6">
          
          <div className="text-center mb-5 sm:mb-6">
            <h2 className="font-heading font-extrabold text-2xl sm:text-3xl lg:text-[32px] text-[#09090B] uppercase tracking-[-0.025em] leading-[1.1]">
              WATCH THE COMPLETE BUYING PROCESS
            </h2>
            <p className="text-[13px] sm:text-[14px] text-[#52525B] mt-1 sm:mt-1.5">
              See how easy it is to purchase, verify, and access your gaming account in minutes.
            </p>
          </div>

          {/* Responsive Video Container */}
          <div
            onClick={() => setIsVideoModalOpen(true)}
            className="w-full aspect-[16/9] sm:aspect-[16/7] rounded-[16px] sm:rounded-[20px] overflow-hidden shadow-lg border border-[#E4E4E7] bg-neutral-950 relative flex items-center justify-center group cursor-pointer"
          >
            {/* Background Artwork */}
            <picture>
              <source srcSet="/shopify_assets/hero.webp" type="image/webp" />
              <img
                src="/shopify_assets/hero.png"
                alt="ValorVault Process walkthrough"
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover opacity-60 group-hover:scale-103 transition-transform duration-500 ease-out"
              />
            </picture>
            
            {/* Darker Overlay */}
            <div className="absolute inset-0 bg-black/55 backdrop-blur-[1px]" />

            {/* Play Button with Purple Gradient */}
            <div className="relative z-10 w-13 h-13 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-white shadow-2xl group-hover:scale-108 transition-transform duration-200 bg-gradient-to-tr from-[#7C4DFF] to-[#8B5CF6]">
              <Play className="w-5 h-5 sm:w-7 sm:h-7 fill-white ml-0.5 sm:ml-1" />
            </div>

            {/* Bottom Caption */}
            <div className="absolute bottom-3 sm:bottom-4 inset-x-0 text-center z-10 px-3 sm:px-4">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-white bg-black/60 backdrop-blur-md px-3 sm:px-4 py-1 sm:py-1.5 rounded-full border border-white/20 shadow-sm">
                Interactive Video Walkthrough & Escrow Demonstration
              </span>
            </div>
          </div>

        </div>
      </section>


      {/* ==================================================
          7. SHOP NOW MARQUEE BAR
          Responsive text size & padding
          ================================================== */}
      <section
        onClick={() => navigate('games')}
        className="w-full bg-[#09090B] text-white py-3.5 sm:py-5 overflow-hidden cursor-pointer select-none border-y border-neutral-800 hover:bg-[#18181B] transition-colors"
      >
        <div className="animate-marquee whitespace-nowrap flex items-center gap-6 sm:gap-12 font-heading font-extrabold text-xl sm:text-3xl lg:text-4xl uppercase tracking-wider">
          {[...Array(12)].map((_, i) => (
            <span key={i} className="flex items-center gap-5 sm:gap-8">
              <span>SHOP NOW</span>
              <span className="text-[#8B5CF6] text-lg sm:text-xl">•</span>
            </span>
          ))}
        </div>
      </section>


      {/* Video Modal Walkthrough */}
      {isVideoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-2xl bg-white border border-[#E4E4E7] rounded-2xl shadow-2xl p-6 sm:p-8">
            <div className="flex justify-between items-center pb-4 border-b border-[#F4F4F5] mb-5">
              <div>
                <h3 className="font-heading font-bold text-lg text-[#09090B] uppercase">
                  ValorVault Purchase Workflow
                </h3>
                <p className="text-xs text-[#71717A] mt-0.5">
                  Instant escrow verification & encrypted credentials release
                </p>
              </div>
              <button
                onClick={() => setIsVideoModalOpen(false)}
                className="text-[#71717A] hover:text-[#09090B] font-bold text-sm p-1 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                ✕ Close
              </button>
            </div>
            
            <div className="space-y-3.5">
              <div className="p-4 bg-[#FBFBFC] border border-[#E4E4E7] rounded-xl flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-[#F1ECFF] text-[#7C4DFF] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <h4 className="font-bold text-[#09090B] text-sm">Select Your Digital Asset</h4>
                  <p className="text-xs text-[#52525B] mt-0.5">Browse audited Valorant accounts, BGMI profiles, or YouTube channels with verified inventory and stats.</p>
                </div>
              </div>

              <div className="p-4 bg-[#FBFBFC] border border-[#E4E4E7] rounded-xl flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-[#F1ECFF] text-[#7C4DFF] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <h4 className="font-bold text-[#09090B] text-sm">Instant UPI QR Payment</h4>
                  <p className="text-xs text-[#52525B] mt-0.5">Scan via PhonePe, Google Pay, Paytm, or BHIM. Enter your 12-digit UTR for automatic escrow lock.</p>
                </div>
              </div>

              <div className="p-4 bg-[#FBFBFC] border border-[#E4E4E7] rounded-xl flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-[#F1ECFF] text-[#7C4DFF] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <h4 className="font-bold text-[#09090B] text-sm">Instant Vault Unlocking</h4>
                  <p className="text-xs text-[#52525B] mt-0.5">Credentials and original recovery info are released instantly to your customer vault and registered email.</p>
                </div>
              </div>

              <button
                onClick={() => {
                  setIsVideoModalOpen(false);
                  navigate('games');
                }}
                className="w-full mt-4 py-3.5 bg-[#7C4DFF] hover:bg-[#6D3DF5] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-xs transition-all duration-150 hover:-translate-y-[1px] cursor-pointer"
              >
                Start Browsing Verified Games
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
