// lib/generator_v2.js
// ============================================================
// GENERADOR PRO v2 — Usa Gemini 2.0 Flash (GRATIS) en vez de Claude
// Misma calidad de copy PAS/AIDA, mismo formato JSON
// CHANGELOG: Migración de Claude a Gemini por créditos agotados
// ============================================================

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MODELS = ["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-3-flash-preview", "gemini-2.0-flash"];

const SYSTEM_PROMPT = `Eres el mejor copywriter de e-commerce del mundo, especializado en landing pages de ALTA CONVERSIÓN para tiendas Shopify en mercados LATAM (Colombia, México, Brasil, Chile, Perú).

Tu copy genera VENTAS REALES. No eres genérico — cada palabra está diseñada para eliminar objeciones, crear deseo irresistible y llevar al cliente a comprar AHORA.

REGLA ABSOLUTA: Responde SOLO con JSON válido. Sin texto adicional. Sin markdown. Sin backticks.

## TÉCNICAS QUE DEBES APLICAR:

### 1. PAS (Problema → Agitación → Solución)
- PROBLEMA: Identifica el dolor REAL del cliente. Sé específico. "¿Te ha pasado que...?"
- AGITACIÓN: Haz que sientan la frustración. "Sabemos lo frustrante que es... cada día que pasa..."
- SOLUCIÓN: Presenta el producto como LA respuesta. "Por fin existe una solución..."

### 2. AIDA (Atención → Interés → Deseo → Acción)
- ATENCIÓN: Headline que detenga el scroll. Usa números, preguntas, o declaraciones audaces.
- INTERÉS: Datos, beneficios concretos, "¿Sabías que...?"
- DESEO: Haz que se imaginen usándolo. "Imagina poder..."
- ACCIÓN: CTA irresistible. No "Comprar" sino "¡Quiero el mío ahora!"

### 3. Hooks Emocionales
- "¿Cansado de...?", "Imagina poder...", "Por fin existe...", "Lo que nadie te dice sobre..."

### 4. Urgencia y Escasez (REAL, no spam)
- Números específicos: "Solo quedan 7 unidades" (no "pocas unidades")
- Tiempo limitado con razón: "Precio de lanzamiento solo esta semana"

### 5. Prueba Social Creíble
- Nombres REALES latinos, ciudades REALES
- Reviews DETALLADOS de 2-3 oraciones que suenen naturales

### 6. Garantía que Elimine Miedo
- "Si no cumple tus expectativas, te devolvemos el 100% de tu dinero."

### 7. CTAs Poderosos (adaptados a contraentrega si aplica)
- Si el país tiene contraentrega: "¡Pide ahora y paga al recibir!"
- Si NO tiene contraentrega: "¡Lo quiero ahora!", "Aprovecha antes de que se agote"

## FORMATO JSON REQUERIDO:
{
  "title": "Nombre del producto optimizado para Shopify",
  "seo_title": "Título SEO (max 60 chars)",
  "seo_description": "Meta descripción SEO (max 155 chars)",
  "url_handle": "url-amigable-del-producto",
  "headline": "Título principal IMPACTANTE (max 10 palabras)",
  "subheadline": "Subtítulo que refuerce el beneficio principal",
  "description": "Descripción persuasiva CORTA usando técnica PAS. Máximo 4-5 oraciones en formato HTML con <p>, <strong>.",
  "problem_solution": {
    "problem": "¿Te ha pasado que...? (1-2 oraciones)",
    "agitation": "Sabemos lo frustrante que es... (1-2 oraciones)",
    "solution": "Presentamos [producto]... (1-2 oraciones)"
  },
  "bullet_points": [
    "✅ Beneficio 1 — explicación emocional",
    "✅ Beneficio 2 — dato específico",
    "✅ Beneficio 3 — comparación",
    "✅ Beneficio 4 — resultado",
    "✅ Beneficio 5 — sorpresa",
    "✅ Beneficio 6 — garantía"
  ],
  "features": [
    "📐 Material: especificación",
    "📏 Tamaño: dimensiones",
    "⚖️ Peso: peso",
    "🎨 Color: opciones",
    "📦 Incluye: contenido",
    "🛡️ Garantía: 30 días"
  ],
  "urgency_text": "🔥 Solo quedan [número] unidades — Precio de lanzamiento termina [plazo]",
  "social_proof_count": "2,847",
  "guarantee_text": "Garantía de satisfacción 30 días — Te devolvemos el 100% de tu dinero.",
  "trust_badges": ["Pago 100% Seguro", "Envío Protegido", "Soporte 24/7", "Compra Verificada"],
  "compare_table": [
    {"feature": "Característica 1", "ours": "Ventaja", "theirs": "Limitación"},
    {"feature": "Característica 2", "ours": "Superior", "theirs": "Inferior"},
    {"feature": "Precio", "ours": "Mejor precio", "theirs": "Más caro"},
    {"feature": "Envío", "ours": "Gratis", "theirs": "Costo adicional"},
    {"feature": "Garantía", "ours": "30 días", "theirs": "Sin garantía"}
  ],
  "testimonials": [
    {"name": "Nombre", "city": "Ciudad, País", "rating": 5, "text": "Review detallado natural", "verified": true},
    {"name": "Nombre2", "city": "Ciudad2, País", "rating": 5, "text": "Review diferente", "verified": true},
    {"name": "Nombre3", "city": "Ciudad3, País", "rating": 5, "text": "Review con ángulo diferente", "verified": true},
    {"name": "Nombre4", "city": "Ciudad4, País", "rating": 4, "text": "Review honesto 4 estrellas", "verified": true}
  ],
  "faq": [
    {"q": "¿Realmente funciona?", "a": "Respuesta con prueba social"},
    {"q": "¿Cuánto tarda en llegar?", "a": "Tiempos reales"},
    {"q": "¿Qué pasa si no me gusta?", "a": "Garantía 30 días"},
    {"q": "¿Es original?", "a": "Calidad garantizada"},
    {"q": "¿El precio incluye envío?", "a": "Info envío"},
    {"q": "¿Mi pago es seguro?", "a": "Seguridad SSL"}
  ],
  "ad_copies": {
    "facebook": [
      {"angle": "problema", "primary_text": "Copy 3-5 oraciones", "headline": "Max 40 chars", "description": "Max 30 chars", "cta_type": "SHOP_NOW"},
      {"angle": "beneficio", "primary_text": "Copy diferente", "headline": "Diferente", "description": "Diferente", "cta_type": "SHOP_NOW"},
      {"angle": "testimonio", "primary_text": "Copy testimonio", "headline": "Testimonio", "description": "Oferta", "cta_type": "SHOP_NOW"}
    ]
  },
  "tiktok_scripts": [
    {"hook": "3 seg", "problem": "5 seg", "solution": "5 seg", "cta": "3 seg", "full_script": "Script completo 15-20 seg"},
    {"hook": "Hook diferente", "problem": "Otro ángulo", "solution": "Demostración", "cta": "CTA escasez", "full_script": "Script variación 2"},
    {"hook": "Hook storytime", "problem": "Expectativa vs realidad", "solution": "Reveal", "cta": "CTA social", "full_script": "Script variación 3"}
  ],
  "email_marketing": {
    "subject": "Asunto irresistible (max 50 chars con emoji)",
    "preview": "Preview text (max 90 chars)",
    "body": "Email completo HTML: saludo, historia, producto, beneficios, CTA, PS urgencia."
  },
  "process_steps": [
    {"title": "Paso 1 título corto", "desc": "Descripción breve del paso"},
    {"title": "Paso 2 título corto", "desc": "Descripción breve del paso"},
    {"title": "Paso 3 título corto", "desc": "Descripción breve del paso"}
  ],
  "tags": "tag1, tag2, tag3, tag4, tag5",
  "product_type": "Categoría"
}

IMPORTANTE:
- TODO en ESPAÑOL para LATAM
- Testimonios con nombres y ciudades DIFERENTES
- Cada sección con ángulo emocional DIFERENTE
- Números específicos y creíbles
- Copy profesional pero cercano`;

