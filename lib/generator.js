// lib/generator.js
// ============================================================
// GENERADOR PRO DE LANDING PAGES — Usa IA para crear contenido
// que VENDE con técnicas PAS/AIDA, hooks emocionales, urgencia,
// prueba social, ads Facebook/TikTok, email marketing
// ============================================================

import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

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
- "Miles de personas ya lo descubrieron", "El secreto que los expertos no quieren que sepas"

### 4. Urgencia y Escasez (REAL, no spam)
- Números específicos: "Solo quedan 7 unidades" (no "pocas unidades")
- Tiempo limitado con razón: "Precio de lanzamiento solo esta semana"
- Social proof: "+2,847 clientes satisfechos en Colombia"

### 5. Prueba Social Creíble
- Nombres REALES latinos: María García, Carlos Rodríguez, Ana López, Diego Hernández, Valentina Martínez
- Ciudades REALES: Bogotá, Medellín, CDMX, Guadalajara, Lima, Santiago, São Paulo
- Reviews DETALLADOS de 2-3 oraciones que suenen naturales, no genéricos
- Incluir detalles específicos: "Lo compré hace 2 semanas y ya noté la diferencia"

### 6. Garantía que Elimine Miedo
- "Si no cumple tus expectativas, te devolvemos el 100% de tu dinero. Sin preguntas, sin complicaciones."

### 7. CTAs Poderosos (adaptados a contraentrega si aplica)
- NO: "Comprar", "Agregar al carrito"
- Si el país tiene contraentrega: "¡Pide ahora y paga al recibir!", "¡Pídelo ya — pagas cuando te llegue!", "Sin riesgo — solo pagas al recibirlo"
- Si NO tiene contraentrega: "¡Lo quiero ahora!", "Aprovecha antes de que se agote", "Sí, lo necesito"
- SIEMPRE mencionar que el pago es seguro y sin riesgo

