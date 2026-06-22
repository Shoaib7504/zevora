'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RBACGuard } from '@/components/shared/RBACGuard';
import apiClient from '@/lib/axios';
import { Shield, UserX, UserCheck, AlertCircle, Loader2, Search, RefreshCw } from 'lucide-react';

interface UserRecord {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'user' | 'manager' | 'admin';
  createdAt: string;
}

interface UsersResponse {
  success: boolean;
  data: UserRecord[];
  pagination: { page: number; limit: number; total: number; pages: number };
}

const ROLE_STYLES: Record<string, string> = {
  admin: 'bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400 border border-red-200/50 dark:border-red-900/50',
  manager: 'bg-[#06B6D4]/10 text-[#06B6D4] border border-[#06B6D4]/20',
  user: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700',
};

const NEXT_ROLE: Record<string, 'user' | 'manager' | 'admin'> = {
  user: 'manager',
  manager: 'admin',
  admin: 'user',
};

export default function AdminUsers() {
  const [search, setSearch] = useState('');
  const [changingRoleId, setChangingRoleId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery<UsersResponse>({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const res = await apiClient.get('/users', { params: { limit: 50 } });
      return res.data;
    },
  });

  const roleMutation = useMutation({
    mutationFn: async ({ id, role }: { id: string; role: string }) => {
      await apiClient.patch(`/users/${id}/role`, { role });
    },
    onMutate: ({ id }) => setChangingRoleId(id),
    onSettled: () => setChangingRoleId(null),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-overview'] });
    },
  });

  const handleRoleChange = (user: UserRecord) => {
    const next = NEXT_ROLE[user.role] || 'user';
    if (window.confirm(`Change ${user.firstName}'s role from "${user.role}" to "${next}"?`)) {
      roleMutation.mutate({ id: user._id, role: next });
    }
  };

  const filtered = data?.data.filter((u) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      u.firstName.toLowerCase().includes(q) ||
      u.lastName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q)
    );
  }) ?? [];

  return (
    <RBACGuard allowedRoles={['admin']}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight">User Management</h2>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm">
              {data
                ? `${data.pagination.total} registered accounts in MongoDB`
                : 'Loading user accounts...'}
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

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, role..."
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-zinc-200 bg-white outline-none focus:border-[#4F46E5] dark:border-zinc-800 dark:bg-zinc-900 dark:focus:border-[#4F46E5] transition-all"
          />
        </div>

        {/* Error State */}
        {isError && (
          <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-950/20 p-4 text-red-600 dark:text-red-400 text-sm font-medium">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>Failed to load users. Make sure you are logged in as admin and the backend is running.</span>
          </div>
        )}

        {/* Users Table */}
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 transition-colors shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm text-zinc-500 dark:text-zinc-400">
              <thead className="bg-zinc-50 text-xs font-bold uppercase tracking-wider text-zinc-600 dark:bg-zinc-800/50 dark:text-zinc-400 border-b border-zinc-200/50 dark:border-zinc-800">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Joined</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200/50 dark:divide-zinc-800">
                {isLoading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 5 }).map((_, j) => (
                        <td key={j} className="px-6 py-4">
                          <div className="h-4 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-zinc-400">
                      {search ? 'No users match your search.' : 'No users found.'}
                    </td>
                  </tr>
                ) : (
                  filtered.map((u) => {
                    const initials = `${u.firstName.charAt(0)}${u.lastName.charAt(0)}`;
                    const joinedDate = new Date(u.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    });
                    const isChanging = changingRoleId === u._id;
                    return (
                      <tr
                        key={u._id}
                        className={`hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors ${isChanging ? 'opacity-50' : ''}`}
                      >
                        {/* Avatar + Name */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#4F46E5] to-[#06B6D4] text-white flex items-center justify-center text-xs font-bold shrink-0">
                              {initials}
                            </div>
                            <span className="font-bold text-zinc-900 dark:text-zinc-100">
                              {u.firstName} {u.lastName}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400">{u.email}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${ROLE_STYLES[u.role] || ROLE_STYLES.user}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400">{joinedDate}</td>
                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-2">
                            {/* Cycle role button */}
                            <button
                              onClick={() => handleRoleChange(u)}
                              disabled={isChanging}
                              title={`Change role to ${NEXT_ROLE[u.role]}`}
                              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border border-zinc-200 dark:border-zinc-700 hover:border-[#4F46E5] hover:text-[#4F46E5] cursor-pointer transition-colors disabled:cursor-not-allowed"
                            >
                              {isChanging ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Shield className="h-3.5 w-3.5" />
                              )}
                              → {NEXT_ROLE[u.role]}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Role Legend */}
          <div className="border-t border-zinc-100 dark:border-zinc-800 px-6 py-3 flex flex-wrap items-center gap-4 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
            <span>Role Legend:</span>
            {Object.entries(ROLE_STYLES).map(([role, cls]) => (
              <span key={role} className={`inline-flex items-center rounded-md px-2 py-0.5 ${cls}`}>
                {role}
              </span>
            ))}
            <span className="ml-auto text-zinc-400 normal-case font-medium tracking-normal">
              Click → button to cycle role
            </span>
          </div>
        </div>
      </div>
    </RBACGuard>
  );
}
