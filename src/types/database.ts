// Tipi del database scritti a mano, coerenti con supabase/schema.sql.
// Nessun `any`: ogni tabella dichiara Row / Insert / Update.

export type BillingCycle =
  | 'weekly'
  | 'biweekly'
  | 'monthly'
  | 'bimonthly'
  | 'quarterly'
  | 'semiannual'
  | 'annual'
  | 'biennial'
  | 'custom'

export const BILLING_CYCLES: BillingCycle[] = [
  'weekly',
  'biweekly',
  'monthly',
  'bimonthly',
  'quarterly',
  'semiannual',
  'annual',
  'biennial',
  'custom',
]

/** Etichette italiane dei cicli, usate ovunque nell'interfaccia. */
export const BILLING_CYCLE_LABELS: Record<BillingCycle, string> = {
  weekly: 'Settimanale',
  biweekly: 'Ogni 2 settimane',
  monthly: 'Mensile',
  bimonthly: 'Ogni 2 mesi',
  quarterly: 'Trimestrale',
  semiannual: 'Semestrale',
  annual: 'Annuale',
  biennial: 'Ogni 2 anni',
  custom: 'Personalizzato',
}

/**
 * Colonne comuni a tutte le tabelle.
 * Sono `type` e non `interface` di proposito: il client Supabase vincola le
 * righe a `Record<string, unknown>` e solo gli alias di tipo ottengono la
 * index signature implicita che serve a soddisfarlo.
 */
type BaseRow = {
  id: string
  user_id: string
  created_at: string
  updated_at: string
}

export type ListRow = BaseRow & {
  name: string
  icon: string
  sort_order: number
}

export type CategoryRow = BaseRow & {
  name: string
  color: string
  icon: string
  sort_order: number
}

export type PaymentMethodRow = BaseRow & {
  name: string
  icon: string
  color: string
  last_four: string
}

export type SubscriptionRow = BaseRow & {
  name: string
  notes: string
  amount: number
  currency_code: string
  billing_cycle: BillingCycle
  custom_cycle_days: number
  /** Formato ISO `yyyy-MM-dd`. */
  first_billing_date: string
  is_active: boolean
  is_trial: boolean
  /** Formato ISO `yyyy-MM-dd`, null se non è una prova. */
  trial_end_date: string | null
  brand_color: string
  icon_url: string
  domain: string
  cancellation_url: string
  list_id: string | null
  category_id: string | null
  payment_method_id: string | null
}

export type PriceChangeRow = BaseRow & {
  subscription_id: string
  /** Formato ISO `yyyy-MM-dd`. */
  changed_at: string
  old_amount: number
  new_amount: number
}

/** Campi generati dal database, mai inviati in insert/update. */
type Generated = 'id' | 'user_id' | 'created_at' | 'updated_at'

export type ListInsert = Omit<ListRow, Generated> & { user_id: string }
export type ListUpdate = Partial<Omit<ListRow, Generated>>

export type CategoryInsert = Omit<CategoryRow, Generated> & { user_id: string }
export type CategoryUpdate = Partial<Omit<CategoryRow, Generated>>

export type PaymentMethodInsert = Omit<PaymentMethodRow, Generated> & { user_id: string }
export type PaymentMethodUpdate = Partial<Omit<PaymentMethodRow, Generated>>

export type SubscriptionInsert = Omit<SubscriptionRow, Generated> & { user_id: string }
export type SubscriptionUpdate = Partial<Omit<SubscriptionRow, Generated>>

export type PriceChangeInsert = Omit<PriceChangeRow, Generated> & { user_id: string }
export type PriceChangeUpdate = Partial<Omit<PriceChangeRow, Generated>>

/** Forma attesa dal client Supabase generico (`Relationships` incluso). */
export type Database = {
  public: {
    Tables: {
      lists: { Row: ListRow; Insert: ListInsert; Update: ListUpdate; Relationships: [] }
      categories: {
        Row: CategoryRow
        Insert: CategoryInsert
        Update: CategoryUpdate
        Relationships: []
      }
      payment_methods: {
        Row: PaymentMethodRow
        Insert: PaymentMethodInsert
        Update: PaymentMethodUpdate
        Relationships: []
      }
      subscriptions: {
        Row: SubscriptionRow
        Insert: SubscriptionInsert
        Update: SubscriptionUpdate
        Relationships: []
      }
      price_changes: {
        Row: PriceChangeRow
        Insert: PriceChangeInsert
        Update: PriceChangeUpdate
        Relationships: []
      }
    }
    Views: { [_ in never]: never }
    Functions: { [_ in never]: never }
    Enums: { [_ in never]: never }
    CompositeTypes: { [_ in never]: never }
  }
}
