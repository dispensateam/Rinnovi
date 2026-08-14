import { useMutation, useQueryClient } from '@tanstack/react-query'
import { addDays } from 'date-fns'
import { supabase } from '../lib/supabase'
import { buildBackup, downloadBackup } from '../lib/backup'
import type { Backup } from '../lib/backup'
import { SAMPLE_SUBSCRIPTIONS, sampleStartDate } from '../lib/sampleData'
import { DEFAULT_CATEGORIES, DEFAULT_LIST_NAME } from '../lib/defaults'
import { toISODate } from '../lib/format'
import { useUserId } from './useAuth'
import type {
  CategoryRow,
  ListRow,
  PaymentMethodRow,
  PriceChangeRow,
  SubscriptionRow,
} from '../types/database'

const TABLES = ['price_changes', 'subscriptions', 'payment_methods', 'categories', 'lists'] as const

async function fetchAll() {
  const [lists, categories, paymentMethods, subscriptions, priceChanges] = await Promise.all([
    supabase.from('lists').select('*'),
    supabase.from('categories').select('*'),
    supabase.from('payment_methods').select('*'),
    supabase.from('subscriptions').select('*'),
    supabase.from('price_changes').select('*'),
  ])

  const error =
    lists.error ?? categories.error ?? paymentMethods.error ?? subscriptions.error ?? priceChanges.error
  if (error) throw error

  return {
    lists: lists.data as ListRow[],
    categories: categories.data as CategoryRow[],
    payment_methods: paymentMethods.data as PaymentMethodRow[],
    subscriptions: subscriptions.data as SubscriptionRow[],
    price_changes: priceChanges.data as PriceChangeRow[],
  }
}

/** Cancella tutto in ordine inverso alle dipendenze. */
async function deleteEverything(userId: string) {
  for (const table of TABLES) {
    const { error } = await supabase.from(table).delete().eq('user_id', userId)
    if (error) throw error
  }
}

export function useExportBackup() {
  return useMutation({
    mutationFn: async () => {
      downloadBackup(buildBackup(await fetchAll()))
    },
  })
}

export type ImportMode = 'merge' | 'replace'

export function useImportBackup() {
  const queryClient = useQueryClient()
  const userId = useUserId()

  return useMutation({
    mutationFn: async ({ backup, mode }: { backup: Backup; mode: ImportMode }) => {
      if (!userId) throw new Error('Sessione assente')
      if (mode === 'replace') await deleteEverything(userId)

      // Gli id vengono rigenerati dal database: qui si tiene la mappa
      // vecchio → nuovo per non perdere i riferimenti tra le tabelle.
      const listIds = new Map<string, string>()
      const categoryIds = new Map<string, string>()
      const methodIds = new Map<string, string>()

      if (backup.lists.length > 0) {
        const { data, error } = await supabase
          .from('lists')
          .insert(
            backup.lists.map((l) => ({
              user_id: userId,
              name: l.name,
              icon: l.icon,
              sort_order: l.sort_order,
            }))
          )
          .select()
        if (error) throw error
        backup.lists.forEach((l, i) => listIds.set(l.id, data[i].id))
      }

      if (backup.categories.length > 0) {
        const { data, error } = await supabase
          .from('categories')
          .insert(
            backup.categories.map((c) => ({
              user_id: userId,
              name: c.name,
              color: c.color,
              icon: c.icon,
              sort_order: c.sort_order,
            }))
          )
          .select()
        if (error) throw error
        backup.categories.forEach((c, i) => categoryIds.set(c.id, data[i].id))
      }

      if (backup.payment_methods.length > 0) {
        const { data, error } = await supabase
          .from('payment_methods')
          .insert(
            backup.payment_methods.map((p) => ({
              user_id: userId,
              name: p.name,
              icon: p.icon,
              color: p.color,
              last_four: p.last_four,
            }))
          )
          .select()
        if (error) throw error
        backup.payment_methods.forEach((p, i) => methodIds.set(p.id, data[i].id))
      }

      const subscriptionIds = new Map<string, string>()
      if (backup.subscriptions.length > 0) {
        const { data, error } = await supabase
          .from('subscriptions')
          .insert(
            backup.subscriptions.map((s) => ({
              user_id: userId,
              name: s.name,
              notes: s.notes,
              amount: s.amount,
              currency_code: s.currency_code,
              billing_cycle: s.billing_cycle,
              custom_cycle_days: s.custom_cycle_days,
              first_billing_date: s.first_billing_date,
              is_active: s.is_active,
              is_trial: s.is_trial,
              trial_end_date: s.trial_end_date,
              brand_color: s.brand_color,
              icon_url: s.icon_url,
              domain: s.domain,
              cancellation_url: s.cancellation_url,
              list_id: s.list_id ? (listIds.get(s.list_id) ?? null) : null,
              category_id: s.category_id ? (categoryIds.get(s.category_id) ?? null) : null,
              payment_method_id: s.payment_method_id
                ? (methodIds.get(s.payment_method_id) ?? null)
                : null,
            }))
          )
          .select()
        if (error) throw error
        backup.subscriptions.forEach((s, i) => subscriptionIds.set(s.id, data[i].id))
      }

      const changes = backup.price_changes
        .filter((c) => subscriptionIds.has(c.subscription_id))
        .map((c) => ({
          user_id: userId,
          subscription_id: subscriptionIds.get(c.subscription_id) as string,
          changed_at: c.changed_at,
          old_amount: c.old_amount,
          new_amount: c.new_amount,
        }))

      if (changes.length > 0) {
        const { error } = await supabase.from('price_changes').insert(changes)
        if (error) throw error
      }
    },
    onSuccess: () => queryClient.invalidateQueries(),
  })
}

