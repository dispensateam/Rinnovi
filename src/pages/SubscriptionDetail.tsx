import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Archive,
  ArrowLeft,
  Copy,
  ExternalLink,
  MoreHorizontal,
  SquarePen,
  Trash2,
} from 'lucide-react'
import { PageShell } from '../components/layout/PageShell'
import { Starfield } from '../components/space/Starfield'
import { SubscriptionIcon } from '../components/subscriptions/SubscriptionIcon'
import { EditSubscriptionSheet } from '../components/subscriptions/EditSubscriptionSheet'
import { StatTile, InfoRows, PriceHistory } from '../components/subscriptions/DetailSections'
import { Card } from '../components/ui/Card'
import { IconButton, Pill } from '../components/ui/Pill'
import { Menu } from '../components/ui/Menu'
import { Skeleton } from '../components/ui/Skeleton'
import { BILLING_CYCLE_LABELS } from '../types/database'
import {
  daysUntilRenewal,
  monthlyEquivalent,
  nextRenewalDate,
  renewalsSoFar,
  totalSpentSoFar,
  yearlyEquivalent,
} from '../lib/renewals'
import { formatCurrency, formatDateLong, formatRelativeDays } from '../lib/format'
import {
  useCreateSubscription,
  useDeleteSubscription,
  usePriceChanges,
  useSubscriptions,
  useUpdateSubscription,
} from '../hooks/useSubscriptions'

