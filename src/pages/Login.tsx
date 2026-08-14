import { useState } from 'react'
import type { FormEvent } from 'react'
import { Eye, EyeOff, Loader2, MailCheck } from 'lucide-react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Starfield } from '../components/space/Starfield'
import { useAuth } from '../hooks/useAuth'

type Mode = 'sign-in' | 'sign-up' | 'recover' | 'reset'
type Status = 'idle' | 'submitting' | 'confirmation-sent' | 'recovery-sent' | 'password-updated' | 'error'

export default function Login() {
  const { session, signIn, signUp, sendPasswordReset, updatePassword } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const resetRequested = new URLSearchParams(location.search).get('reset') === '1'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [mode, setMode] = useState<Mode>(resetRequested ? 'reset' : 'sign-in')
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState('')

  const from = typeof location.state === 'object' && location.state && 'from' in location.state
    ? String(location.state.from || '/')
    : '/'
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  const validPassword = password.length >= 6
  const valid = mode === 'recover' ? validEmail : mode === 'reset' ? validPassword : validEmail && validPassword

  if (session && mode !== 'reset') return <Navigate to={from} replace />

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!valid || status === 'submitting') return
    setStatus('submitting')
    setError('')
    try {
      if (mode === 'recover') {
        await sendPasswordReset(email.trim())
        setStatus('recovery-sent')
        return
      }

      if (mode === 'reset') {
        await updatePassword(password)
        setStatus('password-updated')
        setPassword('')
        return
      }

      if (mode === 'sign-in') {
        await signIn(email.trim(), password)
        navigate(from, { replace: true })
        return
      }

      const result = await signUp(email.trim(), password)
      if (result.needsConfirmation) {
        setStatus('confirmation-sent')
        return
      }

      navigate(from, { replace: true })
    } catch (err) {
      setStatus('error')
      setError(err instanceof Error ? err.message : 'Accesso non riuscito. Controlla email e password.')
    }
  }

  function switchMode(nextMode: Mode) {
    setMode(nextMode)
    setStatus('idle')
    setError('')
  }

  const isPasswordMode = mode !== 'recover'
  const submitLabel = {
    'sign-in': 'Accedi',
    'sign-up': 'Crea account',
    recover: 'Invia email di recupero',
    reset: 'Aggiorna password',
  }[mode]

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

        {status === 'confirmation-sent' || status === 'recovery-sent' || status === 'password-updated' ? (
          <div className="mt-10 rounded-3xl bg-card p-6">
            <MailCheck className="h-8 w-8 text-accent-glow" aria-hidden />
            <h2 className="mt-4 text-xl font-extrabold">
              {status === 'password-updated' ? 'Password aggiornata' : 'Controlla la posta'}
            </h2>
            <p className="mt-2 text-text-muted">
              {status === 'confirmation-sent' && (
                <>
                  Supabase ha inviato un'email di conferma a <span className="text-text-primary">{email}</span>.
                  Dopo la conferma potrai accedere con email e password.
                </>
              )}
              {status === 'recovery-sent' && (
                <>
                  Ho inviato un link di recupero a <span className="text-text-primary">{email}</span>.
                  Aprilo per scegliere una nuova password.
                </>
              )}
              {status === 'password-updated' && 'Ora puoi usare la nuova password per accedere.'}
            </p>
            <button
              type="button"
              onClick={() => switchMode('sign-in')}
              className="mt-5 text-accent-glow underline underline-offset-4"
            >
              Vai al login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-10">
            {mode !== 'recover' && mode !== 'reset' && (
              <div className="mb-6 grid grid-cols-2 rounded-2xl border border-hairline bg-card p-1">
                <button
                  type="button"
                  onClick={() => switchMode('sign-in')}
                  className={`rounded-xl px-4 py-3 text-sm font-extrabold transition ${
                    mode === 'sign-in' ? 'bg-accent text-text-primary' : 'text-text-muted'
                  }`}
                >
                  Accedi
                </button>
                <button
                  type="button"
                  onClick={() => switchMode('sign-up')}
                  className={`rounded-xl px-4 py-3 text-sm font-extrabold transition ${
                    mode === 'sign-up' ? 'bg-accent text-text-primary' : 'text-text-muted'
                  }`}
                >
                  Registrati
                </button>
              </div>
            )}

            {mode !== 'reset' && (
              <>
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
              </>
            )}

            {isPasswordMode && (
              <>
                <label htmlFor="password" className={mode === 'reset' ? 'block text-sm font-semibold text-text-muted' : 'mt-5 block text-sm font-semibold text-text-muted'}>
                  {mode === 'reset' ? 'Nuova password' : 'Password'}
                </label>
                <div className="mt-2 flex rounded-2xl border border-hairline bg-card focus-within:border-accent">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'}
                    autoFocus={mode === 'reset'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      if (status === 'error') setStatus('idle')
                    }}
                    placeholder="Minimo 6 caratteri"
                    className="min-w-0 flex-1 rounded-l-2xl bg-transparent px-5 py-4 text-lg text-text-primary placeholder:text-text-muted focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="flex w-14 items-center justify-center rounded-r-2xl text-text-muted transition hover:text-text-primary"
                    aria-label={showPassword ? 'Nascondi password' : 'Mostra password'}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" aria-hidden />
                    ) : (
                      <Eye className="h-5 w-5" aria-hidden />
                    )}
                  </button>
                </div>
              </>
            )}

            {status === 'error' && (
              <p role="alert" className="mt-3 text-sm text-danger">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={!valid || status === 'submitting'}
              className="mt-5 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-accent text-lg font-extrabold text-text-primary transition active:scale-[0.98] disabled:opacity-40"
            >
              {status === 'submitting' && <Loader2 className="h-5 w-5 animate-spin" aria-hidden />}
              {submitLabel}
            </button>

            <p className="mt-4 text-center text-sm text-text-muted">
              {mode === 'sign-in' && 'Usa la password associata al tuo account.'}
              {mode === 'sign-up' && 'La password deve avere almeno 6 caratteri.'}
              {mode === 'recover' && 'Riceverai un link per scegliere una nuova password.'}
              {mode === 'reset' && 'Scegli una nuova password di almeno 6 caratteri.'}
            </p>

            {mode === 'sign-in' && (
              <button
                type="button"
                onClick={() => switchMode('recover')}
                className="mx-auto mt-5 block text-sm font-semibold text-accent-glow underline underline-offset-4"
              >
                Password dimenticata?
              </button>
            )}

            {(mode === 'recover' || mode === 'reset') && (
              <button
                type="button"
                onClick={() => switchMode('sign-in')}
                className="mx-auto mt-5 block text-sm font-semibold text-accent-glow underline underline-offset-4"
              >
                Torna al login
              </button>
            )}
          </form>
        )}
      </main>
    </div>
  )
}