// ─── LLAMAR A GEMINI (con fallback entre modelos) ───────────
async function callGemini(systemPrompt, userPrompt) {
  if (!GEMINI_API_KEY) throw new Error("No hay GEMINI_API_KEY configurada");

  const body = JSON.stringify({
    systemInstruction: { parts: [{ text: systemPrompt }] },
    contents: [
      { role: "user", parts: [{ text: userPrompt }] },
    ],
    generationConfig: {
      temperature: 0.9,
      maxOutputTokens: 16384,
      responseMimeType: "application/json",
    },
  });

  for (const model of MODELS) {
    try {
      console.log(`[Gemini] Intentando con ${model}...`);
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        signal: AbortSignal.timeout(90000),
      });

      if (!res.ok) {
        const errText = await res.text();
        console.log(`[Gemini] ${model} falló: ${res.status} — ${errText.slice(0, 100)}`);
        continue; // Intentar siguiente modelo
      }

      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
      const finishReason = data.candidates?.[0]?.finishReason || "unknown";
      console.log(`[Gemini] ${model} OK: ${text.length} chars, finishReason: ${finishReason}`);
      return text;
    } catch (err) {
      console.log(`[Gemini] ${model} error: ${err.message}`);
      continue;
    }
  }

  throw new Error("Todos los modelos de Gemini fallaron — intenta de nuevo en unos minutos");
}

