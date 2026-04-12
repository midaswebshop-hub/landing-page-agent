// lib/gemini.js
// ============================================================
// GEMINI AI — Generación de imágenes PRO de productos
// Usa Gemini 3.1 Flash para crear fotos profesionales
// de productos para e-commerce automáticamente
// ============================================================

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const IMAGE_MODEL = "gemini-2.5-flash-image"; // Modelo de generación de imágenes
const TEXT_MODEL = "gemini-2.0-flash"; // Modelo de texto

// ─── GENERAR IMÁGENES PRO DE PRODUCTO ───────────────────────
// Genera múltiples imágenes profesionales para un producto
export async function generateProductImages(productName, options = {}) {
  if (!GEMINI_API_KEY) {
    console.log("[Gemini] No hay API key configurada");
    return [];
  }

  const { count = 4, category = "General", description = "" } = options;

  console.log(`[Gemini] Generando ${count} imágenes PRO para "${productName}"...`);

  const prompts = buildImagePrompts(productName, category, description);
  const images = [];

  // Generar imágenes en serie (Gemini tiene rate limits)
  for (let i = 0; i < Math.min(prompts.length, count); i++) {
    try {
      const imageUrl = await generateSingleImage(prompts[i]);
      if (imageUrl) {
        images.push(imageUrl);
        console.log(`[Gemini] Imagen ${i + 1}/${count} generada`);
      }
      // Pequeña pausa entre requests
      if (i < count - 1) await new Promise(r => setTimeout(r, 1500));
    } catch (err) {
      console.error(`[Gemini] Error generando imagen ${i + 1}:`, err.message);
    }
  }

  console.log(`[Gemini] ${images.length} imágenes PRO generadas para "${productName}"`);
  return images;
}

// ─── GENERAR UNA IMAGEN ─────────────────────────────────────
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
      const err = await res.text();
      console.log(`[Gemini] Error ${res.status}: ${err.slice(0, 200)}`);
      return null;
    }

    const data = await res.json();
    const parts = data.candidates?.[0]?.content?.parts || [];
    const imagePart = parts.find(p => p.inlineData);

    if (!imagePart) {
      console.log("[Gemini] No se generó imagen en la respuesta");
      return null;
    }

    const mime = imagePart.inlineData.mimeType || "image/png";
    console.log(`[Gemini] Imagen generada: ${mime}, ${imagePart.inlineData.data.length} bytes base64`);
    return `data:${mime};base64,${imagePart.inlineData.data}`;
  } catch (err) {
    console.error("[Gemini] Error:", err.message);
    return null;
  }
}

// ─── CONSTRUIR PROMPTS PARA IMÁGENES DE PRODUCTO ────────────
function buildImagePrompts(productName, category, description) {
  const base = `Professional e-commerce product photography of "${productName}". ${description ? "Product details: " + description.slice(0, 200) + ". " : ""}`;

  return [
    // Foto principal — fondo blanco limpio
    `${base}Clean white background, studio lighting, high-end product photography, sharp details, 4K quality, centered composition, no text, no watermarks, no logos.`,

    // Foto lifestyle — producto en uso
    `${base}Lifestyle photography showing the product being used in a real-life setting. Natural lighting, warm tones, shallow depth of field, professional quality, no text, no watermarks.`,

    // Foto de detalle — close-up
    `${base}Extreme close-up detail shot showing product quality and texture. Macro photography, studio lighting, sharp focus on details, premium feel, no text, no watermarks.`,

    // Foto de ángulo — vista diferente
    `${base}Product shot from a 45-degree angle showing dimensions and form. Clean background with subtle gradient, soft shadows, professional e-commerce style, no text, no watermarks.`,

    // Foto con contexto — ambientada
    `${base}Product placed in a beautiful, aspirational setting that matches the ${category} category. Editorial style photography, warm ambient lighting, lifestyle composition, no text, no watermarks.`,
  ];
}

// ─── SUBIR IMAGEN BASE64 A SHOPIFY ──────────────────────────
// Shopify acepta base64 en la API de productos
export function isBase64Image(url) {
  return typeof url === "string" && url.startsWith("data:image/");
}

// ─── DESCRIBIR PRODUCTO CON GEMINI (para mejorar prompts) ───
export async function describeProduct(productName, imageUrl) {
  if (!GEMINI_API_KEY) return productName;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${TEXT_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

    const parts = [
      { text: `Describe this product "${productName}" in detail for an e-commerce listing. Include: what it is, key features, materials, who it's for, and main benefits. Keep it under 200 words. Respond in Spanish.` },
    ];

    // Si hay imagen URL, incluirla para mejor descripción
    if (imageUrl && imageUrl.startsWith("http")) {
      try {
        const imgRes = await fetch(imageUrl);
        const buffer = await imgRes.arrayBuffer();
        const base64 = Buffer.from(buffer).toString("base64");
        const mime = imgRes.headers.get("content-type") || "image/jpeg";
        parts.push({ inlineData: { mimeType: mime, data: base64 } });
      } catch {}
    }

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
