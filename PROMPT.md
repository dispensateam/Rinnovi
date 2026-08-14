# Progetto: "Rinnovi" — Web app personale per il tracciamento degli abbonamenti

## 0. Regole operative (leggi prima di tutto)

- **Non interrompermi con domande.** Implementa tutte le fasi in sequenza fino alla fine. Se un dettaglio non è specificato, scegli l'opzione più sensata e annotala in `DECISIONI.md`, una riga per decisione con il motivo.
- Non chiedere conferme intermedie. Non fermarti a "vuoi che proceda con la Fase 2?". Procedi.
- **Prima cosa in assoluto**: genera `supabase/schema.sql` (§4) e stampa a schermo un avviso ben visibile che va incollato nel SQL Editor di Supabase. Poi prosegui con il resto della build senza aspettare.
- Dopo ogni fase verifica che compili e che non ci siano errori di tipo:
  ```
  npm run build && npx tsc --noEmit
  ```
  Se fallisce, correggi da solo e riprova finché non passa. Non consegnare codice che non compila.
- Niente `any` in TypeScript. Genera i tipi del database in `src/types/database.ts` a mano, coerenti con lo schema SQL.
- Alla fine scrivi `README.md` con setup, variabili d'ambiente, comandi e deploy.
- Commenti in italiano dove serve. Nomi di variabili, componenti e colonne in inglese.

## 1. Contesto

Web app **strettamente personale** per tracciare i miei abbonamenti ricorrenti. Uso principale: **capire quanto spendo all'anno**. Un solo utente (io), accessibile da iPhone, iPad e Mac tramite browser, installabile in home screen come PWA.

Il riferimento visivo e funzionale è l'app iOS **Orbit**: stessa struttura di navigazione, stessa impaginazione, stessa estetica scura "spaziale". Differenze: nessun limite di abbonamenti, nessun paywall, nessun in-app purchase, nessuna telemetria.

**Non copiare asset grafici da altre app.** Pianeta, stelle e anelli orbitali vanno generati con CSS/SVG (§9.3).

Fuori scope, non implementarli: notifiche push, service worker per l'offline write, widget, condivisione, recensioni.

## 2. Stack tecnico (vincolante)

- **Vite** + **React 18** + **TypeScript** (template `react-ts`).
- **Tailwind CSS** per lo stile. Nessun CSS-in-JS, nessuna component library pesante (niente MUI, niente Chakra).
- **Supabase** per database e autenticazione (`@supabase/supabase-js`).
- **TanStack Query** (`@tanstack/react-query`) per fetch, cache e mutazioni. Invalidazione delle query dopo ogni mutazione: niente stato duplicato a mano.
- **React Router** (`react-router-dom`) per le rotte.
- **date-fns** con locale `it` per tutta l'aritmetica sulle date.
- **Recharts** per i grafici.
- **framer-motion** per le transizioni dei menu e della tab bar.
- **lucide-react** per le icone.

Nient'altro. Non aggiungere dipendenze oltre a queste senza annotarlo in `DECISIONI.md`.

Se la cartella è vuota, inizializza tu il progetto con `npm create vite@latest . -- --template react-ts`. Il file `.env.local` con le chiavi Supabase esiste già: **non sovrascriverlo e non committarlo**, aggiungilo a `.gitignore`.

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

## 3. Autenticazione

Un solo utente. Login con **magic link via email** attraverso Supabase Auth (`signInWithOtp`). Nessuna registrazione, nessuna password, nessun profilo.

- `src/lib/supabase.ts` esporta il client singleton.
- `AuthProvider` in context che espone `session`, `user`, `signIn(email)`, `signOut()`, e gestisce `onAuthStateChange`.
- Rotta `/login`: schermata minimale sullo sfondo stellato, campo email e pulsante viola "Invia link di accesso", poi messaggio di conferma. Gestisci lo stato di errore.
- Tutte le altre rotte sono protette da un `RequireAuth` che reindirizza a `/login`. Mostra uno spinner mentre la sessione si sta risolvendo, non un flash della schermata di login.
- La sessione persiste in `localStorage` (default di Supabase): non devo rifare il login a ogni apertura.

## 4. Database — `supabase/schema.sql`

Un unico file idempotente, con estensioni, tabelle, indici, trigger e policy RLS, pronto da incollare nel SQL Editor.