export default function SubscriptionDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const subscriptions = useSubscriptions()
  const priceChanges = usePriceChanges()
  const update = useUpdateSubscription()
  const remove = useDeleteSubscription()
  const duplicate = useCreateSubscription()

  const [menuOpen, setMenuOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const sub = subscriptions.data?.find((s) => s.id === id) ?? null
  const changes = useMemo(
    () => (priceChanges.data ?? []).filter((c) => c.subscription_id === id),
    [priceChanges.data, id]
  )

  if (subscriptions.isLoading) {
    return (
      <PageShell hideTabBar>
        <div className="px-6 pt-16">
          <Skeleton className="h-20 w-20 rounded-2xl" />
          <Skeleton className="mt-4 h-8 w-48" />
          <Skeleton className="mt-6 h-28 w-full" />
        </div>
      </PageShell>
    )
  }

  if (!sub) {
    return (
      <PageShell hideTabBar>
        <div className="px-6 pt-16">
          <p className="text-text-muted">Abbonamento non trovato.</p>
          <Pill variant="muted" className="mt-4 h-11" onClick={() => navigate('/')}>
            Torna agli abbonamenti
          </Pill>
        </div>
      </PageShell>
    )
  }

  const now = new Date()
  const renewal = nextRenewalDate(sub, now)
  const days = daysUntilRenewal(sub, now)

  async function handleDuplicate() {
    if (!sub) return
    const { id: _id, user_id: _userId, created_at: _c, updated_at: _u, ...rest } = sub
    await duplicate.mutateAsync({ ...rest, name: `${sub.name} (copia)` })
    navigate('/')
  }

  return (
    <PageShell hideTabBar>
      <div className="relative min-h-screen">
        {/* Sfondo stellato attenuato (§7.3) */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[380px] opacity-50">
          <Starfield count={90} seed={99} />
        </div>

        <div className="relative px-6 pb-16 pt-4">
          <div className="flex items-center justify-between">
            <IconButton label="Indietro" size={44} onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" aria-hidden />
            </IconButton>

            <div className="relative">
              <IconButton label="Altre azioni" size={44} onClick={() => setMenuOpen((v) => !v)}>
                <MoreHorizontal className="h-5 w-5" aria-hidden />
              </IconButton>
              <Menu
                open={menuOpen}
                onClose={() => setMenuOpen(false)}
                label="Azioni abbonamento"
                className="right-0 top-full mt-2"
                items={[
                  {
                    id: 'edit',
                    label: 'Modifica',
                    icon: <SquarePen className="h-4 w-4" aria-hidden />,
                    onSelect: () => setEditOpen(true),
                  },
                  {
                    id: 'archive',
                    label: sub.is_active ? 'Archivia' : 'Riattiva',
                    icon: <Archive className="h-4 w-4" aria-hidden />,
                    onSelect: () =>
                      void update.mutateAsync({ id: sub.id, patch: { is_active: !sub.is_active } }),
                  },
                  {
                    id: 'duplicate',
                    label: 'Duplica',
                    icon: <Copy className="h-4 w-4" aria-hidden />,
                    onSelect: () => void handleDuplicate(),
                  },
                  {
                    id: 'delete',
                    label: 'Elimina',
                    icon: <Trash2 className="h-4 w-4" aria-hidden />,
                    danger: true,
                    separated: true,
                    onSelect: () => setConfirmDelete(true),
                  },
                ]}
              />
            </div>
          </div>

          <header className="mt-6 flex flex-col items-center text-center">
            <SubscriptionIcon source={sub} size={80} />
            <h1 className="hero-number mt-4 text-[32px] leading-tight">{sub.name}</h1>
            <p className="mt-1 text-[17px] text-text-muted">
              <span className="tabular">{formatCurrency(sub.amount, sub.currency_code)}</span> ·{' '}
              {BILLING_CYCLE_LABELS[sub.billing_cycle]}
              {!sub.is_active && ' · Archiviato'}
            </p>
          </header>

          <Card className="mt-8 px-5 py-5 text-center">
            <p className="text-[13px] font-bold uppercase tracking-wide text-text-muted">
              Prossimo rinnovo
            </p>
            <p className="mt-2 text-[20px] font-extrabold">{formatDateLong(renewal)}</p>
            <p className={`mt-1 text-[15px] ${days <= 3 ? 'text-warning' : 'text-text-muted'}`}>
              {formatRelativeDays(renewal, now)}
            </p>
          </Card>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <StatTile label="Al mese" value={formatCurrency(monthlyEquivalent(sub, now), sub.currency_code)} />
            <StatTile label="All'anno" value={formatCurrency(yearlyEquivalent(sub, now), sub.currency_code)} />
            <StatTile
              label="Speso finora"
              value={formatCurrency(totalSpentSoFar(sub, changes, now), sub.currency_code)}
            />
            <StatTile label="Rinnovi effettuati" value={String(renewalsSoFar(sub, now))} />
          </div>

          <InfoRows sub={sub} />

          {changes.length > 0 && <PriceHistory changes={changes} currency={sub.currency_code} />}

          {sub.cancellation_url && (
            <a
              href={sub.cancellation_url}
              target="_blank"
              rel="noreferrer noopener"
              className="mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-card-hi text-[17px] font-bold text-danger transition active:scale-[0.98]"
            >
              <ExternalLink className="h-5 w-5" aria-hidden />
              Disdici
            </a>
          )}

          {confirmDelete && (
            <Card className="mt-6 px-5 py-5" raised>
              <p className="font-bold">Eliminare «{sub.name}»?</p>
              <p className="mt-1 text-sm text-text-muted">
                Sparisce anche lo storico prezzi. L'operazione non è reversibile.
              </p>
              <div className="mt-4 flex gap-3">
                <Pill variant="muted" className="h-11 flex-1 justify-center" onClick={() => setConfirmDelete(false)}>
                  Annulla
                </Pill>
                <button
                  type="button"
                  onClick={async () => {
                    await remove.mutateAsync(sub.id)
                    navigate('/')
                  }}
                  className="h-11 flex-1 rounded-full bg-danger font-bold text-text-primary"
                >
                  Elimina
                </button>
              </div>
            </Card>
          )}
        </div>
      </div>

      {editOpen && (
        <EditSubscriptionSheet sub={sub} open={editOpen} onClose={() => setEditOpen(false)} />
      )}
    </PageShell>
  )
}
