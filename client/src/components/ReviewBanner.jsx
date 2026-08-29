import { useEffect, useState } from "react";
import Rating from "./Rating.jsx";
import { useToast } from "../context/ToastContext.jsx";

// Recensione personale del libro, mostrata in un banner "a scomparsa":
// può essere chiuso con la ✕ (la preferenza resta salvata per libro) e,
// quando lo si riapre per modificarla, il salvataggio conferma con un
// banner-toast che scompare da solo dopo pochi secondi.
export default function ReviewBanner({ book, onSave }) {
  const { showToast } = useToast();
  const storageKey = `libri-review-dismissed-${book.id}`;
  const [dismissed, setDismissed] = useState(() => {
    try {
      return localStorage.getItem(storageKey) === "1";
    } catch {
      return false;
    }
  });
  const [editing, setEditing] = useState(false);
  const [rating, setRating] = useState(book.rating || null);
  const [text, setText] = useState(book.review_text || "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setRating(book.rating || null);
    setText(book.review_text || "");
  }, [book.rating, book.review_text]);

  const persistDismiss = (value) => {
    setDismissed(value);
    try {
      if (value) localStorage.setItem(storageKey, "1");
      else localStorage.removeItem(storageKey);
    } catch {
      // ignore
    }
  };

  const hasReview = Boolean(book.review_text || book.rating);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({ rating, review_text: text });
      setEditing(false);
      persistDismiss(false);
      showToast("Recensione salvata ✓", { type: "success" });
    } catch (err) {
      showToast(err.message || "Errore nel salvataggio della recensione", { type: "error" });
    } finally {
      setSaving(false);
    }
  };

  if (editing) {
    return (
      <div className="collapse-in rounded-xl border border-stone-200 bg-white p-4 shadow-sm dark:border-stone-800 dark:bg-stone-900">
        <h3 className="mb-2 font-serif-display text-base font-semibold">La tua recensione</h3>
        <Rating value={rating} onChange={setRating} size="text-2xl" />
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          placeholder="Cosa ne pensi di questo libro?"
          className="mt-3 w-full resize-none rounded-lg border border-stone-300 bg-stone-50 p-3 text-sm outline-none ring-emerald-500/40 focus:ring-2 dark:border-stone-700 dark:bg-stone-950"
        />
        <div className="mt-3 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => {
              setEditing(false);
              setRating(book.rating || null);
              setText(book.review_text || "");
            }}
            className="rounded-full px-4 py-1.5 text-sm font-medium text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800"
          >
            Annulla
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={handleSave}
            className="rounded-full bg-emerald-600 px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
          >
            {saving ? "Salvataggio…" : "Salva recensione"}
          </button>
        </div>
      </div>
    );
  }

  if (!hasReview) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="w-full rounded-xl border border-dashed border-stone-300 bg-white p-4 text-left text-sm font-medium text-stone-500 transition hover:border-emerald-400 hover:text-emerald-700 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-400 dark:hover:text-emerald-400"
      >
        ✎ Lascia una recensione per questo libro
      </button>
    );
  }

  if (dismissed) {
    return (
      <button
        type="button"
        onClick={() => persistDismiss(false)}
        className="text-xs font-medium text-stone-500 underline-offset-2 hover:underline dark:text-stone-400"
      >
        Mostra la tua recensione
      </button>
    );
  }

  return (
    <div className="collapse-in flex items-start justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 shadow-sm dark:border-amber-900 dark:bg-amber-950/40">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400">
            La tua recensione
          </span>
          {book.rating ? <Rating value={book.rating} readOnly size="text-sm" /> : null}
        </div>
        {book.review_text ? (
          <p className="mt-1 whitespace-pre-wrap text-sm text-stone-700 dark:text-stone-300">
            {book.review_text}
          </p>
        ) : null}
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="mt-2 text-xs font-semibold text-emerald-700 hover:underline dark:text-emerald-400"
        >
          Modifica
        </button>
      </div>
      <button
        type="button"
        onClick={() => persistDismiss(true)}
        aria-label="Nascondi banner recensione"
        title="Nascondi"
        className="shrink-0 rounded-full p-1 text-amber-700/70 transition hover:bg-amber-100 dark:text-amber-400/70 dark:hover:bg-amber-900/40"
      >
        ✕
      </button>
    </div>
  );
}
