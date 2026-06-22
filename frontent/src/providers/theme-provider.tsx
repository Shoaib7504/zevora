'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  // Suppress false positive React 19 warning about next-themes injecting inline script tag
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    const origError = console.error;
    console.error = (...args: any[]) => {
      if (
        typeof args[0] === 'string' &&
        (args[0].includes('Encountered a script tag while rendering React component') ||
         args[0].includes('Scripts inside React components are never executed'))
      ) {
        return;
      }
      origError.apply(console, args);
    };
  }

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}

export default ThemeProvider;
