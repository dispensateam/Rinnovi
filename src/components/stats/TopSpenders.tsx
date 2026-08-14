import type { TopEntry } from '../../lib/stats'
import { formatCurrency } from '../../lib/format'

/** Barre orizzontali col colore di ciascun abbonamento (§7.4). */
export function TopSpenders({ entries }: { entries: TopEntry[] }) {
  const max = Math.max(...entries.map((e) => e.value), 0)
  if (max === 0) return null

  return (
    <ul className="space-y-3">
      {entries.map((entry) => (
        <li key={entry.id}>
          <div className="flex items-baseline justify-between gap-3">
            <span className="truncate text-[15px] text-text-primary">{entry.name}</span>
            <span className="tabular shrink-0 text-[15px] font-bold text-text-primary">
              {formatCurrency(entry.value)}
            </span>
          </div>
          <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-card-hi">
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.max(4, (entry.value / max) * 100)}%`,
                backgroundColor: entry.color,
              }}
            />
          </div>
        </li>
      ))}
    </ul>
  )
}
