// lib/dropi_v3.js
// ============================================================
// DROPI SCRAPER v3 — Extracción de imágenes REALES de Dropi
// Las imágenes están en CloudFront: d3sk39qh2f4j46.cloudfront.net
// Patrón: /{pais}/products/{ID}/{filename}.{ext}
// Estrategia: buscar las rutas en el HTML/JS de la SPA Angular
// NO TOCAR dropi_v2.js — esta es versión nueva
// ============================================================

const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
const CLOUDFRONT_BASE = "https://d3sk39qh2f4j46.cloudfront.net";

const DROPI_COUNTRIES = {
  CR: { name: "Costa Rica", currency: "CRC", symbol: "₡", web: "https://app.dropi.cr", cfPath: "costarica" },
  GT: { name: "Guatemala", currency: "GTQ", symbol: "Q", web: "https://app.dropi.gt", cfPath: "guatemala" },
  CO: { name: "Colombia", currency: "COP", symbol: "$", web: "https://app.dropi.co", cfPath: "colombia" },
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

    let images = [];

    // Estrategia 1: Scrapear la SPA buscando URLs de CloudFront en todo el contenido
    images = await scrapeCloudFrontUrls(dropiUrl, productId, countryConfig.cfPath);
    if (images.length > 0) {
      console.log(`[Dropi v3] SPA scrape: ${images.length} imágenes CloudFront`);
    }

    // Estrategia 2: Probar rutas de CloudFront con el patrón conocido
    if (images.length === 0 && productId) {
      console.log(`[Dropi v3] Probando patrones de CloudFront...`);
      images = await probeCloudFrontImages(productId, countryConfig.cfPath);
      if (images.length > 0) {
        console.log(`[Dropi v3] CloudFront probe: ${images.length} imágenes`);
      }
    }

    // Estrategia 3: API de integración (puede tener datos del producto)
    let productData = null;
    const apiResult = await tryIntegrationApi(productId, country);
    if (apiResult) {
      productData = apiResult;
      if (apiResult.images?.length > 0 && images.length === 0) {
        images = apiResult.images;
      }
    }

    // Estrategia 4: Google Images como último recurso
    if (images.length === 0) {
      console.log(`[Dropi v3] Google Images fallback...`);
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
        sku: "",
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

// ─── ESTRATEGIA 1: SCRAPEAR URLS DE CLOUDFRONT ─────────────
async function scrapeCloudFrontUrls(dropiUrl, productId, cfPath) {
  try {
    const res = await fetch(dropiUrl, {
      headers: { "User-Agent": UA, "Accept": "text/html,application/xhtml+xml" },
      redirect: "follow",
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return [];
    const html = await res.text();
    const images = new Set();

    // Patrón 1: URLs completas de CloudFront con el path del producto
    const cfProductPattern = new RegExp(
      `https?://d3sk39qh2f4j46\\.cloudfront\\.net/${cfPath}/products/${productId}/[^"'\\s\\\\]+\\.(?:jpg|jpeg|png|webp)`,
      "gi"
    );
    let match;
    while ((match = cfProductPattern.exec(html)) !== null) {
      images.add(cleanUrl(match[0]));
    }

    // Patrón 2: Cualquier URL de CloudFront de este producto
    const cfAnyPattern = new RegExp(
      `https?://d3sk39qh2f4j46\\.cloudfront\\.net/[^"'\\s\\\\]+/products/${productId}/[^"'\\s\\\\]+`,
      "gi"
    );
    while ((match = cfAnyPattern.exec(html)) !== null) {
      const url = cleanUrl(match[0]);
      if (isValidProductImage(url)) images.add(url);
    }

    // Patrón 3: Cualquier URL de CloudFront con extensión de imagen
    const cfGenericPattern = /https?:\/\/d3sk39qh2f4j46\.cloudfront\.net\/[^"'\s\\]+\.(?:jpg|jpeg|png|webp)/gi;
    while ((match = cfGenericPattern.exec(html)) !== null) {
      const url = cleanUrl(match[0]);
      if (isValidProductImage(url) && url.includes("/products/")) images.add(url);
    }

    // Patrón 4: Rutas relativas de CloudFront embebidas en JSON
    const pathPattern = new RegExp(
      `"(?:image|img|photo|url_image|gallery|multimedia)[^"]*"\\s*:\\s*"(${cfPath}/products/${productId}/[^"]+)"`,
      "gi"
    );
    while ((match = pathPattern.exec(html)) !== null) {
      const path = match[1].replace(/\\\//g, "/");
      images.add(`${CLOUDFRONT_BASE}/${path}`);
    }

    // Patrón 5: Cualquier ruta que contenga products/{ID}/ con extensión de imagen
    const relativePattern = new RegExp(
      `["']((?:${cfPath}|costarica|colombia|guatemala)/products/${productId}/[^"'\\s]+\\.(?:jpg|jpeg|png|webp))["']`,
      "gi"
    );
    while ((match = relativePattern.exec(html)) !== null) {
      images.add(`${CLOUDFRONT_BASE}/${match[1].replace(/\\\//g, "/")}`);
    }

    return [...images].filter(isValidProductImage).slice(0, 10);
  } catch (err) {
    console.log(`[Dropi v3] Scrape error: ${err.message}`);
    return [];
  }
}

// ─── ESTRATEGIA 2: PROBAR URLS DE CLOUDFRONT ────────────────
async function probeCloudFrontImages(productId, cfPath) {
  const images = [];

  // Patrón descubierto: {cfPath}/products/{ID}/{timestamp}{name}{N}.{ext}
  // No conocemos el timestamp ni el nombre, pero podemos hacer HEAD requests
  // con los paths del país alternativo también

  const paths = [cfPath, "costarica", "colombia", "guatemala"];
  const extensions = ["jpg", "webp", "png", "jpeg"];

  for (const path of paths) {
    // Intentar listar con un request al directorio (algunos CDN lo permiten)
    const baseUrl = `${CLOUDFRONT_BASE}/${path}/products/${productId}/`;

    // Intentar patrones comunes de nombres de archivo de Dropi
    // Los archivos siguen el patrón: {timestamp}{nombre}{numero}.{ext}
    // No podemos adivinar el timestamp, pero podemos intentar
    // buscar en el HTML de la SPA que a veces tiene las rutas pre-cargadas

    // Intentar con la API de listado de S3 (a veces funciona)
    try {
      const listRes = await fetch(`${baseUrl}`, {
        headers: { "User-Agent": UA },
        signal: AbortSignal.timeout(5000),
      });
      if (listRes.ok) {
        const listHtml = await listRes.text();
        // S3 listing devuelve XML con <Key> tags
        const keyPattern = /<Key>([^<]+\.(?:jpg|jpeg|png|webp))<\/Key>/gi;
        let match;
        while ((match = keyPattern.exec(listHtml)) !== null) {
          images.push(`${CLOUDFRONT_BASE}/${match[1]}`);
        }
        if (images.length > 0) return images;
      }
    } catch {}

    if (path === cfPath && images.length === 0) continue;
    if (images.length > 0) break;
  }

  return images.filter(isValidProductImage).slice(0, 10);
}

// ─── ESTRATEGIA 3: API DE INTEGRACIÓN ──────────────────────
async function tryIntegrationApi(productId, country) {
  if (!productId) return null;
  const apiBase = {
    CR: "https://api.dropi.cr",
    GT: "https://api.dropi.gt",
    CO: "https://api.dropi.co",
  }[country];

  const email = process.env[`DROPI_${country}_EMAIL`];
  const password = process.env[`DROPI_${country}_PASSWORD`];
  if (!email || !password) return null;

  try {
    const loginRes = await fetch(`${apiBase}/integrations/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, white_brand_id: 1 }),
      signal: AbortSignal.timeout(10000),
    });
    const loginData = await loginRes.json();
    if (!loginData.token) return null;

    // Buscar en el catálogo de productos importados
    const searchRes = await fetch(`${apiBase}/integrations/products`, {
      method: "POST",
      headers: {
        "dropi-integration-key": loginData.token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ page: 1, per_page: 50 }),
      signal: AbortSignal.timeout(10000),
    });

    if (searchRes.ok) {
      const searchData = await searchRes.json();
      const products = searchData.data?.data || searchData.data || [];
      const product = Array.isArray(products)
        ? products.find((p) => String(p.id) === String(productId))
        : null;

      if (product) {
        const imgs = extractImagesFromProduct(product);
        return {
          name: product.name || product.title || "",
          description: product.description || "",
          price: product.sale_price || product.price || null,
          comparePrice: product.suggested_price || null,
          stock: product.stock || null,
          category: product.categories?.[0]?.name || "",
          images: imgs,
        };
      }
    }
  } catch {}

  return null;
}

// ─── ESTRATEGIA 4: GOOGLE IMAGES ────────────────────────────
async function searchGoogleImages(productName, countryName) {
  try {
    // Queries más específicas para productos de e-commerce
    const query = encodeURIComponent(`${productName} producto tienda online alta calidad`);
    const res = await fetch(`https://www.google.com/search?q=${query}&tbm=isch&hl=es`, {
      headers: { "User-Agent": UA, "Accept": "text/html" },
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) return [];
    const html = await res.text();
    const allImages = [];

    const imgPattern = /\["(https?:\/\/[^"]+\.(?:jpg|jpeg|png|webp)[^"]*)",(\d+),(\d+)\]/gi;
    let match;
    while ((match = imgPattern.exec(html)) !== null && allImages.length < 6) {
      const url = match[1].replace(/\\u003d/g, "=").replace(/\\u0026/g, "&");
      const width = parseInt(match[2]);
      const height = parseInt(match[3]);
      if (width >= 300 && height >= 300 && isValidProductImage(url) && !url.includes("gstatic")) {
        allImages.push(url);
      }
    }

    console.log(`[Dropi v3] Google: ${allImages.length} imágenes`);
    return [...new Set(allImages)];
  } catch {
    return [];
  }
}

// ─── ENRIQUECER PRODUCTO POR NOMBRE (búsqueda automática) ──
// Compatible con agent.js — reemplaza enrichWithDropi de dropi.js
export async function enrichWithDropi(productName, options = {}) {
  const { country = "CR" } = options;
  const cc = country.toUpperCase();
  const countryConfig = DROPI_COUNTRIES[cc] || DROPI_COUNTRIES.CR;

  try {
    console.log(`[Dropi v3] Enriqueciendo "${productName}" en ${countryConfig.name}...`);

    // Intentar buscar via API de integración
    let productData = null;
    let images = [];

    const email = process.env[`DROPI_${cc}_EMAIL`];
    const password = process.env[`DROPI_${cc}_PASSWORD`];

    if (email && password) {
      const apiBase = { CR: "https://api.dropi.cr", GT: "https://api.dropi.gt", CO: "https://api.dropi.co" }[cc];
      try {
        const loginRes = await fetch(`${apiBase}/integrations/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, white_brand_id: 1 }),
          signal: AbortSignal.timeout(10000),
        });
        const loginData = await loginRes.json();

        if (loginData.token) {
          const searchRes = await fetch(`${apiBase}/integrations/products`, {
            method: "POST",
            headers: {
              "dropi-integration-key": loginData.token,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ page: 1, per_page: 50 }),
            signal: AbortSignal.timeout(10000),
          });

          if (searchRes.ok) {
            const searchData = await searchRes.json();
            const products = searchData.data?.data || searchData.data || [];
            const nameLower = productName.toLowerCase();
            const match = Array.isArray(products)
              ? products.find((p) => (p.name || p.title || "").toLowerCase().includes(nameLower))
              : null;

            if (match) {
              images = extractImagesFromProduct(match);
              productData = {
                name: match.name || match.title || productName,
                description: match.description || "",
                price_local: match.sale_price || match.price || null,
                currency: countryConfig.currency,
                country: cc,
                compare_price_local: match.suggested_price || null,
                stock: match.stock || null,
                category: match.categories?.[0]?.name || "",
                sku: match.sku || "",
                url: null,
              };
              console.log(`[Dropi v3] Encontrado: "${productData.name}" — ${productData.price_local} ${countryConfig.currency}`);
            }
          }
        }
      } catch (err) {
        console.log(`[Dropi v3] API error: ${err.message}`);
      }
    }

    // Fallback: Google Images si no hay imágenes
    if (images.length === 0) {
      images = await searchGoogleImages(productName, countryConfig.name);
    }

    return {
      found: !!productData || images.length > 0,
      dropiCountry: countryConfig.name,
      dropiCurrency: countryConfig.currency,
      product: productData || {
        name: productName,
        description: "",
        price_local: null,
        currency: countryConfig.currency,
        country: cc,
        compare_price_local: null,
        stock: null,
        category: "",
        sku: "",
        url: null,
      },
      images,
      allResults: [],
    };
  } catch (err) {
    console.error(`[Dropi v3] Error enriqueciendo "${productName}":`, err.message);
    return { found: false, product: null, images: [] };
  }
}

// ─── UTILIDADES ─────────────────────────────────────────────
function cleanUrl(url) {
  return url.replace(/\\/g, "").replace(/&amp;/g, "&").replace(/["'>\s].*/g, "");
}

function extractImagesFromProduct(obj) {
  if (!obj) return [];
  const images = new Set();

  if (obj.image && typeof obj.image === "string") {
    images.add(obj.image.startsWith("http") ? obj.image : `${CLOUDFRONT_BASE}/${obj.image}`);
  }

  for (const key of ["gallery", "url_images", "multimedia", "images", "photos"]) {
    const val = obj[key];
    if (!Array.isArray(val)) continue;
    for (const item of val) {
      if (typeof item === "string" && item.length > 5) {
        images.add(item.startsWith("http") ? item : `${CLOUDFRONT_BASE}/${item}`);
      } else if (item?.src) images.add(item.src.startsWith("http") ? item.src : `${CLOUDFRONT_BASE}/${item.src}`);
      else if (item?.url) images.add(item.url.startsWith("http") ? item.url : `${CLOUDFRONT_BASE}/${item.url}`);
      else if (item?.image) images.add(item.image.startsWith("http") ? item.image : `${CLOUDFRONT_BASE}/${item.image}`);
    }
  }

  return [...images].filter(isValidProductImage);
}

function isValidProductImage(url) {
  if (!url || typeof url !== "string" || url.length < 30) return false;
  const lower = url.toLowerCase();
  if (lower.includes("logo") || lower.includes("icon") || lower.includes("avatar")) return false;
  if (lower.includes("favicon") || lower.includes("banner") || lower.includes("placeholder")) return false;
  if (lower.includes("1x1") || lower.includes("pixel") || lower.endsWith(".svg")) return false;
  if (lower.includes("user/") && lower.includes("/logo/")) return false;
  if (lower.includes("flags/") || lower.includes("unicons")) return false;
  return true;
}
