import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  /** Variante più chiara, per elementi in rilievo. */
  raised?: boolean
}

export function Card({ children, className = '', raised = false }: CardProps) {
  return (
    <div className={`rounded-3xl ${raised ? 'bg-card-hi' : 'bg-card'} ${className}`}>{children}</div>
  )
}

/** Gruppo di righe con divisori, usato in Impostazioni e Dettaglio. */
export function CardGroup({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <Card className={`divide-y divide-hairline overflow-hidden ${className}`}>{children}</Card>
  )
}

interface CardRowProps {
  icon?: ReactNode
  label: ReactNode
  value?: ReactNode
  onClick?: () => void
  trailing?: ReactNode
  danger?: boolean
}

export function CardRow({ icon, label, value, onClick, trailing, danger = false }: CardRowProps) {
  const content = (
    <>
      {icon && (
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-card-hi text-text-muted">
          {icon}
        </span>
      )}
      <span className={`flex-1 text-left ${danger ? 'text-danger' : 'text-text-primary'}`}>
        {label}
      </span>
      {value !== undefined && <span className="tabular text-text-muted">{value}</span>}
      {trailing}
    </>
  )

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="flex w-full items-center gap-3 px-4 py-4 text-left transition active:bg-card-hi"
      >
        {content}
      </button>
    )
  }

  return <div className="flex w-full items-center gap-3 px-4 py-4">{content}</div>
}
