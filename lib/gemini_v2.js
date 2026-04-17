// lib/gemini_v2.js
// ============================================================
// GEMINI AI v3 — Generación de imágenes PRO con Gemini Pro
// Genera imágenes de producto e-commerce de alta calidad
// Las imágenes se devuelven como base64 data URIs que Shopify
// acepta directamente en createProduct (las convierte a su CDN)
// ============================================================

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Modelos con fallback — Gemini Pro desbloquea imagen generation
const IMAGE_MODELS = [
  "gemini-2.0-flash-exp",       // Mejor para imágenes
  "gemini-2.0-flash",           // Fallback estable
];
const TEXT_MODEL = "gemini-2.5-flash";

// ─── GENERAR IMÁGENES PRO DE PRODUCTO ───────────────────────
export async function generateProductImages(productName, options = {}) {
  if (!GEMINI_API_KEY) {
    console.log("[Gemini] No hay API key configurada");
    return [];
  }

  const {
    count = 4,
    category = "General",
    description = "",
    countryCode = "CO",
  } = options;

  console.log(`[Gemini] Generando ${count} imágenes para "${productName}"...`);

  const prompts = buildImagePrompts(productName, category, description);
  const images = [];

  for (let i = 0; i < Math.min(prompts.length, count); i++) {
    try {
      const imageData = await generateSingleImage(prompts[i]);
      if (imageData) {
        images.push(imageData);
        console.log(`[Gemini] Imagen ${i + 1}/${count} generada OK`);
      } else {
        console.log(`[Gemini] Imagen ${i + 1}/${count} falló`);
      }
      // Rate limiting entre generaciones
      if (i < count - 1) await new Promise(r => setTimeout(r, 1500));
    } catch (err) {
      console.error(`[Gemini] Error imagen ${i + 1}:`, err.message);
    }
  }

  console.log(`[Gemini] ${images.length}/${count} imágenes generadas para "${productName}"`);
  return images;
}

// ─── GENERAR UNA IMAGEN ─────────────────────────────────────
async function generateSingleImage(prompt) {
  // Intentar con cada modelo hasta que uno funcione
  for (const model of IMAGE_MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseModalities: ["TEXT", "IMAGE"],
          },
        }),
        signal: AbortSignal.timeout(30000),
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => "");
        console.log(`[Gemini] ${model} error ${res.status}: ${errText.slice(0, 100)}`);
        continue; // Intentar siguiente modelo
      }

      const data = await res.json();
      const parts = data.candidates?.[0]?.content?.parts || [];
      const imagePart = parts.find(p => p.inlineData);

      if (!imagePart) {
        console.log(`[Gemini] ${model} respondió sin imagen`);
        continue;
      }

      const mime = imagePart.inlineData.mimeType || "image/png";
      const b64 = imagePart.inlineData.data;
      const sizeKB = Math.round((b64?.length || 0) / 1024);
      console.log(`[Gemini] ${model} OK — ${mime}, ${sizeKB}KB base64`);

      // Devolver como data URI — Shopify lo acepta en images[].src
      return `data:${mime};base64,${b64}`;
    } catch (err) {
      console.log(`[Gemini] ${model} falló: ${err.message}`);
      continue;
    }
  }

  return null;
}

// ─── PROMPTS PARA FOTOS DE PRODUCTO E-COMMERCE ──────────────
function buildImagePrompts(productName, category, description) {
  const desc = description ? `. ${description.slice(0, 200)}` : "";

  return [
    // 1. Foto principal — fondo blanco profesional
    `Professional e-commerce product photograph of "${productName}"${desc}. Shot on white seamless background, studio lighting with soft shadows, product centered, sharp focus, high-end commercial photography style. No text, no logos, no watermarks, no people, no hands. 4K quality, clean and minimal.`,

    // 2. Foto lifestyle — en contexto de uso
    `Lifestyle product photograph of "${productName}" in a realistic setting${desc}. The product is being displayed in its natural environment (home, office, outdoors as appropriate). Warm natural lighting, shallow depth of field, inviting atmosphere. Professional commercial photo quality. No visible faces, no text overlays.`,

    // 3. Foto detalle — close up de calidad
    `Extreme close-up detail shot of "${productName}" highlighting build quality and craftsmanship${desc}. Macro photography style, studio lighting revealing texture and material quality. Premium product photography, sharp focus, clean composition. No text, no watermarks.`,

    // 4. Foto packaging/unboxing — genera confianza
    `Product packaging and presentation shot of "${productName}" showing the complete set with accessories${desc}. Elegant flat lay composition on a clean surface, all items neatly arranged. Professional product photography with consistent lighting. No text overlays, no hands.`,
  ];
}

// ─── DESCRIBIR PRODUCTO CON GEMINI ──────────────────────────
export async function describeProduct(productName, imageUrl) {
  if (!GEMINI_API_KEY) return productName;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${TEXT_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

    const parts = [
      { text: `Describe this product "${productName}" in detail for an e-commerce listing. Include: what it is, key features, materials, who it's for, and main benefits. Keep it under 150 words. Respond in Spanish.` },
    ];

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts }] }),
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) return productName;

    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || productName;
  } catch {
    return productName;
  }
}

// ─── UTILIDADES ─────────────────────────────────────────────
export function isBase64Image(url) {
  return typeof url === "string" && url.startsWith("data:image/");
}
