'use client';

import React, { useEffect } from 'react';
import { ClerkProvider, useUser } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import { useTheme } from 'next-themes';
import { ThemeProvider } from './theme-provider';
import { QueryProvider } from './query-provider';
import { RBACProvider } from './rbac-context';
import { setApiUserEmail } from '@/lib/axios';

interface AppProviderProps {
  children: React.ReactNode;
}

/** Syncs Clerk user email into localStorage so apiClient can attach it as x-user-email header */
function ClerkEmailSync() {
  const { user, isLoaded } = useUser();
  useEffect(() => {
    if (!isLoaded) return;
    setApiUserEmail(user?.primaryEmailAddress?.emailAddress ?? null);
  }, [isLoaded, user]);
  return null;
}

function ClerkThemeWrapper({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme();

  return (
    <ClerkProvider
      appearance={{
        baseTheme: resolvedTheme === 'dark' ? dark : undefined,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any}
    >
      <ClerkEmailSync />
      {children}
    </ClerkProvider>
  );
}

export function AppProvider({ children }: AppProviderProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <ClerkThemeWrapper>
        <RBACProvider>
          <QueryProvider>{children}</QueryProvider>
        </RBACProvider>
      </ClerkThemeWrapper>
    </ThemeProvider>
  );
}

export default AppProvider;
