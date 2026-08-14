import { useMemo, useState } from 'react'
import { ArrowUpDown, ChevronDown, CircleDashed, Plus } from 'lucide-react'
import { PageShell } from '../components/layout/PageShell'
import { TopBar } from '../components/layout/TopBar'
import { OrbitSystem } from '../components/space/OrbitSystem'
import { TotalsRow } from '../components/subscriptions/TotalsRow'
import { SubscriptionListRow } from '../components/subscriptions/SubscriptionRow'
import { AddSubscriptionSheet } from '../components/subscriptions/AddSubscriptionSheet'
import { EmptyState } from '../components/ui/EmptyState'
import { Pill } from '../components/ui/Pill'
import { Menu } from '../components/ui/Menu'
import { SubscriptionRowsSkeleton } from '../components/ui/Skeleton'
import { useSubscriptions } from '../hooks/useSubscriptions'
import { useLists } from '../hooks/useLists'
import { useCategories } from '../hooks/useCategories'
import { SORT_LABELS, useFilters } from '../hooks/useFilters'
import type { SortKey } from '../hooks/useFilters'
import { applyFilters, sortSubscriptions } from '../lib/filtering'

export default function Subscriptions() {
  const subscriptions = useSubscriptions()
  const lists = useLists()
  const categories = useCategories()
  const { filters, setFilter } = useFilters()

  const [addOpen, setAddOpen] = useState(false)
  const [sortOpen, setSortOpen] = useState(false)
  const [archivedOpen, setArchivedOpen] = useState(false)

  const all = useMemo(() => subscriptions.data ?? [], [subscriptions.data])
  const filtered = useMemo(() => applyFilters(all, filters), [all, filters])

  const active = useMemo(
    () => sortSubscriptions(filtered.filter((s) => s.is_active), filters.sort),
    [filtered, filters.sort]
  )
  const archived = useMemo(
    () => sortSubscriptions(filtered.filter((s) => !s.is_active), filters.sort),
    [filtered, filters.sort]
  )

  const loading = subscriptions.isLoading
  const nothingAtAll = !loading && all.length === 0

  return (
    <PageShell>
      <TopBar onAdd={() => setAddOpen(true)} />

      <OrbitSystem subscriptions={active} />

      <TotalsRow
        visible={filtered}
        all={all}
        lists={lists.data ?? []}
        categories={categories.data ?? []}
        filters={filters}
        setFilter={setFilter}
      />

      <div className="mt-8 px-6">
        {/* Header della lista con l'ordinamento corrente */}
        <div className="relative mb-3 flex items-center justify-between">
          <span className="text-[19px] text-text-muted">Attivo</span>
          <button
            type="button"
            onClick={() => setSortOpen((v) => !v)}
            aria-expanded={sortOpen}
            aria-haspopup="menu"
            className="flex items-center gap-1.5 text-[15px] text-text-muted"
          >
            {SORT_LABELS[filters.sort]}
            <ArrowUpDown className="h-4 w-4" aria-hidden />
          </button>

          <Menu
            open={sortOpen}
            onClose={() => setSortOpen(false)}
            label="Ordina abbonamenti"
            className="right-0 top-full mt-2"
            items={(Object.keys(SORT_LABELS) as SortKey[]).map((key) => ({
              id: key,
              label: SORT_LABELS[key],
              active: filters.sort === key,
              onSelect: () => setFilter('sort', key),
            }))}
          />
        </div>

        {loading && <SubscriptionRowsSkeleton />}

        {!loading && active.length === 0 && (
          <EmptyState
            icon={<CircleDashed className="h-7 w-7" aria-hidden />}
            title={nothingAtAll ? 'Nessun abbonamento' : 'Nessun risultato'}
            description={
              nothingAtAll
                ? 'Aggiungi il primo e scopri quanto spendi in un anno.'
                : 'Nessun abbonamento corrisponde ai filtri selezionati.'
            }
            action={
              nothingAtAll ? (
                <Pill variant="accent" className="h-12" onClick={() => setAddOpen(true)}>
                  <Plus className="h-5 w-5" aria-hidden />
                  Aggiungi il primo
                </Pill>
              ) : undefined
            }
          />
        )}

        {!loading && active.length > 0 && (
          <div className="flex flex-col gap-3">
            {active.map((sub) => (
              <SubscriptionListRow key={sub.id} sub={sub} />
            ))}
          </div>
        )}

        {/* Sezione archiviati, collassabile (§7.1) */}
        {!loading && archived.length > 0 && (
          <div className="mt-8">
            <button
              type="button"
              onClick={() => setArchivedOpen((v) => !v)}
              aria-expanded={archivedOpen}
              className="mb-3 flex w-full items-center gap-1.5 text-[19px] text-text-muted"
            >
              Archiviati
              <span className="tabular text-[15px]">({archived.length})</span>
              <ChevronDown
                className={`h-4 w-4 transition-transform ${archivedOpen ? 'rotate-180' : ''}`}
                aria-hidden
              />
            </button>

            {archivedOpen && (
              <div className="flex flex-col gap-3">
                {archived.map((sub) => (
                  <SubscriptionListRow key={sub.id} sub={sub} dimmed />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <AddSubscriptionSheet open={addOpen} onClose={() => setAddOpen(false)} />
    </PageShell>
  )
}
