import {
  addDays,
  addMonths,
  addWeeks,
  addYears,
  differenceInCalendarDays,
  endOfMonth,
  isAfter,
  isBefore,
  startOfDay,
  startOfMonth,
} from 'date-fns'
import type { BillingCycle, PriceChangeRow, SubscriptionRow } from '../types/database'
import { parseISODate } from './format'

/**
 * Aritmetica dei rinnovi. Funzioni pure: niente React, niente Supabase.
 * Tutti gli avanzamenti di data passano da date-fns (addMonths/addWeeks/addYears),
 * mai da aritmetica su millisecondi, così mesi di lunghezza diversa e anni
 * bisestili sono gestiti correttamente.
 */

/** Sottoinsieme di colonne che serve al calcolo: rende le funzioni testabili. */
export type RenewalSubscription = Pick<
  SubscriptionRow,
  | 'amount'
  | 'billing_cycle'
  | 'custom_cycle_days'
  | 'first_billing_date'
  | 'is_active'
  | 'is_trial'
  | 'trial_end_date'
>

/** Giorni medi in un mese solare: usato solo per normalizzare cicli in giorni. */
const DAYS_PER_MONTH = 365.25 / 12

/** Numero di occorrenze massimo esplorabile: guardia contro cicli degeneri. */
const MAX_ITERATIONS = 10_000

/**
 * Durata di un ciclo espressa in mesi. È il fattore di normalizzazione usato
 * da monthlyEquivalent / yearlyEquivalent.
 */
export function cycleInMonths(cycle: BillingCycle, customDays = 30): number {
  switch (cycle) {
    case 'weekly':
      return 7 / DAYS_PER_MONTH
    case 'biweekly':
      return 14 / DAYS_PER_MONTH
    case 'monthly':
      return 1
    case 'bimonthly':
      return 2
    case 'quarterly':
      return 3
    case 'semiannual':
      return 6
    case 'annual':
      return 12
    case 'biennial':
      return 24
    case 'custom':
      return Math.max(1, customDays) / DAYS_PER_MONTH
  }
}

/** Durata approssimata di un ciclo in giorni: serve solo a stimare gli indici. */
function cycleInDays(cycle: BillingCycle, customDays = 30): number {
  return cycleInMonths(cycle, customDays) * DAYS_PER_MONTH
}

/**
 * Data della k-esima fatturazione (k = 0 è la prima in assoluto).
 *
 * L'avanzamento parte sempre dall'ancora `first_billing_date` moltiplicando il
 * passo, invece di accumulare un ciclo sopra il risultato precedente: così un
 * abbonamento nato il 31 gennaio rinnova il 28/29 febbraio e poi torna al 31
 * marzo, senza incastrarsi sul 28 per sempre.
 */
export function occurrenceAt(sub: RenewalSubscription, index: number): Date {
  const anchor = parseISODate(sub.first_billing_date)
  const k = Math.max(0, index)
  switch (sub.billing_cycle) {
    case 'weekly':
      return addWeeks(anchor, k)
    case 'biweekly':
      return addWeeks(anchor, k * 2)
    case 'monthly':
      return addMonths(anchor, k)
    case 'bimonthly':
      return addMonths(anchor, k * 2)
    case 'quarterly':
      return addMonths(anchor, k * 3)
    case 'semiannual':
      return addMonths(anchor, k * 6)
    case 'annual':
      return addYears(anchor, k)
    case 'biennial':
      return addYears(anchor, k * 2)
    case 'custom':
      return addDays(anchor, k * Math.max(1, sub.custom_cycle_days))
  }
}

/**
 * Indice della prima occorrenza che cade in `target` o dopo.
 * Stima l'indice per non iterare da zero su abbonamenti vecchi, poi corregge
 * un ciclo alla volta: la correzione garantisce l'esattezza del calendario.
 */
function firstIndexOnOrAfter(sub: RenewalSubscription, target: Date): number {
  const anchor = parseISODate(sub.first_billing_date)
  const dayGap = differenceInCalendarDays(target, anchor)
  if (dayGap <= 0) return 0

  const step = cycleInDays(sub.billing_cycle, sub.custom_cycle_days)
  let k = Math.max(0, Math.floor(dayGap / step) - 2)

  let guard = 0
  // Avanza finché l'occorrenza è ancora prima del target
  while (isBefore(occurrenceAt(sub, k), target) && guard++ < MAX_ITERATIONS) k += 1
  // Indietreggia se la stima aveva superato
  while (k > 0 && !isBefore(occurrenceAt(sub, k - 1), target) && guard++ < MAX_ITERATIONS) k -= 1

  return k
}

/**
 * Prossimo rinnovo a partire da `from` (incluso: un rinnovo che cade oggi è
 * "il prossimo", così l'interfaccia può mostrare "Oggi").
 */
export function nextRenewalDate(sub: RenewalSubscription, from: Date = new Date()): Date {
  const target = startOfDay(from)
  return occurrenceAt(sub, firstIndexOnOrAfter(sub, target))
}

/** Giorni che mancano al prossimo rinnovo. 0 = oggi. */
export function daysUntilRenewal(sub: RenewalSubscription, from: Date = new Date()): number {
  return differenceInCalendarDays(nextRenewalDate(sub, from), startOfDay(from))
}

/**
 * Una prova gratuita ancora in corso non pesa sui totali: conta zero finché
 * `trial_end_date` è nel futuro (§5).
 */
