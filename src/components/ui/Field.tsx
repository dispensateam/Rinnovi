import { useId } from 'react'
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react'
import { Check } from 'lucide-react'
import { SUBSCRIPTION_COLORS } from '../../lib/palette'

/** Card che raggruppa i campi del form (§7.6). */
export function FieldGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-6">
      <h2 className="mb-2 px-1 text-[13px] font-bold uppercase tracking-wide text-text-muted">
        {title}
      </h2>
      <div className="divide-y divide-hairline overflow-hidden rounded-3xl bg-card">{children}</div>
    </section>
  )
}

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  hint?: string
  trailing?: ReactNode
}

export function TextField({ label, hint, trailing, ...rest }: TextFieldProps) {
  const id = useId()
  return (
    <div className="px-4 py-3">
      <label htmlFor={id} className="block text-[13px] font-semibold text-text-muted">
        {label}
      </label>
      <div className="flex items-center gap-3">
        <input
          id={id}
          className="w-full bg-transparent py-1.5 text-[17px] text-text-primary placeholder:text-text-muted/60 focus:outline-none"
          {...rest}
        />
        {trailing}
      </div>
      {hint && <p className="text-[12px] text-text-muted">{hint}</p>}
    </div>
  )
}

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  children: ReactNode
}

export function SelectField({ label, children, ...rest }: SelectFieldProps) {
  const id = useId()
  return (
    <div className="px-4 py-3">
      <label htmlFor={id} className="block text-[13px] font-semibold text-text-muted">
        {label}
      </label>
      <select
        id={id}
        className="w-full appearance-none bg-transparent py-1.5 text-[17px] text-text-primary focus:outline-none"
        {...rest}
      >
        {children}
      </select>
    </div>
  )
}

export function ToggleField({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (next: boolean) => void
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between px-4 py-4 text-left"
    >
      <span className="text-[17px] text-text-primary">{label}</span>
      <span
        className={`relative h-7 w-12 shrink-0 rounded-full transition ${
          checked ? 'bg-accent' : 'bg-card-hi'
        }`}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-text-primary transition-all ${
            checked ? 'left-6' : 'left-1'
          }`}
        />
      </span>
    </button>
  )
}

/** Palette dei 14 colori assegnabili (§7.6). */
export function ColorPicker({
  value,
  onChange,
}: {
  value: string
  onChange: (color: string) => void
}) {
  return (
    <div className="px-4 py-4">
      <p className="mb-3 text-[13px] font-semibold text-text-muted">Colore</p>
      <div className="flex flex-wrap gap-3">
        {SUBSCRIPTION_COLORS.map((color) => (
          <button
            key={color.value}
            type="button"
            aria-label={color.name}
            aria-pressed={value === color.value}
            onClick={() => onChange(color.value)}
            className="flex h-9 w-9 items-center justify-center rounded-full transition active:scale-90"
            style={{ backgroundColor: color.value }}
          >
            {value === color.value && <Check className="h-4 w-4 text-text-primary" aria-hidden />}
          </button>
        ))}
      </div>
    </div>
  )
}
