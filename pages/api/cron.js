// pages/api/cron.js
// ============================================================
// CRON — Auto-crear landings desde winning products (GitHub Actions)
// Busca productos score >= 8 sin landing y crea automáticamente
// ============================================================

import { createLandingsFromWinners } from "../../lib/agent";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Solo POST" });
  }

  // Verificar secret
  const secret = req.headers["x-cron-secret"] || req.body?.secret;
  if (secret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: "No autorizado" });
  }

  try {
    console.log("[Cron] Buscando winning products sin landing...");
    const result = await createLandingsFromWinners(3, 8);
    console.log("[Cron] Resultado:", result);
    return res.json({ ok: true, ...result });
  } catch (err) {
    console.error("[Cron] Error:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
