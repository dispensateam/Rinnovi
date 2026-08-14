import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { toISODate } from '../lib/format'
import type {
  PriceChangeRow,
  SubscriptionInsert,
  SubscriptionRow,
  SubscriptionUpdate,
} from '../types/database'
import { useUserId } from './useAuth'

export const subscriptionsKey = ['subscriptions'] as const
export const priceChangesKey = ['price_changes'] as const

export function useSubscriptions() {
  const userId = useUserId()
  return useQuery({
    queryKey: subscriptionsKey,
    enabled: Boolean(userId),
    queryFn: async (): Promise<SubscriptionRow[]> => {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
  })
}

/** Storico prezzi completo: piccolo, si carica tutto in una volta. */
export function usePriceChanges() {
  const userId = useUserId()
  return useQuery({
    queryKey: priceChangesKey,
    enabled: Boolean(userId),
    queryFn: async (): Promise<PriceChangeRow[]> => {
      const { data, error } = await supabase
        .from('price_changes')
        .select('*')
        .order('changed_at', { ascending: true })
      if (error) throw error
      return data
    },
  })
}

export function useCreateSubscription() {
  const queryClient = useQueryClient()
  const userId = useUserId()
  return useMutation({
    mutationFn: async (
      input: Omit<SubscriptionInsert, 'user_id'>
    ): Promise<SubscriptionRow> => {
      if (!userId) throw new Error('Sessione assente')
      const { data, error } = await supabase
        .from('subscriptions')
        .insert({ ...input, user_id: userId })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: subscriptionsKey }),
  })
}

export function useUpdateSubscription() {
  const queryClient = useQueryClient()
  const userId = useUserId()
  return useMutation({
    mutationFn: async ({
      id,
      patch,
      previousAmount,
    }: {
      id: string
      patch: SubscriptionUpdate
      /** Importo prima della modifica: se cambia si registra lo storico. */
      previousAmount?: number
    }): Promise<SubscriptionRow> => {
      const { data, error } = await supabase
        .from('subscriptions')
        .update(patch)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error

      // Variazione di prezzo registrata in automatico (§7.6)
      if (
        userId &&
        typeof patch.amount === 'number' &&
        typeof previousAmount === 'number' &&
        patch.amount !== previousAmount
      ) {
        const { error: priceError } = await supabase.from('price_changes').insert({
          user_id: userId,
          subscription_id: id,
          changed_at: toISODate(new Date()),
          old_amount: previousAmount,
          new_amount: patch.amount,
        })
        if (priceError) throw priceError
      }

      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subscriptionsKey })
      queryClient.invalidateQueries({ queryKey: priceChangesKey })
    },
  })
}

export function useDeleteSubscription() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('subscriptions').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subscriptionsKey })
      queryClient.invalidateQueries({ queryKey: priceChangesKey })
    },
  })
}

/** Inserimento in blocco: usato da dati di esempio e import backup (§10). */
export function useBulkCreateSubscriptions() {
  const queryClient = useQueryClient()
  const userId = useUserId()
  return useMutation({
    mutationFn: async (
      rows: Omit<SubscriptionInsert, 'user_id'>[]
    ): Promise<SubscriptionRow[]> => {
      if (!userId) throw new Error('Sessione assente')
      if (rows.length === 0) return []
      const { data, error } = await supabase
        .from('subscriptions')
        .insert(rows.map((r) => ({ ...r, user_id: userId })))
        .select()
      if (error) throw error
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: subscriptionsKey }),
  })
}
