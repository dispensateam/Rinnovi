import { subDays, subMonths, subYears } from 'date-fns'
import type { BillingCycle } from '../types/database'
import { toISODate } from './format'

/**
 * Dati di esempio (§10): ~14 abbonamenti realistici, con due annuali per far
 * vedere i picchi nel grafico, una prova in corso, uno archiviato, uno con due
 * variazioni di prezzo e uno con ciclo personalizzato.
 */

export interface SampleSubscription {
  name: string
  domain: string
  brandColor: string
  amount: number
  billing_cycle: BillingCycle
  custom_cycle_days?: number
  /** Mesi da sottrarre a oggi per la prima fatturazione. */
  startedMonthsAgo?: number
  startedDaysAgo?: number
  startedYearsAgo?: number
  categoryName: string
  isActive?: boolean
  isTrial?: boolean
  trialEndsInDays?: number
  notes?: string
  cancellationUrl?: string
  /** Variazioni di prezzo da registrare, dalla più vecchia. */
  priceChanges?: { monthsAgo: number; oldAmount: number; newAmount: number }[]
}

export const SAMPLE_SUBSCRIPTIONS: SampleSubscription[] = [
  {
    name: 'Netflix',
    domain: 'netflix.com',
    brandColor: '#E50914',
    amount: 13.99,
    billing_cycle: 'monthly',
    startedMonthsAgo: 26,
    categoryName: 'Streaming',
    cancellationUrl: 'https://www.netflix.com/cancelplan',
    // Due rincari nel tempo: alimentano la sezione "Storico prezzi"
    priceChanges: [
      { monthsAgo: 14, oldAmount: 11.99, newAmount: 12.99 },
      { monthsAgo: 4, oldAmount: 12.99, newAmount: 13.99 },
    ],
  },
  {
    name: 'Spotify',
    domain: 'spotify.com',
    brandColor: '#1DB954',
    amount: 10.99,
    billing_cycle: 'monthly',
    startedMonthsAgo: 40,
    categoryName: 'Musica',
  },
  {
    name: 'Disney+',
    domain: 'disneyplus.com',
    brandColor: '#113CCF',
    amount: 8.99,
    billing_cycle: 'monthly',
    startedMonthsAgo: 9,
    categoryName: 'Streaming',
  },
  {
    name: 'DAZN',
    domain: 'dazn.com',
    brandColor: '#0F1419',
    amount: 34.99,
    billing_cycle: 'monthly',
    startedMonthsAgo: 5,
    categoryName: 'Streaming',
    notes: 'Da disdire a fine campionato',
  },
  {
    name: 'iCloud+',
    domain: 'icloud.com',
    brandColor: '#3693F3',
    amount: 2.99,
    billing_cycle: 'monthly',
    startedMonthsAgo: 33,
    categoryName: 'Cloud & Storage',
  },
  {
    name: 'ChatGPT Plus',
    domain: 'openai.com',
    brandColor: '#10A37F',
    amount: 23.0,
    billing_cycle: 'monthly',
    startedMonthsAgo: 11,
    categoryName: 'IA & Produttività',
  },
  {
    name: 'Amazon Prime',
    domain: 'amazon.it',
    brandColor: '#FF9900',
    amount: 49.9,
    billing_cycle: 'annual',
    startedYearsAgo: 3,
    categoryName: 'Altro',
  },
  {
    name: 'Adobe Creative Cloud',
    domain: 'adobe.com',
    brandColor: '#FF0000',
    amount: 731.6,
    billing_cycle: 'annual',
    startedYearsAgo: 2,
    categoryName: 'Software',
    notes: 'Rinnovo pesante: pianificare in anticipo',
  },
  {
    name: 'Il Post',
    domain: 'ilpost.it',
    brandColor: '#E4322B',
    amount: 8.0,
    billing_cycle: 'monthly',
    startedMonthsAgo: 18,
    categoryName: 'Notizie',
  },
  {
    name: 'Strava',
    domain: 'strava.com',
    brandColor: '#FC4C02',
    amount: 8.99,
    billing_cycle: 'monthly',
    startedMonthsAgo: 7,
    categoryName: 'Fitness',
  },
  {
    name: 'PlayStation Plus',
    domain: 'playstation.com',
    brandColor: '#0070D1',
    amount: 71.99,
    billing_cycle: 'annual',
    startedYearsAgo: 1,
    categoryName: 'Giochi',
  },
  {
    // Prova gratuita ancora in corso: conta zero nei totali
    name: 'Perplexity',
    domain: 'perplexity.ai',
    brandColor: '#20808D',
    amount: 20.0,
    billing_cycle: 'monthly',
    startedDaysAgo: 9,
    categoryName: 'IA & Produttività',
    isTrial: true,
    trialEndsInDays: 21,
  },
  {
    // Ciclo personalizzato: ogni 45 giorni
    name: 'Lavaggio auto',
    domain: '',
    brandColor: '#06B6D4',
    amount: 24.0,
    billing_cycle: 'custom',
    custom_cycle_days: 45,
    startedMonthsAgo: 6,
    categoryName: 'Trasporti',
  },
  {
    // Archiviato: resta visibile nella sezione dedicata, fuori dai totali
    name: 'NOW',
    domain: 'nowtv.it',
    brandColor: '#00B2A9',
    amount: 9.99,
    billing_cycle: 'monthly',
    startedMonthsAgo: 20,
    categoryName: 'Streaming',
    isActive: false,
  },
]

/** Data ISO di prima fatturazione derivata dagli scostamenti dichiarati. */
export function sampleStartDate(sample: SampleSubscription, now = new Date()): string {
  if (sample.startedYearsAgo) return toISODate(subYears(now, sample.startedYearsAgo))
  if (sample.startedMonthsAgo) return toISODate(subMonths(now, sample.startedMonthsAgo))
  if (sample.startedDaysAgo) return toISODate(subDays(now, sample.startedDaysAgo))
  return toISODate(now)
}
