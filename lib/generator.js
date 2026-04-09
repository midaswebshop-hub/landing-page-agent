// lib/generator.js
// ============================================================
// GENERADOR DE LANDING PAGES — Usa IA para crear contenido completo
// Genera: título, descripción, beneficios, FAQ, SEO, copy ads,
//         testimonios, tabla comparativa, urgencia/escasez
// ============================================================

import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `Eres un experto copywriter de e-commerce especializado en crear landing pages que VENDEN para tiendas Shopify en mercados LATAM (Colombia, México, Brasil).

REGLA: Responde SOLO con JSON válido. Sin texto adicional. Sin markdown. Sin backticks.

Tu trabajo es crear una landing page COMPLETA lista para publicar en Shopify. El contenido debe:
- Estar 100% en ESPAÑOL
- Usar copywriting persuasivo (problema → agitación → solución)
- Incluir urgencia y escasez realistas
- Tener beneficios claros con emojis
- Incluir FAQ reales que eliminen objeciones de compra
- Generar testimonios realistas (nombres latinos)
- Comparar con la competencia genérica

Devuelve este JSON exacto:
{
  "title": "Nombre del producto optimizado para Shopify",
  "seo_title": "Título SEO (max 60 chars, con keyword principal)",
  "seo_description": "Meta descripción SEO (max 155 chars, con CTA)",
  "url_handle": "url-amigable-del-producto",

  "headline": "Título principal impactante de la landing (max 10 palabras)",
  "subheadline": "Subtítulo que refuerce el beneficio principal",

  "description": "Descripción larga persuasiva (5-8 oraciones, formato HTML con <p> y <strong>)",

  "bullet_points": [
    "✅ Beneficio 1 — explicación breve",
    "✅ Beneficio 2 — explicación breve",
    "✅ Beneficio 3 — explicación breve",
    "✅ Beneficio 4 — explicación breve",
    "✅ Beneficio 5 — explicación breve"
  ],

  "features": [
    "Material: xxx",
    "Tamaño: xxx",
    "Peso: xxx",
    "Color: xxx",
    "Incluye: xxx",
    "Garantía: 30 días"
  ],

  "urgency_text": "Texto de urgencia/escasez (ej: Solo quedan 12 unidades — Oferta termina esta semana)",

  "compare_table": [
    {"feature": "Característica 1", "ours": "Sí incluido", "theirs": "No incluido"},
    {"feature": "Característica 2", "ours": "Premium", "theirs": "Básico"},
    {"feature": "Precio", "ours": "Mejor precio", "theirs": "Más caro"},
    {"feature": "Envío", "ours": "Gratis", "theirs": "Pago extra"}
  ],

  "testimonials": [
    {"name": "María G. — Colombia", "text": "Testimonio realista y positivo de 1-2 oraciones"},
    {"name": "Carlos R. — México", "text": "Testimonio realista y positivo de 1-2 oraciones"},
    {"name": "Ana P. — Brasil", "text": "Testimonio realista y positivo de 1-2 oraciones"}
  ],

  "faq": [
    {"q": "Pregunta frecuente 1", "a": "Respuesta que elimine la objeción"},
    {"q": "Pregunta frecuente 2", "a": "Respuesta que elimine la objeción"},
    {"q": "Pregunta frecuente 3", "a": "Respuesta que elimine la objeción"},
    {"q": "¿Cuánto tarda en llegar?", "a": "Respuesta sobre envío a LATAM"},
    {"q": "¿Tiene garantía?", "a": "Respuesta sobre garantía"}
  ],

  "ad_copies": {
    "facebook": [
      "Copy 1 para Facebook (2-3 oraciones con emoji y CTA)",
      "Copy 2 variación ángulo diferente",
      "Copy 3 variación urgencia"
    ],
    "tiktok_scripts": [
      "Script 1: [HOOK 3s] ... | [PROBLEMA 5s] ... | [SOLUCIÓN 5s] ... | [CTA 3s] ...",
      "Script 2: variación diferente",
      "Script 3: variación testimonio"
    ],
    "email_subject": "Asunto de email que genere apertura",
    "email_body": "Texto del email (3-4 oraciones persuasivas)"
  },

  "tags": "tag1, tag2, tag3, tag4",
  "product_type": "Categoría del producto"
}`;

// ─── GENERAR LANDING PAGE COMPLETA ───────────────────────────
export async function generateLanding(productInfo) {
  const { name, category, market, buyPrice, sellPrice, description, imageUrl } = productInfo;

  const prompt = `Crea una landing page COMPLETA para este producto de dropshipping:

Producto: ${name}
Categoría: ${category || "General"}
Mercado: ${market || "LATAM (Colombia, México, Brasil)"}
Precio de compra: $${buyPrice || "?"} USD
Precio de venta: $${sellPrice || "?"} USD
${description ? `Descripción del proveedor: ${description}` : ""}
${imageUrl ? `Imagen: ${imageUrl}` : ""}

INSTRUCCIONES:
1. El contenido debe ser 100% en ESPAÑOL
2. El título debe ser atractivo y SEO-friendly
3. La descripción debe usar copywriting PAS (Problema → Agitación → Solución)
4. Los testimonios deben sonar reales con nombres latinos
5. La tabla comparativa debe posicionar nuestro producto como superior
6. El texto de urgencia debe crear FOMO sin ser engañoso
7. Las FAQ deben responder objeciones reales de compradores de LATAM
8. Los ad copies deben estar listos para usar en Facebook/TikTok

Devuelve el JSON completo.`;

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 5000,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: prompt }],
    });

    const text = response.content[0]?.text || "{}";
    let clean = text.replace(/```json?/g, "").replace(/```/g, "").trim();

    // Extraer JSON si hay texto extra
    const jsonMatch = clean.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      clean = jsonMatch[0];
    }

    const landing = JSON.parse(clean);
    console.log(`[Generator] Landing generada para "${name}"`);
    return landing;
  } catch (err) {
    console.error(`[Generator] Error generando landing para "${name}":`, err.message);
    throw err;
  }
}

// ─── GENERAR LANDING DESDE PRODUCTO DEL AGENTE DROPSHIPPING ──
// Se conecta con el agente de dropshipping para generar landings
// automáticamente de los productos ganadores
export async function generateFromWinningProduct(product) {
  const rawData = typeof product.raw_response === "string"
    ? JSON.parse(product.raw_response || "{}")
    : (product.raw_response || {});

  return generateLanding({
    name: product.name,
    category: product.category,
    market: product.market,
    buyPrice: product.buy_price_usd,
    sellPrice: product.sell_price_usd,
    description: product.analysis_text || rawData.landing_page?.shopify_description || "",
  });
}

// ─── MEJORAR LANDING EXISTENTE ───────────────────────────────
export async function improveLanding(currentLanding, feedback) {
  const prompt = `Tengo esta landing page actual:

${JSON.stringify(currentLanding, null, 2)}

El usuario quiere estos cambios:
${feedback}

Devuelve el JSON completo mejorado con los cambios aplicados. Mantén la misma estructura.`;

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 5000,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: prompt }],
    });

    const text = response.content[0]?.text || "{}";
    let clean = text.replace(/```json?/g, "").replace(/```/g, "").trim();
    const jsonMatch = clean.match(/\{[\s\S]*\}/);
    if (jsonMatch) clean = jsonMatch[0];

    return JSON.parse(clean);
  } catch (err) {
    console.error("[Generator] Error mejorando landing:", err.message);
    throw err;
  }
}
