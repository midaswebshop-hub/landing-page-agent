// lib/scraper.js
// ============================================================
// SCRAPER PRO — Analiza cualquier URL de producto o competidor
// Extrae: imágenes, título, precio, descripción, reviews, features
// Funciona con: AliExpress, Amazon, Shopify, Mercado Libre, cualquier web
// ============================================================

const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36";

// ─── FUNCIÓN PRINCIPAL: ANALIZAR CUALQUIER URL ──────────────
export async function analyzeUrl(url) {
  if (!url) return { ok: false, error: "URL vacía" };

  try {
    console.log(`[Scraper] Analizando: ${url}`);

    const domain = new URL(url).hostname.toLowerCase();

    // Facebook Ads Library necesita manejo especial
    if (domain.includes("facebook.com") && url.includes("/ads/library")) {
      const data = await extractFacebookAdsLibrary(url);
      if (data && data.title) {
        data.sourceUrl = url;
        data.sourceDomain = domain;
        data.title = cleanText(data.title);
        data.description = cleanText(data.description);
        data.images = (data.images || []).filter(img => typeof img === "string" && img.startsWith("http")).slice(0, 15);
        console.log(`[Scraper] FB Ads Library: "${data.title}" — ${data.images.length} imgs`);
        return { ok: true, data };
      }
    }

    const res = await fetch(url, {
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "es-CO,es;q=0.9,en;q=0.8",
      },
      redirect: "follow",
    });

    if (!res.ok) return { ok: false, error: `HTTP ${res.status}` };

    const html = await res.text();

    // Detectar tipo de sitio y usar extractor especializado
    let data;
    if (domain.includes("facebook.com") && url.includes("/ads/library")) {
      data = await extractFacebookAdsLibrary(url, html);
    } else if (domain.includes("aliexpress")) {
      data = extractAliExpress(html, url);
    } else if (domain.includes("amazon")) {
      data = extractAmazon(html, url);
    } else if (domain.includes("mercadolibre") || domain.includes("mercadolivre")) {
      data = extractMercadoLibre(html, url);
    } else if (domain.includes("myshopify") || domain.includes("shopify")) {
      data = extractShopify(html, url);
    } else {
      // Extractor genérico — funciona con cualquier web
      data = extractGeneric(html, url);
    }

    data.sourceUrl = url;
    data.sourceDomain = domain;

    // Limpiar datos — asegurar que todo sea del tipo correcto
    data.title = cleanText(data.title);
    data.description = cleanText(data.description);
    data.images = (data.images || [])
      .map((img) => {
        if (typeof img === "string") return img;
        if (typeof img === "object" && img) return img.src || img.url || img.contentUrl || "";
        return "";
      })
      .filter((img) => typeof img === "string" && img.startsWith("http"))
      .slice(0, 15);

    console.log(`[Scraper] Extraído: "${data.title}" — ${data.images.length} imgs — ${data.price || "sin precio"}`);

    return { ok: true, data };
  } catch (err) {
    console.error(`[Scraper] Error analizando ${url}:`, err.message);
    return { ok: false, error: err.message };
  }
}

