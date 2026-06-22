'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser, UserButton } from '@clerk/nextjs';
import { useRole } from '@/providers/rbac-context';
import { useTheme } from 'next-themes';
import { 
  LayoutDashboard, 
  Heart, 
  History, 
  User, 
  Settings, 
  ShieldAlert, 
  Package, 
  Users, 
  Star, 
  BarChart3, 
  ListTodo, 
  Menu, 
  X,
  Bell,
  ChevronDown,
  Sun,
  Moon,
  ShoppingBag
} from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useUser();
  const { role } = useRole();
  const { theme, setTheme } = useTheme();
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const userNavigation = [
    { label: 'Overview', href: '/dashboard/overview', icon: <LayoutDashboard className="h-4 w-4" /> },
    { label: 'Favorites', href: '/dashboard/favorites', icon: <Heart className="h-4 w-4" /> },
    { label: 'AI History', href: '/dashboard/ai-history', icon: <History className="h-4 w-4" /> },
    { label: 'Profile', href: '/dashboard/profile', icon: <User className="h-4 w-4" /> },
    { label: 'Settings', href: '/dashboard/settings', icon: <Settings className="h-4 w-4" /> },
  ];

  const adminNavigation = [
    { label: 'Admin Overview', href: '/dashboard/admin/overview', icon: <ShieldAlert className="h-4 w-4" /> },
    { label: 'Manage Products', href: '/dashboard/admin/products', icon: <Package className="h-4 w-4" /> },
    { label: 'Manage Users', href: '/dashboard/admin/users', icon: <Users className="h-4 w-4" /> },
    { label: 'Orders', href: '/dashboard/admin/orders', icon: <ShoppingBag className="h-4 w-4" /> },
    { label: 'Reviews Moderation', href: '/dashboard/admin/reviews', icon: <Star className="h-4 w-4" /> },
    { label: 'Analytics Insights', href: '/dashboard/admin/analytics', icon: <BarChart3 className="h-4 w-4" /> },
    { label: 'System AI Logs', href: '/dashboard/admin/ai-logs', icon: <ListTodo className="h-4 w-4" /> },
  ];

  const isAdmin = role === 'admin';

  const NavItem = ({ item }: { item: typeof userNavigation[0] }) => {
    const isActive = pathname === item.href;
    return (
      <Link
        href={item.href}
        onClick={() => setSidebarOpen(false)}
        className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
          isActive
            ? 'bg-[#4F46E5] text-white shadow-xs'
            : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-50'
        }`}
      >
        {item.icon}
        <span>{item.label}</span>
      </Link>
    );
  };

  return (
    <div className="flex h-screen bg-[#f0f0f0] dark:bg-black font-sans transition-colors duration-300">
      
      {/* 1. SIDEBAR COMPONENT FOR DESKTOP */}
      <aside className="hidden md:flex flex-col w-64 border-r border-zinc-200/50 bg-white/60 backdrop-blur-md dark:border-zinc-900/50 dark:bg-zinc-950/40 h-full p-4 justify-between transition-colors duration-300">
        <div className="space-y-6">
          {/* Logo / Brand */}
          <Link href="/" className="flex items-center gap-2 px-4 py-2 font-bold text-xl text-zinc-900 dark:text-zinc-50">
            <LayoutDashboard className="h-5 w-5 text-[#4F46E5]" />
            <span>Dashboard</span>
          </Link>

          {/* Navigation Links */}
          <div className="space-y-4">
            <div className="space-y-1">
              <span className="px-4 text-[10px] font-bold tracking-wider text-zinc-400 dark:text-zinc-500 uppercase">General</span>
              {userNavigation.map((item) => (
                <NavItem key={item.href} item={item} />
              ))}
            </div>

            {isAdmin && (
              <div className="space-y-1 pt-2 border-t border-zinc-100 dark:border-zinc-850">
                <span className="px-4 text-[10px] font-bold tracking-wider text-red-400 dark:text-red-500 uppercase">
                  Admin Management
                </span>
                {adminNavigation.map((item) => (
                  <NavItem key={item.href} item={item} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* User Card bottom */}
        <div className="border-t border-zinc-100 dark:border-zinc-850 pt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserButton />
            <div className="flex flex-col">
              <span className="text-xs font-bold truncate max-w-[120px] text-zinc-900 dark:text-zinc-100">
                {user?.firstName || 'Guest User'}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                {role}
              </span>
            </div>
          </div>
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-1.5 rounded-lg border border-zinc-100 dark:border-zinc-800 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 cursor-pointer"
          >
            {theme === 'dark' ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
          </button>
        </div>
      </aside>

      {/* 2. MOBILE DRAWER SIDEBAR SLIDE */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div 
            onClick={() => setSidebarOpen(false)} 
            className="fixed inset-0 bg-black/40 backdrop-blur-xs" 
          />
          <aside className="relative flex flex-col w-64 bg-white dark:bg-zinc-950 p-4 justify-between h-full shadow-xl border-r border-zinc-200/50 dark:border-zinc-800/50">
            <div className="space-y-6">
              <div className="flex items-center justify-between px-4">
                <Link href="/" className="flex items-center gap-2 font-bold text-xl">
                  <LayoutDashboard className="h-5 w-5 text-[#4F46E5]" />
                  <span>Dashboard</span>
                </Link>
                <button 
                  onClick={() => setSidebarOpen(false)}
                  className="p-1 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <span className="px-4 text-[10px] font-bold tracking-wider text-zinc-400 dark:text-zinc-500 uppercase">General</span>
                  {userNavigation.map((item) => (
                    <NavItem key={item.href} item={item} />
                  ))}
                </div>

                {isAdmin && (
                  <div className="space-y-1 pt-2 border-t border-zinc-100 dark:border-zinc-850">
                    <span className="px-4 text-[10px] font-bold tracking-wider text-red-400 dark:text-red-500 uppercase">Admin Management</span>
                    {adminNavigation.map((item) => (
                      <NavItem key={item.href} item={item} />
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-zinc-100 dark:border-zinc-850 pt-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserButton />
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{user?.firstName || 'Guest'}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">{role}</span>
                </div>
              </div>
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-1.5 rounded-lg border border-zinc-100 dark:border-zinc-800 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 cursor-pointer"
              >
                {theme === 'dark' ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* 3. MAIN CONTENT BODY */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar */}
        <header className="h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 border-b border-zinc-200/50 bg-white/60 backdrop-blur-md dark:border-zinc-900/50 dark:bg-zinc-950/40 transition-colors duration-300">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="p-1.5 rounded-lg border border-zinc-200/50 hover:bg-zinc-50 dark:border-zinc-800/50 dark:hover:bg-zinc-800/50 text-zinc-500 md:hidden cursor-pointer"
              aria-label="Open menu"
            >
              <Menu className="h-4 w-4" />
            </button>
            <span className="font-bold text-zinc-800 dark:text-zinc-200 text-base sm:text-lg">
              Dashboard Workspace
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Notification */}
            <button className="relative p-1.5 rounded-lg border border-zinc-200/50 hover:bg-zinc-50 dark:border-zinc-800/50 dark:hover:bg-zinc-800/50 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50 transition-all cursor-pointer">
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-[#06B6D4]" />
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-1.5 cursor-pointer"
              >
                <div className="h-8 w-8 rounded-full bg-[#4F46E5]/10 text-[#4F46E5] flex items-center justify-center font-bold text-xs border border-zinc-200 dark:border-zinc-800 shadow-xs">
                  {user?.firstName?.charAt(0) || 'U'}
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-zinc-400" />
              </button>

              {dropdownOpen && (
                <>
                  <div onClick={() => setDropdownOpen(false)} className="fixed inset-0 z-10" />
                  <div className="absolute right-0 mt-2 w-48 rounded-xl border border-zinc-200 bg-white p-2 shadow-lg dark:border-zinc-800 dark:bg-zinc-900 z-20 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-3 py-2 border-b border-zinc-100 dark:border-zinc-800">
                      <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">{user?.primaryEmailAddress?.emailAddress || 'guest@example.com'}</p>
                      <span className="inline-block mt-1 px-1.5 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-[9px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                        {role}
                      </span>
                    </div>
                    <Link href="/dashboard/profile" onClick={() => setDropdownOpen(false)} className="flex w-full items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800/50">
                      <User className="h-3.5 w-3.5" />
                      <span>My Profile</span>
                    </Link>
                    <Link href="/dashboard/settings" onClick={() => setDropdownOpen(false)} className="flex w-full items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800/50">
                      <Settings className="h-3.5 w-3.5" />
                      <span>Settings</span>
                    </Link>
                  </div>
                </>
              )}
            </div>

          </div>
        </header>

        {/* Content Body viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>

    </div>
  );
}
