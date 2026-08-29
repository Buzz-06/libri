import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../lib/api.js";
import { useToast } from "../context/ToastContext.jsx";
import { usePolling } from "../hooks/usePolling.js";
import BookCover from "../components/BookCover.jsx";
import ProgressBar from "../components/ProgressBar.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import ReviewBanner from "../components/ReviewBanner.jsx";
import OfficialReviews from "../components/OfficialReviews.jsx";

const STATUS_OPTIONS = [
  { key: "want", label: "Da leggere" },
  { key: "reading", label: "In lettura" },
  { key: "read", label: "Letto" },
];

export default function BookDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [book, setBook] = useState(null);
  const [pageInput, setPageInput] = useState("");
  const [notFound, setNotFound] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await api.getBook(id);
      setBook(data);
      setPageInput(String(data.current_page ?? 0));
    } catch {
      setNotFound(true);
    }
  }, [id]);

  usePolling(load, 15000, [id]);

  useEffect(() => {
    setNotFound(false);
  }, [id]);

  const patch = async (payload, successMessage) => {
    try {
      const updated = await api.updateBook(id, payload);
      setBook(updated);
      if (successMessage) showToast(successMessage, { type: "success" });
      return updated;
    } catch (err) {
      showToast(err.message || "Aggiornamento non riuscito", { type: "error" });
      throw err;
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Rimuovere "${book.title}" dalla libreria?`)) return;
    try {
      await api.deleteBook(id);
      showToast("Libro rimosso dalla libreria", { type: "success" });
      navigate("/libreria");
    } catch (err) {
      showToast(err.message || "Impossibile rimuovere il libro", { type: "error" });
    }
  };

  const commitPage = () => {
    const page = Math.max(0, Number(pageInput) || 0);
    patch({ current_page: page });
  };

  if (notFound) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-lg font-semibold">Libro non trovato.</p>
        <button onClick={() => navigate("/libreria")} className="mt-3 text-emerald-700 hover:underline dark:text-emerald-400">
          Torna alla libreria
        </button>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="h-64 animate-pulse rounded-xl bg-stone-100 dark:bg-stone-900" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-8 sm:px-6">
      <div className="grid grid-cols-[auto_1fr] gap-5 sm:grid-cols-[160px_1fr]">
        <BookCover src={book.cover_url} title={book.title} className="w-28 sm:w-40" />
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h1 className="font-serif-display text-xl font-bold sm:text-2xl">{book.title}</h1>
              <p className="text-sm text-stone-500 dark:text-stone-400">{book.author}</p>
            </div>
            <StatusBadge status={book.status} />
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-stone-500 dark:text-stone-400">
            {book.publisher && <span>{book.publisher}</span>}
            {book.published_date && <span>{book.published_date}</span>}
            {book.isbn && <span>ISBN {book.isbn}</span>}
          </div>

          <div className="mt-2 flex flex-wrap gap-1.5">
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                onClick={() => patch({ status: opt.key }, `Stato aggiornato: ${opt.label}`)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                  book.status === opt.key
                    ? "bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900"
                    : "border border-stone-300 text-stone-600 hover:bg-stone-100 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800"
                }`}
              >
                {opt.label}
              </button>
            ))}
            <button
              onClick={handleDelete}
              className="ml-auto rounded-full border border-rose-200 px-3 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:border-rose-900 dark:text-rose-400 dark:hover:bg-rose-950/40"
            >
              Rimuovi
            </button>
          </div>
        </div>
      </div>

      <section className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm dark:border-stone-800 dark:bg-stone-900">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-serif-display text-base font-semibold">Progresso di lettura</h2>
          <span className="text-sm font-semibold tabular-nums text-emerald-700 dark:text-emerald-400">
            {book.progress_percent ?? 0}%
          </span>
        </div>
        <ProgressBar percent={book.progress_percent ?? 0} className="h-3" />
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm">
            Pagina attuale
            <input
              type="number"
              min={0}
              max={book.page_count || undefined}
              value={pageInput}
              onChange={(e) => setPageInput(e.target.value)}
              onBlur={commitPage}
              onKeyDown={(e) => e.key === "Enter" && commitPage()}
              className="w-24 rounded-lg border border-stone-300 bg-stone-50 px-2 py-1 text-sm outline-none ring-emerald-500/40 focus:ring-2 dark:border-stone-700 dark:bg-stone-950"
            />
          </label>
          {book.page_count ? (
            <input
              type="range"
              min={0}
              max={book.page_count}
              value={Math.min(Number(pageInput) || 0, book.page_count)}
              onChange={(e) => setPageInput(e.target.value)}
              onMouseUp={commitPage}
              onTouchEnd={commitPage}
              className="min-w-[140px] flex-1 accent-emerald-600"
            />
          ) : (
            <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400">
              Numero di pagine sconosciuto —
              <input
                type="number"
                min={1}
                placeholder="es. 320"
                className="w-20 rounded-lg border border-stone-300 bg-stone-50 px-2 py-1 text-xs outline-none ring-emerald-500/40 focus:ring-2 dark:border-stone-700 dark:bg-stone-950"
                onBlur={(e) => {
                  if (e.target.value) patch({ page_count: Number(e.target.value) }, "Numero di pagine salvato");
                }}
              />
              imposta il totale
            </div>
          )}
        </div>
        <p className="mt-2 text-xs text-stone-400">
          Pagina {book.current_page}
          {book.page_count ? ` di ${book.page_count}` : ""} · si aggiorna in tempo reale
        </p>
      </section>

      <ReviewBanner book={book} onSave={(payload) => patch(payload)} />

      <OfficialReviews externalId={book.external_id} />
    </div>
  );
}
