import { useCallback, useEffect, useState } from 'react'

/**
 * Filtri e ordinamento della schermata Abbonamenti, persistiti in localStorage
 * così la selezione sopravvive alla chiusura della scheda (§7.2).
 */

export type SortKey = 'next' | 'name' | 'price-desc' | 'price-asc' | 'recent'
export type CycleFilter = 'all' | 'month' | 'year'

/** `null` su listId significa "tutte le liste". */
export interface Filters {
  listId: string | null
  categoryId: string | null
  cycle: CycleFilter
  sort: SortKey
}

export const SORT_LABELS: Record<SortKey, string> = {
  next: 'Prossimo rinnovo',
  name: 'Nome',
  'price-desc': 'Prezzo ↓',
  'price-asc': 'Prezzo ↑',
  recent: 'Aggiunto di recente',
}

export const CYCLE_LABELS: Record<CycleFilter, string> = {
  all: 'Tutto',
  month: 'Mese',
  year: 'Anno',
}

const STORAGE_KEY = 'rinnovi:filters'

const DEFAULT_FILTERS: Filters = {
  listId: null,
  categoryId: null,
  cycle: 'all',
  sort: 'next',
}

function isSortKey(value: unknown): value is SortKey {
  return typeof value === 'string' && value in SORT_LABELS
}

function isCycleFilter(value: unknown): value is CycleFilter {
  return typeof value === 'string' && value in CYCLE_LABELS
}

function readStored(): Filters {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_FILTERS
    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null) return DEFAULT_FILTERS
    const record = parsed as Record<string, unknown>
    return {
      listId: typeof record.listId === 'string' ? record.listId : null,
      categoryId: typeof record.categoryId === 'string' ? record.categoryId : null,
      cycle: isCycleFilter(record.cycle) ? record.cycle : DEFAULT_FILTERS.cycle,
      sort: isSortKey(record.sort) ? record.sort : DEFAULT_FILTERS.sort,
    }
  } catch {
    // Storage non disponibile o JSON corrotto: si riparte dai default
    return DEFAULT_FILTERS
  }
}

export function useFilters() {
  const [filters, setFilters] = useState<Filters>(readStored)

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(filters))
    } catch {
      // Modalità privata o quota esaurita: i filtri restano validi in memoria
    }
  }, [filters])

  const setFilter = useCallback(<K extends keyof Filters>(key: K, value: Filters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }, [])

  const reset = useCallback(() => setFilters(DEFAULT_FILTERS), [])

  return { filters, setFilter, reset }
}
