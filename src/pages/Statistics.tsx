import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChartNoAxesColumn, X } from 'lucide-react'
import { PageShell } from '../components/layout/PageShell'
import { Card } from '../components/ui/Card'
import { IconButton } from '../components/ui/Pill'
import { EmptyState } from '../components/ui/EmptyState'
import { Skeleton } from '../components/ui/Skeleton'
import { SpendChart } from '../components/stats/SpendChart'
import { CategoryChart } from '../components/stats/CategoryChart'
import { TopSpenders } from '../components/stats/TopSpenders'
import { useSubscriptions } from '../hooks/useSubscriptions'
import { useCategories } from '../hooks/useCategories'
import { formatCurrency } from '../lib/format'
import {
  annualComparison,
  buildSummary,
  categoryBreakdown,
  next12MonthsSpend,
  topExpensive,
} from '../lib/stats'
import type { Period } from '../lib/stats'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-6">
      <h2 className="mb-2 px-1 text-[13px] font-bold uppercase tracking-wide text-text-muted">
        {title}
      </h2>
      <Card className="px-4 py-4">{children}</Card>
    </section>
  )
}

function SummaryTile({ label, value }: { label: string; value: string }) {
  return (
    <Card className="px-4 py-3">
      <p className="text-[12px] text-text-muted">{label}</p>
      <p className="tabular mt-0.5 truncate text-[18px] font-extrabold">{value}</p>
    </Card>
  )
}

export default function Statistics() {
  const navigate = useNavigate()
  const subscriptions = useSubscriptions()
  const categories = useCategories()
  const [period, setPeriod] = useState<Period>('year')

  const subs = useMemo(() => subscriptions.data ?? [], [subscriptions.data])

  const summary = useMemo(() => buildSummary(subs, period), [subs, period])
  const spend = useMemo(() => next12MonthsSpend(subs), [subs])
  const slices = useMemo(
    () => categoryBreakdown(subs, categories.data ?? [], period),
    [subs, categories.data, period]
  )
  const top = useMemo(() => topExpensive(subs, period), [subs, period])
  const comparison = useMemo(() => annualComparison(subs), [subs])

  const hasData = subs.some((s) => s.is_active)

  return (
    <PageShell hideTabBar>
      <div className="px-5 pb-16 pt-4">
        <div className="flex items-center justify-between">
          <h1 className="hero-number text-[34px]">Statistiche</h1>
          <IconButton label="Chiudi" size={44} onClick={() => navigate(-1)}>
            <X className="h-5 w-5" aria-hidden />
          </IconButton>
        </div>

        {/* Selettore segmentato Mese / Anno */}
        <div
          role="tablist"
          aria-label="Periodo"
          className="mt-4 flex rounded-full bg-card p-1"
        >
          {(['month', 'year'] as Period[]).map((key) => (
            <button
              key={key}
              role="tab"
              aria-selected={period === key}
              onClick={() => setPeriod(key)}
              className={`flex-1 rounded-full py-2 text-[15px] font-bold transition ${
                period === key ? 'bg-accent text-text-primary' : 'text-text-muted'
              }`}
            >
              {key === 'month' ? 'Mese' : 'Anno'}
            </button>
          ))}
        </div>

        {subscriptions.isLoading && (
          <div className="mt-6 space-y-3">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-56 w-full" />
          </div>
        )}

        {!subscriptions.isLoading && !hasData && (
          <EmptyState
            className="mt-6"
            icon={<ChartNoAxesColumn className="h-7 w-7" aria-hidden />}
            title="Ancora nessun dato"
            description="Aggiungi qualche abbonamento e qui vedrai quanto spendi."
          />
        )}

        {!subscriptions.isLoading && hasData && (
          <>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <SummaryTile
                label={period === 'month' ? 'Totale mensile' : 'Totale annuale'}
                value={formatCurrency(summary.total)}
              />
              <SummaryTile label="Media per abbonamento" value={formatCurrency(summary.average)} />
              <SummaryTile
                label="Più costoso"
                value={summary.mostExpensive ? summary.mostExpensive.name : '—'}
              />
              <SummaryTile label="Attivi" value={String(summary.activeCount)} />
              {summary.trialCount > 0 && (
                <SummaryTile label="In prova" value={String(summary.trialCount)} />
              )}
            </div>

            <Section title="Spesa reale prossimi 12 mesi">
              <SpendChart data={spend} />
              <p className="mt-2 text-[12px] text-text-muted">
                Costo non normalizzato: i mesi con rinnovi annuali pesano per intero.
              </p>
            </Section>

            <Section title="Ripartizione per categoria">
              {slices.length > 0 ? (
                <CategoryChart slices={slices} />
              ) : (
                <p className="py-6 text-center text-sm text-text-muted">
                  Assegna una categoria agli abbonamenti per vedere la ripartizione.
                </p>
              )}
            </Section>

            <Section title="Top 5 più costosi">
              {top.length > 0 ? (
                <TopSpenders entries={top} />
              ) : (
                <p className="py-6 text-center text-sm text-text-muted">Nessun dato disponibile.</p>
              )}
            </Section>

            {comparison && (
              <Section title="Mensile vs annuale">
                <p className="text-[15px] text-text-primary">
                  {comparison.count} abbonamenti non annuali ti costano{' '}
                  <span className="tabular font-extrabold">
                    {formatCurrency(comparison.shortCycleYearly)}
                  </span>{' '}
                  l'anno.
                </p>
                <p className="mt-2 text-[14px] text-text-muted">
                  Dove esiste un piano annuale, passare risparmierebbe indicativamente{' '}
                  <span className="tabular font-bold text-accent-glow">
                    {formatCurrency(comparison.estimatedSaving)}
                  </span>{' '}
                  l'anno. È una stima al 16%: lo sconto reale dipende dal servizio.
                </p>
              </Section>
            )}
          </>
        )}
      </div>
    </PageShell>
  )
}
