'use client';

import React from 'react';
import { ProductCard } from '@/components/shared/ProductCard';

const favoriteProducts = [
  {
    _id: 'fav-1',
    name: 'Leather Everyday Backpack',
    price: 129.50,
    category: 'Accessories',
    rating: 4.6,
    imageUrl: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&q=80&w=400',
  },
  {
    _id: 'fav-2',
    name: 'Noise Cancelling Headphones',
    price: 249.99,
    category: 'Audio',
    rating: 4.9,
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=400',
  },
];

export default function UserFavorites() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight">My Favorites</h2>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm">
          Keep track of products you bookmarked for later.
        </p>
      </div>

      {favoriteProducts.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {favoriteProducts.map((product) => (
            <ProductCard key={product._id} {...product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 border border-dashed border-zinc-200/50 bg-white/60 dark:border-zinc-900/50 dark:bg-zinc-900/30 rounded-[1.5rem] backdrop-blur-md">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">You haven&apos;t favorited any products yet.</p>
        </div>
      )}
    </div>
  );
}
