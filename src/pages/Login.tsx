import { useState } from 'react'
import type { FormEvent } from 'react'
import { MailCheck, Loader2 } from 'lucide-react'
import { Starfield } from '../components/space/Starfield'
import { useAuth } from '../hooks/useAuth'

type Status = 'idle' | 'sending' | 'sent' | 'error'

export default function Login() {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState('')

  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!valid || status === 'sending') return
    setStatus('sending')
    setError('')
    try {
      await signIn(email.trim())
      setStatus('sent')
    } catch (err) {
      setStatus('error')
      setError(err instanceof Error ? err.message : 'Invio non riuscito. Riprova.')
    }
  }

  return (
    <div className="relative min-h-full overflow-hidden bg-bg">
      <Starfield />
      {/* Alone viola dietro al contenuto */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/3 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(108,75,246,.35) 0%, transparent 70%)' }}
        aria-hidden
      />

      <main className="relative mx-auto flex min-h-screen w-full max-w-app flex-col justify-center px-6">
        <h1 className="hero-number text-5xl">Rinnovi</h1>
        <p className="mt-3 text-lg text-text-muted">
          I tuoi abbonamenti, e quanto ti costano davvero in un anno.
        </p>

        {status === 'sent' ? (
          <div className="mt-10 rounded-3xl bg-card p-6">
            <MailCheck className="h-8 w-8 text-accent-glow" aria-hidden />
            <h2 className="mt-4 text-xl font-extrabold">Controlla la posta</h2>
            <p className="mt-2 text-text-muted">
              Ho inviato un link di accesso a <span className="text-text-primary">{email}</span>.
              Aprilo da questo dispositivo per entrare.
            </p>
            <button
              type="button"
              onClick={() => setStatus('idle')}
              className="mt-5 text-accent-glow underline underline-offset-4"
            >
              Usa un altro indirizzo
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-10">
            <label htmlFor="email" className="block text-sm font-semibold text-text-muted">
              Indirizzo email
            </label>
            <input
              id="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (status === 'error') setStatus('idle')
              }}
              placeholder="tu@esempio.it"
              className="mt-2 w-full rounded-2xl border border-hairline bg-card px-5 py-4 text-lg text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none"
            />

            {status === 'error' && (
              <p role="alert" className="mt-3 text-sm text-danger">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={!valid || status === 'sending'}
              className="mt-5 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-accent text-lg font-extrabold text-text-primary transition active:scale-[0.98] disabled:opacity-40"
            >
              {status === 'sending' && <Loader2 className="h-5 w-5 animate-spin" aria-hidden />}
              Invia link di accesso
            </button>

            <p className="mt-4 text-center text-sm text-text-muted">
              Nessuna password. Ricevi un link e sei dentro.
            </p>
          </form>
        )}
      </main>
    </div>
  )
}
