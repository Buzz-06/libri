import { useState } from "react";
import { api } from "../lib/api.js";
import BookCover from "./BookCover.jsx";

// Ricerca di nuovi libri per titolo/autore, senza bisogno di caricare
// nessuna foto: utile per trovare la propria edizione anche solo scrivendo
// il titolo.
export default function SearchLookup({ onFound }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");

  const runSearch = async (e) => {
    e?.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError("");
    try {
      const data = await api.searchBooks(query.trim());
      setResults(data);
      setSearched(true);
    } catch (err) {
      setError(err.message || "Ricerca non riuscita");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={runSearch} className="flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cerca per titolo o autore…"
          className="flex-1 rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm outline-none ring-emerald-500/40 focus:ring-2 dark:border-stone-700 dark:bg-stone-900"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:opacity-60 dark:bg-stone-100 dark:text-stone-900"
        >
          {loading ? "Cerco…" : "Cerca"}
        </button>
      </form>

      {error && <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>}

      {searched && !loading && results.length === 0 && !error && (
        <p className="text-sm text-stone-500 dark:text-stone-400">Nessun libro trovato per "{query}".</p>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {results.map((book) => (
          <div
            key={book.externalId}
            className="flex gap-3 rounded-xl border border-stone-200 bg-white p-3 shadow-sm dark:border-stone-800 dark:bg-stone-900"
          >
            <BookCover src={book.coverUrl} title={book.title} className="w-16" />
            <div className="flex min-w-0 flex-1 flex-col">
              <h4 className="line-clamp-2 text-sm font-semibold">{book.title}</h4>
              <p className="line-clamp-1 text-xs text-stone-500 dark:text-stone-400">{book.author}</p>
              <p className="mt-0.5 text-[11px] text-stone-400">
                {book.pageCount ? `${book.pageCount} pagine` : "N. pagine sconosciuto"}
                {book.publishedDate ? ` · ${book.publishedDate.slice(0, 4)}` : ""}
              </p>
              <div className="mt-auto flex gap-1.5 pt-2">
                <button
                  onClick={() =>
                    onFound({
                      title: book.title,
                      author: book.author,
                      isbn: book.isbn,
                      cover_url: book.coverUrl,
                      page_count: book.pageCount,
                      publisher: book.publisher,
                      published_date: book.publishedDate,
                      source: "google",
                      external_id: book.externalId,
                      status: "want",
                    })
                  }
                  className="rounded-full border border-stone-300 px-2.5 py-1 text-[11px] font-semibold hover:bg-stone-50 dark:border-stone-700 dark:hover:bg-stone-800"
                >
                  + Da leggere
                </button>
                <button
                  onClick={() =>
                    onFound({
                      title: book.title,
                      author: book.author,
                      isbn: book.isbn,
                      cover_url: book.coverUrl,
                      page_count: book.pageCount,
                      publisher: book.publisher,
                      published_date: book.publishedDate,
                      source: "google",
                      external_id: book.externalId,
                      status: "reading",
                    })
                  }
                  className="rounded-full bg-emerald-600 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-emerald-700"
                >
                  + In lettura
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
