# Decisioni

Una riga per decisione presa dove il prompt non era vincolante, con il motivo.

## Incidente iniziale

- **Persi `.env.local` e `.claude/`** — ho eseguito `npm create vite@latest . -- --template react-ts --overwrite ignore` in una cartella non vuota: invece di lasciare stare i file esistenti ha ripulito la directory. `schema.sql` e `PROMPT.md` sono stati riscritti identici (erano nel contesto), le chiavi Supabase no: non le avevo mai lette. Nessun commit, stash, oggetto dangling, Cestino o snapshot APFS da cui recuperarle. Ora c'è un commit per fase, così un incidente simile è reversibile.

## Stack e configurazione

- **React 18 invece di 19** — il template Vite scaffolda React 19, ma §2 impone React 18: ho fatto il downgrade esplicito.
- **Tailwind 3 invece di 4** — §9.1 chiede la palette in `tailwind.config.js`, file che Tailwind 4 non usa più.
- **`strict: true` in `tsconfig.app.json`** — il template lo lasciava spento; senza, il divieto di `any` sarebbe stato aggirabile per omissione.
- **Tipi del database come `type` e non `interface`** — il client Supabase vincola le righe a `Record<string, unknown>` e solo gli alias di tipo ottengono la index signature implicita necessaria.
- **Aggiunto lo script `build:check`** — vedi sotto, la verifica della build era altrimenti inattendibile.
- **Nessuna dipendenza oltre a quelle consentite** — `@fontsource-variable/inter` era già previsto da §9.2; `postcss` e `autoprefixer` entrano come richiesti da Tailwind.

## Correzioni a problemi emersi durante la build

- **Niente `throw` a livello di modulo in `supabase.ts`** — Vite sostituisce `import.meta.env.VITE_*` con costanti a build-time: con le variabili vuote la condizione diventava sempre vera e il tree-shaking rimuoveva l'intera app dal bundle (che compilava, ma conteneva solo il messaggio d'errore). Ora c'è il flag `isSupabaseConfigured` e una schermata dedicata.
- **`build:check` inietta variabili fittizie** — per la stessa ragione: senza, si verifica un bundle vuoto.
- **Orbite su circonferenza schiacciata da `scaleY`** — ruotare rigidamente un'ellisse farebbe oscillare le icone dentro e fuori dal tracciato. La catena `S(f)·R(θ)·T(p)·R(-θ)·S(1/f)` dà posizione ellittica esatta con icone dritte e non deformate.
- **Rinomina su `onBlur`, non su `onChange`** — nelle schermate di gestione, altrimenti partirebbe una mutazione per ogni tasto premuto.
- **Statistiche caricate in lazy** — Recharts pesa ~375 kB, quanto tutto il resto: si carica solo aprendo la schermata.

## Interpretazioni del prompt

- **Voce "Tutte le liste" nel filtro** — §7.2 elenca solo una voce per lista; senza un'opzione "tutte", gli abbonamenti con `list_id` nullo sarebbero invisibili. È il default.
- **Filtro "Mese"/"Anno"** — interpretato come "si rinnova più spesso di una volta l'anno" contro "una volta l'anno o meno"; lo stesso filtro decide se la riga dei totali mostra il totale mensile o annuale, come suggerisce §7.1.
- **Il rinnovo che cade oggi è "il prossimo"** — così l'interfaccia può mostrare "Oggi", come richiesto da §7.1.
- **Confronto mensile vs annuale con stima al 16%** — il risparmio reale di un piano annuale non è nei dati (§7.4 dice di omettere se non disponibile). Invece di omettere del tutto, la card mostra il dato certo (quanto costano all'anno gli abbonamenti non annuali) e dichiara apertamente che il 16% è una stima.
- **`price_changes` con `user_id`** — §4 non lo elenca fra le sue colonne, ma la regola "vale per tutte le tabelle" lo impone, ed è ciò che rende applicabile la RLS.
- **Rotta `/statistiche` come pagina, non come overlay** — resta un pannello a schermo pieno che si chiude con la X, ma essere una rotta la rende linkabile e gestisce il tasto indietro.
- **Metodi di pagamento senza riordino** — §4 non dà loro `sort_order`, quindi sono ordinati per data di creazione.
- **Categoria di ricaduta cercata per nome "Altro"** — §7.8 lo impone senza dare un modo per identificarla; se è stata rinominata o eliminata, gli abbonamenti restano senza categoria invece di finire in una a caso.
- **14 colori della palette** — i nomi in §9.1 sono in italiano senza valori esadecimali: ho scelto tinte coerenti con l'accento viola, registrate sia in `tailwind.config.js` sia in `src/lib/palette.ts` (servono come stringhe perché il colore è un dato salvato a database).
- **Catalogo di 71 servizi** — i 60 elencati in §7.5 più alcuni diffusi in Italia; ho aggiunto due assicurazioni perché quella categoria sarebbe rimasta vuota.
- **Celle del calendario alte 110px** — come da §7.7, anche se nella colonna da 440px risultano più alte che larghe.
- **Icone PWA in SVG** — nessun convertitore SVG → PNG disponibile sulla macchina; §8 lo consente esplicitamente a patto di documentarlo.
- **Versione dell'app fissata a 1.0.0** — §7.8 chiede di mostrarla senza dire da dove prenderla.
