import { createPortal } from 'react-dom'
import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Calendar, Circle, Settings } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface Tab {
  to: string
  label: string
  Icon: LucideIcon
}

const TABS: Tab[] = [
  { to: '/', label: 'Abbonamenti', Icon: Circle },
  { to: '/calendario', label: 'Calendario', Icon: Calendar },
  { to: '/impostazioni', label: 'Impostazioni', Icon: Settings },
]

/**
 * Tab bar flottante (§9.5): capsula centrata, non ancorata ai bordi,
 * 16px sopra la safe area dell'iPhone.
 *
 * Montata in portale su <body>: così nessun contenitore intermedio può
 * diventarne il containing block (basta un `transform` o un `filter` su un
 * antenato per sganciare un `position: fixed` dal viewport) e la barra resta
 * incollata al fondo dello schermo qualunque cosa faccia la pagina.
 */
export function TabBar() {
  const bar = (
    <nav
      className="pointer-events-none fixed inset-x-0 bottom-0 z-40"
      aria-label="Navigazione principale"
    >
      {/* I 16px voluti sopra il bordo, più l'home indicator dove esiste. */}
      <div
        className="mx-auto w-full max-w-app px-4"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 16px)' }}
      >
        <div className="pointer-events-auto mx-auto flex w-[78%] items-center justify-between rounded-full border border-hairline bg-[rgba(20,17,25,.85)] px-2 py-2 backdrop-blur-xl">
          {TABS.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className="relative flex flex-1 flex-col items-center gap-1 rounded-full px-2 py-2"
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.span
                      layoutId="tab-pill"
                      className="absolute inset-0 rounded-full bg-tab-active"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                  <Icon
                    className={`relative h-5 w-5 ${isActive ? 'text-text-primary' : 'text-text-muted'}`}
                    aria-hidden
                  />
                  <span
                    className={`relative text-[12px] font-semibold ${
                      isActive ? 'text-text-primary' : 'text-text-muted'
                    }`}
                  >
                    {label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  )

  return createPortal(bar, document.body)
}
