import { Suspense, lazy } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import type { ReactNode } from 'react'
import { AuthProvider } from './hooks/useAuth'
import { isSupabaseConfigured } from './lib/supabase'
import { MissingConfig } from './components/MissingConfig'
import { useSeed } from './hooks/useSeed'
import { RequireAuth } from './components/RequireAuth'
import Login from './pages/Login'
import Subscriptions from './pages/Subscriptions'
import Calendar from './pages/Calendar'
import Settings from './pages/Settings'
import SubscriptionDetail from './pages/SubscriptionDetail'

import ListsSettings from './pages/settings/ListsSettings'
import CategoriesSettings from './pages/settings/CategoriesSettings'
import PaymentMethodsSettings from './pages/settings/PaymentMethodsSettings'

// Recharts pesa quanto tutto il resto dell'app: si carica solo all'apertura
// delle statistiche, non all'avvio.
const Statistics = lazy(() => import('./pages/Statistics'))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // I dati cambiano solo per mano mia: rifetch aggressivi non servono
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

/** Wrapper delle rotte protette: qui gira anche il seed al primo accesso. */
function Protected({ children }: { children: ReactNode }) {
  return (
    <RequireAuth>
      <Seeded>{children}</Seeded>
    </RequireAuth>
  )
}

function Seeded({ children }: { children: ReactNode }) {
  useSeed()
  return <>{children}</>
}

export default function App() {
  // Senza chiavi Supabase ogni query fallirebbe: meglio dirlo esplicitamente
  if (!isSupabaseConfigured) return <MissingConfig />

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Protected><Subscriptions /></Protected>} />
            <Route path="/calendario" element={<Protected><Calendar /></Protected>} />
            <Route
              path="/statistiche"
              element={
                <Protected>
                  <Suspense fallback={<div className="min-h-viewport bg-bg" />}>
                    <Statistics />
                  </Suspense>
                </Protected>
              }
            />
            <Route path="/abbonamento/:id" element={<Protected><SubscriptionDetail /></Protected>} />
            <Route path="/impostazioni" element={<Protected><Settings /></Protected>} />
            <Route path="/impostazioni/liste" element={<Protected><ListsSettings /></Protected>} />
            <Route
              path="/impostazioni/categorie"
              element={<Protected><CategoriesSettings /></Protected>}
            />
            <Route
              path="/impostazioni/metodi-pagamento"
              element={<Protected><PaymentMethodsSettings /></Protected>}
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
