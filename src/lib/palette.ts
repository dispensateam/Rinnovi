/**
 * Palette dei 14 colori assegnabili agli abbonamenti (§9.1).
 * Gli stessi valori sono registrati in tailwind.config.js sotto `sub-*`,
 * ma qui servono come stringhe perché il colore è un dato salvato a database
 * e va applicato con uno style inline sull'elemento.
 */

export interface PaletteColor {
  name: string
  value: string
}

export const SUBSCRIPTION_COLORS: PaletteColor[] = [
  { name: 'Viola', value: '#6C4BF6' },
  { name: 'Indaco', value: '#4F46E5' },
  { name: 'Blu', value: '#2563EB' },
  { name: 'Ciano', value: '#06B6D4' },
  { name: 'Teal', value: '#14B8A6' },
  { name: 'Verde', value: '#22C55E' },
  { name: 'Lime', value: '#84CC16' },
  { name: 'Giallo', value: '#EAB308' },
  { name: 'Arancio', value: '#F5A03C' },
  { name: 'Corallo', value: '#FB7185' },
  { name: 'Rosso', value: '#E5484D' },
  { name: 'Magenta', value: '#E8407A' },
  { name: 'Rosa', value: '#EC4899' },
  { name: 'Ardesia', value: '#64748B' },
]

export const DEFAULT_COLOR = SUBSCRIPTION_COLORS[0].value

/** Colore stabile derivato dal nome, per elementi senza colore esplicito. */
export function colorFromName(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i += 1) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0
  }
  return SUBSCRIPTION_COLORS[hash % SUBSCRIPTION_COLORS.length].value
}
