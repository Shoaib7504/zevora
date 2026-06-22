'use client';

import React from 'react';
import { useRole, UserRole } from '@/providers/rbac-context';
import { ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface RBACGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

export function RBACGuard({ children, allowedRoles }: RBACGuardProps) {
  const { role, isLoaded } = useRole();

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center py-20 text-zinc-500">
        <span>Checking access credentials...</span>
      </div>
    );
  }

  if (!allowedRoles.includes(role)) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 transition-colors max-w-2xl mx-auto my-10 shadow-xs">
        <div className="rounded-full bg-red-50 p-3.5 dark:bg-red-950/20 text-red-500 mb-4 animate-bounce">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Access Restrained</h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2 max-w-md leading-relaxed">
          Your current session role is <strong className="uppercase text-red-500">&ldquo;{role}&rdquo;</strong>. This resource requires administrative privileges associated with one of: <strong className="uppercase text-zinc-700 dark:text-zinc-300">[{allowedRoles.join(', ')}]</strong>.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <Link href="/dashboard/settings">
            <Button className="cursor-pointer bg-[#4F46E5] hover:bg-[#4F46E5]/90 text-white font-semibold">
              Go to Role Simulator
            </Button>
          </Link>
          <Link href="/dashboard/overview">
            <Button variant="outline" className="cursor-pointer">
              Back to Overview
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export default RBACGuard;
