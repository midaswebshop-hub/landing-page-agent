// lib/dropi_v3.js
// ============================================================
// DROPI SCRAPER v3 — Extracción de imágenes REALES de Dropi
// Estrategia: interceptar la API interna que usa la SPA Angular
// Las imágenes están en CloudFront: d3sk39qh2f4j46.cloudfront.net
// NO TOCAR dropi_v2.js — esta es versión nueva
// ============================================================

const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
const CLOUDFRONT_BASE = "https://d3sk39qh2f4j46.cloudfront.net";

const DROPI_COUNTRIES = {
  CR: { name: "Costa Rica", currency: "CRC", symbol: "₡", api: "https://api.dropi.cr", web: "https://app.dropi.cr" },
  GT: { name: "Guatemala", currency: "GTQ", symbol: "Q", api: "https://api.dropi.gt", web: "https://app.dropi.gt" },
  CO: { name: "Colombia", currency: "COP", symbol: "$", api: "https://api.dropi.co", web: "https://app.dropi.co" },
};

// ─── EXTRAER PRODUCTO DE URL DE DROPI ───────────────────────
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

    console.log(`[Dropi v3] Extrayendo "${productName}" (ID:${productId}) de ${countryConfig.name}`);

    // Estrategia 1: Login web + API interna del dashboard
    let images = [];
    let productData = null;

    const webToken = await loginDropiWeb(country);
    if (webToken) {
      productData = await fetchProductFromWebApi(productId, country, webToken);
      if (productData?.images?.length > 0) {
        images = productData.images;
        console.log(`[Dropi v3] API web: ${images.length} imágenes encontradas`);
      }
    }

    // Estrategia 2: Scrapear HTML buscando datos JSON embebidos en la SPA
    if (images.length === 0) {
      console.log(`[Dropi v3] API web sin resultado — scrapeando SPA...`);
      const spaData = await scrapeDropiSPA(dropiUrl, productId);
      if (spaData.images.length > 0) {
        images = spaData.images;
        if (!productData && spaData.product) productData = spaData.product;
      }
    }

    // Estrategia 3: Probar URLs de CloudFront con patrones comunes
    if (images.length === 0) {
      console.log(`[Dropi v3] Intentando patrones de CloudFront...`);
      images = await tryCloudFrontPatterns(productId, country, productName);
    }

    // Estrategia 4: Buscar en Google Images con query específica
    if (images.length === 0) {
      console.log(`[Dropi v3] Buscando en Google Images...`);
      images = await searchGoogleImages(productName, countryConfig.name);
    }

    console.log(`[Dropi v3] Total: ${images.length} imágenes para "${productName}"`);

    return {
      found: images.length > 0 || !!productData,
      dropiCountry: countryConfig.name,
      dropiCurrency: countryConfig.currency,
      product: {
        name: productData?.name || productName,
        description: productData?.description || "",
        price_local: productData?.price || null,
        currency: countryConfig.currency,
        country,
        compare_price_local: productData?.comparePrice || null,
        stock: productData?.stock || null,
        category: productData?.category || "",
        sku: productData?.sku || "",
        url: dropiUrl,
      },
      images,
      allResults: [],
    };
  } catch (err) {
    console.error(`[Dropi v3] Error:`, err.message);
    return { found: false, product: null, images: [] };
  }
}

