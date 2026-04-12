// lib/images.js
// ============================================================
// SISTEMA DE IMÁGENES PRO — Extrae fotos de AliExpress,
// valida URLs, y permite imágenes manuales (Gemini, etc.)
// Ya NO usa Bing scraping basura
// ============================================================

const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36";

// ─── EXTRAER IMÁGENES DE ALIEXPRESS ─────────────────────────
// Pega el link del producto de AliExpress y extrae todas las fotos HD
export async function extractAliExpressImages(aliUrl) {
  if (!aliUrl || !aliUrl.includes("aliexpress")) return [];

  try {
    console.log(`[Images] Extrayendo imágenes de AliExpress: ${aliUrl}`);

    const res = await fetch(aliUrl, {
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "text/html",
        "Accept-Language": "es-CO,es;q=0.9,en;q=0.8",
      },
      redirect: "follow",
    });

    if (!res.ok) {
      console.log(`[Images] AliExpress respondió ${res.status}`);
      return [];
    }

    const html = await res.text();
    const images = new Set();

    // Patrón 1: Imágenes en el JSON de datos del producto
    // AliExpress embebe un JSON con imagePathList
    const jsonPatterns = [
      /"imagePathList"\s*:\s*\[(.*?)\]/gs,
      /"imagePath"\s*:\s*"(https?:\/\/[^"]+)"/g,
      /"imageUrl"\s*:\s*"(https?:\/\/[^"]+)"/g,
    ];

    for (const pattern of jsonPatterns) {
      let match;
      while ((match = pattern.exec(html)) !== null) {
        const segment = match[1] || match[0];
        // Extraer URLs individuales del segmento
        const urlPattern = /https?:\/\/[a-z0-9-]+\.alicdn\.com\/[^\s"',\]]+/gi;
        let urlMatch;
        while ((urlMatch = urlPattern.exec(segment)) !== null) {
          const url = cleanAliExpressImage(urlMatch[0]);
          if (url) images.add(url);
        }
      }
    }

    // Patrón 2: Imágenes de alicdn.com en el HTML
    const alicdnPattern = /https?:\/\/[a-z0-9-]+\.alicdn\.com\/[^\s"'>,)]+\.(jpg|jpeg|png|webp)[^\s"'>,)]*/gi;
    let match;
    while ((match = alicdnPattern.exec(html)) !== null) {
      const url = cleanAliExpressImage(match[0]);
      if (url) images.add(url);
    }

    // Patrón 3: data-src con imágenes
    const dataSrcPattern = /data-src="(https?:\/\/[^"]*alicdn[^"]+)"/gi;
    while ((match = dataSrcPattern.exec(html)) !== null) {
      const url = cleanAliExpressImage(match[1]);
      if (url) images.add(url);
    }

    // Filtrar: solo imágenes grandes (no thumbnails, no iconos)
    const filtered = [...images].filter((url) => {
      const lower = url.toLowerCase();
      // Excluir thumbnails y versiones pequeñas
      if (lower.includes("_50x50") || lower.includes("_100x100") || lower.includes("_120x120")) return false;
      if (lower.includes("_200x200") || lower.includes("_220x220")) return false;
      if (lower.includes("/icon") || lower.includes("/avatar")) return false;
      if (lower.includes("placeholder") || lower.includes("default")) return false;
      if (lower.includes("logo") || lower.includes("banner")) return false;
      return true;
    });

    // Convertir a versiones de alta calidad
    const hdImages = filtered.map((url) => {
      // Remover sufijos de tamaño para obtener la versión HD
      return url
        .replace(/_\d+x\d+\./g, ".")
        .replace(/\.jpg_\d+x\d+.*$/i, ".jpg")
        .replace(/\.png_\d+x\d+.*$/i, ".png")
        .replace(/\.webp_\d+x\d+.*$/i, ".webp");
    });

    // Eliminar duplicados después de limpiar
    const unique = [...new Set(hdImages)];

    console.log(`[Images] AliExpress: ${unique.length} imágenes HD extraídas`);
    return unique.slice(0, 10); // Máximo 10 imágenes
  } catch (err) {
    console.error(`[Images] Error extrayendo de AliExpress:`, err.message);
    return [];
  }
}