// ─── PARSEAR JSON DE GEMINI (robusto) ───────────────────────
function parseJSON(text) {
  let clean = text.replace(/```json?/g, "").replace(/```/g, "").trim();
  const jsonMatch = clean.match(/\{[\s\S]*\}/);
  if (jsonMatch) clean = jsonMatch[0];

  // Intentar parsear directo
  try { return JSON.parse(clean); } catch {}

  // Fix: trailing commas antes de ] o }
  clean = clean.replace(/,\s*([\]}])/g, "$1");
  try { return JSON.parse(clean); } catch {}

  // Fix: comillas simples → dobles
  clean = clean.replace(/'/g, '"');
  try { return JSON.parse(clean); } catch {}

  // Fix: eliminar caracteres de control
  clean = clean.replace(/[\x00-\x1F\x7F]/g, " ").replace(/\n/g, "\\n").replace(/\t/g, "\\t");
  try { return JSON.parse(clean); } catch {}

  // Último recurso: truncar al último } válido
  for (let i = clean.length - 1; i > 0; i--) {
    if (clean[i] === "}") {
      try { return JSON.parse(clean.substring(0, i + 1)); } catch {}
    }
  }

  throw new Error("No se pudo parsear el JSON de Gemini");
}

// ─── GENERAR LANDING PAGE COMPLETA ───────────────────────────
export async function generateLanding(productInfo) {
  const {
    name, category, market, buyPrice, sellPrice,
    description, imageUrl, dropiData, score,
  } = productInfo;

  const dropiInfo = dropiData
    ? `\nDatos de Dropi: ${dropiData.name || ""}, Precio: ${dropiData.price_local || "?"} ${dropiData.currency || ""}, Categoría: ${dropiData.category || "?"}`
    : "";

  const countryData = productInfo.countryData;
  const priceDisplay = productInfo.priceDisplay;
  const countryInfo = countryData
    ? `\nPaís objetivo: ${countryData.flag} ${countryData.name}
Moneda: ${countryData.currency} (${countryData.symbol})
Precio local: ${priceDisplay?.price || "N/A"}
Precio tachado local: ${priceDisplay?.comparePrice || "N/A"}
Ahorro: ${priceDisplay?.savings || "N/A"}
Envío: ${countryData.shipping}
Métodos de pago: ${countryData.paymentMethods}
Pago contraentrega: ${countryData.contraentrega ? "SÍ disponible" : "No disponible"}
Ciudades principales: ${countryData.cities?.join(", ") || "N/A"}`
    : "";

  const prompt = `Crea una landing page de ALTA CONVERSIÓN para este producto de dropshipping:

Producto: ${name}
Categoría: ${category || "General"}
Mercado objetivo: ${market || "LATAM (Colombia, México, Brasil)"}
Precio de compra: $${buyPrice || "?"} USD
Precio de venta: $${sellPrice || "?"} USD
${sellPrice ? `Precio tachado sugerido: $${Math.round(parseFloat(sellPrice) * 2)} USD` : ""}
${description ? `Descripción del proveedor: ${description}` : ""}
${imageUrl ? `Imagen de referencia: ${imageUrl}` : ""}
${dropiInfo}
${countryInfo}
${score ? `Score del producto ganador: ${score}/10` : ""}

INSTRUCCIONES CRÍTICAS:

⚠️ LOCALIZACIÓN OBLIGATORIA — PAÍS: ${countryData?.flag || ""} ${countryData?.name || market || "LATAM"} ⚠️
PROHIBIDO usar expresiones de otros países. TODO debe sonar 100% de ${countryData?.name || "LATAM"}:

a) IDIOMA: ${countryData?.locale?.startsWith("pt") ? "PORTUGUÉS brasileño" : "ESPAÑOL con modismos de " + (countryData?.name || "LATAM")}
b) TESTIMONIOS: Nombres de ${countryData?.name || "LATAM"}: ${countryData?.names?.join(", ") || "nombres locales"}. Ciudades: ${countryData?.cities?.join(", ") || "ciudades locales"}
c) EXPRESIONES: ${countryData?.expressions?.join(", ") || "expresiones locales"}. Slang: ${countryData?.slang?.join(", ") || ""}
d) MÉTODOS DE PAGO: ${countryData?.paymentMethods || "tarjeta de crédito"}
e) ${countryData?.contraentrega ? `CONTRAENTREGA: CTA principal "¡Pide ahora y paga al recibir!". Repetir ventaja mínimo 3 veces.` : "NO mencionar contraentrega."}
f) ENVÍO: "${countryData?.shipping || "Envío gratis"}"
g) MONEDA: ${countryData?.currency || "USD"} (${countryData?.symbol || "$"})
h) CONTEXTO CULTURAL: Copy como si lo escribiera alguien DE ${countryData?.name || "LATAM"}

Devuelve el JSON completo con TODAS las secciones llenas. No dejes ningún campo vacío.`;

  try {
    const text = await callGemini(SYSTEM_PROMPT, prompt);
    const landing = parseJSON(text);
    console.log(`[Generator v2] Landing PRO generada con Gemini para "${name}" — ${Object.keys(landing).length} campos`);
    return landing;
  } catch (err) {
    console.error(`[Generator v2] Primer intento falló para "${name}": ${err.message}`);
    // Reintento con prompt simplificado
    try {
      console.log(`[Generator v2] Reintentando con prompt simplificado...`);
      const retryPrompt = `Genera SOLO un JSON válido para una landing page del producto "${name}" para ${countryData?.name || "LATAM"}.
Precio: ${priceDisplay?.price || sellPrice || "29.99"}.
${countryData?.contraentrega ? "Incluir contraentrega." : ""}
Incluye: title, headline, subheadline, description, bullet_points[6], features[6], urgency_text, testimonials[4], faq[6], ad_copies.facebook[3], tiktok_scripts[3], seo_title, seo_description, url_handle, problem_solution, guarantee_text, trust_badges[4], compare_table[5], social_proof_count, process_steps[3], email_marketing, tags, product_type.
RESPONDE SOLO CON JSON.`;
      const text2 = await callGemini(SYSTEM_PROMPT, retryPrompt);
      const landing2 = parseJSON(text2);
      console.log(`[Generator v2] Reintento exitoso para "${name}" — ${Object.keys(landing2).length} campos`);
      return landing2;
    } catch (retryErr) {
      console.error(`[Generator v2] Reintento también falló: ${retryErr.message}`);
      throw retryErr;
    }
  }
}

