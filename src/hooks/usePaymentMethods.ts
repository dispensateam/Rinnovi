import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type {
  PaymentMethodInsert,
  PaymentMethodRow,
  PaymentMethodUpdate,
} from '../types/database'
import { useUserId } from './useAuth'

export const paymentMethodsKey = ['payment_methods'] as const

export function usePaymentMethods() {
  const userId = useUserId()
  return useQuery({
    queryKey: paymentMethodsKey,
    enabled: Boolean(userId),
    queryFn: async (): Promise<PaymentMethodRow[]> => {
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .order('created_at', { ascending: true })
      if (error) throw error
      return data
    },
  })
}

export function useCreatePaymentMethod() {
  const queryClient = useQueryClient()
  const userId = useUserId()
  return useMutation({
    mutationFn: async (
      input: Omit<PaymentMethodInsert, 'user_id'>
    ): Promise<PaymentMethodRow> => {
      if (!userId) throw new Error('Sessione assente')
      const { data, error } = await supabase
        .from('payment_methods')
        .insert({ ...input, user_id: userId })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: paymentMethodsKey }),
  })
}

export function useUpdatePaymentMethod() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      patch,
    }: {
      id: string
      patch: PaymentMethodUpdate
    }): Promise<PaymentMethodRow> => {
      const { data, error } = await supabase
        .from('payment_methods')
        .update(patch)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: paymentMethodsKey }),
  })
}

export function useDeletePaymentMethod() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      // La FK è `on delete set null`: gli abbonamenti restano, senza metodo
      const { error } = await supabase.from('payment_methods').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentMethodsKey })
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] })
    },
  })
}
