'use client';

import React from 'react';
import { useUser } from '@clerk/nextjs';
import { useRole } from '@/providers/rbac-context';
import { useQuery } from '@tanstack/react-query';
import { useCartStore } from '@/store/use-cart-store';
import Link from 'next/link';
import { motion } from 'motion/react';
import {
  Heart, MessageSquare, ShoppingBag, ShoppingCart,
  ArrowRight, Star, Package, TrendingUp, Clock,
  Zap, Gift, Tag, ChevronRight, Sparkles
} from 'lucide-react';
import apiClient from '@/lib/axios';

interface Order {
  _id: string;
  items: { name: string; quantity: number; price: number }[];
  total: number;
  status: string;
  createdAt: string;
}

const STATUS_COLORS: Record<string, string> = {
  pending:   'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400',
  confirmed: 'bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400',
  shipped:   'bg-cyan-50 text-[#06B6D4] dark:bg-cyan-950/30',
  delivered: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400',
  cancelled: 'bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400',
};

const QUICK_LINKS = [
  { label: 'Browse Products',  href: '/products',          icon: <Tag className="h-5 w-5" />,           color: 'from-[#4F46E5]/10 to-[#06B6D4]/10',  iconColor: 'text-[#4F46E5]' },
  { label: 'My Cart',          href: '/cart',              icon: <ShoppingCart className="h-5 w-5" />,   color: 'from-[#F59E0B]/10 to-[#F59E0B]/5',    iconColor: 'text-[#F59E0B]' },
  { label: 'My Favorites',     href: '/dashboard/favorites', icon: <Heart className="h-5 w-5" />,        color: 'from-red-50 to-rose-50/50 dark:from-red-950/20 dark:to-transparent', iconColor: 'text-red-500' },
  { label: 'AI Assistant',     href: '/ai',                icon: <Sparkles className="h-5 w-5" />,       color: 'from-purple-50 to-violet-50/50 dark:from-purple-950/20 dark:to-transparent', iconColor: 'text-purple-500' },
  { label: 'My Orders',        href: '/dashboard/overview', icon: <Package className="h-5 w-5" />,       color: 'from-emerald-50 to-teal-50/50 dark:from-emerald-950/20 dark:to-transparent', iconColor: 'text-emerald-500' },
  { label: 'Profile Settings', href: '/dashboard/profile', icon: <Gift className="h-5 w-5" />,           color: 'from-zinc-100 to-zinc-50 dark:from-zinc-800/50 dark:to-transparent',           iconColor: 'text-zinc-500' },
];

