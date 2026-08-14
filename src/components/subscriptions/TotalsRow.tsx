import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, ChevronsUpDown, LayoutGrid, List, SquarePen } from 'lucide-react'
import type { CategoryRow, ListRow, SubscriptionRow } from '../../types/database'
import { CYCLE_LABELS, type Filters } from '../../hooks/useFilters'
import type { CycleFilter } from '../../hooks/useFilters'
import { totalMonthly, totalYearly } from '../../lib/renewals'
import { formatCurrency } from '../../lib/format'
import { CascadingMenu } from '../ui/CascadingMenu'
import type { MenuSection } from '../ui/CascadingMenu'

interface TotalsRowProps {
  /** Abbonamenti già filtrati: il conteggio riflette la selezione. */
  visible: SubscriptionRow[]
  /** Tutti gli abbonamenti: serve a sapere quali categorie mostrare. */
  all: SubscriptionRow[]
  lists: ListRow[]
  categories: CategoryRow[]
  filters: Filters
  setFilter: <K extends keyof Filters>(key: K, value: Filters[K]) => void
}

export function TotalsRow({ visible, all, lists, categories, filters, setFilter }: TotalsRowProps) {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const activeCount = visible.filter((s) => s.is_active).length

  // Il filtro sul ciclo decide anche quale totale mostrare (§7.1)
  const monthlyView = filters.cycle === 'month'
  const total = monthlyView ? totalMonthly(visible) : totalYearly(visible)

  const listName =
    lists.find((l) => l.id === filters.listId)?.name ?? 'Tutte le liste'

  const sections = useMemo<MenuSection[]>(() => {
    // Solo le categorie che hanno almeno un abbonamento (§7.2)
    const usedCategoryIds = new Set(all.map((s) => s.category_id).filter(Boolean))
    const usedCategories = categories.filter((c) => usedCategoryIds.has(c.id))

    return [
      {
        id: 'lists',
        label: 'Liste',
        icon: <List className="h-5 w-5" aria-hidden />,
        options: [
          {
            id: 'all-lists',
            label: 'Tutte le liste',
            active: filters.listId === null,
            onSelect: () => setFilter('listId', null),
          },
          ...lists.map((l) => ({
            id: l.id,
            label: l.name,
            active: filters.listId === l.id,
            onSelect: () => setFilter('listId', l.id),
          })),
          {
            id: 'edit-lists',
            label: 'Modifica liste',
            icon: <SquarePen className="h-4 w-4" aria-hidden />,
            separated: true,
            onSelect: () => navigate('/impostazioni/liste'),
          },
        ],
      },
      {
        id: 'categories',
        label: 'Categorie',
        icon: <LayoutGrid className="h-5 w-5" aria-hidden />,
        options: [
          {
            id: 'all-categories',
            label: 'Tutto',
            active: filters.categoryId === null,
            onSelect: () => setFilter('categoryId', null),
          },
          ...usedCategories.map((c) => ({
            id: c.id,
            label: c.name,
            active: filters.categoryId === c.id,
            onSelect: () => setFilter('categoryId', c.id),
          })),
        ],
      },
      {
        id: 'cycle',
        label: 'Ciclo di fatturazione',
        icon: <Calendar className="h-5 w-5" aria-hidden />,
        options: (Object.keys(CYCLE_LABELS) as CycleFilter[]).map((key) => ({
          id: key,
          label: CYCLE_LABELS[key],
          active: filters.cycle === key,
          onSelect: () => setFilter('cycle', key),
        })),
      },
    ]
  }, [all, categories, lists, filters, setFilter, navigate])

  return (
    <div className="relative flex items-start justify-between px-6 pt-6">
      <div>
        <p className="hero-number text-[56px] leading-none tabular">{activeCount}</p>
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-expanded={menuOpen}
          aria-haspopup="menu"
          className="mt-2 flex items-center gap-1 text-[19px] text-text-muted"
        >
          {listName}
          <ChevronsUpDown className="h-4 w-4" aria-hidden />
        </button>

        <CascadingMenu
          open={menuOpen}
          onClose={() => setMenuOpen(false)}
          sections={sections}
          className="left-0 top-full mt-2"
        />
      </div>

      <div className="text-right">
        <p className="hero-number tabular text-[38px] leading-none">{formatCurrency(total)}</p>
        <p className="mt-2 text-[19px] text-text-muted">
          {monthlyView ? 'Totale mensile' : 'Totale annuale'}
        </p>
      </div>
    </div>
  )
}
