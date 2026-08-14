import { format, formatDistanceStrict, isToday, isTomorrow } from 'date-fns'
import { it } from 'date-fns/locale'

/**
 * Formattazione di valuta e date: solo Intl e date-fns con locale `it`.
 * Mai simboli o formati scritti a mano (§9.6).
 */

const currencyCache = new Map<string, Intl.NumberFormat>()

function currencyFormatter(currency: string, maximumFractionDigits: number): Intl.NumberFormat {
  const key = `${currency}:${maximumFractionDigits}`
  const cached = currencyCache.get(key)
  if (cached) return cached
  const formatter = new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency,
    minimumFractionDigits: maximumFractionDigits,
    maximumFractionDigits,
  })
  currencyCache.set(key, formatter)
  return formatter
}

/** Es. `12,99 €`. */
export function formatCurrency(amount: number, currency = 'EUR'): string {
  return currencyFormatter(currency, 2).format(amount)
}

/** Variante senza decimali per i numeri hero, es. `156 €`. */
export function formatCurrencyCompact(amount: number, currency = 'EUR'): string {
  return currencyFormatter(currency, 0).format(Math.round(amount))
}

/** Solo il simbolo della valuta, per etichette e input. */
export function currencySymbol(currency = 'EUR'): string {
  const parts = currencyFormatter(currency, 0).formatToParts(0)
  return parts.find((p) => p.type === 'currency')?.value ?? currency
}

/** Es. `13 set 2026`. */
export function formatDateShort(date: Date): string {
  return format(date, 'd MMM yyyy', { locale: it })
}

/** Es. `venerdì 13 settembre 2026`. */
export function formatDateLong(date: Date): string {
  return format(date, 'EEEE d MMMM yyyy', { locale: it })
}

/** Es. `Agosto`, con l'iniziale maiuscola. */
export function formatMonthName(date: Date): string {
  const name = format(date, 'LLLL', { locale: it })
  return name.charAt(0).toUpperCase() + name.slice(1)
}

/** Es. `ago 2026`, per gli assi dei grafici. */
export function formatMonthShort(date: Date): string {
  return format(date, 'LLL yy', { locale: it })
}

/** Formato ISO `yyyy-MM-dd`, quello usato dalle colonne `date`. */
export function toISODate(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

/**
 * Converte una data ISO del database in Date locale.
 * `new Date('2026-08-14')` verrebbe interpretata come UTC e su fusi negativi
 * scivolerebbe al giorno prima: qui costruiamo esplicitamente una data locale.
 */
export function parseISODate(iso: string): Date {
  const [year, month, day] = iso.split('-').map(Number)
  return new Date(year, (month ?? 1) - 1, day ?? 1)
}

/** `Oggi`, `Domani`, `Tra 30 giorni`, `3 giorni fa`. */
export function formatRelativeDays(date: Date, from = new Date()): string {
  if (isToday(date)) return 'Oggi'
  if (isTomorrow(date)) return 'Domani'
  const distance = formatDistanceStrict(date, from, { unit: 'day', locale: it })
  return date > from ? `Tra ${distance}` : `${distance} fa`
}

/** Percentuale con segno, es. `+12,5%`. */
export function formatPercentChange(oldValue: number, newValue: number): string {
  if (oldValue === 0) return '—'
  const delta = ((newValue - oldValue) / oldValue) * 100
  const formatted = new Intl.NumberFormat('it-IT', {
    maximumFractionDigits: 1,
    signDisplay: 'exceptZero',
  }).format(delta)
  return `${formatted}%`
}
