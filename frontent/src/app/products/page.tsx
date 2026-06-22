'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'motion/react';
import apiClient from '@/lib/axios';
import { useDebounce } from '@/hooks/use-debounce';
import { ProductCard, ProductCardSkeleton } from '@/components/shared/ProductCard';
import {
  Search, SlidersHorizontal, Star, Trash2, ChevronLeft,
  ChevronRight, Inbox, LayoutGrid, LayoutList, RefreshCw,
  Tag, Laptop, Headphones, Watch, Dumbbell, Smartphone, X
} from 'lucide-react';

interface ProductData {
  _id: string;
  name: string;
  price: number;
  category: string;
  stock?: number;
  ratings: { average: number; count: number };
  images: string[];
  description?: string;
}

interface FetchResponse {
  success: boolean;
  data: ProductData[];
  pagination: { page: number; limit: number; total: number; pages: number };
}

const CATEGORIES = [
  { label: 'All',         value: '',            icon: <Tag className="h-3.5 w-3.5" /> },
  { label: 'Electronics', value: 'Electronics', icon: <Laptop className="h-3.5 w-3.5" /> },
  { label: 'Audio',       value: 'Audio',       icon: <Headphones className="h-3.5 w-3.5" /> },
  { label: 'Accessories', value: 'Accessories', icon: <Watch className="h-3.5 w-3.5" /> },
  { label: 'Fitness',     value: 'Fitness',     icon: <Dumbbell className="h-3.5 w-3.5" /> },
  { label: 'Mobile',      value: 'Mobile',      icon: <Smartphone className="h-3.5 w-3.5" /> },
];

const SORT_OPTIONS = [
  { label: 'Newest First',     value: 'createdAt-desc' },
  { label: 'Price: Low → High', value: 'price-asc' },
  { label: 'Price: High → Low', value: 'price-desc' },
  { label: 'Top Rated',         value: 'ratings-desc' },
];

