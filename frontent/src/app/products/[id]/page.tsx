'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'motion/react';
import {
  Star, ShoppingCart, Zap, ArrowLeft, Package,
  Shield, Truck, RotateCcw, Heart, Share2, CheckCircle2
} from 'lucide-react';
import apiClient from '@/lib/axios';
import { useCartStore } from '@/store/use-cart-store';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  images: string[];
  ratings: { average: number; count: number };
}

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const [selectedImg, setSelectedImg] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);
  const [liked, setLiked] = useState(false);

  const { data, isLoading, isError } = useQuery<{ success: boolean; data: Product }>({
    queryKey: ['product', id],
    queryFn: async () => {
      const res = await apiClient.get(`/products/${id}`);
      return res.data;
    },
    enabled: !!id,
  });

  const product = data?.data;

  const handleAddToCart = () => {
    if (!product) return;
    addItem({
      _id: product._id,
      name: product.name,
      price: product.price,
      image: product.images?.[0] || '',
      category: product.category,
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleBuyNow = () => {
    if (!product) return;
    addItem({
      _id: product._id,
      name: product.name,
      price: product.price,
      image: product.images?.[0] || '',
      category: product.category,
    });
    router.push('/checkout');
  };

  if (isLoading) return <ProductDetailSkeleton />;

  if (isError || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-zinc-500 text-lg">Product not found.</p>
          <Link href="/products" className="text-[#4F46E5] font-semibold hover:underline">
            ← Back to Catalog
          </Link>
        </div>
      </div>
    );
  }

  const images = product.images?.length ? product.images : [
    'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=800'
  ];
  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock < 10;
  const shippingFee = product.price >= 100 ? 0 : 5.99;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-8 transition-colors">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400 mb-6">
          <Link href="/" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Products</Link>
          <span>/</span>
          <span className="text-zinc-900 dark:text-zinc-100 font-semibold truncate max-w-[200px]">{product.name}</span>
        </div>

        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 mb-6 text-sm font-semibold text-zinc-600 dark:text-zinc-400 hover:text-[#4F46E5] transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div className="grid lg:grid-cols-2 gap-10">
          {/* ── LEFT: Image Gallery ── */}
          <div className="space-y-4">
            {/* Main image */}
            <motion.div
              key={selectedImg}
              initial={{ opacity: 0.7 }}
              animate={{ opacity: 1 }}
              className="relative aspect-square rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 shadow-sm"
            >
              <Image
                src={images[selectedImg]}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
                priority
              />
              {/* Stock overlay */}
              {isOutOfStock && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-white font-bold text-lg bg-red-500 px-4 py-2 rounded-full">
                    Out of Stock
                  </span>
                </div>
              )}
              {/* Wishlist */}
              <button
                onClick={() => setLiked(!liked)}
                className={`absolute top-4 right-4 h-10 w-10 flex items-center justify-center rounded-full shadow-md backdrop-blur-sm transition-all hover:scale-110 cursor-pointer ${
                  liked ? 'bg-red-500 text-white' : 'bg-white/90 dark:bg-zinc-900/90 text-zinc-500'
                }`}
              >
                <Heart className={`h-5 w-5 ${liked ? 'fill-current' : ''}`} />
              </button>
            </motion.div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImg(i)}
                    className={`relative h-16 w-16 shrink-0 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                      selectedImg === i
                        ? 'border-[#4F46E5] shadow-md scale-105'
                        : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-400'
                    }`}
                  >
                    <Image src={img} alt={`${product.name} ${i + 1}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── RIGHT: Product Info ── */}
          <div className="flex flex-col gap-6">
            {/* Category + Share */}
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center rounded-full bg-[#4F46E5]/10 px-3 py-1 text-xs font-bold text-[#4F46E5] uppercase tracking-wider">
                {product.category}
              </span>
              <button className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors cursor-pointer" aria-label="Share">
                <Share2 className="h-4 w-4" />
              </button>
            </div>

            {/* Name */}
            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 leading-tight">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-3">
              <div className="flex items-center text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`h-4 w-4 ${i < Math.floor(product.ratings?.average ?? 0) ? 'fill-current' : 'text-zinc-300 dark:text-zinc-700'}`} />
                ))}
              </div>
              <span className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">
                {product.ratings?.average?.toFixed(1) ?? '0.0'}
              </span>
              <span className="text-sm text-zinc-400">({product.ratings?.count ?? 0} reviews)</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-black text-zinc-900 dark:text-zinc-100">
                ${product.price.toFixed(2)}
              </span>
              {shippingFee === 0 ? (
                <span className="text-sm font-semibold text-emerald-500">Free Shipping</span>
              ) : (
                <span className="text-sm text-zinc-500">+ ${shippingFee} shipping</span>
              )}
            </div>

            {/* Stock status */}
            <div className="flex items-center gap-2">
              {isOutOfStock ? (
                <span className="flex items-center gap-1.5 text-red-500 font-semibold text-sm">
                  <Package className="h-4 w-4" />
                  Out of Stock
                </span>
              ) : isLowStock ? (
                <span className="flex items-center gap-1.5 text-amber-500 font-semibold text-sm">
                  <Package className="h-4 w-4" />
                  Only {product.stock} left — order soon!
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-emerald-500 font-semibold text-sm">
                  <CheckCircle2 className="h-4 w-4" />
                  In Stock ({product.stock} units)
                </span>
              )}
            </div>

            {/* Description */}
            <div className="rounded-xl bg-zinc-50 dark:bg-zinc-800/50 p-4 border border-zinc-100 dark:border-zinc-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">Description</h3>
              <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">{product.description}</p>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: <Truck className="h-4 w-4 text-[#4F46E5]" />, label: shippingFee === 0 ? 'Free Shipping' : `$${shippingFee} Shipping` },
                { icon: <Shield className="h-4 w-4 text-emerald-500" />, label: '1-Year Warranty' },
                { icon: <RotateCcw className="h-4 w-4 text-[#06B6D4]" />, label: '30-Day Returns' },
              ].map((badge, i) => (
                <div key={i} className="flex flex-col items-center gap-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 p-3 text-center">
                  {badge.icon}
                  <span className="text-[10px] font-bold text-zinc-600 dark:text-zinc-400">{badge.label}</span>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                  addedToCart
                    ? 'bg-emerald-500 text-white'
                    : 'border-2 border-[#4F46E5] text-[#4F46E5] hover:bg-[#4F46E5] hover:text-white'
                }`}
              >
                {addedToCart ? (
                  <><CheckCircle2 className="h-5 w-5" /> Added to Cart!</>
                ) : (
                  <><ShoppingCart className="h-5 w-5" /> Add to Cart</>
                )}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm bg-gradient-to-r from-[#4F46E5] to-[#06B6D4] text-white shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Zap className="h-5 w-5" />
                Buy Now
              </motion.button>
            </div>

            {/* Proceed to cart link */}
            <Link
              href="/cart"
              className="text-center text-sm text-zinc-500 hover:text-[#4F46E5] dark:hover:text-[#4F46E5] font-semibold transition-colors"
            >
              View Cart →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductDetailSkeleton() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-8">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-10 animate-pulse">
          <div className="aspect-square rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
          <div className="space-y-5">
            <div className="h-4 w-24 bg-zinc-200 dark:bg-zinc-800 rounded-full" />
            <div className="h-8 w-3/4 bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
            <div className="h-5 w-32 bg-zinc-200 dark:bg-zinc-800 rounded-full" />
            <div className="h-10 w-40 bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
            <div className="h-24 bg-zinc-200 dark:bg-zinc-800 rounded-xl" />
            <div className="grid grid-cols-3 gap-3">
              {[1,2,3].map(i => <div key={i} className="h-16 bg-zinc-200 dark:bg-zinc-800 rounded-xl" />)}
            </div>
            <div className="flex gap-3">
              <div className="flex-1 h-12 bg-zinc-200 dark:bg-zinc-800 rounded-2xl" />
              <div className="flex-1 h-12 bg-zinc-200 dark:bg-zinc-800 rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
