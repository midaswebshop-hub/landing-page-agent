// lib/agent.js
// ============================================================
// AGENTE DE LANDING PAGES PRO — Orquesta el flujo completo:
// 1. Recibe producto (manual o del agente de dropshipping)
// 2. Busca imágenes automáticamente + enriquece con Dropi
// 3. Genera landing page PRO con IA
// 4. Publica directo en Shopify
// 5. Notifica por Telegram con link directo
// ============================================================

import { createClient } from "@supabase/supabase-js";
import { generateLanding, generateFromWinningProduct, improveLanding } from "./generator_v2.js";
import { buildLandingHTML_v4 as buildLandingHTML } from "./landing_html_v4.js";
import {
  createProduct,
  testConnection,
  listProducts,
  updateProduct,
  updateProductSEO,
} from "./shopify.js";
import { getProductImages } from "./images.js";
import { enrichWithDropi } from "./dropi_v3.js";
import { spyProductAds } from "./adspy.js";
import { generateProductImages, describeProduct } from "./gemini_v2.js";
import { getCountryData, getPriceDisplay } from "./currency.js";
import { createProductTemplate, assignTemplateToProduct } from "./theme.js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ─── AUTO-CREAR TABLA SI NO EXISTE ──────────────────────────
let tableChecked = false;
async function ensureTable() {
  if (tableChecked) return;
  try {
    const { error } = await supabase.from("landing_pages").select("id").limit(1);
    if (error && error.code === "PGRST205") {
      // Tabla no existe — crearla via SQL raw con service_role
      console.log("[Agent] Tabla landing_pages no existe — creándola...");
      const dbUrl = process.env.NEXT_PUBLIC_SUPABASE_URL.replace("https://", "");
      const res = await fetch(`https://${dbUrl}/rest/v1/rpc/create_landing_pages_table`, {
        method: "POST",
        headers: {
          "apikey": process.env.SUPABASE_SERVICE_ROLE_KEY,
          "Authorization": `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          "Content-Type": "application/json",
        },
      }).catch(() => null);
      // Si la RPC no existe, la tabla se debe crear manualmente
      // Mientras tanto, el agente sigue funcionando — solo no guarda en Supabase
      if (!res?.ok) {
        console.log("[Agent] No se pudo crear tabla automáticamente — las landings se crean en Shopify pero no se guardan en DB");
      }
    }
  } catch {}
  tableChecked = true;
}

// ─── GUARDAR EN SUPABASE (con fallback si tabla no existe) ───
async function safeSave(record) {
  try {
    const { error } = await supabase.from("landing_pages").insert(record);
    if (error) {
      console.error("[Agent] Error guardando en Supabase:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[Agent] Supabase no disponible:", err.message);
    return false;
  }
}

// ─── CREAR LANDING PAGE COMPLETA Y PUBLICAR EN SHOPIFY ──────
export async function createLandingPage(productInfo) {
  const startTime = Date.now();
  await ensureTable();

  try {
    console.log(`[Agent] Generando landing PRO para "${productInfo.name}"...`);

    // 1. Buscar imágenes y Dropi EN PARALELO
    // NOTA: AdSpy y GIFs desactivados — traen basura irrelevante
    const hasManualImages = (productInfo.images || []).length > 0;
    const [imageResults, dropiData] = await Promise.all([
      getProductImages(productInfo.name, {
        count: 8,
        manualImages: productInfo.images || [],
        aliExpressUrl: productInfo.aliExpressUrl || "",
      }).catch((err) => {
        console.error("[Agent] Error con imágenes:", err.message);
        return [];
      }),
      enrichWithDropi(productInfo.name, {
        country: productInfo.countryCode || "CR",
      }).catch((err) => {
        console.error("[Agent] Error buscando en Dropi:", err.message);
        return { found: false, product: null, images: [] };
      }),
    ]);

    // 2. Combinar imágenes — SOLO fuentes confiables
    const allImages = [
      ...(imageResults || []),              // Manuales + AliExpress
      ...(dropiData?.images || []),         // Dropi (fotos reales del proveedor)
    ];

    // Filtrar: solo URLs válidas, sin iconos, sin SVGs, sin imágenes tiny
    const uniqueImages = [...new Set(
      allImages.filter(url => {
        if (typeof url !== "string" || !url.startsWith("http")) return false;
        const lower = url.toLowerCase();
        if (lower.includes("icon") || lower.includes("logo") || lower.includes("avatar")) return false;
        if (lower.includes("placeholder") || lower.includes("blank") || lower.includes("1x1")) return false;
        if (lower.includes("gstatic.com/images")) return false; // Google UI icons
        if (lower.endsWith(".svg")) return false;
        if (url.length < 30) return false;
        return true;
      })
    )].slice(0, 10);

    console.log(`[Agent] Imágenes del scraper: ${uniqueImages.length} (de ${allImages.length} candidatas)`);

    // 2.5 Si no hay suficientes imágenes, generar con Gemini IA
    if (uniqueImages.length < 3) {
      console.log(`[Agent] Pocas imágenes (${uniqueImages.length}) — generando con Gemini IA...`);
      try {
        const betterDesc = await describeProduct(
          productInfo.name,
          uniqueImages[0] || null
        );

        const geminiImages = await generateProductImages(productInfo.name, {
          count: 4 - uniqueImages.length,
          category: productInfo.category || "General",
          description: betterDesc,
        });

        if (geminiImages.length > 0) {
          uniqueImages.push(...geminiImages);
          console.log(`[Agent] Gemini generó ${geminiImages.length} imágenes PRO`);
        }
      } catch (err) {
        console.error("[Agent] Error con Gemini:", err.message);
      }
    }

    // 2.6 Fallback: si TODAVÍA no hay imágenes, buscar en Google Shopping
    if (uniqueImages.length === 0) {
      console.log(`[Agent] 0 imágenes — buscando fallback en Google Shopping...`);
      try {
        const { spyProductAds } = await import("./adspy.js");
        const fallbackImages = await spyProductAds(productInfo.name, { count: 5 });
        const validFallback = (fallbackImages || []).filter(url =>
          typeof url === "string" && url.startsWith("http") && url.length > 50
        );
        if (validFallback.length > 0) {
          uniqueImages.push(...validFallback.slice(0, 5));
          console.log(`[Agent] Fallback: ${validFallback.length} imágenes de Google/Pinterest`);
        }
      } catch (err) {
        console.error("[Agent] Error fallback imágenes:", err.message);
      }
    }

    console.log(`[Agent] Total imágenes finales: ${uniqueImages.length}`);

    // 3. Enriquecer productInfo con datos de Dropi
    if (dropiData?.found && dropiData.product) {
      console.log(`[Agent] Producto encontrado en Dropi ${dropiData.dropiCountry || ""}: ${dropiData.product.name} — ${dropiData.product.price_local} ${dropiData.product.currency || ""}`);

      productInfo.dropiData = dropiData.product;
      productInfo.description = productInfo.description || dropiData.product.description;
      // Si no tiene precio, usar el de Dropi
      if (!productInfo.sellPrice && dropiData.product.price_usd) {
        productInfo.sellPrice = String(dropiData.product.price_usd);
      }
    }

    // 4. Obtener datos del país y moneda
    const countryCode = productInfo.countryCode || "CR";
    const countryData = getCountryData(countryCode);

    // Limpiar y validar precio — evitar NaN
    let rawPrice = String(productInfo.sellPrice || "").replace(/,/g, "").trim();
    console.log(`[Agent] Precio recibido: "${productInfo.sellPrice}" → limpio: "${rawPrice}" | Currency: ${productInfo.currency} | Country: ${countryCode} | Local: ${productInfo.currency === countryData.currency}`);
    if (!rawPrice || isNaN(parseFloat(rawPrice)) || parseFloat(rawPrice) <= 0) {
      // Si es moneda local, usar precio default en esa moneda
      rawPrice = countryData.rate > 100 ? String(Math.round(29.99 * countryData.rate)) : "29.99";
      console.log(`[Agent] Precio inválido, usando default: ${rawPrice} ${countryData.currency}`);
    }
    const sellPrice = rawPrice;

    let rawCompare = productInfo.comparePrice ? String(productInfo.comparePrice).replace(/,/g, "").trim() : null;
    if (rawCompare && (isNaN(parseFloat(rawCompare)) || parseFloat(rawCompare) <= 0)) {
      rawCompare = null;
    }
    // Si no hay precio tachado, generar uno (el doble)
    if (!rawCompare) {
      rawCompare = String(Math.round(parseFloat(sellPrice) * 2));
    }

    const priceIsLocal = productInfo.currency && productInfo.currency === countryData.currency;
    let priceDisplay;
    try {
      if (priceIsLocal) {
        const localPrice = parseFloat(sellPrice);
        const localCompare = rawCompare ? parseFloat(rawCompare) : null;
        priceDisplay = {
          price: countryData.format(localPrice),
          comparePrice: localCompare ? countryData.format(localCompare) : null,
          savings: localCompare ? countryData.format(localCompare - localPrice) : null,
          currency: countryData.currency,
          symbol: countryData.symbol,
          localPrice,
        };
      } else {
        priceDisplay = getPriceDisplay(sellPrice, rawCompare, countryCode);
      }
    } catch (err) {
      console.error("[Agent] Error calculando precio, usando fallback:", err.message);
      priceDisplay = {
        price: `${countryData.symbol}${sellPrice}`,
        comparePrice: rawCompare ? `${countryData.symbol}${rawCompare}` : null,
        savings: null,
        currency: countryData.currency,
        symbol: countryData.symbol,
      };
    }

    // 5. Generar contenido PRO con IA (incluir datos del país)
    productInfo.countryData = countryData;
    productInfo.priceDisplay = priceDisplay;
    const landing = await generateLanding(productInfo);

    // 6. Construir HTML PRO de la landing
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
      // Campos PRO
      problemSolution: landing.problem_solution,
      guaranteeText: landing.guarantee_text,
      trustBadges: landing.trust_badges,
      price: sellPrice,
      comparePrice: productInfo.comparePrice || null,
      socialProofCount: landing.social_proof_count || "2,847",
      // Campos de moneda y país
      countryCode,
      countryData,
      formattedPrice: priceDisplay.price,
      formattedCompare: priceDisplay.comparePrice,
      savingsText: priceDisplay.savings,
      // WhatsApp y pixels
      whatsappNumber: productInfo.whatsappNumber || null,
      facebookPixelId: productInfo.facebookPixelId || null,
      tiktokPixelId: productInfo.tiktokPixelId || null,
      // v3: galería de imágenes y nombre
      images: uniqueImages,
      productName: landing.title || productInfo.name,
      // v4: proceso de uso (pasos)
      processSteps: landing.process_steps || null,
    });

    // 7. Crear producto en Shopify con imágenes
    const shopifyProduct = await createProduct({
      title: landing.title,
      description: bodyHtml,
      seoTitle: landing.seo_title,
      seoDescription: landing.seo_description,
      price: String(priceDisplay.localPrice || parseFloat(sellPrice) || "29.99"),
      compareAtPrice: String(rawCompare && parseFloat(rawCompare) > parseFloat(sellPrice) ? parseFloat(rawCompare) : Math.round((priceDisplay.localPrice || parseFloat(sellPrice)) * 2)),
      vendor: productInfo.vendor || "Tienda",
      productType: landing.product_type || productInfo.category || "General",
      tags: landing.tags || "",
      images: uniqueImages,
    });

    // 8. Actualizar SEO
    if (shopifyProduct?.id) {
      await updateProductSEO(shopifyProduct.id, landing.seo_title, landing.seo_description);
    }

    // 8.5. Template: crear template Master Escala con secciones nativas
    let templateResult = { ok: false, templateSuffix: "default" };
    if (shopifyProduct?.id && shopifyProduct?.handle) {
      try {
        templateResult = await createProductTemplate(landing, shopifyProduct.handle, {
          countryData,
          formattedPrice: priceDisplay.price,
          formattedCompare: priceDisplay.comparePrice,
          whatsappNumber: productInfo.whatsappNumber || null,
        });
        if (templateResult?.ok) {
          await assignTemplateToProduct(shopifyProduct.id, templateResult.templateSuffix);
          console.log(`[Agent] Template Master Escala aplicado: ${templateResult.templateSuffix} (${templateResult.sectionsCount} secciones)`);
        } else {
          console.log(`[Agent] Template falló, usando body_html como fallback`);
        }
      } catch (err) {
        console.error("[Agent] Error con template Master Escala:", err.message);
        console.log(`[Agent] Usando body_html como fallback — la landing sigue funcionando`);
      }
    }

    // 9. Guardar en Supabase (con más datos)
    const record = {
      product_name: productInfo.name,
      shopify_product_id: shopifyProduct?.id || null,
      shopify_url: shopifyProduct
        ? `https://${process.env.SHOPIFY_STORE_DOMAIN}/products/${landing.url_handle || shopifyProduct.handle}`
        : null,
      landing_data: JSON.stringify({
        ...landing,
        images_found: uniqueImages.length,
        dropi_found: dropiData?.found || false,
        dropi_price_local: dropiData?.product?.price_local || null,
        dropi_currency: dropiData?.product?.currency || null,
        dropi_country: dropiData?.dropiCountry || null,
        country_code: countryCode,
        currency: countryData.currency,
        formatted_price: priceDisplay.price,
      }),
      status: shopifyProduct ? "publicado" : "error",
      created_at: new Date().toISOString(),
    };

    await safeSave(record);

    // 10. Enviar webhook al Ads Agent (crear campañas automáticamente)
    if (shopifyProduct?.id && record.shopify_url) {
      try {
        const adsWebhookPayload = {
          landingPageId: null, // Se llenará con el ID de Supabase si se guardó
          productName: landing.title || productInfo.name,
          shopifyUrl: record.shopify_url,
          adCopies: landing.ad_copies?.facebook || [],
          tiktokScripts: landing.tiktok_scripts || landing.ad_copies?.tiktok_scripts || [],
          images: uniqueImages.slice(0, 5),
          countryCode,
          pixelId: productInfo.facebookPixelId || process.env.META_PIXEL_ID || null,
        };

        const adsRes = await fetch("https://ads-agent-nine.vercel.app/api/ads?action=webhook", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(adsWebhookPayload),
          signal: AbortSignal.timeout(15000),
        }).catch(() => null);

        if (adsRes?.ok) {
          const adsData = await adsRes.json().catch(() => ({}));
          console.log(`[Agent] Ads Agent webhook OK — ${adsData.created || 0} campañas creadas`);
        } else {
          console.log(`[Agent] Ads Agent webhook falló — status: ${adsRes?.status || "timeout"}`);
        }
      } catch (err) {
        console.error("[Agent] Error enviando webhook al Ads Agent:", err.message);
      }
    }

    // 11. Notificar por Telegram
    await notifyTelegram(productInfo, landing, shopifyProduct, {
      imagesCount: uniqueImages.length,
      dropiFound: dropiData?.found || false,
      dropiPrice: dropiData?.product?.price_local,
      dropiCurrency: dropiData?.product?.currency,
      dropiCountry: dropiData?.dropiCountry,
      countryData,
      formattedPrice: priceDisplay.price,
      formattedCompare: priceDisplay.comparePrice,
    });

    const duration = Date.now() - startTime;
    console.log(`[Agent] Landing PRO creada en ${duration}ms — Shopify ID: ${shopifyProduct?.id} — ${uniqueImages.length} imágenes`);

    return {
      ok: true,
      shopifyId: shopifyProduct?.id,
      shopifyUrl: record.shopify_url,
      landing,
      imagesFound: uniqueImages.length,
      dropiFound: dropiData?.found || false,
      templateApplied: templateResult?.ok || false,
      templateSections: templateResult?.sectionsCount || 0,
      duration,
    };
  } catch (err) {
    console.error("[Agent] Error creando landing:", err.message);
    return { ok: false, error: err.message };
  }
}

// ─── CREAR LANDINGS DESDE PRODUCTOS GANADORES (AUTO) ────────
// Se conecta con la base de datos del agente de dropshipping
// Solo procesa productos con score >= minScore (default 9 para auto)
export async function createLandingsFromWinners(limit = 3, minScore = 8) {
  try {
    // Obtener productos ganadores recientes sin landing page
    const { data: winners } = await supabase
      .from("winning_products")
      .select("*")
      .gte("score", minScore)
      .order("score", { ascending: false })
      .limit(limit);

    if (!winners || winners.length === 0) {
      console.log("[Agent] No hay productos ganadores para crear landings");
      return { ok: true, created: 0 };
    }

    // Filtrar productos que ya tienen landing
    const { data: existingLandings } = await supabase
      .from("landing_pages")
      .select("product_name")
      .in(
        "product_name",
        winners.map((w) => w.name)
      );

    const existingNames = new Set((existingLandings || []).map((l) => l.product_name));
    const newWinners = winners.filter((w) => !existingNames.has(w.name));

    if (newWinners.length === 0) {
      console.log("[Agent] Todos los productos ganadores ya tienen landing");
      return { ok: true, created: 0, message: "Todos ya tienen landing" };
    }

    console.log(`[Agent] Creando landings para ${newWinners.length} productos nuevos (de ${winners.length} ganadores)`);

    const results = [];

    for (const product of newWinners) {
      try {
        const rawData =
          typeof product.raw_response === "string"
            ? JSON.parse(product.raw_response || "{}")
            : {};

        const result = await createLandingPage({
          name: product.name,
          category: product.category,
          market: product.market,
          sellPrice: String(product.sell_price_usd || "29.99"),
          comparePrice: product.sell_price_usd
            ? String(Math.round(product.sell_price_usd * 2))
            : null,
          description: product.analysis_text,
          images: [], // Se buscan automáticamente ahora
          score: product.score,
        });

        results.push(result);

        // Esperar entre creaciones para no saturar APIs
        await new Promise((r) => setTimeout(r, 3000));
      } catch (err) {
        console.error(`[Agent] Error con producto "${product.name}":`, err.message);
        results.push({ ok: false, error: err.message });
      }
    }

    const created = results.filter((r) => r.ok).length;
    console.log(`[Agent] ${created}/${newWinners.length} landings PRO creadas`);

    return { ok: true, created, total: newWinners.length, results };
  } catch (err) {
    console.error("[Agent] Error creando landings desde ganadores:", err.message);
    return { ok: false, error: err.message };
  }
}

// ─── CONEXIÓN AUTOMÁTICA: WEBHOOK DESDE AGENTE DROPSHIPPING ──
// Cuando el agente de dropshipping encuentra un producto con score >= 9,
// llama a esta función para crear la landing automáticamente
export async function autoCreateFromWebhook(product) {
  const score = product.score || 0;

  if (score < 9) {
    console.log(`[Agent] Producto "${product.name}" tiene score ${score} (< 9), ignorando`);
    return { ok: false, reason: "Score menor a 9" };
  }

  console.log(`[Agent] 🚀 Auto-creando landing PRO para "${product.name}" (score: ${score})`);

  return createLandingPage({
    name: product.name,
    category: product.category || "General",
    market: product.market || "LATAM",
    sellPrice: String(product.sell_price_usd || product.sellPrice || "29.99"),
    comparePrice: product.sell_price_usd
      ? String(Math.round(product.sell_price_usd * 2))
      : null,
    description: product.analysis_text || product.description || "",
    images: product.images || [],
    score: product.score,
    autoCreated: true,
  });
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

    // Actualizar HTML PRO (pasar todos los campos que espera v4)
    const savedData = currentLanding;
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
      problemSolution: improved.problem_solution,
      guaranteeText: improved.guarantee_text,
      trustBadges: improved.trust_badges,
      price: savedData.formatted_price || savedData.price || "29.99",
      comparePrice: savedData.comparePrice || null,
      socialProofCount: improved.social_proof_count || "2,847",
      productName: improved.title || record.product_name,
      processSteps: improved.process_steps || null,
      countryCode: savedData.country_code || "CR",
      images: [],
    });

    // Actualizar en Shopify
    if (record.shopify_product_id) {
      await updateProduct(record.shopify_product_id, {
        title: improved.title,
        body_html: bodyHtml,
      });
      await updateProductSEO(
        record.shopify_product_id,
        improved.seo_title,
        improved.seo_description
      );
    }

    // Actualizar en Supabase
    await supabase
      .from("landing_pages")
      .update({
        landing_data: JSON.stringify(improved),
        updated_at: new Date().toISOString(),
      })
      .eq("id", landingId);

    return { ok: true, landing: improved };
  } catch (err) {
    console.error("[Agent] Error mejorando landing:", err.message);
    return { ok: false, error: err.message };
  }
}