export default function UserOverview() {
  const { user } = useUser();
  const { role } = useRole();
  const cartCount = useCartStore((s) => s.totalItems());
  const cartTotal = useCartStore((s) => s.totalPrice());

  // Fetch user's real orders
  const { data: ordersData, isLoading: ordersLoading } = useQuery<{ success: boolean; data: Order[] }>({
    queryKey: ['my-orders'],
    queryFn: async () => {
      const res = await apiClient.get('/orders/my');
      return res.data;
    },
    retry: 1,
  });

  const orders = ordersData?.data || [];
  const totalSpent = orders.reduce((s, o) => s + o.total, 0);
  const deliveredCount = orders.filter((o) => o.status === 'delivered').length;
  const pendingCount = orders.filter((o) => ['pending', 'confirmed', 'shipped'].includes(o.status)).length;

  const stats = [
    {
      label: 'Total Orders',
      value: ordersLoading ? '—' : String(orders.length),
      sub: `${deliveredCount} delivered`,
      icon: <Package className="h-5 w-5" />,
      color: 'text-[#4F46E5]',
      bg: 'bg-[#4F46E5]/10',
    },
    {
      label: 'Total Spent',
      value: ordersLoading ? '—' : `$${totalSpent.toFixed(2)}`,
      sub: `${pendingCount} in progress`,
      icon: <TrendingUp className="h-5 w-5" />,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
    },
    {
      label: 'Cart Items',
      value: String(cartCount),
      sub: `$${cartTotal.toFixed(2)} total`,
      icon: <ShoppingCart className="h-5 w-5" />,
      color: 'text-[#F59E0B]',
      bg: 'bg-[#F59E0B]/10',
    },
    {
      label: 'AI Queries',
      value: '12',
      sub: 'Consultations logged',
      icon: <MessageSquare className="h-5 w-5" />,
      color: 'text-[#06B6D4]',
      bg: 'bg-[#06B6D4]/10',
    },
  ];

  const timeOfDay = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-7">

      {/* ── Welcome Banner ──────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl p-7 sm:p-10 text-white"
        style={{ background: 'linear-gradient(135deg, #4F46E5 0%, #06B6D4 100%)' }}
      >
        {/* Decorative blobs */}
        <div className="absolute -top-10 -right-10 h-48 w-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-black/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 backdrop-blur-sm px-3 py-1 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="h-3 w-3" /> {role} account
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {timeOfDay()}, {user?.firstName || 'Shopper'}! 👋
            </h1>
            <p className="text-white/75 text-sm max-w-md">
              {orders.length > 0
                ? `You have ${pendingCount} active order${pendingCount !== 1 ? 's' : ''} in progress. Check the status below.`
                : 'Welcome to your dashboard. Start shopping and your orders will appear here.'}
            </p>
          </div>

          <div className="flex flex-wrap gap-3 shrink-0">
            <Link href="/products">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 rounded-2xl bg-white text-[#4F46E5] px-5 py-2.5 text-sm font-bold shadow-md hover:shadow-lg transition-shadow cursor-pointer"
              >
                <ShoppingBag className="h-4 w-4" /> Shop Now
              </motion.button>
            </Link>
            {cartCount > 0 && (
              <Link href="/cart">
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  className="flex items-center gap-2 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 text-white px-5 py-2.5 text-sm font-bold hover:bg-white/30 transition-colors cursor-pointer"
                >
                  <ShoppingCart className="h-4 w-4" /> Cart ({cartCount})
                </motion.button>
              </Link>
            )}
          </div>
        </div>

        {/* Avatar */}
        {user?.imageUrl && (
          <div className="absolute top-6 right-6 hidden lg:block">
            <img
              src={user.imageUrl}
              alt={user.firstName || ''}
              className="h-16 w-16 rounded-2xl border-2 border-white/30 shadow-lg object-cover"
            />
          </div>
        )}
      </motion.div>

      {/* ── Stats Grid ──────────────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 p-5 shadow-xs hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">{stat.label}</span>
              <div className={`h-9 w-9 rounded-xl ${stat.bg} flex items-center justify-center ${stat.color}`}>
                {stat.icon}
              </div>
            </div>
            <div className="text-2xl font-black text-zinc-900 dark:text-zinc-100">{stat.value}</div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">{stat.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* ── Quick Links ─────────────────────────────────────────────────── */}
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {QUICK_LINKS.map((link, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -3 }}
            >
              <Link
                href={link.href}
                className={`flex flex-col items-center gap-2.5 p-4 rounded-2xl bg-gradient-to-br ${link.color} border border-zinc-200/60 dark:border-zinc-800/60 hover:shadow-md transition-all group text-center`}
              >
                <div className={`h-10 w-10 rounded-2xl bg-white dark:bg-zinc-900 flex items-center justify-center ${link.iconColor} shadow-sm group-hover:scale-110 transition-transform`}>
                  {link.icon}
                </div>
                <span className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300 leading-snug">{link.label}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Recent Orders ───────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Recent Orders</h2>
          <Link href="/checkout" className="text-xs font-semibold text-[#4F46E5] hover:underline flex items-center gap-1">
            New Order <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden shadow-xs">
          {ordersLoading ? (
            <div className="space-y-0 divide-y divide-zinc-100 dark:divide-zinc-800">
              {[1,2,3].map((i) => (
                <div key={i} className="flex items-center gap-4 px-6 py-4 animate-pulse">
                  <div className="h-10 w-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-40 bg-zinc-100 dark:bg-zinc-800 rounded" />
                    <div className="h-2.5 w-24 bg-zinc-100 dark:bg-zinc-800 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 px-6 text-center space-y-3">
              <div className="h-14 w-14 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                <Package className="h-7 w-7 text-zinc-400" />
              </div>
              <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">No orders yet</p>
              <p className="text-xs text-zinc-400">Start shopping to see your orders here.</p>
              <Link href="/products">
                <button className="mt-1 flex items-center gap-2 rounded-xl bg-[#4F46E5] text-white px-5 py-2.5 text-xs font-bold hover:bg-[#4F46E5]/90 transition-colors cursor-pointer">
                  <ShoppingBag className="h-3.5 w-3.5" /> Browse Products
                </button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {orders.slice(0, 5).map((order) => {
                const date = new Date(order.createdAt).toLocaleDateString('en-US', {
                  month: 'short', day: 'numeric', year: 'numeric'
                });
                return (
                  <div key={order._id} className="flex items-center gap-4 px-6 py-4 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#4F46E5]/10 to-[#06B6D4]/10 flex items-center justify-center shrink-0">
                      <ShoppingBag className="h-5 w-5 text-[#4F46E5]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">
                        {order.items[0]?.name}{order.items.length > 1 ? ` +${order.items.length - 1} more` : ''}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Clock className="h-3 w-3 text-zinc-400" />
                        <span className="text-[11px] text-zinc-500">{date}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0 space-y-1">
                      <p className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100">${order.total.toFixed(2)}</p>
                      <span className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${STATUS_COLORS[order.status] || STATUS_COLORS.pending}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Promo Banner ────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-zinc-900 to-zinc-800 p-6 text-white">
        <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-[#4F46E5]/30 blur-2xl" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[#F59E0B] to-[#F59E0B]/70 flex items-center justify-center">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="font-extrabold text-base">Free shipping on orders over $100</p>
              <p className="text-white/60 text-xs mt-0.5">Stock up today and save on delivery costs!</p>
            </div>
          </div>
          <Link href="/products">
            <button className="flex items-center gap-2 rounded-xl bg-white text-zinc-900 px-5 py-2.5 text-xs font-bold hover:bg-zinc-100 transition-colors cursor-pointer shrink-0">
              Shop Now <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </Link>
        </div>
      </div>

      {/* ── AI Recommendation nudge ─────────────────────────────────────── */}
      <div className="rounded-2xl border border-purple-200/60 dark:border-purple-900/40 bg-gradient-to-br from-purple-50 to-violet-50/30 dark:from-purple-950/20 dark:to-transparent p-5">
        <div className="flex items-start gap-4">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#4F46E5] flex items-center justify-center shrink-0">
            <Star className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Try our AI Shopping Assistant</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Ask Zevora AI to recommend products based on your needs — from headphones to fitness gear.
            </p>
          </div>
          <Link href="/ai" className="shrink-0">
            <button className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#4F46E5] text-white px-4 py-2 text-xs font-bold hover:opacity-90 transition-opacity cursor-pointer">
              Try AI <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </Link>
        </div>
      </div>

    </div>
  );
}
