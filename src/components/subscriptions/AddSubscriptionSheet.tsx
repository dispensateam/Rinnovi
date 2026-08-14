import { useMemo, useState } from 'react'
import { Plus, Search, SquarePen } from 'lucide-react'
import type { CatalogService } from '../../lib/catalog'
import { groupCatalog, searchCatalog } from '../../lib/catalog'
import { parseAmount } from './SubscriptionForm'
import type { SubscriptionFormValues } from './SubscriptionForm'
import { SubscriptionForm, emptyValues } from './SubscriptionForm'
import { Sheet } from '../ui/Sheet'
import { Pill, IconButton } from '../ui/Pill'
import { SubscriptionIcon } from './SubscriptionIcon'
import { useCategories } from '../../hooks/useCategories'
import { useLists } from '../../hooks/useLists'
import { useCreateSubscription } from '../../hooks/useSubscriptions'

type Mode = 'catalog' | 'form'

export function AddSubscriptionSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const categories = useCategories()
  const lists = useLists()
  const createSubscription = useCreateSubscription()

  const [mode, setMode] = useState<Mode>('catalog')
  const [query, setQuery] = useState('')
  const [values, setValues] = useState<SubscriptionFormValues>(emptyValues)

  const results = useMemo(() => searchCatalog(query), [query])
  const groups = useMemo(() => groupCatalog(results), [results])

  function reset() {
    setMode('catalog')
    setQuery('')
    setValues(emptyValues())
  }

  function close() {
    reset()
    onClose()
  }

  /** Precompila il form partendo da una voce del catalogo. */
  function pick(service: CatalogService) {
    const category = categories.data?.find((c) => c.name === service.category) ?? null
    setValues({
      ...emptyValues(),
      name: service.name,
      domain: service.domain,
      brand_color: service.brandColor,
      amount: String(service.monthlyPrice).replace('.', ','),
      category_id: category?.id ?? null,
      list_id: lists.data?.[0]?.id ?? null,
    })
    setMode('form')
  }

  function startBlank(name = '') {
    setValues({ ...emptyValues(), name, list_id: lists.data?.[0]?.id ?? null })
    setMode('form')
  }

  async function submit() {
    const amount = parseAmount(values.amount) ?? 0
    await createSubscription.mutateAsync({
      name: values.name.trim(),
      notes: values.notes,
      amount,
      currency_code: values.currency_code,
      billing_cycle: values.billing_cycle,
      custom_cycle_days: values.custom_cycle_days,
      first_billing_date: values.first_billing_date,
      is_active: true,
      is_trial: values.is_trial,
      trial_end_date: values.is_trial && values.trial_end_date ? values.trial_end_date : null,
      brand_color: values.brand_color,
      icon_url: values.icon_url,
      domain: values.domain,
      cancellation_url: values.cancellation_url,
      list_id: values.list_id,
      category_id: values.category_id,
      payment_method_id: values.payment_method_id,
    })
    close()
  }

  return (
    <Sheet open={open} onClose={close} label="Aggiungi abbonamento">
      <header className="flex items-center justify-between gap-3 border-b border-hairline px-4 py-3">
        <Pill
          variant="muted"
          className="h-10 text-[15px]"
          onClick={mode === 'form' ? () => setMode('catalog') : close}
        >
          {mode === 'form' ? 'Indietro' : 'Annulla'}
        </Pill>
        <h2 className="text-[17px] font-extrabold">
          {mode === 'form' ? 'Nuovo abbonamento' : 'Aggiungi'}
        </h2>
        <IconButton label="Compila a mano" size={40} onClick={() => startBlank()}>
          <SquarePen className="h-5 w-5" aria-hidden />
        </IconButton>
      </header>

      {mode === 'form' ? (
        <div className="flex-1 overflow-y-auto">
          <SubscriptionForm
            values={values}
            onChange={setValues}
            onSubmit={() => void submit()}
            saving={createSubscription.isPending}
            submitLabel="Salva abbonamento"
          />
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto px-4 pb-4">
            {groups.map((group) => (
              <section key={group.category} className="mt-5">
                <h3 className="mb-2 px-1 text-[13px] font-bold uppercase tracking-wide text-text-muted">
                  {group.category}
                </h3>
                <div className="overflow-hidden rounded-3xl bg-card">
                  {group.services.map((service, i) => (
                    <button
                      key={service.name}
                      type="button"
                      onClick={() => pick(service)}
                      className={`flex w-full items-center gap-3 px-4 py-3 text-left transition active:bg-card-hi ${
                        i > 0 ? 'border-t border-hairline' : ''
                      }`}
                    >
                      <SubscriptionIcon
                        source={{
                          name: service.name,
                          domain: service.domain,
                          brand_color: service.brandColor,
                        }}
                        size={36}
                      />
                      <span className="flex-1 text-[17px] text-text-primary">{service.name}</span>
                    </button>
                  ))}
                </div>
              </section>
            ))}

            {results.length === 0 && (
              <button
                type="button"
                onClick={() => startBlank(query)}
                className="mt-5 flex w-full items-center gap-3 rounded-3xl bg-card px-4 py-4 text-left"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent">
                  <Plus className="h-5 w-5" aria-hidden />
                </span>
                <span className="text-[17px] text-text-primary">Crea «{query}»</span>
              </button>
            )}
          </div>

          {/* Ricerca a pillola in fondo (§7.5) */}
          <div className="safe-bottom border-t border-hairline bg-bg px-4 py-3">
            <div className="flex items-center gap-2 rounded-full bg-card px-4 py-3">
              <Search className="h-5 w-5 text-text-muted" aria-hidden />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cerca un servizio"
                aria-label="Cerca un servizio"
                className="w-full bg-transparent text-[17px] text-text-primary placeholder:text-text-muted focus:outline-none"
              />
            </div>
          </div>
        </>
      )}
    </Sheet>
  )
}
