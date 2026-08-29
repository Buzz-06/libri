import { Router } from "express";
import multer from "multer";
import path from "node:path";
import fs from "node:fs";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(__dirname, "..", "..", "uploads");
fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase() || ".jpg";
    cb(null, `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Il file deve essere un'immagine"));
    }
    cb(null, true);
  },
});

const router = Router();

// POST /api/upload - carica la foto della propria edizione (usata come copertina
// e come sorgente per la scansione del codice a barre lato client)
router.post("/", upload.single("photo"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "Nessuna immagine ricevuta" });
  res.status(201).json({ url: `/uploads/${req.file.filename}` });
});

export default router;
