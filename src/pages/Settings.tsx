import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ChevronRight,
  CreditCard,
  Download,
  LayoutGrid,
  List,
  LogOut,
  Sparkles,
  Trash2,
  Upload,
} from 'lucide-react'
import { PageShell } from '../components/layout/PageShell'
import { CardGroup, CardRow, Card } from '../components/ui/Card'
import { Pill } from '../components/ui/Pill'
import { useAuth } from '../hooks/useAuth'
import { AVAILABLE_CURRENCIES, usePreferredCurrency } from '../hooks/usePreferences'
import {
  useDeleteAllData,
  useExportBackup,
  useImportBackup,
  useLoadSampleData,
} from '../hooks/useDataActions'
import type { ImportMode } from '../hooks/useDataActions'
import { parseBackup } from '../lib/backup'
import type { Backup } from '../lib/backup'

const APP_VERSION = '1.0.0'

export default function Settings() {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const { currency, setCurrency } = usePreferredCurrency()

  const exportBackup = useExportBackup()
  const importBackup = useImportBackup()
  const loadSample = useLoadSampleData()
  const deleteAll = useDeleteAllData()

  const fileInput = useRef<HTMLInputElement>(null)
  const [pendingBackup, setPendingBackup] = useState<Backup | null>(null)
  const [deleteStep, setDeleteStep] = useState<0 | 1 | 2>(0)
  const [error, setError] = useState('')

  async function handleFile(file: File) {
    setError('')
    try {
      setPendingBackup(parseBackup(await file.text()))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'File non leggibile')
    }
  }

  function runImport(mode: ImportMode) {
    if (!pendingBackup) return
    importBackup.mutate(
      { backup: pendingBackup, mode },
      { onSettled: () => setPendingBackup(null) }
    )
  }

  return (
    <PageShell>
      <div className="px-5 pt-safe-page">
        <h1 className="hero-number text-[48px] leading-none">Impostazioni</h1>

        <section className="mt-8">
          <h2 className="mb-2 px-1 text-[13px] font-bold uppercase tracking-wide text-text-muted">
            Preferenze
          </h2>
          <CardGroup>
            <div className="flex items-center gap-3 px-4 py-4">
              <span className="flex-1">Valuta preferita</span>
              <select
                aria-label="Valuta preferita"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="bg-transparent text-right text-text-muted focus:outline-none"
              >
                {AVAILABLE_CURRENCIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <CardRow
              icon={<List className="h-4 w-4" aria-hidden />}
              label="Liste"
              trailing={<ChevronRight className="h-4 w-4 text-text-muted" aria-hidden />}
              onClick={() => navigate('/impostazioni/liste')}
            />
            <CardRow
              icon={<LayoutGrid className="h-4 w-4" aria-hidden />}
              label="Categorie"
              trailing={<ChevronRight className="h-4 w-4 text-text-muted" aria-hidden />}
              onClick={() => navigate('/impostazioni/categorie')}
            />
            <CardRow
              icon={<CreditCard className="h-4 w-4" aria-hidden />}
              label="Metodi di pagamento"
              trailing={<ChevronRight className="h-4 w-4 text-text-muted" aria-hidden />}
              onClick={() => navigate('/impostazioni/metodi-pagamento')}
            />
          </CardGroup>
        </section>

        <section className="mt-6">
          <h2 className="mb-2 px-1 text-[13px] font-bold uppercase tracking-wide text-text-muted">
            Dati
          </h2>
          <CardGroup>
            <CardRow
              icon={<Download className="h-4 w-4" aria-hidden />}
              label="Esporta backup JSON"
              onClick={() => exportBackup.mutate()}
            />
            <CardRow
              icon={<Upload className="h-4 w-4" aria-hidden />}
              label="Importa backup JSON"
              onClick={() => fileInput.current?.click()}
            />
            <CardRow
              icon={<Sparkles className="h-4 w-4" aria-hidden />}
              label={loadSample.isPending ? 'Inserimento…' : 'Carica dati di esempio'}
              onClick={() => loadSample.mutate()}
            />
            <CardRow
              icon={<Trash2 className="h-4 w-4" aria-hidden />}
              label="Cancella tutti i dati"
              danger
              onClick={() => setDeleteStep(1)}
            />
          </CardGroup>

          <input
            ref={fileInput}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) void handleFile(file)
              e.target.value = ''
            }}
          />

          {error && (
            <p role="alert" className="mt-3 px-1 text-sm text-danger">
              {error}
            </p>
          )}

          {/* Scelta della modalità di import (§7.8) */}
          {pendingBackup && (
            <Card className="mt-3 px-4 py-4" raised>
              <p className="font-bold">Come vuoi importare?</p>
              <p className="mt-1 text-sm text-text-muted">
                «Unisci» aggiunge ai dati esistenti. «Sostituisci» cancella prima tutto.
              </p>
              <div className="mt-4 flex gap-2">
                <Pill variant="muted" className="h-11 flex-1 justify-center" onClick={() => setPendingBackup(null)}>
                  Annulla
                </Pill>
                <Pill variant="muted" className="h-11 flex-1 justify-center" onClick={() => runImport('merge')}>
                  Unisci
                </Pill>
                <Pill variant="accent" className="h-11 flex-1 justify-center" onClick={() => runImport('replace')}>
                  Sostituisci
                </Pill>
              </div>
            </Card>
          )}

          {/* Doppia conferma per la cancellazione totale */}
          {deleteStep > 0 && (
            <Card className="mt-3 px-4 py-4" raised>
              <p className="font-bold text-danger">
                {deleteStep === 1 ? 'Cancellare tutti i dati?' : 'Sei proprio sicuro?'}
              </p>
              <p className="mt-1 text-sm text-text-muted">
                {deleteStep === 1
                  ? 'Spariscono abbonamenti, liste, categorie, metodi e storico prezzi.'
                  : 'Non è reversibile. Esporta un backup se hai dubbi.'}
              </p>
              <div className="mt-4 flex gap-2">
                <Pill variant="muted" className="h-11 flex-1 justify-center" onClick={() => setDeleteStep(0)}>
                  Annulla
                </Pill>
                <button
                  type="button"
                  onClick={() => {
                    if (deleteStep === 1) setDeleteStep(2)
                    else deleteAll.mutate(undefined, { onSettled: () => setDeleteStep(0) })
                  }}
                  className="h-11 flex-1 rounded-full bg-danger font-bold text-text-primary"
                >
                  {deleteStep === 1 ? 'Continua' : 'Cancella tutto'}
                </button>
              </div>
            </Card>
          )}
        </section>

        <section className="mt-6">
          <h2 className="mb-2 px-1 text-[13px] font-bold uppercase tracking-wide text-text-muted">
            Account
          </h2>
          <CardGroup>
            <CardRow label="Email" value={user?.email ?? '—'} />
            <CardRow
              icon={<LogOut className="h-4 w-4" aria-hidden />}
              label="Esci"
              onClick={() => void signOut()}
            />
          </CardGroup>
        </section>

        <section className="mt-6">
          <h2 className="mb-2 px-1 text-[13px] font-bold uppercase tracking-wide text-text-muted">
            Info
          </h2>
          <CardGroup>
            <CardRow label="Versione" value={APP_VERSION} />
          </CardGroup>
        </section>
      </div>
    </PageShell>
  )
}
