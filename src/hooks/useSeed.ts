import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { DEFAULT_CATEGORIES, DEFAULT_LIST_ICON, DEFAULT_LIST_NAME } from '../lib/defaults'
import { useUserId } from './useAuth'
import { useLists } from './useLists'
import { categoriesKey, useCategories } from './useCategories'
import { listsKey } from './useLists'

/**
 * Seed al primo accesso (§4): se l'utente non ha nessuna lista, crea la lista
 * "Personale" e le categorie di default. Non sta nel SQL perché dipende
 * dall'utente autenticato.
 */
export function useSeed() {
  const userId = useUserId()
  const queryClient = useQueryClient()
  const lists = useLists()
  const categories = useCategories()
  // Evita doppie esecuzioni in StrictMode e su re-render
  const seeding = useRef(false)

  useEffect(() => {
    if (!userId || seeding.current) return
    if (!lists.isSuccess || !categories.isSuccess) return
    if (lists.data.length > 0) return

    seeding.current = true

    void (async () => {
      try {
        const { error: listError } = await supabase
          .from('lists')
          .insert({ user_id: userId, name: DEFAULT_LIST_NAME, icon: DEFAULT_LIST_ICON, sort_order: 0 })
        if (listError) throw listError

        if (categories.data.length === 0) {
          const { error: catError } = await supabase.from('categories').insert(
            DEFAULT_CATEGORIES.map((c, index) => ({
              user_id: userId,
              name: c.name,
              color: c.color,
              icon: c.icon,
              sort_order: index,
            }))
          )
          if (catError) throw catError
        }

        await queryClient.invalidateQueries({ queryKey: listsKey })
        await queryClient.invalidateQueries({ queryKey: categoriesKey })
      } catch {
        // Se il seed fallisce si riprova al prossimo avvio: niente blocchi in UI
        seeding.current = false
      }
    })()
  }, [userId, lists.isSuccess, lists.data, categories.isSuccess, categories.data, queryClient])
}
