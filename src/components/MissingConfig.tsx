import { TriangleAlert } from 'lucide-react'

/** Schermata mostrata quando mancano le chiavi Supabase in `.env.local`. */
export function MissingConfig() {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-app flex-col justify-center px-6">
      <TriangleAlert className="h-8 w-8 text-warning" aria-hidden />
      <h1 className="mt-4 text-2xl font-extrabold">Configurazione mancante</h1>
      <p className="mt-2 text-text-muted">
        Crea il file <code className="text-text-primary">.env.local</code> nella radice del
        progetto con le due chiavi del progetto Supabase, poi riavvia il server di sviluppo.
      </p>
      <pre className="mt-4 overflow-x-auto rounded-2xl bg-card p-4 text-[13px] text-text-primary">
        {'VITE_SUPABASE_URL=https://xxxx.supabase.co\nVITE_SUPABASE_ANON_KEY=eyJhbGciOi…'}
      </pre>
      <p className="mt-4 text-sm text-text-muted">
        Le trovi in Supabase → Project Settings → API.
      </p>
    </div>
  )
}
