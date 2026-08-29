import { Router } from "express";
import { searchVolumes, lookupByIsbn, getOfficialReviewInfo } from "../googleBooks.js";

const router = Router();

// GET /api/search/books?q=titolo+autore  -> cerca nuovi libri da aggiungere
router.get("/books", async (req, res) => {
  const { q } = req.query;
  if (!q || !String(q).trim()) return res.json([]);
  try {
    const results = await searchVolumes(String(q).trim());
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(502).json({ error: "Ricerca libri non disponibile al momento" });
  }
});

// GET /api/search/isbn/:isbn -> usato dopo la scansione del codice a barre sulla foto
router.get("/isbn/:isbn", async (req, res) => {
  try {
    const result = await lookupByIsbn(req.params.isbn);
    if (!result) return res.status(404).json({ error: "Nessuna edizione trovata per questo ISBN" });
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(502).json({ error: "Ricerca per ISBN non disponibile al momento" });
  }
});

// GET /api/search/reviews/:externalId -> recensioni/valutazioni ufficiali per un volume
router.get("/reviews/:externalId", async (req, res) => {
  try {
    const info = await getOfficialReviewInfo(req.params.externalId);
    res.json(info);
  } catch (err) {
    console.error(err);
    res.status(502).json({ error: "Recensioni ufficiali non disponibili al momento" });
  }
});

export default router;
