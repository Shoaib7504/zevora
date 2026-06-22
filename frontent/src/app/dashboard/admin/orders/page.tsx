'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RBACGuard } from '@/components/shared/RBACGuard';
import apiClient from '@/lib/axios';
import { Package, Truck, CheckCircle2, XCircle, Clock, RefreshCw, AlertCircle, ChevronDown } from 'lucide-react';

interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface Order {
  _id: string;
  userEmail: string;
  items: OrderItem[];
  shippingAddress: {
    fullName: string;
    phone: string;
    street: string;
    city: string;
    country: string;
  };
  subtotal: number;
  shippingFee: number;
  total: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  notes?: string;
}

const STATUS_STYLES: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending:   { label: 'Pending',   color: 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 border border-amber-200/50',     icon: <Clock className="h-3.5 w-3.5" /> },
  confirmed: { label: 'Confirmed', color: 'bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400 border border-blue-200/50',          icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
  shipped:   { label: 'Shipped',   color: 'bg-[#06B6D4]/10 text-[#06B6D4] border border-[#06B6D4]/20',                                          icon: <Truck className="h-3.5 w-3.5" /> },
  delivered: { label: 'Delivered', color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-200/50', icon: <Package className="h-3.5 w-3.5" /> },
  cancelled: { label: 'Cancelled', color: 'bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400 border border-red-200/50',              icon: <XCircle className="h-3.5 w-3.5" /> },
};

const NEXT_STATUSES: Record<string, string[]> = {
  pending:   ['confirmed', 'cancelled'],
  confirmed: ['shipped', 'cancelled'],
  shipped:   ['delivered', 'cancelled'],
  delivered: [],
  cancelled: [],
};

export default function AdminOrders() {
  const [filterStatus, setFilterStatus] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery<{
    success: boolean;
    data: Order[];
    pagination: { total: number; pages: number };
  }>({
    queryKey: ['admin-orders', filterStatus],
    queryFn: async () => {
      const res = await apiClient.get('/orders', {
        params: { limit: 50, status: filterStatus || undefined },
      });
      return res.data;
    },
  });

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await apiClient.patch(`/orders/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
    },
  });

  const statusCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    data?.data.forEach((o) => { counts[o.status] = (counts[o.status] || 0) + 1; });
    return counts;
  }, [data]);

  return (
    <RBACGuard allowedRoles={['admin']}>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight">Order Management</h2>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm">
              {data ? `${data.pagination.total} total orders` : 'Loading orders...'}
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

        {/* Status Summary Cards */}
        <div className="grid gap-3 sm:grid-cols-5">
          {Object.entries(STATUS_STYLES).map(([key, s]) => (
            <button
              key={key}
              onClick={() => setFilterStatus(filterStatus === key ? '' : key)}
              className={`rounded-xl border p-3 text-left transition-all cursor-pointer ${
                filterStatus === key
                  ? 'ring-2 ring-[#4F46E5] ring-offset-1'
                  : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
              } bg-white dark:bg-zinc-900`}
            >
              <div className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wide mb-2 ${s.color}`}>
                {s.icon}{s.label}
              </div>
              <div className="text-xl font-black text-zinc-900 dark:text-zinc-100">
                {statusCounts[key] || 0}
              </div>
            </button>
          ))}
        </div>

        {/* Error */}
        {isError && (
          <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-950/20 p-4 text-red-600 dark:text-red-400 text-sm font-medium">
            <AlertCircle className="h-4 w-4 shrink-0" />
            Failed to load orders. Make sure you are logged in as admin.
          </div>
        )}

        {/* Orders Table */}
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-zinc-50 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:bg-zinc-800/50 dark:text-zinc-400 border-b border-zinc-200/50 dark:border-zinc-800">
                <tr>
                  <th className="px-6 py-4">Order ID</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Items</th>
                  <th className="px-6 py-4">Total</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200/50 dark:divide-zinc-800">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 7 }).map((_, j) => (
                        <td key={j} className="px-6 py-4">
                          <div className="h-4 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : data?.data.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center text-zinc-400">
                      {filterStatus ? `No ${filterStatus} orders found.` : 'No orders yet.'}
                    </td>
                  </tr>
                ) : (
                  data?.data.map((order) => {
                    const s = STATUS_STYLES[order.status];
                    const nextStatuses = NEXT_STATUSES[order.status];
                    const date = new Date(order.createdAt).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', year: 'numeric'
                    });
                    return (
                      <tr key={order._id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                        <td className="px-6 py-4">
                          <span className="font-mono text-xs text-zinc-500 dark:text-zinc-400">
                            #{order._id.slice(-8).toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-bold text-xs text-zinc-900 dark:text-zinc-100">
                              {order.shippingAddress.fullName}
                            </p>
                            <p className="text-[10px] text-zinc-500 dark:text-zinc-400">{order.userEmail}</p>
                            <p className="text-[10px] text-zinc-400">{order.shippingAddress.city}, {order.shippingAddress.country}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-0.5">
                            {order.items.slice(0, 2).map((item, i) => (
                              <p key={i} className="text-xs text-zinc-600 dark:text-zinc-400 truncate max-w-[140px]">
                                {item.name} ×{item.quantity}
                              </p>
                            ))}
                            {order.items.length > 2 && (
                              <p className="text-[10px] text-zinc-400">+{order.items.length - 2} more</p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 font-extrabold text-zinc-900 dark:text-zinc-100">
                          ${order.total.toFixed(2)}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${s.color}`}>
                            {s.icon}{s.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-zinc-500 dark:text-zinc-400">{date}</td>
                        <td className="px-6 py-4">
                          {nextStatuses.length > 0 ? (
                            <div className="flex justify-end">
                              <div className="relative inline-block">
                                <select
                                  defaultValue=""
                                  onChange={(e) => {
                                    if (e.target.value) statusMutation.mutate({ id: order._id, status: e.target.value });
                                    e.target.value = '';
                                  }}
                                  className="appearance-none pl-3 pr-7 py-1.5 rounded-lg text-xs font-semibold border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 outline-none cursor-pointer hover:border-[#4F46E5] transition-colors"
                                >
                                  <option value="">Update Status</option>
                                  {nextStatuses.map((s) => (
                                    <option key={s} value={s}>{STATUS_STYLES[s]?.label}</option>
                                  ))}
                                </select>
                                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-zinc-400 pointer-events-none" />
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-zinc-400 text-right block pr-2">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </RBACGuard>
  );
}
