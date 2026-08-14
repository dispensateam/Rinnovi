import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/database'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !anonKey) {
  // Fallire subito e con un messaggio chiaro è meglio di errori di rete opachi
  throw new Error(
    'Variabili d\'ambiente mancanti: definisci VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY in .env.local'
  )
}

/** Client singleton. La sessione persiste in localStorage (default Supabase). */
export const supabase = createClient<Database>(url, anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})
