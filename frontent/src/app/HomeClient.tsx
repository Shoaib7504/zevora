'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useUser } from '@clerk/nextjs';
import { motion, AnimatePresence } from 'motion/react';
import apiClient from '@/lib/axios';
import { ProductCard, ProductCardSkeleton } from '@/components/shared/ProductCard';
import { Button } from '@/components/ui/button';
import {
  ArrowRight, Star, Shield, Truck, RotateCcw, Headphones,
  Zap, TrendingUp, Tag, ChevronRight, ShoppingBag,
  MessageCircle, Quote, BarChart3, Package,
  Smartphone, Watch, Laptop, Dumbbell,
  CheckCircle2, Globe, Heart, Mail
} from 'lucide-react';

interface ProductData {
  _id: string;
  name: string;
  price: number;
  category: string;
  stock?: number;
  ratings?: { average: number; count: number };
  images?: string[];
  description?: string;
}

// ── Hero slide data ──────────────────────────────────────────────────────────
const HERO_SLIDES = [
  {
    headline: 'Shop the Future,',
    sub: 'Delivered Today.',
    desc: 'Discover premium electronics, accessories, audio gear, and fitness products curated for modern life.',
    cta: 'Explore Catalog',
    ctaLink: '/products',
    badge: '🔥 New Arrivals Every Week',
    accent: 'from-[#4F46E5] to-[#06B6D4]',
    bg: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&q=80&w=1600',
  },
  {
    headline: 'Audio That',
    sub: 'Moves You.',
    desc: 'Experience studio-grade sound with our handpicked audiophile headphones, earbuds, and speakers.',
    cta: 'Shop Audio',
    ctaLink: '/products?category=Audio',
    badge: '🎧 Top-Rated Picks',
    accent: 'from-[#7C3AED] to-[#EC4899]',
    bg: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=1600',
  },
  {
    headline: 'Gear Up for',
    sub: 'Peak Performance.',
    desc: 'Elevate your workout with cutting-edge fitness trackers, equipment and recovery accessories.',
    cta: 'Shop Fitness',
    ctaLink: '/products?category=Fitness',
    badge: '💪 Best Sellers',
    accent: 'from-[#059669] to-[#06B6D4]',
    bg: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=1600',
  },
];

const CATEGORIES = [
  { label: 'Electronics', icon: <Laptop className="h-6 w-6" />, color: 'from-[#4F46E5]/20 to-[#4F46E5]/5', iconColor: 'text-[#4F46E5]', href: '/products?category=Electronics' },
  { label: 'Audio', icon: <Headphones className="h-6 w-6" />, color: 'from-[#7C3AED]/20 to-[#7C3AED]/5', iconColor: 'text-[#7C3AED]', href: '/products?category=Audio' },
  { label: 'Accessories', icon: <Watch className="h-6 w-6" />, color: 'from-[#F59E0B]/20 to-[#F59E0B]/5', iconColor: 'text-[#F59E0B]', href: '/products?category=Accessories' },
  { label: 'Fitness', icon: <Dumbbell className="h-6 w-6" />, color: 'from-[#059669]/20 to-[#059669]/5', iconColor: 'text-[#059669]', href: '/products?category=Fitness' },
  { label: 'Mobile', icon: <Smartphone className="h-6 w-6" />, color: 'from-[#06B6D4]/20 to-[#06B6D4]/5', iconColor: 'text-[#06B6D4]', href: '/products' },
];

const TRUST_BADGES = [
  { icon: <Truck className="h-5 w-5" />, title: 'Free Shipping', desc: 'On orders over $100', color: 'text-[#4F46E5]' },
  { icon: <RotateCcw className="h-5 w-5" />, title: '30-Day Returns', desc: 'Hassle-free returns', color: 'text-[#06B6D4]' },
  { icon: <Shield className="h-5 w-5" />, title: '1-Year Warranty', desc: 'On all products', color: 'text-emerald-500' },
  { icon: <Headphones className="h-5 w-5" />, title: '24/7 Support', desc: 'Always here to help', color: 'text-[#F59E0B]' },
];

const STATS = [
  { value: '50K+', label: 'Happy Customers', icon: <Heart className="h-5 w-5 text-red-400" /> },
  { value: '2K+', label: 'Products Listed', icon: <Package className="h-5 w-5 text-[#4F46E5]" /> },
  { value: '98%', label: 'Satisfaction Rate', icon: <Star className="h-5 w-5 text-amber-400" /> },
  { value: '120+', label: 'Countries Served', icon: <Globe className="h-5 w-5 text-[#06B6D4]" /> },
];

