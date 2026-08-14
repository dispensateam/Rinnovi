# Rinnovi

Web app personale per tracciare gli abbonamenti ricorrenti e capire quanto costano in un anno.
Un solo utente, accesso con magic link, installabile in home screen come PWA.

Estetica scura "spaziale": pianeta, stelle e anelli orbitali sono generati in CSS/SVG, nessun asset importato.

## Requisiti

- Node 20 o superiore (sviluppato su Node 22)
- Un progetto Supabase

## Setup

### 1. Schema del database

Apri Supabase → **SQL Editor**, incolla l'intero contenuto di [`supabase/schema.sql`](supabase/schema.sql) ed esegui.

Il file è **idempotente**: puoi rieseguirlo quando vuoi senza rompere nulla. Crea cinque tabelle
(`lists`, `categories`, `payment_methods`, `subscriptions`, `price_changes`), gli indici, il trigger
`set_updated_at` e — soprattutto — abilita **RLS** con quattro policy per tabella su `auth.uid() = user_id`.
Senza quelle policy i dati sarebbero leggibili da chiunque abbia la anon key.

### 2. Autenticazione

In Supabase → **Authentication → Providers**, assicurati che **Email** sia abilitato.
L'app usa `signInWithOtp`, quindi non serve alcuna password. In **URL Configuration** aggiungi
l'origine da cui apri l'app (`http://localhost:5173` in sviluppo, più il dominio di produzione)
tra i **Redirect URLs**, altrimenti il link nella mail non riporta all'app.

### 3. Variabili d'ambiente

Crea `.env.local` nella radice del progetto:

```
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
```

Le trovi in Supabase → **Project Settings → API** (`Project URL` e la chiave `anon public`).
Il file è in `.gitignore` e non va committato. Se mancano le variabili l'app non esplode: mostra
una schermata che spiega cosa fare.

### 4. Avvio

```bash
npm install
npm run dev
```

Al primo accesso l'app crea da sola la lista **Personale** e le dodici categorie di default.
Da **Impostazioni → Dati → Carica dati di esempio** puoi popolare tutto con 14 abbonamenti
realistici per vedere come si comportano grafici e calendario.

## Comandi

| Comando | Cosa fa |
|---|---|
| `npm run dev` | Server di sviluppo |
| `npm run build` | Type check + build di produzione |
| `npm run build:check` | Come sopra ma con variabili fittizie, per verificare la build senza `.env.local` |
| `npm run preview` | Serve la build di produzione in locale |
| `npm run lint` | oxlint |

> **Perché esiste `build:check`.** Vite sostituisce `import.meta.env.VITE_*` con costanti a
> build-time. Con le variabili vuote ogni controllo su di esse diventa costante, e il bundler
> elimina come codice morto tutto ciò che sta dietro — nel nostro caso l'intera applicazione,
> producendo un bundle che compila ma non contiene niente. `build:check` inietta due valori
> fittizi così la build che verifichi è quella vera.

## Deploy

Qualsiasi host statico va bene (Vercel, Netlify, Cloudflare Pages).

- Build command: `npm run build`
- Output directory: `dist`
- Imposta `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` tra le variabili d'ambiente dell'host.
- Serve un **rewrite di tutte le rotte su `/index.html`**, altrimenti un refresh su `/calendario`
  restituisce 404. Su Netlify: `/* /index.html 200`. Su Vercel il preset Vite lo configura da solo.
- Aggiungi il dominio di produzione ai **Redirect URLs** di Supabase.

## Struttura

```
src/
├── lib/         renewals.ts (aritmetica dei rinnovi), format.ts, catalog.ts, stats.ts, backup.ts
├── hooks/       auth, query dei dati, filtri persistiti, azioni sui dati
├── components/  layout/ space/ ui/ subscriptions/ calendar/ stats/ settings/
├── pages/       Login, Subscriptions, Calendar, Statistics, Settings, SubscriptionDetail
└── types/       database.ts — tipi scritti a mano, allineati allo schema SQL
```

Il cuore è [`src/lib/renewals.ts`](src/lib/renewals.ts): funzioni pure, senza React né Supabase.
Tutti gli avanzamenti di data passano da `date-fns` (`addMonths` / `addWeeks` / `addYears`),
mai da aritmetica sui millisecondi, e partono sempre dall'ancora `first_billing_date` moltiplicando
il passo invece di accumulare — così un abbonamento nato il 31 gennaio rinnova il 28/29 febbraio
e poi torna al 31 marzo, senza restare incastrato sul 28.

## PWA

Manifest e meta tag sono scritti a mano (niente `vite-plugin-pwa`). Le icone sono **SVG**, comprese
quelle `maskable`: sulla macchina di sviluppo non era disponibile alcun convertitore SVG → PNG
(`rsvg-convert`, `inkscape`, ImageMagick, `cairosvg`). iOS e Android accettano icone SVG nel manifest;
se vuoi PNG veri, apri `public/icon-512.svg` in un browser ed esporta a 192 e 512 px, poi aggiorna
`manifest.webmanifest` e l'`apple-touch-icon` in `index.html`.

Non ci sono service worker: l'app richiede la rete, per scelta (l'offline write è fuori scope).

## Note

- Interfaccia interamente in italiano. Valuta e date solo via `Intl` e `date-fns` con locale `it`.
- Le prove gratuite in corso contano **zero** nei totali e sono segnalate a parte.
- Modificando l'importo di un abbonamento esistente viene registrata in automatico una riga in
  `price_changes`, che alimenta lo storico prezzi e il calcolo del totale speso.