// ─── ESTRATEGIA 1: LOGIN WEB + API INTERNA ──────────────────
async function loginDropiWeb(country) {
  const config = DROPI_COUNTRIES[country];
  const email = process.env[`DROPI_${country}_EMAIL`];
  const password = process.env[`DROPI_${country}_PASSWORD`];
  if (!email || !password) return null;

  // Intentar login con el endpoint web (no integrations)
  const endpoints = [
    { url: `${config.api}/auth/login`, body: { email, password } },
    { url: `${config.api}/login`, body: { email, password } },
    { url: `${config.api}/api/auth/login`, body: { email, password } },
  ];

  for (const ep of endpoints) {
    try {
      const res = await fetch(ep.url, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(ep.body),
        signal: AbortSignal.timeout(10000),
      });
      if (!res.ok) continue;
      const data = await res.json();
      const token = data?.objects?.access_token || data?.token || data?.access_token;
      if (token) {
        console.log(`[Dropi v3] Login web exitoso via ${ep.url}`);
        return token;
      }
    } catch {}
  }

  // Fallback: usar token de integración
  try {
    const res = await fetch(`${config.api}/integrations/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, white_brand_id: 1 }),
      signal: AbortSignal.timeout(10000),
    });
    const data = await res.json();
    if (data.token) {
      console.log(`[Dropi v3] Login integración exitoso`);
      return data.token;
    }
  } catch {}

  return null;
}

// ─── FETCH PRODUCTO DE API WEB ──────────────────────────────
async function fetchProductFromWebApi(productId, country, token) {
  if (!productId || !token) return null;
  const config = DROPI_COUNTRIES[country];

  const endpoints = [
    `${config.api}/products/${productId}`,
    `${config.api}/api/products/${productId}`,
    `${config.api}/catalog/product/${productId}`,
    `${config.api}/integrations/products/${productId}`,
  ];

  for (const url of endpoints) {
    try {
      const res = await fetch(url, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "dropi-integration-key": token,
          "Accept": "application/json",
          "User-Agent": UA,
        },
        signal: AbortSignal.timeout(10000),
      });
      if (!res.ok) continue;
      const data = await res.json();
      if (!data.isSuccess && !data.data && !data.objects) continue;

      const p = data.objects || data.data || data;
      const images = extractImagesFromProduct(p);

      if (images.length > 0 || p.name) {
        return {
          name: p.name || p.title || "",
          description: p.description || p.dropi_app_description || "",
          price: p.sale_price || p.price || null,
          comparePrice: p.suggested_price || p.compare_price || null,
          stock: p.stock || null,
          category: p.categories?.[0]?.name || "",
          sku: p.sku || "",
          images,
        };
      }
    } catch {}
  }
  return null;
}

// ─── ESTRATEGIA 2: SCRAPEAR SPA ────────────────────────────
async function scrapeDropiSPA(url, productId) {
  const result = { images: [], product: null };
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": UA, "Accept": "text/html" },
      redirect: "follow",
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return result;
    const html = await res.text();
    const images = new Set();

    // 1. Buscar imágenes de CloudFront (patrón principal de Dropi)
    const cfPattern = /https?:\/\/d3sk39qh2f4j46\.cloudfront\.net\/[^"'\s\\]+/gi;
    let match;
    while ((match = cfPattern.exec(html)) !== null) {
      const imgUrl = match[0].replace(/\\/g, "");
      if (isValidProductImage(imgUrl)) images.add(imgUrl);
    }

    // 2. Buscar cualquier URL de CloudFront
    const cfGeneric = /https?:\/\/[a-z0-9]+\.cloudfront\.net\/[^"'\s\\]+\.(?:jpg|jpeg|png|webp)/gi;
    while ((match = cfGeneric.exec(html)) !== null) {
      const imgUrl = match[0].replace(/\\/g, "");
      if (isValidProductImage(imgUrl)) images.add(imgUrl);
    }

    // 3. Buscar datos JSON embebidos (Angular puede pre-renderizar datos)
    const jsonPattern = /"image"\s*:\s*"([^"]+)"/gi;
    while ((match = jsonPattern.exec(html)) !== null) {
      const imgPath = match[1].replace(/\\/g, "");
      if (imgPath.startsWith("http") && isValidProductImage(imgPath)) {
        images.add(imgPath);
      } else if (imgPath && !imgPath.startsWith("http") && imgPath.includes("/")) {
        images.add(`${CLOUDFRONT_BASE}/${imgPath}`);
      }
    }

    // 4. Buscar en meta tags
    const ogImage = html.match(/property="og:image"[^>]*content="([^"]+)"/)?.[1];
    if (ogImage && isValidProductImage(ogImage)) images.add(ogImage);

    // 5. Buscar URLs de Cloudinary (algunos productos usan Cloudinary)
    const cloudinaryPattern = /https?:\/\/res\.cloudinary\.com\/[^"'\s\\]+\.(?:jpg|jpeg|png|webp)/gi;
    while ((match = cloudinaryPattern.exec(html)) !== null) {
      if (isValidProductImage(match[0])) images.add(match[0]);
    }

    result.images = [...images].filter(isValidProductImage).slice(0, 10);
    return result;
  } catch {
    return result;
  }
}

// ─── ESTRATEGIA 3: PATRONES DE CLOUDFRONT ───────────────────
async function tryCloudFrontPatterns(productId, country, productName) {
  if (!productId) return [];
  const images = [];
  const countryLower = country.toLowerCase();
  const countryNames = { CR: "costa-rica", GT: "guatemala", CO: "colombia" };
  const countryName = countryNames[country] || countryLower;

  // Patrones comunes de Dropi para almacenar imágenes
  const patterns = [
    `${CLOUDFRONT_BASE}/${countryName}/products/${productId}`,
    `${CLOUDFRONT_BASE}/products/${productId}`,
    `${CLOUDFRONT_BASE}/${countryLower}/product/${productId}`,
  ];

  // Extensiones comunes
  const extensions = [".jpg", ".jpeg", ".png", ".webp"];
  // Sufijos comunes (imagen principal, galería)
  const suffixes = ["", "/main", "/1", "/2", "/3", "_1", "_2", "_main"];

  for (const base of patterns) {
    for (const ext of extensions) {
      for (const suffix of suffixes) {
        const url = `${base}${suffix}${ext}`;
        try {
          const res = await fetch(url, {
            method: "HEAD",
            signal: AbortSignal.timeout(3000),
          });
          if (res.ok) {
            const contentType = res.headers.get("content-type") || "";
            if (contentType.startsWith("image/")) {
              images.push(url);
              console.log(`[Dropi v3] CloudFront hit: ${url}`);
            }
          }
        } catch {}

        // No hacer demasiadas peticiones
        if (images.length >= 5) return images;
      }
    }
    // Si encontramos algo en este patrón, no seguir con otros
    if (images.length > 0) return images;
  }

  return images;
}

// ─── ESTRATEGIA 4: GOOGLE IMAGES ────────────────────────────
async function searchGoogleImages(productName, countryName) {
  try {
    // Búsqueda más específica para evitar imágenes genéricas
    const queries = [
      `"${productName}" producto foto real`,
      `${productName} dropshipping ${countryName}`,
    ];

    const allImages = [];

    for (const q of queries) {
      if (allImages.length >= 5) break;

      const query = encodeURIComponent(q);
      const res = await fetch(`https://www.google.com/search?q=${query}&tbm=isch&hl=es`, {
        headers: { "User-Agent": UA, "Accept": "text/html" },
        signal: AbortSignal.timeout(10000),
      });

      if (!res.ok) continue;
      const html = await res.text();

      // Buscar imágenes de alta calidad en los datos JSON de Google
      const imgPattern = /\["(https?:\/\/[^"]+\.(?:jpg|jpeg|png|webp)[^"]*)",(\d+),(\d+)\]/gi;
      let match;
      while ((match = imgPattern.exec(html)) !== null && allImages.length < 8) {
        const url = match[1].replace(/\\u003d/g, "=").replace(/\\u0026/g, "&");
        const width = parseInt(match[2]);
        const height = parseInt(match[3]);

        // Solo imágenes grandes (producto real, no thumbnails)
        if (width >= 300 && height >= 300 && isValidProductImage(url) && !url.includes("gstatic")) {
          allImages.push(url);
        }
      }
    }

    console.log(`[Dropi v3] Google Images: ${allImages.length} encontradas`);
    return [...new Set(allImages)].slice(0, 6);
  } catch {
    return [];
  }
}