// ─── EXTRACTOR: ALIEXPRESS ──────────────────────────────────
function extractAliExpress(html, url) {
  const data = { source: "aliexpress" };

  // Título
  data.title = extractMeta(html, "og:title") || extractTag(html, "h1") || "";

  // Precio
  const priceMatch = html.match(/(?:US\s*\$|USD)\s*([\d,.]+)/i) ||
    html.match(/"formattedActivityPrice"\s*:\s*"[^"]*?([\d,.]+)"/);
  data.price = priceMatch ? priceMatch[1] : null;

  const origPriceMatch = html.match(/"formattedPrice"\s*:\s*"[^"]*?([\d,.]+)"/) ||
    html.match(/class="[^"]*origin[^"]*"[^>]*>[^<]*\$\s*([\d,.]+)/i);
  data.originalPrice = origPriceMatch ? origPriceMatch[1] : null;

  // Imágenes HD de alicdn
  data.images = extractAliExpressImages(html);

  // Descripción
  data.description = extractMeta(html, "og:description") || extractMeta(html, "description") || "";

  // Reviews
  data.reviewCount = null;
  const reviewMatch = html.match(/(\d+)\s*(?:Review|Reseña|opiniones)/i);
  if (reviewMatch) data.reviewCount = parseInt(reviewMatch[1]);

  // Rating
  const ratingMatch = html.match(/"averageStar"\s*:\s*"?([\d.]+)/) || html.match(/([\d.]+)\s*(?:out of 5|de 5)/);
  data.rating = ratingMatch ? parseFloat(ratingMatch[1]) : null;

  // Órdenes/ventas
  const soldMatch = html.match(/([\d,]+)\s*(?:sold|vendidos|orders)/i);
  data.soldCount = soldMatch ? soldMatch[1] : null;

  // Especificaciones
  data.specs = extractSpecs(html);

  return data;
}

// ─── EXTRACTOR: AMAZON ──────────────────────────────────────
function extractAmazon(html, url) {
  const data = { source: "amazon" };

  data.title = extractById(html, "productTitle") || extractMeta(html, "og:title") || "";

  // Precio
  const priceMatch = html.match(/class="[^"]*priceToPay[^"]*"[^>]*>.*?<span[^>]*>([\d,.]+)/s) ||
    html.match(/id="priceblock_ourprice"[^>]*>\$?([\d,.]+)/) ||
    html.match(/class="[^"]*price[^"]*"[^>]*>\$?\s*([\d,.]+)/);
  data.price = priceMatch ? priceMatch[1] : null;

  const origMatch = html.match(/class="[^"]*priceBlockStrikePriceString[^"]*"[^>]*>\$?([\d,.]+)/) ||
    html.match(/class="[^"]*a-text-price[^"]*"[^>]*>.*?>([\d,.]+)/s);
  data.originalPrice = origMatch ? origMatch[1] : null;

  // Imágenes
  data.images = [];
  const imgPattern = /"hiRes"\s*:\s*"(https?:\/\/[^"]+)"/g;
  let match;
  while ((match = imgPattern.exec(html)) !== null) {
    data.images.push(match[1]);
  }
  if (data.images.length === 0) {
    const landingPattern = /"large"\s*:\s*"(https?:\/\/[^"]+)"/g;
    while ((match = landingPattern.exec(html)) !== null) {
      data.images.push(match[1]);
    }
  }

  // Descripción
  data.description = extractById(html, "productDescription") || extractMeta(html, "description") || "";

  // Bullets / features
  data.features = [];
  const bulletPattern = /<span class="a-list-item"[^>]*>\s*([^<]+)</g;
  while ((match = bulletPattern.exec(html)) !== null) {
    const text = match[1].trim();
    if (text.length > 10 && text.length < 300) data.features.push(text);
  }

  // Rating
  const ratingMatch = html.match(/([\d.]+) (?:out of|de) 5/);
  data.rating = ratingMatch ? parseFloat(ratingMatch[1]) : null;

  const reviewMatch = html.match(/([\d,]+)\s*(?:ratings|calificaciones|reviews)/i);
  data.reviewCount = reviewMatch ? reviewMatch[1] : null;

  data.specs = extractSpecs(html);

  return data;
}

