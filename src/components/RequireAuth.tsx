import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

/**
 * Protegge le rotte. Mentre la sessione si risolve mostra uno spinner:
 * senza questo si vedrebbe un lampo della schermata di login a ogni apertura (§3).
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex min-h-viewport items-center justify-center bg-bg">
        <Loader2 className="h-6 w-6 animate-spin text-accent-glow" aria-label="Caricamento" />
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <>{children}</>
}
