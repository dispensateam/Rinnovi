import { useEffect, useState } from 'react'

export interface IconSource {
  name: string
  icon_url?: string
  domain?: string
  brand_color?: string
}

/** Favicon di servizio: unica dipendenza esterna per i loghi (§9.4). */
export function faviconUrl(domain: string, size = 128): string {
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=${size}`
}

function resolveSrc(source: IconSource): string | null {
  if (source.icon_url) return source.icon_url
  if (source.domain) return faviconUrl(source.domain)
  return null
}

interface SubscriptionIconProps {
  source: IconSource
  /** Lato in pixel. Default 48, come nelle righe della lista (§7.1). */
  size?: number
  className?: string
}

/**
 * Ordine di fallback: icon_url → favicon del dominio → cerchio con l'iniziale.
 * Il fallback è istantaneo perché è già montato sotto l'immagine: quando
 * `onError` scatta l'immagine sparisce senza sfarfallio.
 */
export function SubscriptionIcon({ source, size = 48, className = '' }: SubscriptionIconProps) {
  const src = resolveSrc(source)
  const [failed, setFailed] = useState(false)

  // Se cambia la sorgente si riprova a caricare
  useEffect(() => setFailed(false), [src])

  const initial = source.name.trim().charAt(0).toUpperCase() || '?'
  const color = source.brand_color || '#6C4BF6'
  const showImage = Boolean(src) && !failed

  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-xl ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Livello di fondo: sempre presente, visibile appena l'immagine fallisce */}
      <div
        className="absolute inset-0 flex items-center justify-center rounded-xl font-extrabold text-text-primary"
        style={{ backgroundColor: color, fontSize: size * 0.42 }}
        aria-hidden={showImage}
      >
        {initial}
      </div>

      {showImage && src && (
        <img
          src={src}
          alt=""
          loading="lazy"
          onError={() => setFailed(true)}
          className="absolute inset-0 h-full w-full rounded-xl bg-card-hi object-contain"
        />
      )}
    </div>
  )
}
