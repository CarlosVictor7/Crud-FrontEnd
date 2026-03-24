import { QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { queryClient } from '@/app/query-client'

interface AppProvidersProps {
  children: ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  )
}
