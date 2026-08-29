import Database from "better-sqlite3";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, "..", "data");
fs.mkdirSync(dataDir, { recursive: true });

export const db = new Database(path.join(dataDir, "libri.sqlite"));
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS books (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    author TEXT,
    isbn TEXT,
    cover_url TEXT,
    page_count INTEGER,
    publisher TEXT,
    published_date TEXT,
    source TEXT DEFAULT 'manual',
    external_id TEXT,
    status TEXT NOT NULL DEFAULT 'want',
    current_page INTEGER NOT NULL DEFAULT 0,
    rating INTEGER,
    review_text TEXT,
    review_updated_at TEXT,
    started_at TEXT,
    finished_at TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS progress_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    page INTEGER NOT NULL,
    logged_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_progress_book ON progress_log(book_id);
  CREATE INDEX IF NOT EXISTS idx_books_status ON books(status);
`);

export default db;