// ─── EXTRACTOR: MERCADO LIBRE ───────────────────────────────
function extractMercadoLibre(html, url) {
  const data = { source: "mercadolibre" };

  data.title = extractMeta(html, "og:title") || extractTag(html, "h1") || "";

  const priceMatch = html.match(/class="[^"]*price-tag-fraction[^"]*"[^>]*>([\d,.]+)/) ||
    html.match(/"price"\s*:\s*([\d.]+)/);
  data.price = priceMatch ? priceMatch[1] : null;

  data.images = [];
  const imgPattern = /data-zoom="(https?:\/\/[^"]+)"|"(https?:\/\/http2\.mlstatic\.com\/D_[^"]+)"/g;
  let match;
  while ((match = imgPattern.exec(html)) !== null) {
    data.images.push(match[1] || match[2]);
  }
  if (data.images.length === 0) {
    const ogImage = extractMeta(html, "og:image");
    if (ogImage) data.images.push(ogImage);
  }

  data.description = extractMeta(html, "og:description") || "";

  const ratingMatch = html.match(/([\d.]+)\s*(?:out of|de)\s*5/);
  data.rating = ratingMatch ? parseFloat(ratingMatch[1]) : null;

  const reviewMatch = html.match(/([\d,]+)\s*(?:opiniones|calificaciones)/i);
  data.reviewCount = reviewMatch ? reviewMatch[1] : null;

  data.specs = extractSpecs(html);

  return data;
}

// ─── EXTRACTOR: SHOPIFY (competidores) ──────────────────────
function extractShopify(html, url) {
  const data = { source: "shopify", images: [], features: [] };

  data.title = extractMeta(html, "og:title") || extractTag(html, "h1") || "";
  data.description = extractMeta(html, "og:description") || extractMeta(html, "description") || "";

  // Shopify tiene JSON-LD
  try {
    const jsonLd = extractJsonLd(html, "Product");
    if (jsonLd) {
      data.price = jsonLd.offers?.price || (Array.isArray(jsonLd.offers) ? jsonLd.offers[0]?.price : null) || null;
      if (jsonLd.description) data.description = jsonLd.description;

      // Imágenes del JSON-LD — pueden ser string, array, o objeto
      if (jsonLd.image) {
        const imgs = Array.isArray(jsonLd.image) ? jsonLd.image : [jsonLd.image];
        for (const img of imgs) {
          const imgStr = typeof img === "string" ? img : (img?.url || img?.src || img?.contentUrl || "");
          if (imgStr && typeof imgStr === "string") data.images.push(imgStr);
        }
      }
    }
  } catch (e) {
    // JSON-LD falló, continuar con otros métodos
  }

  // Precio fallback
  if (!data.price) {
    const priceMatch = html.match(/"price"\s*:\s*"?([\d.]+)/) || html.match(/class="[^"]*price[^"]*"[^>]*>[^<]*?\$\s*([\d,.]+)/);
    if (priceMatch) data.price = priceMatch[1];
  }

  // Precio original / comparación
  const compareMatch = html.match(/"compareAtPrice"\s*:\s*"?([\d.]+)/) || html.match(/compare[_-]at[_-]price[^>]*>\s*\$?\s*([\d,.]+)/i);
  if (compareMatch) data.originalPrice = compareMatch[1];

  // Imágenes de Shopify CDN (siempre buscar, complementa JSON-LD)
  const cdnImages = new Set();
  const imgPattern = /\/\/cdn\.shopify\.com\/s\/files\/[^"'\s>]+?\.(jpg|jpeg|png|webp)(?:\?[^"'\s>]*)?/gi;
  let match;
  while ((match = imgPattern.exec(html)) !== null) {
    let imgUrl = "https:" + match[0].split(/["'\s>]/)[0];
    // Versión grande: quitar sufijos de tamaño
    imgUrl = imgUrl.replace(/_\d+x\d*\./g, ".").replace(/[?&]width=\d+/g, "");
    if (!imgUrl.includes("_icon") && !imgUrl.includes("logo") && !imgUrl.includes("favicon")) {
      cdnImages.add(imgUrl);
    }
  }

  // og:image como fallback
  const ogImg = extractMeta(html, "og:image");
  if (ogImg) {
    const ogStr = ogImg.startsWith("//") ? "https:" + ogImg : ogImg;
    cdnImages.add(ogStr);
  }

  // Combinar: JSON-LD primero, luego CDN
  const allImgs = [...data.images, ...cdnImages];
  // Limpiar: asegurar que todo sea string válido
  data.images = [...new Set(
    allImgs
      .filter((img) => typeof img === "string" && img.length > 10)
      .map((img) => img.startsWith("//") ? "https:" + img : img)
      .filter((img) => img.startsWith("http"))
  )].slice(0, 15);

  // Descripción completa del producto
  data.fullDescription = "";
  const descMatch = html.match(/class="[^"]*product[_-]?description[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
  if (descMatch) data.fullDescription = descMatch[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

  data.specs = extractSpecs(html);

  return data;
}

// ─── EXTRACTOR: GENÉRICO (cualquier web) ────────────────────
function extractGeneric(html, url) {
  const data = { source: "generic" };

  // Intentar JSON-LD primero
  const jsonLd = extractJsonLd(html, "Product");
  if (jsonLd) {
    data.title = jsonLd.name || "";
    data.price = jsonLd.offers?.price || jsonLd.offers?.[0]?.price || null;
    data.description = jsonLd.description || "";
    data.images = jsonLd.image ? (Array.isArray(jsonLd.image) ? jsonLd.image : [jsonLd.image]) : [];
    data.rating = jsonLd.aggregateRating?.ratingValue || null;
    data.reviewCount = jsonLd.aggregateRating?.reviewCount || null;
  }

  // Fallback a meta tags
  data.title = data.title || extractMeta(html, "og:title") || extractTag(html, "h1") || extractTag(html, "title") || "";
  data.description = data.description || extractMeta(html, "og:description") || extractMeta(html, "description") || "";

  // Precio
  if (!data.price) {
    const pricePatterns = [
      /(?:precio|price|valor)[^<]*?[\$€₡Q]\s*([\d,.]+)/i,
      /class="[^"]*price[^"]*"[^>]*>[^<]*?([\d,.]+)/i,
      /[\$€₡]\s*([\d,.]+)/,
    ];
    for (const p of pricePatterns) {
      const m = html.match(p);
      if (m) { data.price = m[1]; break; }
    }
  }

  // Imágenes
  if (!data.images || data.images.length === 0) {
    data.images = [];
    // og:image
    const ogImg = extractMeta(html, "og:image");
    if (ogImg) data.images.push(ogImg.startsWith("//") ? "https:" + ogImg : ogImg);

    // Imágenes grandes del contenido
    const imgPattern = /<img[^>]*src="(https?:\/\/[^"]+\.(jpg|jpeg|png|webp)[^"]*)"/gi;
    let match;
    while ((match = imgPattern.exec(html)) !== null) {
      const src = match[1];
      if (!src.includes("logo") && !src.includes("icon") && !src.includes("avatar") &&
          !src.includes("banner") && !src.includes("pixel") && !src.includes("1x1")) {
        data.images.push(src);
      }
    }
  }

  // Features / bullets
  data.features = [];
  const liPattern = /<li[^>]*>\s*([^<]{15,200})\s*<\/li>/gi;
  let match;
  while ((match = liPattern.exec(html)) !== null && data.features.length < 10) {
    const text = match[1].replace(/<[^>]+>/g, "").trim();
    if (text.length > 15) data.features.push(text);
  }

  data.specs = extractSpecs(html);

  return data;
}

// ─── EXTRAER IMÁGENES DE ALIEXPRESS ─────────────────────────
function extractAliExpressImages(html) {
  const images = new Set();

  // Patrón: URLs de alicdn.com
  const patterns = [
    /"imagePathList"\s*:\s*\[(.*?)\]/gs,
    /"imagePath"\s*:\s*"(https?:\/\/[^"]+)"/g,
    /https?:\/\/[a-z0-9-]+\.alicdn\.com\/[^\s"'>,)]+\.(jpg|jpeg|png|webp)/gi,
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(html)) !== null) {
      const segment = match[1] || match[0];
      const urlPattern = /https?:\/\/[a-z0-9-]+\.alicdn\.com\/[^\s"',\]>)]+/gi;
      let urlMatch;
      while ((urlMatch = urlPattern.exec(segment)) !== null) {
        let url = urlMatch[0].replace(/['">\s,\])]+$/, "");
        // HD version
        url = url.replace(/_\d+x\d+\./g, ".").replace(/\.jpg_.*/i, ".jpg").replace(/\.png_.*/i, ".png");
        if (!url.includes("_50x") && !url.includes("_100x") && !url.includes("icon") && url.includes("alicdn.com")) {
          images.add(url);
        }
      }
    }
  }

  return [...images].slice(0, 12);
}

// ─── EXTRACTOR: FACEBOOK ADS LIBRARY ────────────────────────
// Extrae keyword de la URL y busca productos reales con ese término
async function extractFacebookAdsLibrary(fbUrl) {
  try {
    // Extraer la keyword de búsqueda de la URL de Facebook Ads Library
    const urlObj = new URL(fbUrl);
    const keyword = urlObj.searchParams.get("q") || "";
    const country = urlObj.searchParams.get("country") || "ALL";

    if (!keyword) {
      return { source: "facebook-ads-library", title: "", description: "", images: [], error: "No se encontró keyword en la URL" };
    }

    console.log(`[Scraper] FB Ads Library: keyword="${keyword}", country=${country}`);

    // Estrategia: usar la keyword para buscar el producto en fuentes que SÍ podemos scrapear
    // 1. Buscar en Google Shopping con la keyword
    // 2. Buscar en AliExpress con la keyword
    // 3. Combinar resultados

    const [googleData, aliData] = await Promise.all([
      fetchGoogleResults(keyword),
      fetchAliExpressSearch(keyword),
    ]);

    // Combinar los mejores resultados
    const title = googleData.title || aliData.title || keyword;
    const description = googleData.description || aliData.description || `Producto encontrado buscando "${keyword}" en la biblioteca de anuncios de Facebook`;
    const images = [...(googleData.images || []), ...(aliData.images || [])];
    const price = googleData.price || aliData.price || null;

    return {
      source: "facebook-ads-library",
      title,
      description,
      images: [...new Set(images)].slice(0, 12),
      price,
      originalPrice: aliData.originalPrice || null,
      features: [...(googleData.features || []), ...(aliData.features || [])],
      keyword,
      country,
      specs: [],
    };
  } catch (err) {
    console.error("[Scraper] Error FB Ads Library:", err.message);
    return { source: "facebook-ads-library", title: "", description: "", images: [] };
  }
}

// Buscar producto en Google con la keyword
async function fetchGoogleResults(keyword) {
  try {
    const url = `https://www.google.com/search?q=${encodeURIComponent(keyword + " product buy")}&hl=es`;
    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT, "Accept": "text/html", "Accept-Language": "es-419,es;q=0.9" },
    });
    if (!res.ok) return { title: "", images: [], features: [] };
    const html = await res.text();

    const title = extractTag(html, "h3") || keyword;
    const description = extractMeta(html, "description") || "";
    const images = [];
    const features = [];

    // Extraer imágenes de Google Shopping embebidas
    const imgPattern = /https?:\/\/encrypted-tbn\d\.gstatic\.com\/(?:shopping|images)[^"'\s>]+/gi;
    let match;
    while ((match = imgPattern.exec(html)) !== null) {
      images.push(match[0].replace(/&amp;/g, "&"));
    }

    // Precio
    let price = null;
    const priceMatch = html.match(/\$\s*([\d,.]+)/);
    if (priceMatch) price = priceMatch[1];

    return { title, description, images: images.slice(0, 6), price, features };
  } catch {
    return { title: "", images: [], features: [] };
  }
}

// Buscar producto en AliExpress con la keyword
async function fetchAliExpressSearch(keyword) {
  try {
    const url = `https://www.aliexpress.com/wholesale?SearchText=${encodeURIComponent(keyword)}`;
    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT, "Accept": "text/html", "Accept-Language": "es-419,es;q=0.9" },
      redirect: "follow",
    });
    if (!res.ok) return { title: "", images: [], features: [] };
    const html = await res.text();

    const images = [];
    const titles = [];

    // Extraer imágenes de productos
    const imgPattern = /https?:\/\/[a-z0-9-]+\.alicdn\.com\/[^\s"',>]+\.(?:jpg|jpeg|png|webp)/gi;
    let match;
    while ((match = imgPattern.exec(html)) !== null) {
      let img = match[0].replace(/_\d+x\d+\./g, ".");
      if (!img.includes("_50x") && !img.includes("_100x") && !img.includes("icon") && !img.includes("logo")) {
        images.push(img);
      }
    }

    // Extraer título del primer producto
    const titleMatch = html.match(/"subject"\s*:\s*"([^"]+)"/) || html.match(/<h1[^>]*>([^<]+)/);
    const title = titleMatch ? titleMatch[1] : keyword;

    // Precio
    let price = null;
    const priceMatch = html.match(/"minPrice"\s*:\s*"([\d.]+)"/) || html.match(/US\s*\$\s*([\d.]+)/);
    if (priceMatch) price = priceMatch[1];

    let originalPrice = null;
    const origMatch = html.match(/"maxPrice"\s*:\s*"([\d.]+)"/);
    if (origMatch) originalPrice = origMatch[1];

    return { title, description: "", images: [...new Set(images)].slice(0, 8), price, originalPrice, features: [] };
  } catch {
    return { title: "", images: [], features: [] };
  }
}

// ─── UTILIDADES DE EXTRACCIÓN ───────────────────────────────
function extractMeta(html, property) {
  const patterns = [
    new RegExp(`<meta[^>]*property="${property}"[^>]*content="([^"]*)"`, "i"),
    new RegExp(`<meta[^>]*name="${property}"[^>]*content="([^"]*)"`, "i"),
    new RegExp(`<meta[^>]*content="([^"]*)"[^>]*property="${property}"`, "i"),
    new RegExp(`<meta[^>]*content="([^"]*)"[^>]*name="${property}"`, "i"),
  ];
  for (const p of patterns) {
    const m = html.match(p);
    if (m) return decodeHtmlEntities(m[1]);
  }
  return null;
}

function extractTag(html, tag) {
  const m = html.match(new RegExp(`<${tag}[^>]*>([^<]+)</${tag}>`, "i"));
  return m ? decodeHtmlEntities(m[1].trim()) : null;
}

function extractById(html, id) {
  const m = html.match(new RegExp(`id="${id}"[^>]*>([\\s\\S]*?)</`, "i"));
  return m ? m[1].replace(/<[^>]+>/g, " ").trim() : null;
}

function extractJsonLd(html, type) {
  const pattern = /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = pattern.exec(html)) !== null) {
    try {
      const json = JSON.parse(match[1]);
      if (json["@type"] === type) return json;
      if (Array.isArray(json)) {
        const found = json.find((j) => j["@type"] === type);
        if (found) return found;
      }
      if (json["@graph"]) {
        const found = json["@graph"].find((j) => j["@type"] === type);
        if (found) return found;
      }
    } catch {}
  }
  return null;
}

function extractSpecs(html) {
  const specs = [];
  // Tablas de especificaciones
  const trPattern = /<tr[^>]*>\s*<t[dh][^>]*>([^<]+)<\/t[dh]>\s*<t[dh][^>]*>([^<]+)<\/t[dh]>/gi;
  let match;
  while ((match = trPattern.exec(html)) !== null && specs.length < 15) {
    const key = match[1].trim();
    const val = match[2].trim();
    if (key.length > 2 && key.length < 50 && val.length > 0 && val.length < 200) {
      specs.push({ key, value: val });
    }
  }
  return specs;
}

function cleanText(text) {
  if (!text) return "";
  if (typeof text !== "string") text = String(text);
  return decodeHtmlEntities(text.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()).slice(0, 2000);
}

function decodeHtmlEntities(text) {
  if (!text) return "";
  return text
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, " ");
}
