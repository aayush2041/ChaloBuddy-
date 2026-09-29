import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../context/StoreContext';
import { Search, X, ArrowRight, ShieldCheck } from 'lucide-react';

export default function SearchModal({ isOpen, onClose }) {
  const { products, navigate } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setSearchTerm('');
    }
  }, [isOpen]);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else onClose(true); // Toggle
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const productList = Array.isArray(products) ? products : [];
  const filteredProducts = searchTerm.trim()
    ? productList.filter(p => {
        const title = (p.title || p.name || '').toLowerCase();
        const cat = (p.category || p.category_name || '').toLowerCase();
        const term = searchTerm.toLowerCase();
        return title.includes(term) || cat.includes(term);
      })
    : [];

  const handleSelectProduct = (product) => {
    onClose();
    navigate('product', { id: product.id });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      onClose();
      navigate('catalog', { search: searchTerm.trim() });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/60 backdrop-blur-xs">
      {/* Click outside backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-white border border-black shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <form onSubmit={handleSearchSubmit} className="flex items-center border-b border-black px-4 py-3">
          <Search className="w-5 h-5 text-black shrink-0 mr-3" strokeWidth={1.75} />
          <input
            ref={inputRef}
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search accounts, skins, games..."
            className="w-full bg-transparent text-black text-base outline-none placeholder:text-neutral-500 font-sans"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="text-neutral-500 hover:text-black p-1 mr-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="text-xs uppercase tracking-wider font-bold border border-neutral-300 px-2 py-1 hover:border-black transition"
          >
            ESC
          </button>
        </form>

        {/* Results Area */}
        <div className="max-h-[60vh] overflow-y-auto p-4">
          {searchTerm.trim() ? (
            <div>
              <div className="flex items-center justify-between text-xs uppercase tracking-wider text-neutral-500 font-semibold mb-3">
                <span>Products ({filteredProducts.length})</span>
                {filteredProducts.length > 0 && (
                  <button
                    onClick={handleSearchSubmit}
                    className="text-black hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    View all results <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>

              {filteredProducts.length === 0 ? (
                <div className="py-12 text-center text-neutral-500">
                  <p className="font-medium text-black">No products found for "{searchTerm}"</p>
                  <p className="text-xs mt-1">Try searching for Valorant, BGMI, Youtube, or skin names</p>
                </div>
              ) : (
                <div className="divide-y divide-neutral-100">
                  {filteredProducts.slice(0, 6).map((product) => (
                    <div
                      key={product.id}
                      onClick={() => handleSelectProduct(product)}
                      className="flex items-center gap-4 py-3 px-2 hover:bg-neutral-50 cursor-pointer transition"
                    >
                      <div className="w-14 h-14 bg-neutral-100 shrink-0 border border-neutral-200 overflow-hidden flex items-center justify-center">
                        <img
                          src={product.image || (product.images && product.images[0]) || '/shopify_assets/hero.png'}
                          alt={product.title || product.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = '/shopify_assets/hero.png';
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-neutral-100 text-neutral-800 px-1.5 py-0.5 border border-neutral-200">
                            {product.category || product.category_name || 'Item'}
                          </span>
                          <span className="text-[10px] text-emerald-600 flex items-center gap-0.5 font-medium">
                            <ShieldCheck className="w-3 h-3" /> Instant
                          </span>
                        </div>
                        <h4 className="text-sm font-semibold text-black truncate mt-0.5">
                          {product.title || product.name}
                        </h4>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-sm font-bold text-black font-sans">
                          Rs. {Number(product.price).toFixed(2)}
                        </div>
                        {product.compareAtPrice && product.compareAtPrice > product.price && (
                          <div className="text-xs text-neutral-400 line-through">
                            Rs. {Number(product.compareAtPrice).toFixed(2)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="py-6">
              <div className="text-xs uppercase tracking-wider text-neutral-500 font-bold mb-3">
                Popular Categories
              </div>
              <div className="flex flex-wrap gap-2">
                {['Valorant', 'BGMI', 'YouTube', 'PUBG Mobile', 'Free Fire'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      onClose();
                      navigate('catalog', { category: cat });
                    }}
                    className="text-xs font-semibold px-3 py-1.5 border border-neutral-200 hover:border-black transition cursor-pointer"
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
