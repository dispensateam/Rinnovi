import type { ReactNode } from 'react'
import { TabBar } from './TabBar'

interface PageShellProps {
  children: ReactNode
  /** Nasconde la tab bar nei pannelli a schermo pieno. */
  hideTabBar?: boolean
}

/**
 * Contenitore globale (§7): colonna da 440px centrata su fondo nero, così su
 * desktop l'app mantiene l'aspetto di una colonna mobile.
 */
export function PageShell({ children, hideTabBar = false }: PageShellProps) {
  return (
    <div className="relative min-h-viewport bg-bg">
      <div className="relative mx-auto w-full max-w-app">
        {/* Spazio in fondo per non finire sotto la tab bar flottante */}
        <div className={hideTabBar ? 'pb-safe-b' : 'pb-tabbar'}>{children}</div>
      </div>
      {!hideTabBar && <TabBar />}
    </div>
  )
}
