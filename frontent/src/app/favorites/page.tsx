'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { useQuery } from '@tanstack/react-query';
import { ProductCard, ProductCardSkeleton } from '@/components/shared/ProductCard';
import { ShoppingBag, Heart, Sparkles, ArrowRight, Search, Package } from 'lucide-react';
import apiClient from '@/lib/axios';

// Reads favorites from localStorage and re-syncs on storage events (cross-tab)
function useFavoriteIds(): string[] {
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    const read = () => {
      try { setIds(JSON.parse(localStorage.getItem('zevora-favorites') || '[]')); }
      catch { setIds([]); }
    };
    read();
    window.addEventListener('storage', read);
    window.addEventListener('focus', read);
    return () => { window.removeEventListener('storage', read); window.removeEventListener('focus', read); };
  }, []);

  return ids;
}

interface Product {
  _id: string;
  name: string;
  price: number;
  category: string;
  stock?: number;
  ratings?: { average: number; count: number };
  images?: string[];
  description?: string;
}

export default function FavoritesPage() {
  const favoriteIds = useFavoriteIds();
  const [search, setSearch] = useState('');

  // Fetch favorite products from backend using saved IDs
  const { data, isLoading, refetch } = useQuery<{ success: boolean; data: Product[] }>({
    queryKey: ['favorites-products'],
    queryFn: async () => {
      // Fetch all products and filter by favorited IDs client-side
      const res = await apiClient.get('/products', { params: { limit: 50 } });
      return res.data;
    },
    select: (data) => ({
      ...data,
      // If we have saved favorites IDs, show those; otherwise show all products sorted by rating
      data: favoriteIds.length > 0
        ? (data.data || []).filter(p => favoriteIds.includes(p._id))
        : (data.data || []).sort((a, b) => (b.ratings?.average ?? 0) - (a.ratings?.average ?? 0)).slice(0, 6)
    })
  });

  const products = data?.data || [];
  const filtered = search
    ? products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase()))
    : products;

  const hasFavorites = favoriteIds.length > 0;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 transition-colors">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">

        {/* ── Header ───────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center shadow-md">
                <Heart className="h-5 w-5 text-white fill-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
                  {hasFavorites ? 'My Favorites' : 'Recommended For You'}
                </h1>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm">
                  {hasFavorites
                    ? `${products.length} saved item${products.length !== 1 ? 's' : ''} in your wishlist`
                    : 'Heart products to save them here. Showing top-rated picks for now.'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Search within favorites */}
            {products.length > 0 && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search..."
                  className="pl-9 pr-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm outline-none focus:border-[#4F46E5] transition-colors w-44"
                />
              </div>
            )}
            <Link href="/products">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#4F46E5] to-[#06B6D4] text-white px-5 py-2.5 text-sm font-bold shadow-md hover:shadow-lg transition-shadow cursor-pointer"
              >
                <ShoppingBag className="h-4 w-4" />
                Browse All
              </motion.button>
            </Link>
          </div>
        </div>

        {/* ── Content ──────────────────────────────────────────────────── */}
        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)}
          </div>
        ) : filtered.length > 0 ? (
          <>
            {/* Tip banner */}
            {!hasFavorites && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 flex items-center gap-3 rounded-2xl bg-gradient-to-r from-[#4F46E5]/10 to-[#06B6D4]/10 border border-[#4F46E5]/20 px-5 py-3.5"
              >
                <Sparkles className="h-5 w-5 text-[#4F46E5] shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Tip: Save items you love!</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Click the ❤ heart icon on any product to add it to your personal wishlist.</p>
                </div>
              </motion.div>
            )}

            <motion.div
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <AnimatePresence>
                {filtered.map((product, i) => (
                  <motion.div
                    key={product._id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: i * 0.06, duration: 0.3 }}
                  >
                    <ProductCard
                      _id={product._id}
                      name={product.name}
                      price={product.price}
                      category={product.category}
                      rating={product.ratings?.average ?? 0}
                      ratingCount={product.ratings?.count ?? 0}
                      stock={product.stock ?? 99}
                      description={product.description}
                      imageUrl={product.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=400'}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          </>
        ) : search ? (
          /* No search results */
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Search className="h-12 w-12 text-zinc-300 dark:text-zinc-700 mb-4" />
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-1">No results for &ldquo;{search}&rdquo;</h3>
            <p className="text-sm text-zinc-500">Try a different search term.</p>
          </div>
        ) : (
          /* Empty wishlist */
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-24 text-center space-y-6"
          >
            <div className="relative">
              <div className="h-24 w-24 rounded-3xl bg-gradient-to-br from-rose-100 to-pink-100 dark:from-rose-950/30 dark:to-pink-950/30 flex items-center justify-center">
                <Heart className="h-12 w-12 text-rose-400 dark:text-rose-500" />
              </div>
              <div className="absolute -top-2 -right-2 h-8 w-8 rounded-xl bg-gradient-to-br from-[#4F46E5] to-[#06B6D4] flex items-center justify-center">
                <Package className="h-4 w-4 text-white" />
              </div>
            </div>
            <div className="space-y-2 max-w-sm">
              <h2 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">Your wishlist is empty</h2>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed">
                Browse products and click the ❤ icon to save items you love. They'll appear here for easy access.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/products">
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#4F46E5] to-[#06B6D4] text-white px-7 py-3.5 text-sm font-bold shadow-md hover:shadow-lg transition-shadow"
                >
                  <ShoppingBag className="h-4 w-4" />
                  Explore Products
                  <ArrowRight className="h-4 w-4" />
                </motion.button>
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