const TESTIMONIALS = [
  {
    name: 'Sarah K.', role: 'Tech Enthusiast', rating: 5,
    text: 'The mechanical keyboard I bought is absolutely fantastic. Fast delivery and packaging was perfect. Will definitely order again!',
    avatar: 'SK',
  },
  {
    name: 'James M.', role: 'Fitness Coach', rating: 5,
    text: 'Best e-commerce experience I\'ve had. The AI assistant helped me pick the right fitness tracker. Arrived in 2 days!',
    avatar: 'JM',
  },
  {
    name: 'Priya R.', role: 'Music Producer', rating: 5,
    text: 'The noise-cancelling headphones are a game changer for my studio work. Sound quality is exceptional for the price.',
    avatar: 'PR',
  },
];

const FEATURES = [
  { icon: <Zap className="h-5 w-5" />, title: 'Lightning Fast', desc: 'Optimized Next.js with edge rendering and smart caching.' },
  { icon: <MessageCircle className="h-5 w-5" />, title: 'AI Shopping Assistant', desc: 'Get personalized recommendations powered by Gemini AI.' },
  { icon: <BarChart3 className="h-5 w-5" />, title: 'Real-time Analytics', desc: 'Live sales data and customer behavior insights.' },
  { icon: <Shield className="h-5 w-5" />, title: 'Secure Payments', desc: 'Bank-grade security on every transaction.' },
  { icon: <Globe className="h-5 w-5" />, title: 'Global Delivery', desc: 'Ship to 120+ countries with real-time tracking.' },
  { icon: <TrendingUp className="h-5 w-5" />, title: 'Trend Tracking', desc: 'Stay ahead with curated trending collections.' },
];

const FAQS = [
  { q: 'How long does shipping take?', a: 'Standard shipping takes 3-7 business days. Express shipping (1-2 days) is available at checkout for an additional fee.' },
  { q: 'Can I return a product?', a: 'Yes! We offer hassle-free 30-day returns. Just initiate a return from your dashboard and we\'ll send a prepaid label.' },
  { q: 'Is my payment information secure?', a: 'Absolutely. All transactions are encrypted with bank-grade TLS security. We never store your card details.' },
  { q: 'Do you offer warranties?', a: 'All products come with a minimum 1-year warranty. Electronics and premium items include extended warranty options.' },
  { q: 'How does the AI assistant work?', a: 'Our Gemini-powered AI analyses your preferences and browsing history to recommend products tailored specifically to your needs.' },
];

// ── Section title helper ─────────────────────────────────────────────────────
function SectionTitle({ badge, title, sub }: { badge?: string; title: React.ReactNode; sub?: string }) {
  return (
    <div className="text-center space-y-3 mb-12">
      {badge && (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#4F46E5]/10 px-4 py-1.5 text-xs font-bold text-[#4F46E5] uppercase tracking-wider">
          {badge}
        </span>
      )}
      <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight leading-tight">
        {title}
      </h2>
      {sub && <p className="mx-auto max-w-2xl text-zinc-500 dark:text-zinc-400 text-sm sm:text-base">{sub}</p>}
    </div>
  );
}

