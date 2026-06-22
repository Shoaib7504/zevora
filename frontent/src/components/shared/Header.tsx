'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser, useAuth, useClerk } from '@clerk/nextjs';
import { useTheme } from 'next-themes';
import { useRole } from '@/providers/rbac-context';
import { 
  Sun, Moon, ShoppingBag, Menu, X, ArrowUpRight,
  LayoutDashboard, User, Settings, Heart, LogOut,
  ShieldCheck, ChevronDown, Sparkles, ShoppingCart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'motion/react';
import { useCartStore } from '@/store/use-cart-store';

export function Header() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const { signOut } = useClerk();
  const { role } = useRole();
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const cartCount = useCartStore((s) => s.totalItems());

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Close dropdown on outside click
  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown on route change
  React.useEffect(() => {
    setDropdownOpen(false);
  }, [pathname]);

  const isHome = pathname === '/';

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Products', href: '/products' },
    { label: 'Favorites', href: '/favorites' },
    { label: 'Chat', href: '/chat' },
  ];

  const linkClass = (isActive: boolean) => {
    if (isHome) {
      return `text-sm font-normal transition-all hover:opacity-70 ${
        isActive ? 'text-[rgba(30,50,90,1.0)] font-semibold border-b-2 border-[rgba(30,50,90,0.8)] pb-1' : 'text-[rgba(30,50,90,0.7)]'
      }`;
    }
    return `text-sm font-medium transition-colors hover:text-zinc-900 dark:hover:text-zinc-50 ${
      isActive ? 'text-zinc-900 dark:text-zinc-50' : 'text-zinc-500 dark:text-zinc-400'
    }`;
  };

  const roleColor = role === 'admin' 
    ? 'text-red-500 bg-red-50 dark:bg-red-950/30 border border-red-200/50 dark:border-red-900/50' 
    : role === 'manager' 
    ? 'text-[#06B6D4] bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200/50 dark:border-cyan-900/50'
    : 'text-zinc-500 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700';

  const avatarInitials = user
    ? `${user.firstName?.charAt(0) ?? ''}${user.lastName?.charAt(0) ?? ''}`.toUpperCase() || 'U'
    : 'U';

  const dropdownItems = [
    ...(role === 'admin'
      ? [{ label: 'Admin Console', href: '/dashboard/admin/overview', icon: <ShieldCheck className="h-4 w-4" />, highlight: true }]
      : []),
    { label: 'Dashboard', href: '/dashboard/overview', icon: <LayoutDashboard className="h-4 w-4" />, highlight: false },
    { label: 'My Profile', href: '/dashboard/profile', icon: <User className="h-4 w-4" />, highlight: false },
    { label: 'Favorites', href: '/dashboard/favorites', icon: <Heart className="h-4 w-4" />, highlight: false },
    { label: 'Settings', href: '/dashboard/settings', icon: <Settings className="h-4 w-4" />, highlight: false },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200/60 dark:border-zinc-800/60 transition-colors duration-300">
      {/* Decorative top stripe */}
      <div className="absolute left-0 top-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-b-sm" />

      <div className="mx-auto flex h-16 w-full max-w-[1400px] items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-sans font-bold text-xl text-zinc-900 dark:text-zinc-50 select-none">
          <ShoppingBag className="h-5 w-5 text-[rgba(30,50,90,0.9)] dark:text-zinc-100" />
          <span className="tracking-tight text-[rgba(30,50,90,0.95)] dark:text-zinc-100">Zevora</span>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex gap-8">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link key={link.href} href={link.href} className={linkClass(isActive)}>
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right side controls */}
        <div className="flex items-center gap-3">
          {/* Theme Toggler */}
          {mounted && !isHome && (
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200/50 hover:bg-zinc-50 dark:border-zinc-800/50 dark:hover:bg-zinc-800/50 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 transition-all cursor-pointer"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          )}

          {/* Cart Icon with Badge */}
          {isLoaded && isSignedIn && (
            <Link
              href="/cart"
              className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200/50 hover:bg-zinc-50 dark:border-zinc-800/50 dark:hover:bg-zinc-800/50 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 transition-all"
              aria-label="Shopping cart"
            >
              <ShoppingCart className="h-4 w-4" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#4F46E5] text-[9px] font-bold text-white shadow-sm">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>
          )}

          {/* Authentication Actions */}
          {isLoaded && (
            isSignedIn ? (
              /* ── CUSTOM PROFILE DROPDOWN ── */
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-2 rounded-full pl-1 pr-2.5 py-1 border border-zinc-200/70 dark:border-zinc-800/70 bg-white/80 dark:bg-zinc-900/80 hover:border-zinc-300 dark:hover:border-zinc-700 shadow-xs hover:shadow-sm transition-all cursor-pointer group"
                  aria-label="Open profile menu"
                  aria-expanded={dropdownOpen}
                >
                  {/* Avatar */}
                  <div className="h-7 w-7 rounded-full bg-gradient-to-br from-[#4F46E5] to-[#06B6D4] flex items-center justify-center text-white text-[11px] font-bold shrink-0 shadow-sm">
                    {user?.imageUrl ? (
                      <img src={user.imageUrl} alt="avatar" className="h-7 w-7 rounded-full object-cover" />
                    ) : (
                      avatarInitials
                    )}
                  </div>
                  {/* Name (desktop only) */}
                  <span className="hidden sm:block text-xs font-semibold text-zinc-700 dark:text-zinc-300 max-w-[80px] truncate">
                    {user?.firstName || 'Account'}
                  </span>
                  <ChevronDown className={`h-3 w-3 text-zinc-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Panel */}
                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -6 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -6 }}
                      transition={{ duration: 0.15, ease: 'easeOut' }}
                      className="absolute right-0 mt-2 w-60 rounded-2xl border border-zinc-200/70 dark:border-zinc-800/70 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl shadow-xl overflow-hidden z-50"
                    >
                      {/* Profile Header */}
                      <div className="px-4 py-3.5 border-b border-zinc-100 dark:border-zinc-800 bg-gradient-to-br from-zinc-50 to-white dark:from-zinc-900 dark:to-zinc-950">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#4F46E5] to-[#06B6D4] flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-sm">
                            {user?.imageUrl ? (
                              <img src={user.imageUrl} alt="avatar" className="h-10 w-10 rounded-xl object-cover" />
                            ) : (
                              avatarInitials
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">
                              {user?.firstName} {user?.lastName}
                            </p>
                            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                              {user?.primaryEmailAddress?.emailAddress}
                            </p>
                            <span className={`inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider ${roleColor}`}>
                              {role === 'admin' && <ShieldCheck className="h-2.5 w-2.5" />}
                              {role}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="p-2 space-y-0.5">
                        {dropdownItems.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setDropdownOpen(false)}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all group ${
                              item.highlight
                                ? 'text-[#4F46E5] bg-indigo-50/80 dark:bg-indigo-950/30 hover:bg-indigo-100 dark:hover:bg-indigo-950/50'
                                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-100'
                            }`}
                          >
                            <span className={`shrink-0 ${item.highlight ? 'text-[#4F46E5]' : 'text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors'}`}>
                              {item.icon}
                            </span>
                            <span>{item.label}</span>
                            {item.highlight && (
                              <Sparkles className="h-3 w-3 ml-auto text-[#4F46E5] opacity-70" />
                            )}
                          </Link>
                        ))}
                      </div>

                      {/* Sign Out */}
                      <div className="p-2 pt-0 border-t border-zinc-100 dark:border-zinc-800 mt-1">
                        <button
                          onClick={() => { setDropdownOpen(false); signOut(); }}
                          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all cursor-pointer group"
                        >
                          <LogOut className="h-4 w-4 shrink-0" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/sign-in">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center bg-[rgba(30,50,90,0.8)] text-white rounded-full pl-2 pr-4 md:pr-5 py-1.5 gap-2 hover:bg-[rgba(30,50,90,1)] transition-colors group cursor-pointer text-xs font-semibold shadow-xs"
                  >
                    <div className="bg-white/20 p-1 rounded-full flex items-center justify-center">
                      <ArrowUpRight className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span>Sign In</span>
                  </motion.button>
                </Link>
              </div>
            )
          )}

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200/50 hover:bg-zinc-50 dark:border-zinc-800/50 dark:hover:bg-zinc-800/50 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 md:hidden transition-all cursor-pointer"
            aria-label="Toggle menu"
          >
            {isMobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {isMobileOpen && (
        <div className="md:hidden border-t border-zinc-200/50 bg-white/95 dark:border-zinc-800/50 dark:bg-zinc-950/95 backdrop-blur-md px-4 py-4 space-y-4 transition-colors duration-300">
          <nav className="flex flex-col gap-3">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={`text-sm font-medium transition-colors hover:text-zinc-900 dark:hover:text-zinc-50 ${
                    isActive ? 'text-zinc-900 dark:text-zinc-50' : 'text-zinc-500 dark:text-zinc-400'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            {/* Dashboard link in mobile menu when signed in */}
            {isLoaded && isSignedIn && (
              <Link
                href="/dashboard/overview"
                onClick={() => setIsMobileOpen(false)}
                className={`text-sm font-medium transition-colors hover:text-zinc-900 dark:hover:text-zinc-50 ${
                  pathname.startsWith('/dashboard') ? 'text-zinc-900 dark:text-zinc-50' : 'text-zinc-500 dark:text-zinc-400'
                }`}
              >
                Dashboard
              </Link>
            )}
          </nav>

          {/* Mobile Auth Button fallback */}
          {isLoaded && !isSignedIn && (
            <div className="flex flex-col gap-2 pt-2 border-t border-zinc-200/50 dark:border-zinc-800/50">
              <Link href="/sign-in" onClick={() => setIsMobileOpen(false)}>
                <Button variant="outline" size="sm" className="w-full justify-center cursor-pointer font-semibold">
                  Sign In
                </Button>
              </Link>
              <Link href="/sign-up" onClick={() => setIsMobileOpen(false)}>
                <Button size="sm" className="w-full justify-center cursor-pointer bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-950 font-semibold rounded-lg shadow-sm">
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
          {/* Mobile sign out */}
          {isLoaded && isSignedIn && (
            <div className="pt-2 border-t border-zinc-200/50 dark:border-zinc-800/50">
              <button
                onClick={() => { setIsMobileOpen(false); signOut(); }}
                className="flex w-full items-center gap-2 text-sm font-semibold text-red-500 hover:text-red-600 cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

export default Header;