// ─── EXTRAER IMÁGENES DE OBJETO PRODUCTO ────────────────────
function extractImagesFromProduct(obj) {
  if (!obj) return [];
  const images = new Set();

  // Imagen principal
  if (obj.image && typeof obj.image === "string") {
    const url = obj.image.startsWith("http") ? obj.image : `${CLOUDFRONT_BASE}/${obj.image}`;
    images.add(url);
  }

  // Gallery / multimedia / url_images
  const arrayKeys = ["gallery", "url_images", "multimedia", "images", "photos", "product_images"];
  for (const key of arrayKeys) {
    const val = obj[key];
    if (!Array.isArray(val)) continue;
    for (const item of val) {
      if (typeof item === "string" && item.length > 5) {
        images.add(item.startsWith("http") ? item : `${CLOUDFRONT_BASE}/${item}`);
      } else if (item?.src) {
        images.add(item.src.startsWith("http") ? item.src : `${CLOUDFRONT_BASE}/${item.src}`);
      } else if (item?.url) {
        images.add(item.url.startsWith("http") ? item.url : `${CLOUDFRONT_BASE}/${item.url}`);
      } else if (item?.image) {
        images.add(item.image.startsWith("http") ? item.image : `${CLOUDFRONT_BASE}/${item.image}`);
      }
    }
  }

  // Variaciones con imágenes
  if (Array.isArray(obj.variations)) {
    for (const v of obj.variations) {
      if (v.image) {
        const url = v.image.startsWith("http") ? v.image : `${CLOUDFRONT_BASE}/${v.image}`;
        images.add(url);
      }
    }
  }

  return [...images].filter(isValidProductImage);
}

// ─── VALIDAR IMAGEN ─────────────────────────────────────────
function isValidProductImage(url) {
  if (!url || typeof url !== "string" || url.length < 30) return false;
  const lower = url.toLowerCase();
  if (lower.includes("logo") || lower.includes("icon") || lower.includes("avatar")) return false;
  if (lower.includes("favicon") || lower.includes("banner") || lower.includes("placeholder")) return false;
  if (lower.includes("1x1") || lower.includes("pixel") || lower.endsWith(".svg")) return false;
  if (lower.includes("user/") && lower.includes("/logo/")) return false; // Logos de usuarios
  return true;
}
