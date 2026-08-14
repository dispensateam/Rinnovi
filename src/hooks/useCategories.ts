import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { CategoryInsert, CategoryRow, CategoryUpdate } from '../types/database'
import { useUserId } from './useAuth'

export const categoriesKey = ['categories'] as const

export function useCategories() {
  const userId = useUserId()
  return useQuery({
    queryKey: categoriesKey,
    enabled: Boolean(userId),
    queryFn: async (): Promise<CategoryRow[]> => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: true })
      if (error) throw error
      return data
    },
  })
}

export function useCreateCategory() {
  const queryClient = useQueryClient()
  const userId = useUserId()
  return useMutation({
    mutationFn: async (input: Omit<CategoryInsert, 'user_id'>): Promise<CategoryRow> => {
      if (!userId) throw new Error('Sessione assente')
      const { data, error } = await supabase
        .from('categories')
        .insert({ ...input, user_id: userId })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: categoriesKey }),
  })
}

export function useUpdateCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      patch,
    }: {
      id: string
      patch: CategoryUpdate
    }): Promise<CategoryRow> => {
      const { data, error } = await supabase
        .from('categories')
        .update(patch)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: categoriesKey }),
  })
}

export function useDeleteCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, fallbackCategoryId }: { id: string; fallbackCategoryId: string | null }) => {
      // Gli abbonamenti della categoria eliminata passano a "Altro" (§7.8)
      const { error: moveError } = await supabase
        .from('subscriptions')
        .update({ category_id: fallbackCategoryId })
        .eq('category_id', id)
      if (moveError) throw moveError

      const { error } = await supabase.from('categories').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoriesKey })
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] })
    },
  })
}
