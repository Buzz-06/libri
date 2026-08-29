import { Link } from "react-router-dom";
import BookCover from "./BookCover.jsx";
import ProgressBar from "./ProgressBar.jsx";
import StatusBadge from "./StatusBadge.jsx";
import Rating from "./Rating.jsx";

export default function BookCard({ book }) {
  return (
    <Link
      to={`/libro/${book.id}`}
      className="group flex flex-col gap-2 rounded-xl border border-stone-200 bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-stone-800 dark:bg-stone-900"
    >
      <BookCover src={book.cover_url} title={book.title} />
      <div className="flex items-start justify-between gap-2">
        <h3 className="line-clamp-2 font-serif-display text-sm font-semibold leading-snug text-stone-900 dark:text-stone-100">
          {book.title}
        </h3>
      </div>
      <p className="line-clamp-1 text-xs text-stone-500 dark:text-stone-400">{book.author}</p>
      <div className="mt-auto flex flex-col gap-1.5">
        {book.rating ? <Rating value={book.rating} readOnly size="text-xs" /> : null}
        <div className="flex items-center justify-between">
          <StatusBadge status={book.status} />
          {book.page_count ? (
            <span className="text-[11px] text-stone-500 dark:text-stone-400">{book.page_count} pag.</span>
          ) : null}
        </div>
        {book.status === "reading" && book.page_count ? (
          <div className="flex items-center gap-2">
            <ProgressBar percent={book.progress_percent} />
            <span className="w-9 shrink-0 text-right text-[11px] tabular-nums text-stone-500 dark:text-stone-400">
              {book.progress_percent}%
            </span>
          </div>
        ) : null}
      </div>
    </Link>
  );
}