export function isFreeTrial(sub: RenewalSubscription, at: Date = new Date()): boolean {
  if (!sub.is_trial || !sub.trial_end_date) return false
  return isAfter(parseISODate(sub.trial_end_date), startOfDay(at))
}

/** Importo che concorre ai totali: 0 durante una prova gratuita. */
export function billableAmount(sub: RenewalSubscription, at: Date = new Date()): number {
  return isFreeTrial(sub, at) ? 0 : sub.amount
}

/** Costo normalizzato su base mensile. */
export function monthlyEquivalent(sub: RenewalSubscription, at: Date = new Date()): number {
  const months = cycleInMonths(sub.billing_cycle, sub.custom_cycle_days)
  if (months <= 0) return 0
  return billableAmount(sub, at) / months
}

/** Costo normalizzato su base annuale. */
export function yearlyEquivalent(sub: RenewalSubscription, at: Date = new Date()): number {
  return monthlyEquivalent(sub, at) * 12
}

/** Una singola occorrenza di rinnovo, con la data esatta in cui cade. */
export interface RenewalOccurrence<T extends RenewalSubscription = SubscriptionRow> {
  subscription: T
  date: Date
  /** Importo effettivamente addebitato: 0 se la prova è ancora in corso. */
  amount: number
}

/**
 * Tutte le occorrenze di rinnovo che cadono nel mese indicato.
 * Un settimanale ne genera 4 o 5: vengono restituite tutte, ordinate per data.
 * Considera solo gli abbonamenti attivi.
 */
export function renewalsInMonth<T extends RenewalSubscription>(
  subs: T[],
  month: Date
): RenewalOccurrence<T>[] {
  const from = startOfMonth(month)
  const to = endOfMonth(month)
  const occurrences: RenewalOccurrence<T>[] = []

  for (const sub of subs) {
    if (!sub.is_active) continue
    let k = firstIndexOnOrAfter(sub, from)
    let guard = 0
    let date = occurrenceAt(sub, k)
    while (!isAfter(date, to) && guard++ < MAX_ITERATIONS) {
      occurrences.push({ subscription: sub, date, amount: billableAmount(sub, date) })
      k += 1
      date = occurrenceAt(sub, k)
    }
  }

  return occurrences.sort((a, b) => a.date.getTime() - b.date.getTime())
}

/**
 * Costo reale di un mese: somma degli addebiti che cadono davvero in quel mese,
 * non normalizzato. Se un annuale scade a marzo, marzo pesa per intero.
 * È il dato dietro il grafico principale delle statistiche (§7.4).
 */
export function actualCostInMonth<T extends RenewalSubscription>(subs: T[], month: Date): number {
  return renewalsInMonth(subs, month).reduce((total, o) => total + o.amount, 0)
}

/** Numero di fatturazioni già avvenute (la prima inclusa, se già passata). */
export function renewalsSoFar(sub: RenewalSubscription, until: Date = new Date()): number {
  const target = startOfDay(until)
  const anchor = parseISODate(sub.first_billing_date)
  if (isAfter(anchor, target)) return 0
  // La prima occorrenza non ancora arrivata coincide col numero di quelle passate
  return firstIndexOnOrAfter(sub, addDays(target, 1))
}

/**
 * Importo in vigore a una certa data, ricostruito dallo storico prezzi.
 * Il prezzo corrente è `sub.amount`; a ritroso valgono gli `old_amount`.
 */
export function amountAt(
  sub: RenewalSubscription,
  priceChanges: PriceChangeRow[],
  date: Date
): number {
  if (priceChanges.length === 0) return sub.amount

  const sorted = [...priceChanges].sort(
    (a, b) => parseISODate(a.changed_at).getTime() - parseISODate(b.changed_at).getTime()
  )

  // Prima di qualunque variazione valeva il prezzo iniziale
  const firstChange = sorted[0]
  if (isBefore(date, parseISODate(firstChange.changed_at))) return firstChange.old_amount

  let current = firstChange.new_amount
  for (const change of sorted) {
    if (isAfter(parseISODate(change.changed_at), date)) break
    current = change.new_amount
  }
  return current
}

/**
 * Totale speso finora: somma degli addebiti già avvenuti, ognuno valutato al
 * prezzo in vigore in quella data. Le occorrenze coperte da prova gratuita
 * valgono zero.
 */
export function totalSpentSoFar(
  sub: RenewalSubscription,
  priceChanges: PriceChangeRow[] = [],
  until: Date = new Date()
): number {
  const count = renewalsSoFar(sub, until)
  let total = 0
  for (let k = 0; k < count && k < MAX_ITERATIONS; k += 1) {
    const date = occurrenceAt(sub, k)
    if (isFreeTrial(sub, date)) continue
    total += amountAt(sub, priceChanges, date)
  }
  return total
}

/** Totale mensile normalizzato di un insieme di abbonamenti attivi. */
export function totalMonthly(subs: RenewalSubscription[], at: Date = new Date()): number {
  return subs.filter((s) => s.is_active).reduce((t, s) => t + monthlyEquivalent(s, at), 0)
}

/** Totale annuale normalizzato di un insieme di abbonamenti attivi. */
export function totalYearly(subs: RenewalSubscription[], at: Date = new Date()): number {
  return totalMonthly(subs, at) * 12
}
