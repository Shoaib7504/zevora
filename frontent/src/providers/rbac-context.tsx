'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';

export type UserRole = 'user' | 'manager' | 'admin';

// The admin email — automatically gets admin role on login
const ADMIN_EMAIL = 'shoaibhossain188@gmail.com';

interface RBACContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  isLoaded: boolean;
}

const RBACContext = createContext<RBACContextType | undefined>(undefined);

export function RBACProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoaded: clerkLoaded } = useUser();
  const [role, setRoleState] = useState<UserRole>('user');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!clerkLoaded) return;

    // Auto-detect admin role from Clerk email
    const primaryEmail = user?.primaryEmailAddress?.emailAddress?.toLowerCase();

    if (primaryEmail === ADMIN_EMAIL.toLowerCase()) {
      // Always admin for the admin email
      setRoleState('admin');
      localStorage.setItem('demo-user-role', 'admin');
      setIsLoaded(true);
      return;
    }

    // For other users, check localStorage override (for demo/manager testing)
    const savedRole = localStorage.getItem('demo-user-role') as UserRole;
    if (savedRole && ['user', 'manager', 'admin'].includes(savedRole)) {
      // Don't allow non-admin-email users to claim admin role via localStorage
      const safeRole = savedRole === 'admin' ? 'user' : savedRole;
      setRoleState(safeRole);
    } else {
      setRoleState('user');
    }

    setIsLoaded(true);
  }, [clerkLoaded, user]);

  const setRole = (newRole: UserRole) => {
    // Prevent non-admin emails from claiming admin role
    const primaryEmail = user?.primaryEmailAddress?.emailAddress?.toLowerCase();
    if (newRole === 'admin' && primaryEmail !== ADMIN_EMAIL.toLowerCase()) {
      return;
    }
    setRoleState(newRole);
    localStorage.setItem('demo-user-role', newRole);
  };

  return (
    <RBACContext.Provider value={{ role, setRole, isLoaded }}>
      {children}
    </RBACContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RBACContext);
  if (context === undefined) {
    throw new Error('useRole must be used within a RBACProvider');
  }
  return context;
}