Regole valide per **tutte** le tabelle:
- Chiave primaria `id uuid primary key default gen_random_uuid()`.
- Colonna `user_id uuid not null references auth.users(id) on delete cascade`, con indice.
- `created_at timestamptz not null default now()` e `updated_at timestamptz not null default now()`, con trigger `set_updated_at` che aggiorna `updated_at` a ogni UPDATE.
- **RLS abilitata** con quattro policy (select/insert/update/delete) su `auth.uid() = user_id`. Senza questo i dati sarebbero pubblici: è obbligatorio.

### `lists`
`name text not null default ''`, `icon text not null default 'user'`, `sort_order int not null default 0`.

### `categories`
`name text not null default ''`, `color text not null default '#6C4BF6'`, `icon text not null default 'tag'`, `sort_order int not null default 0`.

### `payment_methods`
`name text not null default ''`, `icon text not null default 'credit-card'`, `color text not null default '#6C4BF6'`, `last_four text not null default ''`.

### `subscriptions`
| Colonna | Tipo | Default |
|---|---|---|
| `name` | text not null | `''` |
| `notes` | text not null | `''` |
| `amount` | numeric(12,2) not null | `0` |
| `currency_code` | text not null | `'EUR'` |
| `billing_cycle` | text not null | `'monthly'` |
| `custom_cycle_days` | int not null | `30` |
| `first_billing_date` | date not null | `current_date` |
| `is_active` | boolean not null | `true` |
| `is_trial` | boolean not null | `false` |
| `trial_end_date` | date | null |
| `brand_color` | text not null | `'#6C4BF6'` |
| `icon_url` | text not null | `''` |
| `domain` | text not null | `''` — usato per il favicon |
| `cancellation_url` | text not null | `''` |
| `list_id` | uuid → `lists(id)` on delete set null | null |
| `category_id` | uuid → `categories(id)` on delete set null | null |
| `payment_method_id` | uuid → `payment_methods(id)` on delete set null | null |

Vincolo `check (billing_cycle in ('weekly','biweekly','monthly','bimonthly','quarterly','semiannual','annual','biennial','custom'))`. Indici su `user_id`, `list_id`, `is_active`.

### `price_changes`
`subscription_id uuid not null references subscriptions(id) on delete cascade`, `changed_at date not null default current_date`, `old_amount numeric(12,2) not null default 0`, `new_amount numeric(12,2) not null default 0`.

### Seed al primo accesso
Non nel SQL. Nel client: al primo caricamento, se l'utente non ha nessuna lista, crea la lista **"Personale"** e le categorie di default (Streaming, Musica, Software, Cloud & Storage, Fitness, Giochi, Notizie, IA & Produttività, Utenze, Assicurazioni, Trasporti, Altro) ognuna con colore e icona sensati.

## 5. Logica — `src/lib/renewals.ts`

Funzioni pure, senza dipendenze da React o Supabase, tutte con `date-fns`:

- `nextRenewalDate(sub, from = new Date())` — avanza da `first_billing_date` di un ciclo alla volta finché non supera `from`. Usa `addMonths` / `addWeeks` / `addYears`, **mai** aritmetica su millisecondi: deve gestire mesi di lunghezza diversa e anni bisestili. Un abbonamento nato il 31 gennaio deve rinnovare il 28/29 febbraio, non sbordare a marzo.
- `daysUntilRenewal(sub)`
- `cycleInMonths(cycle, customDays)` — fattore di normalizzazione.
- `monthlyEquivalent(sub)` / `yearlyEquivalent(sub)`
- `renewalsInMonth(subs, month)` — tutte le occorrenze di rinnovo che cadono in quel mese, con data esatta. Un settimanale genera 4–5 occorrenze: gestiscile tutte.
- `actualCostInMonth(subs, month)` — costo **reale** di quel mese, non normalizzato: se l'annuale scade a marzo, marzo pesa per intero. È il dato dietro il grafico principale.
- `totalSpentSoFar(sub, priceChanges)` — cicli trascorsi × importo, tenendo conto dello storico prezzi.

Trial: se `is_trial` e `trial_end_date` è futura, l'abbonamento conta **zero** nei totali ma viene mostrato a parte.

Scrivi questo file per primo e con attenzione: tutto il resto dipende dalla sua correttezza.

## 6. Struttura

