import type { ReactNode } from 'react'

interface IconBadgeProps {
  children: ReactNode
  /** Colore di tinta: viene usato al 18% come sfondo. */
  color?: string
  size?: number
  className?: string
}

/** Quadratino arrotondato colorato che ospita un'icona (§7.8). */
export function IconBadge({ children, color, size = 36, className = '' }: IconBadgeProps) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-xl ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor: color ? `${color}2E` : undefined,
        color: color ?? undefined,
      }}
    >
      {children}
    </span>
  )
}
