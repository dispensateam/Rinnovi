import { EntityEditor } from '../../components/settings/EntityEditor'
import { useCreateList, useDeleteList, useLists, useUpdateList } from '../../hooks/useLists'

export default function ListsSettings() {
  const lists = useLists()
  const create = useCreateList()
  const update = useUpdateList()
  const remove = useDeleteList()

  const items = lists.data ?? []

  return (
    <EntityEditor
      title="Liste"
      items={items.map((l) => ({ id: l.id, name: l.name }))}
      withReorder
      emptyLabel="Nessuna lista."
      deleteHint="Eliminando una lista i suoi abbonamenti passano alla prima rimanente. L'ultima lista non si può eliminare."
      canDelete={() => items.length > 1}
      onCreate={(name) =>
        create.mutate({ name, icon: 'user', sort_order: items.length })
      }
      onRename={(id, name) => update.mutate({ id, patch: { name } })}
      onReorder={(id, direction) => {
        const index = items.findIndex((l) => l.id === id)
        const target = items[index + direction]
        const current = items[index]
        if (!target || !current) return
        // Scambio degli ordini fra le due voci coinvolte
        update.mutate({ id: current.id, patch: { sort_order: target.sort_order } })
        update.mutate({ id: target.id, patch: { sort_order: current.sort_order } })
      }}
      onDelete={(id) => {
        const fallback = items.find((l) => l.id !== id)
        remove.mutate({ id, fallbackListId: fallback?.id ?? null })
      }}
    />
  )
}
