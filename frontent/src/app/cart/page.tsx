'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, Zap, Tag, Truck } from 'lucide-react';
import { useCartStore } from '@/store/use-cart-store';

export default function CartPage() {
  const { items, removeItem, updateQty, clearCart, totalPrice } = useCartStore();
  const router = useRouter();

  const subtotal = totalPrice();
  const shippingFee = subtotal >= 100 ? 0 : 5.99;
  const total = subtotal + shippingFee;

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-20">
        <div className="relative mb-6">
          <div className="h-24 w-24 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto">
            <ShoppingBag className="h-12 w-12 text-zinc-300 dark:text-zinc-600" />
          </div>
        </div>
        <h2 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 mb-2">Your cart is empty</h2>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-8 max-w-sm">
          Browse our catalog and add products you love to your cart.
        </p>
        <Link
          href="/products"
          className="flex items-center gap-2 bg-[#4F46E5] hover:bg-[#4F46E5]/90 text-white font-bold px-6 py-3 rounded-2xl transition-colors shadow-md"
        >
          <ShoppingBag className="h-4 w-4" />
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-8 transition-colors">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-sm font-semibold text-zinc-500 hover:text-[#4F46E5] transition-colors cursor-pointer mb-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Continue Shopping
            </button>
            <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">
              Shopping Cart
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-0.5">
              {items.length} item{items.length !== 1 ? 's' : ''} in your cart
            </p>
          </div>
          <button
            onClick={() => { if (window.confirm('Clear all items from cart?')) clearCart(); }}
            className="flex items-center gap-1.5 text-xs font-semibold text-red-500 hover:text-red-600 transition-colors cursor-pointer"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Clear Cart
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* ── Cart Items ── */}
          <div className="lg:col-span-2 space-y-3">
            <AnimatePresence>
              {items.map((item) => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex gap-4 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 shadow-xs"
                >
                  {/* Image */}
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-800">
                    {item.image ? (
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-zinc-400 text-2xl">📦</div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex flex-1 flex-col justify-between min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-bold text-sm text-zinc-900 dark:text-zinc-100 truncate">{item.name}</p>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                          {item.category}
                        </span>
                      </div>
                      <button
                        onClick={() => removeItem(item._id)}
                        className="text-zinc-400 hover:text-red-500 transition-colors cursor-pointer shrink-0"
                        aria-label="Remove item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      {/* Qty control */}
                      <div className="flex items-center gap-1 border border-zinc-200 dark:border-zinc-700 rounded-xl overflow-hidden">
                        <button
                          onClick={() => updateQty(item._id, item.quantity - 1)}
                          className="flex h-7 w-7 items-center justify-center text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-8 text-center text-sm font-bold text-zinc-900 dark:text-zinc-100">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQty(item._id, item.quantity + 1)}
                          className="flex h-7 w-7 items-center justify-center text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      {/* Line total */}
                      <span className="text-base font-extrabold text-zinc-900 dark:text-zinc-100">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* ── Order Summary ── */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 p-6 shadow-xs sticky top-24 space-y-5">
              <h2 className="font-extrabold text-zinc-900 dark:text-zinc-100 text-lg">Order Summary</h2>

              {/* Line items */}
              <div className="space-y-3 text-sm">
                {items.map((item) => (
                  <div key={item._id} className="flex justify-between text-zinc-600 dark:text-zinc-400">
                    <span className="truncate max-w-[140px]">{item.name} × {item.quantity}</span>
                    <span className="font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                  <span>Subtotal</span>
                  <span className="font-semibold">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                  <span className="flex items-center gap-1"><Truck className="h-3.5 w-3.5" /> Shipping</span>
                  {shippingFee === 0 ? (
                    <span className="font-bold text-emerald-500">FREE</span>
                  ) : (
                    <span className="font-semibold">${shippingFee.toFixed(2)}</span>
                  )}
                </div>
                {subtotal < 100 && (
                  <p className="text-[11px] text-zinc-400 flex items-center gap-1">
                    <Tag className="h-3 w-3" />
                    Add ${(100 - subtotal).toFixed(2)} more for free shipping
                  </p>
                )}
              </div>

              <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4">
                <div className="flex justify-between font-extrabold text-zinc-900 dark:text-zinc-100 text-lg">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push('/checkout')}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm bg-gradient-to-r from-[#4F46E5] to-[#06B6D4] text-white shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                <Zap className="h-4 w-4" />
                Proceed to Checkout
              </motion.button>

              <Link
                href="/products"
                className="block text-center text-sm font-semibold text-zinc-500 hover:text-[#4F46E5] transition-colors"
              >
                ← Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
