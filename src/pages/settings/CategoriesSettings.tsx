import { EntityEditor } from '../../components/settings/EntityEditor'
import {
  useCategories,
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
} from '../../hooks/useCategories'
import { DEFAULT_COLOR } from '../../lib/palette'
import { FALLBACK_CATEGORY_NAME } from '../../lib/defaults'

export default function CategoriesSettings() {
  const categories = useCategories()
  const create = useCreateCategory()
  const update = useUpdateCategory()
  const remove = useDeleteCategory()

  const items = categories.data ?? []

  return (
    <EntityEditor
      title="Categorie"
      items={items.map((c) => ({ id: c.id, name: c.name, color: c.color }))}
      withColor
      withReorder
      emptyLabel="Nessuna categoria."
      deleteHint={`Eliminando una categoria i suoi abbonamenti passano a «${FALLBACK_CATEGORY_NAME}».`}
      onCreate={(name) =>
        create.mutate({ name, color: DEFAULT_COLOR, icon: 'tag', sort_order: items.length })
      }
      onRename={(id, name) => update.mutate({ id, patch: { name } })}
      onRecolor={(id, color) => update.mutate({ id, patch: { color } })}
      onReorder={(id, direction) => {
        const index = items.findIndex((c) => c.id === id)
        const target = items[index + direction]
        const current = items[index]
        if (!target || !current) return
        update.mutate({ id: current.id, patch: { sort_order: target.sort_order } })
        update.mutate({ id: target.id, patch: { sort_order: current.sort_order } })
      }}
      onDelete={(id) => {
        // Ricaduta su "Altro", se esiste ancora ed è diversa da quella eliminata
        const fallback = items.find((c) => c.name === FALLBACK_CATEGORY_NAME && c.id !== id)
        remove.mutate({ id, fallbackCategoryId: fallback?.id ?? null })
      }}
    />
  )
}
