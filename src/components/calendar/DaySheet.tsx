import { useNavigate } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import type { RenewalOccurrence } from '../../lib/renewals'
import type { SubscriptionRow } from '../../types/database'
import { Sheet } from '../ui/Sheet'
import { Pill } from '../ui/Pill'
import { SubscriptionIcon } from '../subscriptions/SubscriptionIcon'
import { formatCurrency, formatDateLong } from '../../lib/format'

interface DaySheetProps {
  day: Date | null
  occurrences: RenewalOccurrence<SubscriptionRow>[]
  open: boolean
  onClose: () => void
}

/** Pannello dei rinnovi di un giorno, con il totale (§7.7). */
export function DaySheet({ day, occurrences, open, onClose }: DaySheetProps) {
  const navigate = useNavigate()
  const total = occurrences.reduce((t, o) => t + o.amount, 0)

  return (
    <Sheet open={open} onClose={onClose} label="Rinnovi del giorno">
      <header className="flex items-center justify-between gap-3 border-b border-hairline px-4 py-3">
        <Pill variant="muted" className="h-10 text-[15px]" onClick={onClose}>
          Chiudi
        </Pill>
        <h2 className="truncate text-[15px] font-extrabold">
          {day ? formatDateLong(day) : ''}
        </h2>
        <span className="w-[76px]" aria-hidden />
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        <p className="mb-4 text-[15px] text-text-muted">
          Totale del giorno{' '}
          <span className="tabular font-extrabold text-text-primary">{formatCurrency(total)}</span>
        </p>

        <div className="flex flex-col gap-3">
          {occurrences.map((occurrence, i) => (
            <button
              key={`${occurrence.subscription.id}-${i}`}
              type="button"
              onClick={() => {
                onClose()
                navigate(`/abbonamento/${occurrence.subscription.id}`)
              }}
              className="flex items-center gap-3 rounded-3xl bg-card px-4 py-3 text-left transition active:scale-[0.98]"
            >
              <SubscriptionIcon source={occurrence.subscription} size={40} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[17px] font-bold">
                  {occurrence.subscription.name}
                </span>
                {occurrence.amount === 0 && (
                  <span className="block text-[13px] text-text-muted">Prova gratuita</span>
                )}
              </span>
              <span className="tabular font-bold">
                {formatCurrency(occurrence.amount, occurrence.subscription.currency_code)}
              </span>
              <ChevronRight className="h-5 w-5 text-text-muted" aria-hidden />
            </button>
          ))}
        </div>
      </div>
    </Sheet>
  )
}
