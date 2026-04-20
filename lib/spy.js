// lib/spy.js
// ============================================================
// COMPETITOR SPY — Busca landings de competidores para un producto
// Fuentes: Facebook Ads Library, Google, tiendas Shopify conocidas
// Extrae: copy, precios, ángulos de venta, imágenes, URLs
// ============================================================

const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

// ─── SPY PRINCIPAL ─────────────────────────────────────────
export async function spyCompetitors(productName, options = {}) {
  const { country = "ALL", maxResults = 10 } = options;
  console.log(`[Spy] Buscando competidores para "${productName}"...`);

  const results = [];

  // Buscar en paralelo en múltiples fuentes
  const [fbAds, googleResults, shopifyStores] = await Promise.all([
    searchFBLibrary(productName, country).catch(e => { console.log(`[Spy] FB error: ${e.message}`); return []; }),
    searchGoogle(productName).catch(e => { console.log(`[Spy] Google error: ${e.message}`); return []; }),
    searchShopifyStores(productName).catch(e => { console.log(`[Spy] Shopify error: ${e.message}`); return []; }),
  ]);

  results.push(...fbAds, ...googleResults, ...shopifyStores);

  // Deduplicar por dominio
  const seen = new Set();
  const unique = results.filter(r => {
    try {
      const domain = new URL(r.url).hostname;
      if (seen.has(domain)) return false;
      seen.add(domain);
      return true;
    } catch { return false; }
  });

  console.log(`[Spy] Total: ${unique.length} competidores (FB:${fbAds.length} Google:${googleResults.length} Shopify:${shopifyStores.length})`);

  // Scrapear detalles de los top resultados (en paralelo, max 5)
  const toScrape = unique.slice(0, Math.min(maxResults, 5));
  const detailed = await Promise.all(
    toScrape.map(r => scrapeCompetitorPage(r).catch(() => r))
  );

  return {
    ok: true,
    query: productName,
    country,
    results: detailed,
    totalFound: unique.length,
    sources: {
      facebook: fbAds.length,
      google: googleResults.length,
      shopify: shopifyStores.length,
    },
  };
}

