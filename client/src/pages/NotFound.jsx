import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <p className="text-5xl">📕</p>
      <h1 className="mt-4 font-serif-display text-xl font-bold">Pagina non trovata</h1>
      <Link to="/" className="mt-3 inline-block text-emerald-700 hover:underline dark:text-emerald-400">
        Torna alla dashboard
      </Link>
    </div>
  );
}
