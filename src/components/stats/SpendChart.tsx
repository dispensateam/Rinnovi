import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { TooltipContentProps } from 'recharts'
import type { MonthlyPoint } from '../../lib/stats'
import { formatCurrency, formatCurrencyCompact } from '../../lib/format'

const AXIS_COLOR = '#8E8A99'

// I props arrivano da Recharts a runtime: come elemento JSX vanno dichiarati opzionali
function SpendTooltip({ active, payload }: Partial<TooltipContentProps<number, string>>) {
  if (!active || !payload || payload.length === 0) return null
  const point = payload[0].payload as MonthlyPoint

  return (
    <div className="max-w-[220px] rounded-2xl border border-hairline bg-[rgba(20,17,25,.96)] p-3 shadow-panel backdrop-blur-xl">
      <p className="text-[13px] font-bold text-text-primary">{point.label}</p>
      <p className="tabular text-[15px] font-extrabold text-accent-glow">
        {formatCurrency(point.total)}
      </p>
      {point.items.length > 0 && (
        <ul className="mt-2 space-y-0.5">
          {point.items.slice(0, 6).map((item, i) => (
            <li key={i} className="flex justify-between gap-3 text-[12px] text-text-muted">
              <span className="truncate">{item.name}</span>
              <span className="tabular shrink-0">{formatCurrency(item.amount)}</span>
            </li>
          ))}
          {point.items.length > 6 && (
            <li className="text-[12px] text-text-muted">+{point.items.length - 6} altri</li>
          )}
        </ul>
      )}
    </div>
  )
}

/** Spesa reale dei prossimi 12 mesi, non normalizzata (§7.4). */
export function SpendChart({ data }: { data: MonthlyPoint[] }) {
  const max = Math.max(...data.map((d) => d.total), 0)

  return (
    <div className="h-[220px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: -18 }}>
          <XAxis
            dataKey="label"
            tick={{ fill: AXIS_COLOR, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            interval={0}
            angle={-45}
            textAnchor="end"
            height={48}
          />
          <YAxis
            tick={{ fill: AXIS_COLOR, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={56}
            tickFormatter={(value: number) => formatCurrencyCompact(value)}
          />
          <Tooltip content={<SpendTooltip />} cursor={{ fill: 'rgba(255,255,255,.05)' }} />
          <Bar dataKey="total" radius={[6, 6, 0, 0]} maxBarSize={26}>
            {data.map((point, i) => (
              // Il mese più caro viene evidenziato: è il picco da notare
              <Cell key={i} fill={point.total === max && max > 0 ? '#8B6BFF' : '#6C4BF6'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
