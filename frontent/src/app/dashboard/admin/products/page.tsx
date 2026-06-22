'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RBACGuard } from '@/components/shared/RBACGuard';
import { Button } from '@/components/ui/button';
import apiClient from '@/lib/axios';
import { Eye, Edit3, Trash, Plus, Search, AlertCircle, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface Product {
  _id: string;
  name: string;
  price: number;
  category: string;
  stock: number;
  ratings: { average: number; count: number };
  images: string[];
}

interface ProductsResponse {
  success: boolean;
  data: Product[];
  pagination: { page: number; limit: number; total: number; pages: number };
}

export default function AdminProducts() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery<ProductsResponse>({
    queryKey: ['admin-products', page, search],
    queryFn: async () => {
      const res = await apiClient.get('/products', {
        params: { page, limit: 10, search: search || undefined },
      });
      return res.data;
    },
    placeholderData: (prev) => prev,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/products/${id}`);
    },
    onMutate: (id) => setDeletingId(id),
    onSettled: () => setDeletingId(null),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['admin-overview'] });
    },
  });

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Delete "${name}"? This cannot be undone.`)) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <RBACGuard allowedRoles={['admin', 'manager']}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight">Inventory Management</h2>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm">
              {data
                ? `${data.pagination.total} products across ${data.data.length > 0 ? 'all' : '0'} categories`
                : 'Loading product catalog...'}
            </p>
          </div>
          <Link href="/dashboard/admin/products/new">
            <Button className="cursor-pointer bg-[#4F46E5] hover:bg-[#4F46E5]/90 text-white font-semibold rounded-full px-5 gap-2">
              <Plus className="h-4 w-4" />
              Add Product
            </Button>
          </Link>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search products..."
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-zinc-200 bg-white outline-none focus:border-[#4F46E5] dark:border-zinc-800 dark:bg-zinc-900 dark:focus:border-[#4F46E5] transition-all"
          />
        </div>

        {/* Error State */}
        {isError && (
          <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-950/20 p-4 text-red-600 dark:text-red-400 text-sm font-medium">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>Failed to load products. Make sure the backend is running.</span>
          </div>
        )}

        {/* Product Table */}
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 transition-colors shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm text-zinc-500 dark:text-zinc-400">
              <thead className="bg-zinc-50 text-xs font-bold uppercase tracking-wider text-zinc-600 dark:bg-zinc-800/50 dark:text-zinc-400 border-b border-zinc-200/50 dark:border-zinc-800">
                <tr>
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Stock</th>
                  <th className="px-6 py-4">Rating</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200/50 dark:divide-zinc-800">
                {isLoading ? (
                  Array.from({ length: 10 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 6 }).map((_, j) => (
                        <td key={j} className="px-6 py-4">
                          <div className="h-4 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : data?.data.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-zinc-400">
                      No products found.
                    </td>
                  </tr>
                ) : (
                  data?.data.map((p) => (
                    <tr
                      key={p._id}
                      className={`hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors ${
                        deletingId === p._id ? 'opacity-40' : ''
                      }`}
                    >
                      {/* Product Name + Image */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {p.images[0] ? (
                            <img
                              src={p.images[0]}
                              alt={p.name}
                              className="h-9 w-9 rounded-lg object-cover border border-zinc-200 dark:border-zinc-800"
                            />
                          ) : (
                            <div className="h-9 w-9 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400">
                              📦
                            </div>
                          )}
                          <span className="font-bold text-zinc-900 dark:text-zinc-100 max-w-[200px] truncate">
                            {p.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                          {p.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-zinc-900 dark:text-zinc-100">
                        ${p.price.toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            p.stock < 15
                              ? 'bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400'
                              : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400'
                          }`}
                        >
                          {p.stock} units
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-[#F59E0B]">
                        {p.ratings.average > 0 ? `${p.ratings.average}★` : '—'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <Link href={`/products`}>
                            <button
                              className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer transition-colors"
                              aria-label="View Product"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          </Link>
                          <button
                            className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-[#4F46E5] dark:hover:text-indigo-400 cursor-pointer transition-colors"
                            aria-label="Edit Product"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(p._id, p.name)}
                            disabled={deletingId === p._id}
                            className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-500 cursor-pointer transition-colors disabled:cursor-not-allowed"
                            aria-label="Delete Product"
                          >
                            {deletingId === p._id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {data && data.pagination.pages > 1 && (
            <div className="flex items-center justify-between border-t border-zinc-200/50 dark:border-zinc-800 px-6 py-4">
              <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                Page {data.pagination.page} of {data.pagination.pages} — {data.pagination.total} products
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  className="h-8 w-8 p-0 rounded-lg cursor-pointer disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === data.pagination.pages}
                  onClick={() => setPage((p) => Math.min(p + 1, data.pagination.pages))}
                  className="h-8 w-8 p-0 rounded-lg cursor-pointer disabled:opacity-50"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </RBACGuard>
  );
}
