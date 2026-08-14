import type {
  CategoryRow,
  ListRow,
  PaymentMethodRow,
  PriceChangeRow,
  SubscriptionRow,
} from '../types/database'

/** Formato del backup JSON esportato dalle Impostazioni (§7.8). */
export interface Backup {
  version: 1
  exportedAt: string
  lists: ListRow[]
  categories: CategoryRow[]
  payment_methods: PaymentMethodRow[]
  subscriptions: SubscriptionRow[]
  price_changes: PriceChangeRow[]
}

export interface BackupData {
  lists: ListRow[]
  categories: CategoryRow[]
  payment_methods: PaymentMethodRow[]
  subscriptions: SubscriptionRow[]
  price_changes: PriceChangeRow[]
}

export function buildBackup(data: BackupData): Backup {
  return { version: 1, exportedAt: new Date().toISOString(), ...data }
}

function isArrayOfObjects(value: unknown): value is Record<string, unknown>[] {
  return Array.isArray(value) && value.every((v) => typeof v === 'object' && v !== null)
}

/**
 * Validazione difensiva del file caricato: un backup malformato non deve
 * arrivare fino alle insert, soprattutto in modalità "Sostituisci".
 */
export function parseBackup(raw: string): Backup {
  const parsed: unknown = JSON.parse(raw)
  if (typeof parsed !== 'object' || parsed === null) throw new Error('File non valido')

  const record = parsed as Record<string, unknown>
  const tables = ['lists', 'categories', 'payment_methods', 'subscriptions', 'price_changes'] as const

  for (const table of tables) {
    if (!isArrayOfObjects(record[table])) {
      throw new Error(`Il backup non contiene la tabella «${table}» in un formato valido`)
    }
  }

  return {
    version: 1,
    exportedAt: typeof record.exportedAt === 'string' ? record.exportedAt : new Date().toISOString(),
    lists: record.lists as ListRow[],
    categories: record.categories as CategoryRow[],
    payment_methods: record.payment_methods as PaymentMethodRow[],
    subscriptions: record.subscriptions as SubscriptionRow[],
    price_changes: record.price_changes as PriceChangeRow[],
  }
}

/** Scarica il backup come file, senza dipendenze esterne. */
export function downloadBackup(backup: Backup): void {
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `rinnovi-backup-${backup.exportedAt.slice(0, 10)}.json`
  link.click()
  URL.revokeObjectURL(url)
}
