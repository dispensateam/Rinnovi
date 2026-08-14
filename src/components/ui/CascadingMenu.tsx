import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, ChevronDown, ChevronRight } from 'lucide-react'

export interface MenuOption {
  id: string
  label: string
  icon?: ReactNode
  active?: boolean
  /** Stacca la voce dalle precedenti con un divisore (es. "Modifica liste"). */
  separated?: boolean
  onSelect: () => void
}

export interface MenuSection {
  id: string
  label: string
  icon: ReactNode
  options: MenuOption[]
}

interface CascadingMenuProps {
  open: boolean
  onClose: () => void
  sections: MenuSection[]
  /** Posizionamento rispetto al contenitore relativo che lo ospita. */
  className?: string
}

const SPRING = { type: 'spring', stiffness: 300, damping: 30 } as const

/**
 * Menu a cascata dei filtri (§7.2): il secondo livello scivola sopra il primo,
 * che resta visibile dietro leggermente sfalsato in basso.
 */
export function CascadingMenu({ open, onClose, sections, className = '' }: CascadingMenuProps) {
  const [openSection, setOpenSection] = useState<string | null>(null)
  const ref = useRef<HTMLDivElement>(null)

  // Alla chiusura si torna sempre al primo livello
  useEffect(() => {
    if (!open) setOpenSection(null)
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      // Escape chiude prima il sottolivello, poi il menu
      if (openSection) setOpenSection(null)
      else onClose()
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
  }, [open, openSection, onClose])

  const active = sections.find((s) => s.id === openSection) ?? null

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={ref}
          className={`absolute z-40 w-[280px] ${className}`}
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.94 }}
          transition={SPRING}
        >
          <div className="relative">
            {/* Primo livello: resta dietro, sfalsato in basso, quando si apre il secondo */}
            <motion.div
              className="overflow-hidden rounded-panel border border-hairline bg-[rgba(20,17,25,.92)] shadow-panel backdrop-blur-xl"
              animate={active ? { y: 14, scale: 0.96, opacity: 0.6 } : { y: 0, scale: 1, opacity: 1 }}
              transition={SPRING}
            >
              {sections.map((section, i) => (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => setOpenSection(section.id)}
                  className={`flex w-full items-center gap-3 px-5 py-4 text-left transition active:bg-card-hi ${
                    i > 0 ? 'border-t border-hairline' : ''
                  }`}
                >
                  <span className="text-text-muted">{section.icon}</span>
                  <span className="flex-1 font-semibold text-text-primary">{section.label}</span>
                  <ChevronRight className="h-4 w-4 text-text-muted" aria-hidden />
                </button>
              ))}
            </motion.div>

            {/* Secondo livello sovrapposto */}
            <AnimatePresence>
              {active && (
                <motion.div
                  className="absolute inset-x-0 top-0 overflow-hidden rounded-panel border border-hairline bg-[rgba(20,17,25,.96)] shadow-panel backdrop-blur-xl"
                  initial={{ opacity: 0, scale: 0.94, y: -8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.94, y: -8 }}
                  transition={SPRING}
                >
                  <button
                    type="button"
                    onClick={() => setOpenSection(null)}
                    className="flex w-full items-center gap-3 px-5 py-4 text-left transition active:bg-card-hi"
                  >
                    <span className="text-text-muted">{active.icon}</span>
                    <span className="flex-1 font-semibold text-text-primary">{active.label}</span>
                    <ChevronDown className="h-4 w-4 text-text-muted" aria-hidden />
                  </button>

                  <div className="max-h-[320px] overflow-y-auto border-t border-hairline">
                    {active.options.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => {
                          option.onSelect()
                          onClose()
                        }}
                        className={`flex w-full items-center gap-3 px-5 py-3.5 text-left transition active:bg-card-hi ${
                          option.separated ? 'border-t border-hairline' : ''
                        }`}
                      >
                        {option.icon && <span className="text-text-muted">{option.icon}</span>}
                        <span className="flex-1 text-text-primary">{option.label}</span>
                        {option.active && <Check className="h-4 w-4 text-accent-glow" aria-hidden />}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
