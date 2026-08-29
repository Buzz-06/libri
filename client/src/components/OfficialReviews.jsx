import { useEffect, useState } from "react";
import { api } from "../lib/api.js";

export default function OfficialReviews({ externalId }) {
  const [state, setState] = useState({ loading: true, data: null, error: null });

  useEffect(() => {
    if (!externalId) {
      setState({ loading: false, data: null, error: null });
      return;
    }
    let cancelled = false;
    setState({ loading: true, data: null, error: null });
    api
      .officialReviews(externalId)
      .then((data) => !cancelled && setState({ loading: false, data, error: null }))
      .catch((err) => !cancelled && setState({ loading: false, data: null, error: err.message }));
    return () => {
      cancelled = true;
    };
  }, [externalId]);

  if (!externalId) {
    return (
      <section>
        <h3 className="mb-2 font-serif-display text-base font-semibold">Recensioni ufficiali</h3>
        <p className="text-sm text-stone-500 dark:text-stone-400">
          Questo libro è stato aggiunto manualmente, quindi non è collegato a un catalogo per mostrare
          recensioni ufficiali.
        </p>
      </section>
    );
  }

  if (state.loading) {
    return (
      <section>
        <h3 className="mb-2 font-serif-display text-base font-semibold">Recensioni ufficiali</h3>
        <div className="h-20 animate-pulse rounded-xl bg-stone-100 dark:bg-stone-900" />
      </section>
    );
  }

  if (state.error || !state.data) {
    return (
      <section>
        <h3 className="mb-2 font-serif-display text-base font-semibold">Recensioni ufficiali</h3>
        <p className="text-sm text-stone-500 dark:text-stone-400">
          Recensioni non disponibili al momento.
        </p>
      </section>
    );
  }

  const { averageRating, ratingsCount, description, infoLink, canonicalVolumeLink } = state.data;

  return (
    <section>
      <h3 className="mb-2 font-serif-display text-base font-semibold">Recensioni ufficiali</h3>
      <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm dark:border-stone-800 dark:bg-stone-900">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400">
            Fonte: Google Books
          </span>
          {averageRating ? (
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-amber-600 dark:text-amber-400">
              ★ {averageRating.toFixed(1)}{" "}
              <span className="font-normal text-stone-500 dark:text-stone-400">
                ({ratingsCount ?? 0} valutazioni)
              </span>
            </span>
          ) : (
            <span className="text-sm text-stone-500 dark:text-stone-400">Nessuna valutazione disponibile</span>
          )}
        </div>
        {description ? (
          <p className="mt-3 line-clamp-6 text-sm text-stone-600 dark:text-stone-300">{description}</p>
        ) : null}
        {(infoLink || canonicalVolumeLink) && (
          <a
            href={canonicalVolumeLink || infoLink}
            target="_blank"
            rel="noreferrer noopener"
            className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-emerald-700 hover:underline dark:text-emerald-400"
          >
            Leggi altre recensioni su Google Books ↗
          </a>
        )}
      </div>
    </section>
  );
}