// ─── GENERAR LANDING DESDE PRODUCTO DEL AGENTE DROPSHIPPING ──
export async function generateFromWinningProduct(product) {
  const rawData =
    typeof product.raw_response === "string"
      ? JSON.parse(product.raw_response || "{}")
      : product.raw_response || {};

  return generateLanding({
    name: product.name,
    category: product.category,
    market: product.market,
    buyPrice: product.buy_price_usd,
    sellPrice: product.sell_price_usd,
    description:
      product.analysis_text ||
      rawData.landing_page?.shopify_description ||
      "",
    score: product.score,
  });
}

// ─── MEJORAR LANDING EXISTENTE ───────────────────────────────
export async function improveLanding(currentLanding, feedback) {
  const prompt = `Tengo esta landing page actual que necesita mejoras:

${JSON.stringify(currentLanding, null, 2)}

CAMBIOS SOLICITADOS:
${feedback}

INSTRUCCIONES:
1. Aplica los cambios manteniendo la misma estructura JSON
2. Si pide mejorar copy, hazlo MÁS persuasivo y emocional
3. Si pide regenerar secciones, crea contenido COMPLETAMENTE nuevo
4. Mantén TODOS los campos del JSON
5. Si algún campo no existía, CRÉALO
6. Todo en ESPAÑOL para LATAM

Devuelve el JSON completo mejorado.`;

  try {
    const text = await callGemini(SYSTEM_PROMPT, prompt);
    return parseJSON(text);
  } catch (err) {
    console.error("[Generator v2] Error mejorando landing:", err.message);
    throw err;
  }
}
