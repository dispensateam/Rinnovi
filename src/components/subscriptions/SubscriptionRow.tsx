import { useNavigate } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import type { SubscriptionRow as Row } from '../../types/database'
import { daysUntilRenewal, isFreeTrial, nextRenewalDate } from '../../lib/renewals'
import { formatCurrency, formatDateShort, formatRelativeDays } from '../../lib/format'
import { SubscriptionIcon } from './SubscriptionIcon'

/** Soglia sotto la quale il sottotitolo diventa arancione (§7.1). */
const IMMINENT_DAYS = 3

export function SubscriptionListRow({ sub, dimmed = false }: { sub: Row; dimmed?: boolean }) {
  const navigate = useNavigate()
  const now = new Date()
  const renewal = nextRenewalDate(sub, now)
  const days = daysUntilRenewal(sub, now)
  const imminent = days <= IMMINENT_DAYS
  const trial = isFreeTrial(sub, now)

  return (
    <button
      type="button"
      onClick={() => navigate(`/abbonamento/${sub.id}`)}
      className={`flex h-[84px] w-full items-center gap-4 rounded-3xl bg-card px-4 text-left transition active:scale-[0.98] ${
        dimmed ? 'opacity-50' : ''
      }`}
    >
      <SubscriptionIcon source={sub} size={48} />

      <span className="min-w-0 flex-1">
        <span className="block truncate text-[22px] font-bold leading-tight text-text-primary">
          {sub.name}
        </span>
        <span
          className={`mt-0.5 block truncate text-[16px] ${
            imminent ? 'text-warning' : 'text-text-muted'
          }`}
        >
          {trial ? 'Prova gratuita · ' : ''}
          {formatRelativeDays(renewal, now)} · {formatDateShort(renewal)}
        </span>
      </span>

      <span className="flex shrink-0 items-center gap-1">
        <span className="tabular font-bold text-text-primary/80">
          {formatCurrency(sub.amount, sub.currency_code)}
        </span>
        <ChevronRight className="h-5 w-5 text-text-muted" aria-hidden />
      </span>
    </button>
  )
}
