import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'
import type { CategorySlice } from '../../lib/stats'
import { formatCurrency } from '../../lib/format'

/** Ciambella della ripartizione per categoria, con legenda e percentuali (§7.4). */
export function CategoryChart({ slices }: { slices: CategorySlice[] }) {
  const total = slices.reduce((t, s) => t + s.value, 0)
  if (total === 0) return null

  const percent = (value: number) =>
    new Intl.NumberFormat('it-IT', { maximumFractionDigits: 1 }).format((value / total) * 100)

  return (
    <div>
      <div className="h-[190px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={slices}
              dataKey="value"
              nameKey="name"
              innerRadius="58%"
              outerRadius="88%"
              paddingAngle={2}
              stroke="none"
              isAnimationActive={false}
            >
              {slices.map((slice) => (
                <Cell key={slice.id} fill={slice.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      <ul className="mt-3 space-y-2">
        {slices.map((slice) => (
          <li key={slice.id} className="flex items-center gap-2 text-[14px]">
            <span
              className="h-3 w-3 shrink-0 rounded-full"
              style={{ backgroundColor: slice.color }}
              aria-hidden
            />
            <span className="flex-1 truncate text-text-primary">{slice.name}</span>
            <span className="tabular text-text-muted">{percent(slice.value)}%</span>
            <span className="tabular w-20 text-right font-semibold text-text-primary">
              {formatCurrency(slice.value)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
