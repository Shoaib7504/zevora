'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { motion } from 'motion/react';
import { CheckCircle2, ShoppingBag, Truck, Shield, Loader2, ArrowLeft } from 'lucide-react';
import { useCartStore } from '@/store/use-cart-store';
import apiClient from '@/lib/axios';

interface ShippingForm {
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  notes: string;
}

const INITIAL_FORM: ShippingForm = {
  fullName: '', phone: '', street: '', city: '', state: '', zip: '', country: 'Bangladesh', notes: '',
};

export default function CheckoutPage() {
  const { items, clearCart, totalPrice } = useCartStore();
  const { user } = useUser();
  const router = useRouter();
  const [form, setForm] = useState<ShippingForm>({
    ...INITIAL_FORM,
    fullName: user ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() : '',
  });
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const subtotal = totalPrice();
  const shippingFee = subtotal >= 100 ? 0 : 5.99;
  const total = subtotal + shippingFee;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (items.length === 0) {
      setError('Your cart is empty.');
      return;
    }

    const required: (keyof ShippingForm)[] = ['fullName', 'phone', 'street', 'city', 'state', 'zip', 'country'];
    for (const field of required) {
      if (!form[field].trim()) {
        setError(`Please fill in: ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return;
      }
    }

    setLoading(true);
    try {
      const orderItems = items.map((item) => ({
        productId: item._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        category: item.category,
      }));

      const res = await apiClient.post('/orders', {
        items: orderItems,
        shippingAddress: {
          fullName: form.fullName,
          phone: form.phone,
          street: form.street,
          city: form.city,
          state: form.state,
          zip: form.zip,
          country: form.country,
        },
        notes: form.notes,
      });

      setOrderId(res.data.data._id);
      clearCart();
    } catch (err: any) {
      setError(err.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Order Success State ──
  if (orderId) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-16">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center max-w-md space-y-6"
        >
          <div className="h-20 w-20 rounded-full bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-10 w-10 text-emerald-500" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">Order Confirmed! 🎉</h1>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm">
              Thank you for your purchase! Your order has been placed and is being processed.
            </p>
          </div>
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-4 text-left space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">Order ID</p>
            <p className="font-mono text-sm text-zinc-900 dark:text-zinc-100 break-all">{orderId}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/products"
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-[#4F46E5] text-[#4F46E5] font-bold text-sm hover:bg-[#4F46E5] hover:text-white transition-all"
            >
              <ShoppingBag className="h-4 w-4" />
              Continue Shopping
            </Link>
            <Link
              href="/dashboard/overview"
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-[#4F46E5] to-[#06B6D4] text-white font-bold text-sm shadow-md"
            >
              View My Orders
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 py-16 space-y-4">
        <ShoppingBag className="h-12 w-12 text-zinc-300" />
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Your cart is empty</h2>
        <Link href="/products" className="text-[#4F46E5] font-semibold hover:underline">Browse Products →</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-8 transition-colors">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-8">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-sm font-semibold text-zinc-500 hover:text-[#4F46E5] transition-colors cursor-pointer mb-2">
            <ArrowLeft className="h-4 w-4" /> Back to Cart
          </button>
          <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">Checkout</h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-0.5">Complete your delivery information to confirm your order.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-6">

            {/* ── Left: Delivery Form ── */}
            <div className="lg:col-span-2 space-y-5">

              {/* Delivery Details Card */}
              <div className="rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 p-6 shadow-xs space-y-5">
                <div className="flex items-center gap-3 pb-4 border-b border-zinc-100 dark:border-zinc-800">
                  <div className="h-8 w-8 rounded-xl bg-[#4F46E5]/10 flex items-center justify-center">
                    <Truck className="h-4 w-4 text-[#4F46E5]" />
                  </div>
                  <h2 className="font-bold text-zinc-900 dark:text-zinc-100">Delivery Information</h2>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { name: 'fullName', label: 'Full Name', placeholder: 'John Doe', type: 'text' },
                    { name: 'phone', label: 'Phone Number', placeholder: '+880 1XXXXXXXXX', type: 'tel' },
                  ].map((field) => (
                    <div key={field.name} className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                        {field.label} *
                      </label>
                      <input
                        type={field.type}
                        name={field.name}
                        value={(form as any)[field.name]}
                        onChange={handleChange}
                        placeholder={field.placeholder}
                        className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-4 py-2.5 text-sm outline-none focus:border-[#4F46E5] dark:focus:border-[#4F46E5] transition-all"
                      />
                    </div>
                  ))}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">Street Address *</label>
                  <input
                    type="text"
                    name="street"
                    value={form.street}
                    onChange={handleChange}
                    placeholder="House #, Road #, Area"
                    className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-4 py-2.5 text-sm outline-none focus:border-[#4F46E5] dark:focus:border-[#4F46E5] transition-all"
                  />
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                  {[
                    { name: 'city', label: 'City', placeholder: 'Dhaka' },
                    { name: 'state', label: 'Division / State', placeholder: 'Dhaka Division' },
                    { name: 'zip', label: 'ZIP / Postal Code', placeholder: '1200' },
                  ].map((field) => (
                    <div key={field.name} className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">{field.label} *</label>
                      <input
                        type="text"
                        name={field.name}
                        value={(form as any)[field.name]}
                        onChange={handleChange}
                        placeholder={field.placeholder}
                        className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-4 py-2.5 text-sm outline-none focus:border-[#4F46E5] dark:focus:border-[#4F46E5] transition-all"
                      />
                    </div>
                  ))}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">Country *</label>
                  <select
                    name="country"
                    value={form.country}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-4 py-2.5 text-sm outline-none focus:border-[#4F46E5] dark:focus:border-[#4F46E5] transition-all cursor-pointer"
                  >
                    {['Bangladesh', 'India', 'Pakistan', 'United States', 'United Kingdom', 'Canada', 'Australia', 'Other'].map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">Order Notes (Optional)</label>
                  <textarea
                    name="notes"
                    value={form.notes}
                    onChange={handleChange}
                    placeholder="Any special delivery instructions..."
                    rows={3}
                    className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-4 py-2.5 text-sm outline-none focus:border-[#4F46E5] dark:focus:border-[#4F46E5] transition-all resize-none"
                  />
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 px-4 py-3 text-sm font-semibold text-red-600 dark:text-red-400">
                  ⚠ {error}
                </div>
              )}
            </div>

            {/* ── Right: Order Summary ── */}
            <div className="lg:col-span-1">
              <div className="rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 p-6 shadow-xs sticky top-24 space-y-5">
                <h2 className="font-extrabold text-zinc-900 dark:text-zinc-100">Your Order</h2>

                {/* Items */}
                <div className="space-y-3 max-h-52 overflow-y-auto pr-1">
                  {items.map((item) => (
                    <div key={item._id} className="flex items-center gap-3">
                      <div className="relative h-10 w-10 shrink-0 rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                        {item.image ? (
                          <Image src={item.image} alt={item.name} fill className="object-cover" />
                        ) : <div className="h-full flex items-center justify-center text-sm">📦</div>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">{item.name}</p>
                        <p className="text-[10px] text-zinc-500">×{item.quantity}</p>
                      </div>
                      <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 shrink-0">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 space-y-2 text-sm">
                  <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                    <span>Subtotal</span><span className="font-semibold">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                    <span>Shipping</span>
                    {shippingFee === 0
                      ? <span className="font-bold text-emerald-500">FREE</span>
                      : <span className="font-semibold">${shippingFee.toFixed(2)}</span>}
                  </div>
                  <div className="flex justify-between font-extrabold text-zinc-900 dark:text-zinc-100 text-lg pt-2 border-t border-zinc-100 dark:border-zinc-800">
                    <span>Total</span><span>${total.toFixed(2)}</span>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.97 }}
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm bg-gradient-to-r from-[#4F46E5] to-[#06B6D4] text-white shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-70"
                >
                  {loading ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Placing Order...</>
                  ) : (
                    <><Shield className="h-4 w-4" /> Confirm Order — ${total.toFixed(2)}</>
                  )}
                </motion.button>

                <p className="text-center text-[11px] text-zinc-400">
                  🔒 Secure checkout. Your data is protected.
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
