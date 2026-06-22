'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star, Heart, ShoppingCart, Eye, Package } from 'lucide-react';
import { useCartStore } from '@/store/use-cart-store';
import { motion, AnimatePresence } from 'motion/react';

export interface ProductCardProps {
  _id: string;
  name: string;
  price: number;
  category: string;
  rating: number;
  ratingCount?: number;
  imageUrl: string;
  stock?: number;
  description?: string;
}

// ── Favorites helpers (localStorage) ────────────────────────────────────────
const FAV_KEY = 'zevora-favorites';

function getFavIds(): string[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(FAV_KEY) || '[]'); }
  catch { return []; }
}

function toggleFav(id: string): boolean {
  const ids = getFavIds();
  const next = ids.includes(id) ? ids.filter((i) => i !== id) : [...ids, id];
  localStorage.setItem(FAV_KEY, JSON.stringify(next));
  return next.includes(id);
}

export function ProductCard({
  _id,
  name,
  price,
  category,
  rating,
  ratingCount = 0,
  imageUrl,
  stock = 0,
  description,
}: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const [added, setAdded] = useState(false);
  const [liked, setLiked] = useState(false);

  // Hydrate liked state from localStorage on mount
  useEffect(() => {
    setLiked(getFavIds().includes(_id));
  }, [_id]);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({ _id, name, price, image: imageUrl, category });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const next = toggleFav(_id);
    setLiked(next);
  };

  const isLowStock = stock > 0 && stock < 10;
  const isOutOfStock = stock === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 dark:border-zinc-800 dark:bg-zinc-900"
    >
      {/* ── IMAGE AREA ── */}
      <div className="relative aspect-[4/3] overflow-hidden bg-zinc-100 dark:bg-zinc-800">
        <Image
          src={imageUrl}
          alt={name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
        />

        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Top badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          <span className="rounded-full bg-white/95 dark:bg-zinc-900/95 px-2.5 py-1 text-[10px] font-bold text-zinc-700 dark:text-zinc-300 shadow-sm backdrop-blur-sm uppercase tracking-wider">
            {category}
          </span>
          {isLowStock && (
            <span className="rounded-full bg-amber-500 px-2.5 py-1 text-[10px] font-bold text-white shadow-sm">
              Only {stock} left!
            </span>
          )}
          {isOutOfStock && (
            <span className="rounded-full bg-red-500 px-2.5 py-1 text-[10px] font-bold text-white shadow-sm">
              Out of Stock
            </span>
          )}
        </div>

        {/* Wishlist button */}
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={handleLike}
          className={`absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full shadow-sm backdrop-blur-sm transition-all hover:scale-110 cursor-pointer ${
            liked
              ? 'bg-red-500 text-white'
              : 'bg-white/90 dark:bg-zinc-900/90 text-zinc-500 dark:text-zinc-400 hover:text-red-500'
          }`}
          aria-label={liked ? 'Remove from wishlist' : 'Add to wishlist'}
          title={liked ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart className={`h-4 w-4 ${liked ? 'fill-current' : ''}`} />
        </motion.button>

        {/* View Details hover overlay */}
        <div className="absolute inset-x-0 bottom-0 flex justify-center pb-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <Link
            href={`/products/${_id}`}
            className="flex items-center gap-2 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 text-xs font-bold px-4 py-2 rounded-full shadow-lg hover:bg-[#4F46E5] hover:text-white transition-colors"
          >
            <Eye className="h-3.5 w-3.5" />
            View Details
          </Link>
        </div>
      </div>

      {/* ── INFO SECTION ── */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        {/* Rating */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center text-amber-400">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-3 w-3 ${i < Math.floor(rating) ? 'fill-current' : 'text-zinc-300 dark:text-zinc-700'}`}
              />
            ))}
          </div>
          {rating > 0 ? (
            <span className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400">
              {rating.toFixed(1)} {ratingCount > 0 && `(${ratingCount})`}
            </span>
          ) : (
            <span className="text-[10px] text-zinc-400">No reviews yet</span>
          )}
        </div>

        {/* Name */}
        <h4 className="font-bold text-sm leading-snug line-clamp-2 text-zinc-900 dark:text-zinc-100 flex-1">
          {name}
        </h4>

        {/* Description snippet */}
        {description && (
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
            {description}
          </p>
        )}

        {/* Stock indicator — only when in stock and not low */}
        {stock > 0 && !isLowStock && (
          <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
            <Package className="h-3 w-3" />
            <span className="text-[10px] font-semibold">In Stock ({stock} units)</span>
          </div>
        )}

        {/* Price + Actions */}
        <div className="flex items-center justify-between pt-1 mt-auto border-t border-zinc-100 dark:border-zinc-800">
          <div className="flex flex-col">
            <span className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">Price</span>
            <span className="text-lg font-extrabold text-zinc-900 dark:text-zinc-100">
              ${price.toFixed(2)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Add to cart */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                added
                  ? 'bg-emerald-500 text-white'
                  : 'bg-[#4F46E5] hover:bg-[#4F46E5]/90 text-white'
              }`}
              aria-label="Add to cart"
            >
              <AnimatePresence mode="wait">
                {added ? (
                  <motion.span
                    key="check"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="text-xs"
                  >
                    ✓ Added
                  </motion.span>
                ) : (
                  <motion.span
                    key="cart"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="flex items-center gap-1.5"
                  >
                    <ShoppingCart className="h-3.5 w-3.5" />
                    Add
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            {/* View details link */}
            <Link
              href={`/products/${_id}`}
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:text-[#4F46E5] hover:border-[#4F46E5] transition-colors"
              aria-label="View details"
            >
              <Eye className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 animate-pulse">
      <div className="aspect-[4/3] bg-zinc-200 dark:bg-zinc-800" />
      <div className="p-4 space-y-3">
        <div className="flex gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-3 w-3 rounded-sm bg-zinc-200 dark:bg-zinc-800" />
          ))}
        </div>
        <div className="h-4 w-3/4 bg-zinc-200 dark:bg-zinc-800 rounded-md" />
        <div className="h-3 w-full bg-zinc-200 dark:bg-zinc-800 rounded-md" />
        <div className="h-3 w-2/3 bg-zinc-200 dark:bg-zinc-800 rounded-md" />
        <div className="flex justify-between items-center pt-2 border-t border-zinc-100 dark:border-zinc-800">
          <div className="h-6 w-16 bg-zinc-200 dark:bg-zinc-800 rounded-md" />
          <div className="h-8 w-20 bg-zinc-200 dark:bg-zinc-800 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
