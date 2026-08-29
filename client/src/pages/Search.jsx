import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api.js";
import { useToast } from "../context/ToastContext.jsx";
import SearchLookup from "../components/SearchLookup.jsx";
import PhotoLookup from "../components/PhotoLookup.jsx";

const TABS = [
  { key: "search", label: "🔎 Cerca titolo/autore" },
  { key: "photo", label: "📷 Carica la foto dell'edizione" },
];

export default function Search() {
  const [tab, setTab] = useState("search");
  const [adding, setAdding] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleFound = async (payload) => {
    setAdding(true);
    try {
      const book = await api.createBook(payload);
      showToast(`"${book.title}" aggiunto alla libreria ✓`, { type: "success" });
      navigate(`/libro/${book.id}`);
    } catch (err) {
      showToast(err.message || "Impossibile aggiungere il libro", { type: "error" });
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8 sm:px-6">
      <div>
        <h1 className="font-serif-display text-2xl font-bold sm:text-3xl">Aggiungi un libro</h1>
        <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
          Cerca un nuovo libro da leggere, oppure carica la foto della tua edizione per trovare il
          numero esatto di pagine: la scelta è tua, la foto non è obbligatoria.
        </p>
      </div>

      <div className="flex gap-1 rounded-full bg-stone-200/70 p-1 dark:bg-stone-900">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 rounded-full px-3 py-2 text-sm font-medium transition ${
              tab === t.key
                ? "bg-white text-stone-900 shadow-sm dark:bg-stone-100"
                : "text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {adding && (
        <p className="text-sm text-emerald-700 dark:text-emerald-400">Aggiungo il libro alla libreria…</p>
      )}

      {tab === "search" ? <SearchLookup onFound={handleFound} /> : <PhotoLookup onFound={handleFound} />}
    </div>
  );
}