## FORMATO JSON REQUERIDO:
{
  "title": "Nombre del producto optimizado para Shopify",
  "seo_title": "Título SEO (max 60 chars, keyword principal al inicio)",
  "seo_description": "Meta descripción SEO (max 155 chars, incluir beneficio + CTA)",
  "url_handle": "url-amigable-del-producto",

  "headline": "Título principal IMPACTANTE (max 10 palabras, usa número o pregunta)",
  "subheadline": "Subtítulo que refuerce el beneficio principal y genere curiosidad",

  "description": "Descripción persuasiva CORTA usando técnica PAS. Máximo 4-5 oraciones en formato HTML con <p>, <strong>. Directo al grano, sin relleno.",

  "problem_solution": {
    "problem": "¿Te ha pasado que...? (1-2 oraciones CORTAS describiendo el dolor, directo al punto)",
    "agitation": "Sabemos lo frustrante que es... (1-2 oraciones CORTAS agitando)",
    "solution": "Presentamos [producto]... (1-2 oraciones CORTAS con la solución)"
  },

  "bullet_points": [
    "✅ Beneficio 1 — explicación que conecte con una emoción o resultado concreto",
    "✅ Beneficio 2 — dato específico o número que respalde",
    "✅ Beneficio 3 — comparación con alternativas inferiores",
    "✅ Beneficio 4 — resultado que el cliente va a experimentar",
    "✅ Beneficio 5 — beneficio inesperado que sorprenda",
    "✅ Beneficio 6 — garantía o seguridad incluida"
  ],

  "features": [
    "📐 Material: especificación técnica real",
    "📏 Tamaño: dimensiones",
    "⚖️ Peso: peso del producto",
    "🎨 Color: opciones disponibles",
    "📦 Incluye: todo lo que viene en la caja",
    "🛡️ Garantía: 30 días de satisfacción"
  ],

  "urgency_text": "🔥 Solo quedan [número específico] unidades — Precio de lanzamiento termina [plazo específico]",

  "social_proof_count": "2,847",

  "guarantee_text": "Garantía de satisfacción 30 días — Si no cumple tus expectativas, te devolvemos el 100% de tu dinero. Sin preguntas, sin complicaciones. Tu compra está 100% protegida.",

  "trust_badges": ["Pago 100% Seguro", "Envío Protegido", "Soporte 24/7", "Compra Verificada", "Devolución Gratis"],

  "compare_table": [
    {"feature": "Característica clave 1", "ours": "Ventaja concreta", "theirs": "Limitación real"},
    {"feature": "Característica clave 2", "ours": "Dato superior", "theirs": "Dato inferior"},
    {"feature": "Precio", "ours": "Mejor relación calidad-precio", "theirs": "Más caro o menor calidad"},
    {"feature": "Envío", "ours": "Gratis a todo el país", "theirs": "Costo adicional"},
    {"feature": "Garantía", "ours": "30 días sin preguntas", "theirs": "Sin garantía o limitada"}
  ],

  "testimonials": [
    {
      "name": "María García",
      "city": "Bogotá, Colombia",
      "rating": 5,
      "text": "Review detallado de 2-3 oraciones. Debe sonar 100% natural, mencionar cuánto tiempo lo ha usado, un beneficio específico que notó, y por qué lo recomienda.",
      "verified": true
    },
    {
      "name": "Carlos Rodríguez",
      "city": "Medellín, Colombia",
      "rating": 5,
      "text": "Review diferente al anterior. Mencionar un problema específico que tenía y cómo el producto lo resolvió. Incluir un detalle personal.",
      "verified": true
    },
    {
      "name": "Ana López",
      "city": "Ciudad de México, México",
      "rating": 5,
      "text": "Review con ángulo diferente. Mencionar que lo compró con dudas pero quedó sorprendida. Comparar con algo que usaba antes.",
      "verified": true
    },
    {
      "name": "Diego Hernández",
      "city": "Lima, Perú",
      "rating": 4,
      "text": "Review honesto — 4 estrellas para mayor credibilidad. Mencionar algo menor que podría mejorar pero que en general está muy satisfecho.",
      "verified": true
    }
  ],

  "faq": [
    {"q": "¿Realmente funciona como dicen?", "a": "Respuesta que incluya prueba social y garantía"},
    {"q": "¿Cuánto tarda en llegar a mi ciudad?", "a": "Respuesta específica para LATAM con tiempos reales"},
    {"q": "¿Qué pasa si no me gusta?", "a": "Respuesta sobre garantía 30 días, proceso fácil"},
    {"q": "¿Es original o réplica?", "a": "Respuesta que genere confianza sobre la calidad"},
    {"q": "¿El precio incluye envío?", "a": "Respuesta sobre envío gratis o costo"},
    {"q": "¿Cómo sé que mi pago es seguro?", "a": "Respuesta sobre seguridad, SSL, pasarelas confiables"}
  ],

  "ad_copies": {
    "facebook": [
      {
        "angle": "problema",
        "primary_text": "¿Te ha pasado que...? [3-5 oraciones que identifiquen el problema, presenten la solución y terminen con CTA urgente. Usar emojis estratégicamente.]",
        "headline": "Headline del ad (max 40 chars)",
        "description": "Descripción corta (max 30 chars)",
        "cta_type": "SHOP_NOW"
      },
      {
        "angle": "beneficio",
        "primary_text": "Descubre cómo [beneficio principal]... [3-5 oraciones enfocadas en la transformación que ofrece el producto. Incluir dato o número.]",
        "headline": "Headline diferente (max 40 chars)",
        "description": "Descripción diferente (max 30 chars)",
        "cta_type": "SHOP_NOW"
      },
      {
        "angle": "testimonio",
        "primary_text": "'Nunca pensé que...' — [Nombre, Ciudad]. [3-5 oraciones con formato de historia personal. Incluir antes/después.]",
        "headline": "Headline tipo testimonio (max 40 chars)",
        "description": "Aprovecha la oferta (max 30 chars)",
        "cta_type": "SHOP_NOW"
      }
    ]
  },

  "tiktok_scripts": [
    {
      "hook": "Los primeros 3 segundos — frase o acción que detenga el scroll (ej: 'POV: descubriste el producto que te va a cambiar la vida')",
      "problem": "5 segundos describiendo el problema relatable con emoción",
      "solution": "5 segundos mostrando el producto en acción, transformación visible",
      "cta": "3 segundos — 'Link en bio', 'Corre antes de que se agote', con urgencia",
      "full_script": "Script completo para leer/grabar de 15-20 segundos"
    },
    {
      "hook": "Hook diferente con ángulo de trending/viral",
      "problem": "Problema desde otro ángulo",
      "solution": "Demostración o comparación visual",
      "cta": "CTA diferente con escasez",
      "full_script": "Script completo variación 2"
    },
    {
      "hook": "Hook tipo storytime o 'lo que pedí vs lo que llegó'",
      "problem": "Expectativa vs realidad del problema",
      "solution": "Reveal satisfactorio del producto",
      "cta": "CTA con prueba social",
      "full_script": "Script completo variación 3"
    }
  ],

  "email_marketing": {
    "subject": "Asunto irresistible que genere apertura (max 50 chars, incluir emoji)",
    "preview": "Preview text que complemente el asunto (max 90 chars)",
    "body": "Email completo en HTML: saludo personalizado, historia breve del problema, presentación del producto como solución, 2-3 beneficios clave, CTA con botón, PS con urgencia. 6-10 oraciones."
  },

  "tags": "tag1, tag2, tag3, tag4, tag5",
  "product_type": "Categoría del producto"
}