```
src/
├── main.tsx
├── App.tsx                    // router + provider
├── lib/
│   ├── supabase.ts
│   ├── renewals.ts
│   ├── format.ts              // Intl per valuta e date
│   └── catalog.ts             // catalogo servizi
├── hooks/
│   ├── useAuth.tsx
│   ├── useSubscriptions.ts
│   ├── useLists.ts
│   ├── useCategories.ts
│   ├── usePaymentMethods.ts
│   └── useFilters.ts          // filtri persistiti in localStorage
├── types/database.ts
├── components/
│   ├── layout/                // TabBar, TopBar, PageShell
│   ├── space/                 // Starfield, Planet, OrbitSystem
│   ├── ui/                    // Card, Pill, Sheet, CascadingMenu, IconBadge, EmptyState
│   └── subscriptions/         // SubscriptionRow, SubscriptionIcon, ...
└── pages/
    ├── Login.tsx
    ├── Subscriptions.tsx
    ├── Calendar.tsx
    ├── Settings.tsx
    ├── Statistics.tsx
    └── SubscriptionDetail.tsx
```

Un componente per file, max ~250 righe. Se cresce, spezzalo.

## 7. Schermate

**Layout globale**: larghezza massima del contenuto **440px**, centrata, su sfondo nero — così su desktop si vede come una colonna mobile, che è l'aspetto voluto. Tab bar flottante in basso, fissa. Tre rotte principali: `/` (Abbonamenti), `/calendario`, `/impostazioni`.

### 7.1 Abbonamenti (`/`)

**Barra superiore fissa**, sfondo con sfumatura verso il nero:
- A sinistra: pillola viola piena `#6C4BF6`, altezza 52px, icona `Sparkles` + testo bold bianco **"Statistiche"** → apre `/statistiche` come pannello a scorrimento dal basso.
- A destra: pulsante circolare 60px, sfondo `#1E1B26`, bordo `rgba(255,255,255,.08)`, icona `Plus` bianca → apre il pannello "Aggiungi abbonamento" (§7.5).

**Hero orbitale**, altezza ~360px:
- Campo stellato + alone viola radiale.
- Pianeta centrale (~300px) con gradiente arancio → magenta e glow viola diffuso.
- Due anelli ellittici concentrici, `stroke` 1px viola al 35%.
- Lungo gli anelli, un'icona per ogni abbonamento attivo (max 8, i più vicini al rinnovo). **Ruotano lentamente**: giro completo in 60s sull'anello interno, 90s su quello esterno, verso opposto. Realizza la rotazione con `@keyframes` CSS su un wrapper e una contro-rotazione sull'icona, così le icone restano dritte. Sospendi l'animazione quando la tab del browser non è visibile e quando `prefers-reduced-motion` è attivo.

**Riga dei totali**, padding orizzontale 24px:
- A sinistra: numero enorme, `font-weight: 900`, ~56px — conteggio degli abbonamenti attivi nella selezione. Sotto, in grigio 19px, il nome della lista attiva + icona `ChevronsUpDown`, cliccabile → menu a cascata (§7.2).
- A destra, allineato a destra: importo `font-weight: 900` ~38px e sotto in grigio **"Totale annuale"** (o "Totale mensile" secondo il filtro).

**Header lista**: "Attivo" a sinistra in grigio 19px; a destra il nome dell'ordinamento corrente + icona `ArrowUpDown`, che apre un menu con: Prossimo rinnovo · Nome · Prezzo ↓ · Prezzo ↑ · Aggiunto di recente.

**Riga abbonamento**: card `rounded-3xl`, sfondo `#17151E`, altezza ~84px, gap verticale 12px, `active:scale-[0.98]`.
- Icona 48×48 a sinistra (§9.4).
- Nome bianco bold 22px.
- Sottotitolo grigio 16px: `"Tra 30 giorni · 13 set 2026"`. Se il rinnovo è oggi → "Oggi", domani → "Domani". Se mancano ≤3 giorni, sottotitolo arancione.
- A destra: importo grigio chiaro bold + `ChevronRight`.
- Click → `/abbonamento/:id`.

Sotto le attive, se esistono, una sezione collassabile **"Archiviati"** con le righe al 50% di opacità.

**Empty state**: card con icona, "Nessun abbonamento" e pulsante "Aggiungi il primo".

**Loading**: skeleton delle righe (rettangoli pulsanti), mai uno spinner a schermo intero.

### 7.2 Menu a cascata dei filtri

Click sul nome della lista apre un pannello scuro flottante (`rounded-[28px]`, sfondo `#141119` con `backdrop-blur`, ombra profonda) con tre voci separate da divisori, ognuna con icona a sinistra e `ChevronRight` a destra:

