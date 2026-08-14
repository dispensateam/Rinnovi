/** Lista e categorie create automaticamente al primo accesso (§4). */

export const DEFAULT_LIST_NAME = 'Personale'
export const DEFAULT_LIST_ICON = 'user'

/** Categoria di ricaduta quando se ne elimina una (§7.8). */
export const FALLBACK_CATEGORY_NAME = 'Altro'

export interface DefaultCategory {
  name: string
  color: string
  icon: string
}

export const DEFAULT_CATEGORIES: DefaultCategory[] = [
  { name: 'Streaming', color: '#E5484D', icon: 'clapperboard' },
  { name: 'Musica', color: '#22C55E', icon: 'music' },
  { name: 'Software', color: '#2563EB', icon: 'code' },
  { name: 'Cloud & Storage', color: '#06B6D4', icon: 'cloud' },
  { name: 'Fitness', color: '#84CC16', icon: 'dumbbell' },
  { name: 'Giochi', color: '#EC4899', icon: 'gamepad-2' },
  { name: 'Notizie', color: '#F5A03C', icon: 'newspaper' },
  { name: 'IA & Produttività', color: '#6C4BF6', icon: 'sparkles' },
  { name: 'Utenze', color: '#EAB308', icon: 'plug' },
  { name: 'Assicurazioni', color: '#4F46E5', icon: 'shield' },
  { name: 'Trasporti', color: '#14B8A6', icon: 'train-front' },
  { name: FALLBACK_CATEGORY_NAME, color: '#64748B', icon: 'tag' },
]

/** Metodi di pagamento suggeriti, creati insieme ai dati di esempio. */
export const DEFAULT_PAYMENT_METHODS = [
  { name: 'Carta principale', icon: 'credit-card', color: '#6C4BF6', last_four: '' },
]
