import { useEffect, useRef, useState } from "react";
import { api } from "../lib/api.js";
import BookCover from "./BookCover.jsx";

// Carica la foto della propria edizione: prova a leggere il codice a barre
// ISBN direttamente dall'immagine (lato client, nessun upload necessario per
// la scansione) e recupera così il numero esatto di pagine di QUELLA edizione.
// La foto stessa può poi essere usata come copertina del libro in libreria.
export default function PhotoLookup({ onFound }) {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | scanning | found | not-found | error
  const [manualIsbn, setManualIsbn] = useState("");
  const [match, setMatch] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const readerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const runScan = async (url) => {
    setStatus("scanning");
    setMatch(null);
    setErrorMsg("");
    try {
      if (!readerRef.current) {
        // Caricato a richiesta: la libreria di scansione è pesante e serve
        // solo a chi sceglie effettivamente di caricare una foto.
        const { BrowserMultiFormatReader } = await import("@zxing/browser");
        readerRef.current = new BrowserMultiFormatReader();
      }
      const result = await readerRef.current.decodeFromImageUrl(url);
      const code = result.getText();
      await lookup(code);
    } catch {
      setStatus("not-found");
    }
  };

  const lookup = async (isbn) => {
    try {
      setStatus("scanning");
      const found = await api.lookupIsbn(isbn);
      setMatch(found);
      setStatus("found");
    } catch (err) {
      setErrorMsg(err.message || "ISBN non trovato in nessun catalogo");
      setStatus("not-found");
    }
  };

  const handleFile = (f) => {
    if (!f) return;
    setFile(f);
    const url = URL.createObjectURL(f);
    setPreviewUrl(url);
    runScan(url);
  };

  const handleAdd = async (status) => {
    if (!match) return;
    let cover_url = match.coverUrl;
    // Se c'è una foto caricata, usiamola come copertina reale della propria edizione.
    if (file) {
      try {
        const uploaded = await api.uploadPhoto(file);
        cover_url = uploaded.url;
      } catch {
        // in caso di errore di upload, si usa comunque la copertina del catalogo
      }
    }
    onFound({
      title: match.title,
      author: match.author,
      isbn: match.isbn,
      cover_url,
      page_count: match.pageCount,
      publisher: match.publisher,
      published_date: match.publishedDate,
      source: "photo",
      external_id: match.externalId,
      status,
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-stone-300 bg-white p-6 text-center transition hover:border-emerald-400 dark:border-stone-700 dark:bg-stone-900">
        <span className="text-3xl">📷</span>
        <span className="text-sm font-medium text-stone-600 dark:text-stone-300">
          {file ? "Cambia foto" : "Carica la foto della tua edizione"}
        </span>
        <span className="text-xs text-stone-400">
          Inquadra bene il codice a barre ISBN sul retro del libro
        </span>
        <input
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </label>

      {previewUrl && (
        <div className="flex items-center gap-4">
          <img src={previewUrl} alt="Anteprima copertina" className="h-32 w-24 rounded-lg object-cover shadow" />
          <div className="flex-1 text-sm">
            {status === "scanning" && (
              <p className="text-stone-500 dark:text-stone-400">🔍 Scansione del codice a barre in corso…</p>
            )}
            {status === "not-found" && (
              <div className="space-y-2">
                <p className="text-amber-700 dark:text-amber-400">
                  Non ho trovato un codice a barre leggibile{errorMsg ? `: ${errorMsg}` : ""}.
                </p>
                <p className="text-stone-500 dark:text-stone-400">
                  Puoi inserire l'ISBN manualmente oppure usare la ricerca per titolo/autore.
                </p>
                <div className="flex gap-2">
                  <input
                    value={manualIsbn}
                    onChange={(e) => setManualIsbn(e.target.value)}
                    placeholder="Es. 9788804668237"
                    className="flex-1 rounded-lg border border-stone-300 bg-stone-50 px-3 py-1.5 text-sm outline-none ring-emerald-500/40 focus:ring-2 dark:border-stone-700 dark:bg-stone-950"
                  />
                  <button
                    type="button"
                    onClick={() => manualIsbn.trim() && lookup(manualIsbn.trim())}
                    className="rounded-lg bg-stone-900 px-3 py-1.5 text-sm font-semibold text-white dark:bg-stone-100 dark:text-stone-900"
                  >
                    Cerca
                  </button>
                </div>
              </div>
            )}
            {status === "found" && match && (
              <p className="text-emerald-700 dark:text-emerald-400">
                Edizione trovata: <strong>{match.pageCount ?? "?"} pagine</strong>
              </p>
            )}
          </div>
        </div>
      )}

      {status === "found" && match && (
        <div className="flex items-start gap-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-950/40">
          <BookCover src={match.coverUrl} title={match.title} className="w-20" />
          <div className="flex-1">
            <h4 className="font-serif-display text-base font-semibold">{match.title}</h4>
            <p className="text-sm text-stone-600 dark:text-stone-400">{match.author}</p>
            <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
              {match.publisher ? `${match.publisher} · ` : ""}
              {match.pageCount ? `${match.pageCount} pagine` : "N. pagine non disponibile"}
            </p>
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => handleAdd("want")}
                className="rounded-full border border-stone-300 px-3 py-1.5 text-xs font-semibold hover:bg-white dark:border-stone-700 dark:hover:bg-stone-800"
              >
                + Da leggere
              </button>
              <button
                onClick={() => handleAdd("reading")}
                className="rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
              >
                + Sto leggendo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
