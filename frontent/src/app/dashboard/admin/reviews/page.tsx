'use client';

import React from 'react';
import { RBACGuard } from '@/components/shared/RBACGuard';
import { Check, Trash2, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminReviews() {
  const reviews = [
    { id: '1', product: 'Noise Cancelling Headphones', user: 'Charlie Brown', rating: 5, comment: 'Absolutely stunning active noise reduction! Very comfortable for long coding sessions.', status: 'Pending Approval' },
    { id: '2', product: 'Minimalist Wireless Keyboard', user: 'Diana Prince', rating: 4, comment: 'Nice click response and premium aluminum chassis. Key travel is slightly shallow but highly responsive.', status: 'Pending Approval' },
    { id: '3', product: 'Smart Stainless Steel Bottle', user: 'Alice Johnson', rating: 2, comment: 'Connection drops sometimes, battery tracking could be better. Overall decent build.', status: 'Pending Approval' },
  ];

  return (
    <RBACGuard allowedRoles={['admin', 'manager']}>
      <div className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Review Moderation</h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm">
            Approve or reject customer product reviews before they go live.
          </p>
        </div>

        {/* Reviews list */}
        <div className="grid gap-6">
          {reviews.map((r) => (
            <div 
              key={r.id} 
              className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 transition-colors flex flex-col md:flex-row md:items-start justify-between gap-6"
            >
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{r.user}</span>
                  <span className="text-xs text-zinc-400">on</span>
                  <span className="text-xs font-bold text-[#4F46E5]">{r.product}</span>
                  <span className="inline-flex items-center gap-1 rounded bg-amber-50 dark:bg-amber-950/20 px-1.5 py-0.5 text-[10px] font-bold text-[#F59E0B] border border-amber-200/30">
                    <ShieldAlert className="h-3 w-3" />
                    <span>{r.status}</span>
                  </span>
                </div>

                <div className="flex items-center text-[#F59E0B]">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className={`text-sm ${i < r.rating ? 'opacity-100' : 'opacity-30'}`}>★</span>
                  ))}
                </div>

                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed italic">
                  &ldquo;{r.comment}&rdquo;
                </p>
              </div>

              <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
                <Button size="sm" className="cursor-pointer bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center gap-1">
                  <Check className="h-4 w-4" />
                  <span>Approve</span>
                </Button>
                <Button size="sm" variant="ghost" className="cursor-pointer border border-zinc-200 hover:border-transparent text-red-500 hover:bg-red-50 dark:border-zinc-800 dark:hover:bg-red-950/20 flex items-center gap-1">
                  <Trash2 className="h-4 w-4" />
                  <span>Reject</span>
                </Button>
              </div>

            </div>
          ))}
        </div>

      </div>
    </RBACGuard>
  );
}