IMPORTANTE:
- TODO el contenido debe ser 100% en ESPAÑOL, enfocado en público LATAM
- Los testimonios deben tener nombres y ciudades DIFERENTES entre sí
- Cada sección debe tener un ángulo emocional DIFERENTE
- Los números deben ser específicos y creíbles (no redondos)
- El copy debe sonar profesional pero cercano, como un amigo que te recomienda algo
- Los precios en la copy deben estar en la moneda del mercado objetivo`;

// ─── GENERAR LANDING PAGE COMPLETA ───────────────────────────
export async function generateLanding(productInfo) {
  const {
    name,
    category,
    market,
    buyPrice,
    sellPrice,
    description,
    imageUrl,
    dropiData,
    score,
  } = productInfo;

  const dropiInfo = dropiData
    ? `\nDatos de Dropi: ${dropiData.name || ""}, Precio COP: $${dropiData.price_cop || "?"}, Categoría: ${dropiData.category || "?"}, Proveedor: ${dropiData.supplier || "?"}`
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
TODO el contenido debe estar 100% adaptado a ${countryData?.name || "LATAM"}:

a) IDIOMA: ${countryData?.locale?.startsWith("pt") ? "PORTUGUÉS brasileño" : "ESPAÑOL con modismos de " + (countryData?.name || "LATAM")}
b) TESTIMONIOS: TODOS los nombres deben ser de ${countryData?.name || "LATAM"}. Usar estos nombres: ${countryData?.names?.join(", ") || "nombres locales"}. Las ciudades SOLO de ${countryData?.name || "LATAM"}: ${countryData?.cities?.join(", ") || "ciudades locales"}
c) EXPRESIONES LOCALES: Usar expresiones del país en el copy: ${countryData?.expressions?.join(", ") || "expresiones locales"}. Slang natural: ${countryData?.slang?.join(", ") || ""}
d) MÉTODOS DE PAGO: Mencionar en FAQ y descripción: ${countryData?.paymentMethods || "tarjeta de crédito"}
e) ${countryData?.contraentrega ? `PAGO CONTRAENTREGA (COD): Esta es la VENTAJA #1 en ${countryData?.name || "este país"}. La tienda usa Releasit COD Form. DEBES:
   - CTA principal: "¡Pide ahora y paga al recibir!" o "¡Pídelo ya — pagas cuando llegue!"
   - Agregar beneficio: "📦 Pago contraentrega — Solo pagas cuando recibes tu producto en la puerta. Sin riesgo."
   - En FAQ incluir: "¿Puedo pagar al recibir? — ¡Sí! Solo llenas el formulario con tu nombre, teléfono y dirección. Tu producto llega y pagas al recibirlo. Sin tarjeta, sin complicaciones."
   - En descripción mencionar: "Pide sin riesgo — pagas al recibir"
   - Repetir la ventaja de contraentrega mínimo 3 veces en toda la landing` : "NO mencionar contraentrega. Enfocar CTAs en seguridad del pago online y garantía de devolución."}
f) ENVÍO: Usar exactamente: "${countryData?.shipping || "Envío gratis"}"
g) MONEDA: Todos los precios en ${countryData?.currency || "USD"} (${countryData?.symbol || "$"})
h) CONTEXTO CULTURAL: El copy debe sentirse como si lo hubiera escrito alguien DE ${countryData?.name || "LATAM"}, no un extranjero. Usa referencias culturales del país.
i) FAQ: Incluir pregunta sobre métodos de pago locales y envío dentro del país

1. El headline debe DETENER el scroll — usa número, pregunta impactante, o declaración audaz
3. La descripción debe usar PAS: empieza con el DOLOR del cliente, agita, presenta la solución
4. Los testimonios deben sonar 100% REALES — nombres latinos diferentes, ciudades reales, detalles específicos de uso
5. La tabla comparativa debe hacer que nuestro producto sea la opción OBVIA
6. El urgency_text debe crear FOMO legítimo con números específicos
7. Las FAQ deben responder TODAS las objeciones que impiden la compra
8. Los 3 Facebook Ads deben tener ángulos COMPLETAMENTE diferentes (problema, beneficio, testimonio)
9. Los 3 TikTok scripts deben ser grabables de 15-20 segundos con estructura HOOK→PROBLEMA→SOLUCIÓN→CTA
10. El email debe tener un asunto que genere >30% de apertura
11. El social_proof_count debe ser un número específico creíble (ej: "2,847" no "3,000")
12. La garantía debe eliminar TODO miedo de compra

Devuelve el JSON completo con TODAS las secciones llenas. No dejes ningún campo vacío.`;

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 8000,
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
    console.log(`[Generator] Landing PRO generada para "${name}" — ${Object.keys(landing).length} campos`);
    return landing;
  } catch (err) {
    console.error(`[Generator] Error generando landing para "${name}":`, err.message);
    throw err;
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
1. Aplica los cambios solicitados manteniendo la misma estructura JSON
2. Si el feedback pide mejorar el copy, hazlo MÁS persuasivo y emocional
3. Si el feedback pide regenerar secciones, crea contenido COMPLETAMENTE nuevo (no variaciones)
4. Mantén TODOS los campos del JSON — no elimines ninguno
5. Si algún campo nuevo no existía (como problem_solution, tiktok_scripts, email_marketing), CRÉALO
6. Todo en ESPAÑOL para LATAM

Devuelve el JSON completo mejorado.`;

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 8000,
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
