import { useState } from 'react'
import type { SubscriptionRow } from '../../types/database'
import { parseAmount, SubscriptionForm, valuesFromRow } from './SubscriptionForm'
import type { SubscriptionFormValues } from './SubscriptionForm'
import { Sheet } from '../ui/Sheet'
import { Pill } from '../ui/Pill'
import { useUpdateSubscription } from '../../hooks/useSubscriptions'

interface EditSubscriptionSheetProps {
  sub: SubscriptionRow
  open: boolean
  onClose: () => void
}

/**
 * Stesso form della creazione. Se l'importo cambia, l'hook di update registra
 * da solo la riga in `price_changes` (§7.6).
 */
export function EditSubscriptionSheet({ sub, open, onClose }: EditSubscriptionSheetProps) {
  const update = useUpdateSubscription()
  const [values, setValues] = useState<SubscriptionFormValues>(() => valuesFromRow(sub))

  async function submit() {
    const amount = parseAmount(values.amount) ?? 0
    await update.mutateAsync({
      id: sub.id,
      previousAmount: sub.amount,
      patch: {
        name: values.name.trim(),
        notes: values.notes,
        amount,
        currency_code: values.currency_code,
        billing_cycle: values.billing_cycle,
        custom_cycle_days: values.custom_cycle_days,
        first_billing_date: values.first_billing_date,
        is_trial: values.is_trial,
        trial_end_date: values.is_trial && values.trial_end_date ? values.trial_end_date : null,
        brand_color: values.brand_color,
        icon_url: values.icon_url,
        domain: values.domain,
        cancellation_url: values.cancellation_url,
        list_id: values.list_id,
        category_id: values.category_id,
        payment_method_id: values.payment_method_id,
      },
    })
    onClose()
  }

  return (
    <Sheet open={open} onClose={onClose} label={`Modifica ${sub.name}`}>
      <header className="flex items-center justify-between gap-3 border-b border-hairline px-4 py-3">
        <Pill variant="muted" className="h-10 text-[15px]" onClick={onClose}>
          Annulla
        </Pill>
        <h2 className="text-[17px] font-extrabold">Modifica</h2>
        <span className="w-[76px]" aria-hidden />
      </header>

      <div className="flex-1 overflow-y-auto">
        <SubscriptionForm
          values={values}
          onChange={setValues}
          onSubmit={() => void submit()}
          saving={update.isPending}
          submitLabel="Salva modifiche"
        />
      </div>
    </Sheet>
  )
}
