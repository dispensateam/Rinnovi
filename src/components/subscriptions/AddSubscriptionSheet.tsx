import { Sheet } from '../ui/Sheet'

// Segnaposto della Fase 4: il catalogo con ricerca arriva nella Fase 5.
export function AddSubscriptionSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Sheet open={open} onClose={onClose} label="Aggiungi abbonamento">
      <div className="px-6 py-6" />
    </Sheet>
  )
}