1. `List` **Liste**
2. `LayoutGrid` **Categorie**
3. `Calendar` **Ciclo di fatturazione**

Click su una voce fa **scivolare un secondo pannello sopra il primo**, che resta visibile dietro leggermente sfalsato in basso. Il secondo pannello ha in testa la voce selezionata con `ChevronDown` (click = indietro), un divisore, poi le opzioni con `Check` su quella attiva:

- **Liste** → una voce per lista + in fondo, separata, `SquarePen` **"Modifica liste"**.
- **Categorie** → "Tutto" + le categorie che hanno almeno un abbonamento.
- **Ciclo di fatturazione** → "Tutto" · "Mese" · "Anno".

Filtri combinabili, persistiti in `localStorage`. Transizione con `framer-motion` (`AnimatePresence`, scala 0.94 → 1). Chiusura al click esterno e con `Escape`.

### 7.3 Dettaglio (`/abbonamento/:id`)

Pannello a schermo pieno con sfondo stellato attenuato.
- Header: icona 80×80, nome `font-weight: 900` 32px, importo e ciclo.
- Card "Prossimo rinnovo" con data estesa in italiano e countdown in giorni.
- Griglia 2×2: costo mensilizzato, costo annualizzato, **totale speso finora**, numero di rinnovi effettuati.
- Righe informative: lista, categoria, metodo di pagamento, prima fatturazione, note.
- Sezione "Storico prezzi" se ci sono `price_changes`, con variazione percentuale.
- Pulsante "Disdici" se `cancellation_url` è valorizzato → apre in nuova scheda.
- In alto a destra menu: Modifica · Archivia · Duplica · Elimina (con conferma).

### 7.4 Statistiche (`/statistiche`)

È la schermata più importante: serve a capire quanto spendo. Selettore segmentato in alto **Mese / Anno**.

- Card riepilogo in griglia: totale, media per abbonamento, più costoso, numero attivi, numero trial.
- **Spesa reale prossimi 12 mesi** — `BarChart` Recharts, una barra per mese, costo non normalizzato: i picchi degli annuali devono essere evidenti. Tooltip con il dettaglio degli abbonamenti di quel mese.
- **Ripartizione per categoria** — `PieChart` a ciambella con legenda e percentuali, colori delle categorie.
- **Top 5 più costosi** — barre orizzontali col `brand_color` di ciascuno.
- **Confronto mensile vs annuale** — card che mostra quanto risparmierei passando ai piani annuali dove esistono, se il dato è disponibile; altrimenti ometti.

Ogni grafico ha uno stato vuoto decente. Tutti i grafici sono responsive (`ResponsiveContainer`) e leggibili a 390px di larghezza.

### 7.5 Aggiungi abbonamento

Pannello con header: **"Annulla"** a sinistra in una pillola grigia, titolo al centro, a destra pulsante circolare con `SquarePen` che salta al form manuale vuoto.

Corpo: catalogo raggruppato per categoria in sezioni con header maiuscolo grigio. Ogni riga: logo del servizio + nome. Click → form precompilato con nome, dominio, categoria, colore e prezzo indicativo, tutto modificabile.

In fondo, campo di **ricerca** a pillola che filtra in tempo reale. Se non trova nulla, riga "Crea «testo digitato»".

`src/lib/catalog.ts` esporta un array di ~70 servizi diffusi in Italia, ognuno con `{ name, domain, category, brandColor, monthlyPrice }`: Netflix, Disney+, Prime Video, NOW, DAZN, Sky, Paramount+, Apple TV+, Crunchyroll, Infinity, Spotify, Apple Music, YouTube Premium, Tidal, Deezer, Audible, iCloud+, Google One, Dropbox, OneDrive, Adobe Creative Cloud, Microsoft 365, Notion, Figma, Canva, GitHub, ChatGPT Plus, Claude Pro, Perplexity, Midjourney, PlayStation Plus, Xbox Game Pass, Nintendo Switch Online, Brawl Stars, Strava, Fitbit Premium, MyFitnessPal, Freeletics, Duolingo, Babbel, Il Post, Corriere, Repubblica, Il Sole 24 Ore, Amazon Prime, Revolut, N26, Telepass, Enel, Eni, TIM, Vodafone, Fastweb, Iliad, WindTre, Trenitalia, Italo, Zalando Plus, Glovo Prime, Deliveroo Plus, Uber One.

