export default function Rating({ value = 0, onChange, readOnly = false, size = "text-lg" }) {
  const stars = [1, 2, 3, 4, 5];
  return (
    <div className={`flex items-center gap-0.5 ${size}`} role={readOnly ? undefined : "radiogroup"}>
      {stars.map((star) => {
        const filled = star <= (value || 0);
        if (readOnly) {
          return (
            <span key={star} className={filled ? "text-amber-500" : "text-stone-300 dark:text-stone-700"}>
              ★
            </span>
          );
        }
        return (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={filled}
            aria-label={`${star} stelle`}
            onClick={() => onChange?.(star === value ? null : star)}
            className={`transition hover:scale-110 ${
              filled ? "text-amber-500" : "text-stone-300 hover:text-amber-300 dark:text-stone-700"
            }`}
          >
            ★
          </button>
        );
      })}
    </div>
  );
}
