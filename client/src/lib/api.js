const BASE = "/api";

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: options.body instanceof FormData ? undefined : { "Content-Type": "application/json" },
    ...options,
  });
  if (res.status === 204) return null;
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(data?.error || `Errore ${res.status}`);
  }
  return data;
}

export const api = {
  // Libreria personale
  listBooks: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/books${qs ? `?${qs}` : ""}`);
  },
  getBook: (id) => request(`/books/${id}`),
  getProgress: (id) => request(`/books/${id}/progress`),
  createBook: (payload) => request("/books", { method: "POST", body: JSON.stringify(payload) }),
  updateBook: (id, payload) =>
    request(`/books/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
  deleteBook: (id) => request(`/books/${id}`, { method: "DELETE" }),

  // Ricerca nuovi libri / edizioni
  searchBooks: (q) => request(`/search/books?q=${encodeURIComponent(q)}`),
  lookupIsbn: (isbn) => request(`/search/isbn/${encodeURIComponent(isbn)}`),
  officialReviews: (externalId) => request(`/search/reviews/${encodeURIComponent(externalId)}`),

  // Upload della foto della propria edizione
  uploadPhoto: async (file) => {
    const form = new FormData();
    form.append("photo", file);
    return request("/upload", { method: "POST", body: form });
  },
};
