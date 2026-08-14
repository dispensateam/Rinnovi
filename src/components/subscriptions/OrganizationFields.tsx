import { useState } from 'react'
import { SelectField } from '../ui/Field'

const NEW_VALUE = '__new__'

interface Option {
  id: string
  name: string
}

interface InlineCreateSelectProps {
  label: string
  options: Option[]
  value: string | null
  onChange: (id: string | null) => void
  /** Crea la voce e restituisce il nuovo id, che viene selezionato subito. */
  onCreate: (name: string) => Promise<string>
  /** Etichetta della voce vuota. */
  emptyLabel: string
}

/**
 * Select con opzione inline "Nuovo…" (§7.6): evita di uscire dal form per
 * creare al volo una lista, una categoria o un metodo di pagamento.
 */
export function InlineCreateSelect({
  label,
  options,
  value,
  onChange,
  onCreate,
  emptyLabel,
}: InlineCreateSelectProps) {
  const [creating, setCreating] = useState(false)
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)

  async function confirm() {
    const trimmed = name.trim()
    if (!trimmed || busy) return
    setBusy(true)
    try {
      const id = await onCreate(trimmed)
      onChange(id)
      setCreating(false)
      setName('')
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <SelectField
        label={label}
        value={creating ? NEW_VALUE : (value ?? '')}
        onChange={(e) => {
          const next = e.target.value
          if (next === NEW_VALUE) {
            setCreating(true)
            return
          }
          setCreating(false)
          onChange(next === '' ? null : next)
        }}
      >
        <option value="">{emptyLabel}</option>
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.name}
          </option>
        ))}
        <option value={NEW_VALUE}>Nuovo…</option>
      </SelectField>

      {creating && (
        <div className="flex items-center gap-2 px-4 py-3">
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                void confirm()
              }
              if (e.key === 'Escape') setCreating(false)
            }}
            placeholder={`Nome ${label.toLowerCase()}`}
            className="w-full rounded-xl bg-card-hi px-3 py-2 text-[16px] text-text-primary placeholder:text-text-muted/60 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => void confirm()}
            disabled={!name.trim() || busy}
            className="rounded-xl bg-accent px-4 py-2 text-[15px] font-bold text-text-primary disabled:opacity-40"
          >
            Crea
          </button>
        </div>
      )}
    </>
  )
}
