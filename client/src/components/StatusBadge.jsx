const CONFIG = {
  want: { label: "Da leggere", classes: "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300" },
  reading: {
    label: "In lettura",
    classes: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  },
  read: {
    label: "Letto",
    classes: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  },
};

export default function StatusBadge({ status }) {
  const cfg = CONFIG[status] || CONFIG.want;
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${cfg.classes}`}>
      {cfg.label}
    </span>
  );
}