### 7.6 Form abbonamento

Stesso componente per creazione e modifica. Campi raggruppati in card:
1. **Identità** — nome; icona: campo dominio (es. `netflix.com`) con anteprima live del logo, oppure URL immagine custom; palette di 14 colori.
2. **Costo** — importo (input `inputMode="decimal"`, accetta sia virgola che punto), valuta, ciclo, campo giorni se `custom`.
3. **Date** — prima fatturazione; toggle "È una prova gratuita" che rivela la data di fine.
4. **Organizzazione** — lista, categoria, metodo di pagamento, ognuno con opzione inline "Nuovo…".
5. **Extra** — URL di disdetta, note.

Validazione: nome non vuoto, importo ≥ 0, data valida. "Salva" disabilitato se non valido, con spinner durante la mutazione. Se cambio l'importo di un abbonamento esistente, **inserisci automaticamente una riga in `price_changes`**.

### 7.7 Calendario (`/calendario`)

- Titolo grande `font-weight: 900` ~48px col nome del mese ("Agosto"). Frecce e swipe orizzontale per cambiare mese.
- Sotto, su una riga: `"42,96 € Totale"` e `"0,00 € Prossimi"` — totale dei rinnovi del mese e totale di quelli ancora a venire. Cifra bianca bold, etichetta grigia.
- Header: Lun Mar Mer Gio Ven Sab Dom (settimana da lunedì, locale `it`).
- Griglia 7 colonne, celle `rounded-2xl` sfondo `#131019`, altezza ~110px, numero del giorno in alto bold. Celle fuori mese vuote e senza sfondo.
- Nelle celle con rinnovi: sotto il numero, 1 logo piccolo e, se ce ne sono altri, `"+3"` in grigio.
- **Oggi**: sfondo `#3A2A6B`, numero lilla.
- Click su una cella con rinnovi → pannello con la lista di quel giorno e il totale.

### 7.8 Impostazioni (`/impostazioni`)

Titolo `font-weight: 900` ~48px. Gruppi in card `rounded-3xl` sfondo `#17151E`, righe con divisori e icona in un quadratino grigio arrotondato a sinistra.

**Preferenze** — Valuta preferita (valore a destra) · Liste → · Categorie → · Metodi di pagamento →
**Dati** — Esporta backup JSON (download) · Importa backup JSON (con scelta Unisci / Sostituisci) · Carica dati di esempio · Cancella tutti i dati (rosso, doppia conferma)
**Account** — email dell'utente · Esci
**Info** — versione

Liste / Categorie / Metodi di pagamento sono schermate editabili: aggiungi, rinomina, cambia colore e icona, riordina, elimina. Eliminando una categoria i suoi abbonamenti passano a "Altro"; eliminando una lista passano alla prima rimanente; non permettere di eliminare l'ultima lista.

## 8. PWA

`vite-plugin-pwa` **non** è tra le dipendenze consentite: fai a mano.
- `public/manifest.webmanifest` con `name`, `short_name: "Rinnovi"`, `display: "standalone"`, `theme_color: "#0A0810"`, `background_color: "#0A0810"`, `orientation: "portrait"`.
- Icone 192 e 512 generate come SVG → PNG: un pianeta arancio/magenta su fondo scuro. Se non puoi generare PNG, usa un SVG maskable e documentalo.
- `<meta name="apple-mobile-web-app-capable" content="yes">` e `apple-touch-icon` in `index.html`.
- `viewport-fit=cover` e padding con `env(safe-area-inset-bottom)` sulla tab bar, così su iPhone non finisce sotto la barra home.

## 9. Design system

### 9.1 Palette (in `tailwind.config.js`, nessun colore hardcoded nei componenti)
```
bg            #0A0810   quasi nero con tinta viola
bg-raised     #131019
card          #17151E
card-hi       #1E1B26
accent        #6C4BF6
accent-glow   #8B6BFF
planet-top    #F5A03C
planet-bottom #E8407A
text-primary  #FFFFFF
text-muted    #8E8A99
warning       #F5A03C
danger        #E5484D
```
Palette dei 14 colori per gli abbonamenti: viola, indaco, blu, ciano, teal, verde, lime, giallo, arancio, corallo, rosso, magenta, rosa, ardesia.

