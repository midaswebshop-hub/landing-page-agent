// lib/dropi_v2.js
// ============================================================
// DROPI SCRAPER v2 — Extrae datos del producto directamente
// de la página web de Dropi (no depende de la API de catálogo)
// La API de integración solo permite pedidos, no catálogo
// ============================================================

const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36";

const DROPI_COUNTRIES = {
  CR: { name: "Costa Rica", currency: "CRC", symbol: "₡", api: "https://api.dropi.cr" },
  GT: { name: "Guatemala", currency: "GTQ", symbol: "Q", api: "https://api.dropi.gt" },
  CO: { name: "Colombia", currency: "COP", symbol: "$", api: "https://api.dropi.co" },
};

// ─── EXTRAER PRODUCTO DE URL DE DROPI ───────────────────────
// Scrapea la página web directamente para obtener imágenes y datos
export async function extractDropiProductFromUrl(dropiUrl) {
  try {
    const urlObj = new URL(dropiUrl);
    const host = urlObj.hostname;

    let country = "CR";
    if (host.includes("dropi.gt")) country = "GT";
    else if (host.includes("dropi.co")) country = "CO";

    const idMatch = dropiUrl.match(/product-details\/(\d+)/);
    const slugMatch = dropiUrl.match(/product-details\/\d+\/(.+)/);
    const productId = idMatch ? idMatch[1] : null;
    const productName = slugMatch ? slugMatch[1].replace(/-/g, " ") : "Producto";
    const countryConfig = DROPI_COUNTRIES[country];

    console.log(`[Dropi v2] Extrayendo producto "${productName}" (ID:${productId}) de ${countryConfig.name}`);

    // 1. Intentar obtener datos de la API interna de Dropi
    const apiData = await fetchDropiApiProduct(productId, country);

    // 2. Si la API no devuelve imágenes, scrapear la página web
    let images = apiData?.images || [];
    if (images.length === 0) {
      console.log(`[Dropi v2] API sin imágenes — scrapeando página web...`);
      images = await scrapeDropiPage(dropiUrl, productId, country);
    }

    // 3. Si todavía no hay imágenes, buscar en Google/AliExpress por nombre
    if (images.length === 0) {
      console.log(`[Dropi v2] Buscando imágenes en Google para "${productName}"...`);
      images = await searchProductImages(productName);
    }

    console.log(`[Dropi v2] ${images.length} imágenes encontradas para "${productName}"`);

    return {
      found: images.length > 0 || apiData?.found,
      dropiCountry: countryConfig.name,
      dropiCurrency: countryConfig.currency,
      product: {
        name: apiData?.name || productName,
        description: apiData?.description || "",
        price_local: apiData?.price || null,
        currency: countryConfig.currency,
        country,
        compare_price_local: apiData?.comparePrice || null,
        stock: apiData?.stock || null,
        category: apiData?.category || "",
        sku: "",
        url: dropiUrl,
      },
      images,
      allResults: [],
    };
  } catch (err) {
    console.error(`[Dropi v2] Error:`, err.message);
    return { found: false, product: null, images: [] };
  }
}

