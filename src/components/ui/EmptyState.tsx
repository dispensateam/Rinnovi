import type { ReactNode } from 'react'
import { Card } from './Card'

interface EmptyStateProps {
  icon: ReactNode
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export function EmptyState({ icon, title, description, action, className = '' }: EmptyStateProps) {
  return (
    <Card className={`flex flex-col items-center px-6 py-10 text-center ${className}`}>
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-card-hi text-text-muted">
        {icon}
      </span>
      <h3 className="mt-4 text-lg font-extrabold text-text-primary">{title}</h3>
      {description && <p className="mt-1 text-sm text-text-muted">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </Card>
  )
}