### 9.2 Tipografia
**Inter** via `@fontsource-variable/inter` (aggiungila alle dipendenze), pesi 400/600/800/900. Titoli e numeri hero a **900** con `letter-spacing: -0.02em`. Importi sempre con `font-variant-numeric: tabular-nums` così le cifre non ballano durante le animazioni.

### 9.3 Grafica generata
- **Starfield**: ~150 stelle posizionate con un PRNG a seed fisso (così non cambiano a ogni render), dimensione 1–3px, opacità 0.15–0.7, bianche e lilla, qualcuna con animazione di pulsazione lenta. Componente memoizzato, generato una volta sola.
- **Pianeta**: `div` circolare con `radial-gradient` arancio → magenta spostato in alto a sinistra, un secondo layer `radial-gradient` a bassa opacità per le fasce nuvolose, e `box-shadow: 0 0 80px rgba(108,75,246,.5)` per il glow.
- **Anelli**: `<ellipse>` SVG con `stroke` a gradiente lineare, opacità 0.35.

### 9.4 Icone degli abbonamenti — componente `SubscriptionIcon`
Ordine di fallback:
1. `icon_url` se valorizzato.
2. Altrimenti, se `domain` è valorizzato: `https://www.google.com/s2/favicons?domain={domain}&sz=128`.
3. Altrimenti (o se l'immagine fallisce a caricare, gestisci `onError`): cerchio pieno `brand_color` con l'iniziale del nome in bianco bold.

Immagini in `rounded-xl`, `object-contain`, con `loading="lazy"`. Il fallback deve essere istantaneo, senza sfarfallio.

### 9.5 Tab bar
Barra **flottante**, non ancorata ai bordi: capsula larga ~78% del contenitore, centrata, 16px sopra la safe area, sfondo `rgba(20,17,25,.85)` con `backdrop-blur-xl` e bordo `rgba(255,255,255,.08)`. Tre voci: `Circle` Abbonamenti · `Calendar` Calendario · `Settings` Impostazioni. La voce attiva ha dietro una capsula `#2A2632` animata con `layoutId` di framer-motion; icona e testo bianchi, le inattive grigie. Etichetta sempre visibile sotto l'icona, 12px.

### 9.6 Movimento e formattazione
Transizioni sobrie: `spring` con `stiffness: 300, damping: 30`. Rispetta sempre `prefers-reduced-motion`.
Valuta e date **solo** con `Intl.NumberFormat('it-IT', { style:'currency', currency })` e `date-fns` con locale `it`. Mai simboli o formati hardcoded. Interfaccia interamente in italiano.

## 10. Dati di esempio

`src/lib/sampleData.ts` con ~14 abbonamenti realistici: mensili di streaming, due annuali (per far vedere i picchi nel grafico), una prova gratuita in corso, uno archiviato, uno con due variazioni di prezzo, uno con ciclo custom. Inseribili dalle Impostazioni con una singola mutazione batch.

## 11. Ordine di esecuzione

Esegui le fasi consecutivamente, senza fermarti.

1. **Schema e fondamenta** — `supabase/schema.sql` (per primo, con avviso a schermo), scaffolding Vite, Tailwind con la palette, client Supabase, tipi del database, `renewals.ts`, `format.ts`, `catalog.ts`. Verifica.
2. **Auth e shell** — `AuthProvider`, `/login`, `RequireAuth`, router, `PageShell`, tab bar flottante, seed al primo accesso. Verifica.
3. **Design system** — Starfield, Planet, OrbitSystem animata, `SubscriptionIcon`, Card, Pill, Sheet, CascadingMenu, EmptyState, skeleton. Verifica.
4. **Abbonamenti** — hero, totali, menu a cascata dei filtri, ordinamento, righe, sezione archiviati. Verifica.
5. **Aggiungi, Form, Dettaglio** — catalogo con ricerca, form completo con storico prezzi automatico, dettaglio. A fine fase l'app è usabile end-to-end. Verifica.
6. **Statistiche** — tutti i grafici Recharts. Verifica.
7. **Calendario** — griglia mensile, totali, indicatori, pannello del giorno. Verifica.
8. **Impostazioni e dati** — gruppi, gestione liste/categorie/metodi, export/import JSON, dati di esempio. Verifica.
9. **PWA e rifinitura** — manifest, icone, safe area, accessibilità (focus visibile, `aria-label` sui pulsanti icona, contrasto), `README.md`, `DECISIONI.md`.

Alla fine riporta un riepilogo di cosa hai costruito, delle decisioni prese e dei punti dove hai dovuto interpretare.
