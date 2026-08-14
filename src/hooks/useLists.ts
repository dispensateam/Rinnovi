import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { ListInsert, ListRow, ListUpdate } from '../types/database'
import { useUserId } from './useAuth'

export const listsKey = ['lists'] as const

export function useLists() {
  const userId = useUserId()
  return useQuery({
    queryKey: listsKey,
    enabled: Boolean(userId),
    queryFn: async (): Promise<ListRow[]> => {
      const { data, error } = await supabase
        .from('lists')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: true })
      if (error) throw error
      return data
    },
  })
}

export function useCreateList() {
  const queryClient = useQueryClient()
  const userId = useUserId()
  return useMutation({
    mutationFn: async (input: Omit<ListInsert, 'user_id'>): Promise<ListRow> => {
      if (!userId) throw new Error('Sessione assente')
      const { data, error } = await supabase
        .from('lists')
        .insert({ ...input, user_id: userId })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: listsKey }),
  })
}

export function useUpdateList() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: ListUpdate }): Promise<ListRow> => {
      const { data, error } = await supabase
        .from('lists')
        .update(patch)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: listsKey }),
  })
}

export function useDeleteList() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, fallbackListId }: { id: string; fallbackListId: string | null }) => {
      // Gli abbonamenti della lista eliminata passano alla prima rimanente (§7.8)
      if (fallbackListId) {
        const { error: moveError } = await supabase
          .from('subscriptions')
          .update({ list_id: fallbackListId })
          .eq('list_id', id)
        if (moveError) throw moveError
      }
      const { error } = await supabase.from('lists').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: listsKey })
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] })
    },
  })
}
