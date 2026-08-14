import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

interface SheetProps {
  open: boolean
  onClose: () => void
  children: ReactNode
  /** Etichetta accessibile del pannello. */
  label: string
}

/**
 * Pannello che scorre dal basso. Chiusura con Escape e con tap sullo sfondo.
 * Blocca lo scroll della pagina sottostante mentre è aperto.
 */
export function Sheet({ open, onClose, children, label }: SheetProps) {
  const reduced = useReducedMotion()

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = previous
    }
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={label}
            className="absolute inset-x-0 bottom-0 top-0 mx-auto flex w-full max-w-app flex-col overflow-hidden bg-bg"
            initial={reduced ? { opacity: 0 } : { y: '100%' }}
            animate={reduced ? { opacity: 1 } : { y: 0 }}
            exit={reduced ? { opacity: 0 } : { y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
