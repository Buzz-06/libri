import { NavLink } from "react-router-dom";
import ThemeToggle from "./ThemeToggle.jsx";

const links = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/libreria", label: "Libreria" },
  { to: "/cerca", label: "Aggiungi un libro" },
];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-stone-200 bg-stone-50/90 backdrop-blur dark:border-stone-800 dark:bg-stone-950/90">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <NavLink to="/" className="flex items-center gap-2 text-lg font-bold tracking-tight">
          <span className="text-2xl">📚</span>
          <span className="font-serif-display">Libri</span>
        </NavLink>
        <nav className="flex items-center gap-1 sm:gap-2">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `rounded-full px-3 py-1.5 text-sm font-medium transition ${
                  isActive
                    ? "bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900"
                    : "text-stone-600 hover:bg-stone-200/70 dark:text-stone-300 dark:hover:bg-stone-800"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
