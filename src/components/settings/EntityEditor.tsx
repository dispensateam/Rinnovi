import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react'
import { PageShell } from '../layout/PageShell'
import { Card } from '../ui/Card'
import { IconButton, Pill } from '../ui/Pill'
import { SUBSCRIPTION_COLORS } from '../../lib/palette'

export interface EditableEntity {
  id: string
  name: string
  color?: string
}

interface EntityEditorProps {
  title: string
  items: EditableEntity[]
  /** Mostra la palette per cambiare colore. */
  withColor?: boolean
  /** Abilita le frecce di riordino. */
  withReorder?: boolean
  onCreate: (name: string) => void
  onRename: (id: string, name: string) => void
  onRecolor?: (id: string, color: string) => void
  onReorder?: (id: string, direction: -1 | 1) => void
  onDelete: (id: string) => void
  /** Impedisce l'eliminazione (es. l'ultima lista rimasta). */
  canDelete?: (id: string) => boolean
  deleteHint?: string
  emptyLabel: string
}

/**
 * Schermata di gestione di liste, categorie e metodi di pagamento (§7.8):
 * aggiunta, rinomina, colore, riordino ed eliminazione.
 */
export function EntityEditor({
  title,
  items,
  withColor = false,
  withReorder = false,
  onCreate,
  onRename,
  onRecolor,
  onReorder,
  onDelete,
  canDelete,
  deleteHint,
  emptyLabel,
}: EntityEditorProps) {
  const navigate = useNavigate()
  const [newName, setNewName] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [confirming, setConfirming] = useState<string | null>(null)

  return (
    <PageShell>
      <div className="px-5 pt-safe-tight">
        <IconButton label="Indietro" size={44} onClick={() => navigate('/impostazioni')}>
          <ArrowLeft className="h-5 w-5" aria-hidden />
        </IconButton>

        <h1 className="hero-number mt-4 text-[40px] leading-none">{title}</h1>

        {deleteHint && <p className="mt-3 text-sm text-text-muted">{deleteHint}</p>}

        <div className="mt-6 flex flex-col gap-3">
          {items.length === 0 && (
            <p className="rounded-3xl bg-card px-4 py-6 text-center text-text-muted">{emptyLabel}</p>
          )}

          {items.map((item, index) => {
            const deletable = canDelete ? canDelete(item.id) : true
            const open = expanded === item.id

            return (
              <Card key={item.id} className="px-4 py-3">
                <div className="flex items-center gap-3">
                  {withColor && (
                    <span
                      className="h-6 w-6 shrink-0 rounded-full"
                      style={{ backgroundColor: item.color ?? '#64748B' }}
                      aria-hidden
                    />
                  )}

                  {/* Non controllato: la rinomina parte all'uscita dal campo,
                      così non si scatena una mutazione a ogni tasto premuto. */}
                  <input
                    key={item.id}
                    defaultValue={item.name}
                    onBlur={(e) => {
                      const next = e.target.value.trim()
                      if (next && next !== item.name) onRename(item.id, next)
                      else e.target.value = item.name
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') e.currentTarget.blur()
                    }}
                    aria-label={`Nome di ${item.name}`}
                    className="min-w-0 flex-1 bg-transparent text-[17px] text-text-primary focus:outline-none"
                  />

                  {withReorder && onReorder && (
                    <span className="flex shrink-0 gap-1">
                      <button
                        type="button"
                        aria-label="Sposta su"
                        disabled={index === 0}
                        onClick={() => onReorder(item.id, -1)}
                        className="rounded-lg p-1 text-text-muted disabled:opacity-30"
                      >
                        <ChevronUp className="h-4 w-4" aria-hidden />
                      </button>
                      <button
                        type="button"
                        aria-label="Sposta giù"
                        disabled={index === items.length - 1}
                        onClick={() => onReorder(item.id, 1)}
                        className="rounded-lg p-1 text-text-muted disabled:opacity-30"
                      >
                        <ChevronDown className="h-4 w-4" aria-hidden />
                      </button>
                    </span>
                  )}

                  {withColor && (
                    <button
                      type="button"
                      onClick={() => setExpanded(open ? null : item.id)}
                      aria-expanded={open}
                      className="shrink-0 text-[13px] text-text-muted underline underline-offset-4"
                    >
                      Colore
                    </button>
                  )}

                  <button
                    type="button"
                    aria-label={`Elimina ${item.name}`}
                    disabled={!deletable}
                    onClick={() => setConfirming(item.id)}
                    className="shrink-0 rounded-lg p-1 text-danger disabled:opacity-30"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden />
                  </button>
                </div>

                {open && onRecolor && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {SUBSCRIPTION_COLORS.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        aria-label={color.name}
                        onClick={() => {
                          onRecolor(item.id, color.value)
                          setExpanded(null)
                        }}
                        className="h-7 w-7 rounded-full transition active:scale-90"
                        style={{ backgroundColor: color.value }}
                      />
                    ))}
                  </div>
                )}

                {confirming === item.id && (
                  <div className="mt-3 flex items-center gap-2">
                    <span className="flex-1 text-sm text-text-muted">Eliminare «{item.name}»?</span>
                    <Pill variant="muted" className="h-9 text-[14px]" onClick={() => setConfirming(null)}>
                      Annulla
                    </Pill>
                    <button
                      type="button"
                      onClick={() => {
                        onDelete(item.id)
                        setConfirming(null)
                      }}
                      className="h-9 rounded-full bg-danger px-4 text-[14px] font-bold text-text-primary"
                    >
                      Elimina
                    </button>
                  </div>
                )}
              </Card>
            )
          })}
        </div>

        <form
          className="mt-6 flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            const trimmed = newName.trim()
            if (!trimmed) return
            onCreate(trimmed)
            setNewName('')
          }}
        >
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Aggiungi…"
            aria-label={`Aggiungi a ${title}`}
            className="flex-1 rounded-full bg-card px-5 py-3 text-[17px] text-text-primary placeholder:text-text-muted focus:outline-none"
          />
          <IconButton label="Aggiungi" size={48} type="submit">
            <Plus className="h-5 w-5" aria-hidden />
          </IconButton>
        </form>
      </div>
    </PageShell>
  )
}
