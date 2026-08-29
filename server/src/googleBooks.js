// Thin client around the public Google Books API.
// No API key is required for read-only volume lookups/searches, which keeps
// setup zero-config. If you hit rate limits, set GOOGLE_BOOKS_API_KEY in the
// environment and it will be appended automatically.
const BASE = "https://www.googleapis.com/books/v1/volumes";
const API_KEY = process.env.GOOGLE_BOOKS_API_KEY;

function withKey(url) {
  if (!API_KEY) return url;
  const u = new URL(url);
  u.searchParams.set("key", API_KEY);
  return u.toString();
}

function stripHtml(html) {
  if (!html) return null;
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .trim();
}

function normalizeVolume(item) {
  const info = item.volumeInfo || {};
  const isbn13 = info.industryIdentifiers?.find((i) => i.type === "ISBN_13")?.identifier;
  const isbn10 = info.industryIdentifiers?.find((i) => i.type === "ISBN_10")?.identifier;
  return {
    externalId: item.id,
    title: info.title || "Titolo sconosciuto",
    subtitle: info.subtitle || null,
    author: info.authors?.join(", ") || "Autore sconosciuto",
    isbn: isbn13 || isbn10 || null,
    coverUrl: info.imageLinks?.thumbnail?.replace("http://", "https://") || null,
    pageCount: info.pageCount || null,
    publisher: info.publisher || null,
    publishedDate: info.publishedDate || null,
    description: stripHtml(info.description),
    categories: info.categories || [],
    language: info.language || null,
  };
}

export async function searchVolumes(query, maxResults = 20) {
  const url = withKey(`${BASE}?q=${encodeURIComponent(query)}&maxResults=${maxResults}`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Google Books search failed: ${res.status}`);
  const data = await res.json();
  return (data.items || []).map(normalizeVolume);
}

export async function lookupByIsbn(isbn) {
  const clean = String(isbn).replace(/[^0-9Xx]/g, "");
  const url = withKey(`${BASE}?q=isbn:${clean}`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Google Books ISBN lookup failed: ${res.status}`);
  const data = await res.json();
  const items = (data.items || []).map(normalizeVolume);
  return items[0] || null;
}

export async function getOfficialReviewInfo(externalId) {
  const url = withKey(`${BASE}/${encodeURIComponent(externalId)}`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Google Books volume lookup failed: ${res.status}`);
  const item = await res.json();
  const info = item.volumeInfo || {};
  const sale = item.saleInfo || {};
  return {
    averageRating: info.averageRating ?? null,
    ratingsCount: info.ratingsCount ?? null,
    description: stripHtml(info.description),
    infoLink: info.infoLink || null,
    previewLink: info.previewLink || null,
    canonicalVolumeLink: info.canonicalVolumeLink || info.infoLink || null,
    buyLink: sale.buyLink || null,
    source: "Google Books",
  };
}
