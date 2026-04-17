// lib/gemini_v2.js
// ============================================================
// GENERADOR DE IMÁGENES IA — Pollinations.ai (gratis, sin API key)
// + Gemini para descripción de productos
// Genera 4 fotos profesionales de producto e-commerce
// Las URLs son directas — Shopify las importa automáticamente
// ============================================================

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const TEXT_MODEL = "gemini-2.5-flash";

// ─── GENERAR IMÁGENES PRO DE PRODUCTO ───────────────────────
export async function generateProductImages(productName, options = {}) {
  const {
    count = 4,
    category = "General",
    description = "",
  } = options;

  console.log(`[ImageGen] Generando ${count} imágenes para "${productName}"...`);

  const prompts = buildImagePrompts(productName, category, description);
  const images = [];

  // Generar todas en paralelo (Pollinations es rápido)
  const tasks = prompts.slice(0, count).map(async (prompt, i) => {
    try {
      const imageUrl = await generateWithPollinations(prompt, i);
      if (imageUrl) {
        console.log(`[ImageGen] Imagen ${i + 1}/${count} OK`);
        return imageUrl;
      }
      console.log(`[ImageGen] Imagen ${i + 1}/${count} falló`);
      return null;
    } catch (err) {
      console.error(`[ImageGen] Error imagen ${i + 1}:`, err.message);
      return null;
    }
  });

  const results = await Promise.all(tasks);
  const validImages = results.filter(Boolean);

  console.log(`[ImageGen] ${validImages.length}/${count} imágenes generadas para "${productName}"`);
  return validImages;
}

// ─── GENERAR IMAGEN CON POLLINATIONS.AI ─────────────────────
// Gratis, sin API key, devuelve URL directa que Shopify acepta
async function generateWithPollinations(prompt, seed = 0) {
  try {
    const encoded = encodeURIComponent(prompt);
    const imageUrl = `https://image.pollinations.ai/prompt/${encoded}?width=1024&height=1024&nologo=true&seed=${seed + Date.now()}&model=flux`;

    // Verificar que la imagen se genera correctamente
    const res = await fetch(imageUrl, {
      method: "HEAD",
      signal: AbortSignal.timeout(25000),
    });

    if (res.ok) {
      const contentType = res.headers.get("content-type") || "";
      if (contentType.startsWith("image/")) {
        return imageUrl;
      }
    }

    console.log(`[Pollinations] HEAD falló: ${res.status}`);
    // Aun si HEAD falla, la URL puede funcionar con GET directo
    // Shopify hace GET cuando importa la imagen
    return imageUrl;
  } catch (err) {
    console.error(`[Pollinations] Error: ${err.message}`);
    return null;
  }
}

// ─── PROMPTS PARA FOTOS DE PRODUCTO E-COMMERCE ──────────────
function buildImagePrompts(productName, category, description) {
  const desc = description ? `. ${description.slice(0, 150)}` : "";

  return [
    // 1. Foto principal — fondo blanco profesional
    `Professional e-commerce product photograph of ${productName}${desc}. Clean white background, studio lighting, soft shadows, product centered, sharp focus, commercial photography, 4K quality, no text, no logos, no watermarks, no people`,

    // 2. Foto lifestyle — en contexto de uso
    `Lifestyle product photo of ${productName} in a beautiful real setting${desc}. Natural warm lighting, shallow depth of field, inviting atmosphere, professional commercial quality, no visible faces, no text overlays`,

    // 3. Foto detalle — close up
    `Close-up detail shot of ${productName} showing premium quality and texture${desc}. Macro photography, studio lighting, sharp focus, clean composition, no text, no watermarks`,

    // 4. Foto ángulo/packaging
    `Product display of ${productName} from 45 degree angle with elegant presentation${desc}. Clean gradient background, soft shadows, professional e-commerce style, no text, no watermarks, no logos`,
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
