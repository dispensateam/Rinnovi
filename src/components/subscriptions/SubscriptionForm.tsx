import { Loader2 } from 'lucide-react'
import type { BillingCycle, SubscriptionRow } from '../../types/database'
import { BILLING_CYCLES, BILLING_CYCLE_LABELS } from '../../types/database'
import { DEFAULT_COLOR } from '../../lib/palette'
import { toISODate } from '../../lib/format'
import { ColorPicker, FieldGroup, SelectField, TextField, ToggleField } from '../ui/Field'
import { InlineCreateSelect } from './OrganizationFields'
import { SubscriptionIcon } from './SubscriptionIcon'
import { useLists, useCreateList } from '../../hooks/useLists'
import { useCategories, useCreateCategory } from '../../hooks/useCategories'
import { usePaymentMethods, useCreatePaymentMethod } from '../../hooks/usePaymentMethods'

/** Valori del form: stringhe dove l'input è testuale, per non perdere lo stato. */
export interface SubscriptionFormValues {
  name: string
  amount: string
  currency_code: string
  billing_cycle: BillingCycle
  custom_cycle_days: number
  first_billing_date: string
  is_trial: boolean
  trial_end_date: string
  brand_color: string
  icon_url: string
  domain: string
  cancellation_url: string
  notes: string
  list_id: string | null
  category_id: string | null
  payment_method_id: string | null
}

const CURRENCIES = ['EUR', 'USD', 'GBP', 'CHF']

export function emptyValues(): SubscriptionFormValues {
  return {
    name: '',
    amount: '',
    currency_code: 'EUR',
    billing_cycle: 'monthly',
    custom_cycle_days: 30,
    first_billing_date: toISODate(new Date()),
    is_trial: false,
    trial_end_date: '',
    brand_color: DEFAULT_COLOR,
    icon_url: '',
    domain: '',
    cancellation_url: '',
    notes: '',
    list_id: null,
    category_id: null,
    payment_method_id: null,
  }
}

export function valuesFromRow(row: SubscriptionRow): SubscriptionFormValues {
  return {
    name: row.name,
    amount: String(row.amount).replace('.', ','),
    currency_code: row.currency_code,
    billing_cycle: row.billing_cycle,
    custom_cycle_days: row.custom_cycle_days,
    first_billing_date: row.first_billing_date,
    is_trial: row.is_trial,
    trial_end_date: row.trial_end_date ?? '',
    brand_color: row.brand_color,
    icon_url: row.icon_url,
    domain: row.domain,
    cancellation_url: row.cancellation_url,
    notes: row.notes,
    list_id: row.list_id,
    category_id: row.category_id,
    payment_method_id: row.payment_method_id,
  }
}

/** Accetta sia virgola sia punto come separatore decimale (§7.6). */
export function parseAmount(input: string): number | null {
  const normalized = input.trim().replace(/\s/g, '').replace(',', '.')
  if (normalized === '') return null
  const value = Number(normalized)
  return Number.isFinite(value) ? value : null
}

export function isValid(values: SubscriptionFormValues): boolean {
  const amount = parseAmount(values.amount)
  if (values.name.trim() === '') return false
  if (amount === null || amount < 0) return false
  if (Number.isNaN(new Date(values.first_billing_date).getTime())) return false
  if (values.is_trial && values.trial_end_date === '') return false
  return true
}

interface SubscriptionFormProps {
  values: SubscriptionFormValues
  onChange: (values: SubscriptionFormValues) => void
  onSubmit: () => void
  saving: boolean
  submitLabel: string
}