export default function ProductsPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [rating, setRating] = useState<number | null>(null);
  const [sort, setSort] = useState('createdAt-desc');
  const [page, setPage] = useState(1);
  const [gridCols, setGridCols] = useState<3 | 2>(3);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const debouncedSearch = useDebounce(search, 500);

  React.useEffect(() => { setPage(1); }, [debouncedSearch, category, minPrice, maxPrice, rating, sort]);

  const sortParts = sort.split('-');
  const sortBy = sortParts[0] === 'ratings' ? 'ratings.average' : sortParts[0];
  const sortOrder = sortParts[sortParts.length - 1];

  const { data, isLoading, isError, refetch } = useQuery<FetchResponse>({
    queryKey: ['products', { search: debouncedSearch, category, minPrice, maxPrice, rating, sort, page }],
    queryFn: async () => {
      const res = await apiClient.get('/products', {
        params: {
          search: debouncedSearch || undefined,
          category: category || undefined,
          minPrice: minPrice || undefined,
          maxPrice: maxPrice || undefined,
          rating: rating ?? undefined,
          sortBy,
          sortOrder,
          page,
          limit: gridCols === 3 ? 9 : 6,
        }
      });
      return res.data;
    },
    placeholderData: (prev) => prev,
  });

  const hasFilters = !!(search || category || minPrice || maxPrice || rating);

  const resetFilters = () => {
    setSearch(''); setCategory(''); setMinPrice('');
    setMaxPrice(''); setRating(null); setSort('createdAt-desc'); setPage(1);
  };

  const handlePriceChange = (type: 'min' | 'max', val: string) => {
    if (val === '' || /^\d*\.?\d*$/.test(val)) {
      type === 'min' ? setMinPrice(val) : setMaxPrice(val);
    }
  };

  // ── Filter Sidebar Content ───────────────────────────────────────────────
  const FilterContent = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-[#4F46E5]" />
          <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Filters</span>
          {hasFilters && (
            <span className="h-5 w-5 rounded-full bg-[#4F46E5] text-white text-[9px] font-black flex items-center justify-center">
              {[search, category, minPrice, maxPrice, rating].filter(Boolean).length}
            </span>
          )}
        </div>
        {hasFilters && (
          <button onClick={resetFilters} className="flex items-center gap-1 text-xs font-semibold text-red-500 hover:text-red-600 transition-colors cursor-pointer">
            <Trash2 className="h-3 w-3" /> Clear All
          </button>
        )}
      </div>

      {/* Search */}
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Search</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-9 pr-9 py-2.5 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 outline-none focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/20 transition-all"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 cursor-pointer">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Category */}
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Category</label>
        <div className="space-y-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                category === cat.value
                  ? 'bg-[#4F46E5] text-white shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              <span className={category === cat.value ? 'text-white' : 'text-[#4F46E5]'}>{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Price Range</label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={minPrice}
            onChange={(e) => handlePriceChange('min', e.target.value)}
            placeholder="$ Min"
            className="flex-1 px-3 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 outline-none focus:border-[#4F46E5] transition-all"
          />
          <span className="text-zinc-400 text-xs font-bold">—</span>
          <input
            type="text"
            value={maxPrice}
            onChange={(e) => handlePriceChange('max', e.target.value)}
            placeholder="$ Max"
            className="flex-1 px-3 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 outline-none focus:border-[#4F46E5] transition-all"
          />
        </div>
        {/* Quick price presets */}
        <div className="flex flex-wrap gap-1.5">
          {[['Under $50', '0', '50'], ['$50-$100', '50', '100'], ['Over $100', '100', '']].map(([label, min, max]) => (
            <button
              key={label}
              onClick={() => { setMinPrice(min); setMaxPrice(max); }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer ${
                minPrice === min && maxPrice === max
                  ? 'bg-[#4F46E5] text-white border-transparent'
                  : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-[#4F46E5] hover:text-[#4F46E5]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Rating */}
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Min Rating</label>
        <div className="space-y-1">
          {[5, 4, 3].map((num) => (
            <button
              key={num}
              onClick={() => setRating(rating === num ? null : num)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-all cursor-pointer ${
                rating === num
                  ? 'bg-amber-50 dark:bg-amber-950/20 border border-amber-300 dark:border-amber-700'
                  : 'hover:bg-zinc-50 dark:hover:bg-zinc-800 border border-transparent'
              }`}
            >
              <div className="flex text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`h-3 w-3 ${i < num ? 'fill-current' : 'text-zinc-300 dark:text-zinc-700'}`} />
                ))}
              </div>
              <span className={`text-xs font-semibold ${rating === num ? 'text-amber-600 dark:text-amber-400' : 'text-zinc-500'}`}>
                {num === 5 ? '5 stars only' : `${num}+ stars`}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 transition-colors">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-8">

        {/* ── Page Header ─────────────────────────────────────────────── */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#4F46E5]/10 px-3 py-1 text-xs font-bold text-[#4F46E5] uppercase tracking-wider">
                  <Tag className="h-3 w-3" /> Catalog
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
                Explore All Products
              </h1>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm">
                {isLoading ? 'Loading...' : `${data?.pagination.total ?? 0} products available`}
                {hasFilters && <span className="ml-2 text-[#4F46E5] font-semibold">• Filters active</span>}
              </p>
            </div>

            {/* View toggles */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden flex items-center gap-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:border-[#4F46E5] transition-colors cursor-pointer"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters {hasFilters && `(${[search, category, minPrice, maxPrice, rating].filter(Boolean).length})`}
              </button>
              <div className="flex rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden">
                <button onClick={() => setGridCols(3)} className={`px-3 py-2.5 cursor-pointer transition-colors ${gridCols === 3 ? 'bg-[#4F46E5] text-white' : 'bg-white dark:bg-zinc-900 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800'}`}>
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button onClick={() => setGridCols(2)} className={`px-3 py-2.5 cursor-pointer transition-colors border-l border-zinc-200 dark:border-zinc-700 ${gridCols === 2 ? 'bg-[#4F46E5] text-white' : 'bg-white dark:bg-zinc-900 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800'}`}>
                  <LayoutList className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Mobile sidebar overlay */}
          <AnimatePresence>
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 lg:hidden"
              >
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
                <motion.div
                  initial={{ x: -320 }}
                  animate={{ x: 0 }}
                  exit={{ x: -320 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                  className="absolute left-0 top-0 bottom-0 w-80 bg-white dark:bg-zinc-900 p-6 overflow-y-auto shadow-xl"
                >
                  <div className="flex items-center justify-between mb-6">
                    <span className="font-extrabold text-lg text-zinc-900 dark:text-zinc-100">Filter Products</span>
                    <button onClick={() => setSidebarOpen(false)} className="text-zinc-400 hover:text-zinc-600 cursor-pointer"><X className="h-5 w-5" /></button>
                  </div>
                  <FilterContent />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Layout ──────────────────────────────────────────────────── */}
        <div className="flex gap-8">

          {/* Sidebar — desktop only */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-xs">
              <FilterContent />
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0 space-y-5">

            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-5 py-3.5 shadow-xs">
              <div className="flex items-center gap-2 flex-wrap">
                {hasFilters && (
                  <>
                    {category && (
                      <span className="flex items-center gap-1.5 rounded-full bg-[#4F46E5]/10 text-[#4F46E5] px-3 py-1 text-xs font-bold">
                        {category}
                        <button onClick={() => setCategory('')} className="cursor-pointer hover:opacity-70"><X className="h-3 w-3" /></button>
                      </span>
                    )}
                    {(minPrice || maxPrice) && (
                      <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 px-3 py-1 text-xs font-bold">
                        ${minPrice || '0'} — ${maxPrice || '∞'}
                        <button onClick={() => { setMinPrice(''); setMaxPrice(''); }} className="cursor-pointer hover:opacity-70"><X className="h-3 w-3" /></button>
                      </span>
                    )}
                    {rating && (
                      <span className="flex items-center gap-1.5 rounded-full bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 px-3 py-1 text-xs font-bold">
                        {rating}★+
                        <button onClick={() => setRating(null)} className="cursor-pointer hover:opacity-70"><X className="h-3 w-3" /></button>
                      </span>
                    )}
                  </>
                )}
                {!hasFilters && <span className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">All products</span>}
              </div>

              <div className="flex items-center gap-3">
                <button onClick={() => refetch()} disabled={isLoading} className="text-zinc-400 hover:text-[#4F46E5] transition-colors cursor-pointer disabled:opacity-50">
                  <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider hidden sm:block">Sort</span>
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-1.5 text-xs font-semibold outline-none focus:border-[#4F46E5] cursor-pointer"
                  >
                    {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Error state */}
            {isError && (
              <div className="flex flex-col items-center justify-center py-16 text-center rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/10">
                <Inbox className="h-10 w-10 text-red-400 mb-3" />
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mb-1">Failed to load products</h3>
                <p className="text-sm text-zinc-500 mb-4">Make sure the backend server is running.</p>
                <button onClick={() => refetch()} className="flex items-center gap-2 bg-[#4F46E5] text-white px-5 py-2.5 rounded-xl text-sm font-bold cursor-pointer hover:bg-[#4F46E5]/90 transition-colors">
                  <RefreshCw className="h-4 w-4" /> Retry
                </button>
              </div>
            )}

            {/* Product grid */}
            {!isError && (
              <>
                {isLoading ? (
                  <div className={`grid gap-5 ${gridCols === 3 ? 'sm:grid-cols-2 lg:grid-cols-3' : 'sm:grid-cols-2'}`}>
                    {Array.from({ length: gridCols === 3 ? 9 : 6 }).map((_, i) => <ProductCardSkeleton key={i} />)}
                  </div>
                ) : data?.data && data.data.length > 0 ? (
                  <motion.div
                    layout
                    className={`grid gap-5 ${gridCols === 3 ? 'sm:grid-cols-2 lg:grid-cols-3' : 'sm:grid-cols-2'}`}
                  >
                    <AnimatePresence mode="popLayout">
                      {data.data.map((product, i) => (
                        <motion.div
                          key={product._id}
                          layout
                          initial={{ opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ delay: i * 0.04 }}
                        >
                          <ProductCard
                            _id={product._id}
                            name={product.name}
                            price={product.price}
                            category={product.category}
                            rating={product.ratings?.average ?? 0}
                            ratingCount={product.ratings?.count ?? 0}
                            stock={product.stock ?? 0}
                            description={product.description}
                            imageUrl={product.images?.[0] || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=400'}
                          />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </motion.div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                    <div className="h-16 w-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
                      <Inbox className="h-8 w-8 text-zinc-400" />
                    </div>
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-1">No products found</h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-xs">
                      Try adjusting your filters or search term to find what you're looking for.
                    </p>
                    <button
                      onClick={resetFilters}
                      className="mt-4 flex items-center gap-2 bg-[#4F46E5] text-white px-5 py-2.5 rounded-xl text-sm font-bold cursor-pointer hover:bg-[#4F46E5]/90 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" /> Reset Filters
                    </button>
                  </div>
                )}

                {/* Pagination */}
                {data?.pagination && data.pagination.pages > 1 && (
                  <div className="flex items-center justify-between pt-4 border-t border-zinc-200 dark:border-zinc-800">
                    <span className="text-xs font-semibold text-zinc-500">
                      Page {data.pagination.page} of {data.pagination.pages} · {data.pagination.total} products
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        disabled={page === 1}
                        onClick={() => setPage((p) => Math.max(p - 1, 1))}
                        className="h-9 w-9 rounded-xl border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:border-[#4F46E5] hover:text-[#4F46E5] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors bg-white dark:bg-zinc-900"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      {Array.from({ length: Math.min(data.pagination.pages, 7) }).map((_, i) => {
                        const p = i + 1;
                        return (
                          <button
                            key={p}
                            onClick={() => setPage(p)}
                            className={`h-9 w-9 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              page === p
                                ? 'bg-[#4F46E5] text-white shadow-sm'
                                : 'border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:border-[#4F46E5] hover:text-[#4F46E5]'
                            }`}
                          >
                            {p}
                          </button>
                        );
                      })}
                      <button
                        disabled={page === data.pagination.pages}
                        onClick={() => setPage((p) => Math.min(p + 1, data.pagination.pages))}
                        className="h-9 w-9 rounded-xl border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:border-[#4F46E5] hover:text-[#4F46E5] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors bg-white dark:bg-zinc-900"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
