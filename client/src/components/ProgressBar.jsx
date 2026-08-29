export default function ProgressBar({ percent = 0, className = "" }) {
  const safe = Math.max(0, Math.min(100, percent ?? 0));
  return (
    <div className={`h-2 w-full overflow-hidden rounded-full bg-stone-200 dark:bg-stone-800 ${className}`}>
      <div
        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-[width] duration-500 ease-out"
        style={{ width: `${safe}%` }}
      />
    </div>
  );
}
