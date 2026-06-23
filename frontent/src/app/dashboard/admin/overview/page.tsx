'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { RBACGuard } from '@/components/shared/RBACGuard';
import apiClient from '@/lib/axios';
import { 
  DollarSign, Users, Star, Package, TrendingUp, 
  Activity, RefreshCw, AlertCircle 
} from 'lucide-react';

interface OverviewData {
  totalProducts: number;
  totalUsers: number;
  totalReviews: number;
  averageRating: number;
  productsByCategory: { name: string; value: number }[];
  revenueEstimate: number;
}

async function fetchOverview(): Promise<OverviewData> {
  const [productsRes, usersRes, analyticsRes] = await Promise.all([
    apiClient.get('/products', { params: { limit: 1 } }),
    apiClient.get('/users', { params: { limit: 1 } }),
    apiClient.get('/analytics'),
  ]);

  const totalProducts = productsRes.data.pagination?.total || 0;
  const totalUsers = usersRes.data.pagination?.total || 0;
  const analyticsData = analyticsRes.data.data;

  const ratingsData: { rating: string; count: number }[] = analyticsData.ratingsDistribution || [];
  const totalReviews = ratingsData.reduce((sum, r) => sum + r.count, 0);
  const weightedSum = ratingsData.reduce((sum, r) => {
    const stars = parseInt(r.rating);
    return sum + stars * r.count;
  }, 0);
  const averageRating = totalReviews > 0 ? weightedSum / totalReviews : 0;

  // Rough revenue estimate: avg product price * 0.3 * total users
  const revenueEstimate = totalProducts * 65 * 0.3;

  return {
    totalProducts,
    totalUsers,
    totalReviews,
    averageRating,
    productsByCategory: analyticsData.productsPerCategory || [],
    revenueEstimate,
  };
}

export default function AdminOverview() {
  const { data, isLoading, isError, refetch } = useQuery<OverviewData>({
    queryKey: ['admin-overview'],
    queryFn: fetchOverview,
    staleTime: 30000,
  });

  const cards = [
    {
      title: 'Gross Revenue Est.',
      value: data ? `$${data.revenueEstimate.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : '—',
      change: 'Based on inventory volume',
      icon: <DollarSign className="h-5 w-5 text-emerald-500" />,
      bg: 'bg-emerald-50 dark:bg-emerald-950/20',
    },
    {
      title: 'Registered Users',
      value: data ? data.totalUsers.toLocaleString() : '—',
      change: 'From MongoDB users collection',
      icon: <Users className="h-5 w-5 text-blue-500" />,
      bg: 'bg-blue-50 dark:bg-blue-950/20',
    },
    {
      title: 'Total Reviews',
      value: data ? data.totalReviews.toLocaleString() : '—',
      change: `Avg rating: ${data ? data.averageRating.toFixed(1) : '—'}★`,
      icon: <Star className="h-5 w-5 text-[#F59E0B]" />,
      bg: 'bg-amber-50 dark:bg-amber-950/20',
    },
    {
      title: 'Active Inventory',
      value: data ? data.totalProducts.toLocaleString() : '—',
      change: `${data?.productsByCategory.length || 0} categories`,
      icon: <Package className="h-5 w-5 text-[#4F46E5]" />,
      bg: 'bg-indigo-50 dark:bg-indigo-950/20',
    },
  ];

  return (
    <RBACGuard allowedRoles={['admin', 'manager']}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight">Admin Console</h2>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm">
              Live operational metrics from your MongoDB Atlas database.
            </p>
          </div>
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-zinc-200 bg-white text-sm font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Error State */}
        {isError && (
          <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-950/20 p-4 text-red-600 dark:text-red-400 text-sm font-medium">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>Failed to load overview data. Make sure the backend is running and you are logged in as admin.</span>
          </div>
        )}

        {/* Metric Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((card, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  {card.title}
                </span>
                <div className={`rounded-lg p-1.5 ${card.bg}`}>{card.icon}</div>
              </div>
              <div className="mt-4">
                {isLoading ? (
                  <div className="h-8 w-24 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800" />
                ) : (
                  <span className="text-2xl font-black text-zinc-900 dark:text-zinc-100">
                    {card.value}
                  </span>
                )}
                <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 mt-1.5 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-emerald-500" />
                  <span>{card.change}</span>
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Category Breakdown + Operational Log */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Products per Category */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 transition-colors">
            <h3 className="text-base font-bold pb-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-2">
              <Package className="h-4 w-4 text-[#4F46E5]" />
              Products by Category
            </h3>
            <div className="mt-5 space-y-3">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-8 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800" />
                ))
              ) : data?.productsByCategory.length ? (
                data.productsByCategory.map((cat) => {
                  const pct = data.totalProducts > 0 
                    ? Math.round((cat.value / data.totalProducts) * 100) 
                    : 0;
                  return (
                    <div key={cat.name}>
                      <div className="flex justify-between text-sm font-semibold mb-1">
                        <span className="text-zinc-700 dark:text-zinc-300">{cat.name}</span>
                        <span className="text-zinc-500">{cat.value} items ({pct}%)</span>
                      </div>
                      <div className="h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                        <div
                          className="h-2 rounded-full bg-[#4F46E5] transition-all duration-700"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-zinc-400">No category data available.</p>
              )}
            </div>
          </div>

          {/* Operational Log */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 transition-colors">
            <h3 className="text-base font-bold pb-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-2">
              <Activity className="h-4 w-4 text-emerald-500" />
              System Status
            </h3>
            <div className="mt-5 space-y-4 text-sm">
              {[
                { label: 'MongoDB Atlas', status: isError ? 'Unreachable' : 'Connected', ok: !isError },
                { label: 'Backend API', status: isError ? 'Offline' : 'Running', ok: !isError },
                { label: 'Products seeded', status: `${data?.totalProducts || 0} documents`, ok: true },
                { label: 'Users registered', status: `${data?.totalUsers || 0} accounts`, ok: true },
                { label: 'Reviews collected', status: `${data?.totalReviews || 0} entries`, ok: true },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-zinc-600 dark:text-zinc-400 font-medium">{item.label}</span>
                  <span className={`flex items-center gap-1.5 text-xs font-bold ${item.ok ? 'text-emerald-500' : 'text-red-500'}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${item.ok ? 'bg-emerald-500' : 'bg-red-500'}`} />
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </RBACGuard>
  );
}