export function SubscriptionForm({
  values,
  onChange,
  onSubmit,
  saving,
  submitLabel,
}: SubscriptionFormProps) {
  const lists = useLists()
  const categories = useCategories()
  const paymentMethods = usePaymentMethods()
  const createList = useCreateList()
  const createCategory = useCreateCategory()
  const createPaymentMethod = useCreatePaymentMethod()

  function set<K extends keyof SubscriptionFormValues>(key: K, value: SubscriptionFormValues[K]) {
    onChange({ ...values, [key]: value })
  }

  const valid = isValid(values)

  return (
    <form
      className="px-5 pb-32"
      onSubmit={(e) => {
        e.preventDefault()
        if (!valid || saving) return
        onSubmit()
      }}
    >
      <FieldGroup title="Identità">
        <TextField
          label="Nome"
          value={values.name}
          onChange={(e) => set('name', e.target.value)}
          placeholder="Netflix"
          autoFocus
        />
        <TextField
          label="Dominio"
          value={values.domain}
          onChange={(e) => set('domain', e.target.value)}
          placeholder="netflix.com"
          hint="Serve a recuperare il logo automaticamente."
          trailing={
            <SubscriptionIcon
              source={{
                name: values.name || '?',
                domain: values.domain,
                icon_url: values.icon_url,
                brand_color: values.brand_color,
              }}
              size={36}
            />
          }
        />
        <TextField
          label="URL immagine personalizzata"
          value={values.icon_url}
          onChange={(e) => set('icon_url', e.target.value)}
          placeholder="https://…"
          inputMode="url"
        />
        <ColorPicker value={values.brand_color} onChange={(c) => set('brand_color', c)} />
      </FieldGroup>

      <FieldGroup title="Costo">
        <TextField
          label="Importo"
          value={values.amount}
          onChange={(e) => set('amount', e.target.value)}
          inputMode="decimal"
          placeholder="12,99"
        />
        <SelectField
          label="Valuta"
          value={values.currency_code}
          onChange={(e) => set('currency_code', e.target.value)}
        >
          {CURRENCIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </SelectField>
        <SelectField
          label="Ciclo di fatturazione"
          value={values.billing_cycle}
          onChange={(e) => set('billing_cycle', e.target.value as BillingCycle)}
        >
          {BILLING_CYCLES.map((c) => (
            <option key={c} value={c}>
              {BILLING_CYCLE_LABELS[c]}
            </option>
          ))}
        </SelectField>
        {values.billing_cycle === 'custom' && (
          <TextField
            label="Giorni tra un rinnovo e l'altro"
            value={String(values.custom_cycle_days)}
            onChange={(e) => set('custom_cycle_days', Math.max(1, Number(e.target.value) || 1))}
            inputMode="numeric"
          />
        )}
      </FieldGroup>

      <FieldGroup title="Date">
        <TextField
          label="Prima fatturazione"
          type="date"
          value={values.first_billing_date}
          onChange={(e) => set('first_billing_date', e.target.value)}
        />
        <ToggleField
          label="È una prova gratuita"
          checked={values.is_trial}
          onChange={(next) => set('is_trial', next)}
        />
        {values.is_trial && (
          <TextField
            label="Fine della prova"
            type="date"
            value={values.trial_end_date}
            onChange={(e) => set('trial_end_date', e.target.value)}
          />
        )}
      </FieldGroup>

      <FieldGroup title="Organizzazione">
        <InlineCreateSelect
          label="Lista"
          emptyLabel="Nessuna lista"
          options={lists.data ?? []}
          value={values.list_id}
          onChange={(id) => set('list_id', id)}
          onCreate={async (name) => (await createList.mutateAsync({ name, icon: 'user', sort_order: 0 })).id}
        />
        <InlineCreateSelect
          label="Categoria"
          emptyLabel="Nessuna categoria"
          options={categories.data ?? []}
          value={values.category_id}
          onChange={(id) => set('category_id', id)}
          onCreate={async (name) =>
            (
              await createCategory.mutateAsync({
                name,
                color: values.brand_color,
                icon: 'tag',
                sort_order: 99,
              })
            ).id
          }
        />
        <InlineCreateSelect
          label="Metodo di pagamento"
          emptyLabel="Nessun metodo"
          options={paymentMethods.data ?? []}
          value={values.payment_method_id}
          onChange={(id) => set('payment_method_id', id)}
          onCreate={async (name) =>
            (
              await createPaymentMethod.mutateAsync({
                name,
                icon: 'credit-card',
                color: values.brand_color,
                last_four: '',
              })
            ).id
          }
        />
      </FieldGroup>

      <FieldGroup title="Extra">
        <TextField
          label="URL di disdetta"
          value={values.cancellation_url}
          onChange={(e) => set('cancellation_url', e.target.value)}
          placeholder="https://…"
          inputMode="url"
        />
        <TextField
          label="Note"
          value={values.notes}
          onChange={(e) => set('notes', e.target.value)}
          placeholder="Piano famiglia condiviso"
        />
      </FieldGroup>

      <button
        type="submit"
        disabled={!valid || saving}
        className="mt-8 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-accent text-[17px] font-extrabold text-text-primary transition active:scale-[0.98] disabled:opacity-40"
      >
        {saving && <Loader2 className="h-5 w-5 animate-spin" aria-hidden />}
        {submitLabel}
      </button>
    </form>
  )
}