// ── Hero Section ─────────────────────────────────────────────────────────────
function HeroSection() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setCurrent((p) => (p + 1) % HERO_SLIDES.length), 5000);
    return () => clearInterval(t);
  }, []);

  const slide = HERO_SLIDES[current];

  return (
    <section className="relative w-full h-[65vh] min-h-[520px] max-h-[780px] overflow-hidden">
      {/* Background */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9 }}
          className="absolute inset-0"
        >
          <img src={slide.bg} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/50 to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="mx-auto max-w-[1400px] w-full px-6 sm:px-10 lg:px-16">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.6 }}
              className="max-w-2xl space-y-5"
            >
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm px-4 py-1.5 text-xs font-bold text-white/90 border border-white/20">
                {slide.badge}
              </span>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.1] tracking-tight">
                {slide.headline}<br />
                <span className={`bg-gradient-to-r ${slide.accent} bg-clip-text text-transparent`}>
                  {slide.sub}
                </span>
              </h1>

              <p className="text-base sm:text-lg text-white/75 leading-relaxed max-w-lg">
                {slide.desc}
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link href={slide.ctaLink}>
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                    className={`flex items-center gap-2 rounded-2xl bg-gradient-to-r ${slide.accent} px-7 py-3.5 text-sm font-bold text-white shadow-lg hover:shadow-xl transition-shadow`}
                  >
                    <ShoppingBag className="h-4 w-4" />
                    {slide.cta}
                    <ArrowRight className="h-4 w-4" />
                  </motion.button>
                </Link>
                <Link href="/dashboard/overview">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    className="flex items-center gap-2 rounded-2xl border border-white/30 bg-white/10 backdrop-blur-sm px-6 py-3.5 text-sm font-bold text-white hover:bg-white/20 transition-colors"
                  >
                    My Dashboard
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Slide dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {HERO_SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-2 rounded-full transition-all cursor-pointer ${i === current ? 'w-8 bg-white' : 'w-2 bg-white/40 hover:bg-white/70'}`}
          />
        ))}
      </div>

      {/* Scroll cue */}
      <div className="absolute bottom-6 right-8 z-20 hidden md:flex flex-col items-center gap-1">
        <span className="text-white/50 text-[10px] font-semibold uppercase tracking-widest">Scroll</span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 1.4 }}
          className="w-4 h-7 rounded-full border border-white/30 flex items-start justify-center pt-1.5"
        >
          <div className="w-1 h-2 bg-white/60 rounded-full" />
        </motion.div>
      </div>
    </section>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function HomeClient() {
  const { isSignedIn } = useUser();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [email, setEmail] = useState('');

  // Fetch trending products: high-rated, in-stock, sorted by rating
  const { data, isLoading } = useQuery<{ success: boolean; data: ProductData[] }>({
    queryKey: ['trending-products'],
    queryFn: async () => {
      const res = await apiClient.get('/products', {
        params: { sortBy: 'ratings.average', sortOrder: 'desc', limit: 8 }
      });
      // Filter to only in-stock products for home page display
      return {
        ...res.data,
        data: (res.data.data || []).filter((p: ProductData) => (p.stock ?? 1) > 0).slice(0, 8),
      };
    },
    retry: 1,
  });

  const trendingProducts = data?.data || [];

  return (
    <div className="w-full bg-zinc-50 dark:bg-zinc-950 font-sans text-zinc-900 dark:text-zinc-100 transition-colors">

      {/* ── 1. HERO ─────────────────────────────────────────────────────── */}
      <HeroSection />

      {/* ── 2. TRUST BADGES ─────────────────────────────────────────────── */}
      <section className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {TRUST_BADGES.map((b, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="flex items-center gap-3 p-4 rounded-2xl hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
              >
                <div className={`h-10 w-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center ${b.color} shrink-0`}>
                  {b.icon}
                </div>
                <div>
                  <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{b.title}</p>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">{b.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. CATEGORIES ───────────────────────────────────────────────── */}
      <section className="w-full bg-zinc-50 dark:bg-zinc-950 py-16 sm:py-20 border-b border-zinc-200/50 dark:border-zinc-800/50">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <SectionTitle badge="Shop By Category" title="Find Your Favorite Category" sub="Browse our wide range of product categories to find exactly what you need." />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {CATEGORIES.map((cat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                whileHover={{ y: -4 }}
              >
                <Link href={cat.href} className={`flex flex-col items-center gap-3 p-6 rounded-2xl bg-gradient-to-br ${cat.color} border border-zinc-200/50 dark:border-zinc-800/50 hover:shadow-md transition-all group`}>
                  <div className={`h-12 w-12 rounded-2xl bg-white dark:bg-zinc-900 flex items-center justify-center ${cat.iconColor} shadow-sm group-hover:scale-110 transition-transform`}>
                    {cat.icon}
                  </div>
                  <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200">{cat.label}</span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. TRENDING PRODUCTS ────────────────────────────────────────── */}
      <section className="w-full bg-white dark:bg-zinc-900 py-16 sm:py-20 border-b border-zinc-200/50 dark:border-zinc-800/50">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F59E0B]/10 px-4 py-1.5 text-xs font-bold text-[#F59E0B] uppercase tracking-wider">
                <TrendingUp className="h-3.5 w-3.5" /> Trending Now
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-zinc-100">
                Top Picks This Week
              </h2>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm max-w-lg">
                Our best-rated, in-stock products loved by thousands of customers.
              </p>
            </div>
            <Link href="/products">
              <Button variant="outline" className="rounded-full border-zinc-300 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800 font-semibold gap-2 cursor-pointer">
                View All <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {isLoading
              ? Array.from({ length: 4 }).map((_, idx) => <ProductCardSkeleton key={idx} />)
              : trendingProducts.slice(0, 4).map((product) => (
                  <ProductCard
                    key={product._id}
                    _id={product._id}
                    name={product.name}
                    price={product.price}
                    category={product.category}
                    rating={product.ratings?.average ?? 0}
                    ratingCount={product.ratings?.count ?? 0}
                    stock={product.stock ?? 99}
                    description={product.description}
                    imageUrl={product.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=400'}
                  />
                ))
            }
          </div>

          {/* Second row */}
          {trendingProducts.length > 4 && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mt-6">
              {trendingProducts.slice(4, 8).map((product) => (
                <ProductCard
                  key={product._id}
                  _id={product._id}
                  name={product.name}
                  price={product.price}
                  category={product.category}
                  rating={product.ratings?.average ?? 0}
                  ratingCount={product.ratings?.count ?? 0}
                  stock={product.stock ?? 99}
                  description={product.description}
                  imageUrl={product.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=400'}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── 5. STATS ────────────────────────────────────────────────────── */}
      <section className="w-full bg-gradient-to-br from-[#4F46E5] to-[#06B6D4] py-16 sm:py-20 text-white">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-2">Trusted by Thousands</h2>
            <p className="text-white/70 text-sm">Our numbers speak for themselves</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {STATS.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="h-8 w-8 rounded-xl bg-white/20 flex items-center justify-center">{s.icon}</div>
                </div>
                <div className="text-4xl font-black">{s.value}</div>
                <div className="text-white/70 text-sm mt-1">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. FEATURES ─────────────────────────────────────────────────── */}
      <section className="w-full bg-zinc-50 dark:bg-zinc-950 py-16 sm:py-20 border-b border-zinc-200/50 dark:border-zinc-800/50">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <SectionTitle
            badge="Why Choose Us"
            title={<>Built for Serious<br />Shoppers & Sellers</>}
            sub="Everything you need to buy, sell, and manage — in one beautifully designed platform."
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="group flex flex-col gap-4 rounded-2xl border border-zinc-200/60 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-xs hover:shadow-md hover:-translate-y-1 transition-all"
              >
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[#4F46E5]/10 to-[#06B6D4]/10 flex items-center justify-center text-[#4F46E5]">
                  {f.icon}
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">{f.title}</h3>
                  <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-1 leading-relaxed">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. PROMO BANNER ─────────────────────────────────────────────── */}
      <section className="w-full bg-white dark:bg-zinc-900 py-16 sm:py-20 border-b border-zinc-200/50 dark:border-zinc-800/50">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Banner 1 */}
            <div className="relative overflow-hidden rounded-3xl bg-zinc-900 p-8 text-white min-h-[220px] flex flex-col justify-end">
              <img
                src="https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&q=80&w=800"
                alt="Electronics Sale"
                className="absolute inset-0 w-full h-full object-cover opacity-40"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <div className="relative z-10">
                <span className="inline-block bg-[#4F46E5] text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full mb-3">Up to 40% Off</span>
                <h3 className="text-2xl font-extrabold">Electronics Sale</h3>
                <Link href="/products?category=Electronics" className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-white/80 hover:text-white transition-colors">
                  Shop Now <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
            {/* Banner 2 */}
            <div className="relative overflow-hidden rounded-3xl bg-zinc-900 p-8 text-white min-h-[220px] flex flex-col justify-end">
              <img
                src="https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?auto=format&fit=crop&q=80&w=800"
                alt="Fitness Deals"
                className="absolute inset-0 w-full h-full object-cover opacity-40"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <div className="relative z-10">
                <span className="inline-block bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full mb-3">New Collection</span>
                <h3 className="text-2xl font-extrabold">Fitness Essentials</h3>
                <Link href="/products?category=Fitness" className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-white/80 hover:text-white transition-colors">
                  Shop Now <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 8. TESTIMONIALS ─────────────────────────────────────────────── */}
      <section className="w-full bg-zinc-50 dark:bg-zinc-950 py-16 sm:py-20 border-b border-zinc-200/50 dark:border-zinc-800/50">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <SectionTitle badge="Customer Reviews" title="What Our Customers Say" sub="Thousands of happy customers trust Zevora for their everyday shopping needs." />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col gap-4 rounded-2xl border border-zinc-200/60 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-xs hover:shadow-md transition-shadow"
              >
                <Quote className="h-6 w-6 text-[#4F46E5] opacity-60" />
                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed flex-1">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                  <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[#4F46E5] to-[#06B6D4] flex items-center justify-center text-white text-xs font-extrabold shrink-0">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{t.name}</p>
                    <p className="text-[10px] text-zinc-500">{t.role}</p>
                  </div>
                  <div className="ml-auto flex text-amber-400">
                    {Array.from({ length: t.rating }).map((_, si) => (
                      <Star key={si} className="h-3.5 w-3.5 fill-current" />
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 9. FAQ ──────────────────────────────────────────────────────── */}
      <section className="w-full bg-white dark:bg-zinc-900 py-16 sm:py-20 border-b border-zinc-200/50 dark:border-zinc-800/50">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <SectionTitle badge="FAQ" title="Frequently Asked Questions" sub="Everything you need to know before making a purchase." />
          <div className="max-w-3xl mx-auto space-y-3">
            {FAQS.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left font-semibold text-sm text-zinc-900 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer gap-4"
                >
                  {faq.q}
                  <motion.span animate={{ rotate: openFaq === i ? 45 : 0 }} className="shrink-0 text-[#4F46E5]">+</motion.span>
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <p className="px-6 pb-5 text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed border-t border-zinc-100 dark:border-zinc-800 pt-3">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 10. NEWSLETTER ──────────────────────────────────────────────── */}
      <section className="w-full bg-zinc-950 dark:bg-black py-16 sm:py-24 text-white relative overflow-hidden border-t border-zinc-800">
        <div className="absolute -top-20 -left-20 h-64 w-64 rounded-full bg-[#4F46E5] blur-[100px] opacity-30" />
        <div className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-[#06B6D4] blur-[100px] opacity-30" />
        <div className="relative z-10 mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <div className="max-w-xl mx-auto text-center space-y-6">
            <div className="flex justify-center">
              <div className="h-14 w-14 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                <Mail className="h-7 w-7 text-white" />
              </div>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold">Stay in the Loop</h2>
            <p className="text-white/70 text-sm">Get exclusive deals, new arrivals, and curated picks delivered to your inbox every week.</p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="flex-1 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 px-5 py-3 text-sm text-white placeholder-white/50 outline-none focus:border-white/50 transition-colors"
              />
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="rounded-2xl bg-gradient-to-r from-[#4F46E5] to-[#06B6D4] px-6 py-3 text-sm font-bold text-white shadow-lg hover:shadow-xl transition-shadow shrink-0 cursor-pointer"
              >
                Subscribe
              </motion.button>
            </div>
            <p className="text-white/40 text-xs">No spam, ever. Unsubscribe anytime.</p>
          </div>
        </div>
      </section>

      {/* ── 11. FINAL CTA ───────────────────────────────────────────────── */}
      {!isSignedIn && (
        <section className="w-full bg-zinc-50 dark:bg-zinc-950 py-16 sm:py-20 text-center">
          <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 space-y-6">
            <SectionTitle
              title={<>Ready to Start<br className="hidden sm:block" /> Shopping?</>}
              sub="Create your free account and unlock personalized deals, AI-powered recommendations, and more."
            />
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/sign-up">
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#4F46E5] to-[#06B6D4] px-8 py-4 text-sm font-bold text-white shadow-lg hover:shadow-xl transition-shadow"
                >
                  <Zap className="h-4 w-4" />
                  Create Free Account
                  <ArrowRight className="h-4 w-4" />
                </motion.button>
              </Link>
              <Link href="/products">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center gap-2 rounded-2xl border-2 border-zinc-300 dark:border-zinc-700 px-8 py-4 text-sm font-bold text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <Tag className="h-4 w-4" />
                  Browse Without Account
                </motion.button>
              </Link>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-500 dark:text-zinc-400 mt-4">
              {['No credit card required', 'Free returns', '1-Year warranty'].map((item, i) => (
                <span key={i} className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />{item}</span>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