/** Inserisce i dati di esempio in un'unica sequenza di mutazioni (§10). */
export function useLoadSampleData() {
  const queryClient = useQueryClient()
  const userId = useUserId()

  return useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error('Sessione assente')
      const now = new Date()

      const { data: existingLists } = await supabase.from('lists').select('*')
      let listId = existingLists?.[0]?.id ?? null
      if (!listId) {
        const { data, error } = await supabase
          .from('lists')
          .insert({ user_id: userId, name: DEFAULT_LIST_NAME, icon: 'user', sort_order: 0 })
          .select()
          .single()
        if (error) throw error
        listId = data.id
      }

      const { data: existingCategories } = await supabase.from('categories').select('*')
      let categories = existingCategories ?? []
      if (categories.length === 0) {
        const { data, error } = await supabase
          .from('categories')
          .insert(
            DEFAULT_CATEGORIES.map((c, i) => ({
              user_id: userId,
              name: c.name,
              color: c.color,
              icon: c.icon,
              sort_order: i,
            }))
          )
          .select()
        if (error) throw error
        categories = data
      }

      const { data: inserted, error: insertError } = await supabase
        .from('subscriptions')
        .insert(
          SAMPLE_SUBSCRIPTIONS.map((sample) => ({
            user_id: userId,
            name: sample.name,
            notes: sample.notes ?? '',
            amount: sample.amount,
            currency_code: 'EUR',
            billing_cycle: sample.billing_cycle,
            custom_cycle_days: sample.custom_cycle_days ?? 30,
            first_billing_date: sampleStartDate(sample, now),
            is_active: sample.isActive ?? true,
            is_trial: sample.isTrial ?? false,
            trial_end_date: sample.trialEndsInDays
              ? toISODate(addDays(now, sample.trialEndsInDays))
              : null,
            brand_color: sample.brandColor,
            icon_url: '',
            domain: sample.domain,
            cancellation_url: sample.cancellationUrl ?? '',
            list_id: listId,
            category_id: categories.find((c) => c.name === sample.categoryName)?.id ?? null,
            payment_method_id: null,
          }))
        )
        .select()
      if (insertError) throw insertError

      // Storico prezzi dei campioni che lo prevedono
      const changes = SAMPLE_SUBSCRIPTIONS.flatMap((sample, i) =>
        (sample.priceChanges ?? []).map((change) => ({
          user_id: userId,
          subscription_id: inserted[i].id,
          changed_at: toISODate(addDays(now, -change.monthsAgo * 30)),
          old_amount: change.oldAmount,
          new_amount: change.newAmount,
        }))
      )
      if (changes.length > 0) {
        const { error } = await supabase.from('price_changes').insert(changes)
        if (error) throw error
      }
    },
    onSuccess: () => queryClient.invalidateQueries(),
  })
}

export function useDeleteAllData() {
  const queryClient = useQueryClient()
  const userId = useUserId()

  return useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error('Sessione assente')
      await deleteEverything(userId)
    },
    onSuccess: () => queryClient.invalidateQueries(),
  })
}