// ─── API INTERNA DE DROPI ───────────────────────────────────
async function fetchDropiApiProduct(productId, country) {
  if (!productId) return null;

  const config = DROPI_COUNTRIES[country];
  const email = process.env[`DROPI_${country}_EMAIL`];
  const password = process.env[`DROPI_${country}_PASSWORD`];
  if (!email || !password) return null;

  try {
    // Login
    const loginRes = await fetch(`${config.api}/integrations/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify({ email, password, white_brand_id: 1 }),
    });
    const loginData = await loginRes.json();
    if (!loginData.token) return null;

    // Intentar obtener producto
    const res = await fetch(`${config.api}/integrations/products/${productId}`, {
      headers: { "dropi-integration-key": loginData.token, "Accept": "application/json" },
    });

    if (!res.ok) return null;
    const data = await res.json();
    if (!data.isSuccess) return null;

    const p = data.data || {};
    const images = extractImagesFromObject(p);

    return {
      found: true,
      name: p.name || p.title || "",
      description: p.description || "",
      price: p.price || p.sale_price || null,
      comparePrice: p.compare_price || p.regular_price || null,
      stock: p.stock || null,
      category: p.category || "",
      images,
    };
  } catch {
    return null;
  }
}

// ─── SCRAPEAR PÁGINA WEB DE DROPI ───────────────────────────
async function scrapeDropiPage(url, productId, country) {
  try {
    // Dropi es una SPA, pero podemos intentar obtener datos del SSR o meta tags
    const res = await fetch(url, {
      headers: { "User-Agent": UA, "Accept": "text/html" },
      redirect: "follow",
    });

    if (!res.ok) return [];
    const html = await res.text();
    const images = new Set();

    // Buscar imágenes en meta tags
    const ogImage = html.match(/property="og:image"[^>]*content="([^"]+)"/)?.[1];
    if (ogImage) images.add(ogImage);

    // Buscar URLs de imágenes de producto en el HTML/JS
    const patterns = [
      // CDN de Dropi
      /https?:\/\/[^"'\s]+dropi[^"'\s]+\.(?:jpg|jpeg|png|webp)[^"'\s]*/gi,
      // Cloudinary (Dropi usa Cloudinary)
      /https?:\/\/res\.cloudinary\.com\/[^"'\s]+\.(?:jpg|jpeg|png|webp)[^"'\s]*/gi,
      // AWS S3
      /https?:\/\/[^"'\s]*s3[^"'\s]*\.(?:jpg|jpeg|png|webp)[^"'\s]*/gi,
      // Cualquier imagen grande en JSON embebido
      /"(?:image|photo|img|url_image|gallery|multimedia)[^"]*"\s*:\s*"(https?:\/\/[^"]+\.(?:jpg|jpeg|png|webp)[^"]*)"/gi,
      // TikTok CDN (algunos productos de Dropi vienen de TikTok)
      /https?:\/\/[^"'\s]*tiktokcdn[^"'\s]*\.(?:jpg|jpeg|png|webp)[^"'\s]*/gi,
    ];

    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(html)) !== null) {
        const imgUrl = (match[1] || match[0]).replace(/\\/g, "").replace(/&amp;/g, "&");
        if (isValidProductImage(imgUrl)) {
          images.add(imgUrl);
        }
      }
    }

    return [...images].slice(0, 10);
  } catch {
    return [];
  }
}

// ─── BUSCAR IMÁGENES DEL PRODUCTO EN GOOGLE ─────────────────
async function searchProductImages(productName) {
  try {
    const query = encodeURIComponent(`${productName} product photo`);
    const res = await fetch(`https://www.google.com/search?q=${query}&tbm=isch&hl=es`, {
      headers: { "User-Agent": UA, "Accept": "text/html" },
    });

    if (!res.ok) return [];
    const html = await res.text();
    const images = [];

    // Google embeds image data in scripts
    const imgPattern = /\["(https?:\/\/[^"]+\.(?:jpg|jpeg|png|webp)[^"]*)",\d+,\d+\]/gi;
    let match;
    while ((match = imgPattern.exec(html)) !== null && images.length < 8) {
      const url = match[1].replace(/\\u003d/g, "=").replace(/\\u0026/g, "&");
      if (isValidProductImage(url) && !url.includes("gstatic") && url.length > 50) {
        images.push(url);
      }
    }

    // Fallback: encrypted thumbnails from Google
    if (images.length === 0) {
      const thumbPattern = /https?:\/\/encrypted-tbn\d\.gstatic\.com\/images[^"'\s>]+/gi;
      while ((match = thumbPattern.exec(html)) !== null && images.length < 6) {
        images.push(match[0].replace(/&amp;/g, "&"));
      }
    }

    console.log(`[Dropi v2] Google Images: ${images.length} encontradas`);
    return images;
  } catch {
    return [];
  }
}

// ─── VALIDAR QUE ES IMAGEN DE PRODUCTO ──────────────────────
function isValidProductImage(url) {
  if (!url || typeof url !== "string") return false;
  const lower = url.toLowerCase();
  if (lower.includes("logo") || lower.includes("icon") || lower.includes("avatar")) return false;
  if (lower.includes("favicon") || lower.includes("banner") || lower.includes("placeholder")) return false;
  if (lower.includes("1x1") || lower.includes("pixel") || lower.endsWith(".svg")) return false;
  if (url.length < 30) return false;
  return true;
}

// ─── EXTRAER IMÁGENES DE CUALQUIER OBJETO ───────────────────
function extractImagesFromObject(obj) {
  const images = [];
  if (!obj) return images;

  const imageKeys = ["images", "gallery", "url_images", "multimedia", "photos"];
  for (const key of imageKeys) {
    const val = obj[key];
    if (Array.isArray(val)) {
      for (const item of val) {
        if (typeof item === "string" && item.startsWith("http")) images.push(item);
        else if (item?.src) images.push(item.src);
        else if (item?.url) images.push(item.url);
      }
    }
  }

  if (obj.image && typeof obj.image === "string") images.push(obj.image);
  if (obj.img && typeof obj.img === "string") images.push(obj.img);

  return images.filter(u => u && typeof u === "string" && u.startsWith("http"));
}