// ─── FACEBOOK ADS LIBRARY ──────────────────────────────────
async function searchFBLibrary(query, country) {
  try {
    const cc = country === "ALL" ? "ALL" : country;
    const url = `https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=${cc}&q=${encodeURIComponent(query)}&media_type=all`;

    const res = await fetch(url, {
      headers: { "User-Agent": UA, "Accept": "text/html", "Accept-Language": "es-419,es;q=0.9" },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return [];
    const html = await res.text();

    const results = [];

    // Extraer landing URLs de los anuncios
    const linkPattern = /"link_url"\s*:\s*"(https?:\/\/[^"]+)"/g;
    const linkPattern2 = /href="(https?:\/\/l\.facebook\.com\/l\.php\?u=([^&"]+))/g;
    const linkPattern3 = /"display_url"\s*:\s*"(https?:\/\/[^"]+)"/g;

    const urls = new Set();
    let match;

    for (const pat of [linkPattern, linkPattern3]) {
      while ((match = pat.exec(html)) !== null) {
        let landingUrl = decodeURIComponent(match[1]).replace(/\\/g, "");
        if (!landingUrl.includes("facebook.com") && !landingUrl.includes("fb.com")) {
          urls.add(landingUrl);
        }
      }
    }

    while ((match = linkPattern2.exec(html)) !== null) {
      const decoded = decodeURIComponent(match[2]);
      if (!decoded.includes("facebook.com")) urls.add(decoded);
    }

    // Extraer textos de anuncios
    const adTexts = [];
    const textPattern = /"ad_body_text"\s*:\s*"([^"]{20,})"/g;
    while ((match = textPattern.exec(html)) !== null) {
      adTexts.push(match[1].replace(/\\n/g, "\n").replace(/\\"/g, '"'));
    }

    // Extraer imágenes
    const images = [];
    const imgPattern = /https?:\/\/scontent[^"'\s]+\.(?:jpg|jpeg|png|webp)[^"'\s]*/gi;
    while ((match = imgPattern.exec(html)) !== null) {
      const img = match[0].replace(/&amp;/g, "&");
      if (!img.includes("emoji") && !img.includes("_s.") && images.length < 20) {
        images.push(img);
      }
    }

    for (const landingUrl of [...urls].slice(0, 5)) {
      results.push({
        url: landingUrl,
        source: "facebook_ads",
        adText: adTexts[results.length] || "",
        image: images[results.length] || "",
        query,
      });
    }

    console.log(`[Spy] FB Ads: ${results.length} landings, ${adTexts.length} copies, ${images.length} imgs`);
    return results;
  } catch (e) {
    console.log(`[Spy] FB Ads error: ${e.message}`);
    return [];
  }
}

// ─── GOOGLE SEARCH ─────────────────────────────────────────
async function searchGoogle(query) {
  try {
    // Buscar tiendas que venden este producto
    const searchQuery = encodeURIComponent(`${query} comprar envio gratis tienda online`);
    const res = await fetch(`https://www.google.com/search?q=${searchQuery}&num=10&hl=es`, {
      headers: { "User-Agent": UA, "Accept": "text/html" },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return [];
    const html = await res.text();

    const results = [];

    // Extraer URLs de resultados orgánicos
    const urlPattern = /href="\/url\?q=(https?:\/\/[^&"]+)/g;
    const urlPattern2 = /"(https?:\/\/(?:www\.)?[a-z0-9-]+\.[a-z]{2,}\/[^"]*(?:product|shop|tienda|comprar|buy)[^"]*)" /gi;

    let match;
    const seen = new Set();

    while ((match = urlPattern.exec(html)) !== null) {
      const url = decodeURIComponent(match[1]);
      const domain = new URL(url).hostname;
      // Filtrar: solo tiendas, no Google/YouTube/Wikipedia/etc
      if (!domain.includes("google") && !domain.includes("youtube") && !domain.includes("wikipedia")
        && !domain.includes("facebook") && !domain.includes("amazon") && !domain.includes("mercadolibre")
        && !seen.has(domain)) {
        seen.add(domain);
        results.push({ url, source: "google", domain, query });
      }
    }

    // Extraer títulos y snippets
    const titlePattern = /<h3[^>]*>(.*?)<\/h3>/gi;
    const titles = [];
    while ((match = titlePattern.exec(html)) !== null) {
      titles.push(match[1].replace(/<[^>]+>/g, ""));
    }

    results.forEach((r, i) => {
      if (titles[i]) r.title = titles[i];
    });

    console.log(`[Spy] Google: ${results.length} tiendas`);
    return results.slice(0, 5);
  } catch (e) {
    console.log(`[Spy] Google error: ${e.message}`);
    return [];
  }
}

// ─── SHOPIFY STORES CONOCIDAS ──────────────────────────────
async function searchShopifyStores(query) {
  // Lista de tiendas dropshipping LATAM conocidas
  const stores = [
    "https://www.tuimpacto.co",
    "https://www.vidainnovadora.com",
    "https://www.tuoferta.cr",
    "https://tiendamia.com",
    "https://www.liniodropshipping.com",
  ];

  const results = [];

  for (const store of stores) {
    try {
      const searchUrl = `${store}/search?q=${encodeURIComponent(query)}&type=product`;
      const res = await fetch(searchUrl, {
        headers: { "User-Agent": UA },
        signal: AbortSignal.timeout(8000),
        redirect: "follow",
      });
      if (!res.ok) continue;
      const html = await res.text();

      // Verificar si encontró productos
      if (html.includes("product") && !html.includes("No results") && !html.includes("no encontramos")) {
        // Extraer primer producto URL
        const productMatch = html.match(/href="(\/products\/[^"?]+)"/);
        if (productMatch) {
          results.push({
            url: `${store}${productMatch[1]}`,
            source: "shopify_store",
            domain: new URL(store).hostname,
            query,
          });
        }
      }
    } catch {}
  }

  console.log(`[Spy] Shopify stores: ${results.length}`);
  return results;
}

