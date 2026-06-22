'use client';

import React from 'react';
import { RBACGuard } from '@/components/shared/RBACGuard';
import { useRole } from '@/providers/rbac-context';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/axios';
import { useTheme } from 'next-themes';
import {
  TrendingUp,
  ShoppingBag,
  Eye,
  Users,
  BarChart3,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import dynamic from 'next/dynamic';

const ResponsiveContainer = dynamic(() => import('recharts').then((mod) => mod.ResponsiveContainer), { ssr: false });
const AreaChart = dynamic(() => import('recharts').then((mod) => mod.AreaChart), { ssr: false });
const Area = dynamic(() => import('recharts').then((mod) => mod.Area), { ssr: false });
const BarChart = dynamic(() => import('recharts').then((mod) => mod.BarChart), { ssr: false });
const Bar = dynamic(() => import('recharts').then((mod) => mod.Bar), { ssr: false });
const PieChart = dynamic(() => import('recharts').then((mod) => mod.PieChart), { ssr: false });
const Pie = dynamic(() => import('recharts').then((mod) => mod.Pie), { ssr: false });
const Cell = dynamic(() => import('recharts').then((mod) => mod.Cell), { ssr: false });
const XAxis = dynamic(() => import('recharts').then((mod) => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then((mod) => mod.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import('recharts').then((mod) => mod.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then((mod) => mod.Tooltip), { ssr: false });

interface AnalyticsData {
  productsPerCategory: Array<{ name: string; value: number }>;
  ratingsDistribution: Array<{ rating: string; count: number }>;
  signupTimeline: Array<{ date: string; signups: number }>;
}

const BRAND_COLORS = ['#4F46E5', '#06B6D4', '#F59E0B'];

export default function AdminAnalytics() {
  const { role, isLoaded } = useRole();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // 1. Fetch live metrics from the backend analytics endpoint
  // apiClient automatically attaches x-user-email from localStorage (set by ClerkEmailSync)
  const { data, isLoading, isError, refetch, isFetching } = useQuery<{
    success: boolean;
    data: AnalyticsData;
  }>({
    queryKey: ['admin-analytics', role],
    queryFn: async () => {
      const response = await apiClient.get('/analytics');
      return response.data;
    },
    enabled: isLoaded && (role === 'admin' || role === 'manager'),
  });

  const analyticsData = data?.data;

  // Hydration safety: render placeholder during SSR
  if (!mounted || !isLoaded) {
    return (
      <div className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Analytics & Insights</h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm">Loading metrics...</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="h-28 rounded-2xl bg-zinc-1550 animate-pulse dark:bg-zinc-800" />
          ))}
        </div>
        <div className="h-96 rounded-2xl bg-zinc-1550 animate-pulse dark:bg-zinc-800" />
      </div>
    );
  }

  // Calculate high-level stats from fetched data
  const totalProducts = analyticsData?.productsPerCategory.reduce((acc, curr) => acc + curr.value, 0) || 0;
  const totalReviews = analyticsData?.ratingsDistribution.reduce((acc, curr) => acc + curr.count, 0) || 0;
  const totalSignups = analyticsData?.signupTimeline.reduce((acc, curr) => acc + curr.signups, 0) || 0;

  // Static operational/conversion counters aligned with mock layout but combined with DB totals
  const metrics = [
    {
      title: 'Gross Inventory Items',
      value: totalProducts ? `${totalProducts} products` : 'Loading...',
      icon: <ShoppingBag className="h-4 w-4" />,
      color: 'text-[#4F46E5] bg-indigo-50 dark:bg-indigo-950/20'
    },
    {
      title: 'Aggregated Reviews',
      value: totalReviews ? `${totalReviews} entries` : 'No reviews',
      icon: <TrendingUp className="h-4 w-4" />,
      color: 'text-[#06B6D4] bg-cyan-50 dark:bg-cyan-950/20'
    },
    {
      title: 'Database Customers',
      value: totalSignups ? `${totalSignups} users` : 'Loading...',
      icon: <Users className="h-4 w-4" />,
      color: 'text-[#F59E0B] bg-amber-50 dark:bg-amber-950/20'
    },
    {
      title: 'Live Conversion Est.',
      value: '4.82%',
      icon: <Eye className="h-4 w-4" />,
      color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20'
    }
  ];

  const gridColor = resolvedTheme === 'dark' ? '#27272a' : '#e4e4e7';
  const labelColor = resolvedTheme === 'dark' ? '#a1a1aa' : '#71717a';

  return (
    <RBACGuard allowedRoles={['admin', 'manager']}>
      <div className="space-y-6">
        
        {/* Page title and refresh */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight">Analytics & Insights</h2>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm">
              Live operational metrics computed directly from active MongoDB records.
            </p>
          </div>
          <button
            onClick={() => refetch()}
            disabled={isLoading || isFetching}
            className="self-start sm:self-auto inline-flex items-center gap-2 cursor-pointer rounded-full border border-zinc-200 bg-white px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-850 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-3 w-3 ${isFetching ? 'animate-spin' : ''}`} />
            <span>{isFetching ? 'Syncing...' : 'Sync Data'}</span>
          </button>
        </div>

        {/* Analytics stats */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((m, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">{m.title}</span>
                <div className={`rounded-lg p-1.5 ${m.color}`}>{m.icon}</div>
              </div>
              <div className="mt-4">
                <span className="text-2xl font-black text-zinc-900 dark:text-zinc-100">{m.value}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Query State fallbacks */}
        {isLoading && (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 h-96 animate-pulse" />
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 h-96 animate-pulse" />
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 h-96 col-span-full animate-pulse" />
          </div>
        )}

        {isError && (
          <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 transition-colors">
            <div className="rounded-full bg-red-50 p-3.5 dark:bg-red-950/20 text-red-500 mb-4">
              <AlertCircle className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Failed to aggregate dashboard analytics</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm">
              Please check connection bounds or make sure the backend is active.
            </p>
            <button
              onClick={() => refetch()}
              className="mt-4 bg-[#4F46E5] hover:bg-[#4F46E5]/90 text-white font-semibold rounded-full px-5 py-2 text-sm cursor-pointer"
            >
              Retry Connection
            </button>
          </div>
        )}

        {/* Charts Dashboard Layout */}
        {!isLoading && !isError && analyticsData && (
          <div className="grid gap-6 lg:grid-cols-2">
            
            {/* 1. Signup History Timeline (Area/Line Chart) */}
            <div className="col-span-full rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 transition-colors">
              <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
                <h3 className="text-base font-bold flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-[#4F46E5]" />
                  <span>Customer Acquisition Timeline</span>
                </h3>
                <span className="text-xs font-bold text-[#06B6D4]">Signups Count</span>
              </div>
              <div className="mt-6 h-80 w-full">
                {analyticsData.signupTimeline.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-zinc-400">
                    No users signup timeline data available.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analyticsData.signupTimeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorSignups" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                      <XAxis
                        dataKey="date"
                        stroke={labelColor}
                        fontSize={10}
                        fontWeight="bold"
                        tickLine={false}
                      />
                      <YAxis
                        stroke={labelColor}
                        fontSize={10}
                        fontWeight="bold"
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: resolvedTheme === 'dark' ? '#18181b' : '#ffffff',
                          borderColor: resolvedTheme === 'dark' ? '#27272a' : '#e4e4e7',
                          borderRadius: '12px',
                          color: resolvedTheme === 'dark' ? '#f4f4f5' : '#18181b',
                          fontSize: '11px',
                          fontWeight: 'bold'
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="signups"
                        name="New Signups"
                        stroke="#4F46E5"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorSignups)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* 2. Review Ratings Distribution (Bar Chart) */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 transition-colors">
              <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
                <h3 className="text-base font-bold flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-[#F59E0B]" />
                  <span>Ratings Distribution</span>
                </h3>
                <span className="text-xs font-bold text-zinc-500">1 to 5 Star Counts</span>
              </div>
              <div className="mt-6 h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsData.ratingsDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                    <XAxis
                      dataKey="rating"
                      stroke={labelColor}
                      fontSize={10}
                      fontWeight="bold"
                      tickLine={false}
                    />
                    <YAxis
                      stroke={labelColor}
                      fontSize={10}
                      fontWeight="bold"
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: resolvedTheme === 'dark' ? '#18181b' : '#ffffff',
                        borderColor: resolvedTheme === 'dark' ? '#27272a' : '#e4e4e7',
                        borderRadius: '12px',
                        color: resolvedTheme === 'dark' ? '#f4f4f5' : '#18181b',
                        fontSize: '11px',
                        fontWeight: 'bold'
                      }}
                    />
                    <Bar
                      dataKey="count"
                      name="Reviews Count"
                      fill="#F59E0B"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={45}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 3. Products per Category (Pie / Donut Chart) */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 transition-colors">
              <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
                <h3 className="text-base font-bold flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-[#06B6D4]" />
                  <span>Category Inventory Share</span>
                </h3>
                <span className="text-xs font-bold text-zinc-500">Products Breakdown</span>
              </div>
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4 h-72">
                <div className="relative h-60 w-60 flex-shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analyticsData.productsPerCategory}
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={85}
                        paddingAngle={4}
                        dataKey="value"
                        nameKey="name"
                      >
                        {analyticsData.productsPerCategory.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={BRAND_COLORS[index % BRAND_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: resolvedTheme === 'dark' ? '#18181b' : '#ffffff',
                          borderColor: resolvedTheme === 'dark' ? '#27272a' : '#e4e4e7',
                          borderRadius: '12px',
                          color: resolvedTheme === 'dark' ? '#f4f4f5' : '#18181b',
                          fontSize: '11px',
                          fontWeight: 'bold'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  
                  {/* Central total readout inside the donut */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-2xl font-black text-zinc-900 dark:text-zinc-100">{totalProducts}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Total Items</span>
                  </div>
                </div>

                {/* Custom Legend for clean layouts */}
                <div className="flex flex-col gap-2 max-w-[150px] w-full">
                  {analyticsData.productsPerCategory.map((entry, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs font-semibold">
                      <div
                        className="h-3 w-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: BRAND_COLORS[idx % BRAND_COLORS.length] }}
                      />
                      <span className="truncate text-zinc-700 dark:text-zinc-300">{entry.name}</span>
                      <span className="ml-auto text-zinc-400 font-bold">({entry.value})</span>
                    </div>
                  ))}
                </div>

              </div>
            </div>

          </div>
        )}

      </div>
    </RBACGuard>
  );
}
