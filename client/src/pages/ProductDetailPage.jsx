import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { api } from '../api';
import ProductCard from '../components/ProductCard';
import {
  ShieldCheck,
  Zap,
  Lock,
  Minus,
  Plus,
  ShoppingBag,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Mail,
  Clock,
  XCircle,
  AlertTriangle,
  Play,
  Video,
  Film,
  Image as ImageIcon
} from 'lucide-react';
import { getYouTubeEmbedUrl, isDirectVideoUrl, parseProductImages, getYouTubeThumbnailUrl } from '../utils/mediaUtils';

export default function ProductDetailPage() {
  const { currentRoute, navigate, addToCart, setIsCartOpen, requireAuth } = useStore();
  const productIdOrSlug = currentRoute.params?.id || '1';

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeMediaType, setActiveMediaType] = useState('image'); // 'image' | 'video'
  const [quantity, setQuantity] = useState(1);
  const [openAccordion, setOpenAccordion] = useState('delivery');

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const res = await api.getProducts();
        const items = (res && res.products && Array.isArray(res.products)) ? res.products : (Array.isArray(res) ? res : []);
        if (items.length > 0) {
          const match = items.find(p => String(p.id) === String(productIdOrSlug) || p.slug === productIdOrSlug);
          if (match) {
            setProduct(match);
            setSelectedImage(0);
            setActiveMediaType('image');
            setRelatedProducts(items.filter(p => String(p.id) !== String(match.id)).slice(0, 4));
          } else {
            setProduct(items[0]);
            setSelectedImage(0);
            setActiveMediaType('image');
            setRelatedProducts(items.slice(1, 5));
          }
        }
      } catch (err) {
        console.error('Failed to load product:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [productIdOrSlug]);

  if (loading) {
    return (
      <div className="max-w-[1240px] mx-auto px-6 py-24 text-center">
        <div className="w-8 h-8 border-2 border-[#7C4DFF] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs font-semibold text-[#71717A]">Loading product details...</p>
      </div>
    );
  }

  if (!product) return null;

  const rawImages = parseProductImages(product.images);
  const images = rawImages.length > 0
    ? rawImages
    : [
        product.image || '/shopify_assets/hero.png',
        '/shopify_assets/valorant.jpg',
        '/shopify_assets/bgmi.jpg'
      ];

  const hasVideo = Boolean(product.video_url?.trim());
  const ytEmbedUrl = hasVideo ? getYouTubeEmbedUrl(product.video_url) : null;
  const isDirectVideo = hasVideo ? isDirectVideoUrl(product.video_url) : false;
  const ytThumb = hasVideo ? getYouTubeThumbnailUrl(product.video_url) : null;

  const priceNum = Number(product.price) || 0;
  const originalPriceNum = Number(product.original_price || product.compareAtPrice) || 0;
  const isSale = originalPriceNum > priceNum;

  const isOutOfStock = Number(product.stock) <= 0 || product.status === 'out_of_stock';
  const isLowStock = !isOutOfStock && Number(product.stock) <= 5;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(product, quantity, false);
    setIsCartOpen(true);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    addToCart(product, quantity, false);
    requireAuth(() => {
      navigate('checkout');
    });
  };

  return (
    <div className="w-full bg-white text-[#09090B] min-h-screen py-10 lg:py-16">
      <div className="max-w-[1240px] mx-auto px-6">
        
        {/* Breadcrumb */}
        <div className="text-xs uppercase tracking-wider font-semibold text-[#71717A] mb-8 flex items-center gap-2">
          <button onClick={() => navigate('home')} className="hover:text-[#09090B] cursor-pointer">
            Home
          </button>
          <span>/</span>
          <button onClick={() => navigate('games')} className="hover:text-[#09090B] cursor-pointer">
            Games
          </button>
          <span>/</span>
          <span className="text-[#09090B] font-bold truncate max-w-xs">{product.title || product.name}</span>
        </div>

        {/* Main Product Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
          
          {/* Left Column: Media Gallery (Multiple Images & Video Showcase) */}
          <div className="lg:col-span-7 space-y-3.5">
            {/* Media Gallery Controls (when video is attached) */}
            {hasVideo && (
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center p-1 rounded-xl bg-neutral-100 border border-[#E4E4E7] text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setActiveMediaType('image')}
                    className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                      activeMediaType === 'image'
                        ? 'bg-white text-[#09090B] shadow-xs'
                        : 'text-[#71717A] hover:text-[#09090B]'
                    }`}
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Photos ({images.length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveMediaType('video')}
                    className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                      activeMediaType === 'video'
                        ? 'bg-[#7C4DFF] text-white shadow-xs'
                        : 'text-[#71717A] hover:text-[#7C4DFF]'
                    }`}
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Video Showcase</span>
                  </button>
                </div>

                <span className="text-[11px] font-semibold text-[#71717A] hidden sm:inline-flex items-center gap-1 bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-md">
                  <Film className="w-3.5 h-3.5 text-rose-600" />
                  <span>Verified Video Preview</span>
                </span>
              </div>
            )}

            {/* Main Media Viewport */}
            {activeMediaType === 'video' && hasVideo ? (
              <div className="relative w-full aspect-[16/10] bg-black border border-[#E4E4E7] rounded-2xl overflow-hidden shadow-xs">
                {ytEmbedUrl ? (
                  <iframe
                    src={`${ytEmbedUrl}&autoplay=1`}
                    title={product.title || product.name || 'Product Video Showcase'}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : isDirectVideo ? (
                  <video
                    src={product.video_url}
                    controls
                    autoPlay
                    className="w-full h-full object-contain"
                  >
                    Your browser does not support HTML video.
                  </video>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-white">
                    <Video className="w-10 h-10 text-white/50 mb-2" />
                    <p className="text-sm font-bold">External Video Source</p>
                    <a
                      href={product.video_url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 px-4 py-2 rounded-xl bg-[#7C4DFF] text-white text-xs font-bold hover:bg-[#6A3DE8] transition"
                    >
                      Watch Video in New Tab
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <div className="relative w-full aspect-[16/10] bg-neutral-100 border border-[#E4E4E7] rounded-2xl overflow-hidden flex items-center justify-center shadow-xs group">
                <img
                  src={images[selectedImage] || product.image || '/shopify_assets/hero.png'}
                  alt={product.title || product.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-101"
                  onError={(e) => {
                    e.currentTarget.src = '/shopify_assets/hero.png';
                  }}
                />

                {/* Floating "Watch Video" quick button on main image if video is attached */}
                {hasVideo && (
                  <button
                    type="button"
                    onClick={() => setActiveMediaType('video')}
                    className="absolute bottom-3 right-3 z-10 bg-black/80 hover:bg-black text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 backdrop-blur-xs transition shadow-md border border-white/20 cursor-pointer"
                  >
                    <Play className="w-3 h-3 fill-white text-white" />
                    <span>Watch Video Showcase</span>
                  </button>
                )}
              </div>
            )}

            {/* Thumbnail Row (Images + Video Tile) */}
            {(images.length > 1 || hasVideo) && (
              <div className="flex gap-2.5 overflow-x-auto pb-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedImage(idx);
                      setActiveMediaType('image');
                    }}
                    className={`relative w-20 h-14 bg-neutral-100 rounded-xl border shrink-0 overflow-hidden cursor-pointer transition-all ${
                      activeMediaType === 'image' && selectedImage === idx
                        ? 'border-2 border-[#7C4DFF] shadow-xs ring-2 ring-[#7C4DFF]/20 scale-102'
                        : 'border-[#E4E4E7] opacity-75 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                    {idx === 0 && (
                      <span className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[8px] font-bold text-center py-0.5">
                        COVER
                      </span>
                    )}
                  </button>
                ))}

                {/* Video Thumbnail Tile */}
                {hasVideo && (
                  <button
                    type="button"
                    onClick={() => setActiveMediaType('video')}
                    className={`relative w-20 h-14 rounded-xl border shrink-0 overflow-hidden cursor-pointer transition-all bg-neutral-900 flex items-center justify-center ${
                      activeMediaType === 'video'
                        ? 'border-2 border-[#7C4DFF] shadow-xs ring-2 ring-[#7C4DFF]/30 scale-102'
                        : 'border-[#E4E4E7] opacity-80 hover:opacity-100'
                    }`}
                  >
                    {ytThumb ? (
                      <img src={ytThumb} alt="Video thumbnail" className="w-full h-full object-cover opacity-60" />
                    ) : images[0] ? (
                      <img src={images[0]} alt="Video thumbnail" className="w-full h-full object-cover opacity-50" />
                    ) : (
                      <div className="w-full h-full bg-linear-to-br from-purple-900 to-black" />
                    )}
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30">
                      <div className="w-5 h-5 rounded-full bg-[#7C4DFF] text-white flex items-center justify-center shadow-xs">
                        <Play className="w-2.5 h-2.5 fill-white translate-x-0.2" />
                      </div>
                      <span className="text-[8px] font-black text-white uppercase tracking-wider mt-0.5">
                        Video
                      </span>
                    </div>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Details & Buy Actions */}
          <div className="lg:col-span-5 flex flex-col justify-start space-y-6">
            
            {/* Category & Badge */}
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold tracking-widest text-[#7C4DFF] bg-[#F1ECFF] px-2.5 py-1 rounded-md border border-[#7C4DFF]/30">
                {product.category || product.category_name || 'VALORVAULT'}
              </span>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Verified Escrow
              </span>
            </div>

            {/* Product Title */}
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#09090B] tracking-tight leading-tight">
              {product.title || product.name}
            </h1>

            {/* Price Box */}
            <div className="flex items-baseline gap-3 pb-4 border-b border-[#F4F4F5]">
              <span className="font-heading font-extrabold text-2xl sm:text-3xl text-[#09090B]">
                ₹{priceNum.toLocaleString('en-IN')}
              </span>
              {isSale && (
                <span className="text-sm text-[#A1A1AA] line-through font-medium">
                  ₹{originalPriceNum.toLocaleString('en-IN')}
                </span>
              )}
              {isSale && (
                <span className="text-xs font-bold uppercase tracking-wider bg-[#09090B] text-white px-2 py-0.5 rounded-md">
                  Sale
                </span>
              )}
            </div>

            {/* Stock Availability Badges */}
            <div>
              {isOutOfStock ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-bold text-xs shadow-2xs">
                  <XCircle className="w-4 h-4 text-rose-600" />
                  <span>Currently Out of Stock / Depleted Vault</span>
                </div>
              ) : isLowStock ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 font-bold text-xs shadow-2xs">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Hurry! Only {product.stock} units left in stock</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>In Stock & Ready for Instant Delivery</span>
                </div>
              )}
            </div>

            {/* Short Description */}
            <div className="text-[14px] text-[#52525B] leading-relaxed font-sans">
              <p>{product.description || product.short_desc || 'Verified digital gaming item with encrypted credentials release.'}</p>
            </div>

            {/* Quantity Stepper */}
            <div className={`space-y-2 ${isOutOfStock ? 'opacity-40 pointer-events-none' : ''}`}>
              <label className="block text-xs uppercase font-bold tracking-wider text-[#09090B]">
                Quantity
              </label>
              <div className="inline-flex items-center border border-[#E4E4E7] rounded-xl bg-white overflow-hidden">
                <button
                  disabled={isOutOfStock}
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 flex items-center justify-center hover:bg-neutral-100 text-[#09090B] cursor-pointer disabled:cursor-not-allowed"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-12 text-center text-sm font-bold text-[#09090B]">
                  {quantity}
                </span>
                <button
                  disabled={isOutOfStock || quantity >= (Number(product.stock) || 1)}
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 flex items-center justify-center hover:bg-neutral-100 text-[#09090B] cursor-pointer disabled:cursor-not-allowed"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              {isOutOfStock ? (
                <button
                  disabled
                  className="w-full py-4 bg-neutral-100 text-neutral-400 border border-neutral-200 font-bold text-xs uppercase tracking-widest rounded-xl cursor-not-allowed flex items-center justify-center gap-2 select-none"
                >
                  <XCircle className="w-4 h-4 text-neutral-400" />
                  <span>Item Currently Out of Stock</span>
                </button>
              ) : (
                <>
                  <button
                    onClick={handleAddToCart}
                    className="w-full py-3.5 bg-white text-[#09090B] border border-[#E4E4E7] hover:border-[#09090B] font-bold text-xs uppercase tracking-widest rounded-xl transition flex items-center justify-center gap-2 cursor-pointer hover:-translate-y-[1px]"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Cart</span>
                  </button>

                  <button
                    onClick={handleBuyNow}
                    className="w-full py-3.5 bg-[#7C4DFF] hover:bg-[#6D3DF5] text-white font-bold text-xs uppercase tracking-widest rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:-translate-y-[1px]"
                  >
                    <span>Buy It Now</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>

            {/* Accordion Sections */}
            <div className="border-t border-[#F4F4F5] divide-y divide-[#F4F4F5] pt-2 text-xs">
              
              {/* Delivery Policy Accordion */}
              <div>
                <button
                  onClick={() => setOpenAccordion(openAccordion === 'delivery' ? '' : 'delivery')}
                  className="w-full py-4 flex items-center justify-between text-left font-bold uppercase tracking-wider text-[#09090B] cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#7C4DFF]" />
                    Digital Delivery Policy
                  </span>
                  {openAccordion === 'delivery' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {openAccordion === 'delivery' && (
                  <div className="pb-4 text-[#52525B] leading-relaxed font-sans space-y-2">
                    <p>• All products sold on ValorVault are delivered digitally.</p>
                    <p>• <strong>Instant to 30 minutes</strong> for automated verified accounts & codes.</p>
                    <p>• Delivered via your Customer Dashboard Vault and confirmed by email.</p>
                    <p>• Protected by our manual 24/7 UPI escrow guarantee.</p>
                  </div>
                )}
              </div>

              {/* Payment Accordion */}
              <div>
                <button
                  onClick={() => setOpenAccordion(openAccordion === 'payment' ? '' : 'payment')}
                  className="w-full py-4 flex items-center justify-between text-left font-bold uppercase tracking-wider text-[#09090B] cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    UPI & Escrow Verification
                  </span>
                  {openAccordion === 'payment' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {openAccordion === 'payment' && (
                  <div className="pb-4 text-[#52525B] leading-relaxed font-sans space-y-2">
                    <p>• Pay securely using any UPI app (GPay, PhonePe, Paytm, BHIM) or Direct Bank Transfer.</p>
                    <p>• Submit your 12-digit UTR transaction ID upon payment.</p>
                    <p>• Our team verifies the transaction within minutes and automatically unseals your credentials in your private vault.</p>
                  </div>
                )}
              </div>

            </div>

          </div>

        </div>

        {/* Related Products Grid */}
        {relatedProducts.length > 0 && (
          <div className="mt-20 pt-12 border-t border-[#E4E4E7]">
            <h2 className="font-heading font-extrabold text-2xl uppercase tracking-tight text-[#09090B] mb-8">
              You May Also Like
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
