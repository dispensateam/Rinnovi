import { getDate } from 'date-fns'
import type { RenewalOccurrence } from '../../lib/renewals'
import type { SubscriptionRow } from '../../types/database'
import { SubscriptionIcon } from '../subscriptions/SubscriptionIcon'

interface CalendarCellProps {
  day: Date
  inMonth: boolean
  today: boolean
  occurrences: RenewalOccurrence<SubscriptionRow>[]
  onSelect: () => void
}

/** Cella della griglia mensile (§7.7). Fuori mese: vuota e senza sfondo. */
export function CalendarCell({ day, inMonth, today, occurrences, onSelect }: CalendarCellProps) {
  if (!inMonth) return <div className="h-[110px]" aria-hidden />

  const hasRenewals = occurrences.length > 0
  const first = occurrences[0]

  return (
    <button
      type="button"
      disabled={!hasRenewals}
      onClick={onSelect}
      aria-label={`${getDate(day)}${hasRenewals ? `, ${occurrences.length} rinnovi` : ''}`}
      className={`flex h-[110px] flex-col items-center rounded-2xl px-1 pt-2 transition ${
        today ? 'bg-today-cell' : 'bg-bg-raised'
      } ${hasRenewals ? 'active:scale-[0.96]' : ''}`}
    >
      <span
        className={`tabular text-[13px] font-bold ${
          today ? 'text-accent-glow' : 'text-text-primary'
        }`}
      >
        {getDate(day)}
      </span>

      {first && (
        <span className="mt-1.5 flex flex-col items-center gap-1">
          <SubscriptionIcon source={first.subscription} size={26} />
          {occurrences.length > 1 && (
            <span className="tabular text-[11px] text-text-muted">+{occurrences.length - 1}</span>
          )}
        </span>
      )}
    </button>
  )
}
