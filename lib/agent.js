// lib/agent.js
// ============================================================
// AGENTE DE LANDING PAGES — Orquesta el flujo completo:
// 1. Recibe producto (manual o del agente de dropshipping)
// 2. Genera landing page con IA
// 3. Publica directo en Shopify
// 4. Notifica por Telegram
// ============================================================

import { createClient } from "@supabase/supabase-js";
import { generateLanding, generateFromWinningProduct, improveLanding } from "./generator.js";
import {
  createProduct,
  buildLandingHTML,
  testConnection,
  listProducts,
  updateProduct,
  deleteProduct,
  createCollection,
  addProductToCollection,
  updateProductSEO,
} from "./shopify.js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ─── CREAR LANDING PAGE COMPLETA Y PUBLICAR EN SHOPIFY ──────
export async function createLandingPage(productInfo) {
  const startTime = Date.now();

  try {
    console.log(`[Agent] Generando landing para "${productInfo.name}"...`);

    // 1. Generar contenido con IA
    const landing = await generateLanding(productInfo);

    // 2. Construir HTML de la landing
    const bodyHtml = buildLandingHTML({
      headline: landing.headline,
      subheadline: landing.subheadline,
      bulletPoints: landing.bullet_points,
      description: landing.description,
      features: landing.features,
      faq: landing.faq,
      urgencyText: landing.urgency_text,
      compareTable: landing.compare_table,
      testimonials: landing.testimonials,
    });

    // 3. Crear producto en Shopify
    const shopifyProduct = await createProduct({
      title: landing.title,
      description: bodyHtml,
      seoTitle: landing.seo_title,
      seoDescription: landing.seo_description,
      price: productInfo.sellPrice || "29.99",
      compareAtPrice: productInfo.comparePrice || null,
      vendor: productInfo.vendor || "Tienda",
      productType: landing.product_type || productInfo.category || "General",
      tags: landing.tags || "",
      images: productInfo.images || [],
    });

    // 4. Actualizar SEO
    if (shopifyProduct?.id) {
      await updateProductSEO(shopifyProduct.id, landing.seo_title, landing.seo_description);
    }

    // 5. Guardar en Supabase
    const record = {
      product_name: productInfo.name,
      shopify_product_id: shopifyProduct?.id || null,
      shopify_url: shopifyProduct ? `https://${process.env.SHOPIFY_STORE_DOMAIN}/products/${landing.url_handle || shopifyProduct.handle}` : null,
      landing_data: JSON.stringify(landing),
      status: shopifyProduct ? "publicado" : "error",
      created_at: new Date().toISOString(),
    };

    await supabase.from("landing_pages").insert(record);

    // 6. Notificar por Telegram
    await notifyTelegram(productInfo, landing, shopifyProduct);

    const duration = Date.now() - startTime;
    console.log(`[Agent] Landing creada en ${duration}ms — Shopify ID: ${shopifyProduct?.id}`);

    return {
      ok: true,
      shopifyId: shopifyProduct?.id,
      shopifyUrl: record.shopify_url,
      landing,
      duration,
    };
  } catch (err) {
    console.error("[Agent] Error creando landing:", err.message);
    return { ok: false, error: err.message };
  }
}

// ─── CREAR LANDINGS DESDE PRODUCTOS GANADORES (AUTO) ────────
// Se conecta con la base de datos del agente de dropshipping
export async function createLandingsFromWinners(limit = 3) {
  try {
    // Obtener productos ganadores recientes sin landing page
    const { data: winners } = await supabase
      .from("winning_products")
      .select("*")
      .gte("score", 8)
      .order("score", { ascending: false })
      .limit(limit);

    if (!winners || winners.length === 0) {
      console.log("[Agent] No hay productos ganadores para crear landings");
      return { ok: true, created: 0 };
    }

    const results = [];

    for (const product of winners) {
      try {
        const rawData = typeof product.raw_response === "string"
          ? JSON.parse(product.raw_response || "{}")
          : {};

        const result = await createLandingPage({
          name: product.name,
          category: product.category,
          market: product.market,
          sellPrice: String(product.sell_price_usd || "29.99"),
          comparePrice: product.sell_price_usd ? String(Math.round(product.sell_price_usd * 1.5)) : null,
          description: product.analysis_text,
          images: [], // Las imágenes se agregan manualmente después
        });

        results.push(result);

        // Esperar entre creaciones para no saturar la API
        await new Promise((r) => setTimeout(r, 3000));
      } catch (err) {
        console.error(`[Agent] Error con producto "${product.name}":`, err.message);
        results.push({ ok: false, error: err.message });
      }
    }

    const created = results.filter((r) => r.ok).length;
    console.log(`[Agent] ${created}/${winners.length} landings creadas`);

    return { ok: true, created, total: winners.length, results };
  } catch (err) {
    console.error("[Agent] Error creando landings desde ganadores:", err.message);
    return { ok: false, error: err.message };
  }
}

