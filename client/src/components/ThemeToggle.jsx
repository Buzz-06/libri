import { useEffect, useState } from "react";

function getInitialTheme() {
  try {
    const stored = localStorage.getItem("libri-theme");
    if (stored) return stored;
  } catch {
    // ignore storage access issues (private mode, etc.)
  }
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    try {
      localStorage.setItem("libri-theme", theme);
    } catch {
      // ignore
    }
  }, [theme]);

  return (
    <button
      type="button"
      onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
      aria-label="Cambia tema"
      title="Cambia tema chiaro/scuro"
      className="rounded-full border border-stone-300 p-2 text-sm transition hover:bg-stone-100 dark:border-stone-700 dark:hover:bg-stone-800"
    >
      {theme === "dark" ? "☀️" : "🌙"}
    </button>
  );
}
