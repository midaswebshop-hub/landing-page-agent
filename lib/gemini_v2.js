// lib/gemini_v2.js
// ============================================================
// GEMINI AI v2 — Generación de imágenes PRO de productos
// Usa gemini-2.5-flash-image (disponible en tier gratuita)
// CHANGELOG: Fix de modelos — v1 usaba modelos que no existían
// REQUIERE: GEMINI_API_KEY en .env.local
// ============================================================

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const IMAGE_MODEL = "gemini-2.5-flash-image"; // Genera imágenes (gratis)
const TEXT_MODEL = "gemini-2.0-flash";         // Describe productos (gratis)

// ─── GENERAR IMÁGENES PRO DE PRODUCTO ───────────────────────
export async function generateProductImages(productName, options = {}) {
  if (!GEMINI_API_KEY) {
    console.log("[Gemini] No hay API key configurada");
    return [];
  }

  const { count = 4, category = "General", description = "" } = options;
  console.log(`[Gemini] Generando ${count} imágenes para "${productName}" con ${IMAGE_MODEL}...`);

  const prompts = buildImagePrompts(productName, category, description);
  const images = [];

  for (let i = 0; i < Math.min(prompts.length, count); i++) {
    try {
      const imageUrl = await generateSingleImage(prompts[i]);
      if (imageUrl) {
        images.push(imageUrl);
        console.log(`[Gemini] Imagen ${i + 1}/${count} generada OK`);
      } else {
        console.log(`[Gemini] Imagen ${i + 1}/${count} falló`);
      }
      if (i < count - 1) await new Promise(r => setTimeout(r, 2000));
    } catch (err) {
      console.error(`[Gemini] Error imagen ${i + 1}:`, err.message);
    }
  }

  console.log(`[Gemini] ${images.length}/${count} imágenes generadas para "${productName}"`);
  return images;
}

// ─── GENERAR UNA IMAGEN CON GEMINI 2.5 FLASH IMAGE ─────────
async function generateSingleImage(prompt) {
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${IMAGE_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseModalities: ["TEXT", "IMAGE"],
        },
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.log(`[Gemini] Error ${res.status}: ${errText.slice(0, 150)}`);
      return null;
    }

    const data = await res.json();
    const parts = data.candidates?.[0]?.content?.parts || [];
    const imagePart = parts.find(p => p.inlineData);

    if (!imagePart) {
      console.log("[Gemini] Respuesta sin imagen");
      return null;
    }

    const mime = imagePart.inlineData.mimeType || "image/png";
    const size = imagePart.inlineData.data?.length || 0;
    console.log(`[Gemini] Imagen: ${mime}, ${Math.round(size / 1024)}KB base64`);

    return `data:${mime};base64,${imagePart.inlineData.data}`;
  } catch (err) {
    console.error("[Gemini] Error generando:", err.message);
    return null;
  }
}

// ─── PROMPTS PARA FOTOS DE PRODUCTO E-COMMERCE ──────────────
function buildImagePrompts(productName, category, description) {
  const desc = description ? description.slice(0, 150) : "";

  return [
    // Foto principal — fondo blanco
    `Generate a professional e-commerce product photo of "${productName}". ${desc}. Clean white background, studio lighting, high quality, sharp details, centered, no text, no watermarks, no logos, no people.`,

    // Foto lifestyle — en uso
    `Generate a lifestyle product photo of "${productName}" being used in a real setting. ${desc}. Natural lighting, warm tones, shallow depth of field, professional quality, no text, no watermarks, no people's faces.`,

    // Foto detalle — close up
    `Generate a close-up detail shot of "${productName}" showing product quality and texture. ${desc}. Macro photography, studio lighting, sharp focus, premium feel, no text, no watermarks.`,

    // Foto ángulo — vista diferente
    `Generate a product photo of "${productName}" from a 45-degree angle. ${desc}. Clean gradient background, soft shadows, professional e-commerce style, no text, no watermarks, no logos.`,
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
    });

    if (!res.ok) return productName;

    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || productName;
  } catch {
    return productName;
  }
}

// ─── UTILIDAD ───────────────────────────────────────────────
export function isBase64Image(url) {
  return typeof url === "string" && url.startsWith("data:image/");
}
