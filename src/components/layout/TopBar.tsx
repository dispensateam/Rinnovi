import { useNavigate } from 'react-router-dom'
import { Plus, Sparkles } from 'lucide-react'
import { Pill, IconButton } from '../ui/Pill'

/** Barra superiore fissa della schermata Abbonamenti (§7.1). */
export function TopBar({ onAdd }: { onAdd: () => void }) {
  const navigate = useNavigate()

  return (
    <div className="sticky top-0 z-30 bg-gradient-to-b from-bg via-bg/95 to-transparent px-6 pb-4 pt-4">
      <div className="flex items-center justify-between">
        <Pill
          variant="accent"
          className="h-[52px] text-[17px]"
          onClick={() => navigate('/statistiche')}
        >
          <Sparkles className="h-5 w-5" aria-hidden />
          Statistiche
        </Pill>

        <IconButton label="Aggiungi abbonamento" size={60} onClick={onAdd}>
          <Plus className="h-7 w-7" aria-hidden />
        </IconButton>
      </div>
    </div>
  )
}
