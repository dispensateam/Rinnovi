import { memo, useMemo } from 'react'

/**
 * Campo stellato generato via CSS (§9.3): nessun asset esterno.
 * Le posizioni vengono da un PRNG con seed fisso, così le stelle non
 * saltano a ogni render.
 */

interface Star {
  x: number
  y: number
  size: number
  opacity: number
  color: string
  twinkleDuration: number | null
  delay: number
}

/** PRNG deterministico (mulberry32): stesso seed, stesse stelle. */
function mulberry32(seed: number): () => number {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function generateStars(count: number, seed: number): Star[] {
  const rand = mulberry32(seed)
  const stars: Star[] = []
  for (let i = 0; i < count; i += 1) {
    const twinkles = rand() < 0.25
    stars.push({
      x: rand() * 100,
      y: rand() * 100,
      size: 1 + rand() * 2,
      opacity: 0.15 + rand() * 0.55,
      // Un quinto delle stelle è lilla, il resto bianco
      color: rand() < 0.2 ? '#B9A6FF' : '#FFFFFF',
      twinkleDuration: twinkles ? 3 + rand() * 5 : null,
      delay: rand() * 5,
    })
  }
  return stars
}

interface StarfieldProps {
  /** Numero di stelle. Default 150 (§9.3). */
  count?: number
  seed?: number
  /** Opacità complessiva: il dettaglio usa un campo attenuato. */
  className?: string
}

function StarfieldBase({ count = 150, seed = 20260814, className = '' }: StarfieldProps) {
  const stars = useMemo(() => generateStars(count, seed), [count, seed])

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden>
      {stars.map((star, i) => (
        <span
          key={i}
          className={star.twinkleDuration ? 'absolute rounded-full animate-twinkle' : 'absolute rounded-full'}
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            backgroundColor: star.color,
            opacity: star.opacity,
            animationDuration: star.twinkleDuration ? `${star.twinkleDuration}s` : undefined,
            animationDelay: star.twinkleDuration ? `${star.delay}s` : undefined,
          }}
        />
      ))}
    </div>
  )
}

/** Memoizzato: il campo si genera una volta sola. */
export const Starfield = memo(StarfieldBase)