// ─── MEJORAR LANDING EXISTENTE ───────────────────────────────
export async function improveLandingPage(landingId, feedback) {
  try {
    // Obtener landing actual
    const { data: record } = await supabase
      .from("landing_pages")
      .select("*")
      .eq("id", landingId)
      .single();

    if (!record) throw new Error("Landing no encontrada");

    const currentLanding = JSON.parse(record.landing_data || "{}");

    // Mejorar con IA
    const improved = await improveLanding(currentLanding, feedback);

    // Actualizar HTML
    const bodyHtml = buildLandingHTML({
      headline: improved.headline,
      subheadline: improved.subheadline,
      bulletPoints: improved.bullet_points,
      description: improved.description,
      features: improved.features,
      faq: improved.faq,
      urgencyText: improved.urgency_text,
      compareTable: improved.compare_table,
      testimonials: improved.testimonials,
    });

    // Actualizar en Shopify
    if (record.shopify_product_id) {
      await updateProduct(record.shopify_product_id, {
        title: improved.title,
        body_html: bodyHtml,
      });
      await updateProductSEO(record.shopify_product_id, improved.seo_title, improved.seo_description);
    }

    // Actualizar en Supabase
    await supabase
      .from("landing_pages")
      .update({ landing_data: JSON.stringify(improved), updated_at: new Date().toISOString() })
      .eq("id", landingId);

    return { ok: true, landing: improved };
  } catch (err) {
    console.error("[Agent] Error mejorando landing:", err.message);
    return { ok: false, error: err.message };
  }
}

// ─── NOTIFICAR POR TELEGRAM ─────────────────────────────────
async function notifyTelegram(productInfo, landing, shopifyProduct) {
  if (!process.env.TELEGRAM_BOT_TOKEN) return;

  const shopifyUrl = shopifyProduct
    ? `https://${process.env.SHOPIFY_STORE_DOMAIN}/products/${shopifyProduct.handle}`
    : "No disponible";

  const adminUrl = shopifyProduct
    ? `https://admin.shopify.com/store/${process.env.SHOPIFY_STORE_DOMAIN?.replace(".myshopify.com", "")}/products/${shopifyProduct.id}`
    : "";

  const message =
    `🏷️ *LANDING PAGE CREADA*\n\n` +
    `📦 *${landing.title}*\n\n` +
    `💰 Precio: $${productInfo.sellPrice || "?"}\n` +
    `📂 Categoría: ${landing.product_type}\n\n` +
    `🏷️ *SEO:*\n` +
    `Title: ${landing.seo_title}\n` +
    `Meta: ${landing.seo_description}\n\n` +
    `📝 *Contenido:*\n` +
    `• Título: ${landing.headline}\n` +
    `• ${landing.bullet_points?.length || 0} beneficios\n` +
    `• ${landing.faq?.length || 0} FAQ\n` +
    `• ${landing.testimonials?.length || 0} testimonios\n` +
    `• ${landing.compare_table?.length || 0} comparaciones\n` +
    `• Urgencia: "${landing.urgency_text || "N/A"}"\n\n` +
    `📱 *Copy para Ads:*\n` +
    `• ${landing.ad_copies?.facebook?.length || 0} copies Facebook\n` +
    `• ${landing.ad_copies?.tiktok_scripts?.length || 0} scripts TikTok\n\n` +
    `━━━━━━━━━━━━━━━━━━━━━━\n` +
    `🔗 *Tienda:* ${shopifyUrl}\n` +
    (adminUrl ? `⚙️ *Admin:* ${adminUrl}\n` : "") +
    `\n⚠️ El producto está en BORRADOR — revísalo y publícalo cuando estés listo.\n\n` +
    `⏰ ${new Date().toLocaleString("es-CO")}`;

  try {
    await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: process.env.TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: "Markdown",
        disable_web_page_preview: true,
      }),
    });
  } catch (err) {
    console.error("[Agent] Error enviando Telegram:", err.message);
  }
}

// ─── TEST DE CONEXIÓN ────────────────────────────────────────
export { testConnection };
