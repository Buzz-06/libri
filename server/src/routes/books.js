import { Router } from "express";
import db from "../db.js";

const router = Router();

const ALLOWED_STATUS = new Set(["want", "reading", "read"]);

function serializeBook(row) {
  if (!row) return null;
  const progressPercent =
    row.page_count && row.page_count > 0
      ? Math.min(100, Math.round((row.current_page / row.page_count) * 100))
      : null;
  return { ...row, progress_percent: progressPercent };
}

// GET /api/books?status=reading
router.get("/", (req, res) => {
  const { status, q } = req.query;
  let rows;
  if (status && ALLOWED_STATUS.has(status)) {
    rows = db
      .prepare("SELECT * FROM books WHERE status = ? ORDER BY updated_at DESC")
      .all(status);
  } else if (q) {
    const like = `%${q}%`;
    rows = db
      .prepare(
        "SELECT * FROM books WHERE title LIKE ? OR author LIKE ? ORDER BY updated_at DESC"
      )
      .all(like, like);
  } else {
    rows = db.prepare("SELECT * FROM books ORDER BY updated_at DESC").all();
  }
  res.json(rows.map(serializeBook));
});

router.get("/:id", (req, res) => {
  const row = db.prepare("SELECT * FROM books WHERE id = ?").get(req.params.id);
  if (!row) return res.status(404).json({ error: "Libro non trovato" });
  res.json(serializeBook(row));
});

router.get("/:id/progress", (req, res) => {
  const rows = db
    .prepare("SELECT page, logged_at FROM progress_log WHERE book_id = ? ORDER BY logged_at ASC")
    .all(req.params.id);
  res.json(rows);
});

// POST /api/books - add a book (from search result, manual entry, or after a photo scan)
router.post("/", (req, res) => {
  const {
    title,
    author,
    isbn,
    cover_url,
    page_count,
    publisher,
    published_date,
    source,
    external_id,
    status,
  } = req.body || {};

  if (!title || !String(title).trim()) {
    return res.status(400).json({ error: "Il titolo è obbligatorio" });
  }

  const finalStatus = ALLOWED_STATUS.has(status) ? status : "want";
  const now = new Date().toISOString();

  const info = db
    .prepare(
      `INSERT INTO books
        (title, author, isbn, cover_url, page_count, publisher, published_date, source, external_id, status, started_at, created_at, updated_at)
       VALUES (@title, @author, @isbn, @cover_url, @page_count, @publisher, @published_date, @source, @external_id, @status, @started_at, @now, @now)`
    )
    .run({
      title: String(title).trim(),
      author: author || null,
      isbn: isbn || null,
      cover_url: cover_url || null,
      page_count: page_count ? Number(page_count) : null,
      publisher: publisher || null,
      published_date: published_date || null,
      source: source || "manual",
      external_id: external_id || null,
      status: finalStatus,
      started_at: finalStatus === "reading" ? now : null,
      now,
    });

  const book = db.prepare("SELECT * FROM books WHERE id = ?").get(info.lastInsertRowid);
  res.status(201).json(serializeBook(book));
});

// PATCH /api/books/:id - update status, progress, rating, review, cover, page count...
router.patch("/:id", (req, res) => {
  const existing = db.prepare("SELECT * FROM books WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Libro non trovato" });

  const fields = req.body || {};
  const now = new Date().toISOString();
  const next = { ...existing };

  if (fields.status !== undefined) {
    if (!ALLOWED_STATUS.has(fields.status)) {
      return res.status(400).json({ error: "Stato non valido" });
    }
    next.status = fields.status;
    if (fields.status === "reading" && !existing.started_at) next.started_at = now;
    if (fields.status === "read" && !existing.finished_at) next.finished_at = now;
    if (fields.status === "read" && existing.page_count) next.current_page = existing.page_count;
  }

  if (fields.current_page !== undefined) {
    const page = Math.max(0, Number(fields.current_page) || 0);
    next.current_page = page;
    db.prepare("INSERT INTO progress_log (book_id, page, logged_at) VALUES (?, ?, ?)").run(
      existing.id,
      page,
      now
    );
    // Auto-progress the status when it makes sense, without overriding an explicit choice above.
    if (fields.status === undefined) {
      if (page > 0 && existing.status === "want") next.status = "reading";
      if (existing.page_count && page >= existing.page_count) {
        next.status = "read";
        if (!existing.finished_at) next.finished_at = now;
      }
    }
    if (next.status === "reading" && !existing.started_at) next.started_at = now;
  }

  if (fields.page_count !== undefined) {
    next.page_count = fields.page_count ? Number(fields.page_count) : null;
  }

  if (fields.cover_url !== undefined) next.cover_url = fields.cover_url;
  if (fields.isbn !== undefined) next.isbn = fields.isbn;

  if (fields.rating !== undefined) {
    next.rating = fields.rating === null ? null : Math.min(5, Math.max(1, Number(fields.rating)));
  }

  if (fields.review_text !== undefined) {
    next.review_text = fields.review_text;
    next.review_updated_at = now;
  }

  next.updated_at = now;

  db.prepare(
    `UPDATE books SET
      status = @status,
      current_page = @current_page,
      page_count = @page_count,
      cover_url = @cover_url,
      isbn = @isbn,
      rating = @rating,
      review_text = @review_text,
      review_updated_at = @review_updated_at,
      started_at = @started_at,
      finished_at = @finished_at,
      updated_at = @updated_at
    WHERE id = @id`
  ).run(next);

  const updated = db.prepare("SELECT * FROM books WHERE id = ?").get(existing.id);
  res.json(serializeBook(updated));
});

router.delete("/:id", (req, res) => {
  const info = db.prepare("DELETE FROM books WHERE id = ?").run(req.params.id);
  if (info.changes === 0) return res.status(404).json({ error: "Libro non trovato" });
  res.status(204).end();
});

export default router;
