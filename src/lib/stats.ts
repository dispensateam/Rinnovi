import { addMonths, startOfMonth } from 'date-fns'
import type { CategoryRow, SubscriptionRow } from '../types/database'
import {
  isFreeTrial,
  monthlyEquivalent,
  renewalsInMonth,
  yearlyEquivalent,
} from './renewals'
import { formatMonthShort } from './format'

export type Period = 'month' | 'year'

/** Costo normalizzato di un abbonamento nel periodo scelto. */
export function costInPeriod(sub: SubscriptionRow, period: Period, at = new Date()): number {
  return period === 'month' ? monthlyEquivalent(sub, at) : yearlyEquivalent(sub, at)
}

export interface Summary {
  total: number
  average: number
  mostExpensive: SubscriptionRow | null
  mostExpensiveCost: number
  activeCount: number
  trialCount: number
}

export function buildSummary(subs: SubscriptionRow[], period: Period, at = new Date()): Summary {
  const active = subs.filter((s) => s.is_active)
  const total = active.reduce((t, s) => t + costInPeriod(s, period, at), 0)

  let mostExpensive: SubscriptionRow | null = null
  let mostExpensiveCost = 0
  for (const sub of active) {
    const cost = costInPeriod(sub, period, at)
    if (cost > mostExpensiveCost) {
      mostExpensive = sub
      mostExpensiveCost = cost
    }
  }

  return {
    total,
    average: active.length > 0 ? total / active.length : 0,
    mostExpensive,
    mostExpensiveCost,
    activeCount: active.length,
    trialCount: active.filter((s) => isFreeTrial(s, at)).length,
  }
}

export interface MonthlyPoint {
  label: string
  total: number
  /** Dettaglio per il tooltip: cosa si rinnova in quel mese. */
  items: { name: string; amount: number }[]
}

/**
 * Spesa reale dei prossimi 12 mesi (§7.4): costo non normalizzato, così i
 * picchi degli abbonamenti annuali restano visibili.
 */
export function next12MonthsSpend(subs: SubscriptionRow[], from = new Date()): MonthlyPoint[] {
  const start = startOfMonth(from)
  return Array.from({ length: 12 }, (_, i) => {
    const month = addMonths(start, i)
    const occurrences = renewalsInMonth(subs, month)
    const items = occurrences
      .filter((o) => o.amount > 0)
      .map((o) => ({ name: o.subscription.name, amount: o.amount }))
    return {
      label: formatMonthShort(month),
      total: occurrences.reduce((t, o) => t + o.amount, 0),
      items,
    }
  })
}

export interface CategorySlice {
  id: string
  name: string
  color: string
  value: number
}

export function categoryBreakdown(
  subs: SubscriptionRow[],
  categories: CategoryRow[],
  period: Period,
  at = new Date()
): CategorySlice[] {
  const totals = new Map<string, number>()
  for (const sub of subs.filter((s) => s.is_active)) {
    const key = sub.category_id ?? 'none'
    totals.set(key, (totals.get(key) ?? 0) + costInPeriod(sub, period, at))
  }

  return [...totals.entries()]
    .map(([id, value]) => {
      const category = categories.find((c) => c.id === id)
      return {
        id,
        name: category?.name ?? 'Senza categoria',
        color: category?.color ?? '#64748B',
        value,
      }
    })
    .filter((slice) => slice.value > 0)
    .sort((a, b) => b.value - a.value)
}

export interface TopEntry {
  id: string
  name: string
  color: string
  value: number
}

export function topExpensive(
  subs: SubscriptionRow[],
  period: Period,
  limit = 5,
  at = new Date()
): TopEntry[] {
  return subs
    .filter((s) => s.is_active)
    .map((s) => ({
      id: s.id,
      name: s.name,
      color: s.brand_color,
      value: costInPeriod(s, period, at),
    }))
    .filter((entry) => entry.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, limit)
}

/**
 * Confronto mensile vs annuale (§7.4): quanto costano su base annua gli
 * abbonamenti pagati a rate più corte dell'anno. Il risparmio effettivo di un
 * piano annuale non è nei dati, quindi si riporta solo la quota interessata e
 * una stima prudente al 16%, la sconto medio dichiarato dai servizi.
 */
export const ANNUAL_DISCOUNT_ESTIMATE = 0.16

export interface AnnualComparison {
  shortCycleYearly: number
  estimatedSaving: number
  count: number
}

export function annualComparison(subs: SubscriptionRow[], at = new Date()): AnnualComparison | null {
  const shortCycle = subs.filter(
    (s) => s.is_active && !isFreeTrial(s, at) && s.billing_cycle !== 'annual' && s.billing_cycle !== 'biennial'
  )
  if (shortCycle.length === 0) return null

  const shortCycleYearly = shortCycle.reduce((t, s) => t + yearlyEquivalent(s, at), 0)
  return {
    shortCycleYearly,
    estimatedSaving: shortCycleYearly * ANNUAL_DISCOUNT_ESTIMATE,
    count: shortCycle.length,
  }
}
