// pages/api/landing.js
// ============================================================
// API PRINCIPAL — Crear, listar, mejorar landing pages
// ============================================================

import { createLandingPage, createLandingsFromWinners, improveLandingPage, testConnection } from "../../lib/agent";
import { createClient } from "@supabase/supabase-js";
import { listProducts } from "../../lib/shopify";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  const { action } = req.query;

  // ─── GET ───────────────────────────────────────────────────
  if (req.method === "GET") {
    if (action === "status") {
      const [{ data: landings }, { data: recent }] = await Promise.all([
        supabase.from("landing_pages").select("*", { count: "exact" }).order("created_at", { ascending: false }).limit(50),
        supabase.from("landing_pages").select("*").order("created_at", { ascending: false }).limit(5),
      ]);

      return res.status(200).json({
        total: landings?.length || 0,
        recent: recent || [],
      });
    }

    if (action === "list") {
      const page = parseInt(req.query.page || "1");
      const limit = 20;
      const offset = (page - 1) * limit;

      const { data, count } = await supabase
        .from("landing_pages")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      return res.status(200).json({ landings: data || [], total: count || 0, page, limit });
    }

    if (action === "detail") {
      const id = req.query.id;
      const { data } = await supabase.from("landing_pages").select("*").eq("id", id).single();
      if (!data) return res.status(404).json({ error: "No encontrada" });

      const landingData = JSON.parse(data.landing_data || "{}");
      return res.status(200).json({ ...data, landing: landingData });
    }

    if (action === "test-shopify") {
      const result = await testConnection();
      return res.status(200).json(result);
    }

    if (action === "shopify-products") {
      try {
        const products = await listProducts(50);
        return res.status(200).json({ products });
      } catch (err) {
        return res.status(500).json({ error: err.message });
      }
    }
  }

  // ─── POST ──────────────────────────────────────────────────
  if (req.method === "POST") {
    if (action === "create") {
      const { name, category, market, sellPrice, comparePrice, description, images } = req.body;

      if (!name) return res.status(400).json({ error: "Falta el nombre del producto" });

      console.log(`[API] Creando landing para "${name}"...`);
      const result = await createLandingPage({
        name,
        category: category || "General",
        market: market || "LATAM",
        sellPrice: sellPrice || "29.99",
        comparePrice: comparePrice || null,
        description: description || "",
        images: images || [],
      });

      return res.status(result.ok ? 200 : 500).json(result);
    }

    if (action === "auto-create") {
      // Crear landings automáticamente desde productos ganadores
      const limit = parseInt(req.body.limit || "3");
      console.log(`[API] Auto-creando landings para top ${limit} productos ganadores...`);
      const result = await createLandingsFromWinners(limit);
      return res.status(200).json(result);
    }

    if (action === "improve") {
      const { id, feedback } = req.body;
      if (!id || !feedback) return res.status(400).json({ error: "Faltan id y feedback" });

      console.log(`[API] Mejorando landing ${id}...`);
      const result = await improveLandingPage(id, feedback);
      return res.status(result.ok ? 200 : 500).json(result);
    }
  }

  return res.status(404).json({ error: "Acción no encontrada" });
}