// ─── SCRAPEAR PAGINA DE COMPETIDOR ─────────────────────────
async function scrapeCompetitorPage(result) {
  try {
    const res = await fetch(result.url, {
      headers: { "User-Agent": UA, "Accept": "text/html" },
      signal: AbortSignal.timeout(12000),
      redirect: "follow",
    });
    if (!res.ok) return { ...result, scraped: false };
    const html = await res.text();

    // Extraer datos del producto
    const data = {
      ...result,
      scraped: true,
      title: extractMeta(html, "og:title") || extractTag(html, "title") || "",
      description: extractMeta(html, "og:description") || extractMeta(html, "description") || "",
      image: extractMeta(html, "og:image") || result.image || "",
      price: extractPrice(html),
      domain: new URL(result.url).hostname,
    };

    // Extraer copy de venta (textos largos que parecen copy)
    data.copySnippets = extractCopySnippets(html);

    // Detectar plataforma
    if (html.includes("shopify") || html.includes("Shopify")) data.platform = "Shopify";
    else if (html.includes("woocommerce") || html.includes("WooCommerce")) data.platform = "WooCommerce";
    else if (html.includes("vtex") || html.includes("VTEX")) data.platform = "VTEX";
    else data.platform = "Otro";

    // Extraer imágenes del producto
    data.images = extractProductImages(html);

    // Extraer features/bullets
    data.features = extractFeatures(html);

    return data;
  } catch (e) {
    return { ...result, scraped: false, error: e.message };
  }
}

// ─── UTILIDADES DE EXTRACCIÓN ──────────────────────────────

function extractMeta(html, property) {
  const patterns = [
    new RegExp(`<meta[^>]*(?:property|name)=["'](?:og:)?${property}["'][^>]*content=["']([^"']+)`, "i"),
    new RegExp(`<meta[^>]*content=["']([^"']+)["'][^>]*(?:property|name)=["'](?:og:)?${property}`, "i"),
  ];
  for (const p of patterns) {
    const m = html.match(p);
    if (m) return m[1].replace(/&amp;/g, "&").replace(/&quot;/g, '"');
  }
  return "";
}

function extractTag(html, tag) {
  const m = html.match(new RegExp(`<${tag}[^>]*>([^<]+)</${tag}>`, "i"));
  return m ? m[1].trim() : "";
}

function extractPrice(html) {
  // Buscar precios en múltiples formatos LATAM
  const patterns = [
    /["']price["']\s*:\s*["']?([\d,.]+)/i,
    /class=["'][^"']*price[^"']*["'][^>]*>[^<]*[₡$Q]?\s*([\d,.]+)/i,
    /[₡$Q]\s*([\d,.]+(?:\.\d{2})?)/,
    /(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?)\s*(?:COP|CRC|GTQ|MXN|USD)/i,
  ];
  for (const p of patterns) {
    const m = html.match(p);
    if (m) return m[1];
  }
  return null;
}

function extractCopySnippets(html) {
  const snippets = [];
  // Buscar párrafos con copy de venta (largos, con emojis o signos de exclamación)
  const pPattern = /<p[^>]*>([^<]{50,500})<\/p>/gi;
  let match;
  while ((match = pPattern.exec(html)) !== null && snippets.length < 5) {
    const text = match[1].replace(/&[^;]+;/g, " ").trim();
    // Filtrar solo textos que parezcan copy de venta
    if (text.length > 50 && (text.includes("!") || text.includes("?") || text.includes("envío") || text.includes("gratis")
      || text.includes("oferta") || text.includes("compra") || text.includes("descuento"))) {
      snippets.push(text);
    }
  }
  return snippets;
}

function extractProductImages(html) {
  const images = new Set();
  // og:image ya capturada arriba, buscar más
  const patterns = [
    /src=["'](https?:\/\/[^"']+\.(?:jpg|jpeg|png|webp)[^"']*)["']/gi,
    /data-src=["'](https?:\/\/[^"']+\.(?:jpg|jpeg|png|webp)[^"']*)["']/gi,
  ];
  for (const p of patterns) {
    let m;
    while ((m = p.exec(html)) !== null && images.size < 10) {
      const url = m[1].replace(/&amp;/g, "&");
      if (url.length > 40 && !url.includes("logo") && !url.includes("icon") && !url.includes("favicon")
        && !url.includes("avatar") && !url.includes("banner") && !url.includes("payment")) {
        images.add(url);
      }
    }
  }
  return [...images].slice(0, 6);
}

function extractFeatures(html) {
  const features = [];
  // Buscar listas de beneficios
  const liPattern = /<li[^>]*>([^<]{10,200})<\/li>/gi;
  let m;
  while ((m = liPattern.exec(html)) !== null && features.length < 8) {
    const text = m[1].replace(/&[^;]+;/g, " ").replace(/<[^>]+>/g, "").trim();
    if (text.length > 10 && text.length < 200) features.push(text);
  }
  return features;
}