// ─── REGENERAR SECCIÓN ESPECÍFICA ───────────────────────────
export async function regenerateSection(landingId, section) {
  const sectionPrompts = {
    testimonials: "Regenera SOLO los testimonios. Crea 4 testimonios nuevos con nombres latinos diferentes, ciudades reales, y reviews que suenen 100% naturales y detallados.",
    faq: "Regenera SOLO las FAQ. Crea 6 preguntas nuevas que eliminen las objeciones más comunes de compradores de LATAM.",
    benefits: "Regenera SOLO los bullet_points/beneficios. Crea 6 beneficios nuevos más impactantes con emojis y lenguaje que genere deseo.",
    copy: "Regenera SOLO la descripción y el headline/subheadline. Usa copywriting PAS más agresivo y emocional.",
    ads: "Regenera SOLO los ad_copies (Facebook + TikTok). Crea variaciones con ángulos completamente diferentes.",
    urgency: "Regenera SOLO el urgency_text y social_proof_count. Hazlo más creíble y urgente.",
  };

  const feedback = sectionPrompts[section] || `Mejora la sección: ${section}`;
  return improveLandingPage(landingId, feedback);
}

// ─── NOTIFICAR POR TELEGRAM ─────────────────────────────────
async function notifyTelegram(productInfo, landing, shopifyProduct, extra = {}) {
  if (!process.env.TELEGRAM_BOT_TOKEN) return;

  const shopifyUrl = shopifyProduct
    ? `https://${process.env.SHOPIFY_STORE_DOMAIN}/products/${shopifyProduct.handle}`
    : "No disponible";

  const storeName = process.env.SHOPIFY_STORE_DOMAIN?.replace(".myshopify.com", "") || "";
  const adminUrl = shopifyProduct
    ? `https://admin.shopify.com/store/${storeName}/products/${shopifyProduct.id}`
    : "";

  const isAuto = productInfo.autoCreated ? "🤖 AUTO-CREADA" : "✍️ Manual";
  const scoreText = productInfo.score ? `⭐ Score: ${productInfo.score}/10` : "";

  const message =
    `🚀 *LANDING PAGE PRO CREADA*\n\n` +
    `📦 *${landing.title}*\n` +
    `${isAuto} ${scoreText}\n\n` +
    `💰 Precio: ${extra.formattedPrice || "$" + (productInfo.sellPrice || "?")} ${extra.countryData?.currency || "USD"}${extra.formattedCompare ? " (antes " + extra.formattedCompare + ")" : ""}\n` +
    `${extra.countryData?.flag || ""} País: ${extra.countryData?.name || "LATAM"}\n` +
    `📂 Categoría: ${landing.product_type}\n\n` +
    `📸 *Imágenes:* ${extra.imagesCount || 0} encontradas\n` +
    `🔗 *Dropi ${extra.dropiCountry || ""}:* ${extra.dropiFound ? `✅ Encontrado — ${extra.dropiPrice?.toLocaleString()} ${extra.dropiCurrency || ""}` : "❌ No encontrado"}\n\n` +
    `📝 *Contenido PRO:*\n` +
    `• ${landing.bullet_points?.length || 0} beneficios\n` +
    `• ${landing.faq?.length || 0} FAQ\n` +
    `• ${landing.testimonials?.length || 0} testimonios\n` +
    `• ${landing.compare_table?.length || 0} comparaciones\n` +
    `• Problema→Solución: ${landing.problem_solution ? "✅" : "❌"}\n` +
    `• Garantía: ${landing.guarantee_text ? "✅" : "❌"}\n\n` +
    `📱 *Copy para Ads:*\n` +
    `• ${landing.ad_copies?.facebook?.length || 0} copies Facebook\n` +
    `• ${landing.tiktok_scripts?.length || landing.ad_copies?.tiktok_scripts?.length || 0} scripts TikTok\n` +
    `• Email: ${landing.email_marketing ? "✅" : "❌"}\n\n` +
    `━━━━━━━━━━━━━━━━━━━━━━\n` +
    `🔗 *Tienda:* ${shopifyUrl}\n` +
    (adminUrl ? `⚙️ *Publicar:* ${adminUrl}\n` : "") +
    `\n⚠️ Producto en BORRADOR — Revísalo y publícalo con un clic.\n\n` +
    `⏰ ${new Date().toLocaleString("es-CO")}`;

  try {
    await fetch(
      `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: process.env.TELEGRAM_CHAT_ID,
          text: message,
          parse_mode: "Markdown",
          disable_web_page_preview: true,
        }),
      }
    );
  } catch (err) {
    console.error("[Agent] Error enviando Telegram:", err.message);
  }
}

// ─── FILTRAR IMÁGENES DE CALIDAD ────────────────────────────
function filterQualityImages(images) {
  return (images || []).filter(url => {
    if (typeof url !== "string") return false;
    const lower = url.toLowerCase();
    // Solo permitir imágenes de CDNs conocidos de producto
    if (lower.includes("alicdn.com")) return true;
    if (lower.includes("cdn.shopify.com")) return true;
    if (lower.includes("pinimg.com") && lower.includes("/736x/")) return true;
    if (lower.includes("mlstatic.com")) return true; // Mercado Libre
    // Rechazar todo lo demás (Google icons, thumbnails genéricos, etc.)
    return false;
  });
}

// ─── TEST DE CONEXIÓN ────────────────────────────────────────
export { testConnection };
