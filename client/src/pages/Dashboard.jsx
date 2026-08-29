import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api.js";
import { usePolling } from "../hooks/usePolling.js";
import BookCover from "../components/BookCover.jsx";
import ProgressBar from "../components/ProgressBar.jsx";

function ReadingRow({ book }) {
  const pagesLeft = book.page_count ? Math.max(0, book.page_count - book.current_page) : null;
  return (
    <Link
      to={`/libro/${book.id}`}
      className="flex items-center gap-4 rounded-xl border border-stone-200 bg-white p-3 shadow-sm transition hover:shadow-md dark:border-stone-800 dark:bg-stone-900"
    >
      <BookCover src={book.cover_url} title={book.title} className="w-14" />
      <div className="min-w-0 flex-1">
        <h3 className="truncate font-serif-display text-sm font-semibold">{book.title}</h3>
        <p className="truncate text-xs text-stone-500 dark:text-stone-400">{book.author}</p>
        <div className="mt-2 flex items-center gap-2">
          <ProgressBar percent={book.progress_percent ?? 0} />
          <span className="w-10 shrink-0 text-right text-xs font-semibold tabular-nums text-stone-600 dark:text-stone-300">
            {book.progress_percent ?? 0}%
          </span>
        </div>
        <p className="mt-1 text-[11px] text-stone-400">
          pag. {book.current_page}
          {book.page_count ? ` di ${book.page_count}` : ""}
          {pagesLeft != null ? ` · ${pagesLeft} pagine rimanenti` : ""}
        </p>
      </div>
    </Link>
  );
}

export default function Dashboard() {
  const [reading, setReading] = useState([]);
  const [wantCount, setWantCount] = useState(0);
  const [readCount, setReadCount] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(null);

  usePolling(async () => {
    const [readingBooks, wantBooks, readBooks] = await Promise.all([
      api.listBooks({ status: "reading" }),
      api.listBooks({ status: "want" }),
      api.listBooks({ status: "read" }),
    ]);
    setReading(readingBooks);
    setWantCount(wantBooks.length);
    setReadCount(readBooks.length);
    setLastUpdated(new Date());
  }, 12000);

  const totalPagesToday = reading.reduce((sum, b) => sum + (b.current_page || 0), 0);

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif-display text-2xl font-bold sm:text-3xl">La tua lettura in tempo reale</h1>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
            Aggiornato automaticamente
            {lastUpdated ? ` alle ${lastUpdated.toLocaleTimeString("it-IT")}` : "…"}
          </p>
        </div>
        <Link
          to="/cerca"
          className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
        >
          + Aggiungi un libro
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <StatCard label="In lettura" value={reading.length} accent="text-amber-600 dark:text-amber-400" />
        <StatCard label="Da leggere" value={wantCount} accent="text-sky-600 dark:text-sky-400" />
        <StatCard label="Letti" value={readCount} accent="text-emerald-600 dark:text-emerald-400" />
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-serif-display text-lg font-semibold">Letture in corso</h2>
          {reading.length > 0 && (
            <span className="text-xs text-stone-400">{totalPagesToday} pagine totali lette finora</span>
          )}
        </div>
        {reading.length === 0 ? (
          <div className="rounded-xl border border-dashed border-stone-300 bg-white p-6 text-center text-sm text-stone-500 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-400">
            Nessun libro in lettura al momento.{" "}
            <Link to="/libreria" className="font-semibold text-emerald-700 hover:underline dark:text-emerald-400">
              Scegline uno dalla libreria
            </Link>{" "}
            per iniziare a monitorare i tuoi progressi.
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {reading.map((book) => (
              <ReadingRow key={book.id} book={book} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({ label, value, accent }) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-4 text-center shadow-sm dark:border-stone-800 dark:bg-stone-900">
      <p className={`text-2xl font-bold tabular-nums ${accent}`}>{value}</p>
      <p className="mt-0.5 text-xs font-medium text-stone-500 dark:text-stone-400">{label}</p>
    </div>
  );
}
