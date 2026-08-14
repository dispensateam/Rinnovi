import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/database'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

/**
 * `false` se mancano le variabili d'ambiente: l'app lo mostra a schermo.
 *
 * Il controllo non può essere un `throw` a livello di modulo: Vite sostituisce
 * `import.meta.env.*` con costanti a build-time, quindi con le variabili vuote
 * la condizione diventa sempre vera e il bundler elimina come codice morto
 * tutto ciò che segue — cioè l'intera applicazione.
 */
export const isSupabaseConfigured = Boolean(url && anonKey)

/** Valori di ripiego: servono solo a costruire il client senza eccezioni. */
const PLACEHOLDER_URL = 'https://placeholder.supabase.co'
const PLACEHOLDER_KEY = 'placeholder-anon-key'

/** Client singleton. La sessione persiste in localStorage (default Supabase). */
export const supabase = createClient<Database>(url || PLACEHOLDER_URL, anonKey || PLACEHOLDER_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})