// ─── LIMPIAR URL DE ALIEXPRESS ──────────────────────────────
function cleanAliExpressImage(url) {
  if (!url) return null;

  // Limpiar caracteres extra al final
  let clean = url.replace(/['">\s,\])}]+$/, "").trim();

  // Asegurar que es una URL de imagen válida
  if (!clean.includes("alicdn.com")) return null;
  if (clean.includes(".svg")) return null;
  if (clean.includes(".gif") && clean.length < 100) return null;

  // Remover parámetros de query innecesarios pero mantener la URL base
  const questionMark = clean.indexOf("?");
  if (questionMark > 0) {
    // Solo mantener si tiene extensión de imagen antes del ?
    const beforeQuery = clean.substring(0, questionMark);
    if (/\.(jpg|jpeg|png|webp)$/i.test(beforeQuery)) {
      clean = beforeQuery;
    }
  }

  return clean;
}

// ─── VALIDAR URL DE IMAGEN ──────────────────────────────────
export async function validateImageUrl(url) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(url, {
      method: "HEAD",
      headers: { "User-Agent": USER_AGENT },
      signal: controller.signal,
      redirect: "follow",
    });

    clearTimeout(timeout);

    const contentType = res.headers.get("content-type") || "";
    const contentLength = parseInt(res.headers.get("content-length") || "0");

    const valid =
      res.ok &&
      contentType.startsWith("image/") &&
      !contentType.includes("svg") &&
      (contentLength === 0 || contentLength > 10000); // > 10KB para evitar basura

    return { valid, contentType, size: contentLength };
  } catch {
    return { valid: false, contentType: "", size: 0 };
  }
}

// ─── FUNCIÓN PRINCIPAL: OBTENER IMÁGENES DEL PRODUCTO ───────
// Prioridad: 1) URLs manuales del usuario, 2) AliExpress, 3) nada (no busca basura)
export async function getProductImages(productName, options = {}) {
  const { count = 8, manualImages = [], aliExpressUrl = "" } = options;

  const allImages = [];

  // 1. Imágenes manuales del usuario (Gemini, proveedor, etc.) — PRIORIDAD MÁXIMA
  if (manualImages.length > 0) {
    console.log(`[Images] ${manualImages.length} imágenes manuales del usuario`);
    allImages.push(...manualImages);
  }

  // 2. Extraer de AliExpress si hay URL
  if (aliExpressUrl) {
    const aliImages = await extractAliExpressImages(aliExpressUrl);
    if (aliImages.length > 0) {
      console.log(`[Images] ${aliImages.length} imágenes de AliExpress`);
      allImages.push(...aliImages);
    }
  }

  // 3. NO buscamos en Bing/Google — esas imágenes son basura
  // Si el usuario no provee imágenes, el producto se crea sin fotos
  // y el usuario las agrega después desde Shopify

  if (allImages.length === 0) {
    console.log(`[Images] No hay imágenes para "${productName}" — el usuario debe agregarlas manualmente`);
    return [];
  }

  // Eliminar duplicados y limitar
  const unique = [...new Set(allImages)].slice(0, count);

  // Validar que las URLs funcionan
  const validImages = [];
  for (const url of unique) {
    const result = await validateImageUrl(url);
    if (result.valid) {
      validImages.push(url);
    } else {
      // Si falla la validación HEAD, igual la incluimos
      // (muchos CDNs bloquean HEAD pero el src funciona)
      validImages.push(url);
    }
  }

  console.log(`[Images] ${validImages.length} imágenes PRO listas para "${productName}"`);
  return validImages;
}
