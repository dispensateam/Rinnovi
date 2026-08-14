/**
 * Pianeta generato interamente in CSS (§9.3): gradiente arancio → magenta
 * spostato in alto a sinistra, un secondo layer per le fasce nuvolose e un
 * glow viola diffuso. Nessun asset esterno.
 */
export function Planet({ size = 300 }: { size?: number }) {
  return (
    <div
      className="relative rounded-full"
      style={{
        width: size,
        height: size,
        background:
          'radial-gradient(circle at 32% 28%, #F5A03C 0%, #EE7A52 38%, #E8407A 78%, #B92C63 100%)',
        boxShadow: '0 0 80px rgba(108,75,246,.5)',
      }}
      aria-hidden
    >
      {/* Fasce nuvolose: secondo gradiente a bassa opacità */}
      <div
        className="absolute inset-0 rounded-full mix-blend-overlay"
        style={{
          opacity: 0.35,
          background:
            'radial-gradient(120% 60% at 20% 70%, rgba(255,255,255,.55) 0%, transparent 55%), radial-gradient(90% 40% at 75% 35%, rgba(255,255,255,.35) 0%, transparent 60%)',
        }}
      />
      {/* Terminatore: ombra sul lato opposto alla luce */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background:
            'radial-gradient(circle at 70% 78%, rgba(10,8,16,.55) 0%, transparent 60%)',
        }}
      />
    </div>
  )
}
