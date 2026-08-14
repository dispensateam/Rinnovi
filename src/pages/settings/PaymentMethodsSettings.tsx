import { EntityEditor } from '../../components/settings/EntityEditor'
import {
  useCreatePaymentMethod,
  useDeletePaymentMethod,
  usePaymentMethods,
  useUpdatePaymentMethod,
} from '../../hooks/usePaymentMethods'
import { DEFAULT_COLOR } from '../../lib/palette'

export default function PaymentMethodsSettings() {
  const methods = usePaymentMethods()
  const create = useCreatePaymentMethod()
  const update = useUpdatePaymentMethod()
  const remove = useDeletePaymentMethod()

  const items = methods.data ?? []

  return (
    <EntityEditor
      title="Metodi di pagamento"
      items={items.map((m) => ({ id: m.id, name: m.name, color: m.color }))}
      withColor
      emptyLabel="Nessun metodo di pagamento."
      deleteHint="Gli abbonamenti che lo usavano restano, semplicemente senza metodo."
      onCreate={(name) =>
        create.mutate({ name, icon: 'credit-card', color: DEFAULT_COLOR, last_four: '' })
      }
      onRename={(id, name) => update.mutate({ id, patch: { name } })}
      onRecolor={(id, color) => update.mutate({ id, patch: { color } })}
      onDelete={(id) => remove.mutate(id)}
    />
  )
}
