# 📚 Libri

Un sito per tenere traccia **in tempo reale** dei libri che stai leggendo e di quelli che vuoi leggere.

## Funzionalità

- **Dashboard in tempo reale**: vedi a colpo d'occhio le letture in corso, con percentuale di
  avanzamento aggiornata automaticamente (polling ogni 12-20s + refresh quando torni sulla scheda).
- **Aggiungi libri in due modi**:
  - 🔎 **Cerca per titolo/autore**, senza bisogno di nessuna foto.
  - 📷 **Carica la foto della tua edizione**: il sito legge il codice a barre ISBN direttamente
    dall'immagine (nel browser, con [@zxing/browser](https://github.com/zxing-js/browser)) e
    recupera il numero **esatto** di pagine di quella specifica edizione tramite l'API pubblica
    di Google Books. Se il codice a barre non si legge bene, puoi inserire l'ISBN a mano o passare
    alla ricerca testuale.
- **Libreria personale** organizzata per stato: da leggere / in lettura / letti, con filtro di ricerca.
- **Progresso di lettura** modificabile con slider/numero di pagina: la percentuale e la dashboard
  si aggiornano subito.
- **Recensioni personali** con un banner "a scomparsa": puoi scrivere voto + testo, il banner di
  riepilogo si può chiudere (✕) e riaprire quando vuoi, e il salvataggio è confermato da un
  banner-toast che sparisce da solo dopo pochi secondi.
- **Recensioni ufficiali**: sotto ogni libro trovato tramite ricerca/foto vengono mostrate voto medio,
  numero di valutazioni e sinossi da **Google Books**, con link per leggere altre recensioni sulla
  fonte originale.

## Stack tecnico

- **Frontend**: React 19 + Vite + React Router + Tailwind CSS.
- **Backend**: Node.js + Express + SQLite (`better-sqlite3`), nessun servizio esterno da configurare.
- **Catalogo libri**: [Google Books API](https://developers.google.com/books) (pubblica, senza
  bisogno di API key per l'uso base).

## Avvio in locale

```bash
npm run install:all   # installa le dipendenze di server e client
npm run dev            # avvia backend (porta 4000) e frontend (porta 5173) insieme
```

Apri [http://localhost:5173](http://localhost:5173).

Il frontend in sviluppo inoltra automaticamente le chiamate `/api` e `/uploads` al backend
(vedi `client/vite.config.js`), quindi non serve configurare CORS manualmente in locale.

### Comandi separati

```bash
npm run dev:server   # solo backend
npm run dev:client   # solo frontend
```

### Build di produzione

```bash
npm run build          # genera client/dist
npm start               # avvia il backend Express (serve solo le API)
```

Per servire il frontend in produzione, punta un server statico (o lo stesso Express, aggiungendo
`express.static`) a `client/dist`, mantenendo il backend raggiungibile su `/api`.

### Variabili d'ambiente opzionali

- `PORT` — porta del backend (default `4000`).
- `GOOGLE_BOOKS_API_KEY` — se in produzione incontri limiti di quota sull'API pubblica di Google
  Books, imposta questa variabile con una tua API key.

## Struttura del progetto

```
libri/
├─ server/         API Express + SQLite
│  └─ src/
│     ├─ db.js             schema e connessione SQLite
│     ├─ googleBooks.js     client per l'API pubblica di Google Books
│     └─ routes/            /api/books, /api/search, /api/upload
└─ client/         App React (Vite + Tailwind)
   └─ src/
      ├─ pages/             Dashboard, Libreria, Aggiungi libro, Dettaglio libro
      └─ components/        card libro, banner recensione, scanner foto, ecc.
```
