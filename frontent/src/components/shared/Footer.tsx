'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingBag, ArrowUpRight, Globe, Share2, MessageSquare } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full bg-[#f5f5f5] dark:bg-zinc-950 border-t border-zinc-200/50 dark:border-zinc-900/50 transition-colors duration-300 py-12 md:py-20 mt-20 font-sans">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        
        {/* Top layout grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12 pb-12 border-b border-zinc-200/60 dark:border-zinc-900/60">
          
          {/* Logo and desc */}
          <div className="col-span-1 md:col-span-2 space-y-4 text-left">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl text-[rgba(30,50,90,0.9)] dark:text-zinc-100">
              <ShoppingBag className="h-5 w-5 text-[rgba(30,50,90,0.9)] dark:text-zinc-100" />
              <span className="tracking-tight">Zevora</span>
            </Link>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm leading-relaxed">
              Premium electronics, audio gear, accessories, and fitness products. Fast delivery, AI-powered recommendations, and hassle-free returns.
            </p>
            <div className="flex items-center gap-3 pt-2">
              {[
                { icon: <Share2 className="h-4 w-4" />, href: 'https://twitter.com' },
                { icon: <Globe className="h-4 w-4" />, href: 'https://github.com' },
                { icon: <MessageSquare className="h-4 w-4" />, href: 'https://discord.com' },
              ].map((social, idx) => (
                <a
                  key={idx}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full border border-zinc-200 bg-white/50 text-zinc-500 hover:text-[rgba(30,50,90,0.9)] hover:border-transparent hover:bg-white dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-400 dark:hover:text-white transition-all"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Links Column 1 */}
          <div className="space-y-4 text-left">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[rgba(30,50,90,0.8)] dark:text-zinc-400">
              Ecosystem
            </h4>
            <ul className="space-y-2 text-sm font-medium">
              <li>
                <Link href="/products" className="text-zinc-500 hover:text-[rgba(30,50,90,0.9)] dark:text-zinc-400 dark:hover:text-white transition-colors">
                  Explore Products
                </Link>
              </li>
              <li>
                <Link href="/chat" className="text-zinc-500 hover:text-[rgba(30,50,90,0.9)] dark:text-zinc-400 dark:hover:text-white transition-colors">
                  AI Consultation
                </Link>
              </li>
              <li>
                <Link href="/favorites" className="text-zinc-500 hover:text-[rgba(30,50,90,0.9)] dark:text-zinc-400 dark:hover:text-white transition-colors">
                  My Favorites
                </Link>
              </li>
            </ul>
          </div>

          {/* Links Column 2 */}
          <div className="space-y-4 text-left">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[rgba(30,50,90,0.8)] dark:text-zinc-400">
              Account
            </h4>
            <ul className="space-y-2 text-sm font-medium">
              <li>
                <Link href="/dashboard/overview" className="text-zinc-500 hover:text-[rgba(30,50,90,0.9)] dark:text-zinc-400 dark:hover:text-white transition-colors">
                  My Dashboard
                </Link>
              </li>
              <li>
                <Link href="/dashboard/orders" className="text-zinc-500 hover:text-[rgba(30,50,90,0.9)] dark:text-zinc-400 dark:hover:text-white transition-colors">
                  My Orders
                </Link>
              </li>
              <li>
                <Link href="/dashboard/profile" className="text-zinc-500 hover:text-[rgba(30,50,90,0.9)] dark:text-zinc-400 dark:hover:text-white transition-colors">
                  Profile Settings
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom copyright readout */}
        <div className="flex flex-col sm:flex-row items-center justify-between pt-8 gap-4 text-left">
          <span className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">
            &copy; {new Date().getFullYear()} Zevora. All rights reserved.
          </span>
          <div className="flex gap-6 text-xs text-zinc-400 dark:text-zinc-500 font-medium">
            <a href="#" className="hover:text-[rgba(30,50,90,0.9)] dark:hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-[rgba(30,50,90,0.9)] dark:hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>

      </div>
    </footer>
  );
}

export default Footer;
