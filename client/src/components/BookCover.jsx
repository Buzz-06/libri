export default function BookCover({ src, title, className = "w-full" }) {
  if (src) {
    return (
      <img
        src={src}
        alt={`Copertina di ${title}`}
        className={`aspect-[2/3] rounded-lg object-cover shadow-sm ${className}`}
        loading="lazy"
      />
    );
  }
  return (
    <div
      className={`flex aspect-[2/3] flex-col items-center justify-center gap-1 rounded-lg bg-gradient-to-br from-stone-200 to-stone-300 p-2 text-center shadow-sm dark:from-stone-800 dark:to-stone-900 ${className}`}
    >
      <span className="text-2xl">📖</span>
      <span className="line-clamp-3 text-[11px] font-medium text-stone-600 dark:text-stone-400">{title}</span>
    </div>
  );
}
