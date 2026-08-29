import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api.js";
import { usePolling } from "../hooks/usePolling.js";
import BookCard from "../components/BookCard.jsx";

const TABS = [
  { key: "reading", label: "In lettura" },
  { key: "want", label: "Da leggere" },
  { key: "read", label: "Letti" },
  { key: "all", label: "Tutti" },
];

export default function Library() {
  const [tab, setTab] = useState("reading");
  const [query, setQuery] = useState("");
  const [books, setBooks] = useState([]);

  usePolling(
    async () => {
      const params = query.trim() ? { q: query.trim() } : tab === "all" ? {} : { status: tab };
      const data = await api.listBooks(params);
      setBooks(data);
    },
    20000,
    [tab, query]
  );

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif-display text-2xl font-bold sm:text-3xl">La tua libreria</h1>
        <Link
          to="/cerca"
          className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
        >
          + Aggiungi un libro
        </Link>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 rounded-full bg-stone-200/70 p-1 dark:bg-stone-900">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                tab === t.key
                  ? "bg-white text-stone-900 shadow-sm dark:bg-stone-100"
                  : "text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filtra la tua libreria…"
          className="w-full max-w-xs rounded-full border border-stone-300 bg-white px-4 py-1.5 text-sm outline-none ring-emerald-500/40 focus:ring-2 dark:border-stone-700 dark:bg-stone-900"
        />
      </div>

      {books.length === 0 ? (
        <div className="rounded-xl border border-dashed border-stone-300 bg-white p-8 text-center text-sm text-stone-500 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-400">
          Nessun libro qui per ora.{" "}
          <Link to="/cerca" className="font-semibold text-emerald-700 hover:underline dark:text-emerald-400">
            Aggiungine uno
          </Link>
          .
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {books.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      )}
    </div>
  );
}
