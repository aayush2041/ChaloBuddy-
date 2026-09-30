import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { api } from '../api';
import ProductCard from '../components/ProductCard';
import {
  Filter,
  Search,
  X,
  ChevronDown,
  RotateCcw,
  ShieldCheck,
  Check
} from 'lucide-react';

export default function CatalogPage() {
  const { currentRoute, navigate } = useStore();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  // Filters
  const initialCategory = currentRoute.params?.category || 'all';
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState(currentRoute.params?.search || '');
  const [sortBy, setSortBy] = useState('featured');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [maxPrice, setMaxPrice] = useState(50000);

  const categories = [
    { label: 'All', value: 'all' },
    { label: 'Valorant', value: 'valorant' },
    { label: 'BGMI', value: 'bgmi' },
    { label: 'YouTube', value: 'youtube' },
    { label: 'PUBG Mobile', value: 'pubg' },
    { label: 'Free Fire', value: 'freefire' }
  ];

  useEffect(() => {
    if (currentRoute.params?.category) {
      setSelectedCategory(currentRoute.params.category.toLowerCase());
    }
    if (currentRoute.params?.search) {
      setSearchQuery(currentRoute.params.search);
    }
  }, [currentRoute.params]);

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        const data = await api.getProducts();
        if (data && data.products && Array.isArray(data.products)) {
          setProducts(data.products);
        } else if (Array.isArray(data)) {
          setProducts(data);
        } else {
          setProducts([]);
        }
      } catch (err) {
        console.error('Failed to load products:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  // Filter & Sort Logic
  const filteredProducts = products.filter((p) => {
    // Category match
    if (selectedCategory !== 'all') {
      const cat = (p.category || p.category_name || p.category_slug || '').toLowerCase();
      if (!cat.includes(selectedCategory.toLowerCase())) {
        return false;
      }
    }

    // Search query match
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = (p.title || p.name || '').toLowerCase().includes(q);
      const matchCat = (p.category || p.category_name || '').toLowerCase().includes(q);
      const matchDesc = (p.description || p.short_desc || '').toLowerCase().includes(q);
      if (!matchTitle && !matchCat && !matchDesc) return false;
    }

    // In Stock filter
    if (inStockOnly && p.stock !== undefined && p.stock <= 0) {
      return false;
    }

    // Max Price
    if (p.price && Number(p.price) > maxPrice) {
      return false;
    }

    return true;
  });

  // Sort
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-low') {
      return Number(a.price) - Number(b.price);
    } else if (sortBy === 'price-high') {
      return Number(b.price) - Number(a.price);
    } else if (sortBy === 'title-asc') {
      return (a.title || a.name || '').localeCompare(b.title || b.name || '');
    } else if (sortBy === 'title-desc') {
      return (b.title || b.name || '').localeCompare(a.title || a.name || '');
    }
    return 0; // 'featured'
  });

  const clearFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
    setSortBy('featured');
    setInStockOnly(false);
    setMaxPrice(50000);
  };

  const hasActiveFilters = selectedCategory !== 'all' || searchQuery.trim() !== '' || inStockOnly || maxPrice < 50000;

  return (
    <div className="w-full bg-white text-[#09090B] min-h-screen py-10 lg:py-16">
      {/* Global container max-w-[1240px] px-6 */}
      <div className="max-w-[1240px] mx-auto px-6">
        
        {/* Title Bar */}
        <div className="border-b border-[#E4E4E7] pb-6 mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="font-heading font-extrabold text-3xl sm:text-4xl uppercase tracking-[-0.025em] text-[#09090B] leading-[1.1]">
              Games & Inventory
            </h1>
            <p className="text-[15px] text-[#52525B] mt-2">
              {sortedProducts.length} {sortedProducts.length === 1 ? 'verified item' : 'verified items'} available with instant escrow protection
            </p>
          </div>

          {/* Search inside catalog */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-[#71717A]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, skin, rank..."
              className="w-full pl-10 pr-9 py-2.5 text-xs text-[#09090B] border border-[#E4E4E7] focus:border-[#7C4DFF] rounded-xl outline-none font-sans bg-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-[#71717A] hover:text-[#09090B] cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Filters and Sort Controls Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 mb-8 border-b border-[#F4F4F5]">
          
          {/* Game Category Pill Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-xl transition-all duration-150 cursor-pointer ${
                  selectedCategory === cat.value
                    ? 'bg-[#7C4DFF] text-white shadow-xs'
                    : 'bg-white text-[#52525B] border border-[#E4E4E7] hover:border-[#09090B] hover:text-[#09090B]'
                }`}
              >
                {cat.label}
              </button>
            ))}

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-xs text-[#7C4DFF] hover:underline font-semibold ml-2 cursor-pointer"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Sort Dropdown & More Filters */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold">
              <span className="text-[#71717A] uppercase tracking-wider text-[11px]">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3.5 py-2 border border-[#E4E4E7] focus:border-[#7C4DFF] rounded-xl text-xs font-bold uppercase bg-white text-[#09090B] outline-none cursor-pointer"
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="title-asc">Alphabetically, A-Z</option>
                <option value="title-desc">Alphabetically, Z-A</option>
              </select>
            </div>

            <button
              onClick={() => setFilterDrawerOpen(!filterDrawerOpen)}
              className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-3.5 py-2 border border-[#E4E4E7] hover:border-[#09090B] rounded-xl transition cursor-pointer bg-white"
            >
              <Filter className="w-3.5 h-3.5 text-[#7C4DFF]" />
              <span>Filters</span>
            </button>
          </div>
        </div>

        {/* Collapsible Filter Drawer */}
        {filterDrawerOpen && (
          <div className="p-5 sm:p-6 bg-white border border-[#E4E4E7] rounded-2xl mb-8 shadow-xs animate-in fade-in duration-150">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {/* Max Price Filter */}
              <div>
                <label className="block text-xs uppercase font-bold tracking-wider mb-2 text-[#09090B]">
                  Max Price: ₹{maxPrice.toLocaleString('en-IN')}
                </label>
                <input
                  type="range"
                  min="500"
                  max="100000"
                  step="500"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-[#7C4DFF] cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-[#71717A] mt-1 font-mono">
                  <span>₹500</span>
                  <span>₹1,00,000</span>
                </div>
              </div>

              {/* In Stock Toggle */}
              <div className="flex items-center">
                <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider cursor-pointer text-[#09090B]">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="w-4 h-4 accent-[#7C4DFF] rounded"
                  />
                  <span>In Stock Only</span>
                </label>
              </div>

              {/* Reset */}
              <div className="flex items-center">
                <button
                  onClick={clearFilters}
                  className="text-xs uppercase font-bold tracking-wider text-[#09090B] border border-[#E4E4E7] hover:border-[#09090B] px-4 py-2 rounded-xl hover:bg-neutral-100 transition cursor-pointer"
                >
                  Reset All Filters
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Products Grid: 4 cards per row, 20px gap */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-[16/10] bg-neutral-100 animate-pulse border border-[#E4E4E7] rounded-2xl" />
            ))}
          </div>
        ) : sortedProducts.length === 0 ? (
          <div className="py-20 text-center border border-dashed border-[#E4E4E7] rounded-2xl p-8">
            <h3 className="font-heading font-bold text-xl uppercase text-[#09090B] mb-2">
              No products found
            </h3>
            <p className="text-xs text-[#52525B] mb-6">
              We couldn't find any products matching your current filters.
            </p>
            <button
              onClick={clearFilters}
              className="px-6 py-2.5 bg-[#7C4DFF] hover:bg-[#6D3DF5] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition cursor-pointer"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {sortedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
