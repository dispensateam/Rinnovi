/**
 * Catalogo dei servizi più diffusi in Italia, usato per precompilare il form
 * di creazione (§7.5). I prezzi sono indicativi e sempre modificabili.
 * `category` corrisponde ai nomi delle categorie di default create al seed.
 */

export type CatalogCategory =
  | 'Streaming'
  | 'Musica'
  | 'Software'
  | 'Cloud & Storage'
  | 'Fitness'
  | 'Giochi'
  | 'Notizie'
  | 'IA & Produttività'
  | 'Utenze'
  | 'Assicurazioni'
  | 'Trasporti'
  | 'Altro'

export interface CatalogService {
  name: string
  domain: string
  category: CatalogCategory
  brandColor: string
  monthlyPrice: number
}

export const CATALOG: CatalogService[] = [
  // Streaming ---------------------------------------------------------------
  { name: 'Netflix', domain: 'netflix.com', category: 'Streaming', brandColor: '#E50914', monthlyPrice: 12.99 },
  { name: 'Disney+', domain: 'disneyplus.com', category: 'Streaming', brandColor: '#113CCF', monthlyPrice: 8.99 },
  { name: 'Prime Video', domain: 'primevideo.com', category: 'Streaming', brandColor: '#00A8E1', monthlyPrice: 4.99 },
  { name: 'NOW', domain: 'nowtv.it', category: 'Streaming', brandColor: '#00B2A9', monthlyPrice: 9.99 },
  { name: 'DAZN', domain: 'dazn.com', category: 'Streaming', brandColor: '#0F1419', monthlyPrice: 34.99 },
  { name: 'Sky', domain: 'sky.it', category: 'Streaming', brandColor: '#0072C9', monthlyPrice: 29.9 },
  { name: 'Paramount+', domain: 'paramountplus.com', category: 'Streaming', brandColor: '#0064FF', monthlyPrice: 7.99 },
  { name: 'Apple TV+', domain: 'tv.apple.com', category: 'Streaming', brandColor: '#1D1D1F', monthlyPrice: 9.99 },
  { name: 'Crunchyroll', domain: 'crunchyroll.com', category: 'Streaming', brandColor: '#F47521', monthlyPrice: 6.99 },
  { name: 'Infinity', domain: 'mediasetinfinity.mediaset.it', category: 'Streaming', brandColor: '#1B3AC4', monthlyPrice: 7.99 },
  { name: 'Mubi', domain: 'mubi.com', category: 'Streaming', brandColor: '#000000', monthlyPrice: 11.99 },

  // Musica ------------------------------------------------------------------
  { name: 'Spotify', domain: 'spotify.com', category: 'Musica', brandColor: '#1DB954', monthlyPrice: 10.99 },
  { name: 'Apple Music', domain: 'music.apple.com', category: 'Musica', brandColor: '#FA243C', monthlyPrice: 10.99 },
  { name: 'YouTube Premium', domain: 'youtube.com', category: 'Musica', brandColor: '#FF0000', monthlyPrice: 11.99 },
  { name: 'Amazon Music', domain: 'music.amazon.it', category: 'Musica', brandColor: '#25D1DA', monthlyPrice: 10.99 },
  { name: 'Tidal', domain: 'tidal.com', category: 'Musica', brandColor: '#000000', monthlyPrice: 10.99 },
  { name: 'Deezer', domain: 'deezer.com', category: 'Musica', brandColor: '#A238FF', monthlyPrice: 11.99 },
  { name: 'Audible', domain: 'audible.it', category: 'Musica', brandColor: '#F8991C', monthlyPrice: 9.99 },

  // Cloud & Storage ---------------------------------------------------------
  { name: 'iCloud+', domain: 'icloud.com', category: 'Cloud & Storage', brandColor: '#3693F3', monthlyPrice: 2.99 },
  { name: 'Google One', domain: 'one.google.com', category: 'Cloud & Storage', brandColor: '#4285F4', monthlyPrice: 1.99 },
  { name: 'Dropbox', domain: 'dropbox.com', category: 'Cloud & Storage', brandColor: '#0061FF', monthlyPrice: 11.99 },
  { name: 'OneDrive', domain: 'onedrive.live.com', category: 'Cloud & Storage', brandColor: '#0078D4', monthlyPrice: 2.0 },

  // Software ----------------------------------------------------------------
  { name: 'Adobe Creative Cloud', domain: 'adobe.com', category: 'Software', brandColor: '#FF0000', monthlyPrice: 65.99 },
  { name: 'Microsoft 365', domain: 'microsoft.com', category: 'Software', brandColor: '#D83B01', monthlyPrice: 10.0 },
  { name: 'Figma', domain: 'figma.com', category: 'Software', brandColor: '#F24E1E', monthlyPrice: 12.0 },
  { name: 'Canva', domain: 'canva.com', category: 'Software', brandColor: '#00C4CC', monthlyPrice: 11.99 },
  { name: 'GitHub', domain: 'github.com', category: 'Software', brandColor: '#181717', monthlyPrice: 4.0 },
  { name: '1Password', domain: '1password.com', category: 'Software', brandColor: '#0572EC', monthlyPrice: 2.99 },
  { name: 'NordVPN', domain: 'nordvpn.com', category: 'Software', brandColor: '#4687FF', monthlyPrice: 4.49 },

  // IA & Produttività -------------------------------------------------------
  { name: 'ChatGPT Plus', domain: 'openai.com', category: 'IA & Produttività', brandColor: '#10A37F', monthlyPrice: 23.0 },
  { name: 'Claude Pro', domain: 'claude.ai', category: 'IA & Produttività', brandColor: '#D97757', monthlyPrice: 22.0 },
  { name: 'Perplexity', domain: 'perplexity.ai', category: 'IA & Produttività', brandColor: '#20808D', monthlyPrice: 20.0 },
  { name: 'Midjourney', domain: 'midjourney.com', category: 'IA & Produttività', brandColor: '#1B1B1F', monthlyPrice: 10.0 },
  { name: 'Notion', domain: 'notion.so', category: 'IA & Produttività', brandColor: '#000000', monthlyPrice: 9.5 },
  { name: 'Todoist', domain: 'todoist.com', category: 'IA & Produttività', brandColor: '#E44332', monthlyPrice: 4.0 },
  { name: 'Grammarly', domain: 'grammarly.com', category: 'IA & Produttività', brandColor: '#15C39A', monthlyPrice: 12.0 },
  { name: 'LinkedIn Premium', domain: 'linkedin.com', category: 'IA & Produttività', brandColor: '#0A66C2', monthlyPrice: 29.99 },

  // Giochi ------------------------------------------------------------------
  { name: 'PlayStation Plus', domain: 'playstation.com', category: 'Giochi', brandColor: '#0070D1', monthlyPrice: 8.99 },
  { name: 'Xbox Game Pass', domain: 'xbox.com', category: 'Giochi', brandColor: '#107C10', monthlyPrice: 12.99 },
  { name: 'Nintendo Switch Online', domain: 'nintendo.it', category: 'Giochi', brandColor: '#E60012', monthlyPrice: 3.99 },
  { name: 'Brawl Stars', domain: 'supercell.com', category: 'Giochi', brandColor: '#FFC61A', monthlyPrice: 4.99 },

  // Fitness -----------------------------------------------------------------
  { name: 'Strava', domain: 'strava.com', category: 'Fitness', brandColor: '#FC4C02', monthlyPrice: 8.99 },
  { name: 'Fitbit Premium', domain: 'fitbit.com', category: 'Fitness', brandColor: '#00B0B9', monthlyPrice: 8.99 },
  { name: 'MyFitnessPal', domain: 'myfitnesspal.com', category: 'Fitness', brandColor: '#0066EE', monthlyPrice: 9.99 },
  { name: 'Freeletics', domain: 'freeletics.com', category: 'Fitness', brandColor: '#EC1C24', monthlyPrice: 9.99 },
  { name: 'Duolingo', domain: 'duolingo.com', category: 'Fitness', brandColor: '#58CC02', monthlyPrice: 12.99 },
  { name: 'Babbel', domain: 'babbel.com', category: 'Fitness', brandColor: '#FF6A00', monthlyPrice: 12.99 },

  // Notizie -----------------------------------------------------------------
  { name: 'Il Post', domain: 'ilpost.it', category: 'Notizie', brandColor: '#E4322B', monthlyPrice: 8.0 },
  { name: 'Corriere della Sera', domain: 'corriere.it', category: 'Notizie', brandColor: '#0A2C4E', monthlyPrice: 9.99 },
  { name: 'la Repubblica', domain: 'repubblica.it', category: 'Notizie', brandColor: '#C8102E', monthlyPrice: 8.99 },
  { name: 'Il Sole 24 Ore', domain: 'ilsole24ore.com', category: 'Notizie', brandColor: '#E8B77A', monthlyPrice: 11.9 },

  // Utenze ------------------------------------------------------------------
  { name: 'Enel', domain: 'enel.it', category: 'Utenze', brandColor: '#0F9BDE', monthlyPrice: 65.0 },
  { name: 'Eni Plenitude', domain: 'eniplenitude.com', category: 'Utenze', brandColor: '#FFD500', monthlyPrice: 55.0 },
  { name: 'TIM', domain: 'tim.it', category: 'Utenze', brandColor: '#004691', monthlyPrice: 24.9 },
  { name: 'Vodafone', domain: 'vodafone.it', category: 'Utenze', brandColor: '#E60000', monthlyPrice: 24.9 },
  { name: 'Fastweb', domain: 'fastweb.it', category: 'Utenze', brandColor: '#FFD400', monthlyPrice: 27.95 },
  { name: 'Iliad', domain: 'iliad.it', category: 'Utenze', brandColor: '#D6001C', monthlyPrice: 9.99 },
  { name: 'WindTre', domain: 'windtre.it', category: 'Utenze', brandColor: '#FF6600', monthlyPrice: 19.99 },

  // Trasporti ---------------------------------------------------------------
  { name: 'Telepass', domain: 'telepass.com', category: 'Trasporti', brandColor: '#004B87', monthlyPrice: 3.9 },
  { name: 'Trenitalia', domain: 'trenitalia.com', category: 'Trasporti', brandColor: '#B01722', monthlyPrice: 12.0 },
  { name: 'Italo', domain: 'italotreno.com', category: 'Trasporti', brandColor: '#B3092B', monthlyPrice: 10.0 },
  { name: 'Uber One', domain: 'uber.com', category: 'Trasporti', brandColor: '#000000', monthlyPrice: 5.99 },

  // Assicurazioni -----------------------------------------------------------
  { name: 'Prima Assicurazioni', domain: 'prima.it', category: 'Assicurazioni', brandColor: '#1B1F3B', monthlyPrice: 38.0 },
  { name: 'Allianz Direct', domain: 'allianzdirect.it', category: 'Assicurazioni', brandColor: '#003781', monthlyPrice: 42.0 },

  // Altro -------------------------------------------------------------------
  { name: 'Amazon Prime', domain: 'amazon.it', category: 'Altro', brandColor: '#FF9900', monthlyPrice: 4.99 },
  { name: 'Apple One', domain: 'apple.com', category: 'Altro', brandColor: '#1D1D1F', monthlyPrice: 19.95 },
  { name: 'Revolut', domain: 'revolut.com', category: 'Altro', brandColor: '#0075EB', monthlyPrice: 7.99 },
  { name: 'N26', domain: 'n26.com', category: 'Altro', brandColor: '#36A18B', monthlyPrice: 4.9 },
  { name: 'Zalando Plus', domain: 'zalando.it', category: 'Altro', brandColor: '#FF6900', monthlyPrice: 1.99 },
  { name: 'Glovo Prime', domain: 'glovoapp.com', category: 'Altro', brandColor: '#FFC244', monthlyPrice: 5.99 },
  { name: 'Deliveroo Plus', domain: 'deliveroo.it', category: 'Altro', brandColor: '#00CCBC', monthlyPrice: 3.49 },
]

/** Ordine in cui le sezioni compaiono nel pannello "Aggiungi abbonamento". */
export const CATALOG_CATEGORY_ORDER: CatalogCategory[] = [
  'Streaming',
  'Musica',
  'IA & Produttività',
  'Software',
  'Cloud & Storage',
  'Giochi',
  'Fitness',
  'Notizie',
  'Utenze',
  'Trasporti',
  'Assicurazioni',
  'Altro',
]

/** Filtro della ricerca a pillola: per nome o per dominio, accent-insensitive. */
export function searchCatalog(query: string): CatalogService[] {
  const q = query.trim().toLowerCase()
  if (!q) return CATALOG
  return CATALOG.filter(
    (s) => s.name.toLowerCase().includes(q) || s.domain.toLowerCase().includes(q)
  )
}

/** Raggruppa per categoria mantenendo l'ordine dichiarato. */
export function groupCatalog(
  services: CatalogService[]
): { category: CatalogCategory; services: CatalogService[] }[] {
  return CATALOG_CATEGORY_ORDER.map((category) => ({
    category,
    services: services.filter((s) => s.category === category),
  })).filter((group) => group.services.length > 0)
}
