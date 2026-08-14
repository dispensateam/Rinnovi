/** Rettangoli pulsanti al posto dello spinner a schermo intero (§7.1). */
export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-2xl bg-card ${className}`} />
}

/** Placeholder delle righe abbonamento durante il caricamento. */
export function SubscriptionRowsSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-3" aria-hidden>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex h-[84px] items-center gap-4 rounded-3xl bg-card px-4">
          <Skeleton className="h-12 w-12 rounded-xl bg-card-hi" />
          <div className="flex-1">
            <Skeleton className="h-5 w-32 bg-card-hi" />
            <Skeleton className="mt-2 h-4 w-44 bg-card-hi" />
          </div>
          <Skeleton className="h-5 w-14 bg-card-hi" />
        </div>
      ))}
    </div>
  )
}
