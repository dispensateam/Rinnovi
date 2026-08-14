import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'accent' | 'muted' | 'ghost'

const VARIANTS: Record<Variant, string> = {
  accent: 'bg-accent text-text-primary',
  muted: 'bg-card-hi text-text-primary',
  ghost: 'bg-transparent text-text-muted',
}

interface PillProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: Variant
}

/** Pulsante a capsula, elemento ricorrente della barra superiore (§7.1). */
export function Pill({ children, variant = 'muted', className = '', ...rest }: PillProps) {
  return (
    <button
      type="button"
      className={`inline-flex items-center gap-2 rounded-full px-5 font-bold transition active:scale-[0.97] disabled:opacity-40 ${VARIANTS[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}

/** Pulsante circolare con sola icona: richiede sempre un'etichetta accessibile. */
export function IconButton({
  children,
  label,
  size = 44,
  className = '',
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode; label: string; size?: number }) {
  return (
    <button
      type="button"
      aria-label={label}
      style={{ width: size, height: size }}
      className={`inline-flex shrink-0 items-center justify-center rounded-full border border-hairline bg-card-hi text-text-primary transition active:scale-[0.95] ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}
