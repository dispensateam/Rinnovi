import { useMemo } from 'react'
import { useReducedMotion } from 'framer-motion'
import type { SubscriptionRow } from '../../types/database'
import { nextRenewalDate } from '../../lib/renewals'
import { usePageVisible } from '../../hooks/usePageVisible'
import { SubscriptionIcon } from '../subscriptions/SubscriptionIcon'
import { Starfield } from './Starfield'
import { Planet } from './Planet'

/** Al massimo 8 icone in orbita, le più vicine al rinnovo (§7.1). */
const MAX_ORBITING = 8
const INNER_RADIUS = 132
const OUTER_RADIUS = 186
/** Schiacciamento verticale degli anelli disegnati: dà la prospettiva. */
const RING_FLATTEN = 0.42

interface OrbitRingProps {
  subs: SubscriptionRow[]
  radius: number
  /** Durata del giro completo in secondi. */
  duration: number
  reverse: boolean
  paused: boolean
  offset: number
}

/**
 * Le icone stanno su una circonferenza vera dentro un livello schiacciato da
 * uno `scaleY` statico: così percorrono esattamente l'ellisse disegnata.
 * La catena di trasformazioni è S(f)·R(θ)·T(p)·R(-θ)·S(1/f): posizione
 * ellittica, ma orientamento e proporzioni dell'icona tornano all'identità,
 * quindi resta dritta e non deformata.
 */
function OrbitRing({ subs, radius, duration, reverse, paused, offset }: OrbitRingProps) {
  if (subs.length === 0) return null

  const step = 360 / subs.length
  const playState = paused ? 'paused' : 'running'

  return (
    <div
      className="absolute left-1/2 top-1/2 h-0 w-0"
      style={{ transform: `scaleY(${RING_FLATTEN})` }}
    >
      <div
        className={`h-0 w-0 ${reverse ? 'animate-orbit-reverse' : 'animate-orbit'}`}
        style={{ animationDuration: `${duration}s`, animationPlayState: playState }}
      >
        {subs.map((sub, i) => {
          const angle = ((offset + i * step) * Math.PI) / 180
          return (
            <div
              key={sub.id}
              className="absolute"
              style={{ left: Math.cos(angle) * radius, top: Math.sin(angle) * radius }}
            >
              <div
                className={reverse ? 'animate-orbit' : 'animate-orbit-reverse'}
                style={{ animationDuration: `${duration}s`, animationPlayState: playState }}
              >
                <div style={{ transform: `scaleY(${1 / RING_FLATTEN})` }}>
                  <SubscriptionIcon
                    source={sub}
                    size={36}
                    className="-translate-x-1/2 -translate-y-1/2 shadow-lg ring-1 ring-hairline"
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/**
 * Hero orbitale (§7.1): campo stellato, pianeta centrale e due anelli
 * concentrici percorsi dalle icone degli abbonamenti attivi.
 */
export function OrbitSystem({ subscriptions }: { subscriptions: SubscriptionRow[] }) {
  const reduced = useReducedMotion()
  const visible = usePageVisible()
  const paused = Boolean(reduced) || !visible

  const orbiting = useMemo(() => {
    const now = new Date()
    return subscriptions
      .filter((s) => s.is_active)
      .sort((a, b) => nextRenewalDate(a, now).getTime() - nextRenewalDate(b, now).getTime())
      .slice(0, MAX_ORBITING)
  }, [subscriptions])

  const inner = orbiting.slice(0, 4)
  const outer = orbiting.slice(4)

  return (
    <div className="relative h-[360px] w-full overflow-hidden" aria-hidden>
      <Starfield count={120} />

      {/* Alone viola radiale dietro al pianeta */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(108,75,246,.30) 0%, transparent 70%)' }}
      />

      {/* Anelli ellittici (§9.3) */}
      <svg
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        width={OUTER_RADIUS * 2 + 40}
        height={OUTER_RADIUS * 2 * RING_FLATTEN + 40}
        viewBox={`0 0 ${OUTER_RADIUS * 2 + 40} ${OUTER_RADIUS * 2 * RING_FLATTEN + 40}`}
      >
        <defs>
          <linearGradient id="ring-stroke" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#6C4BF6" stopOpacity="0.1" />
            <stop offset="50%" stopColor="#8B6BFF" stopOpacity="1" />
            <stop offset="100%" stopColor="#6C4BF6" stopOpacity="0.1" />
          </linearGradient>
        </defs>
        {[INNER_RADIUS, OUTER_RADIUS].map((r) => (
          <ellipse
            key={r}
            cx={OUTER_RADIUS + 20}
            cy={OUTER_RADIUS * RING_FLATTEN + 20}
            rx={r}
            ry={r * RING_FLATTEN}
            fill="none"
            stroke="url(#ring-stroke)"
            strokeWidth={1}
            opacity={0.35}
          />
        ))}
      </svg>

      {/* Pianeta centrale */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <Planet size={300} />
      </div>

      {/* Icone in orbita: giro in 60s all'interno, 90s all'esterno, verso opposto */}
      <OrbitRing subs={inner} radius={INNER_RADIUS} duration={60} reverse={false} paused={paused} offset={0} />
      <OrbitRing subs={outer} radius={OUTER_RADIUS} duration={90} reverse paused={paused} offset={30} />
    </div>
  )
}
