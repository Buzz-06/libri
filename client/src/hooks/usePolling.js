import { useEffect, useRef } from "react";

// Richiama `callback` subito e poi ogni `intervalMs`, così le viste restano
// aggiornate "in tempo reale" senza bisogno di ricaricare la pagina.
// Si ricollega anche quando la scheda torna visibile/attiva.
export function usePolling(callback, intervalMs = 15000, deps = []) {
  const savedCallback = useRef(callback);
  savedCallback.current = callback;

  useEffect(() => {
    let cancelled = false;
    const tick = () => {
      if (!cancelled) savedCallback.current();
    };

    tick();
    const id = setInterval(tick, intervalMs);

    const onFocus = () => tick();
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);

    return () => {
      cancelled = true;
      clearInterval(id);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intervalMs, ...deps]);
}
