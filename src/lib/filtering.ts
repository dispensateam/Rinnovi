import type { SubscriptionRow } from '../types/database'
import type { CycleFilter, Filters, SortKey } from '../hooks/useFilters'
import { cycleInMonths, monthlyEquivalent, nextRenewalDate } from './renewals'

/**
 * Applicazione dei filtri e dell'ordinamento della schermata Abbonamenti.
 * Separata dalla pagina per tenerla sotto le ~250 righe e per poterla provare
 * in isolamento.
 */

/** "Mese" = tutto ciò che si rinnova più spesso di una volta l'anno. */
function matchesCycle(sub: SubscriptionRow, cycle: CycleFilter): boolean {
  if (cycle === 'all') return true
  const months = cycleInMonths(sub.billing_cycle, sub.custom_cycle_days)
  return cycle === 'month' ? months < 12 : months >= 12
}

export function applyFilters(subs: SubscriptionRow[], filters: Filters): SubscriptionRow[] {
  return subs.filter((sub) => {
    if (filters.listId && sub.list_id !== filters.listId) return false
    if (filters.categoryId && sub.category_id !== filters.categoryId) return false
    return matchesCycle(sub, filters.cycle)
  })
}

export function sortSubscriptions(subs: SubscriptionRow[], sort: SortKey): SubscriptionRow[] {
  const now = new Date()
  const sorted = [...subs]
  switch (sort) {
    case 'next':
      return sorted.sort(
        (a, b) => nextRenewalDate(a, now).getTime() - nextRenewalDate(b, now).getTime()
      )
    case 'name':
      return sorted.sort((a, b) => a.name.localeCompare(b.name, 'it'))
    case 'price-desc':
      return sorted.sort((a, b) => monthlyEquivalent(b, now) - monthlyEquivalent(a, now))
    case 'price-asc':
      return sorted.sort((a, b) => monthlyEquivalent(a, now) - monthlyEquivalent(b, now))
    case 'recent':
      return sorted.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
  }
}

export function filterAndSort(subs: SubscriptionRow[], filters: Filters): SubscriptionRow[] {
  return sortSubscriptions(applyFilters(subs, filters), filters.sort)
}
