'use client';

import React from 'react';
import { useUser } from '@clerk/nextjs';
import { useRole } from '@/providers/rbac-context';
import { ShieldCheck, ShieldAlert, Lock, User, Bell, Palette, Globe } from 'lucide-react';
import { useTheme } from 'next-themes';

const ADMIN_EMAIL = 'shoaibhossain188@gmail.com';

export default function UserSettings() {
  const { role, setRole, isLoaded } = useRole();
  const { user } = useUser();
  const { theme, setTheme } = useTheme();

  const isAdmin = user?.primaryEmailAddress?.emailAddress?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  const roleOptions = [
    {
      id: 'user',
      title: 'User',
      desc: 'Standard shopping & chat privileges.',
      icon: <ShieldCheck className="h-5 w-5" />,
      color: 'text-zinc-500',
    },
    {
      id: 'manager',
      title: 'Manager',
      desc: 'Moderate reviews and manage products.',
      icon: <ShieldAlert className="h-5 w-5" />,
      color: 'text-[#06B6D4]',
    },
    {
      id: 'admin',
      title: 'Admin',
      desc: 'Full root access to system logs & users.',
      icon: <ShieldAlert className="h-5 w-5" />,
      color: 'text-red-500',
    },
  ];

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Page Header */}
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight">Account Settings</h2>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm">
          Manage your display preferences and account configuration.
        </p>
      </div>

      {/* ── ADMIN-ONLY: Role Management ── */}
      {isAdmin && isLoaded && (
        <div className="rounded-2xl border border-[#4F46E5]/30 bg-indigo-50/50 dark:bg-indigo-950/10 p-6 shadow-xs dark:border-indigo-900/30 space-y-5">
          {/* Section Header */}
          <div className="flex items-center gap-3 pb-4 border-b border-[#4F46E5]/20 dark:border-indigo-900/30">
            <div className="rounded-xl bg-[#4F46E5]/10 p-2.5 text-[#4F46E5]">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Role Simulator</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Admin-only control. Switch view to test user/manager permissions.
              </p>
            </div>
            <span className="ml-auto inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-[9px] font-bold uppercase tracking-wider border border-red-200/50 dark:border-red-900/50">
              <Lock className="h-2.5 w-2.5" />
              Admin Only
            </span>
          </div>

          {/* Role Selection Cards */}
          <div className="grid gap-3 sm:grid-cols-3">
            {roleOptions.map((item) => {
              const isSelected = role === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setRole(item.id as 'user' | 'manager' | 'admin')}
                  className={`flex flex-col items-start text-left p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[#4F46E5] bg-[#4F46E5]/5 dark:bg-[#4F46E5]/10 ring-2 ring-[#4F46E5]/20'
                      : 'border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                  }`}
                >
                  <div className={`rounded-lg p-1.5 ${isSelected ? 'text-[#4F46E5] bg-[#4F46E5]/10' : `${item.color} bg-zinc-50 dark:bg-zinc-800`}`}>
                    {item.icon}
                  </div>
                  <span className="mt-3 font-bold text-xs text-zinc-900 dark:text-zinc-100">{item.title}</span>
                  <span className="mt-1 text-[10px] leading-normal text-zinc-500 dark:text-zinc-400">{item.desc}</span>
                  {isSelected && (
                    <span className="mt-2 text-[9px] font-bold uppercase tracking-wider text-[#4F46E5]">● Active</span>
                  )}
                </button>
              );
            })}
          </div>

          <p className="text-[11px] text-zinc-400 dark:text-zinc-500 leading-relaxed">
            Switching role updates the sidebar navigation and page access in real-time. This only affects your current session view.
          </p>
        </div>
      )}

      {/* ── APPEARANCE ── */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 transition-colors space-y-5">
        <div className="flex items-center gap-3 pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="rounded-xl bg-zinc-100 dark:bg-zinc-800 p-2.5 text-zinc-500">
            <Palette className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Appearance</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Choose your preferred color theme.</p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { id: 'light', label: 'Light', emoji: '☀️', desc: 'Bright and clean' },
            { id: 'dark', label: 'Dark', emoji: '🌙', desc: 'Easy on the eyes' },
            { id: 'system', label: 'System', emoji: '💻', desc: 'Follow OS setting' },
          ].map((opt) => (
            <button
              key={opt.id}
              onClick={() => setTheme(opt.id)}
              className={`flex flex-col items-start text-left p-4 rounded-xl border transition-all cursor-pointer ${
                theme === opt.id
                  ? 'border-[#4F46E5] bg-[#4F46E5]/5 dark:bg-[#4F46E5]/10 ring-2 ring-[#4F46E5]/20'
                  : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
              }`}
            >
              <span className="text-2xl">{opt.emoji}</span>
              <span className="mt-2 font-bold text-xs text-zinc-900 dark:text-zinc-100">{opt.label}</span>
              <span className="mt-0.5 text-[10px] text-zinc-500 dark:text-zinc-400">{opt.desc}</span>
              {theme === opt.id && (
                <span className="mt-2 text-[9px] font-bold uppercase tracking-wider text-[#4F46E5]">● Active</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── ACCOUNT INFO ── */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 transition-colors space-y-5">
        <div className="flex items-center gap-3 pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="rounded-xl bg-zinc-100 dark:bg-zinc-800 p-2.5 text-zinc-500">
            <User className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Account Info</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Your registered identity details.</p>
          </div>
        </div>

        <div className="space-y-3">
          {[
            { label: 'Full Name', value: `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim() || '—' },
            { label: 'Email Address', value: user?.primaryEmailAddress?.emailAddress || '—' },
            { label: 'Account Role', value: role.toUpperCase() },
            { label: 'Account ID', value: user?.id ? `${user.id.slice(0, 20)}...` : '—' },
          ].map((row) => (
            <div key={row.label} className="flex items-center justify-between py-2 border-b border-zinc-50 dark:border-zinc-800/50 last:border-0">
              <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">{row.label}</span>
              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate max-w-[200px]">{row.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── NOTIFICATIONS (placeholder) ── */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 transition-colors space-y-5">
        <div className="flex items-center gap-3 pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="rounded-xl bg-zinc-100 dark:bg-zinc-800 p-2.5 text-zinc-500">
            <Bell className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Notifications</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Control what you receive alerts for.</p>
          </div>
        </div>
        {[
          { label: 'Product Recommendations', desc: 'AI-powered suggestions based on your activity', defaultOn: true },
          { label: 'Order Updates', desc: 'Delivery and fulfillment status changes', defaultOn: true },
          { label: 'Marketing Emails', desc: 'Promotions and new product launches', defaultOn: false },
        ].map((item, i) => (
          <div key={i} className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{item.label}</p>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">{item.desc}</p>
            </div>
            <button
              className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors cursor-pointer ${
                item.defaultOn ? 'bg-[#4F46E5]' : 'bg-zinc-200 dark:bg-zinc-700'
              }`}
              role="switch"
              aria-checked={item.defaultOn}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                  item.defaultOn ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        ))}
      </div>

      {/* ── LANGUAGE (placeholder) ── */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 transition-colors">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-zinc-100 dark:bg-zinc-800 p-2.5 text-zinc-500">
            <Globe className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Language & Region</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">English (US) — UTC+6:00</p>
          </div>
          <span className="text-xs text-zinc-400 font-semibold">Coming soon</span>
        </div>
      </div>
    </div>
  );
}
