// pages/api/landing.js
// ============================================================
// API PRINCIPAL — Crear, listar, mejorar, webhook landing pages
// ============================================================

import {
  createLandingPage,
  createLandingsFromWinners,
  improveLandingPage,
  autoCreateFromWebhook,
  regenerateSection,
  testConnection,
} from "../../lib/agent";
import { createClient } from "@supabase/supabase-js";
import { listProducts } from "../../lib/shopify";
import { buildLandingHTML_v3 as buildLandingHTML } from "../../lib/landing_html_v3";
import { analyzeUrl } from "../../lib/scraper";
import { extractDropiProductFromUrl } from "../../lib/dropi_v2";

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
        supabase
          .from("landing_pages")
          .select("*", { count: "exact" })
          .order("created_at", { ascending: false })
          .limit(50),
        supabase
          .from("landing_pages")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(10),
      ]);

      const published = (landings || []).filter((l) => l.status === "publicado").length;
      const drafts = (landings || []).filter((l) => l.status !== "publicado").length;
      const last24h = (landings || []).filter(
        (l) => new Date(l.created_at) > new Date(Date.now() - 86400000)
      ).length;

      return res.status(200).json({
        total: landings?.length || 0,
        published,
        drafts,
        last24h,
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

    // Preview: genera el HTML de una landing existente para vista previa
    if (action === "preview") {
      const id = req.query.id;
      const { data } = await supabase.from("landing_pages").select("*").eq("id", id).single();
      if (!data) return res.status(404).json({ error: "No encontrada" });

      const landing = JSON.parse(data.landing_data || "{}");
      const html = buildLandingHTML({
        headline: landing.headline,
        subheadline: landing.subheadline,
        bulletPoints: landing.bullet_points,
        description: landing.description,
        features: landing.features,
        faq: landing.faq,
        urgencyText: landing.urgency_text,
        compareTable: landing.compare_table,
        testimonials: landing.testimonials,
        problemSolution: landing.problem_solution,
        guaranteeText: landing.guarantee_text,
        trustBadges: landing.trust_badges,
        price: "29.99",
        comparePrice: null,
        socialProofCount: landing.social_proof_count || "2,847",
      });

      // Devolver HTML completo para iframe
      const fullHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${landing.title || "Preview"}</title><style>body{margin:0;padding:16px;font-family:system-ui,sans-serif;background:#fff}</style></head><body>${html}</body></html>`;

      res.setHeader("Content-Type", "text/html");
      return res.status(200).send(fullHtml);
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
      const {
        name, category, market, sellPrice, comparePrice, description, images,
        countryCode, currency, whatsappNumber, facebookPixelId, tiktokPixelId, aliExpressUrl,
      } = req.body;

      if (!name) return res.status(400).json({ error: "Falta el nombre del producto" });

      console.log(`[API] Creando landing PRO para "${name}" (${countryCode || "CO"})...`);
      const result = await createLandingPage({
        name,
        category: category || "General",
        market: market || "LATAM",
        sellPrice: sellPrice || "29.99",
        comparePrice: comparePrice || null,
        description: description || "",
        images: images || [],
        aliExpressUrl: aliExpressUrl || null,
        countryCode: countryCode || "CR",
        currency: currency || null,
        whatsappNumber: whatsappNumber || null,
        facebookPixelId: facebookPixelId || null,
        tiktokPixelId: tiktokPixelId || null,
      });

      return res.status(result.ok ? 200 : 500).json(result);
    }

    if (action === "auto-create") {
      const limit = parseInt(req.body.limit || "3");
      const minScore = parseInt(req.body.minScore || "8");
      console.log(`[API] Auto-creando landings para top ${limit} productos (score >= ${minScore})...`);
      const result = await createLandingsFromWinners(limit, minScore);
      return res.status(200).json(result);
    }

    // Webhook: el agente de dropshipping llama aquí cuando encuentra un producto con score >= 9
    if (action === "webhook") {
      const product = req.body;

      if (!product?.name) {
        return res.status(400).json({ error: "Falta nombre del producto" });
      }

      console.log(`[API] Webhook recibido: "${product.name}" (score: ${product.score})`);
      const result = await autoCreateFromWebhook(product);
      return res.status(result.ok ? 200 : 400).json(result);
    }

    if (action === "improve") {
      const { id, feedback } = req.body;
      if (!id || !feedback) return res.status(400).json({ error: "Faltan id y feedback" });

      console.log(`[API] Mejorando landing ${id}...`);
      const result = await improveLandingPage(id, feedback);
      return res.status(result.ok ? 200 : 500).json(result);
    }

    // Regenerar sección específica
    if (action === "regenerate-section") {
      const { id, section } = req.body;
      if (!id || !section) return res.status(400).json({ error: "Faltan id y section" });

      const validSections = ["testimonials", "faq", "benefits", "copy", "ads", "urgency"];
      if (!validSections.includes(section)) {
        return res.status(400).json({ error: `Sección inválida. Válidas: ${validSections.join(", ")}` });
      }

      console.log(`[API] Regenerando sección "${section}" de landing ${id}...`);
      const result = await regenerateSection(id, section);
      return res.status(result.ok ? 200 : 500).json(result);
    }

    // Analizar URL de competidor o producto
    if (action === "analyze-url") {
      const { url } = req.body;
      if (!url) return res.status(400).json({ error: "Falta la URL" });

      console.log(`[API] Analizando URL: ${url}`);
      const result = await analyzeUrl(url);
      return res.status(result.ok ? 200 : 400).json(result);
    }

    // Crear landing desde URL (todo automático)
    if (action === "create-from-url") {
      const { url, countryCode, currency, whatsappNumber, facebookPixelId, tiktokPixelId, sellPrice, comparePrice, extraImages } = req.body;
      if (!url) return res.status(400).json({ error: "Falta la URL" });

      console.log(`[API] Creando landing desde URL: ${url}`);

      // 1. Detectar tipo de URL
      const isFbAds = url.includes("facebook.com/ads/library");
      const isDropi = url.includes("app.dropi.");
      let d;

      if (isFbAds) {
        const fbUrl = new URL(url);
        const keyword = decodeURIComponent(fbUrl.searchParams.get("q") || "").trim();
        const fbCountry = fbUrl.searchParams.get("country") || "ALL";
        if (!keyword) return res.status(400).json({ error: "No se encontro keyword en la URL de Facebook Ads Library. Asegurate de que la URL tenga ?q=producto" });
        console.log(`[API] Facebook Ads Library: "${keyword}" (${fbCountry})`);

        // Intentar analizar, pero SIEMPRE crear la landing con la keyword
        let analysis;
        try { analysis = await analyzeUrl(url); } catch { analysis = { ok: false }; }

        d = {
          title: (analysis.ok && analysis.data?.title) ? analysis.data.title : keyword,
          description: (analysis.ok && analysis.data?.description) ? analysis.data.description : `Producto trending en Facebook Ads: ${keyword}. Este producto está generando miles de ventas a través de anuncios en Facebook e Instagram.`,
          images: (analysis.ok && analysis.data?.images?.length > 0) ? analysis.data.images : [],
          price: (analysis.ok && analysis.data?.price) ? analysis.data.price : null,
          originalPrice: (analysis.ok && analysis.data?.originalPrice) ? analysis.data.originalPrice : null,
          features: (analysis.ok && analysis.data?.features) ? analysis.data.features : [],
          source: "facebook-ads-library",
          keyword,
          fbCountry,
        };
      } else if (isDropi) {
        // URL de Dropi — extraer producto con login directo
        console.log(`[API] Dropi URL detectada: ${url}`);
        const dropiResult = await extractDropiProductFromUrl(url);
        if (dropiResult.found) {
          d = {
            title: dropiResult.product.name,
            description: dropiResult.product.description,
            images: dropiResult.images || [],
            price: dropiResult.product.price_local ? String(dropiResult.product.price_local) : null,
            originalPrice: dropiResult.product.compare_price_local ? String(dropiResult.product.compare_price_local) : null,
            features: [],
            source: "dropi",
          };
        } else {
          // Fallback: usar el slug de la URL como nombre
          const slug = url.match(/product-details\/\d+\/(.+)/)?.[1]?.replace(/-/g, " ") || "Producto";
          d = { title: slug, description: "", images: [], price: null, features: [], source: "dropi" };
        }
      } else {
        const analysis = await analyzeUrl(url);
        if (!analysis.ok) return res.status(400).json({ error: "No se pudo analizar: " + analysis.error });
        d = analysis.data;
      }

      // 2. Crear landing con los datos extraídos
      const result = await createLandingPage({
        name: d.title || "Producto",
        category: "General",
        market: "LATAM",
        sellPrice: sellPrice || d.price || "29.99",
        comparePrice: comparePrice || d.originalPrice || null,
        description: d.description + (d.fullDescription ? "\n" + d.fullDescription : "") + (d.features?.length ? "\n\nCaracterísticas:\n" + d.features.join("\n") : ""),
        images: [...(extraImages || []), ...(d.images || [])],
        countryCode: countryCode || "CR",
        currency: currency || null,
        whatsappNumber: whatsappNumber || null,
        facebookPixelId: facebookPixelId || null,
        tiktokPixelId: tiktokPixelId || null,
        sourceUrl: url,
        sourceData: d,
      });

      return res.status(result.ok ? 200 : 500).json({ ...result, analyzed: d });
    }

    // Crear MÚLTIPLES landings desde varias URLs
    if (action === "create-bulk") {
      const { urls, countryCode, currency, whatsappNumber, facebookPixelId, tiktokPixelId } = req.body;
      if (!urls || !Array.isArray(urls) || urls.length === 0) return res.status(400).json({ error: "Faltan URLs" });

      console.log(`[API] Creando ${urls.length} landings en lote...`);
      const results = [];

      for (const url of urls.slice(0, 10)) {
        try {
          const analysis = await analyzeUrl(url.trim());
          if (!analysis.ok) { results.push({ url, ok: false, error: "No se pudo analizar" }); continue; }
          const d = analysis.data;
          const result = await createLandingPage({
            name: d.title || "Producto",
            category: "General", market: "LATAM",
            sellPrice: d.price || "29.99",
            comparePrice: d.originalPrice || null,
            description: d.description + (d.features?.length ? "\n" + d.features.join("\n") : ""),
            images: d.images || [],
            countryCode: countryCode || "CR", currency: currency || null,
            whatsappNumber: whatsappNumber || null,
            facebookPixelId: facebookPixelId || null,
            tiktokPixelId: tiktokPixelId || null,
            sourceUrl: url,
          });
          results.push({ url, ok: result.ok, shopifyId: result.shopifyId, title: d.title });
          await new Promise(r => setTimeout(r, 2000));
        } catch (err) {
          results.push({ url, ok: false, error: err.message });
        }
      }

      const created = results.filter(r => r.ok).length;
      return res.status(200).json({ ok: true, created, total: urls.length, results });
    }

    // Duplicar landing para otro país
    if (action === "duplicate") {
      const { id, countryCode, currency } = req.body;
      if (!id || !countryCode) return res.status(400).json({ error: "Faltan id y countryCode" });

      const { data: record } = await supabase.from("landing_pages").select("*").eq("id", id).single();
      if (!record) return res.status(404).json({ error: "Landing no encontrada" });

      const landing = JSON.parse(record.landing_data || "{}");
      console.log(`[API] Duplicando "${record.product_name}" para ${countryCode}...`);

      const result = await createLandingPage({
        name: record.product_name,
        category: landing.product_type || "General",
        market: "LATAM",
        sellPrice: "29.99",
        description: landing.description || "",
        images: [],
        countryCode,
        currency: currency || null,
      });

      return res.status(result.ok ? 200 : 500).json(result);
    }
  }

  return res.status(404).json({ error: "Acción no encontrada" });
}
