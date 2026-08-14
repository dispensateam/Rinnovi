import { useMemo, useRef, useState } from 'react'
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  isSameMonth,
  isToday,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns'
import { it } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { PageShell } from '../components/layout/PageShell'
import { IconButton } from '../components/ui/Pill'
import { DaySheet } from '../components/calendar/DaySheet'
import { CalendarCell } from '../components/calendar/CalendarCell'
import { useSubscriptions } from '../hooks/useSubscriptions'
import { renewalsInMonth } from '../lib/renewals'
import type { RenewalOccurrence } from '../lib/renewals'
import { formatCurrency, formatMonthName } from '../lib/format'
import type { SubscriptionRow } from '../types/database'

const WEEKDAYS = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom']
/** Spostamento orizzontale minimo perché uno swipe cambi mese. */
const SWIPE_THRESHOLD = 60

export default function Calendar() {
  const subscriptions = useSubscriptions()
  const [month, setMonth] = useState(() => startOfMonth(new Date()))
  const [selected, setSelected] = useState<Date | null>(null)
  const touchStartX = useRef<number | null>(null)

  const subs = useMemo(() => subscriptions.data ?? [], [subscriptions.data])
  const occurrences = useMemo(() => renewalsInMonth(subs, month), [subs, month])

  /** Occorrenze indicizzate per giorno, per non riscorrere l'array a ogni cella. */
  const byDay = useMemo(() => {
    const map = new Map<string, RenewalOccurrence<SubscriptionRow>[]>()
    for (const occurrence of occurrences) {
      const key = occurrence.date.toDateString()
      const list = map.get(key)
      if (list) list.push(occurrence)
      else map.set(key, [occurrence])
    }
    return map
  }, [occurrences])

  const days = useMemo(
    () =>
      eachDayOfInterval({
        start: startOfWeek(startOfMonth(month), { weekStartsOn: 1, locale: it }),
        end: endOfWeek(endOfMonth(month), { weekStartsOn: 1, locale: it }),
      }),
    [month]
  )

  const total = occurrences.reduce((t, o) => t + o.amount, 0)
  const today = startOfDay(new Date())
  const upcoming = occurrences
    .filter((o) => o.date >= today)
    .reduce((t, o) => t + o.amount, 0)

  const selectedOccurrences = selected ? (byDay.get(selected.toDateString()) ?? []) : []

  return (
    <PageShell>
      <div
        className="px-5 pt-6"
        onTouchStart={(e) => {
          touchStartX.current = e.touches[0]?.clientX ?? null
        }}
        onTouchEnd={(e) => {
          const start = touchStartX.current
          const end = e.changedTouches[0]?.clientX
          touchStartX.current = null
          if (start === null || end === undefined) return
          const delta = end - start
          if (delta > SWIPE_THRESHOLD) setMonth((m) => subMonths(m, 1))
          else if (delta < -SWIPE_THRESHOLD) setMonth((m) => addMonths(m, 1))
        }}
      >
        <div className="flex items-center justify-between">
          <h1 className="hero-number text-[48px] leading-none">{formatMonthName(month)}</h1>
          <div className="flex gap-2">
            <IconButton label="Mese precedente" size={40} onClick={() => setMonth((m) => subMonths(m, 1))}>
              <ChevronLeft className="h-5 w-5" aria-hidden />
            </IconButton>
            <IconButton label="Mese successivo" size={40} onClick={() => setMonth((m) => addMonths(m, 1))}>
              <ChevronRight className="h-5 w-5" aria-hidden />
            </IconButton>
          </div>
        </div>

        <div className="mt-4 flex gap-6">
          <p className="text-[15px]">
            <span className="tabular font-bold text-text-primary">{formatCurrency(total)}</span>{' '}
            <span className="text-text-muted">Totale</span>
          </p>
          <p className="text-[15px]">
            <span className="tabular font-bold text-text-primary">{formatCurrency(upcoming)}</span>{' '}
            <span className="text-text-muted">Prossimi</span>
          </p>
        </div>

        <div className="mt-6 grid grid-cols-7 gap-1.5 text-center">
          {WEEKDAYS.map((day) => (
            <div key={day} className="pb-1 text-[12px] font-semibold text-text-muted">
              {day}
            </div>
          ))}

          {days.map((day) => {
            const inMonth = isSameMonth(day, month)
            const dayOccurrences = inMonth ? (byDay.get(day.toDateString()) ?? []) : []
            return (
              <CalendarCell
                key={day.toISOString()}
                day={day}
                inMonth={inMonth}
                today={isToday(day)}
                occurrences={dayOccurrences}
                onSelect={() => setSelected(day)}
              />
            )
          })}
        </div>
      </div>

      <DaySheet
        day={selected}
        occurrences={selectedOccurrences}
        open={selected !== null && selectedOccurrences.length > 0}
        onClose={() => setSelected(null)}
      />
    </PageShell>
  )
}
