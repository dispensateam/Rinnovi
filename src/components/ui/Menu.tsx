import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check } from 'lucide-react'

export interface MenuItem {
  id: string
  label: string
  icon?: ReactNode
  active?: boolean
  danger?: boolean
  separated?: boolean
  onSelect: () => void
}

interface MenuProps {
  open: boolean
  onClose: () => void
  items: MenuItem[]
  className?: string
  label: string
}

/** Popover a un livello: ordinamento della lista e menu del dettaglio. */
export function Menu({ open, onClose, items, className = '', label }: MenuProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    const onPointer = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onPointer)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onPointer)
    }
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={ref}
          role="menu"
          aria-label={label}
          className={`absolute z-40 w-[240px] overflow-hidden rounded-panel border border-hairline bg-[rgba(20,17,25,.94)] shadow-panel backdrop-blur-xl ${className}`}
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.94 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              role="menuitem"
              onClick={() => {
                item.onSelect()
                onClose()
              }}
              className={`flex w-full items-center gap-3 px-5 py-3.5 text-left transition active:bg-card-hi ${
                item.separated ? 'border-t border-hairline' : ''
              }`}
            >
              {item.icon && (
                <span className={item.danger ? 'text-danger' : 'text-text-muted'}>{item.icon}</span>
              )}
              <span className={`flex-1 ${item.danger ? 'text-danger' : 'text-text-primary'}`}>
                {item.label}
              </span>
              {item.active && <Check className="h-4 w-4 text-accent-glow" aria-hidden />}
            </button>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
