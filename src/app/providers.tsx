// src/app/providers.tsx
// Centralized client-side providers
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/hooks/useAuth'
import { useState } from 'react'

// Conditionally import devtools only in development
let ReactQueryDevtools: any = null
if (process.env.NODE_ENV === 'development') {
  try {
    ReactQueryDevtools = require('@tanstack/react-query-devtools').ReactQueryDevtools
  } catch (e) {
    // Devtools not installed, ignore
  }
}

export function Providers({ children }: { children: React.ReactNode }) {
  // Create a QueryClient instance for each request
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: 1,
        staleTime: 5 * 60 * 1000, // 5 minutes
      },
    },
  }))

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {children}
      </AuthProvider>
      {process.env.NODE_ENV === 'development' && ReactQueryDevtools && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  )
}
