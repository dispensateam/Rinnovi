import type { PriceChangeRow, SubscriptionRow } from '../../types/database'
import { Card, CardGroup, CardRow } from '../ui/Card'
import { formatCurrency, formatDateShort, formatPercentChange, parseISODate } from '../../lib/format'
import { useLists } from '../../hooks/useLists'
import { useCategories } from '../../hooks/useCategories'
import { usePaymentMethods } from '../../hooks/usePaymentMethods'

/** Riquadro della griglia 2×2 del dettaglio (§7.3). */
export function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <Card className="px-4 py-4">
      <p className="text-[13px] text-text-muted">{label}</p>
      <p className="tabular mt-1 text-[20px] font-extrabold">{value}</p>
    </Card>
  )
}

export function InfoRows({ sub }: { sub: SubscriptionRow }) {
  const lists = useLists()
  const categories = useCategories()
  const paymentMethods = usePaymentMethods()

  const list = lists.data?.find((l) => l.id === sub.list_id)
  const category = categories.data?.find((c) => c.id === sub.category_id)
  const method = paymentMethods.data?.find((p) => p.id === sub.payment_method_id)

  return (
    <CardGroup className="mt-6">
      <CardRow label="Lista" value={list?.name ?? '—'} />
      <CardRow label="Categoria" value={category?.name ?? '—'} />
      <CardRow label="Metodo di pagamento" value={method?.name ?? '—'} />
      <CardRow
        label="Prima fatturazione"
        value={formatDateShort(parseISODate(sub.first_billing_date))}
      />
      {sub.is_trial && sub.trial_end_date && (
        <CardRow label="Fine prova" value={formatDateShort(parseISODate(sub.trial_end_date))} />
      )}
      {sub.notes && <CardRow label="Note" value={sub.notes} />}
    </CardGroup>
  )
}

export function PriceHistory({
  changes,
  currency,
}: {
  changes: PriceChangeRow[]
  currency: string
}) {
  const ordered = [...changes].sort(
    (a, b) => parseISODate(b.changed_at).getTime() - parseISODate(a.changed_at).getTime()
  )

  return (
    <section className="mt-6">
      <h2 className="mb-2 px-1 text-[13px] font-bold uppercase tracking-wide text-text-muted">
        Storico prezzi
      </h2>
      <CardGroup>
        {ordered.map((change) => {
          const increased = change.new_amount > change.old_amount
          return (
            <CardRow
              key={change.id}
              label={
                <span className="tabular">
                  {formatCurrency(change.old_amount, currency)} →{' '}
                  {formatCurrency(change.new_amount, currency)}
                </span>
              }
              value={
                <span className="flex items-center gap-2">
                  <span className={increased ? 'text-danger' : 'text-accent-glow'}>
                    {formatPercentChange(change.old_amount, change.new_amount)}
                  </span>
                  <span className="text-text-muted">
                    {formatDateShort(parseISODate(change.changed_at))}
                  </span>
                </span>
              }
            />
          )
        })}
      </CardGroup>
    </section>
  )
}
